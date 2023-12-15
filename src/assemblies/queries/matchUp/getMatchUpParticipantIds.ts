import { unique } from '../../../utilities';

import { HydratedMatchUp, HydratedSide } from '../../../types/hydrated';
import { ResultType } from '../../../global/functions/decorateResult';
import { INDIVIDUAL } from '../../../constants/participantConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_CONTEXT,
  MISSING_MATCHUP,
  INVALID_MATCHUP,
} from '../../../constants/errorConditionConstants';

// Does NOT include potential participandIds

type GetMatchUpParticipantIdsArgs = {
  matchUp: HydratedMatchUp;
};
export function getMatchUpParticipantIds({
  matchUp,
}: GetMatchUpParticipantIdsArgs): ResultType & {
  nestedIndividualParticipantIds?: string[][];
  allRelevantParticipantIds?: string[];
  individualParticipantIds?: string[];
  sideParticipantIds?: string[];
} {
  if (!matchUp) return { error: MISSING_MATCHUP };
  if (matchUp && !matchUp.sides) return { error: INVALID_MATCHUP };
  if (matchUp && !matchUp.hasContext) return { error: MISSING_CONTEXT };

  const sideParticipantIds: string[] = (matchUp.sides ?? [])
    ?.map((side) => side?.participantId)
    .filter(Boolean) as string[];

  const sideIndividualParticipantIds =
    matchUp.sides
      ?.filter((side) => side.participant?.participantType === INDIVIDUAL)
      .map((participant) => participant.participantId)
      .filter(Boolean) ?? [];

  const nestedIndividualParticipants =
    ((matchUp.sides as HydratedSide[]) ?? [])
      ?.map((side) => side.participant?.individualParticipants)
      .filter(Boolean) ?? [];

  const nestedIndividualParticipantIds = nestedIndividualParticipants.map(
    (participants) =>
      (participants ?? [])
        .map((participant) => participant?.participantId)
        .filter(Boolean)
  );

  const individualParticipantIds =
    ([
      ...sideIndividualParticipantIds,
      ...nestedIndividualParticipantIds.flat(),
    ].filter(Boolean) as string[]) ?? [];

  const allRelevantParticipantIds: string[] =
    unique(individualParticipantIds.concat(sideParticipantIds)).filter(
      Boolean
    ) ?? [];

  return {
    nestedIndividualParticipantIds,
    allRelevantParticipantIds,
    individualParticipantIds,
    sideParticipantIds,
    ...SUCCESS,
  };
}
