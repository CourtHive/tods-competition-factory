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

const getItemString = (type, data, itemType) => {
  console.log({ data });
  return <span>{itemType}</span>;
};

const renderTypeDef = (raw) => {
  try {
    const obj = JSON.parse(JSON.parse(raw));
    const required = obj.required === 'true' ? '' : '? ';
    const array = obj.array === 'true' ? '[]' : '';
    const type = ['string', 'number'].includes(obj.type)
      ? obj.type
      : obj.type === 'object'
      ? obj.object
      : obj.type === 'enum'
      ? `enum ${obj.enum}`
      : '';
    return `${required}: ${type}${array}`;
  } catch (err) {
    return '';
  }
};

const stringLimit = 40;
const renderValue = (raw) => {
  if (typeof raw === 'string' && raw.length > 2 && raw[1] === '{') {
    return renderTypeDef(raw);
  }
  if (typeof raw === 'string' && raw.length > stringLimit)
    return raw.slice(0, stringLimit) + '...';
  return raw;
};

const renderLabel = ([key]) => {
  return <strong>{key}</strong>;
};

export const RenderJSON = ({
  colorScheme = 'summerfruit',
  sortObjectKeys = true,
  invertTheme = true,
  expandRoot = true,
  expandToLevel = 1,
  hideRoot = false,
  root = 'root',
  data,
}) => {
  const shouldExpandNode = (keyPath, data, level) => {
    if (!expandRoot) return false;
    if (typeof data === 'object' && data._typeDef) return false;
    if (level < expandToLevel) return true;
  };
  return (
    <div style={{ marginBottom: '1em' }}>
      <JSONTree
        theme={{
          valueLabel: getValueLabelStyle,
          nestedNodeLabel: getLabelStyle,
          extend: themes[colorScheme],
          value: getBoolStyle,
        }}
        shouldExpandNode={shouldExpandNode}
        sortObjectKeys={sortObjectKeys}
        getItemString={getItemString}
        labelRenderer={renderLabel}
        valueRenderer={renderValue}
        invertTheme={invertTheme}
        hideRoot={hideRoot}
        keyPath={[root]}
        data={data}
      />
    </div>
  );
};

export default RenderJSON;
