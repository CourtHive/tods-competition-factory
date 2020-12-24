import { generateParticipants } from '../../../mocksEngine/generators/generateParticipants';
import { tournamentEngine } from '../../../tournamentEngine';

import { SUCCESS } from '../../../constants/resultConstants';
import { INDIVIDUAL, PAIR } from '../../../constants/participantTypes';

export function tournamentRecordWithParticipants({
  endDate,
  startDate,

  addressProps,
  nationalityCodes,
  nationalityCodesCount,

  sex,
  participantsCount,
  participantType = INDIVIDUAL,
  inContext,

  valuesInstanceLimit,
}) {
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

  if (participantType === INDIVIDUAL) {
    expect(participants.length).toEqual(participantsCount);
  } else if (participantType === PAIR) {
    expect(participants.length).toEqual(participantsCount * 3);
  }

  const result = tournamentEngine.addParticipants({ participants });
  expect(result).toMatchObject(SUCCESS);

  const { tournamentRecord } = tournamentEngine.getState();
  return { tournamentRecord, participants };
}
