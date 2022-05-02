import { POLICY_TYPE_POSITION_ACTIONS } from '../../constants/policyConstants';

export const POLICY_POSITION_ACTIONS_UNRESTRICTED = {
  [POLICY_TYPE_POSITION_ACTIONS]: {
    policyName: 'positionActionsUnrestricted',

    // positionActions will be selectively enabled for structures matching { stages: [], stageSequences: [] }
    // enabledStructures: [] => all structures are enabled
    enabledStructures: [],

    // enables entries in other flights to be accessed as alternates
    otherFlightEntries: true,

    // enables entries with multiple qualifying roundTargets to be placed in any round
    disableRoundRestrictions: true,
  },
};

export default POLICY_POSITION_ACTIONS_UNRESTRICTED;
