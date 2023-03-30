import { mocksEngine, scaleEngine, tournamentEngine } from '../../../..';
import { getAwardProfile } from '../getTournamentPoints';
import { expect, it } from 'vitest';

import { POLICY_TYPE_RANKING_POINTS } from '../../../../constants/policyConstants';
import { COMPASS } from '../../../../constants/drawDefinitionConstants';

const awardProfiles = [
  {
    flights: { flightNumbers: [1, 2], 2: 0.5 },
    finishingPositionPoints: { participationOrders: [1] }, // only assign points for finishing positions when participationOrder: 1
    perWinPoints: [{ participationOrders: [2, 3, 4, 5], value: 105 }],
    finishingPositionRanges: {
      1: { value: 3000 },
      2: { value: 2400 },
      3: { value: 1950 },
      4: { value: 1800 },
      8: { value: 1110 },
      16: { value: 750 },
      32: { value: 450 },
      64: { value: 270 },
      128: { value: 120 },
      256: { value: 90 },
    },
  },
];

const awardProfileLevels = [
  {
    finishingPositionPoints: { participationOrders: [1] }, // only assign points for finishing positions when participationOrder: 1
    perWinPoints: [
      {
        participationOrders: [2, 3, 4, 5],
        level: { 1: 105, 2: 62, 3: 32, 4: 19, 5: 11 },
      },
    ],
    finishingPositionRanges: {
      1: [{ level: { 1: 3000, 2: 1650, 3: 900, 4: 540, 5: 300 } }],
      2: [{ level: { 1: 2400, 2: 1238, 3: 675, 4: 405, 5: 225 } }],
      3: [{ level: { 1: 1950, 2: 990, 3: 540, 4: 324, 5: 180 } }],
      4: [{ level: { 1: 1800, 2: 825, 3: 450, 4: 270, 5: 150 } }],
      8: [{ level: { 1: 1110, 2: 578, 3: 315, 4: 189, 5: 105 } }],
      16: [{ level: { 1: 750, 2: 297, 3: 162, 4: 97, 5: 54 } }],
      32: [{ level: { 1: 450, 2: 165, 3: 90, 4: 54, 5: 30 } }],
      64: [{ level: { 1: 270, 2: 99, 3: 54, 4: 32, 5: 18 } }],
      128: [{ level: { 1: 120, 2: 66, 3: 36, 4: 22, 5: 12 } }],
      256: [{ level: { 1: 90, 2: 33, 3: 18, 4: 11, 5: 6 } }],
    },
  },
];

const winMap = 0;
const positionKey = 1;
const pointTotal = 2;

// prettier-ignore
const fpMapExpectation = [
    [[5], '1-1', 3000],
    [[4], '2-2', 2400],
    [[3], '3-4', 1800],
    [[3], '3-4', 1800],
    [[2, 2], '5-5', 1320],
    [[2, 1], '6-6', 1215],
    [[2, 0], '7-8', 1110],
    [[2, 0], '7-8', 1110],
    [[1, 3], '9-9', 1065],
    [[1, 2], '10-10', 960],
    [[1, 1], '11-12', 855],
    [[1, 1], '11-12', 855],
    [[1, 0, 2], '13-13', 960],
    [[1, 0, 1], '14-14', 855],
    [[1, 0, 0], '15-16', 750],
    [[1, 0, 0], '15-16', 750],
    [[0, 4], '17-17', 870],
    [[0, 3], '18-18', 765],
    [[0, 2], '19-20', 660],
    [[0, 2], '19-20', 660],
    [[0, 1, 2], '21-21', 765],
    [[0, 1, 1], '22-22', 660],
    [[0, 1, 0], '23-24', 555],
    [[0, 1, 0], '23-24', 555],
    [[0, 0, 3], '25-25', 765],
    [[0, 0, 2], '26-26', 660],
    [[0, 0, 1], '27-28', 555],
    [[0, 0, 1], '27-28', 555],
    [[0, 0, 0, 2], '29-29', 660],
    [[0, 0, 0, 1], '30-30', 555],
    [[0, 0, 0, 0], '31-32', 450],
    [[0, 0, 0, 0], '31-32', 450],
  ];

