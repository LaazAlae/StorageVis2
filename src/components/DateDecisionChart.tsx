import React, { useMemo } from 'react';
import { useFileStore } from '../store/useFileStore';
import { formatNumber } from '../utils/formatters';
import { cutoffTimestamp } from '../utils/importPreview';
import type { FileRow, FolderNode } from '../utils/types';

const MONTH_MS = 30.4375 * 24 * 60 * 60 * 1000;

interface Bin {
  t: number;
  created: number;
  modified: number;
}

export function DateDecisionChart() {
  const tree = useFileStore((s) => s.tree);
  const activeCutoffDays = useFileStore((s) => s.activeCutoffDays);

  const chart = useMemo(() => {
    if (!tree) return null;
    const files = collectFiles(tree);
    const modifiedDates = files.map((file) => file.ModifiedDate).filter((date) => date > 0);
    if (modifiedDates.length === 0) return null;

    const now = Date.now();
    const minDate = Math.min(...modifiedDates);
    const start = startOfMonth(minDate);
    const months = Math.max(2, Math.ceil((now - start) / MONTH_MS) + 1);
    const bins: Bin[] = Array.from({ length: months }, (_, i) => ({
      t: start + i * MONTH_MS,
      created: 0,
      modified: 0,
    }));

    for (const file of files) {
      addToBin(bins, start, now, file.CreatedDate, 'created');
      addToBin(bins, start, now, file.ModifiedDate, 'modified');
    }

    const topCreated = maxBin(bins, 'created');
    const topModified = maxBin(bins, 'modified');
    return { bins, files, start, end: now, topCreated, topModified };
  }, [tree]);

  if (!tree || !chart) return null;

  const width = 980;
  const height = 420;
  const pad = { left: 68, right: 34, top: 24, bottom: 48 };
  const maxY = Math.max(1, ...chart.bins.flatMap((bin) => [bin.created, bin.modified]));
  const xForTime = (t: number) =>
    pad.left + ((t - chart.start) / Math.max(1, chart.end - chart.start)) * (width - pad.left - pad.right);
  const yFor = (value: number) =>
    pad.top + (1 - value / maxY) * (height - pad.top - pad.bottom);
  const cutoff = cutoffTimestamp(activeCutoffDays);
  const shadeEnd = cutoff ? Math.max(pad.left, Math.min(width - pad.right, xForTime(cutoff))) : pad.left;
  const kept = activeCutoffDays === null
    ? chart.files.length
    : chart.files.filter((file) => file.ModifiedDate >= cutoff!).length;

  return (
    <div className="chart-page">
      <section className="chart-card chart-card--full">
        <div className="chart-toolbar">
          <div>
            <h3>File dates over time</h3>
            <p>Orange shows filesystem creation dates. Blue shows last modified dates, which drive the folder preview. Gray is excluded by the modified-date slider.</p>
          </div>
          <div className="legend-row">
            <span><i style={{ background: '#f97316' }} /> Created</span>
            <span><i style={{ background: '#2563eb' }} /> Modified</span>
            <span><i style={{ background: '#d6d3d1' }} /> Ignored</span>
          </div>
        </div>

        <div className="chart-summary-row">
          <div className="kpi">
            <div className="kpi-label">Explorer keeps</div>
            <div className="kpi-value">{formatNumber(kept)}</div>
            <div className="kpi-sub">by modified date</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Explorer ignores</div>
            <div className="kpi-value">{formatNumber(chart.files.length - kept)}</div>
            <div className="kpi-sub">{activeCutoffDays === null ? 'slider at oldest file' : `older than ${formatYears(activeCutoffDays / 365)}`}</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Largest created spike</div>
            <div className="kpi-value" style={{ color: '#f97316' }}>{formatNumber(chart.topCreated.count)}</div>
            <div className="kpi-sub">{formatMonth(chart.topCreated.t)}</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Largest modified spike</div>
            <div className="kpi-value" style={{ color: '#2563eb' }}>{formatNumber(chart.topModified.count)}</div>
            <div className="kpi-sub">{formatMonth(chart.topModified.t)}</div>
          </div>
        </div>

        <svg className="date-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Created and modified file counts over time">
          {cutoff && (
            <rect
              x={pad.left}
              y={pad.top}
              width={Math.max(0, shadeEnd - pad.left)}
              height={height - pad.top - pad.bottom}
              className="chart-ignored"
            />
          )}
          {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
            const y = yFor(maxY * pct);
            return (
              <g key={pct}>
                <line x1={pad.left} x2={width - pad.right} y1={y} y2={y} className="chart-grid" />
                <text x={pad.left - 10} y={y + 4} textAnchor="end" className="chart-axis-label">
                  {formatCompact(Math.round(maxY * pct))}
                </text>
              </g>
            );
          })}
          {yearTicks(chart.start, chart.end).map((tick) => (
            <text key={tick} x={xForTime(tick)} y={height - 18} textAnchor="middle" className="chart-axis-label">
              {new Date(tick).getFullYear()}
            </text>
          ))}
          {cutoff && (
            <line x1={shadeEnd} x2={shadeEnd} y1={pad.top} y2={height - pad.bottom} className="chart-cutoff-line" />
          )}
          <path d={smoothPath(chart.bins, 'created', xForTime, yFor)} className="chart-line created" />
          <path d={smoothPath(chart.bins, 'modified', xForTime, yFor)} className="chart-line modified" />
        </svg>
      </section>
    </div>
  );
}

