import tournamentEngine from '../../sync';
import { mocksEngine } from '../../..';

import { TEAM } from '../../../constants/eventConstants';
import { UNGROUPED } from '../../../constants/entryStatusConstants';
import { INDIVIDUAL } from '../../../constants/participantTypes';
import { getParticipantId } from '../../../global/functions/extractors';

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

  const result = tournamentEngine.addEventEntries({
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
});
