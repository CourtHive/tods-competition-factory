import { addMatchUpsNotice, modifyDrawNotice } from '../notifications/drawNotifications';
import { allTournamentMatchUps } from '../../query/matchUps/getAllTournamentMatchUps';
import { getMatchUpId } from '../../functions/global/extractors';
import { validMatchUps } from '../../validators/validMatchUp';
import { mustBeAnArray } from '../../tools/mustBeAnArray';
import { overlap } from '../../tools/arrays';

import { ROUND_OUTCOME } from '../../constants/drawDefinitionConstants';
import { ResultType } from '../../functions/global/decorateResult';
import { SUCCESS } from '../../constants/resultConstants';
import {
  INVALID_VALUES,
  INVALID_STRUCTURE,
  MISSING_DRAW_DEFINITION,
  MISSING_STRUCTURE_ID,
  STRUCTURE_NOT_FOUND,
  EXISTING_MATCHUP_ID,
} from '../../constants/errorConditionConstants';

type AddAdHocMatchUpsParams = {
  suppressNotifications?: boolean; // internal - avoid duplicate notifications from mocksEngine
  tournamentRecord: any;
  structureId?: string;
  drawDefinition: any;
  matchUps: any[];
  event: any;
};

export function addAdHocMatchUps(params: AddAdHocMatchUpsParams): ResultType {
  const { suppressNotifications, tournamentRecord, drawDefinition, matchUps, event } = params;
  if (typeof drawDefinition !== 'object') return { error: MISSING_DRAW_DEFINITION };

  let structureId = params?.structureId;
  if (!structureId && drawDefinition.structures?.length === 1)
    structureId = drawDefinition.structures?.[0]?.structureId;

  if (typeof structureId !== 'string') return { error: MISSING_STRUCTURE_ID };

  if (!validMatchUps(matchUps)) return { error: INVALID_VALUES, info: mustBeAnArray('matchUps') };

  const structure = drawDefinition.structures?.find((structure) => structure.structureId === structureId);
  if (!structure) return { error: STRUCTURE_NOT_FOUND };

  const existingMatchUps = structure?.matchUps;
  const structureHasRoundPositions = existingMatchUps.find((matchUp) => !!matchUp.roundPosition);

  if (structure.structures || structureHasRoundPositions || structure.finishingPosition === ROUND_OUTCOME) {
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

  const tieMatchUps = matchUps
    .map(({ tieMatchUps }) => tieMatchUps)
    .filter(Boolean)
    .flat();

  if (!suppressNotifications) {
    addMatchUpsNotice({
      tournamentId: tournamentRecord?.tournamentId,
      matchUps: [...tieMatchUps, ...matchUps],
      eventId: event?.eventId,
      drawDefinition,
    });
    modifyDrawNotice({ drawDefinition, structureIds: [structureId] });
  }

  return { ...SUCCESS };
}
