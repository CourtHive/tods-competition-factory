import { getRoundMatchUps } from '../../accessors/matchUpAccessor/getRoundMatchUps';
import { isLucky } from '../../governors/queryGovernor/isLucky';
import { isAdHoc } from '../../governors/queryGovernor/isAdHoc';

import { POLICY_ROUND_NAMING_DEFAULT } from '../../../fixtures/policies/POLICY_ROUND_NAMING_DEFAULT';
import { DrawDefinition, Structure } from '../../../types/tournamentFromSchema';
import { POLICY_TYPE_ROUND_NAMING } from '../../../constants/policyConstants';
import { MAIN, QUALIFYING } from '../../../constants/drawDefinitionConstants';
import { ResultType } from '../../../global/functions/decorateResult';
import { HydratedMatchUp } from '../../../types/hydrated';
import { RoundProfile } from '../../../types/factoryTypes';

type GetRoundContextProfileArgs = {
  drawDefinition?: DrawDefinition;
  matchUps: HydratedMatchUp[];
  roundNamingPolicy: any;
  structure: Structure;
};
export function getRoundContextProfile({
  roundNamingPolicy,
  drawDefinition,
  structure,
  matchUps,
}: GetRoundContextProfileArgs): ResultType & {
  roundNamingProfile?: {
    [key: string]: { roundName: string; abbreviatedRoundName: string };
  };
  roundMatchUps?: HydratedMatchUp[];
  roundProfile?: RoundProfile;
} {
  const { roundProfile, roundMatchUps } = getRoundMatchUps({ matchUps });
  const { structureAbbreviation, stage } = structure;

  const isAdHocStructure = isAdHoc({ structure });
  const isLuckyStructure = isLucky({ structure });

  const isRoundRobin = structure.structures;
  const roundNamingProfile = {};

  const defaultRoundNamingPolicy =
    POLICY_ROUND_NAMING_DEFAULT[POLICY_TYPE_ROUND_NAMING];

  const isQualifying = structure.stage === QUALIFYING;
  const qualifyingFinishgMap =
    isQualifying &&
    (roundNamingPolicy?.qualifyingFinishMap ||
      defaultRoundNamingPolicy?.qualifyingFinishMap ||
      {});

  const qualifyingStageSequences: number = isQualifying
    ? Math.max(
        ...(drawDefinition?.structures ?? [])
          .filter((structure) => structure.stage === QUALIFYING)
          .map(({ stageSequence }) => stageSequence ?? 1),
        0
      )
    : 0;

  const preQualifyingSequence = qualifyingStageSequences
    ? qualifyingStageSequences - (structure.stageSequence || 1) || ''
    : '';

  const preQualifyingAffix = preQualifyingSequence
    ? roundNamingPolicy?.affixes?.preQualifying || ''
    : '';

  const roundNamingMap =
    roundNamingPolicy?.roundNamingMap ||
    defaultRoundNamingPolicy.roundNamingMap ||
    {};

  const abbreviatedRoundNamingMap =
    roundNamingPolicy?.abbreviatedRoundNamingMap ||
    defaultRoundNamingPolicy.abbreviatedRoundNamingMap ||
    {};

  const preFeedAffix =
    roundNamingPolicy?.affixes?.preFeedRound ||
    defaultRoundNamingPolicy.affixes.preFeedRound;

  const roundNumberAffix =
    roundNamingPolicy?.affixes?.roundNumber ||
    defaultRoundNamingPolicy.affixes.roundNumber;

  const namingConventions =
    roundNamingPolicy?.namingConventions ||
    defaultRoundNamingPolicy.namingConventions;
  const roundNameFallback = namingConventions.round;

  const stageInitial = stage && stage !== MAIN && stage[0];
  const stageConstants =
    roundNamingPolicy?.stageConstants ||
    defaultRoundNamingPolicy.stageConstants;
  const stageConstant = (stage && stageConstants?.[stage]) || stageInitial;

  const roundProfileKeys = roundProfile ? Object.keys(roundProfile) : [];
  const qualifyingAffix =
    isQualifying && stageConstants?.[QUALIFYING]
      ? `${stageConstants?.[QUALIFYING]}-`
      : '';

  if (isRoundRobin || isAdHocStructure || isLuckyStructure) {
    Object.assign(
      roundNamingProfile,
      ...roundProfileKeys.map((key) => {
        const roundName = `${qualifyingAffix}${roundNameFallback} ${key}`;
        const abbreviatedRoundName = `${roundNumberAffix}${key}`;
        return { [key]: { roundName, abbreviatedRoundName } };
      })
    );
  } else {
    Object.assign(
      roundNamingProfile,
      ...roundProfileKeys.map((round) => {
        if (!roundProfile?.[round]) return;
        const { matchUpsCount, preFeedRound } = roundProfile[round];
        const participantsCount = matchUpsCount * 2;

        const sizedRoundName =
          qualifyingFinishgMap?.[roundProfile?.[round].finishingRound] ||
          (qualifyingFinishgMap && `${roundNumberAffix}${participantsCount}`) ||
          roundNamingMap[matchUpsCount] ||
          `${roundNumberAffix}${participantsCount}`;

        const suffix = preFeedRound ? `-${preFeedAffix}` : '';
        const profileRoundName = `${sizedRoundName}${suffix}`;

        const roundName = [
          preQualifyingAffix,
          stageConstant,
          preQualifyingSequence,
          structureAbbreviation,
          profileRoundName,
        ]
          .filter(Boolean)
          .join('-');

        const sizedAbbreviation =
          abbreviatedRoundNamingMap[matchUpsCount] ||
          `${roundNumberAffix}${participantsCount}`;
        const profileAbbreviation = `${sizedAbbreviation}${suffix}`;
        const abbreviatedRoundName = [
          preQualifyingAffix,
          stageConstant,
          preQualifyingSequence,
          structureAbbreviation,
          profileAbbreviation,
        ]
          .filter(Boolean)
          .join('-');

        return { [round]: { abbreviatedRoundName, roundName } };
      })
    );
  }

  return { roundNamingProfile, roundProfile, roundMatchUps };
}
