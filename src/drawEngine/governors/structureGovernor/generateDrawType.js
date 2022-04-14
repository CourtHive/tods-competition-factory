import { firstRoundLoserConsolation } from '../../generators/firstRoundLoserConsolation';
import { getStageDrawPositionsCount } from '../../getters/getStageDrawPositions';
import { generateQualifyingLink } from '../../generators/generateQualifyingLink';
import { generateDoubleElimination } from '../../generators/doubleEliminattion';
import { generateCurtisConsolation } from '../../generators/curtisConsolation';
import { generatePlayoffStructures } from '../../generators/playoffStructures';
import { generateQualifyingStructures } from './generateQualifyingStructures';
import { getAllDrawMatchUps } from '../../getters/getMatchUps/drawMatchUps';
import { feedInChampionship } from '../../generators/feedInChampionship';
import { modifyDrawNotice } from '../../notifications/drawNotifications';
import { generateTieMatchUps } from '../../generators/tieMatchUps';
import structureTemplate from '../../generators/structureTemplate';
import { feedInMatchUps } from '../../generators/feedInMatchUps';
import { treeMatchUps } from '../../generators/eliminationTree';
import { getDrawStructures } from '../../getters/findStructure';
import { definedAttributes } from '../../../utilities/objects';
import { addGoesTo } from '../matchUpGovernor/addGoesTo';
import { luckyDraw } from '../../generators/luckyDraw';
import { isPowerOf2 } from '../../../utilities';
import {
  setStageDrawSize,
  setStageQualifiersCount,
} from '../entryGovernor/stageEntryCounts';
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
  QUALIFYING,
  LUCKY_DRAW,
} from '../../../constants/drawDefinitionConstants';

