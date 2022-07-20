import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

it('can generate QUALIFYING structures before MAIN structure', () => {
  let result = mocksEngine.generateTournamentRecord({
    drawProfiles: [
      {
        qualifyingProfiles: [
          {
            roundTarget: 1,
            structureProfiles: [{ stageSequence: 1, drawSize: 16 }],
          },
        ],
      },
    ],
  });

  console.log(
    result.tournamentRecord.events[0].drawDefinitions[0].entries.length
  );

  tournamentEngine.setState(result.tournamentRecord);
});
