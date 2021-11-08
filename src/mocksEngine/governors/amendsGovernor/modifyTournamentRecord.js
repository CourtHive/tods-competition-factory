import { generateTeamsFromParticipantAttribute } from '../../../tournamentEngine/generators/teamsGenerator';
import { addParticipants } from '../../../tournamentEngine/governors/participantGovernor/addParticipants';
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
      const event = tournamentRecord.events.find(
        (event) =>
          (eventProfile.eventName &&
            event.eventName === eventProfile.eventName) ||
          (eventProfile.eventId && event.eventId === eventProfile.eventId)
      );
      if (!event) return { error: EVENT_NOT_FOUND };
      const { gender, category } = event;

      if (eventProfile.drawProfiles) {
        const {
          stageParticipantsCount,
          uniqueParticipantsCount,
          uniqueParticipantStages,
        } = getStageParticipantsCount({
          drawProfiles: event.drawProfiles,
          category,
          gender,
        });

        if (
          stageParticipantsCount ||
          uniqueParticipantStages ||
          uniqueParticipantsCount
        ) {
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
