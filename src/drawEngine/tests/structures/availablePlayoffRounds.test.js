import { getAvailablePlayoffRounds } from '../../governors/structureGovernor/getAvailablePlayoffRounds';
import { reset, initialize, mainDrawPositions } from '../primitives/primitives';
import tournamentEngine from '../../../tournamentEngine/sync';
import mocksEngine from '../../../mocksEngine';
import { setSubscriptions } from '../../..';
import { drawEngine } from '../../sync';
import { expect, it } from 'vitest';

import { COMPLETED } from '../../../constants/matchUpStatusConstants';
import { ADD_MATCHUPS } from '../../../constants/topicConstants';
import {
  CONSOLATION,
  FEED_IN,
  FEED_IN_CHAMPIONSHIP,
  FEED_IN_CHAMPIONSHIP_TO_R16,
  FIRST_MATCH_LOSER_CONSOLATION,
  MAIN,
  PLAY_OFF,
  ROUND_ROBIN_WITH_PLAYOFF,
} from '../../../constants/drawDefinitionConstants';

tournamentEngine.devContext(true);

it('can correctly determine positions playedOff for STANDARD_ELIMINATION', () => {
  reset();
  initialize();
  mainDrawPositions({ drawSize: 16 });
  const result = drawEngine.generateDrawTypeAndModifyDrawDefinition();
  expect(result.success).toEqual(true);

  const { drawDefinition } = drawEngine.getState();

  const {
    structures: [{ structureId }],
  } = result;

  const { playoffRounds, playoffRoundsRanges } = getAvailablePlayoffRounds({
    drawDefinition,
    structureId,
  });
  expect(playoffRounds).toEqual([1, 2, 3]);
  expect(playoffRoundsRanges[0]).toEqual({
    roundNumber: 1,
    finishingPositionRange: '9-16',
    finishingPositions: [9, 10, 11, 12, 13, 14, 15, 16],
  });
  expect(playoffRoundsRanges[1]).toEqual({
    roundNumber: 2,
    finishingPositionRange: '5-8',
    finishingPositions: [5, 6, 7, 8],
  });
  expect(playoffRoundsRanges[2]).toEqual({
    roundNumber: 3,
    finishingPositionRange: '3-4',
    finishingPositions: [3, 4],
  });
});

it('can correctly determine positions playedOff for FIRST_MATCH_LOSER_CONSOLATION', () => {
  reset();
  initialize();
  mainDrawPositions({ drawSize: 16 });
  const result = drawEngine.generateDrawTypeAndModifyDrawDefinition({
    drawType: FIRST_MATCH_LOSER_CONSOLATION,
  });
  expect(result.success).toEqual(true);

  const {
    structures: [{ structureId }],
  } = result;

  const { drawDefinition } = drawEngine.getState();

  const { playoffRounds, playoffRoundsRanges, positionsPlayedOff } =
    getAvailablePlayoffRounds({
      drawDefinition,
      structureId,
    });

  expect(positionsPlayedOff).toEqual([1, 2, 9, 10]);

  // NOTE: Change was made to allow FMLC playoff round from 2nd round MAIN
  expect(playoffRounds).toEqual([2, 3]);
  expect(playoffRoundsRanges).toEqual([
    {
      roundNumber: 2,
      finishingPositions: [5, 6, 7, 8],
      finishingPositionRange: '5-8',
    },
    {
      roundNumber: 3,
      finishingPositions: [3, 4],
      finishingPositionRange: '3-4',
    },
  ]);
});

