import { generatePlayoffStructures } from '@Generators/drawDefinitions/drawTypes/playoffStructures';
import { getPositionRangeMap } from '@Query/drawDefinition/getPositionRangeMap';
import { firstRoundLoserConsolation } from './firstRoundLoserConsolation';
import structureTemplate from '@Generators/templates/structureTemplate';
import { decorateResult } from '@Functions/global/decorateResult';
import { structureSort } from '@Functions/sorters/structureSort';
import { generateCurtisConsolation } from './curtisConsolation';
import { generateRoundRobin } from './roundRobin/roundRobin';
import { feedInChampionship } from './feedInChamp';
import { treeMatchUps } from './eliminationTree';
import { numericSort } from '@Tools/sorting';
import { nextPowerOf2 } from '@Tools/math';

// constants and types
import { INVALID_VALUES } from '@Constants/errorConditionConstants';
import { POLICY_TYPE_FEED_IN } from '@Constants/policyConstants';
import { DrawLink, Structure } from '@Types/tournamentTypes';
import { WIN_RATIO } from '@Constants/statsConstants';
import { ResultType } from '@Types/factoryTypes';
import {
  AD_HOC,
  COMPASS,
  COMPASS_ATTRIBUTES,
  CURTIS_CONSOLATION,
  DRAW,
  FEED_IN_CHAMPIONSHIP,
  FEED_IN_CHAMPIONSHIP_TO_QF,
  FEED_IN_CHAMPIONSHIP_TO_R16,
  FEED_IN_CHAMPIONSHIP_TO_SF,
  FIRST_MATCH_LOSER_CONSOLATION,
  FIRST_ROUND_LOSER_CONSOLATION,
  MODIFIED_FEED_IN_CHAMPIONSHIP,
  OLYMPIC,
  OLYMPIC_ATTRIBUTES,
  PLAY_OFF,
  POSITION,
  ROUND_ROBIN,
  SINGLE_ELIMINATION,
} from '@Constants/drawDefinitionConstants';

