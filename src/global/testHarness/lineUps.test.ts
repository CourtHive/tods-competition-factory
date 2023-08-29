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

  const { tournamentParticipants } = tournamentEngine.getTournamentParticipants(
    { withMatchUps: true }
  );

  const participantId = 'BFFDEFF0-C0EA-453D-A813-DCCB767C150A';

  const participant = tournamentParticipants.find(
    (participant) => participant.participantId === participantId
  );

  expect(participant.matchUps.length).toEqual(8);
});
