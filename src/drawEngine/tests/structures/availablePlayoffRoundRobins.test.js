import { tournamentEngine, mocksEngine } from '../../../';
import { expect, it } from 'vitest';

import {
  INVALID_VALUES,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';
import {
  COMPASS,
  MAIN,
  ROUND_ROBIN,
  ROUND_ROBIN_WITH_PLAYOFF,
  SINGLE_ELIMINATION,
} from '../../../constants/drawDefinitionConstants';

const scenarios = [
  {
    drawProfile: {
      drawType: ROUND_ROBIN_WITH_PLAYOFF,
      structureOptions: { groupSize: 4 },
      drawSize: 32,
    },
    completeAllMatchUps: true,
    allPositionsAssigned: true,
    playoffGroups: [
      {
        finishingPositions: [2, 3],
        structureName: 'Silver',
        drawType: COMPASS,
      },
    ],
    expectation: {
      generatedStructuresCount: 10, // original 2 plus 8 for COMPASS
      playoffFinishingPositionRanges: [
        {
          finishingPosition: 2,
          finishingPositions: [9, 10, 11, 12, 13, 14, 15, 16],
          finishingPositionRange: '9-16',
        },
        {
          finishingPosition: 3,
          finishingPositions: [17, 18, 19, 20, 21, 22, 23, 24],
          finishingPositionRange: '17-24',
        },
        {
          finishingPosition: 4,
          finishingPositions: [25, 26, 27, 28, 29, 30, 31, 32],
          finishingPositionRange: '25-32',
        },
      ],
    },
  },
  {
    drawProfile: {
      structureOptions: { groupSize: 4 },
      drawType: ROUND_ROBIN,
      drawSize: 8,
    },
    completeAllMatchUps: true,
    allPositionsAssigned: true,
    playoffGroups: [
      {
        finishingPositions: [1],
        structureName: '3-4 Playoff',
        drawType: SINGLE_ELIMINATION,
      },
    ],
    expectation: {
      generatedStructuresCount: 2,
      playoffFinishingPositionRanges: [
        {
          finishingPosition: 1,
          finishingPositions: [1, 2],
          finishingPositionRange: '1-2',
        },
        {
          finishingPosition: 2,
          finishingPositions: [3, 4],
          finishingPositionRange: '3-4',
        },
        {
          finishingPosition: 3,
          finishingPositions: [5, 6],
          finishingPositionRange: '5-6',
        },
        {
          finishingPosition: 4,
          finishingPositions: [7, 8],
          finishingPositionRange: '7-8',
        },
      ],
    },
  },
];

it.each(scenarios)(
  'can determine available playoff rounds for ROUND_ROBIN structures',
  (scenario) => {
    const {
      playoffGroups,
      allPositionsAssigned,
      completeAllMatchUps,
      drawProfile,
      expectation,
    } = scenario;

    const {
      tournamentRecord,
      drawIds: [drawId],
    } = mocksEngine.generateTournamentRecord({
      drawProfiles: [drawProfile],
      completeAllMatchUps,
    });

    let result = tournamentEngine.setState(tournamentRecord);
    expect(result.success).toEqual(true);

    const { drawDefinition } = tournamentEngine.getEvent({ drawId });
    const mainStructureId = drawDefinition.structures.find(
      ({ stage }) => stage === MAIN
    ).structureId;

    result = tournamentEngine.getAvailablePlayoffProfiles({ drawId });

    if (expectation) {
      expect(
        result.availablePlayoffProfiles[0].playoffFinishingPositionRanges
      ).toEqual(expectation.playoffFinishingPositionRanges);
    }

    // calling with structureId returns scoped values
    result = tournamentEngine.getAvailablePlayoffProfiles({
      structureId: mainStructureId,
      drawId,
    });
    expect(result.playoffFinishingPositionRanges).toEqual(
      expectation.playoffFinishingPositionRanges
    );
    const availableFinishingPositions =
      result.playoffFinishingPositionRanges.map(
        ({ finishingPosition }) => finishingPosition
      );

    result = tournamentEngine.generateAndPopulatePlayoffStructures({
      structureId: mainStructureId,
      drawId,
    });
    expect(result.error).toEqual(MISSING_VALUE);
    expect(result.error.info).not.toBeUndefined();

    const invalidFinishingPosition =
      Math.max(...availableFinishingPositions, 0) + 1;
    result = tournamentEngine.generateAndPopulatePlayoffStructures({
      playoffGroups: [{ finishingPositions: [invalidFinishingPosition] }],
      structureId: mainStructureId,
      drawId,
    });
    expect(result.error).toEqual(INVALID_VALUES);

    if (playoffGroups) {
      result = tournamentEngine.generateAndPopulatePlayoffStructures({
        structureId: mainStructureId,
        playoffGroups,
        drawId,
      });
    }
    expect(result.success).toEqual(true);

    expect(
      result.structures[0].positionAssignments.every(
        ({ participantId }) => participantId
      )
    ).toEqual(allPositionsAssigned);

    if (expectation.generatedStructuresCount) {
      expect(result.drawDefinition.structures.length).toEqual(
        expectation.generatedStructuresCount
      );
    }
  }
);
