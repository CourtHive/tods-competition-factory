import { addParticipantScaleItem } from './addScaleItems';
import { participantScaleItem } from '../../accessors/participantScaleItem';

import { RANKING, RATING } from '../../../constants/scaleConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { addNotice, getTopics } from '../../../global/globalState';
import { MODIFY_PARTICIPANTS } from '../../../constants/topicConstants';

// TODO: should be refactored to take scaleAttributes instead of { category, eventType }
export function rankByRatings({
  tournamentRecord,
  participantIds,
  category,
  eventType,
}) {
  const relevantParticipants = (tournamentRecord.participants || []).filter(
    (p) => participantIds.includes(p.participantId)
  );

  const participantRating = (participant) => {
    const scaleAttributes = {
      scaleType: RATING,
      scaleName: category,
      eventType: eventType,
    };

    const { scaleItem } = participantScaleItem({
      participant,
      scaleAttributes,
    });
    return scaleItem && scaleItem.scaleValue;
  };

  const ratingSort = (a, b) => (b.rating || 0) - (a.rating || 0);

  const sortedParticipantIds = relevantParticipants
    .map((p) => ({
      participantId: p.participantId,
      rating: participantRating(p),
    }))
    .filter((p) => p.rating)
    .sort(ratingSort)
    .map((p, i) => ({ [p.participantId]: i + 1 }));

  const idMap = Object.assign({}, ...sortedParticipantIds);

  let modifiedParticipants = [];
  relevantParticipants.forEach((participant) => {
    const ranking = idMap[participant.participantId];
    const scaleItem = {
      scaleValue: ranking,
      scaleName: category,
      scaleType: RANKING,
      eventType: eventType,
    };

    const result = addParticipantScaleItem({ participant, scaleItem });
    if (result && result.success) {
      modifiedParticipants.push(participant);
    }
  });

  const { topics } = getTopics();
  if (modifiedParticipants.length && topics.includes(MODIFY_PARTICIPANTS)) {
    addNotice({
      topic: MODIFY_PARTICIPANTS,
      payload: { participants: modifiedParticipants },
    });
  }

  if (modifiedParticipants.length) return SUCCESS;
}
