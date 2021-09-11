import { doubleEliminationLinks } from '../../drawEngine/generators/doubleEliminationLinks';
import { structureTemplate } from '../../drawEngine/generators/structureTemplate';
import {
  treeMatchUps,
  feedInMatchUps,
} from '../../drawEngine/generators/eliminationTree';

import { SUCCESS } from '../../constants/resultConstants';
import {
  MAIN,
  BACKDRAW,
  DECIDER,
} from '../../constants/drawDefinitionConstants';

export function generateDoubleElimination({
  drawDefinition,
  structureName,
  matchUpType,
  idPrefix,
  drawSize,
  uuids,
}) {
  // feedIn MAIN structure needs 1st round feed and final round feed
  const { matchUps } = feedInMatchUps({
    linkFedFinishingRoundNumbers: [1],
    drawSize: drawSize + 1,
    matchUpType,
    idPrefix,
  });
  const mainStructure = structureTemplate({
    structureName: structureName || MAIN,
    structureId: uuids?.pop(),
    stageSequence: 1,
    stage: MAIN,
    matchUpType,
    matchUps,
  });

  drawDefinition.structures.push(mainStructure);

  const consolationDrawPositions = drawSize / 2;

  const { matchUps: consolationMatchUps } = feedInMatchUps({
    finishingPositionOffset: consolationDrawPositions,
    idPrefix: idPrefix && `${idPrefix}-c`,
    drawSize: drawSize - 1,
    isConsolation: true,
    matchUpType,
    uuids,
  });

  const consolationStructure = structureTemplate({
    matchUps: consolationMatchUps,
    structureId: uuids?.pop(),
    structureName: BACKDRAW,
    stageSequence: 2,
    matchUpType,
    stage: MAIN,
  });

  drawDefinition.structures.push(consolationStructure);

  const { matchUps: deciderMatchUps } = treeMatchUps({
    idPrefix: idPrefix && `${idPrefix}-p1t2`,
    drawSize: 2,
    matchUpType,
  });
  const deciderStructure = structureTemplate({
    matchUps: deciderMatchUps,
    structureId: uuids?.pop(),
    structureName: DECIDER,
    stageSequence: 3,
    stage: MAIN,
    matchUpType,
  });

  drawDefinition.structures.push(deciderStructure);

  const links = doubleEliminationLinks({
    mainStructure,
    consolationStructure,
    deciderStructure,
  });

  drawDefinition.links = drawDefinition.links.concat(...links);

  return Object.assign(
    {
      structures: drawDefinition.structures,
      links: drawDefinition.links,
    },
    SUCCESS
  );
}
