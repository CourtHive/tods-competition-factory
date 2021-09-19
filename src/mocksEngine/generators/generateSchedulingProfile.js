import { addSchedulingProfileRound } from '../../competitionEngine/governors/scheduleGovernor/schedulingProfile/schedulingProfile';
import { getContainedStructures } from '../../tournamentEngine/governors/tournamentGovernor/getContainedStructures';
import { allTournamentMatchUps } from '../../tournamentEngine/getters/matchUpsGetter';
import { intersection } from '../../utilities';

import { INVALID_VALUES } from '../../constants/errorConditionConstants';

export function generateSchedulingProfile({
  tournamentRecord,
  schedulingProfile,
}) {
  if (typeof schedulingProfile !== 'object') return { error: INVALID_VALUES };

  const containedStructureIds = getContainedStructures(tournamentRecord);
  const { matchUps } = allTournamentMatchUps({ tournamentRecord });

  const { tournamentId } = tournamentRecord;
  const scheduledRounds = [];

  for (const dateProfile of schedulingProfile) {
    const { scheduleDate, venues } = dateProfile;

    for (const venue of venues) {
      const { rounds, venueId } = venue;

      for (const round of rounds) {
        const { drawId, winnerFinishingPositionRange } = round;

        const targetMatchUps = matchUps.filter((matchUp) => {
          const targetRange =
            winnerFinishingPositionRange?.indexOf('-') > 0 &&
            winnerFinishingPositionRange.split('-').map((x) => +x);
          const range = matchUp.finishingPositionRange?.winner;

          const target =
            matchUp.drawId === drawId &&
            (!round.roundNumber || matchUp.roundNumber === round.roundNumber) &&
            (!range ||
              !targetRange ||
              intersection(range, targetRange).length === 2);

          return target;
        });

        const targetMatchUp = targetMatchUps[0];

        if (targetMatchUp) {
          const { eventId, roundNumber, drawName, structureName, roundName } =
            targetMatchUp;
          let structureId = targetMatchUp.structureId;

          if (roundNumber && !winnerFinishingPositionRange) {
            structureId = Object.keys(containedStructureIds).find(
              (containingStructureId) =>
                containedStructureIds[containingStructureId].includes(
                  structureId
                )
            );
          }

          const roundToSchedule = {
            tournamentId,
            eventId,
            drawId,
            structureId,
            roundNumber,
          };

          let result = addSchedulingProfileRound({
            tournamentRecords: { [tournamentId]: tournamentRecord },
            scheduleDate,
            venueId,
            round: roundToSchedule,
          });
          if (result.success) {
            scheduledRounds.push({
              drawName,
              structureName,
              roundName,
              ...roundToSchedule,
            });
          }
        }
      }
    }
  }

  return { scheduledRounds };
}
