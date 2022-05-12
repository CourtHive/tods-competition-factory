import { tournamentEngine } from '../..';
import fs from 'fs';

it('voluntary consolation test', () => {
  let tournamentRecordJSON = fs.readFileSync(
    './src/global/testHarness/voluntaryConsolation.tods.json',
    'utf-8'
  );

  const tournamentRecord = JSON.parse(tournamentRecordJSON);

  tournamentEngine.setState(tournamentRecord);

  const drawId = tournamentRecord.events[1].drawDefinitions[0].drawId;

  let { eligibleParticipants, losingParticipantIds } =
    tournamentEngine.getEligibleVoluntaryConsolationParticipants({ drawId });

  ({ eligibleParticipants, losingParticipantIds } =
    tournamentEngine.getEligibleVoluntaryConsolationParticipants({
      requirePlay: false,
      matchUpsLimit: 1,
      drawId,
    }));

  expect(losingParticipantIds.length).toEqual(3);
  expect(eligibleParticipants.length).toEqual(3);
});
