import { POLICY_TYPE_ROUND_NAMING } from '../../constants/policyConstants';
import {
  MAIN,
  PLAY_OFF,
  CONSOLATION,
  QUALIFYING,
} from '../../constants/drawDefinitionConstants';

export const POLICY_ROUND_NAMING_DEFAULT = {
  [POLICY_TYPE_ROUND_NAMING]: {
    policyName: 'Round Naming Default',
    namingConventions: {
      round: 'Round',
    },
    abbreviatedRoundNamingMap: {
      // key is matchUpsCount for the round
      1: 'F',
      2: 'SF',
      4: 'QF',
    },
    roundNamingMap: {
      1: 'Final',
      2: 'Semifinal',
      4: 'Quarterfinal',
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

export default POLICY_ROUND_NAMING_DEFAULT;
