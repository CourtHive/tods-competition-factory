import { getParticipantResults } from './getParticipantResults';
import { instanceCount } from '../../../utilities';

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

const headToHeadTallyDirectives = [
  { attribute: 'matchUpsPct', idsFilter: false },
  { attribute: 'allDefaults', reversed: true, idsFilter: false },
  { attribute: 'defaults', reversed: true, idsFilter: false },
  { attribute: 'walkovers', reversed: true, idsFilter: false },
  { attribute: 'retirements', reversed: true, idsFilter: false },
  { attribute: 'setsPct', idsFilter: false },
  { attribute: 'gamesPct', idsFilter: false },
  { attribute: 'pointsRatio', idsFilter: false },
  { attribute: 'matchUpsPct', idsFilter: true },
  { attribute: 'setsPct', idsFilter: true },
  { attribute: 'gamesPct', idsFilter: true },
  { attribute: 'pointsRatio', idsFilter: true },
];

const GEMScoreValueMap = {
  matchUpsPct: 20,
  tieMatchUpsPct: 16,
  setsPct: 12,
  gamesPct: 8,
  pointsRatio: 4,
};

/**
 *
 * @param {object[]} participantResults - calculated results for each participant
 * @param {number} participantsCount - number of participants in round robin group
 * @param {object} subOrderMap - { [participantId]: subOrder }
 *
 * @returns {object[]} groupOrder - array of objects [{ participantId, position }]
 */

export function getGroupOrder(params) {
  const {
    requireCompletion = true,
    participantResults,
    subOrderMap,
    tallyPolicy,
  } = params;

  // if not all opponents have completed their matchUps, no orders are assigned
  if (requireCompletion && !isComplete(params)) return;

  const attribute = [
    'matchUpsWon',
    'pointsWon',
    'gamesWon',
    'setsWon',
    'gamesPct',
    'setsPct',
    'pointsRatio',
    'matchUpsPct',
  ].includes(tallyPolicy?.groupOrderKey)
    ? tallyPolicy.groupOrderKey
    : 'matchUpsWon';

  const orderedTallyGroups = getGroups({
    participantResults,
    attribute,
  });

  const groupOrder = Object.keys(orderedTallyGroups)
    .map((key) => parseFloat(key))
    .sort((a, b) => b - a)
    .map((key) => orderedTallyGroups[key])
    .map((participantIds) => groupSubSort({ participantIds, ...params }))
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

  groupOrder.forEach((finishingPosition) => {
    const { participantId, position } = finishingPosition || {};
    const participantResult = participantResults[participantId];
    finishingPosition.GEMscore = getRatioHash(participantResult);

    const positionInstances = positionsCount[position];

    if (finishingPosition?.position !== undefined) {
      // subOrder is only assigned if there are ties
      if (positionInstances > 1) {
        finishingPosition.ties = positionInstances;
        if (subOrderMap) {
          finishingPosition.subOrder = subOrderMap[participantId];
        }
      }

      finishingPosition.rankOrder = position;
      finishingPosition.groupOrder =
        position + (finishingPosition.subOrder || 1) - 1;
    }
  });

  return groupOrder;

  function getRatioHash(result) {
    const attributes = Array.isArray(tallyPolicy?.GEMscore)
      ? Object.keys(GEMScoreValueMap).filter((attribute) =>
          tallyPolicy.GEMscore.includes(attribute)
        )
      : Object.keys(GEMScoreValueMap);

    const attributeValues = attributes.map(
      (attribute) =>
        (result[attribute] || 0) *
        Math.pow(10, GEMScoreValueMap[attribute].toFixed(3))
    );

    return attributeValues.reduce((a, b) => a + b, 0);
  }
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
  const { participantResults } = getParticipantResults({
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

  if (Object.keys(groups).length > 1 && participantIds.length) {
    // separation by attribute was successful
    return Object.keys(groups)
      .map((key) => parseFloat(key))
      .sort((a, b) => (reversed ? a - b : b - a))
      .map((key) => groups[key])
      .map((participantIds) => {
        return groupSubSort({
          participantResults,
          disableHeadToHead,
          participantIds,
          matchUpFormat,
          tallyPolicy,
          matchUps,
        });
      })
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
  if (participantIds?.length === 1)
    return { resolved: true, participantId: participantIds[0] };
  if (participantIds?.length === 2) {
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
  (tallyPolicy?.tallyDirectives || headToHeadTallyDirectives).every(
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

  return participantIds?.map((participantId) => ({ participantId }));
}

// NOTE: This currently considers one victory rather than a head2head win/loss record (considering rounds of play where participants may encounter each other more than once)
function headToHeadWinner({ participantIds, participantResults }) {
  if (!participantIds) return;

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
  return resultsArray.reduce((groups, participantResult) => {
    const { participantId, results } = participantResult;
    const value = results?.[attribute];
    if (!isNaN(value) && participantId) {
      if (groups[value]) {
        groups[value].push(participantId);
      } else {
        groups[value] = [participantId];
      }
    }
    return groups;
  }, {});
}

function getResultsArray({ participantResults, participantIds }) {
  participantIds = participantIds || Object.keys(participantResults);
  return participantIds.reduce((arr, participantId, i) => {
    arr.push({ participantId, i, results: participantResults[participantId] });
    return arr;
  }, []);
}
