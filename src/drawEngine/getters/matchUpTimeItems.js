import { getMatchUpParticipantIds } from '../accessors/participantAccessor';

import { CHECK_IN, CHECK_OUT } from '../../constants/timeItemConstants';
import {
  INVALID_MATCHUP,
  MISSING_CONTEXT,
  MISSING_MATCHUP,
} from '../../constants/errorConditionConstants';

/*
  takes a matchUpWithContext
  returns all participaantIds which have current checkedIn status
    - if sideParticipant is participantType TEAM or PAIR then
      sideParticipant is considered checkedIn if all individualParticipants are checkedIn
    - if sideParticipant is participantType TEAM or PAIR and is checkedIn then
      all individualParticipants are considered checkedIn
*/
export function getCheckedInParticipantIds({ matchUp }) {
  if (!matchUp || !matchUp.hasContext) {
    return { error: MISSING_CONTEXT };
  }

  if (!matchUp) return { error: MISSING_MATCHUP };
  if (!matchUp.sides || matchUp.sides.filter((f) => f).length !== 2) {
    return { error: INVALID_MATCHUP };
  }

  const {
    sideParticipantIds,
    nestedIndividualParticipantIds,
  } = getMatchUpParticipantIds({ matchUp });

  const timeItems = matchUp.timeItems || [];
  const checkInItems = timeItems
    .filter((timeItem) => [CHECK_IN, CHECK_OUT].includes(timeItem?.itemType))
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const timeItemParticipantIds = checkInItems.map(
    (timeItem) => timeItem.itemValue
  );

  // first determine whether each timeItemParticipantId is checkedIn
  const checkedInParticipantIds = timeItemParticipantIds.filter(
    (participantId) => {
      const participantCheckedIn =
        checkInItems
          .filter((timeItem) => timeItem?.itemValue === participantId)
          .reverse()[0].itemType === CHECK_IN;
      return participantCheckedIn;
    }
  );

  // if all individuals on one side are checked in then side is checked in
  nestedIndividualParticipantIds.forEach(
    (sideIndividualParticipantIds, sideIndex) => {
      const sideParticipantId = sideParticipantIds[sideIndex];
      const allIndividualsCheckedIn =
        sideIndividualParticipantIds?.length &&
        sideIndividualParticipantIds.reduce((checkedIn, participantId) => {
          return (
            checkedIn &&
            participantId &&
            checkedInParticipantIds.includes(participantId)
          );
        }, true);
      if (
        sideParticipantId &&
        allIndividualsCheckedIn &&
        !checkedInParticipantIds.includes(sideParticipantId)
      ) {
        checkedInParticipantIds.push(sideParticipantId);
      }
    }
  );

  // if side is checked in then all individuals on that side are checked in
  sideParticipantIds.forEach((sideParticipantId, sideIndex) => {
    if (checkedInParticipantIds.includes(sideParticipantId)) {
      (nestedIndividualParticipantIds[sideIndex] || []).forEach(
        (participantId) => {
          if (
            participantId &&
            !checkedInParticipantIds.includes(participantId)
          ) {
            checkedInParticipantIds.push(participantId);
          }
        }
      );
    }
  });

  const allParticipantsCheckedIn = sideParticipantIds.reduce(
    (checkedIn, participantId) => {
      return checkedInParticipantIds.includes(participantId) && checkedIn;
    },
    true
  );

  return { allParticipantsCheckedIn, checkedInParticipantIds };
}
