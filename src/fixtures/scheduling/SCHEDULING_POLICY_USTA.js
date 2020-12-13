import { DOUBLES, SINGLES } from '../../constants/matchUpTypes';
import { POLICY_TYPE_SCHEDULING } from '../../constants/policyConstants';

const ALL = 'ALL';
const ADULT = 'ADULT';
const JUNIOR = 'JUNIOR';
const WHEELCHAIR = 'WHEELCHAIR';

/**
 *
 */
export const SCHEDULING_POLICY = {
  [POLICY_TYPE_SCHEDULING]: {
    defaultTimes: {
      averageMatchUpTime: { minutes: { [ALL]: 90 } },
      recoveryTime: { minutes: { [SINGLES]: 60, [DOUBLES]: 30 } },
    },
    averageMatchUpTimes: [
      {
        matchUpFormatCodes: ['*'],
        averageTimes: [{ categoryNames: [ALL], minutes: { [ALL]: 90 } }],
      },
      {
        matchUpFormatCodes: ['SET3-S:6/TB7'], // consider 'SET3-S:6*' as a wildcard match
        averageTimes: [
          { categoryNames: [JUNIOR], minutes: { [ALL]: 137 } },
          {
            categoryNames: [ADULT, WHEELCHAIR],
            minutes: { [ALL]: 120 },
          },
        ],
      },
      {
        matchUpFormatCodes: ['SET3-S:6/TB7-F:TB10'],
        averageTimes: [{ categoryNames: [ALL], minutes: { [ALL]: 90 } }],
      },
      {
        matchUpFormatCodes: ['SET3-S:6/TB7-F:TB7'],
        averageTimes: [{ categoryNames: [ALL], minutes: { [ALL]: 70 } }],
      },
      {
        matchUpFormatCodes: ['SET3-S:4/TB7'],
        averageTimes: [{ categoryNames: [ALL], minutes: { [ALL]: 60 } }],
      },
      {
        matchUpFormatCodes: ['SET3-S:4/TB7-F:TB7'],
        averageTimes: [{ categoryNames: [ALL], minutes: { [ALL]: 55 } }],
      },
      {
        matchUpFormatCodes: ['SET3-S:4/TB7-F:TB7'],
        averageTimes: [{ categoryNames: [ALL], minutes: { [ALL]: 50 } }],
      },
      {
        matchUpFormatCodes: ['SET3-S:4/TB5@3'],
        averageTimes: [{ categoryNames: [ALL], minutes: { [ALL]: 45 } }],
      },
      {
        matchUpFormatCodes: ['SET1-S:8/TB7'],
        averageTimes: [{ categoryNames: [ALL], minutes: { [ALL]: 40 } }],
      },
      {
        matchUpFormatCodes: ['SET1-S:6/TB7'],
        averageTimes: [{ categoryNames: [ALL], minutes: { [ALL]: 30 } }],
      },
      {
        matchUpFormatCodes: [
          'SET1-S:4/TB7',
          'SET1-S:4/TB5@3',
          'SET3-S:TB10',
          'SET1-S:T20',
        ],
        averageTimes: [{ categoryNames: [ALL], minutes: { [ALL]: 20 } }],
      },
      {
        matchUpFormatCodes: ['SET1-S:TB10'],
        averageTimes: [{ categoryNames: [ALL], minutes: { [ALL]: 10 } }],
      },
    ],
    recoveryTimes: [
      {
        matchUpFormatCodes: ['*'],
        times: [
          {
            categoryNames: ['*'],
            minutes: { [SINGLES]: 60, [DOUBLES]: 30 },
          },
        ],
      },
      {
        timingRange: { greaterThan: 20, lessThan: 70 },
        times: [
          {
            categoryNames: ['*'],
            minutes: { [SINGLES]: 30 },
          },
        ],
      },
      {
        timingRange: { lessThan: 30 },
        times: [
          {
            categoryNames: ['*'],
            minutes: { [SINGLES]: 15, [DOUBLES]: 15 },
          },
        ],
      },
    ],
    matchesPerDay: [
      { categoryNames: [], maximums: { total: 3, [SINGLES]: 2, [DOUBLES]: 3 } },
    ],
  },
};

export default SCHEDULING_POLICY;
