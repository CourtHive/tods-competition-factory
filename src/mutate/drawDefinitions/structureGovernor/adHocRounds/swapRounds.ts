// constants
import { DrawDefinition } from '@Types/tournamentTypes';
import { SUCCESS } from '@Constants/resultConstants';
import { checkRoundsArgs } from './checkRoundsArgs';

/**
 * Swaps two rounds within the specified structure
 * e.g. { roundNumbers: [3, 5] } would reorder [1,2,3,4,5,6] to [1,2,5,4,3,6] and then renumber the swapped rounds
 * matchUpNoficiation notices for matchUps in the two swapped rounds are be generated
 */

type SwapRoundsArgs = {
  roundNumbers: [number, number];
  drawDefinition: DrawDefinition;
  structureId: string;
};

export function swapRounds(params: SwapRoundsArgs) {
  const check = checkRoundsArgs(params);
  if (check.error) return check;

  return { ...SUCCESS };
}
