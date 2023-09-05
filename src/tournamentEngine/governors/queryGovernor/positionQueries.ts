import { positionActions as drawEnginePositionActions } from '../../../drawEngine/governors/queryGovernor/positionActions/positionActions';
import { getTournamentParticipants } from '../../getters/participants/getTournamentParticipants';

import { MISSING_TOURNAMENT_RECORD } from '../../../constants/errorConditionConstants';
import { ResultType } from '../../../global/functions/decorateResult';
import { PolicyDefinitions } from '../../../types/factoryTypes';
import {
  DrawDefinition,
  Event,
  Tournament,
} from '../../../types/tournamentFromSchema';

type PositionActionsArgs = {
  policyDefinitions?: PolicyDefinitions;
  provisionalPositioning?: boolean;
  returnParticipants?: boolean;
  tournamentRecord: Tournament;
  drawDefinition: DrawDefinition;
  drawPosition: number;
  structureId: string;
  matchUpId?: string;
  event?: Event;
};

export function positionActions(params: PositionActionsArgs): ResultType & {
  isActiveDrawPosition?: boolean;
  hasPositionAssigned?: boolean;
  isDrawPosition?: boolean;
  isByePosition?: boolean;
  validActions?: any[];
} {
  const { tournamentRecord } = params;
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  const { tournamentParticipants } = getTournamentParticipants({
    tournamentRecord,
    inContext: true,
  });
  return drawEnginePositionActions({
    tournamentParticipants,
    ...params,
  });
}
