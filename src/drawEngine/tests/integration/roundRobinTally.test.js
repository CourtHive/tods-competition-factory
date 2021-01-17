import drawEngine from '../..';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../../tournamentEngine';

import { getPositionAssignments } from '../../getters/positionsGetter';
import { findExtension } from '../../../tournamentEngine/governors/queryGovernor/extensionQueries';

import { SINGLES } from '../../../constants/eventConstants';
import { ROUND_ROBIN } from '../../../constants/drawDefinitionConstants';
import { FORMAT_STANDARD } from '../../../fixtures/scoring/matchUpFormats/formatConstants';

it('properly orders round robin participants; drawSize: 3, FORMAT_STANDARD', () => {
  const drawProfiles = [
    {
      drawSize: 3,
      eventType: SINGLES,
      participantsCount: 3,
      matchUpFormat: FORMAT_STANDARD,
      drawType: ROUND_ROBIN,
      outcomes: [
        {
          roundNumber: 1,
          structureOrder: 1,
          scoreString: '6-2 6-2',
          matchUpFormat: FORMAT_STANDARD,
          winningSide: 1,
        },
        {
          roundNumber: 2,
          structureOrder: 1,
          scoreString: '6-2 6-2',
          matchUpFormat: FORMAT_STANDARD,
          winningSide: 2,
        },
        {
          roundNumber: 3,
          structureOrder: 1,
          scoreString: '6-2 3-6 [10-3]',
          matchUpFormat: FORMAT_STANDARD,
          winningSide: 2,
        },
      ],
    },
  ];
  let {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles,
  });
  tournamentEngine.setState(tournamentRecord);

  const { drawDefinition } = tournamentEngine.getEvent({ drawId });
  const { matchUps } = tournamentEngine.allDrawMatchUps({
    drawId,
    inContext: true,
  });
  const mainStructure = drawDefinition.structures[0];

  mainStructure.structures.forEach((structure) => {
    const { structureId } = structure;

    const structureMatchUps = matchUps.filter(
      (matchUp) => matchUp.structureId === structureId
    );
    const matchUpFormat = structureMatchUps.find(
      ({ matchUpFormat }) => matchUpFormat
    )?.matchUpFormat;

    const { participantResults } = drawEngine.tallyParticipantResults({
      matchUps: structureMatchUps,
      matchUpFormat,
    });

    Object.values(participantResults).forEach((result) => {
      expect(isNaN(result.gamesWon)).toEqual(false);
      expect(isNaN(result.matchUpsWon)).toEqual(false);
      expect(isNaN(result.matchUpsLost)).toEqual(false);
      expect(isNaN(result.matchUpsCancelled)).toEqual(false);
      expect(isNaN(result.setsWon)).toEqual(false);
      expect(isNaN(result.setsLost)).toEqual(false);
      expect(isNaN(result.gamesWon)).toEqual(false);
      expect(isNaN(result.gamesLost)).toEqual(false);
      expect(isNaN(result.pointsWon)).toEqual(false);
      expect(isNaN(result.pointsLost)).toEqual(false);
      expect(isNaN(result.setsRatio)).toEqual(false);
      expect(isNaN(result.matchUpsRatio)).toEqual(false);
      expect(isNaN(result.gamesRatio)).toEqual(false);
      expect(isNaN(result.gamesDifference)).toEqual(false);
      expect(isNaN(result.pointsRatio)).toEqual(false);
      expect(isNaN(result.groupOrder)).toEqual(false);
      expect(isNaN(result.pointsOrder)).toEqual(false);
    });
  });
});

it('properly orders round robin participants; drawSize: 5, SET3-S:4/TB7-F:TB7', () => {
  const drawProfiles = [
    {
      drawSize: 5,
      eventType: SINGLES,
      participantsCount: 5,
      matchUpFormat: 'SET3-S:4/TB7-F:TB7',
      drawType: ROUND_ROBIN,
      structureOptions: { groupSize: 5 },
      outcomes: [
        {
          drawPositions: [1, 2],
          scoreString: '4-0 4-1',
          winningSide: 2,
        },
        {
          drawPositions: [1, 3],
          scoreString: '4-1 4-2',
          winningSide: 2,
        },
        {
          drawPositions: [1, 4],
          scoreString: '4-0 5-4(2)',
          winningSide: 2,
        },
        {
          drawPositions: [1, 5],
          scoreString: '4-0 4-0',
          winningSide: 2,
        },
        {
          drawPositions: [2, 3],
          scoreString: '4-1 2-4 [7-5]',
          winningSide: 1,
        },
        {
          drawPositions: [2, 4],
          scoreString: '4-1 4-2',
          winningSide: 1,
        },
        {
          drawPositions: [2, 5],
          scoreString: '4-1 4-1',
          winningSide: 2,
        },
        {
          drawPositions: [3, 4],
          scoreString: '4-1 5-3',
          winningSide: 1,
        },
        {
          drawPositions: [3, 5],
          scoreString: '4-1 4-1',
          winningSide: 2,
        },
        {
          drawPositions: [4, 5],
          scoreString: '4-0 4-2',
          winningSide: 1,
        },
      ],
    },
  ];
  let {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles,
  });
  tournamentEngine.setState(tournamentRecord);

  /*
  // visual verification
  const { matchUps } = tournamentEngine.allDrawMatchUps({
    drawId,
    inContext: true,
  });
  console.log(
    matchUps
      .filter(({ matchUpStatus }) => matchUpStatus !== 'BYE')
      .map(({ drawPositions, score, winningSide }) => ({
        drawPositions,
        winningSide,
        score,
      }))
  );
  */
  const { drawDefinition } = tournamentEngine.getEvent({ drawId });
  const mainStructure = drawDefinition.structures[0];
  const { positionAssignments } = getPositionAssignments({
    structure: mainStructure,
  });

  const expectations = [
    {
      drawPosition: 1,
      expectation: {
        groupOrder: 5,
        setsWon: 0,
        setsLost: 8,
        gamesWon: 8,
        gamesLost: 33,
      },
    },
    {
      drawPosition: 2,
      expectation: {
        groupOrder: 2,
        setsWon: 5,
        setsLost: 3,
        gamesWon: 26,
        gamesLost: 17,
      },
    },
    {
      drawPosition: 3,
      expectation: {
        groupOrder: 3,
        setsWon: 5,
        setsLost: 3,
        gamesWon: 24,
        gamesLost: 23,
      },
    },
    {
      drawPosition: 4,
      expectation: {
        groupOrder: 4,
        setsWon: 4,
        setsLost: 4,
        gamesWon: 24,
        gamesLost: 23,
      },
    },
    {
      drawPosition: 5,
      expectation: {
        groupOrder: 1,
        setsWon: 6,
        setsLost: 2,
        gamesWon: 26,
        gamesLost: 12,
      },
    },
  ];

  expectations.forEach(({ drawPosition, expectation }) => {
    const assignment = positionAssignments.find(
      (assignment) => assignment.drawPosition === drawPosition
    );
    const {
      extension: { value: participantResults },
    } = findExtension({
      element: assignment,
      name: 'tally',
    });
    Object.keys(expectation).forEach((key) => {
      expect(participantResults[key]).toEqual(expectation[key]);
    });
  });
});
