import { getBand, getScoreComponents, pctSpread } from './scoreComponents';
import { findPolicy } from '../governors/policyGovernor/findPolicy';

import POLICY_COMPETITIVE_BANDS_DEFAULT from '../../fixtures/policies/POLICY_COMPETITIVE_BANDS_DEFAULT';
import { POLICY_TYPE_COMPETITIVE_BANDS } from '../../constants/policyConstants';
import { MISSING_MATCHUPS } from '../../constants/errorConditionConstants';
import { SUCCESS } from '../../constants/resultConstants';
import {
  COMPETITIVE,
  DECISIVE,
  RETIRED,
  ROUTINE,
  WALKOVER,
} from '../../constants/statsConstants';

export function getMatchUpsStats({
  competitiveProfile,
  tournamentRecord,
  matchUps,
}) {
  if (!Array.isArray(matchUps)) return { error: MISSING_MATCHUPS };

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

  const relevantMatchUps = matchUps.filter(({ winningSide }) => winningSide);

  const gamesMap = relevantMatchUps.map(getScoreComponents);

  const categorize = (p, spread) => {
    const band = getBand(spread, bandProfiles);
    p[band] += 1;
    return p;
  };

  const pctspd = pctSpread(gamesMap).reduce((p, c) => categorize(p, c), {
    [COMPETITIVE]: 0,
    [ROUTINE]: 0,
    [DECISIVE]: 0,
    [WALKOVER]: 0,
  });
  const total = Object.keys(pctspd).reduce((a, k) => (pctspd[k] || 0) + a, 0);

  const competitiveBands = Object.keys(pctspd).map((k) => ({
    [k]: (pctspd[k] / total).toFixed(4) * 100,
  }));

  const retiredCount = relevantMatchUps.filter(
    ({ matchUpStatus }) => matchUpStatus === RETIRED
  );

  competitiveBands.push({
    [RETIRED]: (retiredCount / total).toFixed(4) * 100,
  });

  return {
    competitiveBands: Object.assign({}, ...competitiveBands),
    ...SUCCESS,
  };
}
