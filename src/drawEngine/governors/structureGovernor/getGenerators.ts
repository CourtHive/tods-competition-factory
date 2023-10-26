import { generateRoundRobinWithPlayOff } from '../../generators/generateRoundRobinWithPlayoff';
import { getAppliedPolicies } from '../../../global/functions/deducers/getAppliedPolicies';
import { firstRoundLoserConsolation } from '../../generators/firstRoundLoserConsolation';
import { generateDoubleElimination } from '../../generators/doubleEliminattion';
import { generateCurtisConsolation } from '../../generators/curtisConsolation';
import { generatePlayoffStructures } from '../../generators/playoffStructures';
import structureTemplate from '../../generators/structureTemplate';
import { feedInChampionship } from '../../generators/feedInChamp';
import { generateRoundRobin } from '../../generators/roundRobin';
import { feedInMatchUps } from '../../generators/feedInMatchUps';
import { treeMatchUps } from '../../generators/eliminationTree';
import { constantToString } from '../../../utilities/strings';
import { luckyDraw } from '../../generators/luckyDraw';

import { POLICY_TYPE_FEED_IN } from '../../../constants/policyConstants';
import { ErrorType } from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
// prettier-ignore
import {
  MAIN, FICQF, FICSF, MFIC, AD_HOC, CURTIS, FICR16, COMPASS,
  PLAY_OFF, OLYMPIC, FEED_IN, ROUND_ROBIN,
  COMPASS_ATTRIBUTES, OLYMPIC_ATTRIBUTES,
  SINGLE_ELIMINATION, DOUBLE_ELIMINATION,
  FIRST_MATCH_LOSER_CONSOLATION,
  FIRST_ROUND_LOSER_CONSOLATION,
  ROUND_ROBIN_WITH_PLAYOFF,
  FEED_IN_CHAMPIONSHIP,
  WIN_RATIO,
  LUCKY_DRAW,
} from '../../../constants/drawDefinitionConstants';

export function getGenerators(params): { generators?: any; error?: ErrorType } {
  const {
    playoffAttributes,
    stageSequence = 1,
    structureName,
    structureId,
    stage = MAIN,
    matchUpType,
    drawSize,
    uuids,
  } = params;

  const { appliedPolicies } = getAppliedPolicies(params);
  const feedPolicy =
    params.policyDefinitions?.[POLICY_TYPE_FEED_IN] ||
    appliedPolicies?.[POLICY_TYPE_FEED_IN];

  // disable feeding from MAIN final unless policy specifies
  params.skipRounds =
    params.skipRounds ||
    (drawSize <= 4 && (feedPolicy?.feedMainFinal ? 0 : 1)) ||
    0;

  const main = constantToString(MAIN);
  const singleElimination = () => {
    const { matchUps } = treeMatchUps(params);
    const structure = structureTemplate({
      structureId: structureId || uuids?.pop(),
      structureName: structureName || main,
      stageSequence,
      matchUpType,
      matchUps,
      stage,
    });

    return { structures: [structure], links: [], ...SUCCESS };
  };

  const generators = {
    [AD_HOC]: () => {
      const structure = structureTemplate({
        structureId: structureId || uuids?.pop(),
        structureName: structureName || main,
        finishingPosition: WIN_RATIO,
        stageSequence,
        matchUps: [],
        matchUpType,
        stage,
      });

      return { structures: [structure], links: [], ...SUCCESS };
    },
    [LUCKY_DRAW]: () => {
      const { matchUps } = luckyDraw(params);
      const structure = structureTemplate({
        structureId: structureId || uuids?.pop(),
        structureName: structureName || main,
        stageSequence,
        matchUpType,
        matchUps,
        stage,
      });

      return { structures: [structure], links: [], ...SUCCESS };
    },
    [SINGLE_ELIMINATION]: () => singleElimination(),
    [DOUBLE_ELIMINATION]: () => generateDoubleElimination(params),
    [COMPASS]: () =>
      generatePlayoffStructures({
        ...params,
        roundOffsetLimit: 3,
        playoffAttributes: playoffAttributes ?? COMPASS_ATTRIBUTES,
      }),
    [OLYMPIC]: () =>
      generatePlayoffStructures({
        ...params,
        roundOffsetLimit: 2,
        playoffAttributes: playoffAttributes ?? OLYMPIC_ATTRIBUTES,
      }),
    [PLAY_OFF]: () => {
      return generatePlayoffStructures(params);
    },

    [FEED_IN]: () => {
      const { matchUps } = feedInMatchUps({ drawSize, uuids, matchUpType });

      const structure = structureTemplate({
        structureId: structureId || uuids?.pop(),
        structureName: structureName || main,
        stageSequence,
        matchUpType,
        stage: MAIN,
        matchUps,
      });

      return { structures: [structure], links: [], ...SUCCESS };
    },
    [FIRST_ROUND_LOSER_CONSOLATION]: () => firstRoundLoserConsolation(params),
    [FIRST_MATCH_LOSER_CONSOLATION]: () =>
      feedInChampionship({ ...params, feedRounds: 1, fmlc: true }),
    [MFIC]: () => feedInChampionship({ ...params, feedRounds: 1 }),
    [FICSF]: () => feedInChampionship({ ...params, feedsFromFinal: 1 }),
    [FICQF]: () => feedInChampionship({ ...params, feedsFromFinal: 2 }),
    [FICR16]: () => feedInChampionship({ ...params, feedsFromFinal: 3 }),
    [FEED_IN_CHAMPIONSHIP]: () => feedInChampionship(params),
    [CURTIS]: () => generateCurtisConsolation(params),
    [ROUND_ROBIN]: () => generateRoundRobin(params),
    [ROUND_ROBIN_WITH_PLAYOFF]: () => generateRoundRobinWithPlayOff(params),
  };

  return { generators };
}
