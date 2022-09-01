export interface TournamentEngine {
  getState: any;
  newTournamentRecord: any;
  setTournamentId: any;
  version: any;
  reset: any;
  setState: any;
  devContext: any;
  getDevContext: any;
  executionQueue: any;
  getTournamentParticipants?: any;
  getPositionAssignments?: any;
  setDelegatedOutcome?: any;
  addDrawDefinition?: any;
  addEventEntries?: any;
  addParticipants?: any;
  addEvent?: any;
  addMatchUpScheduledTime?: any;
  addMatchUpScheduledDate?: any;
  deleteParticipants?: any;
  deleteEvents?: any;
  generateDrawDefinition?: any;
  allTournamentMatchUps?: any;
  tournamentMatchUps?: any;
}

export interface CompetitionEngine {
  getState: any;
  newTournamentRecord: any;
  removeTournamentRecord: any;
  removeUnlinkedTournamentRecords: any;
  version: any;
  reset: any;
  setState: any;
  devContext: any;
  getDevContext: any;
  executionQueue: any;
  allCompetitionMatchUps?: any;
}

export interface DrawEngine {
  getState: any;
  version: any;
  reset: any;
  newDrawDefinition: any;
  setDrawDescription: any;
  devContext: any;
  setParticipants: any;
  setState: any;
}

export interface MocksEngine {
  version: any;
  setDeepCopy: any;
  devContext: any;
  modifyTournamentRecord?: any;
  generateTournamentRecord?: any;
}
