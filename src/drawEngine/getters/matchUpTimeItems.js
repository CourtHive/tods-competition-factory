import { findMatchUp } from "src/drawEngine/getters/getMatchUps";
import { getMatchUpParticipantIds } from 'src/drawEngine/accessors/participantAccessor';

import { CHECK_IN, CHECK_OUT } from 'src/constants/timeItemConstants';

/*
  takes either a matchUpWithContext or a matchUpId
  returns all participaantIds which have current checkedIn status
    - if sideParticipant is participantType TEAM or PAIR then
      sideParticipant is considered checkedIn if all individualParticipants are checkedIn
    - if sideParticipant is participantType TEAM or PAIR and is checkedIn then
      all individualParticipants are considered checkedIn
*/
export function getCheckedInParticipantIds({drawDefinition, tournamentParticipants, matchUp, matchUpId}) {
  if (!matchUp || !matchUp.hasContext) {
    ({ matchUp } = findMatchUp({drawDefinition, tournamentParticipants, matchUpId, inContext: true}));
  }

  if (!matchUp) return { error: 'Missing matchUp' };
  if (!matchUp.Sides || matchUp.Sides.filter(f=>f).length !== 2) {
    return { error: 'Invalid matchUp' };
  }

  const { sideParticipantIds, nestedIndividualParticipantIds } = getMatchUpParticipantIds({matchUp});
  
  const timeItems = matchUp.timeItems || [];
  const checkInItems = timeItems
    .filter(timeItem => [CHECK_IN, CHECK_OUT].includes(timeItem.itemSubject))
    .sort((a, b) => new Date(a.timeStamp) - new Date(b.timeStamp));
  const timeItemParticipantIds = checkInItems.map(timeItem => timeItem.itemValue);

  // first determine whether each timeItemParticipantId is checkedIn
  let checkedInParticipantIds = timeItemParticipantIds.filter(participantId => {
    const participantCheckedIn = checkInItems
      .filter(timeItem => timeItem.itemValue === participantId)
      .reverse()[0].itemSubject === CHECK_IN;
    return participantCheckedIn;
  })

  // if all individuals on one side are checked in then side is checked in
  nestedIndividualParticipantIds.forEach((sideIndividualParticipantIds, sideIndex) => {
    const sideParticipantId = sideParticipantIds[sideIndex];
    const allIndividualsCheckedIn = sideIndividualParticipantIds.reduce((checkedIn, participantId) => {
      return checkedIn && checkedInParticipantIds.includes(participantId);
    }, true);
    if (allIndividualsCheckedIn && !checkedInParticipantIds.includes(sideParticipantId)) {
      checkedInParticipantIds.push(sideParticipantId);
    }
  });

  // if side is checked in then all individuals on that side are checked in
  sideParticipantIds.forEach((sideParticipantId, sideIndex) => {
    if (checkedInParticipantIds.includes(sideParticipantId)) {
      (nestedIndividualParticipantIds[sideIndex] || []).forEach(participantId => {
        if (!checkedInParticipantIds.includes(participantId)) {
          checkedInParticipantIds.push(participantId);
        }
      })
    }
  });

  const allParticipantsCheckedIn = sideParticipantIds.reduce((checkedIn, participantId) => {
    return checkedInParticipantIds.includes(participantId) && checkedIn;
  }, true);

  return { allParticipantsCheckedIn, checkedInParticipantIds };
}
