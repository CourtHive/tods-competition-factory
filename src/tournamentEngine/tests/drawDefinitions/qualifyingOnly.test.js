import mocksEngine from '../../../mocksEngine';
import { unique } from '../../../utilities';
import tournamentEngine from '../../sync';

import { MAIN, QUALIFYING } from '../../../constants/drawDefinitionConstants';

it('can generate QUALIFYING structures before MAIN structure', () => {
  let result = mocksEngine.generateTournamentRecord({
    drawProfiles: [
      {
        ignoreDefaults: true,
        qualifyingProfiles: [
          {
            roundTarget: 1,
            structureProfiles: [
              { stageSequence: 1, drawSize: 16, qualifyingRoundNumber: 2 },
            ],
          },
        ],
      },
    ],
  });

  let {
    tournamentRecord,
    drawIds: [drawId],
  } = result;

  tournamentEngine.setState(tournamentRecord);
  const { drawDefinition, event } = tournamentEngine.getEvent({ drawId });
  expect(drawDefinition.entries.length).toEqual(16);
  expect(event.entries.length).toEqual(16);

  const entryStages = unique(event.entries.map(({ entryStage }) => entryStage));
  expect(entryStages).toEqual([QUALIFYING]);

  const mainStructure = drawDefinition.structures.find(
    ({ stage }) => stage === MAIN
  );
  expect(mainStructure.matchUps.length).toEqual(0);

  const qualifyingStructure = drawDefinition.structures.find(
    ({ stage }) => stage === QUALIFYING
  );
  expect(qualifyingStructure.matchUps.length).toEqual(12);
});
