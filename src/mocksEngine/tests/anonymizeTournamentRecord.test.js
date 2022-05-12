import mocksEngine from '..';
import { intersection } from '../../utilities';
import { extractDate } from '../../utilities/dateTime';

test('it can anonymize tournamentRecords', () => {
  const tournamentName = 'Demo Tournament';
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize: 16 }],
    tournamentName,
  });

  const originalPersons = tournamentRecord.participants.map(
    (participant) => participant.person
  );

  expect(tournamentRecord.tournamentName).toEqual(tournamentName);

  let result = mocksEngine.anonymizeTournamentRecord({ tournamentRecord });
  expect(result.success).toEqual(true);

  const currentDate = extractDate(new Date().toISOString());
  expect(tournamentRecord.tournamentName).toEqual(`Anonymized: ${currentDate}`);

  const generatedPersons = tournamentRecord.participants.map(
    (participant) => participant.person
  );

  const originalPersonIds = originalPersons.map(({ personId }) => personId);
  const generatedPersonIds = generatedPersons.map(({ personId }) => personId);
  expect(intersection(originalPersonIds, generatedPersonIds).length).toEqual(0);
});
