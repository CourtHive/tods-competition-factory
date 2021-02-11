import { MAIN } from '../../constants/drawDefinitionConstants';
import { POLICY_TYPE_SCORING } from '../../constants/policyConstants';

export const POLICY_SCORING_USTA = {
  [POLICY_TYPE_SCORING]: {
    requireAllPositionsAssigned: false,
    stage: {
      [MAIN]: {
        stageSequence: {
          1: {
            requireAllPositionsAssigned: true,
          },
        },
      },
    },
    defaultMatchUpFormat: 'SET3-S:6/TB7',
    matchUpFormats: [
      {
        key: 's3',
        name: 'Best of 3 tiebreak sets',
        format: 'SET3-S:6/TB7',
      },
      {
        key: 's2mtb7',
        name: 'Two tiebreak sets, 7-point match tiebreak at one set all',
        format: 'SET3-S:6/TB7-F:TB7',
      },
      {
        key: 's2mtb10',
        name: 'Two tiebreak sets, 10-point match tiebreak at one set all',
        format: 'SET3-S:6/TB7-F:TB10',
      },
      {
        key: 's1',
        name: 'One standard tiebreak set to 6, 7-point tiebreak at 6 games all',
        format: 'SET1-S:6/TB7',
      },
      {
        key: 's1to4',
        name: 'Best of 3 sets to 4',
        format: 'SET3-S:4/TB7',
      },
      {
        key: 'short1',
        name:
          'Two out of three short sets to 4 with 5-point tiebreak at 3 games all',
        format: 'SET3-S:4/TB5@3',
      },
      {
        key: 'short2',
        name: 'One short set to 4, 7-point tiebreak at 4 games all',
        format: 'SET1-S:4/TB7',
      },
      {
        key: 'short3',
        name: 'One short set to 4, 5-point tiebreak at 3 games all',
        format: 'SET1-S:4/TB5@3',
      },
      {
        key: 'short4',
        name: 'Two short sets to 4, 10-point match tiebreak at one set all',
        format: 'SET3-S:4/TB7-F:TB10',
      },
      {
        key: 'short5',
        name: 'Two short sets to 4, 7-point match tiebreak at one set all',
        format: 'SET3-S:4/TB7-F:TB7',
      },
      {
        key: 'short6',
        name: 'One no advantage set to 5, tiebreak to 9 at 4-4',
        format: 'SET1-S:5/TB9@4',
      },
      {
        key: 'standardNOAD',
        name: 'One set to 6 with deciding game at 5 games all',
        format: 'SET1-S:6NOAD',
      },
      {
        key: 'short7',
        name: 'One short set to 4, deciding game is played at 3 games all',
        format: 'SET1-S:4NOAD',
      },
      {
        key: 'short8',
        name:
          'Two short sets to 4 with deciding game at 3-3, 7-point match tiebreak at one set all',
        format: 'SET3-S:4NOAD-F:TB7',
      },
      {
        key: 'pro',
        name: '8 game pro-set with 7 point tiebreak at 8 games all',
        format: 'SET1-S:8/TB7',
      },
      {
        key: 'collegePro',
        name: '8 game pro-set with 7 point tiebreak at 7 games all',
        format: 'SET1-S:8/TB7@7',
      },
      {
        key: 'tbsets2',
        name: 'Best of 3 10-point tiebreak games',
        format: 'SET3-S:TB10',
      },
      {
        key: 'tbsets3',
        name: 'One 10-point tiebreak game',
        format: 'SET1-S:TB10',
      },
      {
        key: 'timed20',
        name: 'Timed 20 minute game - game based',
        format: 'SET1-S:T20',
      },
    ],
  },
};

export default POLICY_SCORING_USTA;
