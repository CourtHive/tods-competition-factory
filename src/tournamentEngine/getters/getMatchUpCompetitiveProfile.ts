import { getBand, getScoreComponents, pctSpread } from './scoreComponents';
import { findPolicy } from '../governors/policyGovernor/findPolicy';

import POLICY_COMPETITIVE_BANDS_DEFAULT from '../../fixtures/policies/POLICY_COMPETITIVE_BANDS_DEFAULT';
import { POLICY_TYPE_COMPETITIVE_BANDS } from '../../constants/policyConstants';
import { MatchUp, Tournament } from '../../types/tournamentFromSchema';
import { SUCCESS } from '../../constants/resultConstants';
import {
  ErrorType,
  INVALID_VALUES,
  MISSING_MATCHUP,
} from '../../constants/errorConditionConstants';

type GetMatchUpCompetitivenessArgs = {
  tournamentRecord?: Tournament;
  profileBands?: any;
  matchUp: MatchUp;
};

export function getMatchUpCompetitiveProfile({
  profileBands,
  tournamentRecord,
  matchUp,
}: GetMatchUpCompetitivenessArgs): {
  competitiveness?: any;
  pctSpread?: number;
  success?: boolean;
  error?: ErrorType;
} {
  if (!matchUp) return { error: MISSING_MATCHUP };
  const { score, winningSide } = matchUp;

  if (!winningSide) return { error: INVALID_VALUES };

  const policy =
    !profileBands &&
    tournamentRecord &&
    findPolicy({
      policyType: POLICY_TYPE_COMPETITIVE_BANDS,
      tournamentRecord,
    }).policy;

  const bandProfiles =
    profileBands ||
    policy?.profileBands ||
    POLICY_COMPETITIVE_BANDS_DEFAULT[POLICY_TYPE_COMPETITIVE_BANDS]
      .profileBands;

  const scoreComponents = getScoreComponents({ score });
  const spread = pctSpread([scoreComponents]);
  const competitiveness = getBand(spread, bandProfiles);

  return { ...SUCCESS, competitiveness, pctSpread: spread };
}
