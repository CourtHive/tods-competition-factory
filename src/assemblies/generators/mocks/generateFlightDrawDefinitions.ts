import { addDrawDefinition } from '../../../mutate/drawDefinitions/addDrawDefinition';
import { automatedPlayoffPositioning } from '../../../mutate/drawDefinitions/automatedPlayoffPositioning';
import { addPlayoffStructures } from '../../../mutate/drawDefinitions/addPlayoffStructures';
import { setParticipantScaleItem } from '../../../mutate/participants/addScaleItems';
import { generateDrawDefinition } from '../drawDefinitions/generateDrawDefinition';
import { getFlightProfile } from '../../../query/event/getFlightProfile';
import { addExtension } from '../../../mutate/extensions/addExtension';
import { isValidExtension } from '../../../validators/isValidExtension';
import { getParticipantId } from '../../../global/functions/extractors';
import { hasParticipantId } from '../../../global/functions/filters';
import { completeDrawMatchUps } from './completeDrawMatchUps';
import { generateRange } from '../../../utilities';

import { SUCCESS } from '../../../constants/resultConstants';
import { SEEDING } from '../../../constants/scaleConstants';
import {
  DRAW_DEFINITION_NOT_FOUND,
  ErrorType,
  STRUCTURE_NOT_FOUND,
} from '../../../constants/errorConditionConstants';
import {
  MAIN,
  ROUND_ROBIN_WITH_PLAYOFF,
} from '../../../constants/drawDefinitionConstants';

export function generateFlightDrawDefinitions({
  matchUpStatusProfile,
  completeAllMatchUps,
  randomWinningSide,
  tournamentRecord,
  drawProfiles,
  event,
}): {
  drawIds?: string[];
  success?: boolean;
  error?: ErrorType;
} {
  const flightProfile = getFlightProfile({ event }).flightProfile;
  const { eventName, eventType, category } = event;
  const { startDate } = tournamentRecord;
  const drawIds: string[] = [];

  const categoryName =
    category?.categoryName || category?.ageCategoryCode || category?.ratingType;
  const existingDrawIds = event.drawDefinitions?.map(({ drawId }) => drawId);

  if (Array.isArray(flightProfile?.flights)) {
    for (const [index, flight] of flightProfile.flights.entries()) {
      const { drawId, stage, drawName, drawEntries } = flight;
      drawIds.push(flight.drawId);

      const drawProfile = drawProfiles[index];
      const { seedsCount, generate = true } = drawProfile || {};

      if (generate) {
        const drawParticipantIds = drawEntries
          .filter(hasParticipantId)
          .map(getParticipantId);

        const seedingScaleName = categoryName || eventName;

        if (
          tournamentRecord &&
          seedsCount &&
          seedsCount <= drawParticipantIds.length
        ) {
          const scaleValues = generateRange(1, seedsCount + 1);
          scaleValues.forEach((scaleValue, index) => {
            const scaleItem = {
              scaleValue,
              scaleName: seedingScaleName,
              scaleType: SEEDING,
              eventType,
              scaleDate: startDate,
            };

            const participantId = drawParticipantIds[index];
            setParticipantScaleItem({
              tournamentRecord,
              participantId,
              scaleItem,
            });
          });
        }

        if (existingDrawIds?.includes(drawId)) break;

        let result = generateDrawDefinition({
          ...drawProfile,
          matchUpType: eventType,
          seedingScaleName,
          tournamentRecord,
          isMock: true,
          drawEntries,
          drawName,
          drawId,
          event,
          stage,
        });
        if (result.error) return { error: result.error, drawIds: [] };
        const { drawDefinition } = result;
        if (!drawDefinition) return { error: DRAW_DEFINITION_NOT_FOUND };

        const drawExtensions = drawProfiles[index]?.drawExtensions;
        if (Array.isArray(drawExtensions)) {
          drawExtensions
            .filter(isValidExtension)
            .forEach((extension) =>
              addExtension({ element: drawDefinition, extension })
            );
        }

        result = addDrawDefinition({
          suppressNotifications: true,
          tournamentRecord,
          drawDefinition,
          event,
        });
        if (result.error) return { error: result.error, drawIds: [] };

        if (drawProfile?.withPlayoffs) {
          const structureId = drawDefinition.structures?.[0].structureId;
          const result = addPlayoffStructures({
            idPrefix: drawProfile.idPrefix,
            ...drawProfile.withPlayoffs,
            tournamentRecord,
            drawDefinition,
            isMock: true,
            structureId,
            event,
          });
          if (result?.error) return result;
        }

        // TODO: enable { outcomes: [] } in eventProfile: { drawProfiles }

        const completionGoal = drawProfile?.completionGoal;
        const manual = drawProfile?.automated === false;

        if (!manual && (completeAllMatchUps || completionGoal)) {
          const matchUpFormat = drawProfile?.matchUpFormat;

          const result = completeDrawMatchUps({
            completeAllMatchUps: !completionGoal && completeAllMatchUps,
            matchUpStatusProfile,
            randomWinningSide,
            tournamentRecord,
            completionGoal,
            drawDefinition,
            matchUpFormat,
            event,
          });
          if (result.error) return { error: result.error, drawIds: [] };

          const completedCount = result.completedCount;

          if (drawProfile?.drawType === ROUND_ROBIN_WITH_PLAYOFF) {
            const mainStructure = drawDefinition.structures?.find(
              (structure) => structure.stage === MAIN
            );
            if (!mainStructure) return { error: STRUCTURE_NOT_FOUND };
            let result = automatedPlayoffPositioning({
              structureId: mainStructure.structureId,
              tournamentRecord,
              drawDefinition,
              event,
            });
            if (result.error) return { error: result.error, drawIds: [] };

            const playoffCompletionGoal = completionGoal
              ? completionGoal - (completedCount ?? 0)
              : undefined;
            result = completeDrawMatchUps({
              completeAllMatchUps: !completionGoal && completeAllMatchUps,
              completionGoal: completionGoal
                ? playoffCompletionGoal
                : undefined,
              matchUpStatusProfile,
              randomWinningSide,
              tournamentRecord,
              drawDefinition,
              matchUpFormat,
              event,
            });
            if (result.error) return { error: result.error, drawIds: [] };
          }
        }
      }
    }
  }

  return { ...SUCCESS, drawIds };
}
