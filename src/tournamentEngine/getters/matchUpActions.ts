import { matchUpActions as drawEngineMatchupActions } from '../../drawEngine/governors/queryGovernor/matchUpActions';
import { getPolicyDefinitions } from '../../global/functions/deducers/getAppliedPolicies';
import { allTournamentMatchUps } from './matchUpsGetter/matchUpsGetter';

import { POLICY_TYPE_POSITION_ACTIONS } from '../../constants/policyConstants';
import {
  DRAW_DEFINITION_NOT_FOUND,
  MISSING_TOURNAMENT_RECORD,
} from '../../constants/errorConditionConstants';
import {
  DrawDefinition,
  Event,
  Tournament,
} from '../../types/tournamentFromSchema';

type MatchUpActionsArgs = {
  drawDefinition?: DrawDefinition;
  tournamentRecord: Tournament;
  policyDefinitions?: any;
  participantId?: string;
  sideNumber?: number;
  matchUpId: string;
  drawId?: string;
  event?: Event;
};
export function matchUpActions({
  policyDefinitions,
  tournamentRecord,
  drawDefinition,
  participantId,
  sideNumber,
  matchUpId,
  drawId,
  event,
}: MatchUpActionsArgs) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!drawId) {
    // if matchUp did not have context, find drawId by brute force
    const { matchUps } = allTournamentMatchUps({ tournamentRecord });
    drawId = matchUps.reduce((drawId, candidate) => {
      return candidate.matchUpId === matchUpId ? candidate.drawId : drawId;
    }, undefined);
    const events = tournamentRecord.events || [];
    const drawDefinitions = events
      .map((event) => event.drawDefinitions || [])
      .flat();
    drawDefinition = drawDefinitions.reduce(
      (drawDefinition: any, candidate) => {
        return candidate.drawId === drawId ? candidate : drawDefinition;
      },
      undefined
    );
  }

  const { policyDefinitions: attachedPolicy } = getPolicyDefinitions({
    policyTypes: [POLICY_TYPE_POSITION_ACTIONS],
    tournamentRecord,
    drawDefinition,
    event,
  });

  policyDefinitions = policyDefinitions || attachedPolicy;

  if (drawDefinition) {
    return drawEngineMatchupActions({
      tournamentParticipants: tournamentRecord.participants,
      policyDefinitions,
      drawDefinition,
      participantId,
      sideNumber,
      matchUpId,
      event,
    });
  } else {
    return { error: DRAW_DEFINITION_NOT_FOUND };
  }
}
