import { firstRoundLoserConsolation } from '../../generators/firstRoundLoserConsolation';
import { generateDoubleElimination } from '../../generators/doubleEliminattion';
import { treeMatchUps, feedInMatchUps } from '../../generators/eliminationTree';
import { generateCurtisConsolation } from '../../generators/curtisConsolation';
import { getAllDrawMatchUps } from '../../getters/getMatchUps/drawMatchUps';
import { feedInChampionship } from '../../generators/feedInChampionShip';
import { modifyDrawNotice } from '../../notifications/drawNotifications';
import { getStageDrawPositionsCount } from '../../getters/stageGetter';
import { generateTieMatchUps } from '../../generators/tieMatchUps';
import structureTemplate from '../../generators/structureTemplate';
import { getDrawStructures } from '../../getters/structureGetter';
import { playoff } from '../../generators/playoffStructures';
import { addGoesTo } from '../matchUpGovernor/addGoesTo';
import { isPowerOf2 } from '../../../utilities';
import {
  generateRoundRobin,
  generateRoundRobinWithPlayOff,
} from '../../generators/roundRobin';

// prettier-ignore
import {
  MAIN, FICQF, FICSF, MFIC, AD_HOC, CURTIS, FICR16, COMPASS,
  PLAY_OFF, OLYMPIC, FEED_IN, QUALIFYING, ROUND_ROBIN,
  COMPASS_ATTRIBUTES, OLYMPIC_ATTRIBUTES,
  SINGLE_ELIMINATION, DOUBLE_ELIMINATION,
  FIRST_MATCH_LOSER_CONSOLATION,
  FIRST_ROUND_LOSER_CONSOLATION,
  ROUND_ROBIN_WITH_PLAYOFF,
  MULTI_STRUCTURE_DRAWS,
  FEED_IN_CHAMPIONSHIP,
  WIN_RATIO,
} from '../../../constants/drawDefinitionConstants';

import { MISSING_DRAW_DEFINITION } from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { SINGLES } from '../../../constants/matchUpTypes';
import {
  INVALID_DRAW_SIZE,
  STAGE_SEQUENCE_LIMIT,
  UNRECOGNIZED_DRAW_TYPE,
} from '../../../constants/errorConditionConstants';
import { definedAttributes } from '../../../utilities/objects';

/**
 *
 * Generates matchUps and pushes structures into drawDefiniton.structures
 *
 * @param {object} drawDefinition
 */
// TODO: consider refactoring to return structures rather than pushing them into drawDefinition
export function generateDrawType(params = {}) {
  const {
    drawType = SINGLE_ELIMINATION,
    stageSequence = 1,
    drawDefinition,
    staggeredEntry,
    structureName,
    goesTo = true,
    stage = MAIN,
    isMock,
    uuids,
    // qualifyingPositions, => passed through in params to treeMatchUps
    // qualifyingRound, => passed through in params to treeMatchUps
    // TODO: description => is this passed on?
  } = params;

  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };

  let { tieFormat, matchUpType } = params;
  tieFormat = tieFormat || drawDefinition.tieFormat || undefined;
  matchUpType = matchUpType || drawDefinition.matchUpType || SINGLES;

  const drawSize = getStageDrawPositionsCount({ stage, drawDefinition });
  Object.assign(
    params,
    definedAttributes({ drawSize, matchUpType, tieFormat })
  );

  const validDoubleEliminationSize = isPowerOf2((drawSize * 2) / 3);

  // check that drawSize is a valid value
  const invalidDrawSize =
    drawSize < 2 ||
    (!staggeredEntry &&
      ![FEED_IN, AD_HOC].includes(drawType) &&
      ((drawType === ROUND_ROBIN && drawSize < 3) ||
        (drawType === DOUBLE_ELIMINATION && !validDoubleEliminationSize) ||
        (![ROUND_ROBIN, DOUBLE_ELIMINATION, ROUND_ROBIN_WITH_PLAYOFF].includes(
          drawType
        ) &&
          !isPowerOf2(drawSize))));

  if (invalidDrawSize) {
    return { error: INVALID_DRAW_SIZE, drawSize };
  }

  const multiStructure = MULTI_STRUCTURE_DRAWS.includes(drawType);
  if (parseInt(drawSize) < 4 && multiStructure) {
    return { error: INVALID_DRAW_SIZE };
  }

  // there can be no existing main structure
  const sequenceLimit = stageSequence === 1 ? 1 : undefined;
  const { structures: stageStructures } = getDrawStructures({
    drawDefinition,
    stageSequence,
    stage,
  });
  const structureCount = stageStructures.length;
  if (structureCount >= sequenceLimit) return { error: STAGE_SEQUENCE_LIMIT };

  const generators = {
    [AD_HOC]: () => {
      const structure = structureTemplate({
        structureName: structureName || stage,
        finishingPosition: WIN_RATIO,
        structureId: uuids?.pop(),
        stageSequence,
        matchUps: [],
        matchUpType,
        stage,
      });

      drawDefinition.structures.push(structure);
      return Object.assign({ structure }, SUCCESS);
    },
    [SINGLE_ELIMINATION]: () => {
      const { matchUps, roundLimit: derivedRoundLimit } = treeMatchUps(params);
      const qualifyingRound = stage === QUALIFYING && derivedRoundLimit;
      const structure = structureTemplate({
        structureName: structureName || stage,
        roundLimit: derivedRoundLimit,
        structureId: uuids?.pop(),
        qualifyingRound,
        stageSequence,
        matchUpType,
        matchUps,
        stage,
      });

      drawDefinition.structures.push(structure);
      return Object.assign({ structure }, SUCCESS);
    },
    [DOUBLE_ELIMINATION]: () => generateDoubleElimination(params),
    [COMPASS]: () =>
      playoff(
        Object.assign(params, {
          roundOffsetLimit: 3,
          playoffAttributes: COMPASS_ATTRIBUTES,
        })
      ),
    [OLYMPIC]: () =>
      playoff(
        Object.assign(params, {
          roundOffsetLimit: 2,
          playoffAttributes: OLYMPIC_ATTRIBUTES,
        })
      ),
    [PLAY_OFF]: () => playoff(params),

    [FEED_IN]: () => {
      const { matchUps } = feedInMatchUps({ drawSize, uuids, matchUpType });

      const structure = structureTemplate({
        structureName: structureName || stage,
        structureId: uuids?.pop(),
        stageSequence,
        matchUpType,
        matchUps,
        stage,
      });

      drawDefinition.structures.push(structure);
      return Object.assign({ structure }, SUCCESS);
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

  const generator = generators[drawType];
  const generatorResult = generator && generator();
  if (!generatorResult?.success) {
    return { error: UNRECOGNIZED_DRAW_TYPE };
  }

  const { matchUps, matchUpsMap } = getAllDrawMatchUps({ drawDefinition });

  if (tieFormat) {
    matchUps.forEach((matchUp) => {
      const { tieMatchUps } = generateTieMatchUps({ tieFormat, isMock });
      Object.assign(matchUp, { tieMatchUps, matchUpType });
    });
  }

  let inContextDrawMatchUps;
  if (goesTo)
    ({ inContextDrawMatchUps } = addGoesTo({ drawDefinition, matchUpsMap }));

  const result = { ...SUCCESS, matchUps };

  Object.assign(result, generatorResult, {
    inContextDrawMatchUps,
    matchUpsMap,
  });

  modifyDrawNotice({ drawDefinition });

  return result;
}
