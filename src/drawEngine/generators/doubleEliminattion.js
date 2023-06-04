import { doubleEliminationLinks } from '../../drawEngine/generators/doubleEliminationLinks';
import { structureTemplate } from '../../drawEngine/generators/structureTemplate';
import { feedInMatchUps } from './feedInMatchUps';
import { treeMatchUps } from './eliminationTree';

import { SUCCESS } from '../../constants/resultConstants';
import {
  MAIN,
  BACKDRAW,
  DECIDER,
  CONSOLATION,
  PLAY_OFF,
} from '../../constants/drawDefinitionConstants';

export function generateDoubleElimination({
  structureName,
  matchUpType,
  idPrefix,
  drawSize,
  isMock,
  uuids,
}) {
  const structures = [];

  // feedIn MAIN structure needs 1st round feed and final round feed
  const { matchUps } = feedInMatchUps({
    linkFedFinishingRoundNumbers: [1],
    drawSize: drawSize + 1,
    matchUpType,
    idPrefix,
    isMock,
  });
  const mainStructure = structureTemplate({
    structureName: structureName || MAIN,
    structureId: uuids?.pop(),
    stageSequence: 1,
    stage: MAIN,
    matchUpType,
    matchUps,
  });

  structures.push(mainStructure);

  const consolationDrawPositions = drawSize / 2;

  const { matchUps: consolationMatchUps } = feedInMatchUps({
    finishingPositionOffset: consolationDrawPositions,
    idPrefix: idPrefix && `${idPrefix}-c`,
    drawSize: drawSize - 1,
    isConsolation: true,
    matchUpType,
    isMock,
    uuids,
  });

  const consolationStructure = structureTemplate({
    matchUps: consolationMatchUps,
    structureId: uuids?.pop(),
    structureName: BACKDRAW,
    stage: CONSOLATION,
    stageSequence: 2,
    matchUpType,
  });

  structures.push(consolationStructure);

  const { matchUps: deciderMatchUps } = treeMatchUps({
    idPrefix: idPrefix && `${idPrefix}-p1t2`,
    drawSize: 2,
    matchUpType,
    isMock,
  });
  const deciderStructure = structureTemplate({
    matchUps: deciderMatchUps,
    structureId: uuids?.pop(),
    structureName: DECIDER,
    stageSequence: 3,
    stage: PLAY_OFF,
    matchUpType,
  });

  structures.push(deciderStructure);

  const links = doubleEliminationLinks({
    mainStructure,
    consolationStructure,
    deciderStructure,
  });

  return {
    structures,
    links: links,
    ...SUCCESS,
  };
}
