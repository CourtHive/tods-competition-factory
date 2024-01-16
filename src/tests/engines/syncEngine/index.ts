import { governors } from '../../../assemblies/governors';
import syncEngine from '../../../assemblies/engines/sync';

const methods = {
  ...governors.competitionGovernor,
  ...governors.participantGovernor,
  ...governors.generationGovernor,
  ...governors.publishingGovernor,
  ...governors.tournamentGovernor,
  ...governors.tieFormatGovernor,
  ...governors.scheduleGovernor,
  ...governors.entriesGovernor,
  ...governors.matchUpGovernor,
  ...governors.policyGovernor,
  ...governors.reportGovernor,
  ...governors.eventGovernor,
  ...governors.drawsGovernor,
  ...governors.queryGovernor,
  ...governors.scoreGovernor,
  ...governors.venueGovernor,
};

syncEngine.importMethods(methods);

export const competitionEngine = syncEngine;
export const tournamentEngine = syncEngine;
export default syncEngine;
