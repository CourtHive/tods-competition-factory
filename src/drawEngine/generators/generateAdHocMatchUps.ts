import { allTournamentMatchUps } from '../../tournamentEngine/getters/matchUpsGetter/matchUpsGetter';
import { validMatchUps } from '../../matchUpEngine/governors/queryGovernor/validMatchUp';
import { getMatchUpId } from '../../global/functions/extractors';
import { generateRange, overlap, UUID } from '../../utilities';
import { mustBeAnArray } from '../../utilities/mustBeAnArray';
import { isConvertableInteger } from '../../utilities/math';
import { definedAttributes } from '../../utilities/objects';
import {
  addMatchUpsNotice,
  modifyDrawNotice,
} from '../notifications/drawNotifications';

import { STRUCTURE_SELECTED_STATUSES } from '../../constants/entryStatusConstants';
import { ROUND_OUTCOME } from '../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../constants/resultConstants';
import {
  INVALID_VALUES,
  INVALID_STRUCTURE,
  MISSING_DRAW_DEFINITION,
  MISSING_STRUCTURE_ID,
  STRUCTURE_NOT_FOUND,
  EXISTING_MATCHUP_ID,
  ErrorType,
} from '../../constants/errorConditionConstants';
import {
  DrawDefinition,
  EntryStatusEnum,
  MatchUp,
  MatchUpStatusEnum,
  Tournament,
} from '../../types/tournamentFromSchema';

type GenerateAdHocMatchUpsArgs = {
  participantIdPairings?: {
    participantIds: [string | undefined, string | undefined];
  }[];
  tournamentRecord?: Tournament;
  drawDefinition: DrawDefinition;
  addToStructure?: boolean; // optional - whether to add matchUps to structure once generated
  matchUpsCount?: number; // number of matchUps to be generated
  matchUpIds?: string[];
  roundNumber?: number;
  structureId?: string;
  newRound?: boolean; // optional - whether to auto-increment to the next roundNumber
};

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
}: GenerateAdHocMatchUpsArgs): {
  matchUpsCount?: number;
  matchUps?: MatchUp[];
  error?: ErrorType;
  info?: any;
} {
  if (typeof drawDefinition !== 'object')
    return { error: MISSING_DRAW_DEFINITION };

  if (!structureId && drawDefinition.structures?.length === 1)
    structureId = drawDefinition.structures?.[0]?.structureId;
  if (typeof structureId !== 'string') return { error: MISSING_STRUCTURE_ID };

  if (newRound && !matchUpsCount) {
    const selectedEntries =
      drawDefinition?.entries?.filter((entry) => {
        const entryStatus = entry.entryStatus as EntryStatusEnum;
        return STRUCTURE_SELECTED_STATUSES.includes(entryStatus);
      }) ?? [];

    matchUpsCount = Math.floor(selectedEntries?.length / 2) || 1;
  }

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
  const lastRoundNumber = existingMatchUps?.reduce(
    (roundNumber: number, matchUp: any) => {
      if (matchUp.roundPosition) structureHasRoundPositions = true;
      return (matchUp?.roundNumber || 0) > roundNumber
        ? matchUp.roundNumber
        : roundNumber;
    },
    1
  );

  // structure must not be a container of other structures
  // structure must not contain matchUps with roundPosition
  // structure must not determine finishingPosition by ROUND_OUTCOME
  if (
    structure?.structures ||
    structureHasRoundPositions ||
    structure?.finishingPosition === ROUND_OUTCOME
  ) {
    return { error: INVALID_STRUCTURE };
  }

  if (roundNumber && roundNumber - 1 > (lastRoundNumber || 0))
    return { error: INVALID_VALUES, info: 'roundNumber error' };

  const nextRoundNumber =
    roundNumber ??
    (newRound ? (lastRoundNumber ?? 0) + 1 : lastRoundNumber ?? 1);

  participantIdPairings =
    participantIdPairings ??
    generateRange(0, matchUpsCount).map(() => ({
      participantIds: [undefined, undefined],
    }));

  const matchUps = participantIdPairings?.map((pairing) => {
    const idStack = pairing?.participantIds ?? [undefined, undefined];
    // ensure there are always 2 sides in generated matchUps
    idStack.push(...[undefined, undefined]);
    const participantIds = idStack.slice(0, 2);
    const sides = participantIds.map((participantId, i) =>
      definedAttributes({
        sideNumber: i + 1,
        participantId,
      })
    );

    return {
      matchUpStatus: MatchUpStatusEnum.ToBePlayed,
      matchUpId: matchUpIds.pop() ?? UUID(),
      roundNumber: nextRoundNumber,
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

  if (!validMatchUps(matchUps))
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

  const existingMatchUpIds =
    allTournamentMatchUps({
      tournamentRecord,
      inContext: false,
    })?.matchUps?.map(getMatchUpId) ?? [];

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
