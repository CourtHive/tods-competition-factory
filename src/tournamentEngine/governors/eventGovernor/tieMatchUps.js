import { getPairedParticipant } from '../participantGovernor/getPairedParticipant';
import { findMatchUp } from '../../../drawEngine/getters/getMatchUps/findMatchUp';
import { UUID } from '../../../utilities/UUID';

import { COMPETITOR } from '../../../constants/participantRoles';
import { SUCCESS } from '../../../constants/resultConstants';
import { PAIR } from '../../../constants/participantTypes';
import { DOUBLES } from '../../../constants/matchUpTypes';
import {
  EVENT_NOT_FOUND,
  MATCHUP_NOT_FOUND,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

export function assignTieMatchUpParticipantId(props) {
  let { individualParticipants } = props;
  const { tournamentRecord, drawDefinition, drawId, event } = props;
  const { participantId, sideNumber, sideMember, tieMatchUpId } = props;

  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!event) return { error: EVENT_NOT_FOUND };

  const { matchUp: tieMatchUp } = findMatchUp({
    drawDefinition,
    matchUpId: tieMatchUpId,
  });
  if (!tieMatchUp) return { error: MATCHUP_NOT_FOUND };

  const side = tieMatchUp.sides[sideNumber - 1];
  if (tieMatchUp.matchUpType === DOUBLES) {
    if (participantId) {
      const result = addParticipantIdToPair({ side, sideMember });
      if (result.success) updateDrawDefinition();
    } else {
      const result = removeParticipantIdFromPair({ side, sideMember });
      if (result.success) updateDrawDefinition();
    }
  } else {
    side.participantId = participantId;
    updateDrawDefinition();
  }

  return SUCCESS;

  function addParticipantIdToPair({ side, sideMember }) {
    if (!side.participant)
      side.participant = {
        individualParticipants: [], // TODO: remove expanded participants
        individualParticipantIds: [],
      };
    individualParticipants =
      individualParticipants || side.participant.individualParticipants;
    individualParticipants[sideMember - 1] = { participantId };

    const sideParticipantsCount = individualParticipants.filter(
      (p) => p && p.participantId
    ).length;

    if (sideParticipantsCount === 2) {
      const participantIds = individualParticipants.map(
        ({ participantId }) => participantId
      );
      const { participant } = getPairedParticipant({
        tournamentRecord,
        participantIds,
      });
      const sideParticipantId = participant?.participantId;

      if (sideParticipantId) {
        side.participantId = sideParticipantId;
      } else {
        side.participantId = UUID();
        const newPairParticipant = {
          participantId: side.participantId,
          participantType: PAIR,
          participantRole: COMPETITOR,
          participantName: side.participant.individualParticipants
            .map(personFamilyName)
            .join('/'),
          individualParticipants,
        };
        tournamentRecord.participants.push(newPairParticipant);
      }
      delete side.participant;
    } else {
      side.participant.individualParticipants[sideMember - 1] = {
        participantId,
      };
    }

    return SUCCESS;
  }

  function personFamilyName(participant) {
    const { participantId } = participant;
    const participantData = tournamentRecord.participants.reduce(
      (data, candidate) => {
        return candidate.participantId === participantId ? candidate : data;
      },
      undefined
    );
    const person = participantData && participantData.person;
    return person && person.standardFamilyName;
  }

  function removeParticipantIdFromPair({ side, sideMember }) {
    side.participantId = undefined;
    if (!side.participant) side.participant = { individualParticipants: [] };
    side.participant.individualParticipants = individualParticipants.map(
      (participant, index) => {
        return index + 1 === sideMember ? undefined : participant;
      }
    );

    return SUCCESS;
  }

  function updateDrawDefinition() {
    event.drawDefinitions = event.drawDefinitions.map((candidate) => {
      return candidate.drawId === drawId ? drawDefinition : candidate;
    });
  }
}
