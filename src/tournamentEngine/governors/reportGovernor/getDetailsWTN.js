import { WTN } from '../../../constants/ratingConstants';

export function getDetailsWTN({ participant, eventType }) {
  const personId = participant?.person?.personId;
  const personOtherId = participant?.person?.personOtherIds?.[0];
  const tennisId = participant?.person?.tennisId;
  const personWTN = participant?.ratings?.[eventType]?.find(
    ({ scaleName }) => scaleName === WTN
  )?.scaleValue;
  const { wtnRating, confidence } = personWTN || {};
  return { personId, personOtherId, tennisId, wtnRating, confidence };
}
