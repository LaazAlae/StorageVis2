import React, { useMemo } from 'react';

interface Props {
  path: string | null;
  onNavigate: (path: string) => void;
}

export const Breadcrumbs = React.memo(function Breadcrumbs({ path, onNavigate }: Props) {
  const segments = useMemo(() => {
    if (!path) return [];
    return path.split('\\').filter(Boolean);
  }, [path]);

  if (segments.length === 0) {
    return (
      <div className="breadcrumbs">
        <span className="breadcrumb-segment breadcrumb-segment--current">Root</span>
      </div>
    );
  }

  return (
    <div className="breadcrumbs">
      <button className="breadcrumb-segment" onClick={() => onNavigate('')}>
        Root
      </button>
      {segments.map((seg, i) => {
        const segPath = segments.slice(0, i + 1).join('\\');
        const isLast = i === segments.length - 1;
        return (
          <React.Fragment key={segPath}>
            <span className="breadcrumb-sep">&gt;</span>
            {isLast ? (
              <span className="breadcrumb-segment breadcrumb-segment--current">{seg}</span>
            ) : (
              <button className="breadcrumb-segment" onClick={() => onNavigate(segPath)}>
                {seg}
              </button>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
});
