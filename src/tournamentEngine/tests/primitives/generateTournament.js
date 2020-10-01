import { tournamentEngine } from '../../../tournamentEngine';
import { generateFakeParticipants } from '../../generators/fakerParticipants';

import { SUCCESS } from '../../../constants/resultConstants';
import { SINGLES, DOUBLES } from '../../../constants/eventConstants';

export function tournamentRecordWithParticipants({
  endDate,
  startDate,

  addressProps,
  nationalityCodes,
  nationalityCodesCount,

  participantsCount,
  matchUpType = SINGLES,
}) {
  tournamentEngine.newTournamentRecord({ startDate, endDate });

  const { participants } = generateFakeParticipants({
    nationalityCodesCount,
    nationalityCodes,
    addressProps,

    participantsCount,
    matchUpType,
  });

  if (matchUpType === SINGLES) {
    expect(participants.length).toEqual(participantsCount);
  } else if (matchUpType === DOUBLES) {
    expect(participants.length).toEqual(participantsCount * 3);
  }

  const result = tournamentEngine.addParticipants({ participants });
  expect(result).toMatchObject(SUCCESS);

  const { tournamentRecord } = tournamentEngine.getState();
  return { tournamentRecord, participants };
}
