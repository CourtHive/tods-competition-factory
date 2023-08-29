import { tournamentEngine } from '../..';
import { expect, it } from 'vitest';
import fs from 'fs';

it('voluntary consolation test', () => {
  const tournamentRecordJSON = fs.readFileSync(
    './src/global/testHarness/voluntaryConsolation.tods.json',
    'utf-8'
  );

  const tournamentRecord = JSON.parse(tournamentRecordJSON);

  tournamentEngine.setState(tournamentRecord);

  const drawId = tournamentRecord.events[1].drawDefinitions[0].drawId;

  const { eligibleParticipants, losingParticipantIds } =
    tournamentEngine.getEligibleVoluntaryConsolationParticipants({
      requirePlay: false,
      matchUpsLimit: 1,
      drawId,
    });

  expect(losingParticipantIds.length).toEqual(3);
  expect(eligibleParticipants.length).toEqual(3);
});
