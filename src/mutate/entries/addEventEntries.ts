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
import { ANY, MIXED } from '@Constants/genderConstants';
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

  const typedParticipantIds =
    tournamentRecord?.participants
      ?.filter((participant) => {
        if (!participantIds.includes(participant.participantId)) return false;

        const validSingles =
          isMatchUpEventType(SINGLES)(event.eventType) &&
          participant.participantType === INDIVIDUAL &&
          !isUngrouped(entryStatus);

        const validDoubles = event.eventType === DOUBLES && participant.participantType === PAIR;

        if (
          validSingles &&
          (!event.gender ||
            !genderEnforced ||
            [MIXED, ANY].includes(event.gender) ||
            (event.gender as string) === participant.person?.sex)
        ) {
          return true;
        }

        if (validDoubles && !isUngrouped(entryStatus)) {
          return true;
        }

        if (event.eventType === DOUBLES && participant.participantType === INDIVIDUAL && isUngrouped(entryStatus)) {
          // Check gender for gendered doubles events with ungrouped entries
          if (
            event.gender &&
            genderEnforced &&
            ![MIXED, ANY].includes(event.gender) &&
            (event.gender as string) !== participant.person?.sex
          ) {
            mismatchedGender.push({
              participantId: participant.participantId,
              sex: participant.person?.sex,
            });
            return false;
          }
          return true;
        }

        if (
          validSingles &&
          event.gender &&
          genderEnforced &&
          ![MIXED, ANY].includes(event.gender) &&
          (event.gender as string) !== participant.person?.sex
        ) {
          mismatchedGender.push({
            participantId: participant.participantId,
            sex: participant.person?.sex,
          });
          return false;
        }

        return (
          (event.eventType as string) === TEAM &&
          (participant.participantType === TEAM ||
            (isUngrouped(entryStatus) && participant.participantType === INDIVIDUAL))
        );
      })
      .map((participant) => participant.participantId) ?? [];

  const validParticipantIds = participantIds.filter(
    (participantId) => !checkTypedParticipants || typedParticipantIds.includes(participantId),
  );

  if (!event.entries) event.entries = [];
  const existingIds = event.entries.map((e: any) => e.participantId || e.participant?.participantId);

  validParticipantIds.forEach((participantId) => {
    if (!existingIds.includes(participantId)) {
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
  if (event.eventType && [DOUBLES_EVENT, TEAM_EVENT].includes(event.eventType)) {
    const enteredParticipantIds = (event.entries || []).map((entry) => entry.participantId);
    const ungroupedIndividualParticipantIds = (event.entries || [])
      .filter((entry) => isUngrouped(entry.entryStatus))
      .map((entry) => entry.participantId);
    const tournamentParticipants = tournamentRecord?.participants ?? [];
    const groupedIndividualParticipantIds = tournamentParticipants
      .filter(
        (participant) =>
          enteredParticipantIds.includes(participant.participantId) &&
          participant.participantType &&
          [PAIR, TEAM].includes(participant.participantType),
      )
      .map((participant) => participant.individualParticipantIds)
      .flat(Infinity);
    const ungroupedParticipantIdsToRemove = ungroupedIndividualParticipantIds.filter((participantId) =>
      groupedIndividualParticipantIds.includes(participantId),
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
