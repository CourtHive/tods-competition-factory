import { unique } from '../../utilities';

/**
 *
 * @param {object[]} participants - all tournament participants; used to access attribute values for grouping
 * @param {string[]} policyAtributtes - participant attributes to be processed to create groupings
 * @param {string[]} targetParticipantIds - participantIds to be processed
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
  idCollections,
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
      participants,
      idCollections,
      policyAttributes,
    });
    if (values) {
      values.forEach(value => {
        if (!groupings[value]) groupings[value] = [];
        if (!groupings[value].includes(participantId)) {
          groupings[value].push(participantId);
        }
      });
    }
  });

  return groupings;
}

/**
 *
 * @param {string[]} policyAtributtes - participant attributes to be processed to create groupings
 * @param {object} participant - participant from which attribute values will be extracted
 *
 */
export function extractAttributeValues({
  participant,
  participants,
  idCollections,
  policyAttributes,
}) {
  if (!Array.isArray(policyAttributes)) {
    return { error: 'Missing policyAttributes' };
  }
  if (!participant) {
    return { error: 'Missing participant' };
  }
  const extractedValues = [];
  policyAttributes.forEach(policyAttribute => {
    const value = participant;
    const { directive, groupings, key, significantCharacters } =
      policyAttribute || {};
    if (key) {
      const keys = key.split('.');
      processKeys({ value, keys, significantCharacters });
    } else if (directive) {
      const includeIds = policyAttribute?.includeIds;
      const collectionIds = (
        (idCollections && idCollections[directive]) ||
        []
      ).filter(
        participantId => !includeIds || includeIds.includes(participantId)
      );
      if (collectionIds?.length && participants?.length) {
        collectionIds.forEach(collectionParticipantId => {
          const collectionParticipant = participants.find(
            participant => participant.participantId === collectionParticipantId
          );
          if (
            collectionParticipant?.individualParticipantIds?.includes(
              participant.participantId
            )
          ) {
            const participantId = collectionParticipant?.participantId;
            extractedValues.push(participantId);
          }
        });
      }
    } else if (groupings) {
      Object.keys(groupings).forEach(key => {
        if (groupings[key].includes(participant.participantId))
          extractedValues.push(key);
      });
    }
  });
  /*
  console.log(participant, {
    idCollections,
    extractedValues,
    policyAttributes,
  });
  */

  const values = unique(extractedValues);
  return { values };

  function processKeys({ value, keys = [], significantCharacters }) {
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
        const extractedValue = significantCharacters
          ? value.slice(0, significantCharacters)
          : value;
        extractedValues.push(extractedValue);
      }
    }
  }
}
