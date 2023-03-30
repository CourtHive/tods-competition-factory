import { getParticipants } from '../../../tournamentEngine/getters/participants/getParticipants';
import { getPolicyDefinitions } from '../../../global/functions/deducers/getAppliedPolicies';
import { addExtension } from '../../../global/functions/producers/addExtension';
import { isConvertableInteger } from '../../../utilities/math';
import { unique } from '../../../utilities';

import { POLICY_TYPE_RANKING_POINTS } from '../../../constants/policyConstants';
import { RANKING_POINTS } from '../../../constants/extensionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_POLICY_DEFINITION,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

export function getAwardProfile({
  participation = {},
  awardProfiles,
  eventType,
  drawType,
}) {
  const { participationOrder, flightNumber, rankingStage } = participation;

  const awardProfile = awardProfiles.find(
    (profile) =>
      (!profile.stages?.length || profile.stages.includes(rankingStage)) &&
      (!profile.drawTypes?.length || profile.drawTypes?.includes(drawType)) &&
      (!profile.eventTypes?.length ||
        profile.eventTypes?.includes(eventType)) &&
      (!profile.participationOrder ||
        profile.participationOrder === participationOrder) &&
      (!flightNumber ||
        !profile.flights?.flightNumbers?.length ||
        profile.flights.flightNumbers.includes(flightNumber))
  );

  return { awardProfile };
}

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
      const awardProfiles =
        pointsPolicy.categories?.[category].awardProfiles ||
        pointsPolicy.awardProfiles;
      let requireWinFirstRound =
        pointsPolicy.categories?.[category].requireWinFirstRound ||
        pointsPolicy.requireWinFirstRound;
      let requireWinDefault =
        pointsPolicy.categories?.[category].requireWinDefault ||
        pointsPolicy.requireWinDefault;

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
            drawType,
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

            const ppwProfile = awardProfile.perWinPoints?.find((pwp) =>
              pwp.participationOrders?.includes(participationOrder)
            );

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
              if (level && ppwProfile.level?.[level]) {
                const levelValue = ppwProfile.level[level];
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

function getAwardPoints({ valueObj, drawSize, level, participantWon }) {
  const getValue = (obj) => {
    const value = obj?.value || (isConvertableInteger(obj) ? obj : 0);
    return level && obj?.level ? obj.level[level] || value : value;
  };

  let awardPoints = 0;
  let requireWin;
  let s, t, d;

  const winAccessor =
    (participantWon && 'won') ||
    (participantWon === false && 'lost') ||
    undefined;

  if (Array.isArray(valueObj)) {
    let sizeDefined = valueObj.find(
      (obj) => obj.drawSize === drawSize || obj.drawSizes?.includes(drawSize)
    );

    // threshold attribute allows a definition for e.g. drawSize: 16 to apply to all LARGER drawSizes
    let thresholdMatched = valueObj.find(
      (obj) => obj.drawSize && obj.threshold && drawSize > obj.drawSize
    );
    // a default definition can be provided which has no drawSize or drawSizes
    let defaultDef = valueObj.find(
      (obj) => !obj.drawSize && !obj.drawSizes?.length
    );

    if (winAccessor !== undefined) {
      sizeDefined = sizeDefined?.[winAccessor];
      thresholdMatched = thresholdMatched?.[winAccessor];
      defaultDef = defaultDef?.[winAccessor];
    }
    s = getValue(sizeDefined);
    t = getValue(thresholdMatched);
    d = getValue(defaultDef);
    awardPoints = s || t || d;

    requireWin =
      (s && sizeDefined.requireWin) ||
      (t && thresholdMatched.requireWin) ||
      defaultDef?.requireWin;
  } else if (typeof valueObj === 'object') {
    let sizeDefined = valueObj?.drawSizes?.[drawSize];
    let defaultDef = valueObj;
    if (winAccessor !== undefined) {
      sizeDefined = sizeDefined?.[winAccessor];
      defaultDef = defaultDef?.[winAccessor];
    }
    s = getValue(sizeDefined);
    d = getValue(defaultDef);
    awardPoints = s || d;

    requireWin = s ? sizeDefined.requireWin : defaultDef?.requireWin;
  } else if (isConvertableInteger(valueObj)) {
    // when using participantWon non-objects are not valid
    if (winAccessor === undefined) awardPoints = valueObj;
  }

  return { awardPoints, requireWin };
}