import { MISSING_DRAW_DEFINITION } from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { SINGLES } from '../../../constants/matchUpTypes';
import {
  INVALID_DRAW_SIZE,
  STAGE_SEQUENCE_LIMIT,
  UNRECOGNIZED_DRAW_TYPE,
} from '../../../constants/errorConditionConstants';
import { structureSort } from '../../getters/structureSort';

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

  const mainStageDrawPositionsCount = getStageDrawPositionsCount({
    drawDefinition,
    stage: MAIN,
  });

  if (!mainStageDrawPositionsCount) {
    setStageDrawSize({
      drawSize: params.drawSize,
      drawDefinition,
      stageSequence,
      stage: MAIN,
    });
  }

  // first generate any qualifying structures
  const qualifyingResult =
    params.qualifyingProfiles?.length &&
    generateQualifyingStructures({
      qualifyingProfiles: params.qualifyingProfiles,
      idPrefix: params.idPrefix,
      drawDefinition,
      matchUpType,
      isMock,
      uuids,
    });

  if (qualifyingResult?.error) return qualifyingResult;
  const { qualifiersCount = 0, qualifyingDrawPositionsCount } =
    qualifyingResult || {};

  if (qualifyingDrawPositionsCount) {
    drawDefinition.structures.push(...qualifyingResult.structures);
    const qualifyingStageDrawPositionsCount = getStageDrawPositionsCount({
      stage: QUALIFYING,
      drawDefinition,
    });

    if (!qualifyingStageDrawPositionsCount) {
      const result = setStageDrawSize({
        drawSize: qualifyingDrawPositionsCount,
        stage: QUALIFYING,
        drawDefinition,
      });
      if (result.error) return result;
    }
    const result = setStageQualifiersCount({
      drawDefinition,
      qualifiersCount,
      stage: MAIN,
    });
    if (result.error) return result;
  }

  const drawSize = params.drawSize || mainStageDrawPositionsCount;

  Object.assign(
    params,
    definedAttributes({ drawSize, matchUpType, tieFormat })
  );

  const validDoubleEliminationSize = isPowerOf2((drawSize * 2) / 3);

  // check that drawSize is a valid value
  const invalidDrawSize =
    drawSize < 2 ||
    (!staggeredEntry &&
      ![FEED_IN, AD_HOC, LUCKY_DRAW].includes(drawType) &&
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
        structureName: structureName || MAIN,
        finishingPosition: WIN_RATIO,
        structureId: uuids?.pop(),
        stageSequence,
        matchUps: [],
        matchUpType,
        stage,
      });

      drawDefinition.structures.push(structure);
      return Object.assign({ structures: [structure] }, SUCCESS);
    },
    [LUCKY_DRAW]: () => {
      const { matchUps } = luckyDraw(params);
      const structure = structureTemplate({
        structureName: structureName || MAIN,
        structureId: uuids?.pop(),
        stageSequence,
        matchUpType,
        matchUps,
        stage,
      });

      drawDefinition.structures.push(structure);
      return Object.assign({ structures: [structure] }, SUCCESS);
    },
    [SINGLE_ELIMINATION]: () => {
      const { matchUps } = treeMatchUps(params);
      const structure = structureTemplate({
        structureName: structureName || MAIN,
        structureId: uuids?.pop(),
        stageSequence,
        matchUpType,
        matchUps,
        stage,
      });

      drawDefinition.structures.push(structure);
      return Object.assign({ structures: [structure] }, SUCCESS);
    },
    [DOUBLE_ELIMINATION]: () => generateDoubleElimination(params),
    [COMPASS]: () => {
      Object.assign(params, {
        roundOffsetLimit: 3,
        playoffAttributes: COMPASS_ATTRIBUTES,
      });
      const { structures, structureId, links } =
        generatePlayoffStructures(params);

      if (links?.length) drawDefinition.links.push(...links);
      if (structures?.length) drawDefinition.structures.push(...structures);
      drawDefinition.structures.sort(structureSort);

      return Object.assign({ structureId }, SUCCESS);
    },
    [OLYMPIC]: () => {
      Object.assign(params, {
        roundOffsetLimit: 2,
        playoffAttributes: OLYMPIC_ATTRIBUTES,
      });
      const { structures, structureId, links } =
        generatePlayoffStructures(params);

      if (links?.length) drawDefinition.links.push(...links);
      if (structures?.length) drawDefinition.structures.push(...structures);
      drawDefinition.structures.sort(structureSort);

      return Object.assign({ structureId }, SUCCESS);
    },
    [PLAY_OFF]: () => {
      const { structures, structureId, links } =
        generatePlayoffStructures(params);

      if (links?.length) drawDefinition.links.push(...links);
      if (structures?.length) drawDefinition.structures.push(...structures);
      drawDefinition.structures.sort(structureSort);

      return Object.assign({ structureId }, SUCCESS);
    },

    [FEED_IN]: () => {
      const { matchUps } = feedInMatchUps({ drawSize, uuids, matchUpType });

      const structure = structureTemplate({
        structureName: structureName || MAIN,
        structureId: uuids?.pop(),
        stageSequence,
        matchUpType,
        stage: MAIN,
        matchUps,
      });

      drawDefinition.structures.push(structure);
      return Object.assign({ structures: [structure] }, SUCCESS);
    },

    [FIRST_ROUND_LOSER_CONSOLATION]: () => {
      const { structures, links } = firstRoundLoserConsolation(params);
      if (links?.length) drawDefinition.links.push(...links);
      if (structures?.length) drawDefinition.structures.push(...structures);
      return Object.assign({ structures, links }, SUCCESS);
    },
    [FIRST_MATCH_LOSER_CONSOLATION]: () => {
      const { structures, links } = feedInChampionship(
        Object.assign(params, { feedRounds: 1, fmlc: true })
      );
      if (links?.length) drawDefinition.links.push(...links);
      if (structures?.length) drawDefinition.structures.push(...structures);
      return Object.assign({ structures, links }, SUCCESS);
    },
    [MFIC]: () => {
      const { structures, links } = feedInChampionship(
        Object.assign(params, { feedRounds: 1 })
      );
      if (links?.length) drawDefinition.links.push(...links);
      if (structures?.length) drawDefinition.structures.push(...structures);
      return Object.assign({ structures, links }, SUCCESS);
    },
    [FICQF]: () => {
      const { structures, links } = feedInChampionship(
        Object.assign(params, { feedsFromFinal: 2 })
      );
      if (links?.length) drawDefinition.links.push(...links);
      if (structures?.length) drawDefinition.structures.push(...structures);
      return Object.assign({ structures, links }, SUCCESS);
    },
    [FICSF]: () => {
      const { structures, links } = feedInChampionship(
        Object.assign(params, { feedsFromFinal: 1 })
      );
      if (links?.length) drawDefinition.links.push(...links);
      if (structures?.length) drawDefinition.structures.push(...structures);
      return Object.assign({ structures, links }, SUCCESS);
    },
    [FICR16]: () => {
      const { structures, links } = feedInChampionship(
        Object.assign(params, { feedsFromFinal: 3 })
      );
      if (links?.length) drawDefinition.links.push(...links);
      if (structures?.length) drawDefinition.structures.push(...structures);
      return Object.assign({ structures, links }, SUCCESS);
    },
    [FEED_IN_CHAMPIONSHIP]: () => {
      const { structures, links } = feedInChampionship(params);
      if (links?.length) drawDefinition.links.push(...links);
      if (structures?.length) drawDefinition.structures.push(...structures);
      return Object.assign({ structures, links }, SUCCESS);
    },

    [CURTIS]: () => {
      return generateCurtisConsolation(params);
      /*
      const { structures, links } = generateCurtisConsolation(params);
      if (links?.length) drawDefinition.links.push(...links);
      if (structures?.length) drawDefinition.structures.push(...structures);
      return Object.assign({ structures, links }, SUCCESS);
      */
    },

    [ROUND_ROBIN]: () => {
      return generateRoundRobin(params);
    },
    [ROUND_ROBIN_WITH_PLAYOFF]: () => {
      return generateRoundRobinWithPlayOff(params);
    },
  };

  const generator = generators[drawType];
  const generatorResult = generator && generator();
  if (!generatorResult?.success) {
    return { error: UNRECOGNIZED_DRAW_TYPE };
  }

  if (qualifyingResult?.structures?.length) {
    const {
      finalQualifyingRoundNumber: qualifyingRoundNumber,
      finalQualifyingStructureId: qualifyingStructureId,
    } = qualifyingResult;

    const mainStructure = generatorResult.structures.find(
      ({ stage, stageSequence }) => stage === MAIN && stageSequence === 1
    );

    generateQualifyingLink({
      sourceStructureId: qualifyingStructureId,
      sourceRoundNumber: qualifyingRoundNumber,
      targetStructureId: mainStructure.structureId,
      drawDefinition,
    });
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

  modifyDrawNotice({ drawDefinition });

  return {
    structures: drawDefinition.structures,
    links: drawDefinition.links,
    inContextDrawMatchUps,
    matchUpsMap,
    ...SUCCESS,
    matchUps,
  };
}
