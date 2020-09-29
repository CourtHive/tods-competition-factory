import { tournamentEngine } from '../../../tournamentEngine';
import { generateFakeParticipants } from '../../generators/fakerParticipants';

import { SUCCESS } from '../../../constants/resultConstants';
import { SINGLES } from '../../../constants/eventConstants';

export function tournamentRecordWithParticipants({
  startDate,
  endDate,
  participantsCount,
  matchUpType = SINGLES,
}) {
  tournamentEngine.newTournamentRecord({ startDate, endDate });

  const { participants } = generateFakeParticipants({
    participantsCount,
    matchUpType,
  });
  expect(participants.length).toEqual(participantsCount);

  const result = tournamentEngine.addParticipants({ participants });
  expect(result).toMatchObject(SUCCESS);

  const { tournamentRecord } = tournamentEngine.getState();
  return { tournamentRecord, participants };
}
