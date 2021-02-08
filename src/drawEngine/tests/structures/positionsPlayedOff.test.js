import { getPositionsPlayedOff } from '../../governors/structureGovernor/getPositionsPlayedOff';
import { reset, initialize, mainDrawPositions } from '../primitives/primitives';
import { drawEngine } from '../../sync';

import { FEED_FMLC } from '../../../constants/drawDefinitionConstants';

it('can correctly determin positions playedOff for STANDARD_ELIMINATION', () => {
  reset();
  initialize();
  mainDrawPositions({ drawSize: 16 });
  const result = drawEngine.generateDrawType();
  expect(result.success).toEqual(true);

  const { drawDefinition } = drawEngine.getState();

  const { positionsPlayedOff } = getPositionsPlayedOff({ drawDefinition });
  expect(positionsPlayedOff).toEqual([1, 2]);
});

it('can correctly determin positions playedOff for FEED_FMLC', () => {
  reset();
  initialize();
  mainDrawPositions({ drawSize: 16 });
  const result = drawEngine.generateDrawType({
    drawType: FEED_FMLC,
  });
  expect(result.success).toEqual(true);

  const { drawDefinition } = drawEngine.getState();

  const { positionsPlayedOff } = getPositionsPlayedOff({ drawDefinition });
  expect(positionsPlayedOff).toEqual([1, 2, 5, 6]);
  // NOTE: FMLC positions played off can vary
  //  ==> if there are no second round first match losers it plays off 9-10
  //  ==> if there are second round first match losers it plays off 5-6
});
