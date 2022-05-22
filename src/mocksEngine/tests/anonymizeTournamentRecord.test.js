import { intersection } from '../../utilities';
import mocksEngine from '..';
import fs from 'fs';

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

  expect(tournamentRecord.tournamentName.split(':')[0]).toEqual(`Anonymized`);

  const generatedPersons = tournamentRecord.participants.map(
    (participant) => participant.person
  );

  const originalPersonIds = originalPersons.map(({ personId }) => personId);
  const generatedPersonIds = generatedPersons.map(({ personId }) => personId);
  expect(intersection(originalPersonIds, generatedPersonIds).length).toEqual(0);
});

const sourcePath = './src/global/testHarness';
const filenames = fs
  .readdirSync(sourcePath)
  .filter((filename) => filename.indexOf('.tods.json') > 0);

it.each(filenames)(
  'can validate all tods files in testHarness directory',
  (filename) => {
    const tournamentRecord = JSON.parse(
      fs.readFileSync(`./src/global/testHarness/${filename}`, 'UTF-8')
    );

    const result = mocksEngine.anonymizeTournamentRecord({ tournamentRecord });
    expect(result.success).toEqual(true);
  }
);
