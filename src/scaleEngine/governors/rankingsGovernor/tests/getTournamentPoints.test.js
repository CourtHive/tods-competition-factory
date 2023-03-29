import { mocksEngine, scaleEngine, tournamentEngine } from '../../../..';
import { getAwardProfile } from '../getTournamentPoints';
import { expect, it } from 'vitest';

import { MISSING_POLICY_DEFINITION } from '../../../../constants/errorConditionConstants';
import { POLICY_TYPE_RANKING_POINTS } from '../../../../constants/policyConstants';
import { SINGLES } from '../../../../constants/eventConstants';
import {
  CURTIS_CONSOLATION,
  MAIN,
  SINGLE_ELIMINATION,
} from '../../../../constants/drawDefinitionConstants';

const awardProfiles = [
  /*
  {
    eventTypes: [SINGLES],
    drawTypes: [CURTIS_CONSOLATION],
    stages: [MAIN],
    requireWinFirstRound: true,
    requireWinDefault: false,
    participationOrder: 1,
    finishingPositionRanges: {
      1: { value: 3000 },
      2: [
        {
          level: { 1: 2400, 2: 1238, 3: 900, 4: 540, 5: 300 },
          drawSizes: [],
          value: 2400,
        },
      ],
      8: [{ drawSize: 32, threshold: true, value: 840 }],
      16: [
        { drawSize: 32, value: 750 },
        { drawSize: 64, value: 750 },
      ],
      32: [{ drawSizes: [32, 64], value: 390 }],
      // if requireWinFirstRound is not true then any of the following will achieve the same thing
      // 32: [{ drawSizes: [32, 64], value: 390, requireWin: true }],
      // 32: [{ drawSizes: [64], value: 390 }],
      // 32: [{ drawSize: 64, value: 390 }],
    },
    // alternative to finishingPositionRanges
    finishingRound: {
      1: { won: { value: 3000, level: { 1: 3000, 2: 1650 } }, lost: 2400 },
      2: { won: 2400, lost: 1800 }, // allows for different points for winning SF vs. losing in F
    },
  },
  */
  {
    eventTypes: [SINGLES],
    drawTypes: [CURTIS_CONSOLATION],
    finishingPositionRanges: {
      1: { value: 3000 },
      2: { value: 2400 },
      3: { value: 1950 }, // perhaps requirePriorWins attribute for positioning points after participationOrder: 1
      4: { value: 1800 }, // perhaps requirePriorWins attribute for positioning points after participationOrder: 1
      5: { value: 1350 },
      6: { value: 1050 },
      8: { value: 930 },
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

it.skip('can generate points from tournamentRecords', () => {
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
