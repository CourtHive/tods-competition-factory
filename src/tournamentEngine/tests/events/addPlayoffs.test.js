import { generateRange } from '../../../utilities';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import { INVALID_VALUES } from '../../../constants/errorConditionConstants';
import {
  FIRST_MATCH_LOSER_CONSOLATION,
  PLAY_OFF,
} from '../../../constants/drawDefinitionConstants';

tournamentEngine.devContext(true);

it.each([
  [32, INVALID_VALUES, undefined],
  [64, undefined, 74],
])(
  'can add Silver, Gold and 3-4 playoff structures, then delete them',
  (drawSize, error, playoffMatchesCount) => {
    let drawProfiles = [{ drawSize }];
    const {
      tournamentRecord,
      drawIds: [drawId],
    } = mocksEngine.generateTournamentRecord({
      drawProfiles,
    });

    tournamentEngine.setState(tournamentRecord);
    let { matchUps } = tournamentEngine.allDrawMatchUps({ drawId });
    expect(matchUps.length).toEqual(drawSize - 1);

    const roundProfiles = [{ 3: 1 }, { 4: 1 }, { 5: 1 }];
    const playoffAttributes = {
      '0-3': { name: 'Silver', abbreviation: 'S' },
      '0-4': { name: 'Gold', abbreviation: 'G' },
    };
    const {
      drawDefinition: {
        structures: [{ structureId }],
      },
    } = tournamentEngine.getEvent({ drawId });

    let result = tournamentEngine.addPlayoffStructures({
      drawId,
      structureId,
      roundProfiles,
      playoffAttributes,
      playoffStructureNameBase: 'Playoff',
    });
    if (error) {
      expect(result.error).toEqual(error);
    } else {
      expect(result.success).toEqual(true);
      const {
        drawDefinition: { structures },
      } = tournamentEngine.getEvent({ drawId });

      const structureNames = structures.map(
        ({ structureName }) => structureName
      );
      expect(structureNames).toEqual(['MAIN', 'Silver', 'Gold', 'Playoff 3-4']);

      ({ matchUps } = tournamentEngine.allDrawMatchUps({ drawId }));
      expect(matchUps.length).toEqual(playoffMatchesCount);

      const playoffStructureIds = structures
        .map(({ structureId }) => structureId)
        .filter((s) => s !== structureId);

      playoffStructureIds.forEach((structureId) => {
        const result = tournamentEngine.removeStructure({
          drawId,
          structureId,
        });
        expect(result.success).toEqual(true);
      });

      ({ matchUps } = tournamentEngine.allDrawMatchUps({ drawId }));
      expect(matchUps.length).toEqual(drawSize - 1);
    }
  }
);

it.each([32, 64])(
  'can delete playoffStructures beyond stageSequence 2',
  (drawSize) => {
    let drawProfiles = [{ drawSize, drawType: PLAY_OFF }];
    const {
      tournamentRecord,
      drawIds: [drawId],
    } = mocksEngine.generateTournamentRecord({
      drawProfiles,
    });

    tournamentEngine.setState(tournamentRecord);
    const {
      drawDefinition: { structures },
    } = tournamentEngine.getEvent({ drawId });
    const [{ structureId }] = structures;

    let { positionsPlayedOff, playoffRounds, playoffRoundsRanges } =
      tournamentEngine.getAvailablePlayoffRounds({
        drawId,
        structureId,
      });
    // since this is a PLAY_OFF structure there are no available structures to add
    expect(playoffRounds).toEqual([]);
    expect(playoffRoundsRanges).toEqual([]);
    expect(positionsPlayedOff).toEqual(generateRange(1, drawSize + 1));

    const stageSequence2structureIds = structures
      .filter(({ stageSequence }) => stageSequence === 2)
      .map(({ structureId }) => structureId);

    stageSequence2structureIds.forEach((structureId) => {
      const result = tournamentEngine.removeStructure({
        drawId,
        structureId,
      });
      expect(result.success).toEqual(true);
    });
    ({ positionsPlayedOff, playoffRounds, playoffRoundsRanges } =
      tournamentEngine.getAvailablePlayoffRounds({
        drawId,
        structureId,
      }));
    expect(positionsPlayedOff).toEqual([1, 2]);
  }
);

it('can add 3-4 playoff structure to a SINGLE ELIMINATION structure', () => {
  const { success, drawDefinition } = tournamentEngineAddPlayoffsTest({
    drawSize: 16,
    playoffPositions: [3, 4],
    playoffStructureNameBase: 'Playoff',
  });
  expect(success).toEqual(true);
  const { links, structures } = drawDefinition;
  expect(links.length).toEqual(1);
  expect(structures.length).toEqual(2);
  expect(structures[1].structureName).toEqual('Playoff 3-4');
});

it('can add 5-8 playoff structure to a SINGLE ELIMINATION structure', () => {
  const { success, drawDefinition } = tournamentEngineAddPlayoffsTest({
    drawSize: 16,
    playoffPositions: [5, 6, 7, 8],
  });
  expect(success).toEqual(true);
  const { links, structures } = drawDefinition;
  expect(links.length).toEqual(2);
  expect(structures.length).toEqual(3);
});

it('can add playoff structures to a FIRST_MATCH_LOSER_CONSOLATION structure', () => {
  const { success, drawDefinition } = tournamentEngineAddPlayoffsTest({
    drawSize: 16,
    playoffPositions: [3, 4],
    drawType: FIRST_MATCH_LOSER_CONSOLATION,
  });
  expect(success).toEqual(true);
  const { links, structures } = drawDefinition;
  expect(links.length).toEqual(3);
  expect(structures.length).toEqual(3);
});

function tournamentEngineAddPlayoffsTest({
  drawSize,
  drawType,
  playoffPositions,
  roundNumbers,
  playoffStructureNameBase,
}) {
  const drawProfiles = [{ drawSize, drawType }];
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({ drawProfiles });
  tournamentEngine.setState(tournamentRecord);
  const {
    drawDefinition: {
      structures: [{ structureId }],
    },
  } = tournamentEngine.getEvent({ drawId });

  return tournamentEngine.addPlayoffStructures({
    drawId,
    structureId,
    roundNumbers,
    playoffPositions,
    playoffStructureNameBase,
  });
}
