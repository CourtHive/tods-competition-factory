import RenderJSON from './RenderJSON';
import React from 'react';

export const Participants = ({ data }) => {
  return (
    <div>
      <div>Participants Count: {data.length}</div>
      <RenderJSON data={data} root={'participants'} expandRoot={false} />
    </div>
  );
};

export default Participants;
