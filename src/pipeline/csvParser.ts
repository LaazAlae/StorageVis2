import Papa from 'papaparse';

export interface ParseProgress {
  percent: number;
}

export function parseCSV(
  file: File,
  onProgress?: (p: ParseProgress) => void,
): Promise<Record<string, string>[]> {
  return new Promise((resolve, reject) => {
    const results: Record<string, string>[] = [];
    const fileSize = file.size;
    let bytesRead = 0;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      worker: true,
      step: (row: Papa.ParseStepResult<Record<string, string>>, parser) => {
        if (row.data && Object.keys(row.data).length > 1) {
          results.push(row.data);
        }
        // Estimate progress from meta cursor if available
        if (row.meta && typeof (row.meta as any).cursor === 'number') {
          bytesRead = (row.meta as any).cursor;
          if (onProgress && fileSize > 0) {
            onProgress({ percent: Math.min(99, Math.round((bytesRead / fileSize) * 100)) });
          }
        }
      },
      complete: () => {
        if (onProgress) onProgress({ percent: 100 });
        resolve(results);
      },
      error: (err: Error) => {
        reject(err);
      },
    });
  });
}
