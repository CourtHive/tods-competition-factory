import { stageDrawPositionsCount } from '../../getters/stageGetter';
import structureTemplate from '../../generators/structureTemplate';

import { powerOf2, makeDeepCopy } from '../../../utilities';
import { playoff } from '../../generators/playoffStructures';
import { getAllDrawMatchUps } from '../../getters/getMatchUps';
import { getDrawStructures } from '../../getters/structureGetter';
import { generateTieMatchUps } from '../../generators/tieMatchUps';
import { feedInChampionship } from '../../generators/feedInChampionShip';
import { generateCurtisConsolation } from '../../generators/curtisConsolation';
import { treeMatchUps, feedInMatchUps } from '../../generators/eliminationTree';
import { generateDoubleElimination } from '../../generators/doubleEliminattion';
import { firstMatchLoserConsolation } from '../../generators/firstMatchLoserConsolation';
import {
  generateRoundRobin,
  generateRoundRobinWithPlayOff,
} from '../../generators/roundRobin';

import {
  MAIN,
  FICQF,
  FICSF,
  MFIC,
  FMLC,
  CURTIS,
  FICR16,
  COMPASS,
  PLAYOFF,
  OLYMPIC,
  FEED_IN,
  QUALIFYING,
  ROUND_ROBIN,
  ELIMINATION,
  DOUBLE_ELIMINATION,
  FEED_IN_CHAMPIONSHIP,
  ROUND_ROBIN_WITH_PLAYOFF,
  COMPASS_ATTRIBUTES,
  OLYMPIC_ATTRIBUTES,
} from '../../../constants/drawDefinitionConstants';
import {
  INVALID_DRAW_SIZE,
  STAGE_SEQUENCE_LIMIT,
  UNRECOGNIZED_DRAW_TYPE,
} from '../../../constants/errorConditionConstants';

import { MISSING_DRAW_DEFINITION } from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function generateDrawType(props = {}) {
  const {
    stage = MAIN,
    structureName,
    stageSequence = 1,
    drawType = ELIMINATION,
    drawDefinition,
  } = props;

  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };

  const drawSize = stageDrawPositionsCount({ stage, drawDefinition });
  Object.assign(props, { drawSize });

  const validDoubleEliminationSize = powerOf2((drawSize * 2) / 3);

  // check that drawSize is a valid value
  const invalidDrawSize =
    drawType !== FEED_IN &&
    (drawSize < 2 ||
      (drawType === ROUND_ROBIN && drawSize < 3) ||
      (drawType === DOUBLE_ELIMINATION && !validDoubleEliminationSize) ||
      (![ROUND_ROBIN, DOUBLE_ELIMINATION, ROUND_ROBIN_WITH_PLAYOFF].includes(
        drawType
      ) &&
        !powerOf2(drawSize)));

  if (invalidDrawSize) {
    return { error: INVALID_DRAW_SIZE };
  }

  // there can be no existing main structure
  const sequenceLimit = stageSequence === 1 ? 1 : undefined;
  const { structures: stageStructures } = getDrawStructures({
    stage,
    stageSequence,
    drawDefinition,
  });
  const structureCount = stageStructures.length;
  if (structureCount >= sequenceLimit) return { error: STAGE_SEQUENCE_LIMIT };

  const generators = {
    [ELIMINATION]: () => {
      const { matchUps, roundLimit: derivedRoundLimit } = treeMatchUps(props);
      const qualifyingRound = stage === QUALIFYING && derivedRoundLimit;
      const structure = structureTemplate({
        matchUps,
        qualifyingRound,
        roundLimit: derivedRoundLimit,
        structureName: structureName || stage,
        stageSequence,
        stage,
      });

      drawDefinition.structures.push(structure);
      return Object.assign({ structure }, SUCCESS);
    },
    [DOUBLE_ELIMINATION]: () => generateDoubleElimination(props),
    [COMPASS]: () =>
      playoff(
        Object.assign(props, {
          roundOffsetLimit: 3,
          playoffAttributes: COMPASS_ATTRIBUTES,
        })
      ),
    [OLYMPIC]: () =>
      playoff(
        Object.assign(props, {
          roundOffsetLimit: 2,
          playoffAttributes: OLYMPIC_ATTRIBUTES,
        })
      ),
    [PLAYOFF]: () => playoff(props),

    [FEED_IN]: () => {
      const { matchUps } = feedInMatchUps({ drawSize });

      const structure = structureTemplate({
        matchUps,
        structureName: structureName || stage,
        stageSequence,
        stage,
      });

      drawDefinition.structures.push(structure);
      return Object.assign({ structure }, SUCCESS);
    },

    [FMLC]: () => firstMatchLoserConsolation(props),
    [MFIC]: () => feedInChampionship(Object.assign(props, { feedRounds: 1 })),
    [FICQF]: () =>
      feedInChampionship(Object.assign(props, { feedsFromFinal: 2 })),
    [FICSF]: () =>
      feedInChampionship(Object.assign(props, { feedsFromFinal: 1 })),
    [FICR16]: () =>
      feedInChampionship(Object.assign(props, { feedsFromFinal: 3 })),
    [FEED_IN_CHAMPIONSHIP]: () => feedInChampionship(props),

    [CURTIS]: () => generateCurtisConsolation(props),

    [ROUND_ROBIN]: () => generateRoundRobin(props),
    [ROUND_ROBIN_WITH_PLAYOFF]: () => generateRoundRobinWithPlayOff(props),
  };

  const generator = generators[drawType];
  const result = generator && generator();

  // where applicable add tieFormat to all generated matchUps; generate tieMatchUps where needed
  // CONSIDER: should tieFormat be included here? individual Tie MatchUps can get tieFormat from drawDefinition
  const { tieFormat, matchUpType } = drawDefinition || {};
  const additionalParams = { matchUpType };

  const { matchUps } = getAllDrawMatchUps({ drawDefinition });

  matchUps.forEach(matchUp => {
    if (tieFormat) {
      additionalParams.tieFormat = tieFormat;
      const { tieMatchUps } = generateTieMatchUps({ tieFormat });
      additionalParams.tieMatchUps = tieMatchUps;
    }
    Object.assign(matchUp, additionalParams);
  });

  /*
    the result returned by generateDrawType is for convenience
    primariliy utilized by the testing suite..
    the result is a deepCopy so that drawDefinition may not be modified
  */
  if (result && result.success) {
    return makeDeepCopy(result);
  } else {
    return { error: UNRECOGNIZED_DRAW_TYPE };
  }
}