function collectFiles(node: FolderNode): FileRow[] {
  const files = [...node.files];
  for (const child of node.children) files.push(...collectFiles(child));
  return files;
}

function startOfMonth(t: number): number {
  const d = new Date(t);
  return new Date(d.getFullYear(), d.getMonth(), 1).getTime();
}

function addToBin(bins: Bin[], start: number, end: number, date: number, key: 'created' | 'modified') {
  if (!date) return;
  if (date < start || date > end) return;
  const index = Math.max(0, Math.min(bins.length - 1, Math.floor((date - start) / MONTH_MS)));
  bins[index][key]++;
}

function smoothPath(
  bins: Bin[],
  key: 'created' | 'modified',
  xForTime: (t: number) => number,
  yFor: (value: number) => number,
): string {
  const baseY = yFor(0);
  const points = bins.map((bin) => [xForTime(bin.t), clamp(yFor(bin[key]), 0, baseY)] as const);
  if (points.length < 2) return '';
  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = clamp(p1[1] + (p2[1] - p0[1]) / 6, Math.min(p1[1], p2[1]), Math.max(p1[1], p2[1]));
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = clamp(p2[1] - (p3[1] - p1[1]) / 6, Math.min(p1[1], p2[1]), Math.max(p1[1], p2[1]));
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2[0]} ${p2[1]}`;
  }
  return d;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function maxBin(bins: Bin[], key: 'created' | 'modified'): { t: number; count: number } {
  return bins.reduce(
    (best, bin) => bin[key] > best.count ? { t: bin.t, count: bin[key] } : best,
    { t: bins[0]?.t || 0, count: 0 },
  );
}

function yearTicks(start: number, end: number): number[] {
  const ticks: number[] = [];
  const startYear = new Date(start).getFullYear();
  const endYear = new Date(end).getFullYear();
  const step = Math.max(1, Math.ceil((endYear - startYear + 1) / 8));
  for (let y = startYear; y <= endYear; y += step) {
    ticks.push(new Date(y, 0, 1).getTime());
  }
  return ticks;
}

function formatCompact(value: number): string {
  if (value < 1000) return String(value);
  if (value < 1_000_000) return `${Math.round(value / 1000)}K`;
  return `${(value / 1_000_000).toFixed(1)}M`;
}

function formatYears(value: number): string {
  if (value < 1) return '<1 year';
  return `${value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)} years`;
}

function formatMonth(value: number): string {
  return new Date(value).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
}
