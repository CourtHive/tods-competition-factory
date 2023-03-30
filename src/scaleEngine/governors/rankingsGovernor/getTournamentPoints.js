import { getParticipants } from '../../../tournamentEngine/getters/participants/getParticipants';
import { getPolicyDefinitions } from '../../../global/functions/deducers/getAppliedPolicies';
import { addExtension } from '../../../global/functions/producers/addExtension';
import { getTargetElement } from './getTargetElement';
import { getAwardProfile } from './getAwardProfile';
import { getAwardPoints } from './getAwardPoints';
import { unique } from '../../../utilities';

import { POLICY_TYPE_RANKING_POINTS } from '../../../constants/policyConstants';
import { RANKING_POINTS } from '../../../constants/extensionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_POLICY_DEFINITION,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

export function getTournamentPoints({
  policyDefinitions,
  tournamentRecord,
  saveSnapshot,
  level,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  const { policyDefinitions: attachedPolicies } = getPolicyDefinitions({
    policyTypes: [POLICY_TYPE_RANKING_POINTS],
    tournamentRecord,
  });

  const pointsPolicy =
    policyDefinitions?.[POLICY_TYPE_RANKING_POINTS] ||
    attachedPolicies?.[POLICY_TYPE_RANKING_POINTS];
  if (!pointsPolicy) return { error: MISSING_POLICY_DEFINITION };

  const { participants, derivedEventInfo, derivedDrawInfo } = getParticipants({
    withRankingProfile: true,
    tournamentRecord,
  });

  const participantsWithOutcomes = participants.filter((p) => p.draws?.length);

  // keep track of points earned per person
  const personPoints = {};

  for (const participant of participantsWithOutcomes) {
    const { draws, person, individualParticipants } = participant;
    const personId = person?.personId;
    if (individualParticipants) console.log('individualParticipants');

    draws.forEach((draw) => {
      const { drawId, structureParticipation, eventId } = draw;
      const eventInfo = derivedEventInfo[eventId];
      const drawInfo = derivedDrawInfo[drawId];
      const drawType = drawInfo?.drawType;
      const drawSize = drawInfo?.drawSize;

      const { category, eventType } = eventInfo || {};
      const awardProfiles = pointsPolicy.awardProfiles;
      let requireWinFirstRound = pointsPolicy.requireWinFirstRound;
      let requireWinDefault = pointsPolicy.requireWinDefault;

      let points;

      if (awardProfiles) {
        let requireWin = requireWinDefault;
        // const positionAwards = []; // potential use for combining ppw w/ fpp
        let totalWinsCount = 0;
        let positionPoints = 0;
        let perWinPoints = 0;
        let rangeAccessor;

        for (const participation of structureParticipation) {
          const {
            finishingPositionRange,
            participationOrder,
            participantWon,
            winCount,
          } = participation;

          totalWinsCount += winCount || 0;

          const { awardProfile } = getAwardProfile({
            awardProfiles,
            participation,
            eventType,
            category,
            drawSize,
            drawType,
            level,
          });

          if (awardProfile) {
            const accessor =
              Array.isArray(finishingPositionRange) &&
              Math.max(...finishingPositionRange);
            const dashRange = unique(finishingPositionRange).join('-');
            const firstRound =
              accessor && finishingPositionRange?.includes(drawSize);
            if (awardProfile.requireWinDefault !== undefined)
              requireWin = awardProfile.requireWinDefault;
            if (awardProfile.requireWinFirstRound !== undefined)
              requireWinFirstRound = awardProfile.requireWinFirstRound;

            const {
              finishingPositionPoints = {},
              finishingPositionRanges,
              finishingRound,
              pointsPerWin,
            } = awardProfile;

            const ppwProfile = Array.isArray(awardProfile.perWinPoints)
              ? awardProfile.perWinPoints?.find((pwp) =>
                  pwp.participationOrders?.includes(participationOrder)
                )
              : awardProfile.perWinPoints;

            const participationOrders =
              finishingPositionPoints.participationOrders;

            let awardPoints = 0;
            let winRequired;

            // const noPositionAwards = !positionAwards.length;

            const isValidOrder =
              !participationOrders ||
              participationOrders.includes(participationOrder);

            if (isValidOrder && finishingPositionRanges) {
              const valueObj = finishingPositionRanges[accessor];
              if (valueObj) {
                // positionAwards.push(accessor);
                ({ awardPoints, requireWin: winRequired } = getAwardPoints({
                  valueObj,
                  drawSize,
                  level,
                }));
              }
            }

            if (!awardPoints && finishingRound && participationOrder === 1) {
              const valueObj = finishingRound[accessor];
              if (valueObj) {
                // positionAwards.push(accessor);
                ({ awardPoints, requireWin: winRequired } = getAwardPoints({
                  participantWon,
                  valueObj,
                  drawSize,
                  level,
                }));
              }
            }

            if (firstRound && requireWinFirstRound !== undefined) {
              requireWin = requireWinFirstRound;
            }
            if (winRequired !== undefined) requireWin = winRequired;

            if (awardPoints > positionPoints && (!requireWin || winCount)) {
              positionPoints = awardPoints;
              rangeAccessor = accessor;
            }

            if (!awardPoints && pointsPerWin && winCount) {
              perWinPoints += winCount * pointsPerWin;
              rangeAccessor = dashRange;
            }

            if (!awardPoints && winCount && ppwProfile) {
              const levelValue = getTargetElement(level, ppwProfile?.level);
              if (levelValue) {
                perWinPoints += winCount * levelValue;
              } else if (ppwProfile.value) {
                perWinPoints += winCount * ppwProfile.value;
              }
            }
          }

          points = positionPoints + perWinPoints;
        }

        if (personId && (perWinPoints || positionPoints)) {
          if (!personPoints[personId]) personPoints[personId] = [];
          const award = {
            winCount: totalWinsCount,
            positionPoints,
            rangeAccessor,
            perWinPoints,
            eventType,
            drawId,
            points,
          };
          personPoints[personId].push(award);
        }
      }
    });
  }

  if (saveSnapshot) {
    const extension = {
      name: RANKING_POINTS,
      value: personPoints,
    };
    addExtension({ element: tournamentRecord, extension });
  }

  return { participantsWithOutcomes, personPoints, ...SUCCESS };
}
