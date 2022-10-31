import { findTournamentExtension } from '../../governors/queryGovernor/extensionQueries';
import tournamentEngine from '../../../tournamentEngine/sync';
import { instanceCount } from '../../../utilities';
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
      seedsCount: 2,
      drawSize: 4,
    },
    {
      eventName: `WTN 14-19 DOUBLES`,
      category: { ratingType: 'WTN', ratingMin: 14, ratingMax: 19.99 },
      eventType: DOUBLES_EVENT,
      generate: true,
      seedsCount: 2,
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
    participantsCount: 100,
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
  const { structureReport, eventStructureReport } =
    tournamentEngine.getStructureReport();
  expect(structureReport.length).toEqual(drawProfiles.length);
  eventStructureReport.forEach((report) => {
    expect(report.totalPositionManipulations).toEqual(0);
    expect(report.generatedDrawsCount).toEqual(1);
    expect(report.drawDeletionsCount).toEqual(0);
  });

  // event analytics
  const {
    tournamentEntryReport,
    entryStatusReports,
    personEntryReports,
    eventReports,
  } = tournamentEngine.entryStatusReport();
  expect(eventReports.length).toEqual(drawProfiles.length);

  const { participants: individualParticipants } =
    tournamentEngine.getParticipants({
      participantFilters: { participantTypes: [INDIVIDUAL] },
      withScaleValues: true,
      withEvents: true,
    });
  const individualParticipantsWithEvents = individualParticipants.filter(
    ({ events }) => events.length
  );

  expect(
    tournamentEntryReport.nonParticipatingEntriesCount +
      personEntryReports.length
  ).toEqual(individualParticipants.length);

  expect(personEntryReports.length).toEqual(
    individualParticipantsWithEvents.length
  );

  // dummy condition
  if (!personEntryReports.length) {
    console.log('STRUCTURE REPORT');
    console.log(utilities.JSON2CSV(structureReport));
    console.log('ENTRY STATUS REPORTS');
    console.log(utilities.JSON2CSV(entryStatusReports));
    console.log('PERSON ENTRY REPORTS');
    console.log(utilities.JSON2CSV(personEntryReports));
  }

  expect(structureReport.map((r) => r.pctNoRating)).toEqual([0, 0, 100]);
  expect(Object.keys(structureReport[0]).sort()).toEqual([
    'ageCategoryCode',
    'avgConfidence',
    'avgWTN',
    'category',
    'categoryName',
    'districtCode',
    'drawId',
    'drawType',
    'eventId',
    'eventType',
    'flightNumber',
    'levelOrder',
    'matchUpFormat',
    'matchUpsCount',
    'pctInitialMatchUpFormat',
    'pctNoRating',
    'positionManipulations',
    'sectionCode',
    'stage',
    'structureId',
    'tieFormatDesc',
    'tieFormatName',
    'tournamentId',
    'winningPerson2Id',
    'winningPerson2WTNconfidence',
    'winningPerson2WTNrating',
    'winningPersonId',
    'winningPersonWTNconfidence',
    'winningPersonWTNrating',
  ]);
  expect(Object.keys(entryStatusReports[0]).sort()).toEqual([
    'CONFIRMED_count',
    'CONFIRMED_pct',
    'DIRECT_ACCEPTANCE_count',
    'DIRECT_ACCEPTANCE_pct',
    'FEED_IN_count',
    'FEED_IN_pct',
    'JUNIOR_EXEMPT_count',
    'JUNIOR_EXEMPT_pct',
    'LUCKY_LOSER_count',
    'LUCKY_LOSER_pct',
    'ORGANISER_ACCEPTANCE_count',
    'ORGANISER_ACCEPTANCE_pct',
    'QUALIFIER_count',
    'QUALIFIER_pct',
    'SPECIAL_EXEMPT_count',
    'SPECIAL_EXEMPT_pct',
    'WILDCARD_count',
    'WILDCARD_pct',
    'eventId',
    'tournamentId',
  ]);

  expect(
    instanceCount(personEntryReports.map((r) => r.mainSeeding).filter(Boolean))
  ).toEqual({ 1: 4, 2: 4 });
  expect(Object.keys(personEntryReports[0]).sort()).toEqual([
    'confidence',
    'drawId',
    'entryStatus',
    'eventId',
    'mainSeeding',
    'participantId',
    'personId',
    'qualifyingSeeding',
    'ranking',
    'tournamentId',
    'wtnRating',
  ]);
});
