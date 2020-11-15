import { getRoundMatchUps } from '../../accessors/matchUpAccessor/matchUps';

import { ROUND_NAMING_DEFAULT } from '../../../fixtures/roundNaming/ROUND_NAMING_DEFAULT';
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
    ROUND_NAMING_DEFAULT[POLICY_TYPE_ROUND_NAMING];

  const roundNamingMap =
    roundNamingPolicy?.roundNamingMap ||
    defaultRoundNamingPolicy.roundNamingMap;

  const roundNamePrefix =
    roundNamingPolicy?.prefix || defaultRoundNamingPolicy.prefix;

  const stageInitial = stage && stage !== MAIN && stage[0];
  const stageConstants = roundNamingPolicy?.stageConstants;
  const stageConstant =
    (stageConstants && stageConstants[stage]) || stageInitial;

  if (isRoundRobin) {
    Object.assign(
      roundNamingProfile,
      ...Object.keys(roundProfile).map(key => {
        const profileSize = `R${key}`;
        return { [key]: profileSize };
      })
    );
  } else {
    Object.assign(
      roundNamingProfile,
      ...Object.keys(roundProfile).map(round => {
        const { matchUpsCount, preFeedRound } = roundProfile[round];
        const participantsCount = matchUpsCount * 2;
        const sizeName = !preFeedRound && roundNamingMap[matchUpsCount];
        const prefix = preFeedRound
          ? roundNamePrefix.preFeedRound
          : sizeName
          ? ''
          : roundNamePrefix.roundNumber;
        const profileSize = `${prefix}${sizeName || participantsCount}`;
        const roundName = [stageConstant, structureAbbreviation, profileSize]
          .filter(f => f)
          .join('-');
        return { [round]: roundName };
      })
    );
  }

  return { roundNamingProfile, roundProfile };
}
