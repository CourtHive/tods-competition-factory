import { generateParticipants } from './generateParticipants';
import { tournamentEngine } from '../../tournamentEngine';

import { INDIVIDUAL } from '../../constants/participantTypes';

export function generateTournament({
  endDate,
  startDate,

  participantsProfile,
  inContext,
}) {
  const {
    addressProps,
    nationalityCodes,
    nationalityCodesCount,
    valuesInstanceLimit,

    sex,
    participantsCount,
    participantType = INDIVIDUAL,
  } = participantsProfile;

  tournamentEngine.newTournamentRecord({ startDate, endDate });

  const { participants } = generateParticipants({
    nationalityCodesCount,
    nationalityCodes,
    addressProps,

    participantsCount,
    participantType,
    inContext,
    sex,

    valuesInstanceLimit,
  });
  tournamentEngine.addParticipants({ participants });

  const { tournamentRecord } = tournamentEngine.getState();
  return { tournamentRecord };
}
