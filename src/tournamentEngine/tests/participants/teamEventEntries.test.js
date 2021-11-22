import { getParticipantId } from '../../../global/functions/extractors';
import tournamentEngine from '../../sync';
import { mocksEngine } from '../../..';

import { INDIVIDUAL } from '../../../constants/participantTypes';
import { TEAM } from '../../../constants/eventConstants';
import {
  DIRECT_ACCEPTANCE,
  UNGROUPED,
} from '../../../constants/entryStatusConstants';

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
