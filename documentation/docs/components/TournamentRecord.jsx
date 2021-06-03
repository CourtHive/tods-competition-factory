import React from 'react';
import RenderJSON from './renderJSON';

export const TournamentRecord = ({ data }) => {
  return (
    <div>
      <RenderJSON data={data} root={'tournamentRecord'} expandRoot={false} />
    </div>
  );
};

export default TournamentRecord;
