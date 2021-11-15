import { firstRoundLoserConsolation } from '../../generators/firstRoundLoserConsolation';
import { generateDoubleElimination } from '../../generators/doubleEliminattion';
import { treeMatchUps, feedInMatchUps } from '../../generators/eliminationTree';
import { generateCurtisConsolation } from '../../generators/curtisConsolation';
import { generateQualifyingStructures } from './generateQualifyingStructures';
import { getAllDrawMatchUps } from '../../getters/getMatchUps/drawMatchUps';
import { feedInChampionship } from '../../generators/feedInChampionShip';
import { modifyDrawNotice } from '../../notifications/drawNotifications';
import { getStageDrawPositionsCount } from '../../getters/stageGetter';
import { generateTieMatchUps } from '../../generators/tieMatchUps';
import structureTemplate from '../../generators/structureTemplate';
import { getDrawStructures } from '../../getters/structureGetter';
import { definedAttributes } from '../../../utilities/objects';
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
  PLAY_OFF, OLYMPIC, FEED_IN, ROUND_ROBIN,
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
    staggeredEntry, // optional - specifies main structure FEED_IN for drawTypes CURTIS_CONSOLATION, FEED_IN_CHAMPIONSHIPS, FMLC
    structureName,
    goesTo = true,
    stage = MAIN,
    isMock,
    uuids,
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

  const qualifyingResult =
    params.qualifyingProfiles?.length &&
    generateQualifyingStructures({
      qualifyingProfiles: params.qualifyingProfiles,
      idPrefix: params.idPrefix,
      matchUpType,
      isMock,
      uuids,
    });
  if (qualifyingResult?.error) return qualifyingResult;
  if (qualifyingResult?.structures)
    drawDefinition.structures.push(...qualifyingResult.structures);

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
      /*
      const qualifyingProfiles = params.qualifyingProfiles;
      const { qualifyingRound, qualifyingPositions } =
        qualifyingProfiles?.length ? qualifyingProfiles.pop() : {};

      const { matchUps, roundLimit: derivedRoundLimit } = treeMatchUps({
        ...params,
        qualifyingRound,
        qualifyingPositions,
      });
      const roundLimit = stage === QUALIFYING && derivedRoundLimit;
      */

      const { matchUps } = treeMatchUps(params);
      const structure = structureTemplate({
        structureName: structureName || stage,
        structureId: uuids?.pop(),
        // qualifyingRound,
        stageSequence,
        matchUpType,
        // roundLimit,
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
