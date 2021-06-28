import { getParticipantResults } from './getParticipantResults';
import { instanceCount } from '../../../../utilities';

/*
Round Robin group tally logic by default implements the following guidelines:

The player who wins the most matches is the winner.
If two players are tied, then the winner of their head-to-head match is the winner.

If three or more players are tied, tie are broken as follows:
• The head-to-head win-loss record in matches involving just the tied players;
• The player with the highest percentage of sets won of all sets completed;
• The head-to-head win-loss record in matches involving the players who remain tied;
• The player with the highest percentage of games won of all games completed;
• The head-to-head win-loss record in matches involving the players who remain tied;
• The player with the highest percentage of sets won of sets completed among players in the group under consideration;
• The head-to-head win-loss record in matches involving the players who remain tied;
• The player with the highest percentage of games won of games completed among the players under consideration; and
• The head-to-head win-loss record in matches involving the players who remain tied.

After initial separation of participants by `matchUpsWon`,
the implementation is configurable by supplying an array of `tallyDirectives` in the `tallyPolicy`.

The algorithm relies on the values avaialble in the calculated `participantResults` and works as follows:
• separate participants into groups by a given attribute
• a group with a single participant is 'resolved'
• groups of two participants are resolved by head-to-head (if not disabled/if participants faced each other)
• groups of three or more search for an attribute that will separate them into smaller groups
• participantResults scoped to the members of a group and recalculated when `{ idsFilter: true }`
*/

const defaultTallyDirectives = [
  { attribute: 'matchUpsRatio', idsFilter: false },
  { attribute: 'allDefaults', reversed: true, idsFilter: false },
  { attribute: 'defaults', reversed: true, idsFilter: false },
  { attribute: 'walkovers', reversed: true, idsFilter: false },
  { attribute: 'retirements', reversed: true, idsFilter: false },
  { attribute: 'setsRatio', idsFilter: false },
  { attribute: 'gamesRatio', idsFilter: false },
  { attribute: 'pointsRatio', idsFilter: false },
  { attribute: 'matchUpsRatio', idsFilter: true },
  { attribute: 'setsRatio', idsFilter: true },
  { attribute: 'gamesRatio', idsFilter: true },
  { attribute: 'pointsRatio', idsFilter: true },
];

/**
 *
 * @param {object[]} participantResults - calculated results for each participant
 * @param {number} participantsCount - number of participants in round robin group
 * @param {string[]} matchUpStatuses - matchUpStatuses participantIds
 *
 * @returns {object[]} groupOrder - array of objects [{ participantId, position }]
 */

export function getGroupOrder(props) {
  const { participantResults, subOrderMap } = props;

  // if not all opponents have completed their matchUps, no orders are assigned
  if (!isComplete(props)) return;

  const matchUpsWonGroups = getGroups({
    attribute: 'matchUpsWon',
    participantResults,
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
      result.rankOrder = f.position;
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
  disableHeadToHead,
  participantIds,
  matchUpFormat,
  tallyPolicy,
  attribute,
  idsFilter,
  matchUps,
  reversed, // reverses default which is greatest to least
}) {
  const { participantResults, matchUpStatuses } = getParticipantResults({
    participantIds: idsFilter && participantIds,
    matchUpFormat,
    tallyPolicy,
    matchUps,
  });
  const groups = getGroups({
    participantResults,
    participantIds,
    attribute,
  });
  if (Object.keys(groups).length > 1) {
    // separation by attribute was successful
    return Object.keys(groups)
      .map((key) => parseFloat(key))
      .sort((a, b) => (reversed ? a - b : b - a))
      .map((key) => groups[key])
      .map((participantIds) =>
        groupSubSort({
          participantResults,
          disableHeadToHead,
          matchUpStatuses,
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
  disableHeadToHead,
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
      (!tallyPolicy.headToHead.disabled && !disableHeadToHead)
    ) {
      const result = headToHeadWinner({ participantIds, participantResults });
      if (result) return result;
    }
    // if logic leads us here then the participants did not face each other => double walkover or cancelled
    // determine wins by sets... then games...
  }

  let result;
  (tallyPolicy?.tallyDirectives || defaultTallyDirectives).every(
    ({ attribute, reversed, idsFilter, disableHeadToHead }) => {
      result = processAttribute({
        disableHeadToHead,
        participantIds,
        matchUpFormat,
        tallyPolicy,
        attribute,
        idsFilter,
        matchUps,
        reversed,
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

function getGroups({ participantResults, participantIds, attribute }) {
  const resultsArray = getResultsArray({ participantResults, participantIds });
  const groups = resultsArray.reduce((groups, participantResult) => {
    const { participantId, results } = participantResult;
    const value = results[attribute];
    if (groups[value]) {
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
