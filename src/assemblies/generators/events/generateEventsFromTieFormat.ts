import { checkRequiredParameters } from '@Helpers/parameters/checkRequiredParameters';
import { addEventEntries } from '@Mutate/entries/addEventEntries';
import { addEvent } from '@Mutate/events/addEvent';
import { UUID, UUIDS } from '@Tools/UUID';

// Constants
import { ONE_OF, TIE_FORMAT, TIE_FORMAT_NAME, TOURNAMENT_RECORD } from '@Constants/attributeConstants';
import { EntryStatusUnion, Event, TieFormat, Tournament } from '@Types/tournamentTypes';
import { DIRECT_ACCEPTANCE, UNGROUPED } from '@Constants/entryStatusConstants';
import tieFormatDefaults from '@Generators/templates/tieFormatDefaults';
import { TEAM_PARTICIPANT } from '@Constants/participantConstants';
import { FEMALE, MALE, MIXED } from '@Constants/genderConstants';
import { DOUBLES_EVENT } from '@Constants/eventConstants';
import { SUCCESS } from '@Constants/resultConstants';

type GenerateEventsFromTieFormatArgs = {
  entryStatus?: EntryStatusUnion; // default to DIRECT_ACCEPTANCE
  addEntriesFromTeams?: boolean; // add team participants as entryStage entries to appropriate gender events
  tournamentRecord: Tournament;
  tieFormatName?: string;
  tieFormat?: TieFormat;
  addEvents?: boolean;
  uuids?: string[];
};

export function generateEventsFromTieFormat(params: GenerateEventsFromTieFormatArgs) {
  const paramsCheck = checkRequiredParameters(params, [
    { [ONE_OF]: { [TIE_FORMAT]: true, [TIE_FORMAT_NAME]: true } },
    { [TOURNAMENT_RECORD]: true },
  ]);
  if (paramsCheck.error) return paramsCheck;

  const tieFormat = params.tieFormat || tieFormatDefaults({ namedFormat: params.tieFormatName });
  const uuids = params.uuids || [UUIDS(tieFormat.collectionDefinitions.length)];

  const genderedParticipants = { [MALE]: [], [FEMALE]: [] };
  if (params.addEntriesFromTeams) {
    const teamParticipants = params.tournamentRecord.participants?.filter(
      (p) => p.participantType === TEAM_PARTICIPANT,
    );
    const individualParticipantIds = teamParticipants?.flatMap(
      (teamParticipant) => teamParticipant.individualParticipantIds ?? [],
    );

    for (const participant of params.tournamentRecord.participants ?? []) {
      if (individualParticipantIds?.includes(participant.participantId)) {
        const gender = participant.person?.sex;
        if (gender && [MALE, FEMALE].includes(gender)) {
          genderedParticipants[gender].push(participant.participantId);
        }
      }
    }
  }

  const events: Event[] = [];
  for (const collectionDefinition of tieFormat.collectionDefinitions ?? []) {
    const eventId: string = uuids?.pop()?.toString() || UUID();
    const eventType = collectionDefinition.matchUpType;
    const eventGender = collectionDefinition.gender;
    const event: Event = {
      matchUpFormat: collectionDefinition.matchUpFormat,
      eventName: collectionDefinition.collectionName,
      category: collectionDefinition.category,
      gender: eventGender,
      eventType,
      eventId,
    };

    if (params.addEntriesFromTeams) {
      const entryStatus = eventType === DOUBLES_EVENT ? UNGROUPED : params.entryStatus || DIRECT_ACCEPTANCE;
      const participantIds =
        eventGender === MIXED
          ? [...genderedParticipants[MALE], ...genderedParticipants[FEMALE]]
          : genderedParticipants[eventGender] ?? [];

      if (participantIds.length) {
        const result = addEventEntries({
          participantIds,
          entryStatus,
          event,
        });
        if (result.error) return result;
      }
    }

    events.push(event);

    if (params.addEvents !== false) {
      const result = addEvent({ internalUse: true, tournamentRecord: params.tournamentRecord, event });
      if (result.error) return result;
    }
  }

  return { ...SUCCESS, events };
}
