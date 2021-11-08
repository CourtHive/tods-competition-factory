import { addDrawDefinition } from '../../tournamentEngine/governors/eventGovernor/drawDefinitions/addDrawDefinition';
import { automatedPlayoffPositioning } from '../../tournamentEngine/governors/eventGovernor/automatedPositioning';
import { setParticipantScaleItem } from '../../tournamentEngine/governors/participantGovernor/addScaleItems';
import { addPlayoffStructures } from '../../tournamentEngine/governors/eventGovernor/addPlayoffStructures';
import { addExtension } from '../../tournamentEngine/governors/tournamentGovernor/addRemoveExtensions';
import { generateDrawDefinition } from '../../tournamentEngine/generators/generateDrawDefinition';
import { getFlightProfile } from '../../tournamentEngine/getters/getFlightProfile';
import { isValidExtension } from '../../global/validation/isValidExtension';
import { getParticipantId } from '../../global/functions/extractors';
import { hasParticipantId } from '../../global/functions/filters';
import { completeDrawMatchUps } from './completeDrawMatchUps';
import { generateRange } from '../../utilities';

import { SUCCESS } from '../../constants/resultConstants';
import { SEEDING } from '../../constants/scaleConstants';
import {
  MAIN,
  ROUND_ROBIN_WITH_PLAYOFF,
} from '../../constants/drawDefinitionConstants';
import { DRAW_ID_EXISTS } from '../../constants/errorConditionConstants';

export function generateFlightDrawDefinitions({
  matchUpStatusProfile,
  completeAllMatchUps,
  randomWinningSide,
  tournamentRecord,
  drawProfiles,
  event,
}) {
  const { flightProfile } = getFlightProfile({ event });
  const { eventName, eventType, category } = event;
  const { startDate } = tournamentRecord;
  const drawIds = [];

  const categoryName =
    category?.categoryName || category?.ageCategoryCode || category?.ratingType;

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
            let scaleItem = {
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

        const { drawDefinition, error } = result;
        if (error) {
          return { error };
        }

        const drawExtensions = drawProfiles[index]?.drawExtensions;
        if (Array.isArray(drawExtensions)) {
          drawExtensions
            .filter(isValidExtension)
            .forEach((extension) =>
              addExtension({ element: drawDefinition, extension })
            );
        }

        result = addDrawDefinition({
          drawDefinition,
          event,
        });
        // since this is mock generation, don't throw error for duplicate drawId
        if (result.error === DRAW_ID_EXISTS) break;
        if (result.error) return result;

        if (drawProfile?.withPlayoffs) {
          const structureId = drawDefinition.structures[0].structureId;
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

        const manual = drawProfile?.automated === false;
        if (!manual && completeAllMatchUps) {
          const matchUpFormat = drawProfile?.matchUpFormat;
          const result = completeDrawMatchUps({
            matchUpStatusProfile,
            completeAllMatchUps,
            randomWinningSide,
            drawDefinition,
            matchUpFormat,
          });
          if (result.error) return result;
          if (drawProfile?.drawType === ROUND_ROBIN_WITH_PLAYOFF) {
            const mainStructure = drawDefinition.structures.find(
              (structure) => structure.stage === MAIN
            );
            let result = automatedPlayoffPositioning({
              structureId: mainStructure.structureId,
              tournamentRecord,
              drawDefinition,
              event,
            });
            if (result.error) return result;

            result = completeDrawMatchUps({
              completeAllMatchUps,
              matchUpStatusProfile,
              randomWinningSide,
              matchUpFormat,
              drawDefinition,
            });
            if (result.error) return result;
          }
        }
      }
    }
  }

  return { ...SUCCESS, drawIds };
}
