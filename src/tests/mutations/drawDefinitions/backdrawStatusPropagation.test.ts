import { expect, it, describe } from 'vitest';
import mocksEngine from '@Assemblies/engines/mock';
import { getParticipantIdMatchUps } from '@Query/drawDefinition/participantIdMatchUps';
import { tournamentEngine } from '../../../'

import {
  FEED_IN_CHAMPIONSHIP,
  FIRST_MATCH_LOSER_CONSOLATION,
  COMPASS,
  LOSER,
  WINNER,
} from '@Constants/drawDefinitionConstants';
import {
  RETIRED,
  WALKOVER,
  DEFAULTED,
  COMPLETED,
} from '@Constants/matchUpStatusConstants';

describe('propagateExitStatusToBackdraw', () => {
  describe('FEED_IN_CHAMPIONSHIP propagation', () => {
    it('propagates WALKOVER status to backdraw and advances opponent', () => {
      const mockProfile = {
        drawProfiles: [
          {
            drawType: FEED_IN_CHAMPIONSHIP,
            drawSize: 16,
            participantsCount: 16,
          },
        ],
      };
      const { tournamentRecord } = mocksEngine.generateTournamentRecord(mockProfile);
      tournamentEngine.setState(tournamentRecord);

      // Get main draw first round matchUps
      const mainMatchUps = tournamentEngine.allTournamentMatchUps({
        contextFilters: { roundNumbers: [1], stages: ['MAIN'] },
      }).matchUps;
      const firstMatchUp = mainMatchUps[0];
      const { matchUpId, drawId } = firstMatchUp;
      const losingParticipantId = firstMatchUp.sides[0].participantId;

      // Set the matchUp status to WALKOVER with the specified participant as the loser
      const outcome = {
        score: {
            scoreStringSide1: '',
            scoreStringSide2: '',
        },
        matchUpStatus: WALKOVER,
        winningSide: 2,
      };
      const result = tournamentEngine.setMatchUpStatus({
        matchUpId,
        drawId,
        outcome,
        propagateExitStatusToBackdraw: true,
      });
      expect(result.success).toEqual(true);

      // Re-fetch all matchUps for updated state
      const updatedMatchUps = tournamentEngine.allTournamentMatchUps().matchUps;
      // Find the backdraw matchUp for the losing participant
      const backdrawMatchUp = updatedMatchUps.find(
        m => m.structureId !== firstMatchUp.structureId &&
             m.sides.some(s => s.participantId === losingParticipantId)
      );

      const updatedMainDrawMatchUp = tournamentEngine.allTournamentMatchUps({
        contextFilters: { roundNumbers: [1], stages: ['MAIN'] },
      }).matchUps?.find( m =>
             m.sides.some(s => s.participantId === losingParticipantId));

      expect(backdrawMatchUp).toBeDefined();
      const losingSide = backdrawMatchUp.sides.find(s => s.participantId === losingParticipantId);
      expect(losingSide.matchUpStatus).toEqual(WALKOVER);
      const opponentSide = backdrawMatchUp.sides.find(s => s.participantId !== losingParticipantId);
      expect(opponentSide.matchUpStatus).toEqual(WINNER);
      expect(backdrawMatchUp.winningSide).toBeDefined();
      expect(backdrawMatchUp.matchUpStatus).toEqual(COMPLETED);
    });
    
//     it('propagates RETIRED status to backdraw and advances opponent', () => {
//       const mockProfile = {
//         drawProfiles: [
//           {
//             drawType: FEED_IN_CHAMPIONSHIP,
//             drawSize: 16,
//             participantsCount: 16,
//           },
//         ],
//       };
      
//       const { tournamentRecord } = mocksEngine.generateTournamentRecord(mockProfile);
//       tournamentEngine.setState(tournamentRecord);
      
//       // Get main draw first round matchUps
//       let { matchUps } = tournamentEngine.allTournamentMatchUps({
//         contextFilters: { roundNumbers: [1], stages: ['MAIN'] },
//       });
      
//       const firstMatchUp = matchUps[0];
//       const { matchUpId, drawId } = firstMatchUp;
//       const losingParticipantId = firstMatchUp.sides[0].participantId;
      
//       // Set the matchUp status to RETIRED with the specified participant as the loser
//       const outcome = {
//         matchUpStatus: RETIRED,
//         winningSide: 2, // Side 1 is the loser (RETIRED)
//         score: {
//           sets: [
//             { side1Score: 6, side2Score: 4, winningSide: 1 },
//             { side1Score: 2, side2Score: 6, winningSide: 2 },
//             { side1Score: 0, side2Score: 3 }
//           ],
//           scoreStringSide1: '6-4 2-6 0-3',
//           scoreStringSide2: '4-6 6-2 3-0'
//         }
//       };
      
//       const result = tournamentEngine.setMatchUpStatus({
//         matchUpId,
//         drawId,
//         outcome,
//         propagateExitStatusToBackdraw: true, // Enable propagation
//       });
      
//       expect(result.success).toEqual(true);
      
//       // Now find the backdraw matchUp where the losing participant should appear
//       const { drawDefinition } = tournamentEngine.getEvent({ drawId });
//       const { participantIdMatchUps } = getParticipantIdMatchUps({
//         tournamentParticipants: tournamentRecord.participants,
//         drawDefinition,
//       });
      
//       const participantMatchUps = participantIdMatchUps[losingParticipantId] || [];
//       const backdrawMatchUp = participantMatchUps.find(
//         (m) => m.structureId !== firstMatchUp.structureId
//       );
      
//       // Verify the backdraw matchUp has the correct status
//       expect(backdrawMatchUp).toBeDefined();
//       expect(backdrawMatchUp.sides.find(s => s.participantId === losingParticipantId).matchUpStatus).toEqual(RETIRED);
      
//       // Find the other side in the backdraw matchUp (the opponent)
//       const opponentSide = backdrawMatchUp.sides.find(s => s.participantId !== losingParticipantId);
      
//       // Verify the opponent has been advanced with WALKOVER status
//       expect(opponentSide.matchUpStatus).toEqual(WINNER);
//       expect(backdrawMatchUp.winningSide).toBeDefined();
//       expect(backdrawMatchUp.matchUpStatus).toEqual(COMPLETED);
//     });

//     it('propagates DEFAULTED status to backdraw and advances opponent', () => {
//       const mockProfile = {
//         drawProfiles: [
//           {
//             drawType: FEED_IN_CHAMPIONSHIP,
//             drawSize: 16,
//             participantsCount: 16,
//           },
//         ],
//       };
      
//       const { tournamentRecord } = mocksEngine.generateTournamentRecord(mockProfile);
//       tournamentEngine.setState(tournamentRecord);
      
//       // Get main draw first round matchUps
//       let { matchUps } = tournamentEngine.allTournamentMatchUps({
//         contextFilters: { roundNumbers: [1], stages: ['MAIN'] },
//       });
      
//       const firstMatchUp = matchUps[0];
//       const { matchUpId, drawId } = firstMatchUp;
//       const losingParticipantId = firstMatchUp.sides[0].participantId;
      
//       // Set the matchUp status to DEFAULTED with the specified participant as the loser
//       const outcome = {
//         matchUpStatus: DEFAULTED,
//         winningSide: 2, // Side 1 is the loser (DEFAULTED)
//       };
      
//       const result = tournamentEngine.setMatchUpStatus({
//         matchUpId,
//         drawId,
//         outcome,
//         propagateExitStatusToBackdraw: true, // Enable propagation
//       });
      
//       expect(result.success).toEqual(true);
      
//       // Now find the backdraw matchUp where the losing participant should appear
//       const { drawDefinition } = tournamentEngine.getEvent({ drawId });
//       const { participantIdMatchUps } = getParticipantIdMatchUps({
//         tournamentParticipants: tournamentRecord.participants,
//         drawDefinition,
//       });
      
//       const participantMatchUps = participantIdMatchUps[losingParticipantId] || [];
//       const backdrawMatchUp = participantMatchUps.find(
//         (m) => m.structureId !== firstMatchUp.structureId
//       );
      
//       // Verify the backdraw matchUp has the correct status
//       expect(backdrawMatchUp).toBeDefined();
//       expect(backdrawMatchUp.sides.find(s => s.participantId === losingParticipantId).matchUpStatus).toEqual(DEFAULTED);
      
//       // Find the other side in the backdraw matchUp (the opponent)
//       const opponentSide = backdrawMatchUp.sides.find(s => s.participantId !== losingParticipantId);
      
//       // Verify the opponent has been advanced with WALKOVER status
//       expect(opponentSide.matchUpStatus).toEqual(WINNER);
//       expect(backdrawMatchUp.winningSide).toBeDefined();
//       expect(backdrawMatchUp.matchUpStatus).toEqual(COMPLETED);
//     });
//   });

//   describe('FIRST_MATCH_LOSER_CONSOLATION propagation', () => {
//     it('propagates WALKOVER status to backdraw and advances opponent', () => {
//       const mockProfile = {
//         drawProfiles: [
//           {
//             drawType: FIRST_MATCH_LOSER_CONSOLATION,
//             drawSize: 16,
//             participantsCount: 16,
//           },
//         ],
//       };
      
//       const { tournamentRecord } = mocksEngine.generateTournamentRecord(mockProfile);
//       tournamentEngine.setState(tournamentRecord);
      
//       // Get main draw first round matchUps
//       let { matchUps } = tournamentEngine.allTournamentMatchUps({
//         contextFilters: { roundNumbers: [1], stages: ['MAIN'] },
//       });
      
//       const firstMatchUp = matchUps[0];
//       const { matchUpId, drawId } = firstMatchUp;
//       const losingParticipantId = firstMatchUp.sides[0].participantId;
      
//       // Set the matchUp status to WALKOVER with the specified participant as the loser
//       const outcome = {
//         matchUpStatus: WALKOVER,
//         winningSide: 2, // Side 1 is the loser (WALKOVER)
//       };
      
//       const result = tournamentEngine.setMatchUpStatus({
//         matchUpId,
//         drawId,
//         outcome,
//         propagateExitStatusToBackdraw: true, // Enable propagation
//       });
      
//       expect(result.success).toEqual(true);
      
//       // Now find the backdraw matchUp where the losing participant should appear
//       const { drawDefinition } = tournamentEngine.getEvent({ drawId });
//       const { participantIdMatchUps } = getParticipantIdMatchUps({
//         tournamentParticipants: tournamentRecord.participants,
//         drawDefinition,
//       });
      
//       const participantMatchUps = participantIdMatchUps[losingParticipantId] || [];
//       const backdrawMatchUp = participantMatchUps.find(
//         (m) => m.structureId !== firstMatchUp.structureId
//       );
      
//       // Verify the backdraw matchUp has the correct status
//       expect(backdrawMatchUp).toBeDefined();
//       expect(backdrawMatchUp.sides.find(s => s.participantId === losingParticipantId).matchUpStatus).toEqual(WALKOVER);
      
//       // Find the other side in the backdraw matchUp (the opponent)
//       const opponentSide = backdrawMatchUp.sides.find(s => s.participantId !== losingParticipantId);
      
//       // Verify the opponent has been advanced with WALKOVER status
//       expect(opponentSide.matchUpStatus).toEqual(WINNER);
//       expect(backdrawMatchUp.winningSide).toBeDefined();
//       expect(backdrawMatchUp.matchUpStatus).toEqual(COMPLETED);
//     });
//   });

//   describe('COMPASS propagation', () => {
//     it('propagates exit status to backdraw for COMPASS draws', () => {
//       const mockProfile = {
//         drawProfiles: [
//           {
//             drawType: COMPASS,
//             drawSize: 16,
//             participantsCount: 16,
//           },
//         ],
//       };
      
//       const { tournamentRecord } = mocksEngine.generateTournamentRecord(mockProfile);
//       tournamentEngine.setState(tournamentRecord);
      
//       // Get East (main) draw first round matchUps
//       let { matchUps } = tournamentEngine.allTournamentMatchUps({
//         contextFilters: { roundNumbers: [1], structureNames: ['East'] },
//       });
      
//       const firstMatchUp = matchUps[0];
//       const { matchUpId, drawId } = firstMatchUp;
//       const losingParticipantId = firstMatchUp.sides[0].participantId;
      
//       // Set the matchUp status to WALKOVER with the specified participant as the loser
//       const outcome = {
//         matchUpStatus: WALKOVER,
//         winningSide: 2, // Side 1 is the loser (WALKOVER)
//       };
      
//       const result = tournamentEngine.setMatchUpStatus({
//         matchUpId,
//         drawId,
//         outcome,
//         propagateExitStatusToBackdraw: true, // Enable propagation
//       });
      
//       expect(result.success).toEqual(true);
      
//       // Now find the West matchUp (first backdraw) where the losing participant should appear
//       const { drawDefinition } = tournamentEngine.getEvent({ drawId });
      
//       // Check links to verify the loser goes to West
//       const links = drawDefinition.links || [];
//       const loserLinks = links.filter(link => link.linkType === LOSER);
//       expect(loserLinks.length).toBeGreaterThan(0);
      
//       // Get the participant's backdraw matchUp
//       const { participantIdMatchUps } = getParticipantIdMatchUps({
//         tournamentParticipants: tournamentRecord.participants,
//         drawDefinition,
//       });
      
//       const participantMatchUps = participantIdMatchUps[losingParticipantId] || [];
//       const backdrawMatchUp = participantMatchUps.find(
//         (m) => m.structureId !== firstMatchUp.structureId
//       );
      
//       // Verify the backdraw matchUp has the correct status
//       expect(backdrawMatchUp).toBeDefined();
//       expect(backdrawMatchUp.sides.find(s => s.participantId === losingParticipantId).matchUpStatus).toEqual(WALKOVER);
      
//       // Find the other side in the backdraw matchUp (the opponent)
//       const opponentSide = backdrawMatchUp.sides.find(s => s.participantId !== losingParticipantId);
      
//       // Verify the opponent has been advanced with WALKOVER status
//       expect(opponentSide.matchUpStatus).toEqual(WINNER);
//       expect(backdrawMatchUp.winningSide).toBeDefined();
//       expect(backdrawMatchUp.matchUpStatus).toEqual(COMPLETED);
//     });
//   });

//   describe('Option to allow backdraw participation', () => {
//     it('does not auto-advance opponent when allowBackdrawParticipation is true', () => {
//       const mockProfile = {
//         drawProfiles: [
//           {
//             drawType: FEED_IN_CHAMPIONSHIP,
//             drawSize: 16,
//             participantsCount: 16,
//           },
//         ],
//       };
      
//       const { tournamentRecord } = mocksEngine.generateTournamentRecord(mockProfile);
//       tournamentEngine.setState(tournamentRecord);
      
//       // Get main draw first round matchUps
//       let { matchUps } = tournamentEngine.allTournamentMatchUps({
//         contextFilters: { roundNumbers: [1], stages: ['MAIN'] },
//       });
      
//       const firstMatchUp = matchUps[0];
//       const { matchUpId, drawId } = firstMatchUp;
//       const losingParticipantId = firstMatchUp.sides[0].participantId;
      
//       // Set the matchUp status to WALKOVER with the specified participant as the loser
//       // and allow backdraw participation
//       const outcome = {
//         matchUpStatus: WALKOVER,
//         winningSide: 2, // Side 1 is the loser (WALKOVER)
//       };
      
//       const result = tournamentEngine.setMatchUpStatus({
//         matchUpId,
//         drawId,
//         outcome,
//         propagateExitStatusToBackdraw: true,
//         allowBackdrawParticipation: true, // Allow the player to participate in backdraw
//       });
      
//       expect(result.success).toEqual(true);
      
//       // Now find the backdraw matchUp where the losing participant should appear
//       const { drawDefinition } = tournamentEngine.getEvent({ drawId });
//       const { participantIdMatchUps } = getParticipantIdMatchUps({
//         tournamentParticipants: tournamentRecord.participants,
//         drawDefinition,
//       });
      
//       const participantMatchUps = participantIdMatchUps[losingParticipantId] || [];
//       const backdrawMatchUp = participantMatchUps.find(
//         (m) => m.structureId !== firstMatchUp.structureId
//       );
      
//       // Verify the backdraw matchUp has the correct status for the losing side
//       expect(backdrawMatchUp).toBeDefined();
//       expect(backdrawMatchUp.sides.find(s => s.participantId === losingParticipantId).matchUpStatus).toEqual(WALKOVER);
      
//       // Find the other side in the backdraw matchUp (the opponent)
//       const opponentSide = backdrawMatchUp.sides.find(s => s.participantId !== losingParticipantId);
      
//       // Verify the opponent has NOT been advanced (no matchUpStatus)
//       expect(opponentSide.matchUpStatus).toBeUndefined();
//       expect(backdrawMatchUp.winningSide).toBeUndefined();
//       expect(backdrawMatchUp.matchUpStatus).not.toEqual(COMPLETED);
//     });
//   });

//   describe('Assignment of new opposition participant', () => {
//     it('auto-advances opposition participant when added to a match with carried-over status', () => {
//       const mockProfile = {
//         drawProfiles: [
//           {
//             drawType: FEED_IN_CHAMPIONSHIP,
//             drawSize: 16,
//             participantsCount: 15, // One less to create a BYE
//           },
//         ],
//       };
      
//       const { tournamentRecord } = mocksEngine.generateTournamentRecord(mockProfile);
//       tournamentEngine.setState(tournamentRecord);
      
//       // Get main draw first round matchUps
//       let { matchUps } = tournamentEngine.allTournamentMatchUps({
//         contextFilters: { roundNumbers: [1], stages: ['MAIN'] },
//       });
      
//       const firstMatchUp = matchUps[0];
//       const { matchUpId, drawId } = firstMatchUp;
//       const losingParticipantId = firstMatchUp.sides[0].participantId;
      
//       // Set the matchUp status to WALKOVER with the specified participant as the loser
//       const outcome = {
//         matchUpStatus: WALKOVER,
//         winningSide: 2, // Side 1 is the loser (WALKOVER)
//       };
      
//       let result = tournamentEngine.setMatchUpStatus({
//         matchUpId,
//         drawId,
//         outcome,
//         propagateExitStatusToBackdraw: true,
//       });
      
//       expect(result.success).toEqual(true);
      
//       // Now find the backdraw matchUp where the losing participant should appear
//       const { drawDefinition } = tournamentEngine.getEvent({ drawId });
//       const { participantIdMatchUps } = getParticipantIdMatchUps({
//         tournamentParticipants: tournamentRecord.participants,
//         drawDefinition,
//       });
      
//       const participantMatchUps = participantIdMatchUps[losingParticipantId] || [];
//       const backdrawMatchUp = participantMatchUps.find(
//         (m) => m.structureId !== firstMatchUp.structureId
//       );
      
//       expect(backdrawMatchUp).toBeDefined();
//       expect(backdrawMatchUp.sides.find(s => s.participantId === losingParticipantId).matchUpStatus).toEqual(WALKOVER);
      
//       // Create a new participant
//       const newParticipant = {
//         participantRole: 'PLAYER',
//         person: {
//           standardFamilyName: 'Doe',
//           standardGivenName: 'John',
//         },
//       };
      
//       result = tournamentEngine.addParticipant({ participant: newParticipant });
//       expect(result.success).toEqual(true);
      
//       const { participantId: newParticipantId } = result;
      
//       // Assign the new participant as the opponent in the backdraw matchUp
//       const opponentSideNumber = backdrawMatchUp.sides.find(s => !s.participantId)?.sideNumber || 
//                                 backdrawMatchUp.sides.find(s => s.participantId !== losingParticipantId)?.sideNumber;
      
//       result = tournamentEngine.assignParticipant({
//         participantId: newParticipantId,
//         drawId,
//         matchUpId: backdrawMatchUp.matchUpId,
//         sideNumber: opponentSideNumber,
//       });
      
//       expect(result.success).toEqual(true);
      
//       // Verify that the newly assigned participant is automatically advanced
//       const updatedMatchUps = tournamentEngine.allTournamentMatchUps().matchUps;
//       const updatedBackdrawMatchUp = updatedMatchUps.find(m => m.matchUpId === backdrawMatchUp.matchUpId);
      
//       // Find the side with the new participant
//       const newParticipantSide = updatedBackdrawMatchUp.sides.find(s => s.participantId === newParticipantId);
//       expect(newParticipantSide).toBeDefined();
//       expect(newParticipantSide.matchUpStatus).toEqual(WINNER);
      
//       // The matchUp should be completed with the new participant as the winner
//       expect(updatedBackdrawMatchUp.matchUpStatus).toEqual(COMPLETED);
//       expect(updatedBackdrawMatchUp.winningSide).toEqual(opponentSideNumber);
//     });
//   });

//   describe('Default behavior (propagation disabled)', () => {
//     it('does not propagate status when propagateExitStatusToBackdraw is false', () => {
//       const mockProfile = {
//         drawProfiles: [
//           {
//             drawType: FEED_IN_CHAMPIONSHIP,
//             drawSize: 16,
//             participantsCount: 16,
//           },
//         ],
//       };
      
//       const { tournamentRecord } = mocksEngine.generateTournamentRecord(mockProfile);
//       tournamentEngine.setState(tournamentRecord);
      
//       // Get main draw first round matchUps
//       let { matchUps } = tournamentEngine.allTournamentMatchUps({
//         contextFilters: { roundNumbers: [1], stages: ['MAIN'] },
//       });
      
//       const firstMatchUp = matchUps[0];
//       const { matchUpId, drawId } = firstMatchUp;
//       const losingParticipantId = firstMatchUp.sides[0].participantId;
      
//       // Set the matchUp status to WALKOVER without enabling propagation (default behavior)
//       const outcome = {
//         matchUpStatus: WALKOVER,
//         winningSide: 2, // Side 1 is the loser (WALKOVER)
//       };
      
//       const result = tournamentEngine.setMatchUpStatus({
//         matchUpId,
//         drawId,
//         outcome,
//         // propagateExitStatusToBackdraw is not set, should default to false
//       });
      
//       expect(result.success).toEqual(true);
      
//       // Now find the backdraw matchUp where the losing participant should appear
//       const { drawDefinition } = tournamentEngine.getEvent({ drawId });
//       const { participantIdMatchUps } = getParticipantIdMatchUps({
//         tournamentParticipants: tournamentRecord.participants,
//         drawDefinition,
//       });
      
//       const participantMatchUps = participantIdMatchUps[losingParticipantId] || [];
//       const backdrawMatchUp = participantMatchUps.find(
//         (m) => m.structureId !== firstMatchUp.structureId
//       );
      
//       // Verify the backdraw matchUp does NOT have the WALKOVER status
//       expect(backdrawMatchUp).toBeDefined();
//       const losingSide = backdrawMatchUp.sides.find(s => s.participantId === losingParticipantId);
//       expect(losingSide.matchUpStatus).toBeUndefined(); // Status should not be propagated
//     });

//     it('explicitly sets propagateExitStatusToBackdraw to false', () => {
//       const mockProfile = {
//         drawProfiles: [
//           {
//             drawType: FEED_IN_CHAMPIONSHIP,
//             drawSize: 16,
//             participantsCount: 16,
//           },
//         ],
//       };
      
//       const { tournamentRecord } = mocksEngine.generateTournamentRecord(mockProfile);
//       tournamentEngine.setState(tournamentRecord);
      
//       // Get main draw first round matchUps
//       let { matchUps } = tournamentEngine.allTournamentMatchUps({
//         contextFilters: { roundNumbers: [1], stages: ['MAIN'] },
//       });
      
//       const firstMatchUp = matchUps[0];
//       const { matchUpId, drawId } = firstMatchUp;
//       const losingParticipantId = firstMatchUp.sides[0].participantId;
      
//       // Set the matchUp status to WALKOVER without enabling propagation (explicit)
//       const outcome = {
//         matchUpStatus: WALKOVER,
//         winningSide: 2, // Side 1 is the loser (WALKOVER)
//       };
      
//       const result = tournamentEngine.setMatchUpStatus({
//         matchUpId,
//         drawId,
//         outcome,
//         propagateExitStatusToBackdraw: false, // Explicitly disabled
//       });
      
//       expect(result.success).toEqual(true);
      
//       // Now find the backdraw matchUp where the losing participant should appear
//       const { drawDefinition } = tournamentEngine.getEvent({ drawId });
//       const { participantIdMatchUps } = getParticipantIdMatchUps({
//         tournamentParticipants: tournamentRecord.participants,
//         drawDefinition,
//       });
      
//       const participantMatchUps = participantIdMatchUps[losingParticipantId] || [];
//       const backdrawMatchUp = participantMatchUps.find(
//         (m) => m.structureId !== firstMatchUp.structureId
//       );
      
//       // Verify the backdraw matchUp does NOT have the WALKOVER status
//       expect(backdrawMatchUp).toBeDefined();
//       const losingSide = backdrawMatchUp.sides.find(s => s.participantId === losingParticipantId);
//       expect(losingSide.matchUpStatus).toBeUndefined(); // Status should not be propagated
//     });
  });
});
