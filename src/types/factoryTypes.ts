import { Entry, Tournament, TypeEnum } from './tournamentFromSchema';

export type FactoryEngine = {
  [key: string]: any;
};

export type TournamentRecordsArgs = {
  tournamentRecords: { [key: string]: Tournament } | Tournament[];
};

export type ScheduleTimesResult = { scheduleTime: string };

export type SeedingProfile = {
  groupSeedingThreshold?: number;
  positioning?: string;
};

export type ScaleAttributes = {
  eventType: TypeEnum;
  scaleType: string;
  scaleName: string;
  accessor?: string; // optional - string determining how to access attribute if scaleValue is an object
};

export type ScaleItem = {
  eventType: TypeEnum;
  scaleDate: string;
  scaleName: string;
  scaleType: string;
  scaleValue: any;
};

export type Flight = {
  manuallyAdded?: boolean;
  drawEntries: Entry[]; // entries allocated to target draw
  flightNumber: number;
  drawName: string; // custom name for generated draw
  drawId: string; // unique identifier for generating drawDefinitions
};

export type FlightProfile = {
  scaleAttributes?: ScaleAttributes;
  splitMethod?: string;
  flights: Flight[];
};

export type PolicyDefinitions = {
  [key: string]: any;
};

export type QueueMethod = {
  params: { [key: string]: any };
  method: string;
};
