import { addDrawDefinition } from '../../tournamentEngine/governors/eventGovernor/drawDefinitions/addDrawDefinition';
import { automatedPlayoffPositioning } from '../../tournamentEngine/governors/eventGovernor/automatedPositioning';
import { addEventEntries } from '../../tournamentEngine/governors/eventGovernor/entries/addEventEntries';
import { attachEventPolicies } from '../../tournamentEngine/governors/policyGovernor/policyManagement';
import { addParticipants } from '../../tournamentEngine/governors/participantGovernor/addParticipants';
import { generateDrawDefinition } from '../../tournamentEngine/generators/generateDrawDefinition';
import { addFlight } from '../../tournamentEngine/governors/eventGovernor/addFlight';
import { getFlightProfile } from '../../tournamentEngine/getters/getFlightProfile';
import { addEvent } from '../../tournamentEngine/governors/eventGovernor/addEvent';
import { generateParticipants } from './generateParticipants';
import { completeDrawMatchUps } from './completeDrawMatchUps';
import { UUID } from '../../utilities';

import { DIRECT_ACCEPTANCE } from '../../constants/entryStatusConstants';
import { INDIVIDUAL, PAIR } from '../../constants/participantTypes';
import { SINGLES, DOUBLES } from '../../constants/eventConstants';
import {
  MAIN,
  QUALIFYING,
  ROUND_ROBIN_WITH_PLAYOFF,
  SINGLE_ELIMINATION,
} from '../../constants/drawDefinitionConstants';

