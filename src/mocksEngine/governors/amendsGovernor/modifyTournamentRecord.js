import { generateTeamsFromParticipantAttribute } from '../../../tournamentEngine/generators/teamsGenerator';
import { addParticipants } from '../../../tournamentEngine/governors/participantGovernor/addParticipants';
import { generateFlightDrawDefinitions } from '../../generators/generateFlightDrawDefinitions';
import { generateEventParticipants } from '../../generators/generateEventParticipants';
import { getStageParticipantsCount } from '../../getters/getStageParticipantsCount';
import { generateParticipants } from '../../generators/generateParticipants';
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

  if (participantsProfile) {
    const {
      nationalityCodesCount,
      nationalityCodeType,
      valuesInstanceLimit,
      participantsCount,
      nationalityCodes,
      personExtensions,
      participantType,
      addressProps,
      personData,
      personIds,
      inContext,
      teamKey,
      uuids,
      sex,
    } = participantsProfile || {};

    const { participants } = generateParticipants({
      consideredDate: tournamentRecord.startDate,
      valuesInstanceLimit,

      nationalityCodesCount,
      nationalityCodeType,
      nationalityCodes,

      personExtensions,
      addressProps,
      personData,
      sex,

      participantsCount,
      participantType,
      personIds,
      uuids,

      inContext,
    });

    let result = addParticipants({ tournamentRecord, participants });
    if (result.error) return result;

    if (teamKey) {
      const result = generateTeamsFromParticipantAttribute({
        tournamentRecord,
        ...teamKey,
      });
      if (result.error) return result;
    }
  }

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
