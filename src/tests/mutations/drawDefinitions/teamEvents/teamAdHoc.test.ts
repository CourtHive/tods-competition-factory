import { generateDateRange } from '../../../../utilities/dateTime';
import { mocksEngine, tournamentEngine } from '../../../..';
import { queryEngine } from '../../../engines/queryEngine';
import { expect, it } from 'vitest';

import { DOMINANT_DUO } from '../../../../constants/tieFormatConstants';
import { AD_HOC } from '../../../../constants/drawDefinitionConstants';
import { TEAM } from '../../../../constants/eventConstants';

it('can assign participants to SINGLES/DOUBLES matchUps in TEAM AdHoc events', () => {
  const tournamentId = 't1';
  const venueId = 'v1';
  const eventId = 'd1';
  const drawId = 'd1';

  let result = mocksEngine.generateTournamentRecord({
    drawProfiles: [
      { drawId, drawSize: 6, eventType: TEAM, drawType: AD_HOC, eventId, tieFormatName: DOMINANT_DUO, idPrefix: 'mu' },
    ],
    participantsProfile: { idPrefix: 'participant' },
    tournamentAttributes: { tournamentId },
    setState: true,
  });
  expect(result.success).toEqual(true);

  result = queryEngine.getParticipants().participants;
  expect(result.length).toEqual(24);
  //prettier-ignore
  expect(result.map((p) => p.participantId)).toEqual([
    'participant-I-0', 'participant-I-1', 'participant-I-2', 'participant-I-3', 'participant-I-4',
    'participant-I-5', 'participant-I-6', 'participant-I-7', 'participant-I-8', 'participant-I-9',
    'participant-I-10', 'participant-I-11', 'participant-P-0', 'participant-P-1', 'participant-P-2',
    'participant-P-3', 'participant-P-4', 'participant-P-5', 'TEAM-participant-P-0', 'TEAM-participant-P-1',
    'TEAM-participant-P-2', 'TEAM-participant-P-3', 'TEAM-participant-P-4', 'TEAM-participant-P-5',
  ]);

  result = tournamentEngine.executionQueue([
    {
      method: 'drawMatic',
      params: {
        drawId,
        participantIds: [
          'TEAM-participant-P-0',
          'TEAM-participant-P-1',
          'TEAM-participant-P-2',
          'TEAM-participant-P-3',
          'TEAM-participant-P-4',
          'TEAM-participant-P-5',
        ],
        scaleAccessor: 'utrRating',
        scaleName: 'UTR',
      },
    },
    {
      method: 'addAdHocMatchUps',
      pipe: { matchUps: true },
      params: { drawId },
    },
    {
      method: 'addVenue',
      params: {
        venue: {
          venueName: 'Mock Facility',
          venueAbbreviation: 'MF',
          venueId,
        },
      },
    },
  ]);
  expect(result.results[0].success).toEqual(true);
  expect(result.results[1].success).toEqual(true);
  expect(result.results[2].success).toEqual(true);
  expect(result.success).toEqual(true);

  // unnecessary for the purpse of this test --------------------------------------------------------
  result = tournamentEngine.generateCourts({ count: 4, idPrefix: 'court' });
  expect(result.courts.length).toEqual(4);
  expect(result.success).toEqual(true);

  const {
    tournamentInfo: { startDate, endDate },
  } = tournamentEngine.getTournamentInfo();
  const datesCount = generateDateRange(startDate, endDate).length;
  expect(result.courts.every((court) => court.dateAvailability?.length === datesCount)).toEqual(true);

  result = tournamentEngine.modifyVenue({ venueId, modifications: { courts: result.courts } });
  expect(result.success).toEqual(true);
  // end unnecessary for the purpse of this test -----------------------------------------------------

  const { matchUps } = tournamentEngine.allTournamentMatchUps();
  console.log(matchUps[0].tieMatchUps.length);
  /*
  result = tournamentEngine.executionQueue([
    {
      method: 'assignTieMatchUpParticipantId',
      params: {
        drawId,
        participantId: '09863268-d87d-44da-9c34-e9f17bcf48ef',
        tieMatchUpId: '09eaf8cd-ca7f-4884-84f8-d10425c11df6',
        sideNumber: 1,
      },
    },
  ]);
  */
});
