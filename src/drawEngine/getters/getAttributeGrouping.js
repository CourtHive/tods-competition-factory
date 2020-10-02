import { unique } from '../../utilities';

/**
 *
 * @param {array} participants - all tournament participants; used to access attribute values for grouping
 * @param {array} policyAtributtes - participant attributes to be processed to create groupings
 * @param {array} targetParticipantIds - participantIds to be processed
 *
 * Each policyAttribute is a string definining how to access the nested participant attribute to be accessed
 * 'person.nationalityCode' targets => { participant: { person: { natinalityCode }}}
 *
 * If an attribute within a policyAttribute definition is an array then the function iterates over members of the array
 * The use case for this behavior is when a participant is a team and contains individualPatticipants: []
 * 'individualParticipants.person.nationalityCode' targets =>
 *  { participant: { individualParticipants: [ { person: { nationalityCode }}, { person: { nationalityCode }}]}}
 */

export function getAttributeGroupings({
  participants,
  policyAttributes,
  targetParticipantIds,
}) {
  if (!Array.isArray(policyAttributes)) {
    return { error: 'Missing policyAttributes' };
  }
  if (!Array.isArray(participants)) {
    return { error: 'Missing participants' };
  }
  const groupings = {};
  targetParticipantIds.forEach(participantId => {
    const participant = participants.find(
      candidate => candidate.participantId === participantId
    );

    const { values } = extractAttributeValues({
      participant,
      policyAttributes,
    });
    values.forEach(value => {
      if (!groupings[value]) groupings[value] = [];
      if (!groupings[value].includes(participantId)) {
        groupings[value].push(participantId);
      }
    });
  });
  return groupings;
}

export function extractAttributeValues({ policyAttributes, participant }) {
  if (!Array.isArray(policyAttributes)) {
    return { error: 'Missing policyAttributes' };
  }
  if (!participant) {
    return { error: 'Missing participant' };
  }
  const extractedValues = [];
  policyAttributes.forEach(policyAttribute => {
    const value = participant;
    const keys = policyAttribute.split('.');

    processKeys({ value, keys });
  });

  return { values: unique(extractedValues) };

  function processKeys({ value, keys }) {
    for (const [index, key] of keys.entries()) {
      if (value && value[key]) {
        if (Array.isArray(value[key])) {
          const values = value[key];
          const remainingKeys = keys.slice(index);
          values.forEach(nestedValue =>
            processKeys({ value: nestedValue, keys: remainingKeys })
          );
        } else {
          value = value[key];
          checkValue({ value, index });
        }
      }
    }

    function checkValue({ value, index }) {
      if (
        value &&
        index === keys.length - 1 &&
        ['string', 'number'].includes(typeof value)
      ) {
        extractedValues.push(value);
      }
    }
  }
}
