import { isMatchUpEventType } from '@Helpers/matchUpEventTypes/isMatchUpEventType';
import { getAppliedPolicies } from '@Query/extensions/getAppliedPolicies';
import { addDrawEntries } from '@Mutate/drawDefinitions/addDrawEntries';
import { decorateResult } from '@Functions/global/decorateResult';
import { refreshEntryPositions } from './refreshEntryPositions';
import { isValidExtension } from '@Validators/isValidExtension';
import { addExtension } from '@Mutate/extensions/addExtension';
import { definedAttributes } from '@Tools/definedAttributes';
import { removeEventEntries } from './removeEventEntries';
import { isUngrouped } from '@Query/entries/isUngrouped';
import { coercedGender } from '@Helpers/coercedGender';
import { isMixed } from '@Validators/isMixed';
import { isAny } from '@Validators/isAny';

// constants and types
import { DrawDefinition, EntryStatusUnion, Event, Extension, StageTypeUnion, Tournament } from '@Types/tournamentTypes';
import POLICY_MATCHUP_ACTIONS_DEFAULT from '@Fixtures/policies/POLICY_MATCHUP_ACTIONS_DEFAULT';
import { INDIVIDUAL, PAIR, TEAM } from '@Constants/participantConstants';
import { POLICY_TYPE_MATCHUP_ACTIONS } from '@Constants/policyConstants';
import { DOUBLES_EVENT, TEAM_EVENT } from '@Constants/eventConstants';
import { DIRECT_ACCEPTANCE } from '@Constants/entryStatusConstants';
import { PolicyDefinitions, ResultType } from '@Types/factoryTypes';
import { ROUND_TARGET } from '@Constants/extensionConstants';
import { DOUBLES, SINGLES } from '@Constants/matchUpTypes';
import { MAIN } from '@Constants/drawDefinitionConstants';
import { SUCCESS } from '@Constants/resultConstants';
import { unique } from '@Tools/arrays';
import {
  EVENT_NOT_FOUND,
  INVALID_PARTICIPANT_IDS,
  INVALID_VALUES,
  MISSING_EVENT,
  MISSING_PARTICIPANT_IDS,
} from '@Constants/errorConditionConstants';

/**
 * Add entries into an event; optionally add to specified drawDefinition/flightProfile, if possible.
 */

type AddEventEntriesArgs = {
  policyDefinitions?: PolicyDefinitions;
  suppressDuplicateEntries?: boolean;
  entryStatus?: EntryStatusUnion;
  drawDefinition?: DrawDefinition;
  autoEntryPositions?: boolean;
  tournamentRecord?: Tournament;
  entryStageSequence?: number;
  ignoreStageSpace?: boolean;
  entryStage?: StageTypeUnion;
  participantIds?: string[];
  extensions?: Extension[];
  enforceGender?: boolean;
  extension?: Extension;
  roundTarget?: number;
  drawId?: string;
  event: Event;
};

function isValidSinglesGender(participant: any, event: Event, genderEnforced: boolean, mismatchedGender: any[]) {
  if (
    event.gender &&
    genderEnforced &&
    !(isMixed(event.gender) || isAny(event.gender)) &&
    coercedGender(event.gender) !== coercedGender(participant.person?.sex)
  ) {
    mismatchedGender.push({
      participantId: participant.participantId,
      sex: participant.person?.sex,
    });
    return false;
  }
  return true;
}

function getValidParticipantIds({
  participantIds,
  typedParticipantIds,
  checkTypedParticipants,
}: {
  participantIds: string[];
  typedParticipantIds: string[];
  checkTypedParticipants: boolean;
}): string[] {
  return participantIds.filter(
    (participantId) => !checkTypedParticipants || typedParticipantIds.includes(participantId),
  );
}

