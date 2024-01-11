import { allTournamentMatchUps } from '../../query/matchUps/getAllTournamentMatchUps';
import { getMatchUpId } from '../../global/functions/extractors';
import { mustBeAnArray } from '../../utilities/mustBeAnArray';
import { validMatchUps } from '../../validators/validMatchUp';
import { overlap } from '../../utilities/arrays';
import {
  addMatchUpsNotice,
  modifyDrawNotice,
} from '../notifications/drawNotifications';

import { ROUND_OUTCOME } from '../../constants/drawDefinitionConstants';
import { ResultType } from '../../global/functions/decorateResult';
import { SUCCESS } from '../../constants/resultConstants';
import {
  INVALID_VALUES,
  INVALID_STRUCTURE,
  MISSING_DRAW_DEFINITION,
  MISSING_STRUCTURE_ID,
  STRUCTURE_NOT_FOUND,
  EXISTING_MATCHUP_ID,
} from '../../constants/errorConditionConstants';

export function addAdHocMatchUps({
  tournamentRecord,
  drawDefinition,
  structureId,
  matchUps,
}): ResultType {
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
