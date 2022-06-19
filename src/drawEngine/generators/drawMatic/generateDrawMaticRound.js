import { getParticipantId } from '../../../global/functions/extractors';
import { generateCandidate, pairingHash } from './generateCandidate';
import { generateAdHocMatchUps } from '../generateAdHocMatchUps';

import { SUCCESS } from '../../../constants/resultConstants';
import { DOUBLES } from '../../../constants/eventConstants';
import { TEAM } from '../../../constants/participantTypes';
import {
  MISSING_PARTICIPANT_IDS,
  NO_CANDIDATES,
} from '../../../constants/errorConditionConstants';

// this should be in policyDefinitions
const ENCOUNTER_VALUE = 50;
const SAME_TEAM_VALUE = 60;
const DEFAULT_RATING = 0;

const MAX_ITERATIONS = 5000;

export function generateDrawMaticRound({
  maxIterations = MAX_ITERATIONS,
  generateMatchUps = true,
  tournamentParticipants,
  tournamentRecord,
  addToStructure,
  drawDefinition,
  participantIds,
  adHocRatings,
  structureId,
  matchUpIds,
  eventType,
  structure,
}) {
  if (!participantIds?.length) {
    return { error: MISSING_PARTICIPANT_IDS };
  }

  // create valueObject for each previous encounter within the structure
  const { encounters } = getEncounters({ matchUps: structure.matchUps });
  // valueObjects provide "weighting" to each possible pairing of participants
  // {
  //  'P-I-0|P-I-1': 1,
  //  'P-I-0|P-I-2': 1,
  //  'P-I-0|P-I-3': 1
  // }

  const valueObjects = {};
  for (const pairing of encounters) {
    if (!valueObjects[pairing]) valueObjects[pairing] = 0;
    valueObjects[pairing] += ENCOUNTER_VALUE;
  }

  const teamParticipants = tournamentParticipants?.filter(
    ({ participantType }) => participantType === TEAM
  );
  if (teamParticipants) {
    // add SAME_TEAM_VALUE for participants who appear on the same team
    for (const teamParticipant of teamParticipants) {
      const participantIds = teamParticipant.individualParticipantIds || [];
      const { uniquePairings } = getPairingsData({ participantIds });
      for (const pairing of uniquePairings) {
        if (!valueObjects[pairing]) valueObjects[pairing] = 0;
        valueObjects[pairing] += SAME_TEAM_VALUE;
      }
    }
  }

  // deltaObjects contain the difference in ratings between two participants
  // {
  //  'P-I-0|P-I-1': 0,
  //  'P-I-0|P-I-2': 0,
  //  'P-I-0|P-I-3': 0
  // }
  const { uniquePairings, possiblePairings, deltaObjects } = getPairingsData({
    participantIds,
  });

  const params = {
    tournamentParticipants,
    possiblePairings,
    drawDefinition,
    participantIds,
    uniquePairings,
    maxIterations,
    adHocRatings,
    deltaObjects,
    valueObjects,
    eventType,
    structure,
  };

  const { candidatesCount, participantIdPairings, iterations } =
    getPairings(params);

  if (!candidatesCount) return { error: NO_CANDIDATES };

  let matchUps;
  if (generateMatchUps) {
    const result = generateAdHocMatchUps({
      participantIdPairings,
      tournamentRecord,
      addToStructure,
      drawDefinition,
      newRound: true,
      structureId,
      matchUpIds,
    });
    if (result.error) return result;
    matchUps = result.matchUps;
  }

  return {
    ...SUCCESS,
    participantIdPairings,
    candidatesCount,
    iterations,
    matchUps,
  };
}

function getSideRatings({
  tournamentParticipants,
  adHocRatings,
  eventType,
  pairing,
}) {
  const ratings = pairing.split('|').map((participantId) => {
    if (eventType === DOUBLES) {
      const individualParticipantIds = tournamentParticipants?.find(
        (participant) => participant.participantId === participantId
      )?.individualParticipantIds;
      return !individualParticipantIds
        ? DEFAULT_RATING * 2
        : individualParticipantIds?.map(
            (participantId) => adHocRatings[participantId || DEFAULT_RATING]
          );
    } else {
      return adHocRatings[participantId] || DEFAULT_RATING;
    }
  });
  return ratings;
}

function getPairings({
  tournamentParticipants,
  adHocRatings = {},
  possiblePairings, // participant keyed; provides array of possible opponents
  uniquePairings, // hashes of all possible participantId pairings
  maxIterations,
  deltaObjects, // difference in rating between paired participants
  valueObjects, // calculated value of a pairing of participants, used for sorting pairings
  eventType,
}) {
  // modify valueObjects by ratings ratingsDifference squared
  // update deltaObjects to reflect the current difference between participant's ratings
  uniquePairings.forEach((pairing) => {
    const ratings = getSideRatings({
      tournamentParticipants,
      adHocRatings,
      eventType,
      pairing,
    });

    const ratingsDifference = Math.abs(ratings[0] - ratings[1]) + 1;
    deltaObjects[pairing] = Math.abs(ratings[0] - ratings[1]);

    if (!valueObjects[pairing]) valueObjects[pairing] = 0;
    valueObjects[pairing] += Math.pow(ratingsDifference, 2);
  });

  /**
   * valueSortedPairings are uniquePairings sorted by the value of the pairings, lowest to highest
   */
  const valueSortedPairings = uniquePairings
    .map((pairing) => ({ pairing, value: valueObjects[pairing] }))
    .sort((a, b) => a.value - b.value);

  /**
   * pairingValues is keyed by participantId and provides a value-sorted array of pairings for each participantId
   * 'actorId': [
        { opponent: 'potentialId1', value: 1 },
        { opponent: 'potentialId2', value: 1 },
   */
  const { pairingValues } = getParticipantPairingValues({
    possiblePairings,
    valueObjects,
  });

  const { candidate, candidatesCount, iterations } = generateCandidate({
    valueSortedPairings,
    maxIterations,
    pairingValues,
    deltaObjects,
  });

  const { participantIdPairings } = candidate;

  return { candidatesCount, participantIdPairings, iterations };
}

function getPairingsData({ participantIds }) {
  const possiblePairings = {};
  const uniquePairings = [];

  participantIds.forEach((participantId) => {
    possiblePairings[participantId] = participantIds.filter(
      (id) => id !== participantId
    );
    possiblePairings[participantId].forEach((id) => {
      const pairing = pairingHash(id, participantId);
      if (!uniquePairings.includes(pairing)) uniquePairings.push(pairing);
    });
  });

  const deltaObjects = Object.assign(
    {},
    ...uniquePairings.map((pairing) => ({ [pairing]: 0 }))
  );
  return { uniquePairings, possiblePairings, deltaObjects };
}

function getEncounters({ matchUps }) {
  let encounters = [];

  for (const matchUp of matchUps) {
    const participantIds = matchUp.sides.map(getParticipantId);
    if (participantIds.length === 2) {
      const pairing = pairingHash(...participantIds);
      if (!encounters.includes(pairing)) encounters.push(pairing);
    }
  }

  return { encounters };
}

function getParticipantPairingValues({ possiblePairings, valueObjects }) {
  let pairingValues = {};

  for (const participantId of Object.keys(possiblePairings)) {
    let participantValues = possiblePairings[participantId].map((opponent) =>
      pairingValue(participantId, opponent)
    );
    pairingValues[participantId] = participantValues.sort(
      (a, b) => a.value - b.value
    );
  }

  function pairingValue(participantId, opponent) {
    let key = pairingHash(participantId, opponent);
    return { opponent, value: valueObjects[key] };
  }
  return { pairingValues };
}