export function addEventEntries(params: AddEventEntriesArgs): ResultType {
  const {
    suppressDuplicateEntries = true,
    entryStatus = DIRECT_ACCEPTANCE,
    autoEntryPositions = true,
    enforceGender = true,
    entryStageSequence,
    policyDefinitions,
    entryStage = MAIN,
    tournamentRecord,
    ignoreStageSpace,
    drawDefinition,
    roundTarget,
    extensions,
    extension,
    drawId,
    event,
  } = params;

  const stack = 'addEventEntries';

  if (!Array.isArray(params.participantIds))
    return decorateResult({ result: { error: INVALID_PARTICIPANT_IDS }, stack });

  const participantIds = unique(params.participantIds ?? []);

  if (!event) return { error: MISSING_EVENT };
  if (!participantIds?.length) {
    return decorateResult({
      result: { error: MISSING_PARTICIPANT_IDS },
      stack,
    });
  }

  if (!event?.eventId) return { error: EVENT_NOT_FOUND };

  const appliedPolicies = getAppliedPolicies({ tournamentRecord, event }).appliedPolicies ?? {};

  const matchUpActionsPolicy =
    policyDefinitions?.[POLICY_TYPE_MATCHUP_ACTIONS] ??
    appliedPolicies?.[POLICY_TYPE_MATCHUP_ACTIONS] ??
    POLICY_MATCHUP_ACTIONS_DEFAULT[POLICY_TYPE_MATCHUP_ACTIONS];

  const genderEnforced = (enforceGender ?? matchUpActionsPolicy?.participants?.enforceGender) !== false;

  const addedParticipantIdEntries: string[] = [];
  const removedEntries: any[] = [];

  if (
    (extensions && (!Array.isArray(extensions) || !extensions.every((extension) => isValidExtension({ extension })))) ||
    (extension && !isValidExtension({ extension }))
  ) {
    return decorateResult({
      context: definedAttributes({ extension, extensions }),
      result: { error: INVALID_VALUES },
      info: 'Invalid extension(s)',
      stack,
    });
  }

  const checkTypedParticipants = !!tournamentRecord;
  const mismatchedGender: any[] = [];
  let info;

  function isValidSinglesParticipant(participant: any, event: Event, entryStatus: EntryStatusUnion) {
    return (
      isMatchUpEventType(SINGLES)(event.eventType) &&
      participant.participantType === INDIVIDUAL &&
      !isUngrouped(entryStatus)
    );
  }

  function isValidDoublesParticipant(participant: any, event: Event, entryStatus: EntryStatusUnion) {
    return event.eventType === DOUBLES && participant.participantType === PAIR && !isUngrouped(entryStatus);
  }

  function isValidUngroupedDoublesIndividual(
    participant: any,
    event: Event,
    entryStatus: EntryStatusUnion,
    genderEnforced: boolean,
    mismatchedGender: any[],
  ) {
    if (event.eventType === DOUBLES && participant.participantType === INDIVIDUAL && isUngrouped(entryStatus)) {
      if (
        event.gender &&
        genderEnforced &&
        !(isMixed(event.gender) || isAny(event.gender)) &&
        coercedGender(event.gender) !== coercedGender(participant.person?.sex)
      ) {
        mismatchedGender.push({
          participantId: participant.participantId,
          sex: participant.person?.sex,
        });
        return false;
      }
      return true;
    }
    return false;
  }

  function isValidTeamParticipant(participant: any, event: Event, entryStatus: EntryStatusUnion) {
    return (
      (event.eventType as string) === TEAM &&
      (participant.participantType === TEAM || (isUngrouped(entryStatus) && participant.participantType === INDIVIDUAL))
    );
  }

  function getTypedParticipantIds({
    tournamentRecord,
    participantIds,
    event,
    entryStatus,
    genderEnforced,
    mismatchedGender,
  }: {
    tournamentRecord?: Tournament;
    participantIds: string[];
    event: Event;
    entryStatus: EntryStatusUnion;
    genderEnforced: boolean;
    mismatchedGender: any[];
  }): string[] {
    return (
      tournamentRecord?.participants
        ?.filter((participant) => {
          if (!participantIds.includes(participant.participantId)) return false;

          if (
            isValidSinglesParticipant(participant, event, entryStatus) &&
            (!event.gender ||
              !genderEnforced ||
              isMixed(event.gender) ||
              isAny(event.gender) ||
              coercedGender(event.gender) === coercedGender(participant.person?.sex))
          ) {
            return true;
          }

          if (isValidDoublesParticipant(participant, event, entryStatus)) {
            return true;
          }

          if (isValidUngroupedDoublesIndividual(participant, event, entryStatus, genderEnforced, mismatchedGender)) {
            return true;
          }

          if (
            isValidSinglesParticipant(participant, event, entryStatus) &&
            !isValidSinglesGender(participant, event, genderEnforced, mismatchedGender)
          ) {
            return false;
          }

          return isValidTeamParticipant(participant, event, entryStatus);
        })
        .map((participant) => participant.participantId) ?? []
    );
  }

  const typedParticipantIds = getTypedParticipantIds({
    tournamentRecord,
    participantIds,
    event,
    entryStatus,
    genderEnforced,
    mismatchedGender,
  });

  const validParticipantIds = getValidParticipantIds({
    participantIds,
    typedParticipantIds,
    checkTypedParticipants,
  });

  event.entries ??= [];
  const existingIds = new Set(event.entries.map((e: any) => e.participantId || e.participant?.participantId));

  validParticipantIds.forEach((participantId) => {
    if (!existingIds.has(participantId)) {
      const entry = definedAttributes({
        participantId,
        entryStatus,
        entryStage,
        extensions,
      });

      if (extension) {
        addExtension({ element: entry, extension });
      }

      if (roundTarget) {
        addExtension({
          extension: { name: ROUND_TARGET, value: roundTarget },
          element: entry,
        });
      }
      if (entryStageSequence) entry.entryStageSequence = entryStageSequence;
      addedParticipantIdEntries.push(entry.participantId);
      event.entries?.push(entry);
    }
  });

  if (drawId && !isUngrouped(entryStage)) {
    const result = addDrawEntries({
      participantIds: validParticipantIds,
      suppressDuplicateEntries,
      autoEntryPositions,
      entryStageSequence,
      ignoreStageSpace,
      drawDefinition,
      entryStatus,
      roundTarget,
      entryStage,
      extension,
      drawId,
      event,
    });

    // Ignore error if drawId is included but entry can't be added to drawDefinition/flightProfile
    // return error as info to client
    if (result.error) {
      info = result.error;
    }
  }

  // now remove any ungrouped participantIds which exist as part of added grouped participants
  function removeUngroupedParticipantIds({
    tournamentRecord,
    removedEntries,
    event,
  }: {
    tournamentRecord?: Tournament;
    removedEntries: any[];
    event: Event;
  }) {
    if (event.eventType && [DOUBLES_EVENT, TEAM_EVENT].includes(event.eventType)) {
      const enteredParticipantIds = new Set((event.entries || []).map((entry) => entry.participantId));
      const ungroupedIndividualParticipantIds = (event.entries || [])
        .filter((entry) => isUngrouped(entry.entryStatus))
        .map((entry) => entry.participantId);
      const tournamentParticipants = tournamentRecord?.participants ?? [];
      const groupedIndividualParticipantIds = new Set(
        tournamentParticipants
          .filter(
            (participant) =>
              enteredParticipantIds.has(participant.participantId) &&
              participant.participantType &&
              [PAIR, TEAM].includes(participant.participantType),
          )
          .map((participant) => participant.individualParticipantIds)
          .flat(Infinity),
      );
      const ungroupedParticipantIdsToRemove = ungroupedIndividualParticipantIds.filter((participantId) =>
        groupedIndividualParticipantIds.has(participantId),
      );
      if (ungroupedParticipantIdsToRemove.length) {
        removedEntries.push(...ungroupedParticipantIdsToRemove);
        removeEventEntries({
          participantIds: ungroupedParticipantIdsToRemove,
          autoEntryPositions: false, // because the method will be called below if necessary
          event,
        });
      }
    }
  }

  removeUngroupedParticipantIds({ event, tournamentRecord, removedEntries });

  const invalidParticipantIds = validParticipantIds.length !== participantIds.length;

  if (invalidParticipantIds)
    return decorateResult({
      context: { mismatchedGender, gender: event.gender },
      result: { error: INVALID_PARTICIPANT_IDS },
      stack,
    });

  if (autoEntryPositions) {
    event.entries = refreshEntryPositions({
      entries: event.entries || [],
    });
  }

  const addedEntriesCount = addedParticipantIdEntries.length;
  const removedEntriesCount = removedEntries.length;

  return decorateResult({
    result: { ...SUCCESS, addedEntriesCount, removedEntriesCount },
    stack,
    info,
  });
}
