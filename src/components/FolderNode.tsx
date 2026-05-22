import { getFolderColor, getFolderColorDark } from '../utils/colorScale';
import { formatNumber } from '../utils/formatters';
import { folderIconSVG, fileIconSVG, getTopExtensions } from '../utils/icons';
import { getTextColor } from '../utils/colorScale';
import type { FolderNode as FolderNodeType } from '../utils/types';

export function renderFolderNodeHTML(folder: FolderNodeType): string {
  const bgColor = getFolderColor(folder.recursiveFileCount);
  const darkColor = getFolderColorDark(folder.recursiveFileCount);
  const textColor = getTextColor(bgColor);
  const name = folder.name.length > 18 ? folder.name.slice(0, 16) + '...' : folder.name;

  // Folder icon with count overlaid centered on it
  return `<div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;user-select:none;">
  <div style="position:relative;width:64px;height:42px;">
    ${folderIconSVG(bgColor, darkColor, 64)}
    <div style="position:absolute;top:16px;left:0;right:0;text-align:center;font-size:14px;font-weight:700;color:${textColor};line-height:1;text-shadow:0 1px 2px rgba(0,0,0,0.15);">${formatNumber(folder.recursiveFileCount)}</div>
  </div>
  <div style="font-size:10px;color:#555;margin-top:3px;max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:center;" title="${escapeHtml(folder.name)}">${escapeHtml(name)}</div>
</div>`;
}

export function renderFilePileHTML(
  files: { Extension: string }[],
  count: number,
): string {
  const topExts = getTopExtensions(files, 4);
  const icons = topExts.map((ext) => fileIconSVG(ext, 20));

  const rotations = [0, -8, 7, -12];
  const xOffsets = [0, -4, 5, -6];
  const yOffsets = [0, 2, 1, 3];

  let stackHTML = '';
  for (let i = Math.min(icons.length, 4) - 1; i >= 0; i--) {
    stackHTML += `<div style="position:absolute;top:${2 + yOffsets[i]}px;left:${12 + xOffsets[i]}px;transform:rotate(${rotations[i]}deg);z-index:${10 + (4 - i)};filter:drop-shadow(0 1px 1px rgba(0,0,0,0.1));">${icons[i]}</div>`;
  }

  return `<div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;user-select:none;">
  <div style="position:relative;width:50px;height:32px;">${stackHTML}</div>
  <div style="font-size:9px;font-weight:600;color:#475569;margin-top:2px;white-space:nowrap;">${formatNumber(count)} files</div>
</div>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
