import { addSchedulingProfileRound } from '../../competitionEngine/governors/scheduleGovernor/schedulingProfile/schedulingProfile';
import { getContainedStructures } from '../../tournamentEngine/governors/tournamentGovernor/getContainedStructures';
import { allTournamentMatchUps } from '../../tournamentEngine/getters/matchUpsGetter';
import { intersection, unique } from '../../utilities';

import { INVALID_VALUES } from '../../constants/errorConditionConstants';

export function generateSchedulingProfile({
  schedulingProfile,
  tournamentRecord,
}) {
  if (typeof schedulingProfile !== 'object') return { error: INVALID_VALUES };

  const containedStructures = getContainedStructures({
    tournamentRecord,
  }).containedStructures;
  const { matchUps } = allTournamentMatchUps({ tournamentRecord });

  const { tournamentId } = tournamentRecord;
  const scheduledRounds = [];

  for (const dateProfile of schedulingProfile) {
    const { scheduleDate, venues = [] } = dateProfile;

    for (const venue of venues) {
      const { rounds, venueId } = venue;

      for (const round of rounds) {
        const { drawId, winnerFinishingPositionRange, roundSegment } = round;

        const targetMatchUps = matchUps.filter((matchUp) => {
          const targetRange =
            winnerFinishingPositionRange?.indexOf('-') > 0 &&
            winnerFinishingPositionRange.split('-').map((x) => +x);
          const range = matchUp.finishingPositionRange?.winner;

          return (
            matchUp.drawId === drawId &&
            (!round.roundNumber || matchUp.roundNumber === round.roundNumber) &&
            (!range ||
              !targetRange ||
              intersection(range, targetRange).length === 2 ||
              (unique(range).length === unique(targetRange).length &&
                intersection(range, targetRange).length ===
                  unique(range).length))
          );
        });

        const targetMatchUp = targetMatchUps[0];

        if (targetMatchUp) {
          const { eventId, roundNumber, drawName, structureName, roundName } =
            targetMatchUp;
          let structureId = targetMatchUp.structureId;

          if (roundNumber && !winnerFinishingPositionRange) {
            structureId =
              Object.keys(containedStructures).find((containingStructureId) =>
                containedStructures[containingStructureId].includes(structureId)
              ) || structureId;
          }

          const roundToSchedule = {
            tournamentId,
            structureId,
            roundNumber,
            roundSegment,
            eventId,
            drawId,
          };

          let result = addSchedulingProfileRound({
            tournamentRecords: { [tournamentId]: tournamentRecord },
            round: roundToSchedule,
            scheduleDate,
            venueId,
          });
          if (result.error) return result;

          scheduledRounds.push({
            structureName,
            roundName,
            drawName,
            ...roundToSchedule,
          });
        }
      }
    }
  }

  return { scheduledRounds };
}
