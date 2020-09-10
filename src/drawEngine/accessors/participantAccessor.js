import { INDIVIDUAL } from '../../constants/participantTypes';

export function getMatchUpParticipantIds({ matchUp }) {
  let error;
  let sideParticipantIds = [];
  let individualParticipantIds = [];
  let nestedIndividualParticipantIds = [];

  if (!matchUp) error = 'Missing matchUp';
  if (matchUp && !matchUp.Sides) error = 'Invalid matchUp';
  if (matchUp && !matchUp.hasContext) error = 'Missing context';

  if (!error) {
    sideParticipantIds = matchUp.Sides.map(side => side.participantId);

    const sideIndividualParticipantIds = matchUp.Sides.filter(
      side => side.participantType === INDIVIDUAL
    ).map(participant => participant.participantId);

    const nestedIndividualParticipants = matchUp.Sides.map(
      side => side.participant && side.participant.individualParticipants
    ).filter(f => f);

    nestedIndividualParticipantIds = nestedIndividualParticipants.map(
      participants =>
        participants
          .filter(f => f)
          .map(participant => participant.participantId)
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
