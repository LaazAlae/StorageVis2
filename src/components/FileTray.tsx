import React, { useState, useMemo } from 'react';
import type { FileRow, DateMode } from '../utils/types';
import { fileIconSVG } from '../utils/icons';
import { formatDateTime } from '../utils/formatters';

interface Props {
  folder: { name: string; files: FileRow[] };
  dateMode: DateMode;
  onClose: () => void;
}

export const FileTray = React.memo(function FileTray({ folder, dateMode, onClose }: Props) {
  const [dispersed, setDispersed] = useState(false);
  const files = folder.files;

  const sorted = useMemo(() => {
    const arr = [...files];
    arr.sort((a, b) => {
      const da = dateMode === 'modified' ? a.ModifiedDate : a.CreatedDate;
      const db = dateMode === 'modified' ? b.ModifiedDate : b.CreatedDate;
      return db - da;
    });
    return arr;
  }, [files, dateMode]);

  if (files.length === 0) return null;

  // Stack preview: top 5 icons
  const previewFiles = sorted.slice(0, 5);
  const rotations = [0, -7, 6, -10, 8];
  const xOffsets = [0, -6, 7, -10, 9];
  const yOffsets = [0, 3, 2, 5, 4];

  return (
    <div className="file-tray">
      <div className="file-tray-header">
        <h3>{folder.name} — {files.length} files</h3>
        <button className="file-tray-close" onClick={onClose}>x</button>
      </div>

      {!dispersed ? (
        <div
          className="file-tray-stacked"
          onClick={() => setDispersed(true)}
          title="Click to expand files"
        >
          <div className="stack-pile">
            {previewFiles.map((f, i) => (
              <div
                key={i}
                className="stack-icon"
                style={{
                  transform: `rotate(${rotations[i]}deg) translate(${xOffsets[i]}px, ${yOffsets[i]}px)`,
                  zIndex: 10 - i,
                }}
                dangerouslySetInnerHTML={{ __html: fileIconSVG(f.Extension, 40) }}
              />
            ))}
          </div>
          <span className="stack-label">Click to view {files.length} files</span>
        </div>
      ) : (
        <div className="file-tray-dispersed" onWheel={(e) => e.stopPropagation()}>
          <div className="file-grid">
            {sorted.map((f, i) => {
              const spIssue = f.SharePointCompatibility !== 'OK';
              const dcisIssue = f.DCISCompatibility !== 'OK';
              return (
                <div
                  key={i}
                  className={`file-card ${spIssue ? 'file-card--sp-issue' : ''} ${dcisIssue ? 'file-card--dcis-issue' : ''}`}
                  style={{ animationDelay: `${Math.min(i, 40) * 20}ms` }}
                  onClick={() => setDispersed(false)}
                  title={`${f.FileName}\n${formatDateTime(dateMode === 'modified' ? f.ModifiedDate : f.CreatedDate)}\n${f.MigrationPriority}`}
                >
                  <div
                    className="file-card-icon"
                    dangerouslySetInnerHTML={{ __html: fileIconSVG(f.Extension, 32) }}
                  />
                  <span className="file-card-name">
                    {f.FileName.length > 18 ? f.FileName.slice(0, 16) + '...' : f.FileName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
});
