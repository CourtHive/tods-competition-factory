import { WTN } from '../../../constants/ratingConstants';

export function getDetailsWTN({ participant, eventType }) {
  const personId = participant?.person?.personId;
  const personWTN = participant?.ratings?.[eventType]?.find(
    ({ scaleName }) => scaleName === WTN
  )?.scaleValue;
  const { wtnRating, confidence } = personWTN || {};
  return { personId, wtnRating, confidence };
}
