import { getParticipantResults } from './getParticipantResults';
import { instanceCount } from '../../../../utilities';

/**
 *
 * @param {object[]} participantResults - calculated results for each participant
 * @param {number} participantsCount - number of participants in round robin group
 * @param {string[]} disqualified - participantIds which have been disqualified
 *
 * @returns {object[]} finishingPositions - array of objects [{ participantId, position }]
 */
export function getFinishingPositions(props) {
  const { participantResults, disqualified, subOrderMap } = props;

  // if not all opponents have completed their matchUps, no orders are assigned
  if (!isComplete(props)) return;

  const matchUpsWonGroups = getGroups({
    attribute: 'matchUpsWon',
    participantResults,
    disqualified,
  });
  const finishingPositions = Object.keys(matchUpsWonGroups)
    .map((key) => parseFloat(key))
    .sort((a, b) => b - a)
    .map((key) => matchUpsWonGroups[key])
    .map((participantIds) => groupSubSort({ participantIds, ...props }))
    .flat(Infinity);

  // console.log({ finishingPositions });

  let groupPosition = 1;
  let priorPositionResolution;
  finishingPositions.forEach((finishingPosition, index) => {
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

  const positions = finishingPositions.map(({ position }) => position);
  const positionsCount = instanceCount(positions);

  finishingPositions.forEach((f) => {
    const result = participantResults[f.participantId];
    const positionInstances = positionsCount[f.position];

    if (f !== undefined && f.position !== undefined) {
      // subOrder is only assigned if there are ties
      if (positionInstances > 1) {
        result.fpTies = positionInstances;
        result.fpSubOrder = subOrderMap && subOrderMap[f.participantId];
      }

      result.positionOrder = f.position + (result.subOrder || 1) - 1;
    }
  });

  return finishingPositions;
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
  matchUps,
}) {
  const { participantResults, disqualified } = getParticipantResults({
    participantIds,
    matchUpFormat,
    tallyPolicy,
    matchUps,
  });
  const groups = getGroups({
    participantResults,
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

function groupSubSort({
  participantResults,
  participantIds,
  matchUpFormat,
  tallyPolicy,
  matchUps,
}) {
  if (participantIds.length === 1)
    return { resolved: true, participantId: participantIds[0] };
  if (participantIds.length === 2) {
    const result = headToHeadWinner({ participantIds, participantResults });
    if (result) return result;
    // if logic leads us here then the participants did not face each other => double walkover or cancelled
    // determine wins by sets... then games...
  }

  let result = processAttribute({
    attribute: 'matchUpsRatio',
    participantIds,
    matchUpFormat,
    tallyPolicy,
    matchUps,
  });
  if (result) return result;

  result = processAttribute({
    attribute: 'setsRatio',
    participantIds,
    matchUpFormat,
    tallyPolicy,
    matchUps,
  });
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

function getGroups({ participantResults, attribute, disqualified }) {
  const resultsArray = getResultsArray({ participantResults });
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

function getResultsArray({ participantResults }) {
  const participantIds = Object.keys(participantResults);
  return participantIds.reduce((arr, participantId, i) => {
    arr.push({ participantId, i, results: participantResults[participantId] });
    return arr;
  }, []);
}
