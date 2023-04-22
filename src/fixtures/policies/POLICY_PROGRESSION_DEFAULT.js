import { POLICY_TYPE_PROGRESSION } from '../../constants/policyConstants';

export const POLICY_PROGRESSION_DEFAULT = {
  [POLICY_TYPE_PROGRESSION]: {
    // when { doubleExitPropagateBye: true } a BYE will propagate to loser position instead of a produced WALKOVER
    // this is significant for providers who do not award ranking points for first round walkovers
    doubleExitPropagateBye: false,
    // when { autoPlaceQualifiers: true } qualifiers will be randomly assigned to qualifier positions (if present)
    autoPlaceQualifiers: false,
    // when { autoReplaceQualifiers: true } placed qualifiers will be replaced in target structures if winningSide is changed
    autoReplaceQualifiers: false,
    // when { autoRemoveQualifiers: true } placed qualifiers will be removed if winningSide is removed
    autoRemoveQualifiers: false,
  },
};

export default POLICY_PROGRESSION_DEFAULT;
