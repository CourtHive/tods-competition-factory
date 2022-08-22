import { getTournamentParticipants } from '../../../tournamentEngine/getters/participants/getTournamentParticipants';
import { getPolicyDefinitions } from '../../../global/functions/deducers/getAppliedPolicies';
import { isConvertableInteger } from '../../../utilities/math';
import { unique } from '../../../utilities';

import { POLICY_TYPE_RANKING_POINTS } from '../../../constants/policyConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_POLICY_DEFINITION,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

export function getTournamentPoints({
  policyDefinition,
  tournamentRecord,
  level,
}) {
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
    withRankingProfile: true,
    tournamentRecord,
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
      const { structureParticipation, drawName, drawSize, drawType, eventId } =
        draw;
      const event = events?.find((event) => event.eventId === eventId);
      const { category, eventType } = event || {};

      const awardProfiles =
        pointsPolicy.categories?.[category].awardProfiles ||
        pointsPolicy.awardProfiles;

      let points;

      if (awardProfiles) {
        let totalWinsCount = 0;
        let positionPoints = 0;
        let perWinPoints = 0;
        let rangeAccessor;

        for (const participation of structureParticipation) {
          const {
            finishingPositionRange,
            participationOrder,
            participantWon,
            flightNumber,
            rankingStage,
            winCount,
          } = participation;

          totalWinsCount += winCount || 0;

          const awardProfile = awardProfiles.find(
            (profile) =>
              profile.stages.includes(rankingStage) &&
              (!profile.drawTypes?.length ||
                profile.drawTypes?.includes(drawType)) &&
              (!profile.eventTypes?.length ||
                profile.eventTypes?.includes(eventType)) &&
              (!profile.participationOrder ||
                profile.participationOrder === participationOrder) &&
              (!profile.flightNumbers?.length ||
                profile.flightNumbers.includes(flightNumber))
          );

          if (awardProfile) {
            const accessor =
              finishingPositionRange &&
              unique(finishingPositionRange).join('-');

            const { finishingPositionRanges, finishingRound, pointsPerWin } =
              awardProfile;

            let awardPoints = 0;

            if (finishingPositionRanges) {
              const valueObj = finishingPositionRanges[accessor];
              if (valueObj) {
                awardPoints = getAwardPoints({ valueObj, drawSize, level });
              }
            }

            if (!awardPoints && finishingRound) {
              const valueObj = finishingRound[accessor];
              if (valueObj) {
                awardPoints = getAwardPoints({
                  participantWon,
                  valueObj,
                  drawSize,
                  level,
                });
              }
            }

            if (awardPoints > positionPoints) {
              positionPoints = awardPoints;
              rangeAccessor = accessor;
            }

            if (!awardPoints && pointsPerWin && winCount) {
              perWinPoints += winCount * pointsPerWin;
            }
          }

          points = positionPoints + perWinPoints;
        }

        if (personId && (perWinPoints || positionPoints)) {
          if (!personPoints[personId]) personPoints[personId] = [];
          personPoints[personId].push({
            winCount: totalWinsCount,
            positionPoints,
            rangeAccessor,
            perWinPoints,
            eventType,
            drawName,
            points,
          });
        }
      }
    });
  }

  return { personPoints, ...SUCCESS };
}

function getAwardPoints({ valueObj, drawSize, level, participantWon }) {
  const getValue = (obj) => {
    const value = obj?.value || (isConvertableInteger(obj) ? obj : 0);
    return level && obj?.level ? obj.level[level] || value : value;
  };

  const winAccessor = participantWon
    ? 'won'
    : participantWon === false
    ? 'lost'
    : undefined;

  if (Array.isArray(valueObj)) {
    const sizeDefined = valueObj.find(
      (obj) => obj.drawSize === drawSize || obj.drawSizes?.includes(drawSize)
    );
    const thresholdMatched = valueObj.find(
      (obj) => obj.drawSize && obj.threshold && drawSize > obj.drawSize
    );
    const defaultDef = valueObj.find(
      (obj) => !obj.drawSize && !obj.drawSizes?.length
    );

    if (winAccessor !== undefined) {
      return (
        sizeDefined?.[winAccessor] ||
        thresholdMatched?.[winAccessor] ||
        defaultDef?.[winAccessor]
      );
    } else {
      return (
        getValue(sizeDefined) ||
        getValue(thresholdMatched) ||
        getValue(defaultDef)
      );
    }
  } else if (typeof valueObj === 'object') {
    if (winAccessor !== undefined) {
      const foo =
        getValue(valueObj?.drawSizes?.[drawSize]?.[winAccessor]) ||
        getValue(valueObj?.[winAccessor]);
      return foo;
    } else {
      return getValue(valueObj?.drawSizes?.[drawSize]) || getValue(valueObj);
    }
  } else if (isConvertableInteger(valueObj)) {
    // when using participantWon non-objects are not valid
    if (winAccessor !== undefined) return 0;
    return valueObj;
  }
}
