import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

const scenarios = [
  {
    expectation: { matchUpsCount: 12 },
    qualifyingPositions: 3,
    drawSize: 12,
  },
  /*
  {
    expectation: { matchUpsCount: 9 },
    qualifyingPositions: 3,
    participantsCount: 12,
  },
  */
];

it.each(scenarios)(
  'can qualifying non-power-of-2 # of participants',
  (scenario) => {
    let result = mocksEngine.generateTournamentRecord({
      drawProfiles: [
        {
          ignoreDefaults: true,
          qualifyingProfiles: [
            {
              roundTarget: 1,
              structureProfiles: [scenario],
            },
          ],
        },
      ],
    });

    let {
      tournamentRecord,
      drawIds: [drawId],
    } = result;
    if (result.error) {
      console.log(result);
    } else {
      tournamentEngine.setState(tournamentRecord);

      let { drawDefinition, event } = tournamentEngine.getEvent({ drawId });
      expect(drawDefinition.entries.length).toEqual(scenario.drawSize);
      expect(event.entries.length).toEqual(scenario.drawSize);
      let { matchUps } = tournamentEngine.allDrawMatchUps({ drawId });
      console.log(matchUps.length);
      //expect(matchUps.length).toEqual(12);
    }
  }
);
