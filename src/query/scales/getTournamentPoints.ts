import { getPolicyDefinitions } from '@Query/extensions/getAppliedPolicies';
import { getParticipants } from '@Query/participants/getParticipants';
import { getTargetElement } from '@Query/scales/getTargetElement';
import { getAwardProfile } from '@Query/scales/getAwardProfile';
import { getAwardPoints } from '@Query/scales/getAwardPoints';
import { unique } from '@Tools/arrays';

// constants and types
import { MISSING_POLICY_DEFINITION, MISSING_TOURNAMENT_RECORD } from '@Constants/errorConditionConstants';
import { ParticipantFilters, PolicyDefinitions } from '@Types/factoryTypes';
import { PAIR, TEAM_PARTICIPANT } from '@Constants/participantConstants';
import { POLICY_TYPE_RANKING_POINTS } from '@Constants/policyConstants';
import { QUALIFYING } from '@Constants/drawDefinitionConstants';
import { TEAM_EVENT } from '@Constants/eventConstants';
import { SUCCESS } from '@Constants/resultConstants';
import { Tournament } from '@Types/tournamentTypes';

type GetTournamentPointsArgs = {
  participantFilters?: ParticipantFilters;
  policyDefinitions?: PolicyDefinitions;
  tournamentRecord: Tournament;
  level?: number;
};
export function getTournamentPoints({
  participantFilters,
  policyDefinitions,
  tournamentRecord,
  level,
}: GetTournamentPointsArgs) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  const { policyDefinitions: attachedPolicies } = getPolicyDefinitions({
    policyTypes: [POLICY_TYPE_RANKING_POINTS],
    tournamentRecord,
  });

  const pointsPolicy =
    policyDefinitions?.[POLICY_TYPE_RANKING_POINTS] ?? attachedPolicies?.[POLICY_TYPE_RANKING_POINTS];
  if (!pointsPolicy) return { error: MISSING_POLICY_DEFINITION };

  const awardProfiles = pointsPolicy.awardProfiles;
  let requireWinFirstRound = pointsPolicy.requireWinFirstRound;
  const requireWinForPoints = pointsPolicy.requireWinForPoints;

  const { participants, derivedEventInfo, derivedDrawInfo, mappedMatchUps } = getParticipants({
    withRankingProfile: true,
    participantFilters,
    tournamentRecord,
  });

  const participantsWithOutcomes = participants?.filter((p) => p.draws?.length);

  // keep track of points earned per person / per team
  const personPoints = {};
  const teamPoints = {};
  const pairPoints = {};

  for (const participant of participantsWithOutcomes ?? []) {
    const { participantType, participantId, person, draws } = participant;

    for (const draw of draws) {
      const { drawId, structureParticipation, eventId } = draw;
      const eventInfo = derivedEventInfo[eventId];
      const drawInfo = derivedDrawInfo[drawId];
      const drawType = drawInfo?.drawType;

      const { category, eventType } = eventInfo || {};
      const startDate = draw.startDate || eventInfo.startDate || tournamentRecord.startDate;
      const endDate = draw.endDate || eventInfo.endDate || tournamentRecord.endDate;

      // don't process INDIVIDUAL and PAIR participants in TEAM events
      // They are processed in the context of the TEAM in which they appear
      if (eventType === TEAM_EVENT && participantId !== TEAM_PARTICIPANT) {
        continue;
      }

      let points;

      if (awardProfiles) {
        let requireWin = requireWinForPoints;
        let totalWinsCount = 0;
        let positionPoints = 0;
        let perWinPoints = 0;
        let rangeAccessor;

        for (const participation of structureParticipation) {
          const { finishingPositionRange, participationOrder, participantWon, flightNumber, rankingStage, winCount } =
            participation;

          totalWinsCount += winCount || 0;

          const drawSize = drawInfo?.drawSize;

          const { awardProfile } = getAwardProfile({
            awardProfiles,
            participation,
            eventType,
            startDate,
            category,
            drawSize,
            drawType,
            endDate,
            level,
          });

          if (awardProfile) {
            // NOTE: for now drawSize: 0 indicates qualifying structure with no MAIN structure
            // TODO: support for qualifying stage awardProfiles
            if (!drawSize) continue;

            const accessor = Array.isArray(finishingPositionRange) && Math.max(...finishingPositionRange);
            const dashRange = unique(finishingPositionRange || []).join('-');

            const firstRound = accessor && rankingStage !== QUALIFYING && finishingPositionRange?.includes(drawSize);

            if (awardProfile.requireWinForPoints !== undefined) requireWin = awardProfile.requireWinForPoints;
            if (awardProfile.requireWinFirstRound !== undefined)
              requireWinFirstRound = awardProfile.requireWinFirstRound;

            const {
              finishingPositionPoints = {},
              finishingPositionRanges,
              finishingRound,
              pointsPerWin,
              flights,
            } = awardProfile;

            const ppwProfile = Array.isArray(awardProfile.perWinPoints)
              ? awardProfile.perWinPoints?.find((pwp) => pwp.participationOrders?.includes(participationOrder))
              : awardProfile.perWinPoints;

            const participationOrders = finishingPositionPoints.participationOrders;

            let awardPoints = 0;
            let winRequired;

            const isValidOrder = !participationOrders || participationOrders.includes(participationOrder);

            if (isValidOrder && finishingPositionRanges && accessor) {
              const valueObj = finishingPositionRanges[accessor];
              if (valueObj) {
                ({ awardPoints, requireWin: winRequired } = getAwardPoints({
                  flightNumber,
                  valueObj,
                  drawSize,
                  flights,
                  level,
                }));
              }
            }

            if (!awardPoints && finishingRound && participationOrder === 1 && accessor) {
              const valueObj = finishingRound[accessor];
              if (valueObj) {
                ({ awardPoints, requireWin: winRequired } = getAwardPoints({
                  participantWon,
                  flightNumber,
                  valueObj,
                  drawSize,
                  flights,
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

          if (participantType === TEAM_PARTICIPANT) {
            const teamStructureMatchUps = (participant.matchUps || []).filter(
              ({ structureId }) => structureId === participation.structureId,
            );
            for (const { matchUpId } of teamStructureMatchUps) {
              const matchUp = mappedMatchUps[matchUpId];
              const sideNumber = matchUp.sides.find((side) => side.participantId === participantId).sideNumber;

              // for now only supporting line position awards per team win
              if (matchUp.winningSice !== sideNumber) {
                continue;
              }

              for (const tieMatchUp of matchUp.tieMatchUps) {
                // ingore matchUps with no winningSide
                if (!tieMatchUp.winningSide) continue;
              }
            }
          }
        }

        if (perWinPoints || positionPoints) {
          const award = {
            winCount: totalWinsCount,
            positionPoints,
            rangeAccessor,
            perWinPoints,
            eventType,
            drawId,
            points,
          };

          const personId = person?.personId;
          if (personId) {
            if (!personPoints[personId]) personPoints[personId] = [];
            personPoints[personId].push(award);
          } else if (participantType === PAIR) {
            if (!pairPoints[participantId]) pairPoints[participantId] = [];
            pairPoints[participantId].push(award);
          } else if (participantType === TEAM_PARTICIPANT) {
            if (!teamPoints[participantId]) teamPoints[participantId] = [];
            teamPoints[participantId].push(award);
          }
        }
      }
    }
  }

  return {
    participantsWithOutcomes,
    personPoints,
    pairPoints,
    teamPoints,
    ...SUCCESS,
  };
}
