import { getStructureGroups } from '../../governors/publishingGovernor/getDrawData';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import { MAIN, QUALIFYING } from '../../../constants/drawDefinitionConstants';
import { DRAW_ID_EXISTS } from '../../../constants/errorConditionConstants';

it('can specify qualifiersCount when no qualifying draws are generated', () => {
  const qualifiersCount = 4;
  let result = mocksEngine.generateTournamentRecord({
    drawProfiles: [
      { drawSize: 32, qualifiersCount, qualifyingPlaceholder: true },
    ],
  });
  expect(result.success).toEqual(true);

  const {
    tournamentRecord,
    eventIds: [eventId],
    drawIds: [drawId],
  } = result;

  tournamentEngine.setState(tournamentRecord);

  let drawDefinition = tournamentEngine.getEvent({ drawId }).drawDefinition;
  const mainStructure = drawDefinition.structures.find(
    ({ stage }) => stage === MAIN
  );
  const mainStructureQualifiers = mainStructure.positionAssignments.filter(
    ({ qualifier }) => qualifier
  );
  expect(mainStructureQualifiers.length).toEqual(qualifiersCount);
  const qualifyingStructure = drawDefinition.structures.find(
    ({ stage }) => stage === QUALIFYING
  );
  expect(qualifyingStructure).not.toBeUndefined();
  expect(drawDefinition.structures.length).toEqual(2);

  result = tournamentEngine.generateDrawDefinition({
    qualifyingProfiles: [
      {
        structureProfiles: [
          { stageSequence: 1, drawSize: 16, qualifyingPositions: 4 },
        ],
      },
    ],
    drawId,
  });
  expect(result.success).toEqual(true);
  drawDefinition = result.drawDefinition;

  result = getStructureGroups({ drawDefinition });
  expect(result.allStructuresLinked).toEqual(true);

  result = tournamentEngine.addDrawDefinition({ eventId, drawDefinition });
  expect(result.error).toEqual(DRAW_ID_EXISTS);
  result = tournamentEngine.addDrawDefinition({
    allowReplacement: true,
    drawDefinition,
    eventId,
  });
  expect(result.success).toEqual(true);
});
