import React from 'react';

interface Props {
  title: string;
}

export const PlaceholderView = React.memo(function PlaceholderView({ title }: Props) {
  return (
    <div className="placeholder-view">
      <h2>{title}</h2>
      <p>Coming Soon</p>
    </div>
  );
});
