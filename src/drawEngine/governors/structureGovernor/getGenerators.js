import { firstRoundLoserConsolation } from '../../generators/firstRoundLoserConsolation';
import { generateDoubleElimination } from '../../generators/doubleEliminattion';
import { generateCurtisConsolation } from '../../generators/curtisConsolation';
import { generatePlayoffStructures } from '../../generators/playoffStructures';
import { feedInChampionship } from '../../generators/feedInChampionship';
import structureTemplate from '../../generators/structureTemplate';
import { feedInMatchUps } from '../../generators/feedInMatchUps';
import { treeMatchUps } from '../../generators/eliminationTree';
import { luckyDraw } from '../../generators/luckyDraw';
import {
  generateRoundRobin,
  generateRoundRobinWithPlayOff,
} from '../../generators/roundRobin';

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

export function getGenerators(params) {
  const {
    stageSequence = 1,
    structureName,
    structureId,
    stage = MAIN,
    matchUpType,
    drawSize,
    uuids,
  } = params;

  const generators = {
    [AD_HOC]: () => {
      const structure = structureTemplate({
        structureName: structureName || MAIN,
        structureId: structureId || uuids?.pop(),
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
        structureName: structureName || MAIN,
        structureId: structureId || uuids?.pop(),
        stageSequence,
        matchUpType,
        matchUps,
        stage,
      });

      return { structures: [structure], links: [], ...SUCCESS };
    },
    [SINGLE_ELIMINATION]: () => {
      const { matchUps } = treeMatchUps(params);
      const structure = structureTemplate({
        structureName: structureName || MAIN,
        structureId: structureId || uuids?.pop(),
        stageSequence,
        matchUpType,
        matchUps,
        stage,
      });

      return { structures: [structure], links: [], ...SUCCESS };
    },
    [DOUBLE_ELIMINATION]: () => generateDoubleElimination(params),
    [COMPASS]: () => {
      Object.assign(params, {
        roundOffsetLimit: 3,
        playoffAttributes: COMPASS_ATTRIBUTES,
      });
      return generatePlayoffStructures(params);
    },
    [OLYMPIC]: () => {
      Object.assign(params, {
        roundOffsetLimit: 2,
        playoffAttributes: OLYMPIC_ATTRIBUTES,
      });
      return generatePlayoffStructures(params);
    },
    [PLAY_OFF]: () => {
      return generatePlayoffStructures(params);
    },

    [FEED_IN]: () => {
      const { matchUps } = feedInMatchUps({ drawSize, uuids, matchUpType });

      const structure = structureTemplate({
        structureName: structureName || MAIN,
        structureId: structureId || uuids?.pop(),
        stageSequence,
        matchUpType,
        stage: MAIN,
        matchUps,
      });

      return { structures: [structure], links: [], ...SUCCESS };
    },
    [FIRST_ROUND_LOSER_CONSOLATION]: () => firstRoundLoserConsolation(params),
    [FIRST_MATCH_LOSER_CONSOLATION]: () =>
      feedInChampionship(Object.assign(params, { feedRounds: 1, fmlc: true })),
    [MFIC]: () => feedInChampionship(Object.assign(params, { feedRounds: 1 })),
    [FICQF]: () =>
      feedInChampionship(Object.assign(params, { feedsFromFinal: 2 })),
    [FICSF]: () =>
      feedInChampionship(Object.assign(params, { feedsFromFinal: 1 })),
    [FICR16]: () =>
      feedInChampionship(Object.assign(params, { feedsFromFinal: 3 })),
    [FEED_IN_CHAMPIONSHIP]: () => feedInChampionship(params),
    [CURTIS]: () => generateCurtisConsolation(params),
    [ROUND_ROBIN]: () => generateRoundRobin(params),
    [ROUND_ROBIN_WITH_PLAYOFF]: () => generateRoundRobinWithPlayOff(params),
  };

  return { generators };
}
