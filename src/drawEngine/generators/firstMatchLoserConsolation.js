import { stageDrawPositionsCount } from '../../drawEngine/getters/stageGetter';
import { treeMatchUps } from '../../drawEngine/generators/eliminationTree';

import structureTemplate from '../../drawEngine/generators/structureTemplate';
import {
  MAIN,
  CONSOLATION,
  TOP_DOWN,
  LOSER,
  FIRST_MATCHUP,
  LOSS_POSITION,
} from '../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../constants/resultConstants';

export function firstMatchLoserConsolation(props) {
  let { drawSize, consolationStructureName } = props;
  const {
    uuids,
    stage = MAIN,
    structureName,
    drawDefinition,
    stageSequence = 1,
    finishingPositionOffset = 0,
  } = props;

  drawSize = drawSize || stageDrawPositionsCount({ stage, drawDefinition });
  const { matchUps } = treeMatchUps({ drawSize, finishingPositionOffset });
  const mainStructure = structureTemplate({
    stage,
    matchUps,
    stageSequence,
    structureId: uuids?.pop(),
    structureName: structureName || MAIN,
  });

  if (drawDefinition) {
    drawDefinition.structures.push(mainStructure);
  }

  const consolationDrawPositions = drawSize / 2;

  const { matchUps: consolationMatchUps } = treeMatchUps({
    drawSize: consolationDrawPositions,
    finishingPositionOffset: finishingPositionOffset + consolationDrawPositions,
  });

  consolationStructureName =
    consolationStructureName ||
    (structureName ? `${structureName} ${CONSOLATION}` : CONSOLATION);

  const consolationStructure = structureTemplate({
    stageSequence: 1,
    stage: CONSOLATION,
    structureId: uuids?.pop(),
    matchUps: consolationMatchUps,
    structureName: consolationStructureName,
  });

  if (drawDefinition) {
    drawDefinition.structures.push(consolationStructure);
  }

  const firstRoundLink = {
    linkType: LOSER,
    source: {
      roundNumber: 1,
      structureId: mainStructure.structureId,
    },
    target: {
      roundNumber: 1,
      feedProfile: TOP_DOWN,
      structureId: consolationStructure.structureId,
    },
  };

  const secondRoundLink = {
    linkType: LOSER,
    linkCondition: FIRST_MATCHUP,
    source: {
      roundNumber: 2,
      structureId: mainStructure.structureId,
    },
    target: {
      roundNumber: 1,
      feedProfile: LOSS_POSITION,
      structureId: consolationStructure.structureId,
    },
  };

  if (drawDefinition) {
    drawDefinition.links.push(firstRoundLink, secondRoundLink);
  }

  return Object.assign(
    {
      mainStructure,
      consolationStructure,
      link: firstRoundLink,
      links: drawDefinition?.links,
    },
    SUCCESS
  );
}
