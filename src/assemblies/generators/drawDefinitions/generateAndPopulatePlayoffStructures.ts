import { getAvailablePlayoffProfiles } from '../../../query/drawDefinition/getAvailablePlayoffProfiles';
import { assignDrawPositionBye } from '../../../mutate/matchUps/drawPositions/assignDrawPositionBye';
import { generateAndPopulateRRplayoffStructures } from './generateAndPopulateRRplayoffStructures';
import { directParticipants } from '../../../mutate/matchUps/drawPositions/directParticipants';
import { resolveTieFormat } from '../../../query/hierarchical/tieFormats/resolveTieFormat';
import { getAllStructureMatchUps } from '../../../query/matchUps/getAllStructureMatchUps';
import { positionTargets } from '../../../mutate/matchUps/drawPositions/positionTargets';
import { checkMatchUpIsComplete } from '../../../query/matchUp/checkMatchUpIsComplete';
import { NamingEntry, generatePlayoffStructures } from './drawTypes/playoffStructures';
import { ResultType, decorateResult } from '../../../global/functions/decorateResult';
import { addGoesTo } from '../../../mutate/drawDefinitions/matchUpGovernor/addGoesTo';
import { getSourceRounds } from '../../../query/drawDefinition/getSourceRounds';
import { getAllDrawMatchUps } from '../../../query/matchUps/drawMatchUps';
import { getMatchUpId } from '../../../global/functions/extractors';
import { makeDeepCopy } from '../../../utilities/makeDeepCopy';
import { findStructure } from '../../../acquire/findStructure';
import { ensureInt } from '../../../utilities/ensureInt';
import { generateTieMatchUps } from './tieMatchUps';

import { DrawDefinition, DrawLink, Event, Structure, Tournament } from '../../../types/tournamentTypes';
import { CONTAINER, LOSER, PLAY_OFF, TOP_DOWN } from '../../../constants/drawDefinitionConstants';
import { BYE } from '../../../constants/matchUpStatusConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { RoundProfile } from '../../../types/factoryTypes';
import { TEAM } from '../../../constants/matchUpTypes';
import {
  INVALID_VALUES,
  MISSING_DRAW_DEFINITION,
  STRUCTURE_NOT_FOUND,
} from '../../../constants/errorConditionConstants';