const getFpMap = (participants, personPoints) =>
  participants
    .filter((p) => p.person)
    .map((participant) => [
      participant.draws[0].structureParticipation.map(
        ({ winCount }) => winCount
      ),
      participant.draws[0].finishingPositionRange.join('-'),
      personPoints[participant.person.personId]?.[0]?.points,
    ]);

const finishingPositionSort = (a, b) =>
  a.draws[0].finishingPositionRange[0] - b.draws[0].finishingPositionRange[0];

const policyDefinitions = {
  [POLICY_TYPE_RANKING_POINTS]: {
    requireWinDefault: false,
    awardProfiles,
  },
};

it('supports finishingPositionRanges definitions with or without level', () => {
  const drawProfiles = [{ drawType: COMPASS, drawSize: 32 }];
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    completeAllMatchUps: true,
    drawProfiles,
  });

  let result = tournamentEngine.setState(tournamentRecord);
  const participants = tournamentEngine
    .getParticipants({
      withRankingProfile: true,
    })
    .participants.sort(finishingPositionSort);

  const awardCriteria = {};
  const { awardProfile } = getAwardProfile({
    awardProfiles,
    ...awardCriteria,
  });
  expect(awardProfile).not.toBeUndefined();

  result = scaleEngine.getTournamentPoints({ policyDefinitions });
  expect(result.success).toEqual(true);
  let personPoints = result.personPoints;

  let fpMap = getFpMap(participants, personPoints);

  expect(fpMap).toEqual(fpMapExpectation);

  // use awardProfiles with levels
  policyDefinitions[POLICY_TYPE_RANKING_POINTS].awardProfiles =
    awardProfileLevels;

  result = scaleEngine.getTournamentPoints({ policyDefinitions, level: 1 });
  expect(result.success).toEqual(true);
  personPoints = result.personPoints;

  fpMap = getFpMap(participants, personPoints);

  expect(fpMap).toEqual(fpMapExpectation);
});

const awardProfileThresholds = [
  {
    finishingPositionRanges: {
      1: [
        { drawSize: 64, threshold: true, value: 3000 }, // threshold means any drawSize >= that defined will match
        { drawSizes: [], value: 2800 },
      ],
      2: [
        { drawSize: 64, threshold: true, value: 2400 },
        { drawSize: 16, threshold: true, value: 2000 },
        { drawSizes: [], value: 1800 },
      ],
      3: [{ value: 1950 }],
      4: [
        { drawSize: 64, threshold: true, value: 1800 },
        { drawSizes: [32, 8], value: 1750 },
        { drawSize: 4, threshold: true, value: 1775 },
      ],
      8: [{ value: 1110 }],
      16: [{ value: 750 }],
      32: [{ value: 450 }],
      64: [{ value: 270 }],
      128: [{ value: 120 }],
      256: [{ value: 90 }],
    },
  },
];
const scenarios = [
  {
    drawSize: 64,
    expectations: [
      { positionKey: '1-1', pointTotal: 3000, winMap: [6] },
      { positionKey: '2-2', pointTotal: 2400, winMap: [5] },
      { positionKey: '3-4', pointTotal: 1800, winMap: [4] },
    ],
  },
  {
    drawSize: 32,
    expectations: [
      { positionKey: '1-1', pointTotal: 2800, winMap: [5] },
      { positionKey: '2-2', pointTotal: 2000, winMap: [4] },
      { positionKey: '3-4', pointTotal: 1750, winMap: [3] },
    ],
  },
  {
    drawSize: 16,
    expectations: [
      { positionKey: '1-1', pointTotal: 2800, winMap: [4] },
      { positionKey: '2-2', pointTotal: 2000, winMap: [3] },
      { positionKey: '3-3', pointTotal: 1950, winMap: [2, 1] },
      { positionKey: '4-4', pointTotal: 1775, winMap: [2, 0] },
    ],
  },
  {
    drawSize: 8,
    expectations: [
      { positionKey: '1-1', pointTotal: 2800, winMap: [3] },
      { positionKey: '2-2', pointTotal: 1800, winMap: [2] },
      { positionKey: '3-3', pointTotal: 1950, winMap: [1, 1] },
      { positionKey: '4-4', pointTotal: 1750, winMap: [1, 0] },
    ],
  },
  {
    drawSize: 4,
    expectations: [
      { positionKey: '1-1', pointTotal: 2800, winMap: [2] },
      { positionKey: '2-2', pointTotal: 1800, winMap: [1] },
      { positionKey: '3-3', pointTotal: 1950, winMap: [0, 1] },
      { positionKey: '4-4', pointTotal: 1775, winMap: [0, 0] },
    ],
  },
];

