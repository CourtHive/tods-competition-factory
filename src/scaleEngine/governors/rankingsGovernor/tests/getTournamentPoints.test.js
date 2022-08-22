import { mocksEngine, scaleEngine, tournamentEngine } from '../../../..';
import { unique } from '../../../../utilities';

import { MISSING_POLICY_DEFINITION } from '../../../../constants/errorConditionConstants';
import { POLICY_TYPE_RANKING_POINTS } from '../../../../constants/policyConstants';
import { SINGLES } from '../../../../constants/eventConstants';
import {
  CONSOLATION,
  CURTIS_CONSOLATION,
  MAIN,
  PLAY_OFF,
  QUALIFYING,
} from '../../../../constants/drawDefinitionConstants';

// policyDefinition needs to be able to capture stage, and whether e.g. CONSOLATION, PLAY_OFF are points per win
const policyDefinitions = {
  [POLICY_TYPE_RANKING_POINTS]: {
    awardProfiles: [
      {
        drawTypes: [],
        stages: [QUALIFYING],
        eventTypes: [SINGLES],
        finishingStageSequence: 1, // will need to derive for QUALIFYING
        finishingRound: { 1: { won: 30, lost: 15 }, 2: { won: 15 } },
      },
      {
        drawTypes: [CURTIS_CONSOLATION],
        stages: [MAIN],
        flightNumbers: [],
        eventTypes: [SINGLES],
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
        },
        // alternative to finishingPositionRanges
        finishingRound: {
          1: { won: { value: 3000, level: { 1: 3000, 2: 1650 } }, lost: 2400 },
          2: { won: 2400, lost: 1800 }, // allows for different points for winning SF vs. losing in F
        },
      },
      {
        drawTypes: [CURTIS_CONSOLATION],
        eventTypes: [SINGLES],
        stages: [MAIN, CONSOLATION, PLAY_OFF],
        finishingPositionRanges: {
          3: { value: 1950 },
          4: { value: 1800 },
          5: { value: 1350 },
          6: { value: 1050 },
          '7-8': { value: 930 },
        },
        pointsPerWin: 60,
      },
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

it.each([1, 2])('can generate points from tournamentRecords', (level) => {
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

  result = scaleEngine.getTournamentPoints({ level });
  expect(result.success).toEqual(true);

  const encounteredRangeAccessors = [];

  // expect(Object.keys(result.personPoints).length).toEqual(24);
  Object.values(result.personPoints).forEach((personResults) => {
    personResults.forEach((personResult) => {
      const { rangeAccessor, points, winCount, positionPoints, perWinPoints } =
        personResult;

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
      else if (rangeAccessor === '5-8') {
        expect(positionPoints).toEqual(840); // CC:32
      } else if (rangeAccessor === '9-16') expect(positionPoints).toEqual(750);
      else if (rangeAccessor === '17-32') {
        expect(positionPoints).toEqual(390);
      } else if (winCount) {
        expect(perWinPoints).toEqual(winCount * 60);
      } else console.log({ personResult, winCount });
    });
  });

  expect(unique(encounteredRangeAccessors).sort()).toEqual(
    // prettier-ignore
    [ '1', '17-32', '2', '3', '4', '5', '5-8', '6', '7-8', '9-16' ]
  );
});
