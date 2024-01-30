import { validMatchUps } from '../../validators/validMatchUp';
import { getBand, getScoreComponents, pctSpread } from '../matchUp/scoreComponents';
import { findPolicy } from '../../acquire/findPolicy';

import POLICY_COMPETITIVE_BANDS_DEFAULT from '../../fixtures/policies/POLICY_COMPETITIVE_BANDS_DEFAULT';
import { POLICY_TYPE_COMPETITIVE_BANDS } from '@Constants/policyConstants';
import { MISSING_MATCHUPS } from '@Constants/errorConditionConstants';
import { SUCCESS } from '@Constants/resultConstants';
import { COMPETITIVE, DECISIVE, RETIRED, ROUTINE, WALKOVER } from '@Constants/statsConstants';

export function getMatchUpsStats({ profileBands, tournamentRecord, matchUps }) {
  if (!validMatchUps(matchUps)) return { error: MISSING_MATCHUPS };

  const policy =
    !profileBands &&
    findPolicy({
      policyType: POLICY_TYPE_COMPETITIVE_BANDS,
      tournamentRecord,
    }).policy;

  const bandProfiles =
    profileBands ||
    policy?.profileBands ||
    POLICY_COMPETITIVE_BANDS_DEFAULT[POLICY_TYPE_COMPETITIVE_BANDS].profileBands;

  const relevantMatchUps = matchUps.filter(({ winningSide }) => winningSide);

  const gamesMap = relevantMatchUps.map(getScoreComponents);

  const categorize = (p, spread) => {
    const band = getBand(spread, bandProfiles);
    p[band] += 1;
    return p;
  };

  const pctspd: { [key: string]: number } = pctSpread(gamesMap).reduce((p, c) => categorize(p, c), {
    [COMPETITIVE]: 0,
    [ROUTINE]: 0,
    [DECISIVE]: 0,
    [WALKOVER]: 0,
  });
  const total: number = Object.keys(pctspd).reduce((a, k) => (pctspd[k] || 0) + a, 0);

  const competitiveBands: any = Object.keys(pctspd).map((k: any) => {
    const value = parseFloat((pctspd[k] / total).toFixed(4));
    return {
      [k]: value * 100,
    };
  });

  const retiredCount = relevantMatchUps.filter(({ matchUpStatus }) => matchUpStatus === RETIRED).length;

  competitiveBands.push({
    [RETIRED]: parseFloat((retiredCount / total).toFixed(4)) * 100,
  });

  return {
    competitiveBands: Object.assign({}, ...competitiveBands),
    ...SUCCESS,
  };
}
