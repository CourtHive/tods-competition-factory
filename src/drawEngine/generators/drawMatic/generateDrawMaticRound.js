import { assignDrawPosition } from '../../governors/positionGovernor/positionAssignment';
import { getPositionAssignments } from '../../getters/positionsGetter';
import { generateAdHocMatchUps } from '../generateAdHocMatchUps';
import { generateCandidate } from './generateCandidate';

import { SUCCESS } from '../../../constants/resultConstants';
import { DOUBLES } from '../../../constants/eventConstants';
import { TEAM } from '../../../constants/participantTypes';

// this should be in policyDefinition
const ENCOUNTER_VALUE = 50;
const SAME_TEAM_VALUE = 60;
const DEFAULT_RATING = 0;

const CANDIDATE_GOAL = 2000;
const ACTOR_DIVISOR = 100;

// valueObjects provide "weighting" to each possible pairing of participants
// deltaObjects contain the difference in ratings between two participants

export function generateDrawMaticRound({
  tournamentParticipants,
  drawDefinition,
  participantIds,
  adHocRatings,
  structureId,
  matchUpIds,
  eventType,
  structure,
}) {
  // create valueObject for each previous encounter within the structure
  const { positionAssignments } = getPositionAssignments({ structure });
  const { encounters } = getEncounters({
    matchUps: structure.matchUps,
    positionAssignments,
  });
  // valueObjects provide "weighting" to each possible pairing of participants
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
      const participantIds = teamParticipant.individualParticipantIds;
      const { uniquePairings } = getPairingsData({ participantIds });
      for (const pairing of uniquePairings) {
        if (!valueObjects[pairing]) valueObjects[pairing] = 0;
        valueObjects[pairing] += SAME_TEAM_VALUE;
      }
    }
  }

  const { uniquePairings, possiblePairings, deltaObjects } = getPairingsData({
    participantIds,
  });

  const matchUpsCount = Math.floor(participantIds.length / 2);

  // TODO: for client/server sync...
  // ... this needs to be called BEFORE drawMatic and the matchUpIds of pre-generated matchUps passed in...
  // ... and draw position assignments need to be passed in bulk AFTER
  const result = generateAdHocMatchUps({
    newRound: true,
    drawDefinition,
    matchUpsCount,
    structureId,
    matchUpIds,
    addMatchUps: true,
  });
  // OR: the matchUps don't get added here...
  // ... and the drawPositions to be added are retrieved by query then added ...
  // ... and then the addAdHocMatchUps method can be called with drawPositions in place ...
  // ... and it needs to do an integrity check to insure the drawPositions are all valid.
  // This approach would require drawPositions to be assigned without calling assignDrawPosition
  if (result.error) return result;
  const roundMatchUps = result.matchUps;

  const params = {
    drawDefinition,
    participantIds,
    possiblePairings,
    uniquePairings,
    adHocRatings,
    deltaObjects,
    valueObjects,
    structure,
  };

  const { participantIdPairings } =
    eventType === DOUBLES
      ? getDoublesPairings(params)
      : getSinglesPairings(params);

  for (const [index, matchUp] of roundMatchUps.entries()) {
    const drawPositions = matchUp.drawPositions;
    const { participantIds } = participantIdPairings[index];
    for (const i of drawPositions.keys()) {
      const participantId = participantIds[i];
      const drawPosition = drawPositions[i];
      const result = assignDrawPosition({
        drawDefinition,
        structureId,
        participantId,
        drawPosition,
      });
      if (result.error) return result;
    }
  }
  return { ...SUCCESS };
}

function getSinglesPairings({
  deltaObjects,
  valueObjects,
  adHocRatings = {},
  uniquePairings,
  possiblePairings,
}) {
  // modify valueObjects by ratings differential squared
  uniquePairings.forEach((pairing) => {
    const ratings = pairing
      .split('|')
      .map((participantId) => adHocRatings[participantId] || DEFAULT_RATING);
    const differential = Math.abs(ratings[0] - ratings[1]) + 1;
    deltaObjects[pairing] = Math.abs(ratings[0] - ratings[1]);
    if (!valueObjects[pairing]) valueObjects[pairing] = 0;
    valueObjects[pairing] += Math.pow(differential, 2);
  });

  const rankedPairings = uniquePairings
    .map((pairing) => ({ pairing, value: valueObjects[pairing] }))
    .sort((a, b) => a.value - b.value);
  const { pairingValues } = getParticipantPairingValues({
    possiblePairings,
    valueObjects,
  });

  const { participantIdPairings } = generateCandidate({
    rankedPairings,
    pairingValues,
    deltaObjects,
    candidateGoal: CANDIDATE_GOAL,
    actorDivisor: ACTOR_DIVISOR,
  });

  return { participantIdPairings };
}

function getDoublesPairings({ roundMatchUps }) {
  return { matchUps: roundMatchUps };
}

function getPairingsData({ participantIds }) {
  const possiblePairings = {};
  const uniquePairings = [];

  participantIds.forEach((participantId) => {
    possiblePairings[participantId] = participantIds.filter(
      (id) => id !== participantId
    );
    possiblePairings[participantId].forEach((id) => {
      const pairing = matchupHash(id, participantId);
      if (!uniquePairings.includes(pairing)) uniquePairings.push(pairing);
    });
  });

  const deltaObjects = Object.assign(
    {},
    ...uniquePairings.map((pairing) => ({ [pairing]: 0 }))
  );
  return { uniquePairings, possiblePairings, deltaObjects };
}

function getEncounters({ matchUps, positionAssignments }) {
  let encounters = [];

  for (const matchUp of matchUps) {
    const participantIds = positionAssignments
      .filter(({ drawPosition }) =>
        matchUp.drawPositions.includes(drawPosition)
      )
      .map(({ participantId }) => participantId)
      .filter(Boolean);
    if (participantIds.length === 2) {
      const pairing = matchupHash(...participantIds);
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
    let key = matchupHash(participantId, opponent);
    return { opponent, value: valueObjects[key] };
  }
  return { pairingValues };
}

function matchupHash(id1, id2) {
  return [id1, id2].sort().join('|');
}
