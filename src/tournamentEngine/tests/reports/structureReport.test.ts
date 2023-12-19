import { findExtension } from '../../../acquire/findExtension';
import { instanceCount } from '../../../utilities';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../../examples/syncEngine';
import { utilities } from '../../..';
import { expect, it } from 'vitest';
import fs from 'fs';

import { INDIVIDUAL } from '../../../constants/participantConstants';
import { DOUBLES_EVENT } from '../../../constants/eventConstants';
import { COMPETITOR } from '../../../constants/participantRoles';

const sourcePath = './src/global/testHarness/structureReport';
const filenames = [];

it.skip.each(filenames)(
  'can generate structureReports for all tournamentRecords in testHarness',
  (filename) => {
    if (filename) {
      const tournamentRecord = JSON.parse(
        fs.readFileSync(`${sourcePath}/${filename}`, { encoding: 'utf8' })
      );
      tournamentEngine.setState(tournamentRecord);

      if (
        (tournamentRecord?.extensions || []).find((e) => e?.name === 'level')
      ) {
        const districtCode = findExtension({
          element: tournamentRecord,
          name: 'districtCode',
        })?.extension?.value;
        const sectionCode = findExtension({
          element: tournamentRecord,
          name: 'sectionCode',
        })?.extension?.value;

        if (sectionCode && districtCode) {
          const result = tournamentEngine.getEntryStatusReports();
          const {
            participantEntryReports,
            // tournamentEntryReport,
            // entryStatusReports,
            // eventReports,
          } = result;
          console.log(participantEntryReports[0]);
        }
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
  const { structureReports, eventStructureReports } =
    tournamentEngine.getStructureReports({
      extensionProfiles: [
        { name: 'level', label: 'levelOrder', accessor: 'level.orderIndex' },
        { name: 'districtCode' },
        { name: 'sectionCode' },
      ],
    });
  expect(structureReports.length).toEqual(drawProfiles.length);
  eventStructureReports.forEach((report) => {
    expect(report.totalPositionManipulations).toEqual(0);
    expect(report.generatedDrawsCount).toEqual(1);
    expect(report.drawDeletionsCount).toEqual(0);
  });

  // event analytics
  const {
    participantEntryReports,
    tournamentEntryReport,
    entryStatusReports,
    eventReports,
  } = tournamentEngine.getEntryStatusReports();
  expect(eventReports.length).toEqual(drawProfiles.length);

  const { participants } = tournamentEngine.getParticipants({
    participantFilters: {
      participantTypes: [INDIVIDUAL],
      participantRoles: [COMPETITOR],
    },
    withScaleValues: true,
    withEvents: true,
    withDraws: true,
  });

  const individualParticipantsWithEvents = participants.filter(
    ({ events, participantType }) =>
      events.length && participantType === INDIVIDUAL
  );

  expect(tournamentEntryReport.individualParticipantsCount).toEqual(
    participants.length
  );
  expect(tournamentEntryReport.drawDefinitionsCount).toEqual(3);
  expect(tournamentEntryReport.eventsCount).toEqual(3);

  expect(
    tournamentEntryReport.nonParticipatingEntriesCount +
      participantEntryReports.length
  ).toEqual(participants.length);

  expect(participantEntryReports.length).toEqual(
    individualParticipantsWithEvents.length
  );

  // dummy condition
  if (!participantEntryReports.length) {
    console.log('STRUCTURE REPORT');
    console.log(utilities.JSON2CSV(structureReports));
    console.log('ENTRY STATUS REPORTS');
    console.log(utilities.JSON2CSV(entryStatusReports));
    console.log('PERSON ENTRY REPORTS');
    console.log(utilities.JSON2CSV(participantEntryReports));
  }

  expect(structureReports.map((r) => r.pctNoRating)).toEqual([0, 0, 100]);
  expect(Object.keys(structureReports[0]).sort()).toEqual([
    'ageCategoryCode',
    'avgConfidence',
    'avgWTN',
    'category',
    'categoryName',
    'districtCode',
    'drawId',
    'drawTieFormatDesc',
    'drawTieFormatName',
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
    'seedingBasis',
    'stage',
    'structureId',
    'tieFormatDesc',
    'tieFormatName',
    'tournamentId',
    'winningPerson2Id',
    'winningPerson2OtherId',
    'winningPerson2TennisId',
    'winningPerson2WTNconfidence',
    'winningPerson2WTNrating',
    'winningPersonId',
    'winningPersonOtherId',
    'winningPersonTennisId',
    'winningPersonWTNconfidence',
    'winningPersonWTNrating',
    'winningTeamId',
  ]);
  expect(Object.keys(entryStatusReports[0]).sort()).toEqual([
    'CONFIRMED_count',
    'CONFIRMED_pct',
    'DIRECT_ACCEPTANCE_count',
    'DIRECT_ACCEPTANCE_pct',
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
    instanceCount(
      participantEntryReports
        .map((r) => r.mainSeeding?.seedValue)
        .filter(Boolean)
    )
  ).toEqual({ 1: 4, 2: 4 });
  expect(Object.keys(participantEntryReports[0]).sort()).toEqual([
    'confidence',
    'drawId',
    'entryStage',
    'entryStatus',
    'eventId',
    'eventType',
    'mainSeeding',
    'participantId',
    'participantType',
    'personId',
    'personOtherId',
    'qualifyingSeeding',
    'ranking',
    'tennisId',
    'timeStamp',
    'tournamentId',
    'wtnRating',
  ]);
});
