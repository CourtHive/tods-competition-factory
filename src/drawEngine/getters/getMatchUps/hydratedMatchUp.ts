import { MatchUp } from '../../../types/tournamentFromSchema';

export type HydratedMatchUp = {
  [key: string | number | symbol]: any;
} & MatchUp;
