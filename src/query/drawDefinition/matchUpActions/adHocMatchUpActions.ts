import { getEventAlternateParticipantIds } from './getEventAlternateParticipantids';
import { getParticipantId } from '../../../functions/global/extractors';
import { checkScoreHasValue } from '../../matchUp/checkScoreHasValue';
import { makeDeepCopy } from '../../../tools/makeDeepCopy';
import { getFlightProfile } from '../../event/getFlightProfile';
import { unique } from '../../../tools/arrays';

import { ASSIGN_SIDE_METHOD, REMOVE_PARTICIPANT, REMOVE_SIDE_METHOD } from '../../../constants/matchUpActionConstants';
import { ASSIGN_PARTICIPANT } from '../../../constants/positionActionConstants';
import { HydratedParticipant } from '../../../types/hydrated';
import {
  ALTERNATE,
  DIRECT_ENTRY_STATUSES,
  UNGROUPED,
  UNPAIRED,
  WITHDRAWN,
} from '../../../constants/entryStatusConstants';

export function adHocMatchUpActions({
  restrictAdHocRoundParticipants,
  tournamentParticipants,
  matchUpParticipantIds,
  otherFlightEntries,
  drawDefinition,
  structureId,
  sideNumber,
  matchUpId,
  structure,
  matchUp,
  drawId,
  event,
}: {
  restrictAdHocRoundParticipants?: boolean;
  tournamentParticipants?: HydratedParticipant[];
  matchUpParticipantIds: string[];
  otherFlightEntries?: boolean;
  structureId: string;
  sideNumber?: number;
  drawDefinition: any;
  matchUpId: string;
  drawId: string;
  structure: any;
  matchUp: any;
  event: any;
}) {
  const validActions: any = [];

  const roundMatchUps = (structure?.matchUps ?? []).filter(({ roundNumber }) => roundNumber === matchUp.roundNumber);
  const enteredParticipantIds =
    drawDefinition?.entries
      ?.filter(({ entryStatus }) => entryStatus && DIRECT_ENTRY_STATUSES.includes(entryStatus))
      .map(getParticipantId) ?? [];

  const roundAssignedParticipantIds = roundMatchUps
    .map((matchUp) => (matchUp.sides ?? []).flatMap(getParticipantId))
    .flat()
    .filter(Boolean);

  const availableParticipantIds = enteredParticipantIds.filter(
    (participantId) =>
      !matchUpParticipantIds.includes(participantId) &&
      (!restrictAdHocRoundParticipants || !roundAssignedParticipantIds.includes(participantId)),
  );

  const participantsAvailable = tournamentParticipants
    ?.filter((participant) => availableParticipantIds?.includes(participant.participantId))
    .map((participant) => makeDeepCopy(participant, undefined, true));

  participantsAvailable?.forEach((participant: HydratedParticipant) => {
    const entry = (drawDefinition.entries ?? []).find((entry) => entry.participantId === participant.participantId);
    // used to sort available participants
    participant.entryPosition = entry?.entryPosition;
  });

  if (availableParticipantIds.length) {
    validActions.push({
      payload: { drawId, matchUpId, structureId, sideNumber },
      method: ASSIGN_SIDE_METHOD,
      type: ASSIGN_PARTICIPANT,
      availableParticipantIds,
      participantsAvailable,
    });
  }

  const eventEntries = event?.entries ?? [];
  const availableEventAlternatesParticipantIds = getEventAlternateParticipantIds({ eventEntries, structure });

  let availableAlternatesParticipantIds = unique(enteredParticipantIds.concat(availableEventAlternatesParticipantIds));

  if (otherFlightEntries) {
    const flightProfile: any = event ? getFlightProfile({ event }) : undefined;
    const otherFlightEnteredParticipantIds = flightProfile?.flights
      ?.filter((flight) => flight.drawId !== drawId)
      .flatMap((flight) =>
        flight.drawEntries
          .filter((entry) => entry.participantId && ![WITHDRAWN, UNGROUPED, UNPAIRED].includes(entry.entryStatus))
          .map(({ participantId }) => participantId),
      )
      .filter(Boolean);

    if (otherFlightEnteredParticipantIds?.length) {
      // include direct acceptance participants from other flights
      availableAlternatesParticipantIds.push(...otherFlightEnteredParticipantIds);
    }
  }

  availableAlternatesParticipantIds = availableAlternatesParticipantIds.filter(
    (participantId) =>
      !matchUpParticipantIds.includes(participantId) &&
      !availableParticipantIds.includes(participantId) &&
      (!restrictAdHocRoundParticipants || !roundAssignedParticipantIds.includes(participantId)),
  );

  const availableAlternates = tournamentParticipants
    ?.filter((participant) => availableAlternatesParticipantIds.includes(participant.participantId))
    .map((participant) => makeDeepCopy(participant, undefined, true));
  availableAlternates?.forEach((alternate: HydratedParticipant) => {
    const entry = (drawDefinition.entries ?? []).find((entry) => entry.participantId === alternate.participantId);
    alternate.entryPosition = entry?.entryPosition;
  });
  availableAlternates?.sort((a, b) => (a.entryPosition || Infinity) - (b.entryPosition || Infinity));

  if (availableAlternatesParticipantIds.length) {
    validActions.push({
      payload: { drawId, matchUpId, structureId, sideNumber },
      availableParticipantIds: availableAlternatesParticipantIds,
      participantsAvailable: availableAlternates,
      method: ASSIGN_SIDE_METHOD,
      type: ALTERNATE,
    });
  }

  if (!checkScoreHasValue(matchUp) && sideNumber) {
    const side = matchUp.sides?.find((side) => side.sideNumber === sideNumber);
    if (side?.participantId) {
      validActions.push({
        payload: { drawId, matchUpId, structureId, sideNumber },
        method: REMOVE_SIDE_METHOD,
        type: REMOVE_PARTICIPANT,
      });
    }
  }

  return validActions;
}
