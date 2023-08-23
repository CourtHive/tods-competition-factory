import { unique } from '../../utilities';

import { INDIVIDUAL } from '../../constants/participantConstants';
import {
  MISSING_CONTEXT,
  MISSING_MATCHUP,
  INVALID_MATCHUP,
} from '../../constants/errorConditionConstants';

// Does NOT include potential participandIds
export function getMatchUpParticipantIds({ matchUp }) {
  let nestedIndividualParticipantIds: string[][] = [];
  let allRelevantParticipantIds: string[] = [];
  let individualParticipantIds: string[] = [];
  let sideParticipantIds: string[] = [];
  let error;

  if (!matchUp) error = MISSING_MATCHUP;
  if (matchUp && !matchUp.sides) error = INVALID_MATCHUP;
  if (matchUp && !matchUp.hasContext) error = MISSING_CONTEXT;

  if (!error) {
    sideParticipantIds = matchUp.sides.map((side) => side.participantId);

    const sideIndividualParticipantIds: string[] = matchUp.sides
      .filter((side) => side.participantType === INDIVIDUAL)
      .map((participant) => participant.participantId)
      .filter(Boolean);

    const nestedIndividualParticipants = matchUp.sides
      .map((side) => side.participant?.individualParticipants)
      .filter(Boolean);

    nestedIndividualParticipantIds = nestedIndividualParticipants.map(
      (participants) =>
        participants
          .map((participant) => participant?.participantId)
          .filter(Boolean)
    );

    individualParticipantIds = [
      ...sideIndividualParticipantIds,
      ...nestedIndividualParticipantIds.flat(),
    ].filter(Boolean);

    allRelevantParticipantIds = unique(
      individualParticipantIds.concat(sideParticipantIds)
    ).filter(Boolean);
  }

  return {
    nestedIndividualParticipantIds,
    allRelevantParticipantIds,
    individualParticipantIds,
    sideParticipantIds,
    error,
  };
}
