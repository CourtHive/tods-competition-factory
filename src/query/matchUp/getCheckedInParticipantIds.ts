import { getMatchUpParticipantIds } from './getMatchUpParticipantIds';

// constants and types
import { INVALID_MATCHUP, MISSING_CONTEXT, MISSING_MATCHUP } from '@Constants/errorConditionConstants';
import { CHECK_IN, CHECK_OUT } from '@Constants/timeItemConstants';
import { SUCCESS } from '@Constants/resultConstants';
import { ResultType } from '../../types/factoryTypes';
import { HydratedMatchUp } from '../../types/hydrated';
import { TimeItem } from '../../types/tournamentTypes';

/*
  takes a matchUpWithContext
  returns all participaantIds which have current checkedIn status
    - if sideParticipant is participantType TEAM or PAIR then
      sideParticipant is considered checkedIn if all individualParticipants are checkedIn
    - if sideParticipant is participantType TEAM or PAIR and is checkedIn then
      all individualParticipants are considered checkedIn
*/
export function getCheckedInParticipantIds({ matchUp }: { matchUp: HydratedMatchUp }): ResultType & {
  allRelevantParticipantIds?: string[];
  allParticipantsCheckedIn?: boolean;
  checkedInParticipantIds?: string[];
} {
  if (!matchUp) return { error: MISSING_MATCHUP };
  if (!matchUp.hasContext) {
    return { error: MISSING_CONTEXT };
  }

  if (!matchUp.sides || matchUp.sides.filter(Boolean).length !== 2) {
    return { error: INVALID_MATCHUP };
  }

  const { nestedIndividualParticipantIds, allRelevantParticipantIds, sideParticipantIds } = getMatchUpParticipantIds({
    matchUp,
  });

  const timeItems = matchUp.timeItems ?? [];
  const checkInItems: TimeItem[] = timeItems
    .filter((timeItem) => timeItem?.itemType && [CHECK_IN, CHECK_OUT].includes(timeItem.itemType))
    .sort(
      (a, b) =>
        (a.createdAt ? new Date(a.createdAt).getTime() : 0) - (b.createdAt ? new Date(b.createdAt).getTime() : 0),
    );
  const timeItemParticipantIds = checkInItems.map((timeItem) => timeItem.itemValue);

  // first determine whether each timeItemParticipantId is checkedIn
  const checkedInParticipantIds = timeItemParticipantIds.filter((participantId) => {
    return checkInItems.filter((timeItem) => timeItem?.itemValue === participantId).reverse()[0].itemType === CHECK_IN;
  });

  // if all individuals on one side are checked in then side is checked in
  nestedIndividualParticipantIds?.forEach((sideIndividualParticipantIds, sideIndex) => {
    const sideParticipantId = sideParticipantIds?.[sideIndex];
    const allIndividualsCheckedIn =
      sideIndividualParticipantIds?.length &&
      sideIndividualParticipantIds.every((participantId) => checkedInParticipantIds.includes(participantId));

    if (sideParticipantId && allIndividualsCheckedIn && !checkedInParticipantIds.includes(sideParticipantId)) {
      checkedInParticipantIds.push(sideParticipantId);
    }
  });

  // if side is checked in then all individuals on that side are checked in
  sideParticipantIds?.forEach((sideParticipantId: string, sideIndex) => {
    if (checkedInParticipantIds.includes(sideParticipantId)) {
      (nestedIndividualParticipantIds?.[sideIndex] ?? []).forEach((participantId) => {
        if (participantId && !checkedInParticipantIds.includes(participantId)) {
          checkedInParticipantIds.push(participantId);
        }
      });
    }
  });

  const allParticipantsCheckedIn = sideParticipantIds?.reduce((checkedIn, participantId) => {
    return checkedInParticipantIds.includes(participantId) && checkedIn;
  }, true);

  return {
    allRelevantParticipantIds,
    allParticipantsCheckedIn,
    checkedInParticipantIds,
    ...SUCCESS,
  };
}
