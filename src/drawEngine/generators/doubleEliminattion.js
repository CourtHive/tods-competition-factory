import { doubleEliminationLinks } from '../../drawEngine/generators/doubleEliminationLinks';
import {
  treeMatchUps,
  feedInMatchUps,
} from '../../drawEngine/generators/eliminationTree';
import { structureTemplate } from '../../drawEngine/generators/structureTemplate';
import {
  MAIN,
  BACKDRAW,
  DECIDER,
} from '../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../constants/resultConstants';

export function generateDoubleElimination({
  structureName,
  drawDefinition,
  drawSize,
  uuids,
}) {
  // feedIn MAIN structure needs 1st round feed and final round feed
  const { matchUps } = feedInMatchUps({
    drawSize: drawSize + 1,
    linkFedFinishingRoundNumbers: [1],
  });
  const mainStructure = structureTemplate({
    structureName: structureName || MAIN,
    structureId: uuids?.pop(),
    stageSequence: 1,
    stage: MAIN,
    matchUps,
  });

  drawDefinition.structures.push(mainStructure);

  const consolationDrawPositions = drawSize / 2;

  const { matchUps: consolationMatchUps } = feedInMatchUps({
    isConsolation: true,
    drawSize: drawSize - 1,
    finishingPositionOffset: consolationDrawPositions,
  });

  const consolationStructure = structureTemplate({
    matchUps: consolationMatchUps,
    structureId: uuids?.pop(),
    structureName: BACKDRAW,
    stageSequence: 2,
    stage: MAIN,
  });

  drawDefinition.structures.push(consolationStructure);

  const { matchUps: deciderMatchUps } = treeMatchUps({ drawSize: 2 });
  const deciderStructure = structureTemplate({
    matchUps: deciderMatchUps,
    structureId: uuids?.pop(),
    structureName: DECIDER,
    stageSequence: 3,
    stage: MAIN,
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
