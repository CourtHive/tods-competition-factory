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
        categoryNames: [],
        categoryTypes: [],
        description: 'Best of 3 tiebreak sets',
        matchUpFormat: 'SET3-S:6/TB7',
      },
      {
        description: 'Two tiebreak sets, 7-point match tiebreak at one set all',
        matchUpFormat: 'SET3-S:6/TB7-F:TB7',
      },
      {
        description:
          'Two tiebreak sets, 10-point match tiebreak at one set all',
        matchUpFormat: 'SET3-S:6/TB7-F:TB10',
      },
      {
        description:
          'One standard tiebreak set to 6, 7-point tiebreak at 6 games all',
        matchUpFormat: 'SET1-S:6/TB7',
      },
      {
        description: 'Best of 3 sets to 4',
        matchUpFormat: 'SET3-S:4/TB7',
      },
      {
        description:
          'Two out of three short sets to 4 with 5-point tiebreak at 3 games all',
        matchUpFormat: 'SET3-S:4/TB5@3',
      },
      {
        description: 'One short set to 4, 7-point tiebreak at 4 games all',
        matchUpFormat: 'SET1-S:4/TB7',
      },
      {
        description: 'One short set to 4, 5-point tiebreak at 3 games all',
        matchUpFormat: 'SET1-S:4/TB5@3',
      },
      {
        description:
          'Two short sets to 4, 10-point match tiebreak at one set all',
        matchUpFormat: 'SET3-S:4/TB7-F:TB10',
      },
      {
        description:
          'Two short sets to 4, 7-point match tiebreak at one set all',
        matchUpFormat: 'SET3-S:4/TB7-F:TB7',
      },
      {
        description: 'One no advantage set to 5, tiebreak to 9 at 4-4',
        matchUpFormat: 'SET1-S:5/TB9@4',
      },
      {
        description: 'One set to 6 with deciding game at 5 games all',
        matchUpFormat: 'SET1-S:6NOAD',
      },
      {
        description:
          'One short set to 4, deciding game is played at 3 games all',
        matchUpFormat: 'SET1-S:4NOAD',
      },
      {
        description:
          'Two short sets to 4 with deciding game at 3-3, 7-point match tiebreak at one set all',
        matchUpFormat: 'SET3-S:4NOAD-F:TB7',
      },
      {
        description: '8 game pro-set with 7 point tiebreak at 8 games all',
        matchUpFormat: 'SET1-S:8/TB7',
      },
      {
        description: '8 game pro-set with 7 point tiebreak at 7 games all',
        matchUpFormat: 'SET1-S:8/TB7@7',
      },
      {
        description: 'Best of 3 10-point tiebreak games',
        matchUpFormat: 'SET3-S:TB10',
      },
      {
        description: 'One 10-point tiebreak game',
        matchUpFormat: 'SET1-S:TB10',
      },
      {
        description: 'Timed 20 minute game - game based',
        matchUpFormat: 'SET1-S:T20',
      },
    ],
  },
};

export default POLICY_SCORING_USTA;
