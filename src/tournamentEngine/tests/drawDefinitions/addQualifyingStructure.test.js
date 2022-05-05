import { getRoundMatchUps } from '../../../drawEngine/accessors/matchUpAccessor/getRoundMatchUps';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import {
  MAIN,
  QUALIFYING,
  ROUND_ROBIN,
} from '../../../constants/drawDefinitionConstants';
import {
  MISSING_DRAW_DEFINITION,
  MISSING_STRUCTURE,
} from '../../../constants/errorConditionConstants';

it.each([2, 3, 4, 5, 6, 7, 8, 31, 32])(
  'can specify qualifiersCount when no qualifying draws are generated',
  (qualifiersCount) => {
    const {
      tournamentRecord,
      drawIds: [drawId],
    } = mocksEngine.generateTournamentRecord({
      drawProfiles: [{ drawSize: 32, qualifiersCount }],
    });

    tournamentEngine.setState(tournamentRecord);

    let drawDefinition = tournamentEngine.getEvent({ drawId }).drawDefinition;
    const mainStructure = drawDefinition.structures.find(
      ({ stage }) => stage === MAIN
    );
    const mainStructureQualifiers = mainStructure.positionAssignments.filter(
      ({ qualifier }) => qualifier
    );
    expect(mainStructureQualifiers.length).toEqual(qualifiersCount);
  }
);

it('drawProfile qualifiersCount will override qualifyingProfile if greater', () => {
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [
      {
        drawSize: 32,
        qualifiersCount: 8,
        qualifyingProfiles: [
          {
            roundTarget: 1,
            structureProfiles: [
              { stageSequence: 1, drawSize: 16, drawType: ROUND_ROBIN },
            ],
          },
        ],
      },
    ],
  });

  tournamentEngine.setState(tournamentRecord);

  let drawDefinition = tournamentEngine.getEvent({ drawId }).drawDefinition;
  const mainStructure = drawDefinition.structures.find(
    ({ stage }) => stage === MAIN
  );
  const mainStructureQualifiers = mainStructure.positionAssignments.filter(
    ({ qualifier }) => qualifier
  );
  expect(mainStructureQualifiers.length).toEqual(8);
});

it('can add a qualifying structure to an existing drawDefinition', () => {
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize: 32 }],
  });

  tournamentEngine.setState(tournamentRecord);

  let drawDefinition = tournamentEngine.getEvent({ drawId }).drawDefinition;
  const mainStructure = drawDefinition.structures.find(
    ({ stage }) => stage === MAIN
  );
  const mainStructureQualifiers = mainStructure.positionAssignments.filter(
    ({ qualifier }) => qualifier
  );
  expect(mainStructureQualifiers.length).toEqual(0);

  let result = tournamentEngine.addQualifyingStructure({
    qualifyingRound: 2,
    drawSize: 32,
  });
  expect(result.error).toEqual(MISSING_DRAW_DEFINITION);

  result = tournamentEngine.addQualifyingStructure({
    qualifyingRound: 2,
    drawSize: 32,
    drawId,
  });
  expect(result.error).toEqual(MISSING_STRUCTURE);

  result = tournamentEngine.addQualifyingStructure({
    targetStructureId: mainStructure.structureId,
    qualifyingRound: 2,
    drawSize: 32,
    drawId,
  });
  expect(result.success).toEqual(true);

  drawDefinition = tournamentEngine.getEvent({ drawId }).drawDefinition;
  expect(drawDefinition.structures.length).toEqual(2);
  expect(drawDefinition.links.length).toEqual(1);
});

it('can generate and attach a qualifying structure to an existing drawDefinition', () => {
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize: 32 }],
  });

  tournamentEngine.setState(tournamentRecord);

  let drawDefinition = tournamentEngine.getEvent({ drawId }).drawDefinition;
  const mainStructure = drawDefinition.structures.find(
    ({ stage }) => stage === MAIN
  );
  const mainStructureQualifiers = mainStructure.positionAssignments.filter(
    ({ qualifier }) => qualifier
  );
  expect(mainStructureQualifiers.length).toEqual(0);

  let result = tournamentEngine.generateQualifyingStructure({
    targetStructureId: mainStructure.structureId,
    qualifyingRoundNumber: 2,
    drawSize: 32,
    drawId,
  });
  expect(result.success).toEqual(true);

  const { structure, link } = result;
  expect(structure.stage).toEqual(QUALIFYING);
  result = tournamentEngine.attachQualifyingStructure({
    structure,
    drawId,
    link,
  });
  expect(result.success).toEqual(true);

  drawDefinition = tournamentEngine.getEvent({ drawId }).drawDefinition;
  expect(drawDefinition.structures.length).toEqual(2);
  expect(drawDefinition.links.length).toEqual(1);

  const { matchUps } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { structureIds: [structure.structureId] },
  });
  const { roundMatchUps } = getRoundMatchUps({ matchUps });
  expect(Object.keys(roundMatchUps)).toEqual(['1', '2']);
});

it('will ignore drawProfile qualifiersCount if qualifyingProfile.qualifiersCount is greater', () => {
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [
      {
        drawSize: 32,
        qualifiersCount: 3,
        qualifyingProfiles: [
          {
            roundTarget: 1,
            structureProfiles: [
              { stageSequence: 1, drawSize: 16, drawType: ROUND_ROBIN },
            ],
          },
        ],
      },
    ],
  });

  tournamentEngine.setState(tournamentRecord);

  let drawDefinition = tournamentEngine.getEvent({ drawId }).drawDefinition;
  const mainStructure = drawDefinition.structures.find(
    ({ stage }) => stage === MAIN
  );
  const mainStructureQualifiers = mainStructure.positionAssignments.filter(
    ({ qualifier }) => qualifier
  );
  expect(mainStructureQualifiers.length).toEqual(4);
});

it('can add a qualifying structure to an existing draw which has existing qualifying structure', () => {
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [
      {
        drawSize: 32,
        qualifyingProfiles: [
          {
            roundTarget: 1,
            structureProfiles: [
              { stageSequence: 1, drawSize: 16, qualifyingPositions: 4 },
            ],
          },
        ],
      },
    ],
  });

  tournamentEngine.setState(tournamentRecord);

  let drawDefinition = tournamentEngine.getEvent({ drawId }).drawDefinition;
  const mainStructure = drawDefinition.structures.find(
    ({ stage }) => stage === MAIN
  );
  const mainStructureQualifiers = mainStructure.positionAssignments.filter(
    ({ qualifier }) => qualifier
  );
  expect(mainStructureQualifiers.length).toEqual(4);
});
