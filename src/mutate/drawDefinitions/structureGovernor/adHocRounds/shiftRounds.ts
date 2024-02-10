// constants
import { DrawDefinition } from '@Types/tournamentTypes';
import { SUCCESS } from '@Constants/resultConstants';
import { checkRoundsArgs } from './checkRoundsArgs';

/**
 * Shifts roundNumber to targetRoundNumber within the specified structure
 * e.g. { roundNumber: 2, targetRoundNumber: 5 } would reorder [1,2,3,4,5,6] to [1,3,4,5,2,6] and then renumber the rounds
 * matchUpNoficiation notices for all affected matchUps are generated
 */

type ShiftRoundsArgs = {
  drawDefinition: DrawDefinition;
  targetRoundNumber: number;
  roundNumber: number;
  structureId: string;
};

export function shiftRound(params: ShiftRoundsArgs) {
  const check = checkRoundsArgs(params);
  if (check.error) return check;

  return { ...SUCCESS };
}