export function processPlayoffGroups({
  requireSequential = true,
  playoffMatchUpFormat,
  playoffAttributes,
  sourceStructureId,
  policyDefinitions,
  stageSequence,
  drawDefinition,
  playoffGroups,
  matchUpType,
  feedPolicy,
  groupCount,
  idPrefix,
  isMock,
  uuids,
}): ResultType & {
  finishingPositionTargets?: any;
  structures?: Structure[];
  positionRangeMap?: any;
  links?: DrawLink[];
} {
  feedPolicy = feedPolicy || policyDefinitions?.[POLICY_TYPE_FEED_IN];
  const stack = 'processPlayoffGroups';

  let finishingPositionOffset = 0;
  const finishingPositionTargets: any[] = [];
  const structures: any[] = [];
  const links: any[] = [];

  const { error, positionRangeMap } = getPositionRangeMap({
    structureId: sourceStructureId,
    drawDefinition,
    playoffGroups,
  });

  if (error) return decorateResult({ result: { error }, stack });

  const validFinishingPositions =
    !positionRangeMap ||
    playoffGroups?.every((profile) => {
      const { finishingPositions = [] } = profile;
      if (!finishingPositions.length) return false;

      const sequential = [...finishingPositions]
        .sort(numericSort)
        .map((pos, i) => (finishingPositions[i + 1] || pos) - pos)
        .every((val) => val < 2);

      return (!requireSequential || sequential) && finishingPositions.every((position) => positionRangeMap[position]);
    });

  if (!validFinishingPositions) {
    return decorateResult({
      context: { validFinishingPositions: Object.values(positionRangeMap) },
      result: { error: INVALID_VALUES },
      stack,
    });
  }

  for (const playoffGroup of playoffGroups) {
    const finishingPositions = playoffGroup.finishingPositions;
    const positionsPlayedOff =
      positionRangeMap && finishingPositions.map((p) => positionRangeMap[p]?.finishingPositions).flat();

    const participantsInDraw = groupCount * finishingPositions.length;
    const drawSize = nextPowerOf2(participantsInDraw);

    const playoffDrawType = (drawSize === 2 && SINGLE_ELIMINATION) || playoffGroup.drawType || SINGLE_ELIMINATION;

    if (positionsPlayedOff) {
      finishingPositionOffset = Math.min(...positionsPlayedOff) - 1;
    }

    const finishingPositionRange =
      positionsPlayedOff && `${Math.min(...positionsPlayedOff)}-${Math.max(...positionsPlayedOff)}`;

    const structureName =
      playoffGroup.structureName ||
      (finishingPositionRange && playoffGroup.playoffAttributes?.[finishingPositionRange]?.name) ||
      playoffGroup.playoffAttributes?.['0']?.name;

    const playoffGroupParams = {
      addNameBaseToAttributeName: playoffGroup.addNameBaseToAttributeName,
      playoffStructureNameBase: playoffGroup.playoffStructureNameBase,
      finishingPositionNaming: playoffGroup.finishingPositionNaming,
      finishingPositionLimit: playoffGroup.finishingPositionLimit,
      structureId: playoffGroup.structureId ?? uuids?.pop(),
      playoffAttributes: playoffGroup.playoffAttributes,
      structureNameMap: playoffGroup.structureNameMap,
      sequenceLimit: playoffGroup.sequenceLimit,
      structureName,
    };

    const params = {
      ...playoffGroupParams,
      idPrefix: idPrefix && `${idPrefix}-po`,
      appliedPolicies: policyDefinitions,
      finishingPositionOffset,
      stage: PLAY_OFF,
      stageSequence,
      matchUpType,
      drawSize,
      isMock,
      uuids,
    };

    const updateStructureAndLinks = ({ playoffStructures, playoffLinks }) => {
      const [playoffStructure] = playoffStructures;
      const playoffLink = generatePlayoffLink({
        playoffStructureId: playoffStructure.structureId,
        finishingPositions,
        sourceStructureId,
      });

      links.push(playoffLink);
      links.push(...playoffLinks);
      structures.push(...playoffStructures);
      finishingPositionTargets.push({
        structureId: playoffStructure.structureId,
        finishingPositions,
      });
      // update *after* value has been passed into current playoff structure generator
      finishingPositionOffset += participantsInDraw;
    };

    if (playoffDrawType === SINGLE_ELIMINATION) {
      const { matchUps } = treeMatchUps({
        finishingPositionLimit: finishingPositionOffset + participantsInDraw,
        idPrefix: idPrefix && `${idPrefix}-po`,
        finishingPositionOffset,
        matchUpType,
        drawSize,
        isMock,
        uuids,
      });

      const playoffStructure = structureTemplate({
        structureId: playoffGroup.structureId ?? uuids?.pop(),
        matchUpFormat: playoffMatchUpFormat,
        stage: PLAY_OFF,
        structureName,
        stageSequence,
        matchUps,
      });
      structures.push(playoffStructure);

      const playoffLink = generatePlayoffLink({
        playoffStructureId: playoffStructure.structureId,
        finishingPositions,
        sourceStructureId,
      });
      links.push(playoffLink);

      // update *after* value has been passed into current playoff structure generator
      finishingPositionOffset += participantsInDraw;

      finishingPositionTargets.push({
        structureId: playoffStructure.structureId,
        finishingPositions,
      });
    } else if ([COMPASS, OLYMPIC, PLAY_OFF].includes(playoffDrawType)) {
      const params = {
        playoffAttributes: playoffGroup.playoffAttributes ?? playoffAttributes,
        playoffStructureNameBase: playoffGroup.playoffStructureNameBase,
        structureId: playoffGroup.structureId ?? uuids?.pop(),
        structureName: playoffGroup.structureName,
        idPrefix: idPrefix && `${idPrefix}-po`,
        addNameBaseToAttributeName: true,
        finishingPositionOffset,
        stage: PLAY_OFF,
        roundOffset: 0,
        stageSequence,
        drawSize,
        isMock,
        uuids,
      };

      if (playoffDrawType === COMPASS) {
        Object.assign(params, {
          playoffAttributes: playoffGroup?.playoffAttributes ?? playoffAttributes ?? COMPASS_ATTRIBUTES,
          roundOffsetLimit: 3,
        });
      } else if (playoffDrawType === OLYMPIC) {
        Object.assign(params, {
          playoffAttributes: playoffGroup?.playoffAttributes ?? playoffAttributes ?? OLYMPIC_ATTRIBUTES,
          roundOffsetLimit: 2,
        });
      }

      const result = generatePlayoffStructures(params);
      if (result.error) return result;

      if (result.links?.length) links.push(...result.links);
      if (result.structures?.length) structures.push(...result.structures);
      structures.sort(structureSort);

      if (result.structureId) {
        const playoffLink = generatePlayoffLink({
          playoffStructureId: result.structureId,
          finishingPositions,
          sourceStructureId,
        });
        links.push(playoffLink);
        finishingPositionTargets.push({
          structureId: result.structureId,
          finishingPositions,
        });
      }
      // update *after* value has been passed into current playoff structure generator
      finishingPositionOffset += participantsInDraw;
    } else if (
      [
        FIRST_MATCH_LOSER_CONSOLATION,
        FEED_IN_CHAMPIONSHIP,
        FEED_IN_CHAMPIONSHIP_TO_R16,
        FEED_IN_CHAMPIONSHIP_TO_QF,
        FEED_IN_CHAMPIONSHIP_TO_SF,
        MODIFIED_FEED_IN_CHAMPIONSHIP,
      ].includes(playoffDrawType)
    ) {
      const uuidsFMLC = [uuids?.pop(), uuids?.pop()];
      const params = {
        playoffStructureNameBase: playoffGroup.playoffStructureNameBase,
        structureId: playoffGroup.structureId ?? uuids?.pop(),
        playoffAttributes: playoffGroup.playoffAttributes,
        idPrefix: idPrefix && `${idPrefix}-po`,
        finishingPositionOffset,
        uuids: uuidsFMLC,
        stage: PLAY_OFF,
        structureName,
        matchUpType,
        feedPolicy,
        drawSize,
        isMock,
      };

      const additionalAttributes = {
        [FIRST_MATCH_LOSER_CONSOLATION]: { fmlc: true, feedRounds: 1 },
        [MODIFIED_FEED_IN_CHAMPIONSHIP]: { feedRounds: 1 },
        [FEED_IN_CHAMPIONSHIP_TO_R16]: { feedsFromFinal: 3 },
        [FEED_IN_CHAMPIONSHIP_TO_QF]: { feedsFromFinal: 2 },
        [FEED_IN_CHAMPIONSHIP_TO_SF]: { feedsFromFinal: 1 },
      };

      Object.assign(params, additionalAttributes[playoffDrawType] || {});

      const { structures: champitionShipStructures, links: feedInLinks } = feedInChampionship(params);
      const [playoffStructure] = champitionShipStructures;
      const playoffLink = generatePlayoffLink({
        playoffStructureId: playoffStructure.structureId,
        finishingPositions,
        sourceStructureId,
      });

      links.push(playoffLink);
      links.push(...feedInLinks);
      structures.push(...champitionShipStructures);
      finishingPositionTargets.push({
        structureId: playoffStructure.structureId,
        finishingPositions,
      });
      // update *after* value has been passed into current playoff structure generator
      finishingPositionOffset += participantsInDraw;
    } else if ([ROUND_ROBIN].includes(playoffDrawType)) {
      const { structures: playoffStructures, links: playoffLinks } = generateRoundRobin({
        ...params,
        structureOptions: playoffGroup.structureOptions || { groupSize: 4 },
      });
      updateStructureAndLinks({ playoffStructures, playoffLinks });
    } else if ([FIRST_ROUND_LOSER_CONSOLATION].includes(playoffDrawType)) {
      const { structures: playoffStructures, links: playoffLinks } = firstRoundLoserConsolation(params);
      updateStructureAndLinks({ playoffStructures, playoffLinks });
    } else if ([CURTIS_CONSOLATION].includes(playoffDrawType)) {
      const { structures: playoffStructures, links: playoffLinks } = generateCurtisConsolation(params);
      updateStructureAndLinks({ playoffStructures, playoffLinks });
    } else if ([AD_HOC].includes(playoffDrawType)) {
      const structure = structureTemplate({
        structureId: playoffGroup.structureId ?? uuids?.pop(),
        structureName: playoffGroup.structureName,
        finishingPosition: WIN_RATIO,
        stage: PLAY_OFF,
        stageSequence,
        matchUps: [],
      });
      updateStructureAndLinks({
        playoffStructures: [structure],
        playoffLinks: [],
      });
    }
  }

  return { finishingPositionTargets, positionRangeMap, structures, links };
}

function generatePlayoffLink({ playoffStructureId, finishingPositions, sourceStructureId }) {
  return {
    linkType: POSITION,
    source: {
      structureId: sourceStructureId,
      finishingPositions,
    },
    target: {
      structureId: playoffStructureId,
      feedProfile: DRAW,
      roundNumber: 1,
    },
  };
}
