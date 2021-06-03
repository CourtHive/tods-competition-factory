import React from 'react';
import RenderJSON from './renderJSON';

export const DrawDefinition = ({ data }) => {
  return (
    <div>
      <RenderJSON data={data} root={'drawDefinition'} expandRoot={false} />
    </div>
  );
};

export default DrawDefinition;
