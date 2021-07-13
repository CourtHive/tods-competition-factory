import React from 'react';
import RenderJSON from './RenderJSON';

export const MatchUps = ({ data }) => {
  const matchUpsCount = Array.isArray(data)
    ? data.length
    : (data && data.matchUpsCount) || 0;

  return (
    <div>
      <div>MatchUps Count: {matchUpsCount}</div>
      <RenderJSON data={data} root={'matchUps'} expandRoot={false} />
    </div>
  );
};

export default MatchUps;
