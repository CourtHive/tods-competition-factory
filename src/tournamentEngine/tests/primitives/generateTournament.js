import { tournamentEngine } from '../../../tournamentEngine';
import { generateMockParticipants } from '../../generators/mockParticipants';

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

  valuesInstanceLimit,
}) {
  tournamentEngine.newTournamentRecord({ startDate, endDate });

  const { participants } = generateMockParticipants({
    nationalityCodesCount,
    nationalityCodes,
    addressProps,

    participantsCount,
    participantType,

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
