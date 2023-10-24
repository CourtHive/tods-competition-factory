import { tournamentEngine } from '../..';
import { expect, it } from 'vitest';
import fs from 'fs';

it('can get competitionScheduleMatchUps', () => {
  const tournamentRecordJSON = fs.readFileSync(
    './src/global/testHarness/lineUps.tods.json',
    'utf-8'
  );

  const tournamentRecord = JSON.parse(tournamentRecordJSON);
  tournamentEngine.setState(tournamentRecord);

  const { participants } = tournamentEngine.getParticipants({
    withMatchUps: true,
  });

  const participantId = 'BFFDEFF0-C0EA-453D-A813-DCCB767C150A';

  const participant = participants.find(
    (participant) => participant.participantId === participantId
  );

  expect(participant.matchUps.length).toEqual(8);
});
