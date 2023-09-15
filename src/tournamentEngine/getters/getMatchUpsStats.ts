import { validMatchUps } from '../../matchUpEngine/governors/queryGovernor/validMatchUp';
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
  if (!validMatchUps(matchUps)) return { error: MISSING_MATCHUPS };

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

  const pctspd: { [key: string]: number } = pctSpread(gamesMap).reduce(
    (p, c) => categorize(p, c),
    {
      [COMPETITIVE]: 0,
      [ROUTINE]: 0,
      [DECISIVE]: 0,
      [WALKOVER]: 0,
    }
  );
  const total: number = Object.keys(pctspd).reduce(
    (a, k) => (pctspd[k] || 0) + a,
    0
  );

  const competitiveBands: any = Object.keys(pctspd).map((k: any) => {
    const value = parseFloat((pctspd[k] / total).toFixed(4));
    return {
      [k]: value * 100,
    };
  });

  const retiredCount = relevantMatchUps.filter(
    ({ matchUpStatus }) => matchUpStatus === RETIRED
  ).length;

  competitiveBands.push({
    [RETIRED]: parseFloat((retiredCount / total).toFixed(4)) * 100,
  });

  return {
    competitiveBands: Object.assign({}, ...competitiveBands),
    ...SUCCESS,
  };
}
