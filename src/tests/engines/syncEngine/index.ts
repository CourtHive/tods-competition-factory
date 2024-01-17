import * as governors from '../../../assemblies/governors';
import syncEngine from '../../../assemblies/engines/sync';

syncEngine.importMethods(governors, true, 1);

export const competitionEngine = syncEngine;
export const tournamentEngine = syncEngine;
export default syncEngine;
