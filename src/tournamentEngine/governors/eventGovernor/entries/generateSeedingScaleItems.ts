import { MISSING_VALUE } from '../../../../constants/errorConditionConstants';
import { SEEDING } from '../../../../constants/scaleConstants';

export function generateSeedingScaleItems({
  scaleAttributes,
  scaledEntries,
  stageEntries,
  seedsCount,
  scaleName,
}) {
  if (!scaleAttributes)
    return { error: MISSING_VALUE, info: 'missing scaleAttributes' };

  const seededEntries = Object.assign(
    {},
    ...(scaledEntries || [])
      .slice(0, seedsCount)
      .map(({ participantId }, index) => ({ [participantId]: index + 1 }))
  );

  scaleName = scaleName || scaleAttributes.scaleName;
  const scaleDate = new Date().toISOString();

  const scaleItemsWithParticipantIds = stageEntries.map(({ participantId }) => {
    const scaleItem = {
      scaleValue: seededEntries[participantId],
      eventType: scaleAttributes.eventType,
      scaleType: SEEDING,
      scaleName,
      scaleDate,
    };
    return {
      participantId,
      scaleItems: [scaleItem],
    };
  });

  return { scaleItemsWithParticipantIds };
}
