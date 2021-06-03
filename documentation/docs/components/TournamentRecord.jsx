import React from 'react';
import RenderJSON from './RenderJSON';

export const TournamentRecord = ({ data }) => {
  return (
    <div>
      <RenderJSON data={data} root={'tournamentRecord'} expandRoot={false} />
    </div>
  );
};

export default TournamentRecord;
