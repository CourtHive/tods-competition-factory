import React from 'react';

import JSONTree from 'react-json-tree';
import themes from './themes';

// https://github.com/reduxjs/redux-devtools/tree/75322b15ee7ba03fddf10ac3399881e302848874/src/react/themes

const getValueLabelStyle = ({ style }, nodeType, keyPath) => ({
  style: {
    ...style,
    color:
      !Number.isNaN(keyPath[0]) && !(parseInt(keyPath, 10) % 2)
        ? '#33F'
        : style.color,
  },
});

const getLabelStyle = ({ style }, nodeType, expanded) => ({
  style: {
    ...style,
    fontWeight: expanded ? 'bold' : style.textTransform,
  },
});

const getBoolStyle = ({ style }, nodeType) => ({
  style: {
    ...style,
    border: nodeType === 'Boolean' ? '1px solid #DD3333' : style.border,
    borderRadius: nodeType === 'Boolean' ? 3 : style.borderRadius,
  },
});

const getItemString = (type) => <span>{type}</span>;

const stringLimit = 40;
const renderValue = (raw) => {
  if (typeof raw === 'string' && raw.length > stringLimit)
    return raw.slice(0, stringLimit) + '...';
  return raw;
};

export const RenderJSON = ({
  data,
  root = 'root',
  colorScheme = 'summerfruit',
  invertTheme = true,
  hideRoot = false,
  expandRoot = true,
  expandToLevel = 1,
}) => {
  const shouldExpandNode = (keyPath, data, level) => {
    if (!expandRoot) return false;
    if (level < expandToLevel) return true;
  };
  return (
    <div style={{ marginBottom: '1em' }}>
      <JSONTree
        theme={{
          extend: themes[colorScheme],
          value: getBoolStyle,
          valueLabel: getValueLabelStyle,
          nestedNodeLabel: getLabelStyle,
        }}
        valueRenderer={renderValue}
        getItemString={getItemString}
        data={data}
        keyPath={[root]}
        invertTheme={invertTheme}
        hideRoot={hideRoot}
        shouldExpandNode={shouldExpandNode}
      />
    </div>
  );
};

export default RenderJSON;
