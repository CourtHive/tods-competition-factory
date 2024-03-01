import { latestVisibleTimeItemValue } from '@Query/matchUp/latestVisibleTimeItemValue';

// constants and types
import { HOME_PARTICIPANT_ID } from '@Constants/timeItemConstants';
import { ScheduledMatchUpArgs } from '@Types/factoryTypes';

export function getHomeParticipantId({ visibilityThreshold, timeStamp, schedule, matchUp }: ScheduledMatchUpArgs) {
  const { itemValue: homeParticipantId, timeStamp: itemTimeStamp } = latestVisibleTimeItemValue({
    timeItems: matchUp?.timeItems || [],
    itemType: HOME_PARTICIPANT_ID,
    visibilityThreshold,
  });

  return !schedule || (itemTimeStamp && timeStamp && new Date(itemTimeStamp).getTime() > new Date(timeStamp).getTime())
    ? { homeParticipantId }
    : schedule;
}
