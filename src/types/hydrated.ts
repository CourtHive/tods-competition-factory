import { Court, MatchUp, Venue } from './tournamentFromSchema';

export type HydratedCourt = {
  [key: string]: any;
} & Court;

export type HydratedVenue = {
  [key: string]: any;
} & Venue;

export type HydratedMatchUp = {
  [key: string | number | symbol]: any;
} & MatchUp;
