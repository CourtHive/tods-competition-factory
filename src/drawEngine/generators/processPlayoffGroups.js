import { getPositionRangeMap } from '../governors/structureGovernor/getPositionRangeMap';
import { firstRoundLoserConsolation } from './firstRoundLoserConsolation';
import { decorateResult } from '../../global/functions/decorateResult';
import { generateCurtisConsolation } from './curtisConsolation';
import { generatePlayoffStructures } from './playoffStructures';
import { structureSort } from '../getters/structureSort';
import structureTemplate from './structureTemplate';
import { feedInChampionship } from './feedInChamp';
import { generateRoundRobin } from './roundRobin';
import { treeMatchUps } from './eliminationTree';
import { nextPowerOf2 } from '../../utilities';

import { INVALID_VALUES } from '../../constants/errorConditionConstants';
import { POLICY_TYPE_FEED_IN } from '../../constants/policyConstants';
import { WIN_RATIO } from '../../constants/statsConstants';
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
} from '../../constants/drawDefinitionConstants';

export function processPlayoffGroups({
  compassAttributes = COMPASS_ATTRIBUTES,
  olympicAttributes = OLYMPIC_ATTRIBUTES,
  playoffMatchUpFormat,
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
}) {
  feedPolicy = feedPolicy || policyDefinitions?.[POLICY_TYPE_FEED_IN];
  const stack = 'processPlayoffGroups';

  let finishingPositionOffset = 0;
  const finishingPositionTargets = [];
  const structures = [];
  const links = [];

  const { error, positionRangeMap } = getPositionRangeMap({
    structureId: sourceStructureId,
    drawDefinition,
    playoffGroups,
  });

  if (error) return decorateResult({ result: { error }, stack });

  const validFinishingPositions =
    !positionRangeMap ||
    playoffGroups?.every((profile) => {
      const { finishingPositions } = profile;
      return (
        finishingPositions.length &&
        finishingPositions.every((position) => positionRangeMap[position])
      );
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
      positionRangeMap &&
      finishingPositions
        .map((p) => positionRangeMap[p]?.finishingPositions)
        .flat();

    const playoffDrawType = playoffGroup.drawType || SINGLE_ELIMINATION;
    const participantsInDraw = groupCount * finishingPositions.length;
    const drawSize = nextPowerOf2(participantsInDraw);

    if (positionsPlayedOff) {
      finishingPositionOffset = Math.min(...positionsPlayedOff) - 1;
    }

    const params = {
      structureName: playoffGroup.structureName,
      idPrefix: idPrefix && `${idPrefix}-po`,
      appliedPolicies: policyDefinitions,
      structureId: uuids?.pop(),
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
        structureName: playoffGroup.structureName,
        matchUpFormat: playoffMatchUpFormat,
        structureId: uuids?.pop(),
        stage: PLAY_OFF,
        stageSequence,
        matchUpType,
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
      const { structureName } = playoffGroup;

      const params = {
        playoffStructureNameBase: structureName,
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
          roundOffsetLimit: 3,
          playoffAttributes: compassAttributes,
        });
      } else if (playoffDrawType === OLYMPIC) {
        Object.assign(params, {
          roundOffsetLimit: 2,
          playoffAttributes: olympicAttributes,
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
        structureName: playoffGroup.structureName,
        idPrefix: idPrefix && `${idPrefix}-po`,
        finishingPositionOffset,
        uuids: uuidsFMLC,
        stage: PLAY_OFF,
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

      const { structures: champitionShipStructures, links: feedInLinks } =
        feedInChampionship(params);
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
      const { structures: playoffStructures, links: playoffLinks } =
        generateRoundRobin({
          ...params,
          structureOptions: playoffGroup.structureOptions || { groupSize: 4 },
        });
      updateStructureAndLinks({ playoffStructures, playoffLinks });
    } else if ([FIRST_ROUND_LOSER_CONSOLATION].includes(playoffDrawType)) {
      const { structures: playoffStructures, links: playoffLinks } =
        firstRoundLoserConsolation(params);
      updateStructureAndLinks({ playoffStructures, playoffLinks });
    } else if ([CURTIS_CONSOLATION].includes(playoffDrawType)) {
      const { structures: playoffStructures, links: playoffLinks } =
        generateCurtisConsolation(params);
      updateStructureAndLinks({ playoffStructures, playoffLinks });
    } else if ([AD_HOC].includes(playoffDrawType)) {
      const structure = structureTemplate({
        structureName: playoffGroup.structureName,
        finishingPosition: WIN_RATIO,
        structureId: uuids?.pop(),
        stage: PLAY_OFF,
        stageSequence,
        matchUps: [],
        matchUpType,
      });
      updateStructureAndLinks({
        playoffStructures: [structure],
        playoffLinks: [],
      });
    }
  }

  return { finishingPositionTargets, positionRangeMap, structures, links };
}

function generatePlayoffLink({
  playoffStructureId,
  finishingPositions,
  sourceStructureId,
}) {
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
