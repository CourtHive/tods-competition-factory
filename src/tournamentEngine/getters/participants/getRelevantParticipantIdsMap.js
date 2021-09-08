import { MISSING_TOURNAMENT_RECORD } from '../../../constants/errorConditionConstants';
import { INDIVIDUAL } from '../../../constants/participantConstants';

/**
 * @param {object} tournamentRecord - optional - either tournamentRecord or tournamentRecords must be provided
 * @param {object} tournamentRecords - optional - either tournamentRecord or tournamentRecords must be provided
 * @param {function} processParticipantId - optional - function which is called for each participantId
 * @returns { [participantId]: [relevantParticipantId] } - a map of all PAIR/TEAM/GROUP participantIds to which participantId belongs
 */
export function getRelevantParticipantIdsMap({
  tournamentRecord,
  tournamentRecords,
  processParticipantId, // optional method which is passed each participantId
}) {
  if (
    typeof tournamentRecord !== 'object' &&
    typeof tournamentRecords !== 'object'
  )
    return { error: MISSING_TOURNAMENT_RECORD };

  // build up a mapping of all participantIds to all of the individualParticipantIds that they reference
  // this map includes the key participantId as a value of the array of relevantParticipantIds
  const allParticipants = tournamentRecords
    ? Object.values(tournamentRecords)
        .map(({ participants = [] }) => participants)
        .flat()
    : tournamentRecord.participants || [];

  const relevantParticipantIdsMap = Object.assign(
    {},
    ...allParticipants.map(
      ({ participantId, participantType, individualParticipantIds }) => {
        typeof processParticipantId === 'function' &&
          processParticipantId(participantId);
        const individualParticipantIdObjects = (
          individualParticipantIds || []
        ).map((relevantParticipantId) => ({
          relevantParticipantId,
          participantType: INDIVIDUAL,
        }));
        return {
          [participantId]: individualParticipantIdObjects.concat({
            relevantParticipantId: participantId,
            participantType,
          }),
        };
      }
    )
  );

  return { relevantParticipantIdsMap };
}
