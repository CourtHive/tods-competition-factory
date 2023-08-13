import { unique } from '../../utilities';

import { INDIVIDUAL } from '../../constants/participantConstants';
import {
  MISSING_CONTEXT,
  MISSING_MATCHUP,
  INVALID_MATCHUP,
} from '../../constants/errorConditionConstants';

// Does NOT include potential participandIds
export function getMatchUpParticipantIds({ matchUp }) {
  let nestedIndividualParticipantIds = [];
  let allRelevantParticipantIds = [];
  let individualParticipantIds = [];
  let sideParticipantIds = [];
  let error;

  if (!matchUp) error = MISSING_MATCHUP;
  if (matchUp && !matchUp.sides) error = INVALID_MATCHUP;
  if (matchUp && !matchUp.hasContext) error = MISSING_CONTEXT;

  if (!error) {
    sideParticipantIds = matchUp.sides.map((side) => side.participantId);

    const sideIndividualParticipantIds = matchUp.sides
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

    individualParticipantIds = []
      .concat(
        ...sideIndividualParticipantIds,
        ...nestedIndividualParticipantIds.flat()
      )
      .filter(Boolean);

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
