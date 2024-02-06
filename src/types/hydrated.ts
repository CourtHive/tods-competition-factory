import { Court, MatchUp, Participant, Side, Venue } from './tournamentTypes';

export type HydratedCourt = {
  [key: string]: any;
} & Court;

export type HydratedVenue = {
  [key: string]: any;
} & Venue;

/*
export type HydratedMatchUp = MatchUp & {
  [key: string | number]: any;
  sides?: HydratedSide[];
};
*/

export interface HydratedMatchUp extends MatchUp {
  [key: string | number]: any;
  sides?: HydratedSide[];
}

export type HydratedParticipant = {
  individualParticipants?: HydratedParticipant[];
  [key: string | number]: any;
} & Participant;

export type HydratedSide = Side & {
  participant?: HydratedParticipant;
  [key: string | number]: any;
};