it.each(scenarios)('supports drawSize thresholds', (scenario) => {
  const drawProfiles = [{ drawType: COMPASS, drawSize: scenario.drawSize }];
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    completeAllMatchUps: true,
    drawProfiles,
  });

  let result = tournamentEngine.setState(tournamentRecord);
  const participants = tournamentEngine
    .getParticipants({
      withRankingProfile: true,
    })
    .participants.sort(finishingPositionSort);

  // use awardProfiles with thresholds
  policyDefinitions[POLICY_TYPE_RANKING_POINTS].awardProfiles =
    awardProfileThresholds;

  result = scaleEngine.getTournamentPoints({ policyDefinitions });
  expect(result.success).toEqual(true);
  const personPoints = result.personPoints;

  let fpMap = getFpMap(participants, personPoints);

  for (const expectation of scenario.expectations) {
    let target = fpMap.find((e) => e[positionKey] === expectation.positionKey);
    if (target) {
      if (expectation.pointTotal) {
        expect(target[pointTotal]).toEqual(expectation.pointTotal);
      } else {
        console.log({ pointTotal: expectation.pointTotal });
      }
      if (expectation.winMap) {
        expect(target[winMap]).toEqual(expectation.winMap);
      } else {
        console.log({ winMap: expectation.winMap });
      }
    }
  }
});

// prettier-ignore
const requireWinScenarios = [
  { drawSize: 8, requireWinFirstRound: true, requireWin: false, totalPointsAwarded: 9150, },
  { drawSize: 8, requireWinFirstRound: false, requireWin: false, totalPointsAwarded: 13590, },
  { drawSize: 8, requireWinFirstRound: false, requireWin: true, totalPointsAwarded: 9150, },
  { drawSize: 16, requireWinFirstRound: true, requireWin: false, totalPointsAwarded: 13590, },
  { drawSize: 16, requireWinFirstRound: false, requireWin: false, totalPointsAwarded: 19590, },
  { drawSize: 16, requireWinFirstRound: false, requireWin: true, totalPointsAwarded: 13590, },
];

it.only.each(requireWinScenarios)(
  'supports requiredWins for a complete awardProfile or for discrete finishingPositions',
  (scenario) => {
    const drawProfiles = [{ drawType: COMPASS, drawSize: scenario.drawSize }];
    const { tournamentRecord } = mocksEngine.generateTournamentRecord({
      completeAllMatchUps: true,
      drawProfiles,
    });

    let result = tournamentEngine.setState(tournamentRecord);
    const participants = tournamentEngine
      .getParticipants({
        withRankingProfile: true,
      })
      .participants.sort(finishingPositionSort);

    const awardProfileRequiredWins = [
      {
        requireWinFirstRound: scenario.requireWinFirstRound,
        finishingPositionRanges: {
          1: { value: 3000 },
          2: { value: 2400 },
          3: { value: 1950 },
          4: { value: 1800 },
          8: [
            { drawSize: 8, requireWin: scenario.requireWin, value: 1110 },
            { value: 1110 },
          ],
          16: [
            { drawSize: 16, requireWin: scenario.requireWin, value: 750 },
            { value: 750 },
          ],
        },
      },
    ];

    // use awardProfiles with requiredWins
    policyDefinitions[POLICY_TYPE_RANKING_POINTS].awardProfiles =
      awardProfileRequiredWins;

    result = scaleEngine.getTournamentPoints({ policyDefinitions });
    expect(result.success).toEqual(true);
    let personPoints = result.personPoints;

    let fpMap = getFpMap(participants, personPoints);
    const totalPointsAwarded = fpMap
      .map((entry) => entry[pointTotal])
      .reduce((a, b) => (a || 0) + (b || 0), 0);
    expect(totalPointsAwarded).toEqual(scenario.totalPointsAwarded);
  }
);
