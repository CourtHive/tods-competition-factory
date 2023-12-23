import { positionActions as drawEnginePositionActions } from '../../../query/drawDefinition/positionActions/positionActions';
import { getParticipants } from '../../../query/participants/getParticipants';

import { MISSING_TOURNAMENT_RECORD } from '../../../constants/errorConditionConstants';
import { ResultType } from '../../../global/functions/decorateResult';
import { PolicyDefinitions } from '../../../types/factoryTypes';
import {
  DrawDefinition,
  Event,
  Tournament,
} from '../../../types/tournamentTypes';

type PositionActionsArgs = {
  restrictAdHocRoundParticipants?: boolean;
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

  const { participants: tournamentParticipants } = getParticipants({
    withIndividualParticipants: true,
    tournamentRecord,
  });
  return drawEnginePositionActions({
    tournamentParticipants,
    ...params,
  });
}
