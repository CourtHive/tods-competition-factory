import { getPositionRangeMap } from '../governors/structureGovernor/getPositionRangeMap';
import { decorateResult } from '../../global/functions/decorateResult';
import { generatePlayoffStructures } from './playoffStructures';
import { structureSort } from '../getters/structureSort';
import structureTemplate from './structureTemplate';
import { feedInChampionship } from './feedInChamp';
import { treeMatchUps } from './eliminationTree';
import { nextPowerOf2 } from '../../utilities';

import { INVALID_VALUES } from '../../constants/errorConditionConstants';
import { POLICY_TYPE_FEED_IN } from '../../constants/policyConstants';
import {
  COMPASS,
  COMPASS_ATTRIBUTES,
  DRAW,
  FIRST_MATCH_LOSER_CONSOLATION,
  OLYMPIC,
  OLYMPIC_ATTRIBUTES,
  PLAY_OFF,
  POSITION,
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

    if (playoffDrawType === SINGLE_ELIMINATION) {
      const { matchUps } = treeMatchUps({
        idPrefix: idPrefix && `${idPrefix}-po`,
        finishingPositionLimit: finishingPositionOffset + participantsInDraw,
        finishingPositionOffset,
        matchUpType,
        drawSize,
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
        addNameBaseToAttributeName: true,
        finishingPositionOffset,
        stage: PLAY_OFF,
        roundOffset: 0,
        stageSequence,
        drawSize,
        idPrefix,
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
    } else if (playoffDrawType === FIRST_MATCH_LOSER_CONSOLATION) {
      // TODO: test this
      console.log('RRw/PO FIRST_MATCH_LOSER_CONSOLATION');
      const uuidsFMLC = [uuids?.pop(), uuids?.pop()];
      const { structures: champitionShipStructures, links: feedInLinks } =
        feedInChampionship({
          structureName: playoffGroup.structureName,
          idPrefix: idPrefix && `${idPrefix}-po`,
          finishingPositionOffset,
          uuids: uuidsFMLC,
          stage: PLAY_OFF,
          feedRounds: 1,
          matchUpType,
          feedPolicy,
          fmlc: true,
          drawSize,
        });
      const [playoffStructure] = structures;
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
