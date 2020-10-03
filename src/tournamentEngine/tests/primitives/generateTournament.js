import { tournamentEngine } from '../../../tournamentEngine';
import { generateFakeParticipants } from '../../generators/fakerParticipants';

import { SUCCESS } from '../../../constants/resultConstants';
import { INDIVIDUAL, PAIR } from '../../../constants/participantTypes';

export function tournamentRecordWithParticipants({
  endDate,
  startDate,

  addressProps,
  nationalityCodes,
  nationalityCodesCount,

  participantsCount,
  participantType = INDIVIDUAL,
}) {
  tournamentEngine.newTournamentRecord({ startDate, endDate });

  const { participants } = generateFakeParticipants({
    nationalityCodesCount,
    nationalityCodes,
    addressProps,

    participantsCount,
    participantType,
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
