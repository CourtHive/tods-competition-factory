import { POLICY_TYPE_MATCHUP_ACTIONS } from '../../constants/policyConstants';

export const POLICY_MATCHUP_ACTIONS_DEFAULT = {
  [POLICY_TYPE_MATCHUP_ACTIONS]: {
    policyName: 'matchUpActionsDefault',

    // matchUpActions will be selectively enabled for structures matching { stages: [], stageSequences: [] }
    // enabledStructures: [] => all structures are enabled
    enabledStructures: [
      {
        stages: [], // stages: [] => applies to all stages
        stageSequences: [], // stageSequences: [] => applies to all stageSequences
        enabledActions: [],
        disabledActions: [], // disabledActions: [] => no actions are disabled
      },
    ],
  },
};

export default POLICY_MATCHUP_ACTIONS_DEFAULT;
