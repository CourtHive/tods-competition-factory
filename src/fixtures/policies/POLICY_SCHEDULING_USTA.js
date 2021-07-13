// import { CONSOLATION, MAIN } from '../../constants/drawDefinitionConstants';
import { DOUBLES, SINGLES } from '../../constants/matchUpTypes';
import { POLICY_TYPE_SCHEDULING } from '../../constants/policyConstants';

// categoryTypes
const ADULT = 'ADULT';
const JUNIOR = 'JUNIOR';
const WHEELCHAIR = 'WHEELCHAIR';

/**
 *
 */
export const POLICY_SCHEDULING_USTA = {
  [POLICY_TYPE_SCHEDULING]: {
    defaultTimes: {
      averageTimes: [{ categoryNames: [], minutes: { default: 90 } }],
      recoveryTimes: [{ minutes: { [DOUBLES]: 30, default: 60 } }],
    },
    defaultDailyLimits: {
      [SINGLES]: 2,
      [DOUBLES]: 2,
      total: 3,
    },
    matchUpAverageTimes: [
      {
        matchUpFormatCodes: ['SET3-S:6/TB7'],
        averageTimes: [
          { categoryTypes: [JUNIOR], minutes: { default: 137 } },
          {
            categoryTypes: [ADULT, WHEELCHAIR],
            minutes: { default: 120 },
          },
        ],
      },
      {
        matchUpFormatCodes: ['SET3-S:6/TB7-F:TB10'],
        averageTimes: [
          { categoryNames: [], minutes: { default: 90 } },
          { categoryTypes: [ADULT], minutes: { default: 90 } },
        ],
      },
      {
        matchUpFormatCodes: ['SET3-S:6/TB7-F:TB7'],
        averageTimes: [{ categoryNames: [], minutes: { default: 70 } }],
      },
      {
        matchUpFormatCodes: ['SET3-S:4/TB7'],
        averageTimes: [{ categoryNames: [], minutes: { default: 60 } }],
      },
      {
        matchUpFormatCodes: ['SET3-S:4/TB7-F:TB7'],
        averageTimes: [{ categoryNames: [], minutes: { default: 55 } }],
      },
      {
        matchUpFormatCodes: ['SET3-S:4/TB7-F:TB7'],
        averageTimes: [{ categoryNames: [], minutes: { default: 50 } }],
      },
      {
        matchUpFormatCodes: ['SET3-S:4/TB5@3'],
        averageTimes: [{ categoryNames: [], minutes: { default: 45 } }],
      },
      {
        matchUpFormatCodes: ['SET1-S:8/TB7'],
        averageTimes: [{ categoryNames: [], minutes: { default: 40 } }],
      },
      {
        matchUpFormatCodes: ['SET1-S:6/TB7'],
        averageTimes: [{ categoryNames: [], minutes: { default: 30 } }],
      },
      {
        matchUpFormatCodes: [
          'SET1-S:4/TB7',
          'SET1-S:4/TB5@3',
          'SET3-S:TB10',
          'SET1-S:T20',
        ],
        averageTimes: [{ categoryNames: [], minutes: { default: 20 } }],
      },
      {
        matchUpFormatCodes: ['SET1-S:TB10'],
        averageTimes: [{ categoryNames: [], minutes: { default: 10 } }],
      },
    ],
    matchUpRecoveryTimes: [
      {
        matchUpFormatCodes: ['SET3-S:6/TB7'],
        recoveryTimes: [
          {
            categoryNames: [],
            minutes: { default: 60, [DOUBLES]: 30 },
          },
        ],
      },
      {
        averageTimes: { greaterThan: 29, lessThan: 70 },
        recoveryTimes: [
          {
            categoryNames: [],
            minutes: { default: 30 },
          },
        ],
      },
      {
        averageTimes: { lessThan: 30 },
        recoveryTimes: [
          {
            categoryNames: [],
            minutes: { default: 15, [DOUBLES]: 15 },
          },
        ],
      },
    ],
    matchUpDailyLimits: [
      {
        matchUpFormatCodes: [], // all matchUpFormats
        limits: [
          {
            categoryNames: [], // all categoryNames
            categoryTypes: [], // all categoryTypes
            matchesCombinations: [
              { [SINGLES]: { default: 2 }, [DOUBLES]: { default: 1 } },
              { [SINGLES]: { default: 1 }, [DOUBLES]: { default: 2 } },
            ],
            sets: { total: 9, [SINGLES]: 6, [DOUBLES]: 9 },
          },
        ],
      },
      {
        matchUpFormatCodes: ['S3-S:TB10'],
        limits: [
          {
            categoryNames: ['12U'],
            matchesCombinations: [
              { [SINGLES]: { default: 2 } },
              { [SINGLES]: { default: 1 }, [DOUBLES]: { default: 2 } },
              { [DOUBLES]: { default: 3 } },
            ],
            sets: { total: 9, [DOUBLES]: 9, [SINGLES]: 6 },
          },
        ],
      },
    ],
  },
};

export default POLICY_SCHEDULING_USTA;
