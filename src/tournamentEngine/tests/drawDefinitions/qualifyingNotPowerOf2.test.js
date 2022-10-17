import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

const scenarios = [
  {
    expectation: { matchUpsCount: 21 },
    qualifyingPositions: 3,
    drawSize: 21,
  },
  {
    expectation: { matchUpsCount: 21 },
    qualifyingPositions: 3,
    drawSize: 24,
  },
  {
    expectation: { matchUpsCount: 9 },
    qualifyingPositions: 3,
    drawSize: 12,
  },
  {
    expectation: { matchUpsCount: 9 },
    qualifyingPositions: 3,
    participantsCount: 12,
  },
  {
    expectation: { matchUpsCount: 9 },
    qualifyingRoundNumber: 2,
    participantsCount: 12,
  },
  {
    expectation: { matchUpsCount: 6 },
    qualifyingRoundNumber: 1,
    participantsCount: 12,
  },
  {
    expectation: { matchUpsCount: 6 },
    qualifyingPositions: 6,
    participantsCount: 12,
  },
  {
    expectation: { matchUpsCount: 6 },
    qualifyingPositions: 6,
    participantsCount: 11,
  },
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

    // if (scenario.expectation.error) {
    if (result.error) {
      console.log(result);
    } else {
      let {
        tournamentRecord,
        drawIds: [drawId],
      } = result;
      tournamentEngine.setState(tournamentRecord);

      let { drawDefinition, event } = tournamentEngine.getEvent({ drawId });
      if (scenario.participantsCount) {
        expect(event.entries.length).toEqual(scenario.participantsCount);
        expect(drawDefinition.entries.length).toEqual(
          scenario.participantsCount
        );
      } else if (scenario.drawSize) {
        expect(event.entries.length).toEqual(scenario.drawSize);
        expect(drawDefinition.entries.length).toEqual(scenario.drawSize);
      }

      let { matchUps } = tournamentEngine.allDrawMatchUps({ drawId });
      expect(matchUps.length).toEqual(scenario.expectation.matchUpsCount);
    }
  }
);
