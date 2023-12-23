import { doubleEliminationLinks } from '../links/doubleEliminationLinks';
import { constantToString } from '../../../../utilities/strings';
import { structureTemplate } from '../../templates/structureTemplate';
import { feedInMatchUps } from '../feedInMatchUps';
import { treeMatchUps } from './eliminationTree';

import { Structure } from '../../../../types/tournamentTypes';
import { SUCCESS } from '../../../../constants/resultConstants';
import {
  MAIN,
  BACKDRAW,
  DECIDER,
  CONSOLATION,
  PLAY_OFF,
} from '../../../../constants/drawDefinitionConstants';

export function generateDoubleElimination({
  structureName,
  matchUpType,
  idPrefix,
  drawSize,
  isMock,
  uuids,
}) {
  const structures: Structure[] = [];

  // feedIn MAIN structure needs 1st round feed and final round feed
  const { matchUps } = feedInMatchUps({
    linkFedFinishingRoundNumbers: [1],
    drawSize: drawSize + 1,
    matchUpType,
    idPrefix,
    isMock,
  });
  const mainStructure = structureTemplate({
    structureName: structureName || constantToString(MAIN),
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
    structureName: constantToString(BACKDRAW),
    matchUps: consolationMatchUps,
    structureId: uuids?.pop(),
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
    structureName: constantToString(DECIDER),
    matchUps: deciderMatchUps,
    structureId: uuids?.pop(),
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
