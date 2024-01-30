import { generateDateRange } from '../../../../tools/dateTime';
import { mocksEngine, tournamentEngine } from '../../../..';
import { queryEngine } from '@Engines/queryEngine';
import { hav } from '../../../../tools/objects';
import { expect, it } from 'vitest';

import { ASSIGN_PARTICIPANT } from '../../../../constants/positionActionConstants';
import { DOMINANT_DUO } from '../../../../constants/tieFormatConstants';
import { AD_HOC } from '../../../../constants/drawDefinitionConstants';
import { TEAM } from '../../../../constants/eventConstants';
import { COMPLETED } from '../../../../constants/matchUpStatusConstants';

it('can assign participants to SINGLES/DOUBLES matchUps in TEAM AdHoc events', () => {
  const tournamentId = 't1';
  const venueId = 'v1';
  const eventId = 'e1';
  const drawId = 'd1';

  let result = mocksEngine.generateTournamentRecord({
    drawProfiles: [
      { drawId, drawSize: 6, eventType: TEAM, drawType: AD_HOC, eventId, tieFormatName: DOMINANT_DUO, idPrefix: 'mu' },
    ],
    participantsProfile: { idPrefix: 'ptcpt' },
    tournamentAttributes: { tournamentId },
    setState: true,
  });
  expect(result.success).toEqual(true);

  result = queryEngine.getParticipants().participants;
  expect(result.length).toEqual(24);
  //prettier-ignore
  expect(result.map((p) => p.participantId)).toEqual([
    'ptcpt-I-0', 'ptcpt-I-1', 'ptcpt-I-2', 'ptcpt-I-3', 'ptcpt-I-4', 'ptcpt-I-5', 'ptcpt-I-6',
    'ptcpt-I-7', 'ptcpt-I-8', 'ptcpt-I-9', 'ptcpt-I-10', 'ptcpt-I-11', 'ptcpt-P-0', 'ptcpt-P-1',
    'ptcpt-P-2', 'ptcpt-P-3', 'ptcpt-P-4', 'ptcpt-P-5', 'TEAM-ptcpt-P-0', 'TEAM-ptcpt-P-1',
    'TEAM-ptcpt-P-2', 'TEAM-ptcpt-P-3', 'TEAM-ptcpt-P-4', 'TEAM-ptcpt-P-5',
  ]);

  result = tournamentEngine.executionQueue([
    {
      method: 'drawMatic',
      params: {
        drawId,
        participantIds: [
          'TEAM-ptcpt-P-0',
          'TEAM-ptcpt-P-1',
          'TEAM-ptcpt-P-2',
          'TEAM-ptcpt-P-3',
          'TEAM-ptcpt-P-4',
          'TEAM-ptcpt-P-5',
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

  const tieMatchUpId = 'd1-ah-1-0-e1-COL-2-TMU-1';

  result = tournamentEngine.matchUpActions({
    matchUpId: tieMatchUpId,
    sideNumber: 1,
    tournamentId,
    eventId,
    drawId,
  });

  expect(result.validActions.find((x) => x.type === ASSIGN_PARTICIPANT).availableParticipants.length).toEqual(2);

  const participantId = 'ptcpt-I-0';
  result = tournamentEngine.executionQueue([
    {
      method: 'assignTieMatchUpParticipantId',
      params: {
        participantId,
        sideNumber: 1,
        tieMatchUpId,
        drawId: 'd1',
      },
    },
  ]);
  expect(result.success).toEqual(true);

  result = tournamentEngine.findMatchUp({ matchUpId: tieMatchUpId }); // resolve by brute force, inContext by default
  expect(result.matchUp.sides.find(hav({ sideNumber: 1 })).participant.participantId).toEqual(participantId);

  const side2participantId = 'ptcpt-I-8';
  result = tournamentEngine.executionQueue([
    {
      method: 'assignTieMatchUpParticipantId',
      params: {
        participantId: side2participantId,
        tieMatchUpId,
        sideNumber: 2,
        drawId,
      },
    },
  ]);
  expect(result.success).toEqual(true);

  result = tournamentEngine.findMatchUp({ matchUpId: tieMatchUpId }); // resolve by brute force, inContext by default
  expect(result.matchUp.sides.find(hav({ sideNumber: 2 })).participant.participantId).toEqual(side2participantId);

  const { outcome } = mocksEngine.generateOutcomeFromScoreString({
    scoreString: '6-1 6-2',
    winningSide: 1,
  });
  result = tournamentEngine.setMatchUpStatus({
    matchUpId: tieMatchUpId,
    outcome,
    drawId,
  });
  expect(result.success).toEqual(true);

  result = tournamentEngine.findMatchUp({ matchUpId: tieMatchUpId }); // resolve by brute force, inContext by default
  expect(result.matchUp.matchUpStatus).toEqual(COMPLETED);
});
