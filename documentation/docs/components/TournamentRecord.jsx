import RenderJSON from './RenderJSON';
import React from 'react';

export const TournamentRecord = ({ data }) => {
  return (
    <div>
      <RenderJSON data={data} root={'tournamentRecord'} expandRoot={false} />
    </div>
  );
};

export default TournamentRecord;
