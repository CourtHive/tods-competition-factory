import React from 'react';
import { utilities } from 'tods-competition-factory';

import { JSONTree } from 'react-json-tree';
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
    // border: nodeType === 'Boolean' ? '1px solid #DD3333' : style.border,
    borderRadius: nodeType === 'Boolean' ? 3 : style.borderRadius,
  },
});

const getItemString = (type, data, itemType) => {
  const isObject = typeof data === 'object';
  const firstValue = isObject && Object.values(data)[0];
  const isTypeDef = typeof firstValue === 'string' && firstValue[0] === '{';
  let customLabel;
  if (isObject) {
    const keys = Object.keys(data);
    if (
      utilities.intersection(keys, ['drawId', 'drawType']).length === 2 &&
      !keys.includes('drawRepresentativeIds')
    ) {
      customLabel = 'drawDefinition';
    }
    if (
      utilities.intersection(keys, ['entryPosition', 'entryStatus']).length ===
        2 &&
      !keys.includes('entryStageSequence')
    ) {
      customLabel = 'entry';
    }
    if (
      utilities.intersection(keys, ['eventId', 'sortOrder', 'notBeforeTime'])
        .length === 3 &&
      !keys.includes('tennisOfficialIds')
    ) {
      customLabel = 'round';
    } else if (
      utilities.intersection(keys, ['eventId', 'eventName']).length === 2 &&
      !keys.includes('tennisOfficialIds')
    ) {
      customLabel = 'event';
    }

    if (utilities.intersection(keys, ['flightNumber', 'drawId']).length === 2) {
      customLabel = 'flight';
    }
    if (utilities.intersection(keys, ['name', 'value']).length === 2) {
      customLabel = 'extension';
    }
    if (
      utilities.intersection(keys, ['linkType', 'source']).length === 2 &&
      !keys.includes('linkCondition')
    ) {
      customLabel = 'link';
    }
    if (
      utilities.intersection(keys, ['matchUpId', 'drawPositions']).length ===
        2 &&
      !keys.includes('surfaceCategory')
    ) {
      customLabel = 'matchUp';
    }
    if (
      utilities.intersection(keys, ['drawPosition', 'participantId', 'bye'])
        .length === 2
    ) {
      customLabel = 'positionAssignment';
    }
    if (
      utilities.intersection(keys, ['courtId', 'dateAvailability']).length ===
        2 &&
      !keys.includes('altitude')
    ) {
      customLabel = 'court';
    }
    if (
      utilities.intersection(keys, ['participantId', 'participantName'])
        .length === 2 &&
      !keys.includes('onlineResources')
    ) {
      customLabel = 'participant';
    }
    if (
      utilities.intersection(keys, ['structureId', 'structureName']).length ===
      2
    ) {
      customLabel = 'structure';
    }
    if (
      utilities.intersection(keys, ['venueId', 'courts']).length === 2 &&
      !keys.includes('venueOtherIds')
    ) {
      customLabel = 'venue';
    }
  }
  return <span>{customLabel || (isTypeDef ? type : itemType)}</span>;
};

const renderTypeDef = (raw) => {
  try {
    const obj = JSON.parse(JSON.parse(raw));
    const required = obj.required === 'true' ? '' : '? ';
    const array = obj.array === 'true' ? '[]' : '';
    const type =
      (['any', 'boolean', 'number', 'string'].includes(obj.type) && obj.type) ||
      (obj.type === 'object' && obj.object && 'Object') ||
      obj.type === 'enum'
        ? `enum ${obj.enum}`
        : '';
    const note = obj.note ? ` \\\\ ${obj.note}` : '';
    return `${required}: ${type}${array}${note}`;
  } catch (err) {
    return '';
  }
};

const stringLimit = 40;
const isJSONstring = (data) =>
  typeof data === 'string' && data.length > 2 && data[1] === '{';

const renderValue = (raw) => {
  if (isJSONstring(raw)) return renderTypeDef(raw);
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
