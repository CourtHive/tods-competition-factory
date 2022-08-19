import { mocksEngine, scaleEngine, tournamentEngine } from '../../../..';

import { MISSING_POLICY_DEFINITION } from '../../../../constants/errorConditionConstants';
import { POLICY_TYPE_RANKING_POINTS } from '../../../../constants/policyConstants';
import {
  CONSOLATION,
  QUALIFYING,
} from '../../../../constants/drawDefinitionConstants';

// policyDefinition needs to be able to capture stage, and whether e.g. CONSOLATION, PLAY_OFF are points per win
const policyDefinitions = {
  [POLICY_TYPE_RANKING_POINTS]: {
    finishingPositionRanges: {
      1: { value: 10 },
      2: { value: 8 },
      '3-4': { value: 6 },
      '5-8': { drawSizes: { 32: { value: 4 }, 16: { value: 3 } } },
      '9-16': { drawSizes: { 32: { value: 2 } } },
    },
    awards: [
      {
        drawTypes: [],
        stages: [QUALIFYING],
        finishingStageSequence: 1, // will need to derive for QUALIFYING
        finishingRounds: { 1: 30, 2: 15 },
      },
      {
        drawTypes: [],
        stages: [],
        finishingPositionRanges: {
          1: { value: 10 },
          2: { value: 8 },
          '3-4': { value: 6 },
          '5-8': { drawSizes: { 32: { value: 4 }, 16: { value: 3 } } },
          '9-16': { drawSizes: { 32: { value: 2 } } },
        },
      },
      { drawTypes: [], stages: [CONSOLATION], pointsPerWin: 30 },
    ],
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

  const { event } = tournamentEngine.getEvent({ eventId });
  expect(event.category.ageCategoryCode).toEqual(ageCategoryCode);

  let result = scaleEngine.getTournamentPoints();
  expect(result.error).toEqual(MISSING_POLICY_DEFINITION);

  tournamentEngine.attachPolicies({ policyDefinitions });
  result = scaleEngine.getTournamentPoints();
  expect(result.success).toEqual(true);
});

it.only('can generate points from tournamentRecords', () => {
  const drawProfiles = [{ drawSize: 32, category: { ageCategoryCode: 'U12' } }];
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    completeAllMatchUps: true,
    policyDefinitions,
    drawProfiles,
  });

  tournamentEngine.setState(tournamentRecord);

  const { policyDefinitions: attachedPolicies } =
    tournamentEngine.getPolicyDefinitions({
      policyTypes: [POLICY_TYPE_RANKING_POINTS],
    });
  expect(attachedPolicies[POLICY_TYPE_RANKING_POINTS]).not.toBeUndefined();

  let result = scaleEngine.getTournamentPoints();
  expect(result.success).toEqual(true);

  expect(Object.keys(result.personPoints).length).toEqual(16);
  Object.values(result.personPoints).forEach((personResults) => {
    personResults.forEach(({ rangeAccessor, points }) => {
      if (rangeAccessor === '9-16') expect(points).toEqual(2);
      else if (rangeAccessor === '5-8') expect(points).toEqual(4);
      else if (rangeAccessor === '3-4') expect(points).toEqual(6);
      else if (rangeAccessor === '2') expect(points).toEqual(8);
      else if (rangeAccessor === '1') expect(points).toEqual(10);
      else throw new Error('not matched');
    });
  });
});
