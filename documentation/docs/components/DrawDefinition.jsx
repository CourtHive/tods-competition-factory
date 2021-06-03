import React from 'react';
import RenderJSON from './RenderJSON';

export const DrawDefinition = ({ data }) => {
  return (
    <div>
      <RenderJSON data={data} root={'drawDefinition'} expandRoot={false} />
    </div>
  );
};

export default DrawDefinition;
