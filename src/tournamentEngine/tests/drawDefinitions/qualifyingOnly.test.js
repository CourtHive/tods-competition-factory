import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

it('can generate QUALIFYING structures before MAIN structure', () => {
  let {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [
      {
        ignoreDefaults: true,
        qualifyingProfiles: [
          {
            roundTarget: 1,
            structureProfiles: [{ stageSequence: 1, drawSize: 16 }],
          },
        ],
      },
    ],
  });

  tournamentEngine.setState(tournamentRecord);
  const { drawDefinition, event } = tournamentEngine.getEvent({ drawId });
  expect(drawDefinition.entries.length).toEqual(16);
  expect(event.entries.length).toEqual(16);

  // console.log(drawDefinition.entries);
});
