import { getBand, getScoreComponents, pctSpread } from './scoreComponents';
import { findPolicy } from '../governors/policyGovernor/findPolicy';

import POLICY_COMPETITIVE_BANDS_DEFAULT from '../../fixtures/policies/POLICY_COMPETITIVE_BANDS_DEFAULT';
import { POLICY_TYPE_COMPETITIVE_BANDS } from '../../constants/policyConstants';
import { SUCCESS } from '../../constants/resultConstants';
import {
  INVALID_VALUES,
  MISSING_MATCHUP,
} from '../../constants/errorConditionConstants';

export function getMatchUpCompetitiveness({
  competitiveProfile,
  tournamentRecord,
  matchUp,
}) {
  if (!matchUp) return { error: MISSING_MATCHUP };
  const { score, winningSide } = matchUp;

  if (!winningSide) return { error: INVALID_VALUES };

  const policy =
    !competitiveProfile &&
    findPolicy({
      policyType: POLICY_TYPE_COMPETITIVE_BANDS,
      tournamentRecord,
    }).policy;

  const bandProfiles =
    competitiveProfile ||
    policy?.competitiveProfile ||
    POLICY_COMPETITIVE_BANDS_DEFAULT[POLICY_TYPE_COMPETITIVE_BANDS]
      .competitiveProfile;

  const scoreComponents = getScoreComponents({ score });
  const spread = pctSpread([scoreComponents]);
  const competitiveness = getBand(spread, bandProfiles);

  return { ...SUCCESS, competitiveness };
}
