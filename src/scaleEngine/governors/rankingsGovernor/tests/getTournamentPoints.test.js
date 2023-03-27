import { mocksEngine, scaleEngine, tournamentEngine } from '../../../..';
import { getAwardProfile } from '../getTournamentPoints';
import { unique } from '../../../../utilities';
import { expect, it } from 'vitest';

import { MISSING_POLICY_DEFINITION } from '../../../../constants/errorConditionConstants';
import { POLICY_TYPE_RANKING_POINTS } from '../../../../constants/policyConstants';
import { SINGLES } from '../../../../constants/eventConstants';
import {
  CONSOLATION,
  CURTIS_CONSOLATION,
  MAIN,
  PLAY_OFF,
  SINGLE_ELIMINATION,
} from '../../../../constants/drawDefinitionConstants';

const awardProfiles = [
  {
    eventTypes: [SINGLES],
    drawTypes: [CURTIS_CONSOLATION],
    stages: [MAIN],
    flightNumbers: [],
    requireWinFirstRound: true,
    requireWinDefault: false,
    participationOrder: 1,
    finishingPositionRanges: {
      // 1: { value: 3000 }, // handled by finishingRound
      2: [
        {
          level: { 1: 2400, 2: 1238, 3: 900, 4: 540, 5: 300 },
          drawSizes: [],
          value: 2400,
        },
      ],
      '5-8': [{ drawSize: 32, threshold: true, value: 840 }],
      '9-16': [
        { drawSize: 32, value: 750 },
        { drawSize: 64, value: 750 },
      ],
      '17-32': [{ drawSizes: [32, 64], value: 390 }],
      // if requireWinFirstRound is not true then any of the following will achieve the same thing
      // '17-32': [{ drawSizes: [32, 64], value: 390, requireWin: true }],
      // '17-32': [{ drawSizes: [64], value: 390 }],
      // '17-32': [{ drawSize: 64, value: 390 }],
    },
    // alternative to finishingPositionRanges
    finishingRound: {
      1: { won: { value: 3000, level: { 1: 3000, 2: 1650 } }, lost: 2400 },
      2: { won: 2400, lost: 1800 }, // allows for different points for winning SF vs. losing in F
    },
  },
  {
    eventTypes: [SINGLES],
    drawTypes: [CURTIS_CONSOLATION],
    stages: [MAIN, CONSOLATION, PLAY_OFF],
    finishingPositionRanges: {
      3: { value: 1950 }, // perhaps requirePriorWins attribute for positioning points after participationOrder: 1
      4: { value: 1800 }, // perhaps requirePriorWins attribute for positioning points after participationOrder: 1
      5: { value: 1350 },
      6: { value: 1050 },
      '7-8': { value: 930 },
    },
    pointsPerWin: 60,
  },
  {
    eventTypes: [SINGLES],
    drawTypes: [],
    stages: [],
    finishingStageSequence: 1, // TODO: will need to derive for QUALIFYING
    finishingRound: { 1: { won: 30, lost: 15 }, 2: { won: 15 } },
  },
];

const policyDefinitions = {
  [POLICY_TYPE_RANKING_POINTS]: {
    requireWinDefault: false,
    awardProfiles,
  },
};

it('will fail without ranking point policy definition', () => {
  const ageCategoryCode = 'U12';
  const drawProfiles = [{ drawSize: 32, category: { ageCategoryCode } }];
  const {
    tournamentRecord,
    eventIds: [eventId],
  } = mocksEngine.generateTournamentRecord({
    completeAllMatchUps: true,
    drawProfiles,
  });

  tournamentEngine.setState(tournamentRecord);

  const awardCriteria = {
    drawType: SINGLE_ELIMINATION,
    eventType: SINGLES,

    participation: {
      participationOrder: 1,
      rankingStage: MAIN,
      flightNumber: 1,
    },
  };

  const { awardProfile } = getAwardProfile({ awardProfiles, ...awardCriteria });
  expect(awardProfile).not.toBeUndefined();

  const { event } = tournamentEngine.getEvent({ eventId });
  expect(event.category.ageCategoryCode).toEqual(ageCategoryCode);

  let result = scaleEngine.getTournamentPoints();
  expect(result.error).toEqual(MISSING_POLICY_DEFINITION);

  // policyDefinitions can be passed in as a parameter
  result = scaleEngine.getTournamentPoints({ policyDefinitions });
  expect(result.success).toEqual(true);

  const { personPoints } = result;
  expect(Object.values(personPoints)).not.toBeUndefined();

  tournamentEngine.attachPolicies({ policyDefinitions });
  result = scaleEngine.getTournamentPoints();
  expect(result.success).toEqual(true);
});

