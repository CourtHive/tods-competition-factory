import { allTournamentMatchUps } from '../../tournamentEngine/getters/matchUpsGetter';
import { getMatchUpId } from '../../global/functions/extractors';
import { generateRange, overlap, UUID } from '../../utilities';
import { mustBeAnArray } from '../../utilities/mustBeAnArray';
import { isConvertableInteger } from '../../utilities/math';
import { definedAttributes } from '../../utilities/objects';
import {
  addMatchUpsNotice,
  modifyDrawNotice,
} from '../notifications/drawNotifications';

import { ROUND_OUTCOME } from '../../constants/drawDefinitionConstants';
import { TO_BE_PLAYED } from '../../constants/matchUpStatusConstants';
import { SUCCESS } from '../../constants/resultConstants';
import {
  INVALID_VALUES,
  INVALID_STRUCTURE,
  MISSING_DRAW_DEFINITION,
  MISSING_STRUCTURE_ID,
  STRUCTURE_NOT_FOUND,
  EXISTING_MATCHUP_ID,
} from '../../constants/errorConditionConstants';

/**
 *
 * @param {string} drawId - required - tournamentEngine discovers and passes { drawDefinition }
 * @param {object} drawDefinition - required
 * @param {string} structureId - required - structure for which matchUps are being generated
 * @param {boolean} addMatchUps - whether to add matchUps to structure once generated
 * @param {integer} matchUpsCount - number of matchUps to be generated
 * @param {string[]} matchUpIds - optional - when not provided UUIDs will be generated
 * @param {integer} roundNumber - optional - round for which matchUps will be generated
 * @param {boolen} newRound - optional - whether to auto-increment to the next roundNumber
 * @returns
 */
export function generateAdHocMatchUps({
  participantIdPairings,
  addToStructure = true,
  tournamentRecord,
  matchUpIds = [],
  drawDefinition,
  matchUpsCount,
  roundNumber,
  structureId,
  newRound,
}) {
  if (typeof drawDefinition !== 'object')
    return { error: MISSING_DRAW_DEFINITION };

  if (!structureId && drawDefinition.structures?.length === 1)
    structureId = drawDefinition.structures?.[0]?.structureId;
  if (typeof structureId !== 'string') return { error: MISSING_STRUCTURE_ID };

  if (
    (participantIdPairings && !Array.isArray(participantIdPairings)) ||
    (matchUpsCount && !isConvertableInteger(matchUpsCount)) ||
    (matchUpIds && !Array.isArray(matchUpIds)) ||
    (!participantIdPairings && !matchUpsCount)
  ) {
    return { error: INVALID_VALUES, info: 'matchUpsCount or pairings error' };
  }

  // if drawDefinition and structureId are provided it is possible to infer roundNumber
  const structure = drawDefinition?.structures?.find(
    (structure) => structure.structureId === structureId
  );

  let structureHasRoundPositions;
  const existingMatchUps = structure?.matchUps;
  const lastRoundNumber = existingMatchUps.reduce((roundNumber, matchUp) => {
    if (matchUp.roundPosition) structureHasRoundPositions = true;
    return matchUp.roundNumber > roundNumber
      ? matchUp.roundNumber
      : roundNumber;
  }, 0);

  // structure must not be a container of other structures
  // structure must not contain matchUps with roundPosition
  // structure must not determine finishingPosition by ROUND_OUTCOME
  if (
    structure.structures ||
    structureHasRoundPositions ||
    structure.finishingPosition === ROUND_OUTCOME
  ) {
    return { error: INVALID_STRUCTURE };
  }

  if (roundNumber && roundNumber - 1 > lastRoundNumber)
    return { error: INVALID_VALUES, info: 'roundNumber error' };

  const nextRoundNumber =
    roundNumber || (newRound ? lastRoundNumber + 1 : lastRoundNumber || 1);

  participantIdPairings =
    participantIdPairings ||
    generateRange(0, matchUpsCount).map(() => ({ participantIds: [] }));
  const matchUps = participantIdPairings.map((pairing) => {
    // ensure there are always 2 sides in generated matchUps
    const participantIds = (pairing?.participantIds || [])
      .concat([undefined, undefined])
      .slice(0, 2);
    const sides = participantIds.map((participantId, i) =>
      definedAttributes({
        sideNumber: i + 1,
        participantId,
      })
    );

    return {
      matchUpId: matchUpIds.pop() || UUID(),
      roundNumber: nextRoundNumber,
      matchUpStatus: TO_BE_PLAYED,
      sides,
    };
  });

  if (addToStructure) {
    const result = addAdHocMatchUps({
      tournamentRecord,
      drawDefinition,
      structureId,
      matchUps,
    });
    if (result.error) return result;
  }

  return { matchUpsCount: matchUps.length, matchUps, ...SUCCESS };
}

export function addAdHocMatchUps({
  tournamentRecord,
  drawDefinition,
  structureId,
  matchUps,
}) {
  if (typeof drawDefinition !== 'object')
    return { error: MISSING_DRAW_DEFINITION };

  if (!structureId && drawDefinition.structures?.length === 1)
    structureId = drawDefinition.structures?.[0]?.structureId;

  if (typeof structureId !== 'string') return { error: MISSING_STRUCTURE_ID };

  if (!Array.isArray(matchUps))
    return { error: INVALID_VALUES, info: mustBeAnArray('matchUps') };

  const structure = drawDefinition.structures?.find(
    (structure) => structure.structureId === structureId
  );
  if (!structure) return { error: STRUCTURE_NOT_FOUND };

  const existingMatchUps = structure?.matchUps;
  const structureHasRoundPositions = existingMatchUps.find(
    (matchUp) => !!matchUp.roundPosition
  );

  if (
    structure.structures ||
    structureHasRoundPositions ||
    structure.finishingPosition === ROUND_OUTCOME
  ) {
    return { error: INVALID_STRUCTURE };
  }

  if (
    structure.structures ||
    structureHasRoundPositions ||
    structure.finishingPosition === ROUND_OUTCOME
  ) {
    return { error: INVALID_STRUCTURE };
  }

  const existingMatchUpIds =
    allTournamentMatchUps({
      tournamentRecord,
      inContext: false,
    })?.matchUps?.map(getMatchUpId) || [];

  const newMatchUpIds = matchUps.map(getMatchUpId);

  if (overlap(existingMatchUpIds, newMatchUpIds)) {
    return {
      error: EXISTING_MATCHUP_ID,
      info: 'One or more matchUpIds already present in tournamentRecord',
    };
  }

  structure.matchUps.push(...matchUps);

  addMatchUpsNotice({
    tournamentId: tournamentRecord?.tournamentId,
    drawDefinition,
    matchUps,
  });
  modifyDrawNotice({ drawDefinition, structureIds: [structureId] });

  return { ...SUCCESS };
}
