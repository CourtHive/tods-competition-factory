import { getParticipantResults } from './getParticipantResults';
import { instanceCount } from '../../../../utilities';

/**
 *
 * @param {object[]} participantResults - calculated results for each participant
 * @param {number} participantsCount - number of participants in round robin group
 * @param {string[]} disqualified - participantIds which have been disqualified
 *
 * @returns {object[]} groupOrder - array of objects [{ participantId, position }]
 */
export function getGroupOrder(props) {
  const { participantResults, disqualified, subOrderMap } = props;

  // if not all opponents have completed their matchUps, no orders are assigned
  if (!isComplete(props)) return;

  const matchUpsWonGroups = getGroups({
    attribute: 'matchUpsWon',
    participantResults,
    disqualified,
  });

  const groupOrder = Object.keys(matchUpsWonGroups)
    .map((key) => parseFloat(key))
    .sort((a, b) => b - a)
    .map((key) => matchUpsWonGroups[key])
    .map((participantIds) => groupSubSort({ participantIds, ...props }))
    .flat(Infinity);

  let groupPosition = 1;
  let priorPositionResolution;
  groupOrder.forEach((finishingPosition, index) => {
    if (
      // after the first position, which is always 1,
      index &&
      // increment group position if position is resolved
      (finishingPosition.resolved ||
        // increment group position if position is unresolved and prior position was resolved
        (priorPositionResolution && !finishingPosition.resolved))
    ) {
      groupPosition += 1;
    }
    // update prior position resolution
    priorPositionResolution = finishingPosition.resolved;

    if (finishingPosition.resolved) {
      // if a position is resolved, position is index + 1
      finishingPosition.position = index + 1;
      // if a position is resolved, update groupPosition
      groupPosition = finishingPosition.position;
    } else {
      // if a position is unresovled, position is groupPosition
      finishingPosition.position = groupPosition;
    }
  });

  const positions = groupOrder.map(({ position }) => position);
  const positionsCount = instanceCount(positions);

  groupOrder.forEach((f) => {
    const result = participantResults[f.participantId];
    const positionInstances = positionsCount[f.position];

    if (f !== undefined && f.position !== undefined) {
      // subOrder is only assigned if there are ties
      if (positionInstances > 1) {
        result.ties = positionInstances;
        if (subOrderMap) result.subOrder = subOrderMap[f.participantId];
      }

      // result.positionOrder = f.position + (result.subOrder || 1) - 1;
      f.groupOrder = f.position + (result.subOrder || 1) - 1;
    }
    result.GEMscore = getRatioHash(result);
  });

  return groupOrder;
}

function getRatioHash(result) {
  const rh =
    result.matchUpsRatio * Math.pow(10, 16) +
    result.setsRatio * Math.pow(10, 12) +
    result.gamesRatio * Math.pow(10, 8) +
    result.pointsRatio * Math.pow(10, 3);
  return rh;
}

function isComplete({ participantResults, participantsCount }) {
  const resultsArray = getResultsArray({ participantResults });
  let participantsFinished = resultsArray.filter(
    (r) =>
      participantsCount - 1 ===
      r.results.matchUpsWon +
        r.results.matchUpsLost +
        r.results.matchUpsCancelled
  );
  return participantsCount === participantsFinished.length;
}

function processAttribute({
  participantIds,
  matchUpFormat,
  tallyPolicy,
  attribute,
  idsFilter,
  matchUps,
}) {
  const { participantResults, disqualified } = getParticipantResults({
    participantIds: idsFilter && participantIds,
    matchUpFormat,
    tallyPolicy,
    matchUps,
  });
  const groups = getGroups({
    participantResults,
    participantIds,
    disqualified,
    attribute,
  });
  if (Object.keys(groups).length > 1) {
    // separation by attribute was successful
    return Object.keys(groups)
      .map((key) => parseFloat(key))
      .sort((a, b) => b - a)
      .map((key) => groups[key])
      .map((participantIds) =>
        groupSubSort({
          subSortAttribute: attribute,
          participantResults,
          participantIds,
          matchUpFormat,
          tallyPolicy,
          matchUps,
        })
      )
      .flat(Infinity);
  }
}

const tallyDirectives = [
  { attribute: 'matchUpsRatio', idsFilter: false },
  { attribute: 'setsRatio', idsFilter: false },
  { attribute: 'gamesRatio', idsFilter: false },
  { attribute: 'pointsRatio', idsFilter: false },
  { attribute: 'matchUpsRatio', idsFilter: true },
  { attribute: 'setsRatio', idsFilter: true },
  { attribute: 'gamesRatio', idsFilter: true },
  { attribute: 'pointsRatio', idsFilter: true },
];

function groupSubSort({
  participantResults,
  subSortAttribute,
  participantIds,
  matchUpFormat,
  tallyPolicy,
  matchUps,
}) {
  if (participantIds.length === 1)
    return { resolved: true, participantId: participantIds[0] };
  if (participantIds.length === 2) {
    if (
      !tallyPolicy?.headToHead ||
      (!tallyPolicy.headToHead.disabled &&
        !tallyPolicy?.headToHead[subSortAttribute]?.disabled)
    ) {
      const result = headToHeadWinner({ participantIds, participantResults });
      if (result) return result;
    }
    // if logic leads us here then the participants did not face each other => double walkover or cancelled
    // determine wins by sets... then games...
  }

  let result;
  (tallyPolicy?.tallyDirectives || tallyDirectives).every(
    ({ attribute, idsFilter }) => {
      result = processAttribute({
        participantIds,
        matchUpFormat,
        tallyPolicy,
        attribute,
        idsFilter,
        matchUps,
      });
      return result ? false : true;
    }
  );
  if (result) return result;

  return participantIds.map((participantId) => ({ participantId }));
}

function headToHeadWinner({ participantIds, participantResults }) {
  if (
    participantResults[participantIds[0]].victories.includes(participantIds[1])
  ) {
    return participantIds.map((participantId) => ({
      resolved: true,
      participantId,
    }));
  } else if (
    participantResults[participantIds[1]].victories.includes(participantIds[0])
  ) {
    return participantIds
      .reverse()
      .map((participantId) => ({ resolved: true, participantId }));
  }
}

function getGroups({
  participantResults,
  participantIds,
  disqualified,
  attribute,
}) {
  const resultsArray = getResultsArray({ participantResults, participantIds });
  const groups = resultsArray.reduce((groups, participantResult) => {
    const { participantId, results } = participantResult;
    const value = results[attribute];
    if (disqualified.includes(participantId)) {
      if (!groups[9999]) groups[9999] = [];
      groups[9999].push(participantId);
    } else if (groups[value]) {
      groups[value].push(participantId);
    } else {
      groups[value] = [participantId];
    }
    return groups;
  }, {});
  return groups;
}

function getResultsArray({ participantResults, participantIds }) {
  participantIds = participantIds || Object.keys(participantResults);
  return participantIds.reduce((arr, participantId, i) => {
    arr.push({ participantId, i, results: participantResults[participantId] });
    return arr;
  }, []);
}
