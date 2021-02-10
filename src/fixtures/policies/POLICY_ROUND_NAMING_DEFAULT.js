import {
  MAIN,
  PLAY_OFF,
  CONSOLATION,
  QUALIFYING,
} from '../../constants/drawDefinitionConstants';
import { POLICY_TYPE_ROUND_NAMING } from '../../constants/policyConstants';

export const ROUND_NAMING_DEFAULT = {
  [POLICY_TYPE_ROUND_NAMING]: {
    policyName: 'Round Naming Default',
    roundNamingMap: {
      1: 'F', // key is matchUpsCount for the round
      2: 'SF',
      4: 'QF',
    },
    affixes: {
      roundNumber: 'R',
      preFeedRound: 'Q',
    },
    stageConstants: {
      [MAIN]: '',
      [PLAY_OFF]: 'P',
      [QUALIFYING]: 'Q',
      [CONSOLATION]: 'C',
    },
  },
};

export default ROUND_NAMING_DEFAULT;
