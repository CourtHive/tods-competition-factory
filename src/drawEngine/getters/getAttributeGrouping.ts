import { unique } from '../../utilities';

import { HydratedParticipant } from '../../types/hydrated';
import {
  MISSING_PARTICIPANT,
  MISSING_PARTICIPANTS,
  MISSING_POLICY_ATTRIBUTES,
} from '../../constants/errorConditionConstants';

/**
 *
 * Each policyAttribute is a string definining how to access the nested participant attribute to be accessed
 * 'person.nationalityCode' targets => { participant: { person: { natinalityCode }}}
 *
 * If an attribute within a policyAttribute definition is an array then the function iterates over members of the array
 * The use case for this behavior is when a participant is a team and contains individualPatticipants: []
 * 'individualParticipants.person.nationalityCode' targets =>
 *  { participant: { individualParticipants: [ { person: { nationalityCode }}, { person: { nationalityCode }}]}}
 */

type GetAttributeGroupingsArgs = {
  participants: HydratedParticipant[];
  targetParticipantIds: string[];
  policyAttributes: any;
  idCollections?: any;
};
export function getAttributeGroupings({
  targetParticipantIds,
  policyAttributes,
  idCollections,
  participants,
}: GetAttributeGroupingsArgs) {
  if (!Array.isArray(policyAttributes)) {
    return { error: MISSING_POLICY_ATTRIBUTES };
  }
  if (!Array.isArray(participants)) {
    return { error: MISSING_PARTICIPANTS };
  }
  const groupings = {};
  targetParticipantIds.forEach((participantId) => {
    const participant = participants.find(
      (candidate) => candidate.participantId === participantId
    );

    const { values } = extractAttributeValues({
      policyAttributes,
      idCollections,
      participants,
      participant,
    });
    if (values) {
      values.forEach((value) => {
        if (!groupings[value]) groupings[value] = [];
        if (!groupings[value].includes(participantId)) {
          groupings[value].push(participantId);
        }
      });
    }
  });

  return groupings;
}

type ExtractAttributeValuesArgs = {
  participants?: HydratedParticipant[];
  participant?: HydratedParticipant;
  policyAttributes: any;
  idCollections?: any;
};
export function extractAttributeValues({
  policyAttributes,
  idCollections,
  participants,
  participant,
}: ExtractAttributeValuesArgs) {
  if (!Array.isArray(policyAttributes)) {
    return { error: MISSING_POLICY_ATTRIBUTES };
  }
  if (!participant) {
    return { error: MISSING_PARTICIPANT };
  }
  const extractedValues: string[] = [];
  policyAttributes.forEach((policyAttribute) => {
    const { directive, groupings, key, significantCharacters } =
      policyAttribute || {};

    if (key) {
      const keys = key.split('.');
      processKeys({ value: participant, keys, significantCharacters });
    } else if (directive) {
      // extractedValues are values to be avoided
      // e.g. for { directive: 'pairParticipants' } the extractedValues would be [ 'partnerParticipantId' ]
      const includeIds = policyAttribute?.includeIds;
      const collectionIds = (idCollections?.[directive] || []).filter(
        (participantId) => !includeIds || includeIds.includes(participantId)
      );
      if (collectionIds?.length && participants?.length) {
        collectionIds.forEach((collectionParticipantId) => {
          const collectionParticipant = participants.find(
            (participant) =>
              participant.participantId === collectionParticipantId
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
      Object.keys(groupings).forEach((key) => {
        if (groupings[key].includes(participant.participantId)) {
          extractedValues.push(key);
        }
      });
    }
  });

  const values = unique(extractedValues);
  return { values };

  function processKeys({ value, keys = [], significantCharacters }) {
    for (const [index, key] of keys.entries()) {
      if (value?.[key]) {
        if (Array.isArray(value[key])) {
          const values = value[key];
          const remainingKeys = keys.slice(index);
          values.forEach((nestedValue) =>
            processKeys({
              value: nestedValue,
              keys: remainingKeys,
              significantCharacters,
            })
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