it('will allow generation of 3-4 playoffs in FMLC if there are players who COULD progress', () => {
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [
      {
        drawType: FIRST_MATCH_LOSER_CONSOLATION,
        participantsCount: 6,
        drawSize: 8,
      },
    ],
  });

  let result = tournamentEngine.setState(tournamentRecord);
  expect(result.success).toEqual(true);

  result = tournamentEngine.getAvailablePlayoffRounds({ drawId });
  const { positionsPlayedOff } = result;
  const { playoffRounds, playoffRoundsRanges } =
    result.availablePlayoffRounds[0];

  expect(positionsPlayedOff).toEqual([1, 2, 5, 6]);

  expect(playoffRounds).toEqual([2]);
  expect(playoffRoundsRanges).toEqual([
    {
      roundNumber: 2,
      finishingPositions: [3, 4],
      finishingPositionRange: '3-4',
    },
  ]);
});

it('will exclude playoff rounds where participants have progressed to other structures', () => {
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [
      {
        drawType: FIRST_MATCH_LOSER_CONSOLATION,
        participantsCount: 6,
        drawSize: 8,
        outcomes: [
          {
            roundNumber: 1,
            roundPosition: 2,
            winningSide: 1,
          },
          {
            roundNumber: 1,
            roundPosition: 3,
            winningSide: 2,
          },
          {
            roundNumber: 2,
            roundPosition: 1,
            winningSide: 2,
          },
        ],
      },
    ],
  });

  let result = tournamentEngine.setState(tournamentRecord);
  expect(result.success).toEqual(true);

  result = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpStatuses: [COMPLETED] },
  });
  expect(result.matchUps.length).toEqual(3);

  result = tournamentEngine.getAvailablePlayoffRounds({ drawId });
  const { positionsPlayedOff } = result;
  const { playoffRounds, playoffRoundsRanges } =
    result.availablePlayoffRounds[0];

  expect(positionsPlayedOff).toEqual([1, 2, 5, 6]);
  expect(playoffRounds).toEqual([]);
  expect(playoffRoundsRanges).toEqual([]);
});

