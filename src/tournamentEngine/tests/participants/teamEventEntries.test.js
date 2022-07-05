import { getParticipantId } from '../../../global/functions/extractors';
import tournamentEngine from '../../sync';
import { mocksEngine } from '../../..';

import { INDIVIDUAL } from '../../../constants/participantTypes';
import { TEAM } from '../../../constants/eventConstants';
import {
  DIRECT_ACCEPTANCE,
  UNGROUPED,
} from '../../../constants/entryStatusConstants';
import { INVALID_PARTICIPANT_IDS } from '../../../constants/errorConditionConstants';

test('adding individualParticipantids to TEAM participants removes them from team event entries', () => {
  const eventProfiles = [
    {
      eventType: TEAM,
      drawProfiles: [
        { drawSize: 2, automate: false },
        { drawSize: 2, automate: false },
      ],
    },
  ];
  const {
    eventIds: [eventId],
    drawIds: [drawId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    participantsProfile: { participantsCount: 10 },
    eventProfiles,
  });

  tournamentEngine.setState(tournamentRecord);

  const { tournamentParticipants: individualParticipants } =
    tournamentEngine.getTournamentParticipants({
      participantFilters: { participantTypes: [INDIVIDUAL] },
    });

  const { tournamentParticipants: teamParticipants } =
    tournamentEngine.getTournamentParticipants({
      participantFilters: { participantTypes: [TEAM] },
    });

  const individualParticipantIdsInTeams = teamParticipants
    .map(({ individualParticipantIds }) => individualParticipantIds)
    .flat();

  const individualsParticipantsNotInTeams = individualParticipants.filter(
    ({ participantId }) =>
      !individualParticipantIdsInTeams.includes(participantId)
  );

  let { event } = tournamentEngine.getEvent({ eventId });

  const participantIds =
    individualsParticipantsNotInTeams.map(getParticipantId);

  let result = tournamentEngine.addEventEntries({
    entryStatus: UNGROUPED,
    tournamentRecord,
    participantIds,
    drawId,
    event,
  });
  expect(result.success).toEqual(true);

  ({ event } = tournamentEngine.getEvent({ eventId }));

  const ungroupedEntries = event.entries.filter(
    ({ entryStatus }) => entryStatus === UNGROUPED
  );
  expect(ungroupedEntries.length).toEqual(participantIds.length);

  const teamEntries = event.entries.filter(
    ({ entryStatus }) => entryStatus === DIRECT_ACCEPTANCE
  );

  result = tournamentEngine.addIndividualParticipantIds({
    groupingParticipantId: teamEntries[0].participantId,
    individualParticipantIds: participantIds,
  });
  expect(result.success).toEqual(true);
  expect(result.added).toEqual(participantIds.length);

  ({ event } = tournamentEngine.getEvent({ eventId }));
  expect(event.entries.length).toEqual(2);
});

test('will remove UNGROUPED individual participants when their team is added to event entries', () => {
  const participantsCount = 8;
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    participantsProfile: { participantType: TEAM, participantsCount },
  });

  tournamentEngine.setState(tournamentRecord);

  let result = tournamentEngine.addEvent({
    event: { eventType: TEAM },
  });

  let { event: eventResult } = result;
  const { eventId } = eventResult;
  expect(result.success).toEqual(true);

  const { tournamentParticipants: individualParticipants } =
    tournamentEngine.getTournamentParticipants({
      participantFilters: { participantTypes: [INDIVIDUAL] },
    });
  const individualParticipantIds = individualParticipants.map(
    (p) => p.participantId
  );

  result = tournamentEngine.addEventEntries({
    participantIds: individualParticipantIds,
    eventId,
  });
  expect(result.error).toEqual(INVALID_PARTICIPANT_IDS);

  result = tournamentEngine.addEventEntries({
    participantIds: individualParticipantIds,
    entryStatus: UNGROUPED,
    eventId,
  });
  expect(result.success).toEqual(true);
  let { event } = tournamentEngine.getEvent({ eventId });
  expect(
    event.entries.filter((entry) => entry.entryStatus === UNGROUPED).length
  ).toEqual(64);
  expect(
    event.entries.filter((entry) => entry.entryStatus === DIRECT_ACCEPTANCE)
      .length
  ).toEqual(0);

  const { tournamentParticipants } = tournamentEngine.getTournamentParticipants(
    {
      participantFilters: { participantTypes: [TEAM] },
    }
  );
  const participantIds = tournamentParticipants.map((p) => p.participantId);
  expect(tournamentParticipants.length).toEqual(participantsCount);

  result = tournamentEngine.addEventEntries({ eventId, participantIds });
  expect(result.success).toEqual(true);

  event = tournamentEngine.getEvent({ eventId }).event;
  expect(
    event.entries.filter((entry) => entry.entryStatus === UNGROUPED).length
  ).toEqual(0);
  expect(
    event.entries.filter((entry) => entry.entryStatus === DIRECT_ACCEPTANCE)
      .length
  ).toEqual(8);
});
