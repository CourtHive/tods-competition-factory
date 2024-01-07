import { governors, asyncEngine, globalState } from 'tods-competition-factory';
import asyncGlobalState from './asyncGlobalState';

globalState.setStateProvider(asyncGlobalState);
const engineAsync = asyncEngine(true);

const methods = {
  ...governors.competitionGovernor,
  ...governors.participantGovernor,
  ...governors.generationGovernor,
  ...governors.publishingGovernor,
  ...governors.tournamentGovernor,
  ...governors.scheduleGovernor,
  ...governors.policyGovernor,
  ...governors.reportGovernor,
  ...governors.eventGovernor,
  ...governors.scoreGovernor,
  ...governors.venueGovernor
};

engineAsync.importMethods(methods);

export const mutationEngine = engineAsync;
export default engineAsync;
