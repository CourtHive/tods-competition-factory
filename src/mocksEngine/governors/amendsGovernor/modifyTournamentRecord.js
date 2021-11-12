import { scheduleProfileRounds } from '../../../competitionEngine/governors/scheduleGovernor/schedulingProfile/scheduleProfileRounds';
import { generateScheduleTimes } from '../../../competitionEngine/governors/scheduleGovernor/jinnScheduler/generateScheduleTimes';
import { generateFlightDrawDefinitions } from '../../generators/generateFlightDrawDefinitions';
import { addTournamentParticipants } from '../../generators/addTournamentParticipants';
import { generateEventParticipants } from '../../generators/generateEventParticipants';
import { addEvent } from '../../../tournamentEngine/governors/eventGovernor/addEvent';
import { generateEventWithFlights } from '../../generators/generateEventWithFlights';
import { getStageParticipantsCount } from '../../getters/getStageParticipantsCount';
import { generateEventWithDraw } from '../../generators/generateEventWithDraw';
import { getStageParticipants } from '../../getters/getStageParticipants';
import { generateFlights } from '../../generators/generateFlights';
import { generateVenues } from '../../generators/generateVenues';

import { MISSING_TOURNAMENT_RECORD } from '../../../constants/errorConditionConstants';
import defaultRatingsParameters from '../../../fixtures/ratings/ratingsParameters';
import { INDIVIDUAL, PAIR } from '../../../constants/participantConstants';
import { DOUBLES, SINGLES } from '../../../constants/eventConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function modifyTournamentRecord({
  ratingsParameters = defaultRatingsParameters,
  participantsProfile = {},
  matchUpStatusProfile,
  completeAllMatchUps,
  autoEntryPositions,
  randomWinningSide,
  schedulingProfile,
  tournamentRecord,
  eventProfiles,
  venueProfiles,
  autoSchedule,
  drawProfiles,
  goesTo,
  uuids,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  const allUniqueParticipantIds = [];
  const eventIds = [];
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

  const participantsCount = tournamentRecord.participants?.length || undefined;
  if (participantsCount && participantsProfile?.idPrefix)
    participantsProfile.idPrefix = `${participantsProfile.idPrefix}-${participantsCount}`;

  const result = addTournamentParticipants({
    startDate: tournamentRecord.startDate,
    participantsProfile,
    tournamentRecord,
    eventProfiles,
    drawProfiles,
    uuids,
  });
  if (!result.success) return result;

  if (eventProfiles) {
    let eventIndex = tournamentRecord.events?.length || 0;
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

      if (!event) {
        const {
          error,
          eventId,
          drawIds: generatedDrawIds,
          uniqueParticipantIds,
        } = generateEventWithFlights({
          startDate: tournamentRecord.startDate,
          allUniqueParticipantIds,
          matchUpStatusProfile,
          participantsProfile,
          completeAllMatchUps,
          autoEntryPositions,
          randomWinningSide,
          ratingsParameters,
          tournamentRecord,
          eventProfile,
          eventIndex,
          uuids,
        });
        if (error) return { error };

        if (generatedDrawIds) drawIds.push(...generatedDrawIds);
        eventIds.push(eventId);

        if (uniqueParticipantIds?.length)
          allUniqueParticipantIds.push(...uniqueParticipantIds);

        eventIndex += 1;
      } else {
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
  }

  if (drawProfiles) {
    let drawIndex = (tournamentRecord.events || [])
      .map((event) => event.drawDefinitions?.map(() => 1) || [])
      .flat()
      .reduce((a, b) => a + b, 0);

    for (const drawProfile of drawProfiles) {
      const { drawId, eventId, event, error, uniqueParticipantIds } =
        generateEventWithDraw({
          startDate: tournamentRecord.startDate,
          allUniqueParticipantIds,
          matchUpStatusProfile,
          participantsProfile,
          completeAllMatchUps,
          autoEntryPositions,
          randomWinningSide,
          ratingsParameters,
          tournamentRecord,
          drawProfile,
          drawIndex,
          goesTo,
          uuids,
        });
      if (error) return { error };

      const result = addEvent({ tournamentRecord, event });
      if (result.error) return result;

      if (drawId) drawIds.push(drawId);
      eventIds.push(eventId);

      if (uniqueParticipantIds?.length)
        allUniqueParticipantIds.push(...uniqueParticipantIds);

      drawIndex += 1;
    }
  }

  const venueIds = venueProfiles?.length
    ? generateVenues({ tournamentRecord, venueProfiles })
    : [];

  let scheduledRounds;
  let schedulerResult = {};
  if (schedulingProfile) {
    const result = generateScheduleTimes({
      schedulingProfile,
      tournamentRecord,
    });
    if (result.error) return result;
    scheduledRounds = result.scheduledRounds;

    if (autoSchedule) {
      const { tournamentId } = tournamentRecord;
      const tournamentRecords = { [tournamentId]: tournamentRecord };

      schedulerResult = scheduleProfileRounds({ tournamentRecords });
    }
  }

  return {
    ...SUCCESS,
    drawIds,
    eventIds,
    venueIds,
    scheduledRounds,
    schedulerResult,
  };
}
