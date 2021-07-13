import { getRoundMatchUps } from '../../accessors/matchUpAccessor/getRoundMatchUps';

import { POLICY_ROUND_NAMING_DEFAULT } from '../../../fixtures/policies/POLICY_ROUND_NAMING_DEFAULT';
import { POLICY_TYPE_ROUND_NAMING } from '../../../constants/policyConstants';
import { MAIN } from '../../../constants/drawDefinitionConstants';

export function getRoundContextProfile({
  roundNamingPolicy,
  structure,
  matchUps,
}) {
  const roundNamingProfile = {};
  const isRoundRobin = structure.structures;
  const { roundProfile } = getRoundMatchUps({ matchUps });
  const { structureAbbreviation, stage } = structure;

  const defaultRoundNamingPolicy =
    POLICY_ROUND_NAMING_DEFAULT[POLICY_TYPE_ROUND_NAMING];

  const roundNamingMap =
    roundNamingPolicy?.roundNamingMap ||
    defaultRoundNamingPolicy.roundNamingMap;

  const roundNamePrefix =
    roundNamingPolicy?.affixes || defaultRoundNamingPolicy.affixes;

  const stageInitial = stage && stage !== MAIN && stage[0];
  const stageConstants = roundNamingPolicy?.stageConstants;
  const stageConstant =
    (stageConstants && stageConstants[stage]) || stageInitial;

  if (isRoundRobin) {
    Object.assign(
      roundNamingProfile,
      ...Object.keys(roundProfile).map((key) => {
        const profileSize = `R${key}`;
        return { [key]: profileSize };
      })
    );
  } else {
    Object.assign(
      roundNamingProfile,
      ...Object.keys(roundProfile).map((round) => {
        const { matchUpsCount, preFeedRound } = roundProfile[round];
        const participantsCount = matchUpsCount * 2;
        const sizeName =
          roundNamingMap[matchUpsCount] ||
          `${roundNamePrefix.roundNumber}${participantsCount}`;
        if (!sizeName) console.log({ roundNamingMap, matchUpsCount });
        const suffix = preFeedRound ? `-${roundNamePrefix.preFeedRound}` : '';
        const profileSize = `${sizeName}${suffix}`;
        const roundName = [stageConstant, structureAbbreviation, profileSize]
          .filter(Boolean)
          .join('-');
        return { [round]: roundName };
      })
    );
  }

  return { roundNamingProfile, roundProfile };
}
