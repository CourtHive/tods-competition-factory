import drawEngine from '../../../drawEngine';
import { reset, initialize, mainDrawPositions, qualifyingDrawPositions } from '../primitives/primitives';
import {
  DRAW, WINNER,
  CONTAINER, ITEM,
  QUALIFYING, MAIN,
  WIN_RATIO, ROUND_OUTCOME,
  ROUND_ROBIN, ROUND_ROBIN_WITH_PLAYOFF
} from '../../../constants/drawDefinitionConstants';

it('can generate Round Robin Main Draws', () => {
  reset();
  initialize();
  const drawType = ROUND_ROBIN;
  mainDrawPositions({drawSize: 16});
  let { structure } = drawEngine.generateDrawType({drawType});
  expect(structure.structureType).toEqual(CONTAINER);
  expect(structure.finishingPosition).toEqual(WIN_RATIO);
  expect(structure.structures.length).toEqual(4);
  expect(structure.structures[0].structureType).toEqual(ITEM);
  expect(structure.structures[0].matchUps.length).toEqual(6);
  
  reset();
  initialize();
  mainDrawPositions({drawSize: 32});
  ({ structure } = drawEngine.generateDrawType({drawType}));
  expect(structure.structures.length).toEqual(8);
});

it('can generate Round Robins with varying group sizes', () => {
  reset();
  initialize();
  mainDrawPositions({drawSize: 30});
  let options = { groupSize: 5 };
  let { structure } = drawEngine.generateDrawType({drawType: ROUND_ROBIN, structureOptions: options});
  expect(structure.structures.length).toEqual(6);
  expect(structure.structures[0].matchUps.length).toEqual(10);
  expect(structure.structures[0].matchUps[0].drawPositions).toMatchObject([1,2]);
  expect(structure.structures[0].matchUps[1].drawPositions).toMatchObject([3,4]);
  
  reset();
  initialize();
  mainDrawPositions({drawSize: 30});
  options = { groupSize: 3 };
  ({ structure } = drawEngine.generateDrawType({drawType: ROUND_ROBIN, structureOptions: options}));
  expect(structure.structures.length).toEqual(10);
  expect(structure.structures[0].matchUps.length).toEqual(3);
  expect(structure.structures[0].matchUps[0].roundNumber).toEqual(1);
  expect(structure.structures[0].matchUps[1].roundNumber).toEqual(2);
  expect(structure.structures[0].matchUps[2].roundNumber).toEqual(3);
  expect(structure.structures[0].matchUps[0].drawPositions).toMatchObject([1,2]);
  expect(structure.structures[0].matchUps[1].drawPositions).toMatchObject([2,3]);
  expect(structure.structures[0].matchUps[2].drawPositions).toMatchObject([1,3]);
});
  
it('can generate Round Robins 32 with playoffs', () => {
  reset();
  initialize();
  const drawSize = 32;
  const stage = QUALIFYING;
  const drawType = ROUND_ROBIN_WITH_PLAYOFF;
  qualifyingDrawPositions({drawSize});
  const structureOptions = { playOffGroups: [
    { finishingPositions: [1], structureName: 'Gold Flight' },
    { finishingPositions: [2], structureName: 'Silver Flight' }
  ]};
  let result = drawEngine.generateDrawType({
    stage,
    drawType,
    structureOptions
  });
  let { qualifyingStructure, mainStructures, links } = result;

  expect(qualifyingStructure.stage).toEqual(QUALIFYING);
  expect(qualifyingStructure.structures.length).toEqual(8);
  
  expect(mainStructures.length).toEqual(2);
  expect(mainStructures[0].structureName).toEqual('Gold Flight');
  expect(mainStructures[1].structureName).toEqual('Silver Flight');
 
  expect(mainStructures[0].stage).toEqual(MAIN);
  expect(mainStructures[0].finishingPosition).toEqual(ROUND_OUTCOME);
  expect(mainStructures[0].matchUps.length).toEqual(7);
  expect(mainStructures[0].matchUps[0].finishingRound).toEqual(3);
 
  expect(links.length).toEqual(2);
  expect(links[0].linkSubject).toEqual(WINNER);
  expect(links[0].source.finishingPositions).toMatchObject([1]);
  expect(links[0].target.roundNumber).toEqual(1);
  expect(links[0].target.feedProfile).toEqual(DRAW);
  
  expect(links[1].linkSubject).toEqual(WINNER);
  expect(links[1].source.finishingPositions).toMatchObject([2]);
  expect(links[1].target.roundNumber).toEqual(1);
  expect(links[1].target.feedProfile).toEqual(DRAW);
});  

it('can generate Round Robins 16 with playoffs', () => {
  reset();
  initialize();
  const stage = QUALIFYING;
  const drawType = ROUND_ROBIN_WITH_PLAYOFF;
  qualifyingDrawPositions({drawSize: 16});
  const structureOptions = { playOffGroups: [
    { finishingPositions: [1], structureName: 'Gold Flight' },
    { finishingPositions: [2], structureName: 'Silver Flight' }
  ]};
  let { qualifyingStructure, mainStructures, links } = drawEngine.generateDrawType({
    stage,
    drawType,
    structureOptions
  });

  expect(qualifyingStructure.stage).toEqual(QUALIFYING);
  expect(qualifyingStructure.structures.length).toEqual(4);
  
  expect(mainStructures.length).toEqual(2);
  expect(mainStructures[0].structureName).toEqual('Gold Flight');
  expect(mainStructures[1].structureName).toEqual('Silver Flight');
 
  expect(mainStructures[0].stage).toEqual(MAIN);
  expect(mainStructures[0].finishingPosition).toEqual(ROUND_OUTCOME);
  expect(mainStructures[0].matchUps.length).toEqual(3);
  expect(mainStructures[0].matchUps[0].finishingRound).toEqual(2);
 
  expect(links.length).toEqual(2);
  expect(links[0].linkSubject).toEqual(WINNER);
  expect(links[0].source.finishingPositions).toMatchObject([1]);
  expect(links[0].target.roundNumber).toEqual(1);
  expect(links[0].target.feedProfile).toEqual(DRAW);
  
  expect(links[1].linkSubject).toEqual(WINNER);
  expect(links[1].source.finishingPositions).toMatchObject([2]);
  expect(links[1].target.roundNumber).toEqual(1);
  expect(links[1].target.feedProfile).toEqual(DRAW);
});  
