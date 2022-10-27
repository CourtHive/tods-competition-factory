import { findTournamentExtension } from '../../governors/queryGovernor/extensionQueries';
import tournamentEngine from '../../../tournamentEngine/sync';
import mocksEngine from '../../../mocksEngine';
import { utilities } from '../../..';
import fs from 'fs';

import { DOUBLES_EVENT } from '../../../constants/eventConstants';
import { INDIVIDUAL } from '../../../constants/participantConstants';

const sourcePath = './src/global/testHarness';
const filenames = fs
  .readdirSync(sourcePath)
  .filter((filename) => filename.indexOf('.tods.json') > 0);

it.skip.each(filenames)(
  'can generate structureReport for all tournamentRecords in testHarness',
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
        const structureReport = tournamentEngine.structureReport({
          tournamentRecord,
        });
        console.log({ structureReport });
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
    {
      category: { categoryName: '12U' },
      rankingRange: [1, 15],
      seedsCount: 2,
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

  // structure analytics
  tournamentEngine.setState(tournamentRecord);
  const structureReport = tournamentEngine.structureReport();
  expect(structureReport.length).toEqual(drawProfiles.length);

  // event analytics
  const { eventReports, personEntryReports, entryStatusReports } =
    tournamentEngine.entryStatusReport();
  expect(eventReports.length).toEqual(drawProfiles.length);

  const { participants } = tournamentEngine.getParticipants({
    participantFilters: { participantTypes: [INDIVIDUAL] },
    withScaleValues: true,
    withEvents: true,
  });
  console.log(participants[0].timeItems);
  console.log(participants[0].rankings);
  console.log(participants[0].events[0]);

  expect(personEntryReports.length).toEqual(participants.length);

  console.log('STRUCTURE REPORT');
  console.log(utilities.JSON2CSV(structureReport));
  console.log('ENTRY STATUS REPORTS');
  console.log(utilities.JSON2CSV(entryStatusReports));
  console.log('PERSON ENTRY REPORTS');
  console.log(utilities.JSON2CSV(personEntryReports));
});
