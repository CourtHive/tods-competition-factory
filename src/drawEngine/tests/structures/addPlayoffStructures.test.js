import { reset, initialize, mainDrawPositions } from '../primitives/primitives';
import { setSubscriptions } from '../../..';
import { drawEngine } from '../../sync';

drawEngine.devContext(true);

import { ADD_MATCHUPS } from '../../../constants/topicConstants';
import {
  FIRST_MATCH_LOSER_CONSOLATION,
  MAIN,
} from '../../../constants/drawDefinitionConstants';

it('can add 3-4 playoff structure to a SINGLE ELIMINATION structure', () => {
  const { success, drawDefinition } = drawEngineAddStructuresTest({
    playoffPositions: [3, 4],
    drawSize: 16,
  });
  expect(success).toEqual(true);
  const { links, structures } = drawDefinition;
  expect(links.length).toEqual(1);
  expect(structures.length).toEqual(2);
});

it('can add 5-8 playoff structure to a SINGLE ELIMINATION structure by playoffPositions', () => {
  const { success, drawDefinition, matchUpAddNotices, allMatchUps } =
    drawEngineAddStructuresTest({
      playoffPositions: [5, 6, 7, 8],
      drawSize: 16,
    });
  expect(success).toEqual(true);
  const { links, structures } = drawDefinition;
  expect(links.length).toEqual(2);
  expect(structures.length).toEqual(3);
  expect(matchUpAddNotices).toEqual([4]);

  // because this is drawEngine there is no attachment of drawDefinition to a tournamentRecord
  expect(allMatchUps.length).toEqual(4);
});

it('can add 5-8 playoff structure to a SINGLE ELIMINATION structure by a single playoff position', () => {
  const { success, drawDefinition } = drawEngineAddStructuresTest({
    playoffPositions: [5],
    drawSize: 16,
  });
  expect(success).toEqual(true);
  const { links, structures } = drawDefinition;
  expect(links.length).toEqual(2);
  expect(structures.length).toEqual(3);
});

it('can add 3-8 playoff structures to a SINGLE ELIMINATION by a single playoff position from each structure', () => {
  const { success, drawDefinition } = drawEngineAddStructuresTest({
    playoffPositions: [3, 5],
    drawSize: 16,
  });
  expect(success).toEqual(true);
  const { links, structures } = drawDefinition;
  expect(links.length).toEqual(3);
  expect(structures.length).toEqual(4);
});

it('can add 3-8 playoff structures to a SINGLE ELIMINATION by roundNumbers', () => {
  const { success, drawDefinition } = drawEngineAddStructuresTest({
    roundNumbers: [2, 3],
    drawSize: 16,
  });
  expect(success).toEqual(true);
  const { links, structures } = drawDefinition;
  expect(links.length).toEqual(3);
  expect(structures.length).toEqual(4);
});

it('can add 5-8 playoff structure to a SINGLE ELIMINATION structure by roundNumbers', () => {
  const { success, drawDefinition } = drawEngineAddStructuresTest({
    roundNumbers: [2],
    drawSize: 16,
  });
  expect(success).toEqual(true);
  const { links, structures } = drawDefinition;
  expect(links.length).toEqual(2);
  expect(structures.length).toEqual(3);
});

it('can add 3-4 playoff structure to a FIRST_MATCH_LOSER_CONSOLATION structure', () => {
  const { success, drawDefinition } = drawEngineAddStructuresTest({
    drawType: FIRST_MATCH_LOSER_CONSOLATION,
    playoffPositions: [3, 4],
    drawSize: 16,
  });
  expect(success).toEqual(true);
  const { links, structures } = drawDefinition;
  expect(links.length).toEqual(3);
  expect(structures.length).toEqual(3);
});

function drawEngineAddStructuresTest({
  playoffPositions,
  roundNumbers,
  drawSize,
  drawType,
}) {
  const allMatchUps = [];
  let matchUpAddNotices = [];

  const subscriptions = {
    [ADD_MATCHUPS]: (payload) => {
      if (Array.isArray(payload)) {
        payload.forEach(({ matchUps }) => {
          matchUpAddNotices.push(matchUps.length);
          allMatchUps.push(...matchUps);
        });
      }
    },
  };

  setSubscriptions({ subscriptions });

  reset();
  initialize();
  mainDrawPositions({ drawSize, drawType });
  let result = drawEngine.generateDrawTypeAndModifyDrawDefinition({ drawType });
  expect(result.success).toEqual(true);

  let { drawDefinition } = drawEngine.getState();
  const mainStructure = drawDefinition.structures.find(
    (structure) => structure.stage === MAIN
  );
  result = drawEngine.addPlayoffStructures({
    structureId: mainStructure.structureId,
    playoffPositions,
    roundNumbers,
  });
  ({ drawDefinition } = drawEngine.getState());

  return { ...result, drawDefinition, allMatchUps, matchUpAddNotices };
}
