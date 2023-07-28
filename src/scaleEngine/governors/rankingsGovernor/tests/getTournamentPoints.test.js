import { mocksEngine, scaleEngine, tournamentEngine } from '../../../..';
import { getAwardProfile } from '../getAwardProfile';
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
  // TODO: requireWinDefault - to get points for a default there must be at least one win
  // TODO: requireWalkoverDefault - to get points for a default there must be at least one win
  // TODO: flights - filter by flightNumbers and assign discount to different flights
  /*
  {
    requireWinDefault: false,
    requireWalkoverDefault: false,
    category: { ageCategoryCodes: [], }, // applies only to these categories
    // alternative to finishingPositionRanges; can only apply to MAIN stage
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
    finishingStageSequence: 1, // TODO: will need to derive for QUALIFYING
    finishingRound: { 1: { won: 30, lost: 15 }, 2: { won: 15 } },
  },
];

const policyDefinitions = {
  [POLICY_TYPE_RANKING_POINTS]: {
    requireWinForPoints: false,
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
      .sort((a, b) => a - b)
  ).toEqual(
    // prettier-ignore
    [ 750, 750, 750, 750, 750, 750, 750, 750, 840, 840, 840, 840, 840, 840, 840, 840 ]
  );
});