type GenerateAndPopulateArgs = {
  addNameBaseToAttributeName?: boolean;
  finishingPositionNaming?: NamingEntry;
  playoffStructureNameBase?: string;
  playoffAttributes?: NamingEntry;
  finishingPositionLimit?: number;
  tournamentRecord: Tournament;
  drawDefinition: DrawDefinition;
  roundProfiles?: RoundProfile[];
  playoffPositions?: number[];
  roundOffsetLimit?: number;
  exitProfileLimit?: boolean;
  roundNumbers?: number[];
  structureId: string;
  idPrefix?: string;
  isMock?: boolean;
  uuids?: string[];
  event?: Event;
};
export function generateAndPopulatePlayoffStructures(params: GenerateAndPopulateArgs): ResultType & {
  drawDefinition?: DrawDefinition;
  matchUpModifications?: any[];
  structures?: Structure[];
  links?: DrawLink[];
  success?: boolean;
} {
  const stack = 'genPlayoffStructure';
  if (!params.drawDefinition)
    return decorateResult({
      result: { error: MISSING_DRAW_DEFINITION },
      stack,
    });

  const availabilityResult = getAvailablePlayoffProfiles(params);
  if (availabilityResult.error) {
    return decorateResult({ result: availabilityResult, stack });
  }

  const {
    structureId: sourceStructureId,
    addNameBaseToAttributeName,
    playoffStructureNameBase,
    finishingPositionNaming,
    finishingPositionLimit,
    playoffAttributes,
    playoffPositions,
    roundOffsetLimit,
    tournamentRecord,
    exitProfileLimit,
    roundProfiles,
    roundNumbers,
    idPrefix,
    isMock,
    event,
    uuids,
  } = params;

  // The goal here is to return { structures, links } and not modify existing drawDefinition
  // However, a copy of the drawDefinition needs to have the structures attached in order to
  // populate the newly created structures with participants which should advance into them
  const drawDefinition = makeDeepCopy(params.drawDefinition, false, true);

  const { structure } = findStructure({
    structureId: sourceStructureId,
    drawDefinition,
  });

  if (!structure) return decorateResult({ result: { error: STRUCTURE_NOT_FOUND }, stack });

  if (structure.structureType === CONTAINER || structure.structures) {
    return generateAndPopulateRRplayoffStructures({
      sourceStructureId: structure.structureId,
      ...params,
      ...availabilityResult,
      drawDefinition, // order is important!
    });
  }

  const { playoffRoundsRanges: availablePlayoffRoundsRanges, playoffRounds: availablePlayoffRounds } =
    availabilityResult;

  const {
    playoffPositionsReturned,
    error: sourceRoundsError,
    playoffSourceRounds,
    playoffRoundsRanges,
  } = getSourceRounds(params);

  if (sourceRoundsError) {
    return decorateResult({ result: { error: sourceRoundsError }, stack });
  }

  const roundProfile = roundProfiles?.length && Object.assign({}, ...roundProfiles);

  const targetRoundNumbers =
    roundNumbers || (typeof roundProfiles === 'object' && roundProfiles.map((p) => Object.keys(p)).flat());

  const validRoundNumbers =
    Array.isArray(targetRoundNumbers) && targetRoundNumbers.map((p) => !isNaN(p) && ensureInt(p)).filter(Boolean);

  if (validRoundNumbers) {
    if (!Array.isArray(validRoundNumbers))
      return decorateResult({
        result: { error: INVALID_VALUES },
        context: { validRoundNumbers },
        stack,
      });

    validRoundNumbers.forEach((roundNumber) => {
      if (!availablePlayoffRounds?.includes(roundNumber)) {
        return decorateResult({
          result: { error: INVALID_VALUES },
          context: { roundNumber },
          stack,
        });
      }
      return undefined;
    });
  }

  if (playoffPositions) {
    playoffPositions.forEach((playoffPosition) => {
      if (!playoffPositionsReturned?.includes(playoffPosition)) {
        return decorateResult({
          result: { error: INVALID_VALUES },
          context: { playoffPosition },
          stack,
        });
      }
      return undefined;
    });
  }

  const sourceRounds = validRoundNumbers || playoffSourceRounds;
  const roundsRanges = validRoundNumbers ? availablePlayoffRoundsRanges : playoffRoundsRanges;

  const newStructures: Structure[] = [];
  const newLinks: DrawLink[] = [];

  for (const roundNumber of sourceRounds ?? []) {
    const roundInfo = roundsRanges?.find((roundInfo) => roundInfo.roundNumber === roundNumber);
    if (!roundInfo)
      return decorateResult({
        result: { error: INVALID_VALUES },
        context: { roundNumber },
        stack,
      });
    const drawSize = roundInfo.finishingPositions.length;
    const finishingPositionOffset = Math.min(...roundInfo.finishingPositions) - 1;

    const stageSequence = 2;
    const sequenceLimit = roundNumber && roundProfile?.[roundNumber] && stageSequence + roundProfile[roundNumber] - 1;

    const result = generatePlayoffStructures({
      exitProfile: `0-${roundNumber}`,
      addNameBaseToAttributeName,
      playoffStructureNameBase,
      finishingPositionOffset,
      playoffAttributes,
      exitProfileLimit,
      stage: PLAY_OFF,
      roundOffset: 0,
      drawDefinition,
      sequenceLimit,
      stageSequence,
      drawSize,
      idPrefix,
      isMock,
      uuids,

      finishingPositionNaming,
      finishingPositionLimit,
      roundOffsetLimit,
    });
    if (result.error) return decorateResult({ result, stack });

    const { structures, links } = result;

    if (structures?.length) newStructures.push(...structures);
    if (links?.length) newLinks.push(...links);

    if (result.structureId && roundNumber) {
      const link: DrawLink = {
        linkType: LOSER,
        source: {
          structureId: sourceStructureId,
          roundNumber,
        },
        target: {
          structureId: result.structureId,
          feedProfile: TOP_DOWN,
          roundNumber: 1,
        },
      };

      newLinks.push(link);
    }
  }

  if (!newStructures.length)
    return decorateResult({
      result: { error: INVALID_VALUES },
      info: 'No structures generated',
      stack,
    });

  drawDefinition.structures.push(...newStructures);
  drawDefinition.links.push(...newLinks);

  const { matchUps: inContextDrawMatchUps, matchUpsMap } = getAllDrawMatchUps({
    inContext: true,
    drawDefinition,
  });

  const newStructureIds = newStructures.map(({ structureId }) => structureId);
  const addedMatchUpIds = inContextDrawMatchUps
    ?.filter(({ structureId }) => newStructureIds.includes(structureId))
    .map(getMatchUpId);

  const addedMatchUps = matchUpsMap?.drawMatchUps?.filter(({ matchUpId }) => addedMatchUpIds?.includes(matchUpId));

  if (addedMatchUps?.length) {
    const tieFormat = resolveTieFormat({ drawDefinition, event })?.tieFormat;

    if (tieFormat) {
      addedMatchUps.forEach((matchUp) => {
        const { tieMatchUps } = generateTieMatchUps({ matchUp, tieFormat, isMock });
        Object.assign(matchUp, { tieMatchUps, matchUpType: TEAM });
      });
    }
  }

  // now advance any players from completed matchUps into the newly added structures
  const completedMatchUps = inContextDrawMatchUps?.filter(
    (matchUp) => checkMatchUpIsComplete({ matchUp }) && matchUp.structureId === sourceStructureId,
  );

  completedMatchUps?.forEach((matchUp) => {
    const { matchUpId, score, winningSide } = matchUp;
    const targetData = positionTargets({
      inContextDrawMatchUps,
      drawDefinition,
      matchUpId,
    });
    const result = directParticipants({
      inContextDrawMatchUps,
      tournamentRecord,
      drawDefinition,
      matchUpsMap,
      winningSide,
      targetData,
      matchUpId,
      structure,
      matchUp,
      score,
      event,
    });
    if (result.error) console.log(result.error);
  });

  const byeMatchUps = inContextDrawMatchUps?.filter(
    (matchUp) => matchUp.matchUpStatus === BYE && matchUp.structureId === sourceStructureId,
  );

  byeMatchUps?.forEach((matchUp) => {
    const { matchUpId } = matchUp;
    const targetData = positionTargets({
      inContextDrawMatchUps,
      drawDefinition,
      matchUpId,
    });
    const {
      targetLinks: { loserTargetLink },
      targetMatchUps: {
        loserMatchUpDrawPositionIndex, // only present when positionTargets found without loserMatchUpId
        loserMatchUp,
      },
    } = targetData;

    if (loserTargetLink && loserMatchUp) {
      const targetStructureId = loserTargetLink.target.structureId;
      const targetDrawPosition = loserMatchUp.drawPositions[loserMatchUpDrawPositionIndex];

      const result = assignDrawPositionBye({
        drawPosition: targetDrawPosition,
        structureId: targetStructureId,
        tournamentRecord,
        drawDefinition,
        event,
      });
      if (result.error) console.log(result.error);
    }
  });

  // the matchUps in the source structure must have goesTo details added
  const matchUpModifications: any[] = [];
  const goesToMap = addGoesTo({
    inContextDrawMatchUps,
    drawDefinition,
    matchUpsMap,
  }).goesToMap;

  const { structure: sourceStructure } = findStructure({
    drawDefinition: params.drawDefinition,
    structureId: sourceStructureId,
  });

  const { matchUps: sourceStructureMatchUps } = getAllStructureMatchUps({
    structure: sourceStructure,
  });

  sourceStructureMatchUps.forEach((matchUp) => {
    const loserMatchUpId = goesToMap?.loserMatchUpIds[matchUp.matchUpId];
    if (loserMatchUpId && matchUp.loserMatchUpId !== loserMatchUpId) {
      matchUp.loserMatchUpId = loserMatchUpId;
      const modification = {
        tournamentId: tournamentRecord?.tournamentId,
        eventId: params.event?.eventId,
        context: stack,
        matchUp,
      };
      matchUpModifications.push(modification);
    }
    const winnerMatchUpId = goesToMap?.winnerMatchUpIds[matchUp.matchUpId];
    if (winnerMatchUpId && matchUp.winnerMatchUpId !== winnerMatchUpId) {
      matchUp.winnerMatchUpId = winnerMatchUpId;
      const modification = {
        tournamentId: tournamentRecord?.tournamentId,
        eventId: params.event?.eventId,
        context: stack,
        matchUp,
      };
      matchUpModifications.push(modification);
    }
  });

  return {
    structures: newStructures,
    matchUpModifications,
    links: newLinks,
    drawDefinition,
    ...SUCCESS,
  };
}
