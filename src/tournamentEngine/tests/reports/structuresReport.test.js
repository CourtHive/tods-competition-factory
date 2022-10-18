import { findTournamentExtension } from '../../governors/queryGovernor/extensionQueries';
import { structureReport } from '../../governors/reportGovernor/structureReport';
import tournamentEngine from '../../../tournamentEngine/sync';
import mocksEngine from '../../../mocksEngine';
import fs from 'fs';

import { DOUBLES_EVENT } from '../../../constants/eventConstants';

const sourcePath = './src/global/testHarness';
const filenames = fs
  .readdirSync(sourcePath)
  .filter((filename) => filename.indexOf('.tods.json') > 0);

it.skip.each(filenames)(
  'can validate all tods files in testHarness directory',
  (filename) => {
    const tournamentRecord = JSON.parse(
      fs.readFileSync(`./src/global/testHarness/${filename}`, 'UTF-8')
    );
    if ((tournamentRecord?.extensions || []).find((e) => e?.name === 'level')) {
      const districtCode = findTournamentExtension({
        name: 'districtCode',
        tournamentRecord,
      })?.extension?.value;
      const sectionCode = findTournamentExtension({
        name: 'sectionCode',
        tournamentRecord,
      })?.extension?.value;

      if (sectionCode && districtCode) {
        const tournamentStructureData = structureReport({
          tournamentRecord,
        });
        console.log({
          tournamentStructureData,
        });
      }
    }
  }
);

it('can identify winningParticipants and map WTN and ranking', () => {
  const drawProfiles = [
    {
      eventName: `WTN 14-19 SINGLES`,
      category: { ratingType: 'WTN', ratingMin: 14, ratingMax: 19.99 },
      generate: true,
      drawSize: 4,
    },
    {
      eventName: `WTN 14-19 DOUBLES`,
      category: { ratingType: 'WTN', ratingMin: 14, ratingMax: 19.99 },
      eventType: DOUBLES_EVENT,
      generate: true,
      drawSize: 4,
    },
  ];
  const personExtensions = [
    { name: 'districtCode', value: 'Z' },
    { name: 'sectionCode', value: '123' },
  ];
  const participantsProfile = {
    withScaleValues: true,
    personExtensions,
  };

  const tournamentExtensions = [
    { name: 'level', value: { level: { orderIndex: 5 } } },
    { name: 'sectionCode', value: '070' },
    { name: 'districtCode', value: '042' },
  ];

  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    completeAllMatchUps: true,
    tournamentExtensions,
    participantsProfile,
    autoSchedule: true,
    drawProfiles,
  });

  tournamentEngine.setState(tournamentRecord);
  const targetStructureData = tournamentEngine.structureReport();
  expect(targetStructureData.length).toEqual(2);
});