it('can accurately determine no playoff rounds available for MAIN draw of FIC', () => {
  const drawProfiles = [
    {
      drawSize: 64,
      drawType: FEED_IN_CHAMPIONSHIP,
    },
  ];
  const {
    drawIds: [drawId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({ drawProfiles });

  const { drawDefinition } = tournamentEngine
    .setState(tournamentRecord)
    .getEvent({ drawId });

  const {
    structures: [mainStructure],
  } = drawEngine
    .setState(drawDefinition)
    .getDrawStructures({ stage: MAIN, stageSequence: 1 });

  const { structureId } = mainStructure;
  const result = tournamentEngine.getAvailablePlayoffRounds({
    drawDefinition,
    structureId,
  });
  expect(result.playoffRounds).toEqual([]);
});

it('can accurately determine available playoff rounds for CONSOLATION draw of FIC', () => {
  const drawProfiles = [
    {
      drawSize: 64,
      drawType: FEED_IN_CHAMPIONSHIP,
    },
  ];
  const {
    drawIds: [drawId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({ drawProfiles });

  const { drawDefinition } = tournamentEngine
    .setState(tournamentRecord)
    .getEvent({ drawId });

  const {
    structures: [consolationStructure],
  } = drawEngine
    .setState(drawDefinition)
    .getDrawStructures({ stage: CONSOLATION, stageSequence: 1 });

  const { structureId } = consolationStructure;
  const result = tournamentEngine.getAvailablePlayoffRounds({
    drawDefinition,
    structureId,
  });
  expect(result.playoffRounds).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
});

it('can generate only specified playoff rounds and give them custom names', () => {
  const allMatchUps = [];
  let matchUpAddNotices = [];

  const subscriptions = {
    [ADD_MATCHUPS]: (payload) => {
      if (Array.isArray(payload)) {
        payload.forEach(({ matchUps }) => {
          matchUpAddNotices.push(matchUps.length);
          allMatchUps.push(...matchUps);
        });
      }
    },
  };

  setSubscriptions({ subscriptions });

  const drawProfiles = [
    {
      drawSize: 64,
      drawType: FEED_IN_CHAMPIONSHIP,
    },
  ];
  const {
    drawIds: [drawId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({ drawProfiles });

  let { drawDefinition } = tournamentEngine
    .setState(tournamentRecord)
    .getEvent({ drawId });

  const {
    structures: [consolationStructure],
  } = drawEngine
    .setState(drawDefinition)
    .getDrawStructures({ stage: CONSOLATION, stageSequence: 1 });

  const { structureId } = consolationStructure;

  const playoffAttributes = {
    '0-2': { name: 'BRONZE', abbreviation: 'B' },
  };
  const result = tournamentEngine.addPlayoffStructures({
    exitProfileLimit: true,
    roundNumbers: [2],
    playoffAttributes,
    structureId,
    drawId,
  });
  expect(result.success).toEqual(true);
  ({ drawDefinition } = tournamentEngine.getEvent({ drawId }));
  const structureNames = drawDefinition.structures.map((s) => s.structureName);
  expect(structureNames).toEqual(['MAIN', 'CONSOLATION', 'BRONZE']);
  expect(drawDefinition.links.length).toEqual(7);

  expect(matchUpAddNotices).toEqual([125, 15]);
});

it('can use roundProfiles to specify depth of playoff structures', () => {
  const allMatchUps = [];
  let matchUpAddNotices = [];

  const subscriptions = {
    [ADD_MATCHUPS]: (payload) => {
      if (Array.isArray(payload)) {
        payload.forEach(({ matchUps }) => {
          matchUpAddNotices.push(matchUps.length);
          allMatchUps.push(...matchUps);
        });
      }
    },
  };

  setSubscriptions({ subscriptions });

  const drawProfiles = [
    {
      drawSize: 64,
      drawType: FEED_IN_CHAMPIONSHIP,
    },
  ];
  const {
    drawIds: [drawId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({ drawProfiles });

  let { drawDefinition } = tournamentEngine
    .setState(tournamentRecord)
    .getEvent({ drawId });

  const {
    structures: [consolationStructure],
  } = drawEngine
    .setState(drawDefinition)
    .getDrawStructures({ stage: CONSOLATION, stageSequence: 1 });

  const { structureId } = consolationStructure;

  // in this case a playoff structure is being added to a consolstion structure
  const result = tournamentEngine.addPlayoffStructures({
    roundProfiles: [{ 2: 1 }],
    exitProfileLimit: true,
    structureId,
    drawId,
  });
  expect(result.success).toEqual(true);
  ({ drawDefinition } = tournamentEngine.getEvent({ drawId }));
  expect(drawDefinition.structures.length).toEqual(3);
  expect(drawDefinition.links.length).toEqual(7);

  expect(matchUpAddNotices).toEqual([125, 15]);
});

it('can determine playoff structures available from playoff structures', () => {
  const allMatchUps = [];
  let matchUpAddNotices = [];

  const subscriptions = {
    [ADD_MATCHUPS]: (payload) => {
      if (Array.isArray(payload)) {
        payload.forEach(({ matchUps }) => {
          matchUpAddNotices.push(matchUps.length);
          allMatchUps.push(...matchUps);
        });
      }
    },
  };

  setSubscriptions({ subscriptions });

  // generate a standard elimination draw
  const drawProfiles = [
    {
      drawSize: 64,
    },
  ];
  const {
    drawIds: [drawId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({ drawProfiles });

  tournamentEngine.setState(tournamentRecord);

  let { drawDefinition } = tournamentEngine.getEvent({ drawId });

  const mainStructure = drawDefinition.structures[0];
  let { structureId } = mainStructure;

  let { playoffRoundsRanges } = tournamentEngine.getAvailablePlayoffRounds({
    drawId,
    structureId,
  });

  const fourthRound = playoffRoundsRanges.find(
    ({ roundNumber }) => roundNumber === 4
  );
  expect(fourthRound.finishingPositionRange).toEqual('5-8');

  const result = tournamentEngine.addPlayoffStructures({
    roundProfiles: [{ 4: 1 }],
    exitProfileLimit: true,
    structureId,
    drawId,
  });
  expect(result.success).toEqual(true);

  ({ drawDefinition } = tournamentEngine.getEvent({ drawId }));
  expect(drawDefinition.structures.length).toEqual(2);
  expect(drawDefinition.structures[1].structureName).toEqual('5-8');

  ({ structureId } = drawDefinition.structures[1]);

  ({ playoffRoundsRanges } = tournamentEngine.getAvailablePlayoffRounds({
    structureId,
    drawId,
  }));

  expect(playoffRoundsRanges.length).toEqual(1);
  expect(playoffRoundsRanges[0].finishingPositionRange).toEqual('7-8');

  expect(matchUpAddNotices).toEqual([63, 3]);
});

it('can determine available playoff rounds for CONSOLATION draw of FEED_IN', () => {
  const drawProfiles = [
    {
      drawSize: 56,
      drawType: FEED_IN,
    },
  ];
  const {
    drawIds: [drawId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({ drawProfiles });

  const { drawDefinition } = tournamentEngine
    .setState(tournamentRecord)
    .getEvent({ drawId });

  const {
    structures: [mainStructure],
  } = drawEngine
    .setState(drawDefinition)
    .getDrawStructures({ stage: MAIN, stageSequence: 1 });

  const { structureId } = mainStructure;
  const { playoffRounds } = tournamentEngine.getAvailablePlayoffRounds({
    drawDefinition,
    structureId,
  });
  expect(playoffRounds).toEqual([1, 2, 3, 4, 5, 6]);
});

it('can determine playoff structures available from playoff structures', () => {
  const drawProfiles = [
    {
      drawSize: 64,
      drawType: FEED_IN_CHAMPIONSHIP_TO_R16,
    },
  ];
  const {
    drawIds: [drawId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({ drawProfiles });

  tournamentEngine.setState(tournamentRecord);

  let { positionsPlayedOff, availablePlayoffRounds } =
    tournamentEngine.getAvailablePlayoffRounds({
      drawId,
    });

  expect(positionsPlayedOff).toEqual([1, 2, 9, 10]);
  expect(availablePlayoffRounds.length).toEqual(2);
  expect(availablePlayoffRounds[0].playoffRounds).toEqual([4, 5]);
  expect(availablePlayoffRounds[1].playoffRounds).toEqual([1, 2, 3, 4, 5, 6]);
});

it('can determine playoff structures available from Round Robin playoff structures', () => {
  const structureOptions = {
    playoffGroups: [
      { finishingPositions: [1], structureName: 'Gold Flight' },
      { finishingPositions: [2], structureName: 'Silver Flight' },
      { finishingPositions: [3], structureName: 'Bronze Flight' },
      { finishingPositions: [4], structureName: 'Green Flight' },
      { finishingPositions: [5], structureName: 'Red Flight' },
    ],
    groupSize: 5,
  };
  const drawProfiles = [
    {
      drawType: ROUND_ROBIN_WITH_PLAYOFF,
      structureOptions,
      drawSize: 15,
    },
  ];
  const {
    drawIds: [drawId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({ drawProfiles });

  tournamentEngine.setState(tournamentRecord);

  let { positionsPlayedOff, availablePlayoffRounds } =
    tournamentEngine.getAvailablePlayoffRounds({
      drawId,
    });

  expect(positionsPlayedOff).toEqual([
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
  ]);
  availablePlayoffRounds.forEach((round) =>
    expect(round.playoffRoundsRanges).toEqual([])
  );
  const finishingPositionRanges = tournamentEngine
    .allTournamentMatchUps({
      contextFilters: { stages: [PLAY_OFF], roundNumber: 1 },
    })
    .matchUps.map(({ finishingPositionRange }) => finishingPositionRange);

  // expect that the loser range is an equivalent number for both loser[0] and loser[1]
  // this is testing the condition where there are only 3 positions to be played off for each playoff structure
  finishingPositionRanges.forEach(({ loser }) =>
    expect(loser[0]).toEqual(loser[1])
  );
});