it('can generate points from tournamentRecords', () => {
  const drawProfiles = [
    {
      category: { ageCategoryCode: 'U12' },
      drawType: CURTIS_CONSOLATION,
      drawSize: 64,
    },
  ];
  let result = mocksEngine.generateTournamentRecord({
    completeAllMatchUps: true,
    randomWinningSide: true,
    policyDefinitions,
    drawProfiles,
  });

  const { tournamentRecord } = result;
  tournamentEngine.setState(tournamentRecord);

  const { policyDefinitions: attachedPolicies } =
    tournamentEngine.getPolicyDefinitions({
      policyTypes: [POLICY_TYPE_RANKING_POINTS],
    });
  expect(attachedPolicies[POLICY_TYPE_RANKING_POINTS]).not.toBeUndefined();

  for (const level of [1, 2]) {
    result = scaleEngine.getTournamentPoints({ level });
    expect(result.success).toEqual(true);

    const encounteredRangeAccessors = [];

    // expect(Object.keys(result.personPoints).length).toEqual(24);
    Object.values(result.personPoints).forEach((personResults) => {
      personResults.forEach((personResult) => {
        const {
          rangeAccessor,
          points,
          winCount,
          positionPoints,
          perWinPoints,
        } = personResult;

        if (rangeAccessor) encounteredRangeAccessors.push(rangeAccessor);

        if (rangeAccessor === '1') {
          expect(points).toEqual(level === 2 ? 1650 : 3000);
        } else if (rangeAccessor === '2') {
          expect(points).toEqual(level === 2 ? 1238 : 2400);
        } else if (rangeAccessor === '3') expect(points).toEqual(1950);
        else if (rangeAccessor === '4') expect(points).toEqual(1800);
        else if (rangeAccessor === '5') expect(points).toEqual(1350);
        else if (rangeAccessor === '6') expect(points).toEqual(1050);
        else if (rangeAccessor === '7-8') expect(points).toEqual(930);
        else if (rangeAccessor === '5-8') expect(positionPoints).toEqual(840);
        else if (rangeAccessor === '9-16') expect(positionPoints).toEqual(750);
        else if (rangeAccessor === '17-32') {
          expect(positionPoints).toEqual(390);
        } else if (winCount) {
          expect(perWinPoints).toEqual(winCount * 60);
        } else console.log({ personResult, winCount });
      });
    });

    if (!encounteredRangeAccessors.includes('5-8')) {
      encounteredRangeAccessors.push('5-8');
      // TODO: capture scenario
    }

    expect(unique(encounteredRangeAccessors).sort()).toEqual(
      // prettier-ignore
      [ '1', '17-32', '2', '3', '4', '5', '5-8', '6', '7-8', '9-16' ]
    );
  }
});

it('can generate points from tournamentRecords', () => {
  const drawProfiles = [
    {
      category: { ageCategoryCode: 'U12' },
      drawType: CURTIS_CONSOLATION,
      completionGoal: 24,
      drawSize: 32,
    },
  ];
  let result = mocksEngine.generateTournamentRecord({
    completeAllMatchUps: true,
    randomWinningSide: true,
    policyDefinitions,
    drawProfiles,
  });

  const { tournamentRecord } = result;
  tournamentEngine.setState(tournamentRecord);

  const { policyDefinitions: attachedPolicies } =
    tournamentEngine.getPolicyDefinitions({
      policyTypes: [POLICY_TYPE_RANKING_POINTS],
    });
  expect(attachedPolicies[POLICY_TYPE_RANKING_POINTS]).not.toBeUndefined();

  result = scaleEngine.getTournamentPoints();
  expect(result.success).toEqual(true);

  expect(Object.values(result.personPoints).length).toEqual(16);
  expect(
    Object.values(result.personPoints)
      .map((p) => p[0].points)
      .sort()
  ).toEqual(
    // prettier-ignore
    [ 750, 750, 750, 750, 750, 750, 750, 750, 840, 840, 840, 840, 840, 840, 840, 840 ]
  );
});
