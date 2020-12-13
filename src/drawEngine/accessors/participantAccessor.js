import {
  MISSING_CONTEXT,
  MISSING_MATCHUP,
  INVALID_MATCHUP,
} from '../../constants/errorConditionConstants';
import { INDIVIDUAL } from '../../constants/participantTypes';

export function getMatchUpParticipantIds({ matchUp }) {
  let error;
  let sideParticipantIds = [];
  let individualParticipantIds = [];
  let nestedIndividualParticipantIds = [];

  if (!matchUp) error = MISSING_MATCHUP;
  if (matchUp && !matchUp.sides) error = INVALID_MATCHUP;
  if (matchUp && !matchUp.hasContext) error = MISSING_CONTEXT;

  if (!error) {
    sideParticipantIds = matchUp.sides.map((side) => side.participantId);

    const sideIndividualParticipantIds = matchUp.sides
      .filter((side) => side.participantType === INDIVIDUAL)
      .map((participant) => participant.participantId);

    const nestedIndividualParticipants = matchUp.sides
      .map(
        (side) => side.participant && side.participant.individualParticipants
      )
      .filter((f) => f);

    nestedIndividualParticipantIds = nestedIndividualParticipants.map(
      (participants) =>
        participants
          .filter((f) => f)
          .map((participant) => participant.participantId)
    );

    individualParticipantIds = [].concat(
      ...sideIndividualParticipantIds,
      ...nestedIndividualParticipantIds.flat()
    );
  }

  return {
    error,
    sideParticipantIds,
    nestedIndividualParticipantIds,
    individualParticipantIds,
  };
}
