import { powerOf2, makeDeepCopy } from 'src/utilities';
import { stageDrawPositionsCount } from 'src/drawEngine/getters/stageGetter';
import structureTemplate from 'src/drawEngine/generators/structureTemplate';

import { playOff } from 'src/drawEngine/generators/playOff';
import { getAllDrawMatchUps } from 'src/drawEngine/getters/getMatchUps';
import { getDrawStructures } from 'src/drawEngine/getters/structureGetter';
import { generateTieMatchUps } from 'src/drawEngine/generators/tieMatchUps';
import { feedInChampionship } from 'src/drawEngine/generators/feedInChampionShip';
import { generateCurtisConsolation} from 'src/drawEngine/generators/curtisConsolation';
import { treeMatchUps, feedInMatchUps } from 'src/drawEngine/generators/eliminationTree';
import { generateDoubleElimination } from 'src/drawEngine/generators/doubleEliminattion';
import { firstMatchLoserConsolation } from 'src/drawEngine/generators/firstMatchLoserConsolation';
import { generateRoundRobin, generateRoundRobinWithPlayOff } from 'src/drawEngine/generators/roundRobin';

import {
  MAIN, ELIMINATION, DOUBLE_ELIMINATION, PLAYOFF,
  QUALIFYING, ROUND_ROBIN, ROUND_ROBIN_WITH_PLAYOFF, CURTIS,
  FEED_IN, FEED_IN_CHAMPIONSHIP, FICR16, FICQF, FICSF, MFIC, FMLC,
  COMPASS, OLYMPIC, COMPASS_NAMING, OLYMPIC_NAMING,
  MISSING_DRAW_DEFINITION
} from 'src/constants/drawDefinitionConstants';

import { SUCCESS } from 'src/constants/resultConstants';

export function generateDrawType(props={}) {
  let {
    stage=MAIN,
    structureName,
    stageSequence=1,
    drawType=ELIMINATION,
    drawDefinition
  } = props;

  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  
  const drawSize = stageDrawPositionsCount({stage, drawDefinition});
  Object.assign(props, { drawSize });

  const validDoubleEliminationSize = powerOf2(drawSize * 2/3);
  
  // check that drawSize is a valid value
  const invalidDrawSize = drawType !== FEED_IN &&
    (drawSize < 2 || 
    (drawType === ROUND_ROBIN && drawSize < 3) ||
    (drawType === DOUBLE_ELIMINATION && !validDoubleEliminationSize) ||
    (![ROUND_ROBIN, DOUBLE_ELIMINATION, ROUND_ROBIN_WITH_PLAYOFF].includes(drawType) && !powerOf2(drawSize)));

  if (invalidDrawSize) { return { error: 'Invalid Draw Size' }; }
 
  // there can be no existing main structure
  const sequenceLimit = stageSequence === 1 ? 1 : undefined;
  const { structures: stageStructures } = getDrawStructures({stage, stageSequence, drawDefinition});
  const structureCount = stageStructures.length;
  if (structureCount >= sequenceLimit) return { error: 'stageSequence Limit' };

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
        stage
      });

      drawDefinition.structures.push(structure);
      return Object.assign({ structure }, SUCCESS);
    },
    [DOUBLE_ELIMINATION]: () => generateDoubleElimination(props),
    [COMPASS]: () => playOff(Object.assign(props, { roundOffsetLimit: 3, playOffNaming: COMPASS_NAMING})),
    [OLYMPIC]: () => playOff(Object.assign(props, { roundOffsetLimit: 2, playOffNaming: OLYMPIC_NAMING})),
    [PLAYOFF]: () => playOff(props),
    
    [FEED_IN]: () => {
      const { matchUps } = feedInMatchUps({ drawSize });

      const structure = structureTemplate({
        matchUps,
        structureName: structureName || stage,
        stageSequence,
        stage
      });

      drawDefinition.structures.push(structure);
      return Object.assign({ structure }, SUCCESS);
    },
    
    [FMLC]: () => firstMatchLoserConsolation(props),
    [MFIC]: () => feedInChampionship(Object.assign(props, {feedRounds: 1})),
    [FICQF]: () => feedInChampionship(Object.assign(props, {feedsFromFinal: 2})),
    [FICSF]: () => feedInChampionship(Object.assign(props, {feedsFromFinal: 1})),
    [FICR16]: () => feedInChampionship(Object.assign(props, {feedsFromFinal: 3})),
    [FEED_IN_CHAMPIONSHIP]: () => feedInChampionship(props),
    
    [CURTIS]: () => generateCurtisConsolation(props),
    
    [ROUND_ROBIN]: () => generateRoundRobin(props),
    [ROUND_ROBIN_WITH_PLAYOFF]: () => generateRoundRobinWithPlayOff(props),
  }

  const generator = generators[drawType];
  const result = generator && generator();

  // add matchUpFormat or tieFormat to all generated matchUps
  // generate tieMatchUps where needed
  const { matchUpFormat, tieFormat, matchUpType } = drawDefinition || {};
  const additionalParams = { matchUpType };
  if (matchUpFormat) additionalParams.matchUpFormat = matchUpFormat;
  
  const { matchUps } = getAllDrawMatchUps({drawDefinition});
  matchUps.forEach(matchUp => {
    if (tieFormat) {
      additionalParams.tieFormat = tieFormat;
      const { tieMatchUps } = generateTieMatchUps({tieFormat});
      additionalParams.tieMatchUps = tieMatchUps;
    }
    Object.assign(matchUp, additionalParams)
  });

  /*
    the result returned by generateDrawType is for convenience
    primariliy utilized by the testing suite..
    the result is a deepCopy so that drawDefinition may not be modified
  */
  if (result && result.success) {
    return makeDeepCopy(result);
  } else {
    return { error: 'Unknown drawType' };
  }
}
