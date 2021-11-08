import { generateTeamsFromParticipantAttribute } from '../../../tournamentEngine/generators/teamsGenerator';
import { addParticipants } from '../../../tournamentEngine/governors/participantGovernor/addParticipants';
import { generateEventParticipants } from '../../generators/generateEventParticipants';
import { getStageParticipantsCount } from '../../getters/getStageParticipantsCount';
import { generateParticipants } from '../../generators/generateParticipants';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  EVENT_NOT_FOUND,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

export function modifyTournamentRecord({
  participantsProfile,
  tournamentRecord,
  eventProfiles,
  uuids,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

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
    if (!result.success) return result;

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
        (event) =>
          (eventProfile.eventName &&
            event.eventName === eventProfile.eventName) ||
          (eventProfile.eventId && event.eventId === eventProfile.eventId)
      );

      if (!event) return { error: EVENT_NOT_FOUND };
      const { gender, category, eventType } = event;

      if (eventProfile.drawProfiles) {
        const {
          // stageParticipantsCount,
          uniqueParticipantsCount,
          uniqueParticipantStages,
        } = getStageParticipantsCount({
          drawProfiles: eventProfile.drawProfiles,
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

        if (uniqueDrawParticipants || uniqueParticipantIds) {
          //
        }

        for (const drawProfile of eventProfile.drawProfiles) {
          const { drawSize, drawType } = drawProfile;
          console.log({ drawSize, drawType });
        }
      }
    }
  }

  return { ...SUCCESS };
}
