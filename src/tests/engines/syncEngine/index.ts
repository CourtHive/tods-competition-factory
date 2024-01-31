import * as governors from '@Assemblies/governors';
import syncEngine from '@Assemblies/engines/sync';

syncEngine.importMethods(governors, true, 1);

export const competitionEngine = syncEngine;
export const tournamentEngine = syncEngine;
export default syncEngine;
