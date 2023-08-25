import { Tournament } from './tournamentFromSchema';

export type FactoryEngine = {
  [key: string]: any;
};

export type TournamentRecordsArgs = {
  tournamentRecords: { [key: string]: Tournament } | Tournament[];
};
