import RenderJSON from './RenderJSON';
import React from 'react';

export const DrawDefinition = ({ data }) => {
  return (
    <div>
      <RenderJSON root={'drawDefinition'} expandRoot={false} hideRoot={false} data={data} />
    </div>
  );
};

export default DrawDefinition;