export function generateEventWithFlights({
  tournamentRecord,
  autoEntryPositions,
  participantsProfile,
  completeAllMatchUps,
  matchUpStatusProfile,
  randomWinningSide,
  eventProfile,
}) {
  const {
    ballType,
    category,
    discipline,
    drawProfiles = [],
    eventName = 'Generated Event',
    eventLevel,
    eventType = SINGLES,
    gender,
    surfaceCategory,
    tieFormat: eventTieFormat,
    policyDefinitions,
  } = eventProfile;

  let targetParticipants = tournamentRecord.participants;
  let uniqueDrawParticipants = [];

  let uniqueParticipantsCount = {};
  const stageParticipantsCount = drawProfiles.reduce(
    (stageParticipantsCount, drawProfile) => {
      const stage = drawProfile.stage || MAIN;
      if (!Object.keys(stageParticipantsCount).includes(stage))
        stageParticipantsCount[stage] = 0;

      const participantsCount =
        drawProfile.participantsCount ||
        (drawProfile.drawSize || 0) - (drawProfile.qualifyingPositions || 0);
      if (drawProfile.uniqueParticipants) {
        if (!Object.keys(uniqueParticipantsCount).includes(stage))
          uniqueParticipantsCount[stage] = 0;
        uniqueParticipantsCount[stage] += participantsCount;
      } else {
        stageParticipantsCount[stage] = Math.max(
          participantsCount,
          stageParticipantsCount[stage]
        );
      }
      return stageParticipantsCount;
    },
    {}
  );

  const uniqueParticipantStages = Object.keys(uniqueParticipantsCount);
  uniqueParticipantStages.forEach(
    (stage) => (stageParticipantsCount[stage] += uniqueParticipantsCount[stage])
  );

  const eventParticipantType =
    eventType === SINGLES
      ? INDIVIDUAL
      : eventType === DOUBLES
      ? PAIR
      : eventType;

  if (uniqueParticipantStages) {
    const {
      valuesInstanceLimit,
      nationalityCodesCount,
      nationalityCodeType,
      nationalityCodes,
      addressProps,
      personIds,
      inContext,
    } = participantsProfile || {};
    const mainParticipantsCount = uniqueParticipantsCount[MAIN] || 0;
    const qualifyingParticipantsCount =
      uniqueParticipantsCount[QUALIFYING] || 0;

    const { participants: uniqueParticipants } = generateParticipants({
      participantsCount: mainParticipantsCount + qualifyingParticipantsCount,
      participantType: eventParticipantType,
      sex: gender,

      valuesInstanceLimit,
      nationalityCodesCount,
      nationalityCodeType,
      nationalityCodes,
      addressProps,
      personIds,

      inContext,
    });

    let result = addParticipants({
      tournamentRecord,
      participants: uniqueParticipants,
    });
    if (result.error) return result;

    uniqueDrawParticipants = uniqueParticipants.filter(
      ({ participantType }) => participantType === eventParticipantType
    );
  }

  const mainParticipantsCount = stageParticipantsCount[MAIN] || 0;
  const qualifyingParticipantsCount = stageParticipantsCount[QUALIFYING] || 0;

  // this is only used for non-unique participants
  const stageParticipants = {
    QUALIFYING: targetParticipants
      .filter(({ participantType }) => participantType === eventParticipantType)
      .slice(0, qualifyingParticipantsCount),
    MAIN: targetParticipants
      .filter(({ participantType }) => participantType === eventParticipantType)
      .slice(
        qualifyingParticipantsCount,
        qualifyingParticipantsCount + mainParticipantsCount
      ),
  };

  const eventId = UUID();
  const newEvent = {
    ballType,
    category,
    discipline,
    eventId,
    eventName,
    eventLevel,
    eventType,
    gender,
    surfaceCategory,
    tieFormat: eventTieFormat,
  };
  if (typeof policyDefinitions === 'object') {
    for (const policyType of Object.keys(policyDefinitions)) {
      attachEventPolicies({
        event: newEvent,
        policyDefinitions: { [policyType]: policyDefinitions[policyType] },
      });
    }
  }
  let result = addEvent({ tournamentRecord, event: newEvent });
  if (result.error) return result;
  const { event } = result;

  let uniqueParticipantsIndex = 0;
  for (const drawProfile of drawProfiles) {
    const {
      stage,
      drawName,
      drawType = SINGLE_ELIMINATION,
      drawSize,
      qualifyingPositions,
    } = drawProfile;
    const entriesCount = (drawSize || 0) - (qualifyingPositions || 0);

    // if a drawProfile has specified uniqueParticipants...
    const drawParticipants = drawProfile.uniqueParticipants
      ? uniqueDrawParticipants.slice(uniqueParticipantsIndex, entriesCount)
      : stageParticipants[stage || MAIN] || [];
    if (drawProfile.uniqueParticipants) uniqueParticipantsIndex += entriesCount;

    const drawParticipantIds = drawParticipants
      .slice(0, entriesCount)
      .map(({ participantId }) => participantId);

    if (drawParticipantIds.length) {
      const result = addEventEntries({
        tournamentRecord,
        event,
        stage: stage || MAIN,
        participantIds: drawParticipantIds,
        autoEntryPositions,
      });
      if (result.error) return result;
    }
    const drawEntries = drawParticipantIds.map((participantId) => ({
      participantId,
      entryStage: stage || MAIN,
      entryStatus: DIRECT_ACCEPTANCE,
    }));
    const result = addFlight({
      event,
      stage,
      drawName: drawName || drawType,
      drawSize,
      drawEntries,
      qualifyingPositions,
    });
    if (result.error) {
      return result;
    }
  }

  const drawIds = [];
  const { flightProfile } = getFlightProfile({ event });

  if (Array.isArray(flightProfile?.flights)) {
    for (const [index, flight] of flightProfile.flights.entries()) {
      const { drawId, drawSize, stage, drawName, drawEntries } = flight;
      const drawType = drawProfiles[index].drawType || SINGLE_ELIMINATION;
      const automated = drawProfiles[index].automated;
      const matchUpFormat = drawProfiles[index].matchUpFormat;
      const tieFormat = drawProfiles[index].tieFormat || eventTieFormat;

      let result = generateDrawDefinition({
        matchUpType: eventType,
        tournamentRecord,
        matchUpFormat,
        drawEntries,
        automated,
        tieFormat,
        drawSize,
        drawType,
        drawName,
        stage,
        drawId,
        event,
      });

      const { drawDefinition, error } = result;
      if (error) return { error };

      result = addDrawDefinition({
        drawDefinition,
        event,
      });
      if (result.error) return result;
      drawIds.push(flight.drawId);

      const manual = automated === false;
      if (!manual && completeAllMatchUps) {
        const result = completeDrawMatchUps({
          completeAllMatchUps,
          matchUpStatusProfile,
          randomWinningSide,
          matchUpFormat,
          drawDefinition,
        });
        if (result.error) return result;
        if (drawProfiles[index].drawType === ROUND_ROBIN_WITH_PLAYOFF) {
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

  return { drawIds, eventId };
}
