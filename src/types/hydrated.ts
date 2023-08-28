import { Court, MatchUp, Participant, Venue } from './tournamentFromSchema';

export type HydratedCourt = {
  [key: string]: any;
} & Court;

export type HydratedVenue = {
  [key: string]: any;
} & Venue;

export type HydratedMatchUp = MatchUp & {
  [key: string | number]: any;
};

export type HydratedParticipant = {
  [key: string | number]: any;
} & Participant;
