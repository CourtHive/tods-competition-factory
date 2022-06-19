import { getTournamentParticipants } from '../../../tournamentEngine/getters/participants/getTournamentParticipants';
import { getPolicyDefinitions } from '../../../global/functions/deducers/getAppliedPolicies';
import { unique } from '../../../utilities';

import { POLICY_TYPE_RANKING_POINTS } from '../../../constants/policyConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_POLICY_DEFINITION,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

export function getTournamentPoints({ tournamentRecord, policyDefinition }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  const { policyDefinitions: attachedPolicies } = getPolicyDefinitions({
    policyTypes: [POLICY_TYPE_RANKING_POINTS],
    tournamentRecord,
  });

  const pointsPolicy =
    policyDefinition?.[POLICY_TYPE_RANKING_POINTS] ||
    attachedPolicies?.[POLICY_TYPE_RANKING_POINTS];
  if (!pointsPolicy) return { error: MISSING_POLICY_DEFINITION };

  const { tournamentParticipants } = getTournamentParticipants({
    tournamentRecord,
    withDraws: true,
  });

  const participantsWithOutcomes = tournamentParticipants.filter(
    (p) => p.draws?.length
  );

  // keep track of points earned per person
  const personPoints = {};

  for (const participant of participantsWithOutcomes) {
    const { events, draws, person, individualParticipants } = participant;
    const personId = person?.personId;
    if (individualParticipants) console.log('individualParticipants');

    draws.forEach((draw) => {
      const { drawSize, eventId, finishingPositionRange, drawName } = draw;
      const rangeAccessor = unique(finishingPositionRange).join('-');
      const event = events?.find((event) => event.eventId === eventId);
      const { category, eventType } = event || {};

      const finishingPositionRanges =
        pointsPolicy.categories?.[category]?.finishingPositionRanges ||
        pointsPolicy.finishingPositionRanges;

      const valueObj = finishingPositionRanges?.[rangeAccessor];
      const points =
        valueObj?.value || valueObj?.drawSizes?.[drawSize]?.value || valueObj;

      if (personId && valueObj) {
        if (!personPoints[personId]) personPoints[personId] = [];
        personPoints[personId].push({
          drawName,
          eventType,
          rangeAccessor,
          points,
        });
      }
    });
  }

  return { personPoints, ...SUCCESS };
}
