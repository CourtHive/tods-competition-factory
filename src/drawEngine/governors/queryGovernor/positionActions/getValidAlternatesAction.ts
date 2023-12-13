import { getFlightProfile } from '../../../../tournamentEngine/getters/getFlightProfile';
import { getAllPositionedParticipantIds } from '../../../getters/positionsGetter';
import { definedAttributes } from '../../../../utilities/definedAttributes';
import { unique } from '../../../../utilities';

import { POLICY_TYPE_POSITION_ACTIONS } from '../../../../constants/policyConstants';
import { PolicyDefinitions } from '../../../../types/factoryTypes';
import {
  CONSOLATION,
  MAIN,
  PLAY_OFF,
  QUALIFYING,
} from '../../../../constants/drawDefinitionConstants';
import {
  ALTERNATE_PARTICIPANT,
  ALTERNATE_PARTICIPANT_METHOD,
  ASSIGN_PARTICIPANT,
} from '../../../../constants/positionActionConstants';
import {
  ALTERNATE,
  UNGROUPED,
  UNPAIRED,
  WITHDRAWN,
} from '../../../../constants/entryStatusConstants';
import {
  DrawDefinition,
  Entry,
  Event,
  Participant,
  PositionAssignment,
  Structure,
} from '../../../../types/tournamentFromSchema';

type GetValidAlternatesActionArgs = {
  positionAssignments: PositionAssignment[];
  tournamentParticipants?: Participant[];
  appliedPolicies?: PolicyDefinitions;
  possiblyDisablingAction?: boolean;
  activeDrawPositions: number[];
  returnParticipants?: boolean;
  drawDefinition: DrawDefinition;
  drawPosition: number;
  structureId?: string;
  structure: Structure;
  validActions: any[];
  drawId: string;
  event?: Event;
};

export function getValidAlternatesAction({
  tournamentParticipants = [],
  possiblyDisablingAction,
  activeDrawPositions,
  positionAssignments,
  returnParticipants,
  appliedPolicies,
  drawDefinition,
  drawPosition,
  validActions,
  structureId,
  structure,
  drawId,
  event,
}: GetValidAlternatesActionArgs) {
  if (activeDrawPositions.includes(drawPosition)) return {};

  const validAssignmentParticipantIds = validActions.find(
    (action) => action.type === ASSIGN_PARTICIPANT
  )?.availableParticipantIds;

  // TODO: document policy options
  const otherFlightEntries =
    appliedPolicies?.[POLICY_TYPE_POSITION_ACTIONS]?.otherFlightEntries;
  const restrictQualifyingAlternates =
    appliedPolicies?.[POLICY_TYPE_POSITION_ACTIONS]
      ?.restrictQualifyingAlternates;

  const drawEnteredParticipantIds = (drawDefinition.entries ?? [])
    .filter(
      ({ entryStage }) =>
        !restrictQualifyingAlternates ||
        (structure.stage === QUALIFYING
          ? entryStage === QUALIFYING
          : entryStage !== QUALIFYING)
    )
    .sort(
      (a, b) => (a.entryPosition ?? Infinity) - (b.entryPosition ?? Infinity)
    )
    .map(({ participantId }) => participantId)
    .filter(Boolean);

  const { allPositionedParticipantIds } = getAllPositionedParticipantIds({
    drawDefinition,
  });

  const assignedParticipantIds = positionAssignments
    .map((assignment) => assignment.participantId)
    .filter(Boolean);

  const availableDrawEnteredParticipantIds = drawEnteredParticipantIds.filter(
    (participantId) =>
      structure.stage && [QUALIFYING, MAIN, PLAY_OFF].includes(structure.stage)
        ? !allPositionedParticipantIds?.includes(participantId)
        : !assignedParticipantIds.includes(participantId)
  );

  const eventEntries = event?.entries ?? [];
  const availableEventAlternatesParticipantIds = eventEntries
    .filter(
      (entry) =>
        entry.entryStatus === ALTERNATE &&
        eligibleEntryStage({
          restrictQualifyingAlternates,
          structure,
          entry,
        }) &&
        (structure.stage &&
        [QUALIFYING, MAIN, PLAY_OFF].includes(structure.stage)
          ? !allPositionedParticipantIds?.includes(entry.participantId)
          : !assignedParticipantIds.includes(entry.participantId))
    )
    .sort(
      (a, b) => (a.entryPosition ?? Infinity) - (b.entryPosition ?? Infinity)
    )
    .map((entry) => entry.participantId);

  let availableAlternatesParticipantIds = unique(
    availableDrawEnteredParticipantIds.concat(
      availableEventAlternatesParticipantIds
    )
  );

  if (otherFlightEntries) {
    const flightProfile = event
      ? getFlightProfile({ event }).flightProfile
      : undefined;
    const otherFlightEnteredParticipantIds = flightProfile?.flights
      ?.filter((flight) => flight.drawId !== drawId)
      .map((flight) =>
        flight.drawEntries
          .filter(
            (entry) =>
              entry.participantId &&
              ![WITHDRAWN, UNGROUPED, UNPAIRED].includes(entry.entryStatus) &&
              !drawEnteredParticipantIds.includes(entry.participantId)
          )
          .map(({ participantId }) => participantId)
      )
      .flat()
      .filter(Boolean);

    if (otherFlightEnteredParticipantIds?.length) {
      // include direct acceptance participants from other flights
      availableAlternatesParticipantIds.push(
        ...otherFlightEnteredParticipantIds
      );
    }
  }

  // ensure that participantId is not available in multiple assignment options
  if (validAssignmentParticipantIds?.length) {
    availableAlternatesParticipantIds =
      availableAlternatesParticipantIds.filter(
        (id) => !validAssignmentParticipantIds.includes(id)
      );
  }

  const availableAlternates = returnParticipants
    ? tournamentParticipants?.filter((participant: Participant) =>
        availableAlternatesParticipantIds.includes(participant.participantId)
      )
    : undefined;
  availableAlternates?.forEach((alternate: any) => {
    const entry = (drawDefinition.entries ?? []).find(
      (entry: Entry) => entry.participantId === alternate.participantId
    );
    alternate.entryPosition = entry?.entryPosition;
  });
  availableAlternates?.sort(
    (a: any, b: any) =>
      (a.entryPosition || Infinity) - (b.entryPosition || Infinity)
  );

  if (availableAlternatesParticipantIds.length) {
    const validAlternatesAction = definedAttributes({
      payload: { drawId, structureId, drawPosition },
      willDisableLinks: possiblyDisablingAction,
      method: ALTERNATE_PARTICIPANT_METHOD,
      availableAlternatesParticipantIds,
      type: ALTERNATE_PARTICIPANT,
      availableAlternates,
    });
    return { validAlternatesAction };
  }

  return {};
}

type EligibleEntryStageArgs = {
  restrictQualifyingAlternates?: boolean;
  structure: Structure;
  entry: Entry;
};
export function eligibleEntryStage({
  restrictQualifyingAlternates,
  structure,
  entry,
}: EligibleEntryStageArgs) {
  const { stage } = structure;
  if (
    !entry.entryStage ||
    entry.entryStage === stage ||
    (stage === QUALIFYING && !restrictQualifyingAlternates) ||
    (entry.entryStage === MAIN && stage === CONSOLATION)
  )
    return true;
  return undefined;
}
