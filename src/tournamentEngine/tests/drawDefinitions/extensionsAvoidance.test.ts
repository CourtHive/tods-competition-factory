import mocksEngine from '../../../mocksEngine';
import { chunkArray, extractAttributes } from '../../../utilities';
import tournamentEngine from '../../sync';
import { expect, test } from 'vitest';

test('avoidance policies based on extension values', () => {
  const mockProfile = { drawProfiles: [{ generate: false, drawSize: 32 }] };
  const {
    tournamentRecord,
    eventIds: [eventId],
  } = mocksEngine.generateTournamentRecord(mockProfile);

  expect(tournamentRecord.participants.length).toEqual(32);
  const cohorts = chunkArray(tournamentRecord.participants, 4);
  cohorts.forEach((cohort, i) => {
    for (const participant of cohort) {
      participant.person.extensions = [{ name: 'avoidance', value: `A-${i}` }];
    }
  });

  const deepCopyOption = false; // ensure extensins are converted w/ internalUse
  const result = tournamentEngine.setState(tournamentRecord, deepCopyOption);
  expect(result.success).toEqual(true);

  const participantMap = tournamentEngine.getParticipants().participantMap;
  const generationResult = tournamentEngine.generateDrawDefinition({ eventId });
  const positionAssignments =
    tournamentEngine.getPositionAssignments(
      generationResult
    ).positionAssignments;
  const participantAvoidanceValuePairs = chunkArray(
    positionAssignments
      .map(extractAttributes('participantId'))
      .map(
        (participantId) =>
          participantMap[participantId].participant.person.extensions[0].value
      ),
    2
  );
  console.log(participantAvoidanceValuePairs);
});
