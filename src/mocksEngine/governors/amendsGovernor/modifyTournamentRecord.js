import { generateFlightDrawDefinitions } from '../../generators/generateFlightDrawDefinitions';
import { addTournamentParticipants } from '../../generators/addTournamentParticipants';
import { generateEventParticipants } from '../../generators/generateEventParticipants';
import { getStageParticipantsCount } from '../../getters/getStageParticipantsCount';
import { getStageParticipants } from '../../getters/getStageParticipants';
import { generateFlights } from '../../generators/generateFlights';

import { INDIVIDUAL, PAIR } from '../../../constants/participantConstants';
import { DOUBLES, SINGLES } from '../../../constants/eventConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  EVENT_NOT_FOUND,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

export function modifyTournamentRecord({
  matchUpStatusProfile,
  completeAllMatchUps,
  participantsProfile,
  autoEntryPositions,
  randomWinningSide,
  tournamentRecord,
  eventProfiles,
  uuids,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  const allUniqueParticipantIds = [];
  const drawIds = [];

  eventProfiles?.forEach((eventProfile) => {
    const event = tournamentRecord.events.find(
      (event, index) =>
        (eventProfile.eventIndex !== undefined &&
          index === eventProfile.eventIndex) ||
        (eventProfile.eventName &&
          event.eventName === eventProfile.eventName) ||
        (eventProfile.eventId && event.eventId === eventProfile.eventId)
    );

    if (event?.gender) {
      eventProfile.gender = event.gender;
    }
  });

  const result = addTournamentParticipants({
    startDate: tournamentRecord.startDate,
    participantsProfile,
    tournamentRecord,
    eventProfiles,
    // drawProfiles,
    uuids,
  });
  if (!result.success) return result;

  if (eventProfiles) {
    for (const eventProfile of eventProfiles) {
      let { ratingsParameters } = eventProfile;

      const event = tournamentRecord.events.find(
        (event, index) =>
          (eventProfile.eventIndex !== undefined &&
            index === eventProfile.eventIndex) ||
          (eventProfile.eventName &&
            event.eventName === eventProfile.eventName) ||
          (eventProfile.eventId && event.eventId === eventProfile.eventId)
      );

      if (!event) return { error: EVENT_NOT_FOUND };

      const { gender, category, eventType } = event;
      const { drawProfiles } = eventProfile;
      const eventParticipantType =
        eventType === SINGLES
          ? INDIVIDUAL
          : eventType === DOUBLES
          ? PAIR
          : eventType;

      if (drawProfiles) {
        const {
          stageParticipantsCount,
          uniqueParticipantsCount,
          uniqueParticipantStages,
        } = getStageParticipantsCount({
          drawProfiles,
          category,
          gender,
        });

        const { uniqueDrawParticipants = [], uniqueParticipantIds = [] } =
          uniqueParticipantStages
            ? generateEventParticipants({
                event: { eventType, category, gender },
                uniqueParticipantsCount,
                participantsProfile,
                ratingsParameters,
                tournamentRecord,
                eventProfile,
                uuids,
              })
            : {};

        allUniqueParticipantIds.push(...uniqueParticipantIds);

        const { stageParticipants } = getStageParticipants({
          targetParticipants: tournamentRecord.participants || [],
          allUniqueParticipantIds,
          stageParticipantsCount,
          eventParticipantType,
        });

        let result = generateFlights({
          uniqueDrawParticipants,
          autoEntryPositions,
          stageParticipants,
          tournamentRecord,
          drawProfiles,
          category,
          gender,
          event,
        });
        if (result.error) return result;

        result = generateFlightDrawDefinitions({
          matchUpStatusProfile,
          completeAllMatchUps,
          randomWinningSide,
          tournamentRecord,
          drawProfiles,
          event,
        });
        if (result.error) return result;

        drawIds.push(...result.drawIds);
      }
    }
  }

  return { ...SUCCESS, drawIds };
}
