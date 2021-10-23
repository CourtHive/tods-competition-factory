import React from 'react';
import RenderJSON from './RenderJSON';

export const DrawDefinition = ({ data }) => {
  return (
    <div>
      <RenderJSON
        root={'drawDefinition'}
        expandRoot={false}
        hideRoot={false}
        data={data}
      />
    </div>
  );
};

export default DrawDefinition;
