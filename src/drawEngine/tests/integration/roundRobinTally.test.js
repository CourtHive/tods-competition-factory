import { tallyParticipantResults } from '../../governors/scoreGovernor/roundRobinTally/roundRobinTally';
import { findExtension } from '../../../tournamentEngine/governors/queryGovernor/extensionQueries';
import { toBePlayed } from '../../../fixtures/scoring/outcomes/toBePlayed';
import { getPositionAssignments } from '../../getters/positionsGetter';
import tournamentEngine from '../../../tournamentEngine/sync';
import { intersection } from '../../../utilities';
import mocksEngine from '../../../mocksEngine';
import drawEngine from '../../sync';

import { SINGLES } from '../../../constants/eventConstants';
import { ROUND_ROBIN } from '../../../constants/drawDefinitionConstants';
import {
  FORMAT_SHORT_SETS,
  FORMAT_STANDARD,
} from '../../../fixtures/scoring/matchUpFormats/formatConstants';

it('can recalculate participantResults when outcomes are removed', () => {
  const drawProfiles = [
    {
      drawSize: 4,
      participantsCount: 4,
      drawType: ROUND_ROBIN,
      outcomes: [
        {
          drawPositions: [1, 2],
          scoreString: '6-1 6-2',
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

  let { drawDefinition } = tournamentEngine.getEvent({ drawId });
  let mainStructure = drawDefinition.structures[0];

  let { matchUps } = tournamentEngine.allDrawMatchUps({
    drawId,
    inContext: true,
  });
  let { participantResults } = tallyParticipantResults({
    matchUps,
  });
  expect(Object.keys(participantResults).length).toEqual(2);

  let { positionAssignments } = getPositionAssignments({
    structure: mainStructure,
  });
  let dp1 = getDrawPositionTally({ positionAssignments, drawPosition: 1 });
  expect(dp1.result).toEqual('1/0');

  // now remove the one matchUp outcome
  const { matchUpId } = matchUps.find(
    ({ drawPositions }) => intersection(drawPositions, [1, 2]).length === 2
  );
  let result = tournamentEngine.setMatchUpStatus({
    drawId,
    matchUpId,
    outcome: toBePlayed,
  });
  expect(result.success).toEqual(true);

  ({ matchUps } = tournamentEngine.allDrawMatchUps({
    drawId,
    inContext: true,
  }));
  ({ participantResults } = tallyParticipantResults({
    matchUps,
  }));

  expect(Object.keys(participantResults).length).toEqual(0);
  ({ drawDefinition } = tournamentEngine.getEvent({ drawId }));
  mainStructure = drawDefinition.structures[0];
  ({ positionAssignments } = getPositionAssignments({
    structure: mainStructure,
  }));
  dp1 = getDrawPositionTally({ positionAssignments, drawPosition: 1 });
  expect(dp1).toBeUndefined();
});

it('calculate participantResult values are present for all drawPositions', () => {
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
    });
  });
});

