import { Court, MatchUp, Participant, Side, Venue } from './tournamentTypes';

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

export type HydratedSide = Side & {
  individualParticipants?: HydratedParticipant[];
  participant?: HydratedParticipant;
};
