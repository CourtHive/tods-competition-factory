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
  structureName,
  drawDefinition,
  matchUpType,
  drawSize,
  uuids,
}) {
  // feedIn MAIN structure needs 1st round feed and final round feed
  const { matchUps } = feedInMatchUps({
    matchUpType,
    drawSize: drawSize + 1,
    linkFedFinishingRoundNumbers: [1],
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
    matchUpType,
    isConsolation: true,
    drawSize: drawSize - 1,
    finishingPositionOffset: consolationDrawPositions,
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