it('properly calculates short sets', () => {
  const drawProfiles = [
    {
      drawSize: 5,
      eventType: SINGLES,
      participantsCount: 5,
      matchUpFormat: FORMAT_SHORT_SETS,
      drawType: ROUND_ROBIN,
      structureOptions: { groupSize: 5 },
      outcomes: [
        {
          drawPositions: [1, 2],
          scoreString: '4-0 4-1',
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
  const mainStructure = drawDefinition.structures[0];
  const { positionAssignments } = getPositionAssignments({
    structure: mainStructure,
  });

  const dp1 = getDrawPositionTally({ positionAssignments, drawPosition: 1 });
  expect(dp1.setsWon).toEqual(0);
  expect(dp1.setsLost).toEqual(2);
  expect(dp1.gamesWon).toEqual(1);
  expect(dp1.gamesLost).toEqual(8);
  expect(dp1.matchUpsWon).toEqual(0);
  expect(dp1.matchUpsLost).toEqual(1);
  expect(dp1.result).toEqual('0/1');
  expect(dp1.games).toEqual('1/8');
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
        gamesWon: 24,
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
        gamesLost: 21,
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

  const { drawDefinition } = tournamentEngine.getEvent({ drawId });
  const mainStructure = drawDefinition.structures[0];
  const { positionAssignments } = getPositionAssignments({
    structure: mainStructure,
  });

  const { eventData } = tournamentEngine.getEventData({ drawId });
  const participantResults =
    eventData.drawsData[0].structures[0].participantResults;

  // check the expectations against both the positionAssignments for the structure
  // and the eventData payload that is intended for presentation
  expectations.forEach(({ drawPosition, expectation }) => {
    const assignment = positionAssignments.find(
      (assignment) => assignment.drawPosition === drawPosition
    );
    const {
      extension: { value: participantResult },
    } = findExtension({
      element: assignment,
      name: 'tally',
    });
    const eventParticipantResult = participantResults.find(
      (result) => result.drawPosition === drawPosition
    ).participantResult;
    Object.keys(expectation).forEach((key) => {
      expect(participantResult[key]).toEqual(expectation[key]);
      expect(eventParticipantResult[key]).toEqual(expectation[key]);
    });
  });
});

it('RR Format Standard tally test', () => {
  const drawProfiles = [
    {
      drawSize: 4,
      eventType: SINGLES,
      participantsCount: 4,
      matchUpFormat: FORMAT_STANDARD,
      drawType: ROUND_ROBIN,
      outcomes: [
        {
          drawPositions: [1, 2],
          scoreString: '6-1 6-1',
          winningSide: 1,
        },
        {
          drawPositions: [1, 3],
          scoreString: '6-1 6-1',
          winningSide: 2,
        },
        {
          drawPositions: [1, 4],
          scoreString: '6-1 6-1',
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

  const { drawDefinition } = tournamentEngine.getEvent({ drawId });
  const { structureId } = drawDefinition.structures[0];
  const { positionAssignments } = tournamentEngine.getPositionAssignments({
    drawId,
    structureId,
  });
  const dp1 = getDrawPositionTally({
    positionAssignments,
    drawPosition: 1,
  });
  expect(dp1.setsWon).toEqual(4);
  expect(dp1.setsLost).toEqual(2);
  expect(dp1.gamesWon).toEqual(26);
  expect(dp1.gamesLost).toEqual(16);
  expect(dp1.matchUpsWon).toEqual(2);
  expect(dp1.matchUpsLost).toEqual(1);
  expect(dp1.result).toEqual('2/1');
  expect(dp1.games).toEqual('26/16');

  const dp2 = getDrawPositionTally({
    positionAssignments,
    drawPosition: 2,
  });
  expect(dp2.setsWon).toEqual(0);
  expect(dp2.setsLost).toEqual(2);
  expect(dp2.gamesWon).toEqual(2);
  expect(dp2.gamesLost).toEqual(12);
  expect(dp2.matchUpsWon).toEqual(0);
  expect(dp2.matchUpsLost).toEqual(1);
  expect(dp2.result).toEqual('0/1');
  expect(dp2.games).toEqual('2/12');

  const dp3 = getDrawPositionTally({
    positionAssignments,
    drawPosition: 3,
  });
  expect(dp3.setsWon).toEqual(2);
  expect(dp3.setsLost).toEqual(0);
  expect(dp3.gamesWon).toEqual(12);
  expect(dp3.gamesLost).toEqual(2);
  expect(dp3.matchUpsWon).toEqual(1);
  expect(dp3.matchUpsLost).toEqual(0);
  expect(dp3.result).toEqual('1/0');
  expect(dp3.games).toEqual('12/2');
});

function getDrawPositionTally({ positionAssignments, drawPosition }) {
  return positionAssignments
    .find((assignment) => assignment.drawPosition === drawPosition)
    .extensions.find(({ name }) => name === 'tally')?.value;
}

it('recognize when participants are tied with position order', () => {
  const drawProfiles = [
    {
      drawSize: 5,
      eventType: SINGLES,
      participantsCount: 5,
      matchUpFormat: FORMAT_STANDARD,
      drawType: ROUND_ROBIN,
      structureOptions: { groupSize: 5 },
      outcomes: [
        {
          drawPositions: [1, 2],
          scoreString: '6-0 6-0',
          winningSide: 1,
        },
        {
          drawPositions: [1, 3],
          scoreString: '6-0 6-0',
          winningSide: 1,
        },
        {
          drawPositions: [1, 4],
          scoreString: '6-0 6-0',
          winningSide: 2,
        },
        {
          drawPositions: [1, 5],
          scoreString: '6-0 6-0',
          winningSide: 2,
        },
        {
          drawPositions: [2, 3],
          scoreString: '6-0 6-0',
          winningSide: 2,
        },
        {
          drawPositions: [2, 4],
          scoreString: '6-0 6-0',
          winningSide: 1,
        },
        {
          drawPositions: [2, 5],
          scoreString: '6-0 6-0',
          winningSide: 1,
        },
        {
          drawPositions: [3, 4],
          scoreString: '6-0 6-0',
          winningSide: 1,
        },
        {
          drawPositions: [3, 5],
          scoreString: '6-0 6-0',
          winningSide: 2,
        },
        {
          drawPositions: [4, 5],
          scoreString: '6-0 6-0',
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

  let { drawDefinition } = tournamentEngine.getEvent({ drawId });
  let structure = drawDefinition.structures[0];
  const { structureId } = structure.structures[0];
  let { positionAssignments } = getPositionAssignments({
    structure,
  });

  let { eventData } = tournamentEngine.getEventData({ drawId });
  let participantResults =
    eventData.drawsData[0].structures[0].participantResults;

  // check the expectations against both the positionAssignments for the structure
  // and the eventData payload that is intended for presentation
  positionAssignments.forEach((assignment) => {
    const { drawPosition } = assignment;
    const result = participantResults.find(
      (result) => result.drawPosition === drawPosition
    ).participantResult;
    const {
      extension: { value: participantResult },
    } = findExtension({
      element: assignment,
      name: 'tally',
    });

    const {
      matchUpsWon,
      matchUpsLost,
      setsWon,
      setsLost,
      gamesWon,
      gamesLost,
      groupOrder,
    } = participantResult;

    const check = [
      matchUpsWon,
      matchUpsLost,
      setsWon,
      setsLost,
      gamesWon,
      gamesLost,
      groupOrder,
    ];

    expect(check).toEqual([2, 2, 4, 4, 24, 24, 1]);

    // check that the results in eventData are equivalent
    expect(result).toEqual(participantResult);
  });

  let result = tournamentEngine.setSubOrder({
    drawId,
    structureId,
    drawPosition: 1,
    subOrder: 2,
  });
  expect(result.success).toEqual(true);
  result = tournamentEngine.setSubOrder({
    drawId,
    structureId,
    drawPosition: 2,
    subOrder: 3,
  });
  expect(result.success).toEqual(true);
  result = tournamentEngine.setSubOrder({
    drawId,
    structureId,
    drawPosition: 3,
    subOrder: 1,
  });
  expect(result.success).toEqual(true);

  ({ eventData } = tournamentEngine.getEventData({ drawId }));
  participantResults = eventData.drawsData[0].structures[0].participantResults;

  ({ drawDefinition } = tournamentEngine.getEvent({ drawId }));
  structure = drawDefinition.structures[0];
  ({ positionAssignments } = getPositionAssignments({
    structure,
  }));

  const {
    extension: { value: tally },
  } = findExtension({
    element: positionAssignments[0],
    name: 'tally',
  });
  expect(tally.subOrder).toEqual(
    participantResults[0].participantResult.subOrder
  );
});
