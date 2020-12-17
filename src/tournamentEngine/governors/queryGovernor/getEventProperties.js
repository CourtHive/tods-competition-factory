import {
  MISSING_EVENT,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';
import { RANKING, RATING, SEEDING } from '../../../constants/timeItemConstants';
import { participantScaleItem } from '../../accessors/participantScaleItem';

export function getEventProperties({ tournamentRecord, event }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!event) return { error: MISSING_EVENT };

  const eventEntries = event.entries || [];
  const tournamentParticipants = tournamentRecord.participants || [];

  const scaleName =
    event.category?.categoryName || event.category?.ageCategoryCode;
  const { eventType } = event;

  const enteredParticipantIds = eventEntries.map(
    (entry) => entry.participantId
  );
  const enteredParticipants = tournamentParticipants.filter((participant) =>
    enteredParticipantIds.includes(participant.participantId)
  );

  let hasSeededParticipants, hasRankedParticipants, hasRatedParticipants;
  const entryScaleAttributes = enteredParticipants.map((participant) => {
    const { participantId, participantName, name } = participant;

    let scaleAttributes = { scaleType: SEEDING, eventType, scaleName };
    const seed = participantScaleItem({ participant, scaleAttributes })
      ?.scaleItem?.scaleValue;
    scaleAttributes = { scaleType: RANKING, eventType, scaleName };
    const ranking = participantScaleItem({ participant, scaleAttributes })
      ?.scaleItem?.scaleValue;
    scaleAttributes = { scaleType: RATING, eventType, scaleName };
    const rating = participantScaleItem({ participant, scaleAttributes })
      ?.scaleItem?.scaleValue;

    hasSeededParticipants = !!(hasSeededParticipants || seed);
    hasRankedParticipants = !!(hasRankedParticipants || ranking);
    hasRatedParticipants = !!(hasRatedParticipants || rating);
    return {
      participantId,
      participantName: participantName || name, // support legacy
      seed,
      ranking,
      rating,
    };
  });

  return {
    entryScaleAttributes,
    hasSeededParticipants,
    hasRankedParticipants,
    hasRatedParticipants,
  };
}
