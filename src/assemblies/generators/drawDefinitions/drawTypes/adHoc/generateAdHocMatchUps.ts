import { resolveTieFormat } from '@Query/hierarchical/tieFormats/resolveTieFormat';
import { generateTieMatchUps } from '@Generators/drawDefinitions/tieMatchUps';
import { decorateResult } from '@Functions/global/decorateResult';
import { definedAttributes } from '@Tools/definedAttributes';
import { isConvertableInteger } from '@Tools/math';
import { generateRange } from '@Tools/arrays';
import { UUID } from '@Tools/UUID';

// constants and types
import { DrawDefinition, EntryStatusUnion, Event, MatchUp, Tournament } from '@Types/tournamentTypes';
import { STRUCTURE_SELECTED_STATUSES } from '@Constants/entryStatusConstants';
import { ROUND_OUTCOME } from '@Constants/drawDefinitionConstants';
import { TO_BE_PLAYED } from '@Constants/matchUpStatusConstants';
import { SUCCESS } from '@Constants/resultConstants';
import { TEAM } from '@Constants/matchUpTypes';
import {
  INVALID_VALUES,
  INVALID_STRUCTURE,
  MISSING_DRAW_DEFINITION,
  MISSING_STRUCTURE_ID,
  STRUCTURE_NOT_FOUND,
  ErrorType,
} from '@Constants/errorConditionConstants';

type GenerateAdHocMatchUpsArgs = {
  participantIdPairings?: {
    participantIds: [string | undefined, string | undefined];
  }[];
  ignoreLastRoundNumber?: boolean;
  restrictMatchUpsCount?: boolean;
  tournamentRecord?: Tournament;
  drawDefinition: DrawDefinition;
  matchUpsCount?: number; // number of matchUps to be generated
  matchUpIds?: string[];
  roundNumber?: number;
  structureId?: string;
  newRound?: boolean; // optional - whether to auto-increment to the next roundNumber
  idPrefix?: string;
  isMock?: boolean;
  event: Event;
};

export function generateAdHocMatchUps(params: GenerateAdHocMatchUpsArgs): {
  matchUpsCount?: number;
  roundNumber?: number;
  matchUps?: MatchUp[];
  error?: ErrorType;
  info?: any;
} {
  const { matchUpIds = [], drawDefinition, roundNumber, newRound, isMock, event } = params;
  if (typeof drawDefinition !== 'object') return { error: MISSING_DRAW_DEFINITION };
  let { participantIdPairings, matchUpsCount } = params;

  const structureId =
    params.structureId ?? (drawDefinition.structures?.length === 1 && drawDefinition.structures?.[0]?.structureId);

  if (typeof structureId !== 'string') return { error: MISSING_STRUCTURE_ID };

  // if drawDefinition and structureId are provided it is possible to infer roundNumber
  const structure = drawDefinition.structures?.find((structure) => structure.structureId === structureId);
  if (!structure) return { error: STRUCTURE_NOT_FOUND };

  let structureHasRoundPositions;
  const existingMatchUps = structure.matchUps ?? [];
  const lastRoundNumber = existingMatchUps?.reduce((roundNumber: number, matchUp: any) => {
    if (matchUp.roundPosition) structureHasRoundPositions = true;
    return (matchUp?.roundNumber || 0) > roundNumber ? matchUp.roundNumber : roundNumber;
  }, 0);

  const selectedEntries =
    drawDefinition?.entries?.filter((entry) => {
      const entryStatus = entry.entryStatus as EntryStatusUnion;
      return STRUCTURE_SELECTED_STATUSES.includes(entryStatus);
    }) ?? [];
  const roundMatchUpsCount = Math.floor(selectedEntries?.length / 2) || 1;

  if (!matchUpsCount) {
    if (newRound) {
      matchUpsCount = roundMatchUpsCount;
    } else {
      const targetRoundNumber = roundNumber ?? lastRoundNumber ?? 1;
      const existingRoundMatchUps =
        structure.matchUps?.filter((matchUp) => matchUp.roundNumber === targetRoundNumber)?.length ?? 0;
      const maxRemaining = roundMatchUpsCount - existingRoundMatchUps;
      if (maxRemaining > 0) matchUpsCount = maxRemaining;
    }
  } else if (matchUpsCount > roundMatchUpsCount && params.restrictMatchUpsCount !== false) {
    return decorateResult({
      result: { error: INVALID_VALUES, info: 'matchUpsCount error', context: { roundMatchUpsCount } },
    });
  }

  if (
    (participantIdPairings && !Array.isArray(participantIdPairings)) ||
    (matchUpsCount && !isConvertableInteger(matchUpsCount)) ||
    (matchUpIds && !Array.isArray(matchUpIds)) ||
    (!participantIdPairings && !matchUpsCount)
  ) {
    return { error: INVALID_VALUES, info: 'matchUpsCount or pairings error' };
  }

  if (matchUpsCount && matchUpsCount > 25) {
    return { error: INVALID_VALUES, info: 'matchUpsCount must be less than 25' };
  }

  // structure must not be a container of other structures
  // structure must not contain matchUps with roundPosition
  // structure must not determine finishingPosition by ROUND_OUTCOME
  if (structure.structures || structureHasRoundPositions || structure.finishingPosition === ROUND_OUTCOME) {
    return { error: INVALID_STRUCTURE };
  }

  if (roundNumber && !params.ignoreLastRoundNumber && roundNumber - 1 > (lastRoundNumber || 0)) {
    return { error: INVALID_VALUES, info: 'roundNumber error' };
  }

  const nextRoundNumber = roundNumber ?? ((newRound && (lastRoundNumber ?? 0) + 1) || lastRoundNumber || 1);

  participantIdPairings =
    participantIdPairings ??
    generateRange(0, matchUpsCount).map(() => ({
      participantIds: [undefined, undefined],
    }));

  const getPrefixedId = (index: number) => {
    if (!params.idPrefix) return undefined;
    const drawId = drawDefinition.drawId;
    const idPrefix = params.idPrefix ?? 'ah';
    return `${drawId}-${idPrefix}-${nextRoundNumber}-${index}`;
  };

  const matchUps = participantIdPairings?.map((pairing, i) => {
    const idStack = pairing?.participantIds ?? [undefined, undefined];
    // ensure there are always 2 sides in generated matchUps
    idStack.push(...[undefined, undefined]);
    const participantIds = idStack.slice(0, 2);
    const sides = participantIds.map((participantId, i) =>
      definedAttributes({
        sideNumber: i + 1,
        participantId,
      }),
    );

    const matchUpId = matchUpIds[i] ?? getPrefixedId(i) ?? UUID();

    return {
      roundNumber: nextRoundNumber,
      matchUpStatus: TO_BE_PLAYED,
      matchUpId,
      sides,
    };
  });

  if (matchUps?.length) {
    const tieFormat = resolveTieFormat({ drawDefinition, event })?.tieFormat;

    if (tieFormat) {
      matchUps.forEach((matchUp) => {
        const { tieMatchUps } = generateTieMatchUps({
          tieFormat,
          matchUp,
          isMock,
        });
        Object.assign(matchUp, { tieMatchUps, matchUpType: TEAM });
      });
    }
  }

  return { roundNumber: nextRoundNumber, matchUpsCount: matchUps?.length ?? 0, matchUps, ...SUCCESS };
}
