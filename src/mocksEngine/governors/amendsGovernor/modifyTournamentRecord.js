import { generateTeamsFromParticipantAttribute } from '../../../tournamentEngine/generators/teamsGenerator';
import { addParticipants } from '../../../tournamentEngine/governors/participantGovernor/addParticipants';
import { generateParticipants } from '../../generators/generateParticipants';

import { MISSING_TOURNAMENT_RECORD } from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function modifyTournamentRecord({
  participantsProfile,
  tournamentRecord,
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

  return { ...SUCCESS };
}
