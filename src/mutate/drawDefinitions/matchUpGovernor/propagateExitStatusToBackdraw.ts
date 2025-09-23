import { getAllDrawMatchUps } from '@Query/matchUps/drawMatchUps';
import { getParticipantIdMatchUps } from '@Query/drawDefinition/participantIdMatchUps';
import { WALKOVER } from '@Constants/matchUpStatusConstants';
import { LOSER } from '@Constants/drawDefinitionConstants';
import { modifyMatchUpScore } from '@Mutate/matchUps/score/modifyMatchUpScore';

/**
 * Propagate exit status to backdraw and auto-advance opponent if required.
 * @param {Object} params
 * @param {Object} params.tournamentRecord
 * @param {Object} params.drawDefinition
 * @param {Object} params.matchUp - The main draw matchUp
 * @param {string} params.losingParticipantId
 * @param {string} params.matchUpStatus - The exit status (WALKOVER, RETIRED, etc)
 * @param {Object} params.event
 * @param {boolean} params.allowBackdrawParticipation - If true, do not auto-advance opponent
 */

export function propagateExitStatusToBackdraw({
  tournamentRecord,
  drawDefinition,
  losingParticipantId,
  matchUpStatus,
  event,
  allowBackdrawParticipation = false,
}) {
  // Use participant tracing to find the next matchUp for the loser via draw links
  const { participantIdMatchUps } = getParticipantIdMatchUps({
    tournamentParticipants: tournamentRecord?.participants,
    drawDefinition,
    event,
  });
  const matchUps = participantIdMatchUps[losingParticipantId] || [];
  // Find the most recent completed/active matchUp for the participant
  const lastMatchUp = matchUps
    .filter((m) => m.matchUpStatus)
    .sort((a, b) => (b.roundNumber || 0) - (a.roundNumber || 0))[0];
  if (!lastMatchUp) return;

  // Find the draw link for the loser from this matchUp's structure
  const structureId = lastMatchUp.structureId;
  const links = drawDefinition.links || [];
  const loserLinks = links.filter((link) => link.linkType === LOSER && link.source.structureId === structureId);
  if (!loserLinks.length) return;

  // For each loser link, find the target structure and round
  for (const link of loserLinks) {
    const targetStructureId = link.target.structureId;
    // Use all matchUps in the target structure
    const { matchUps: allMatchUps } = getAllDrawMatchUps({ drawDefinition, inContext: true, event }) || {};
    const candidateMatchUps = (allMatchUps || []).filter(
      (m) =>
        m.structureId === targetStructureId &&
        Array.isArray(m.sides) &&
        m.sides.some((s) => s.participantId === losingParticipantId),
    );
    for (const backdrawMatchUp of candidateMatchUps) {
      if (!Array.isArray(backdrawMatchUp.sides)) continue;
      // Set the status for the losing participant in the backdraw (per-side)
      const losingSideIndex = backdrawMatchUp.sides.findIndex((s) => s.participantId === losingParticipantId);
      if (losingSideIndex === -1) continue;
      // Mutate the side directly (in-memory)
      backdrawMatchUp.sides[losingSideIndex].matchUpStatus = matchUpStatus;
      // Also update the matchUp itself for legacy/compatibility
      modifyMatchUpScore({
        tournamentRecord,
        drawDefinition,
        matchUpId: backdrawMatchUp.matchUpId,
        matchUp: backdrawMatchUp,
        matchUpStatus,
        matchUpStatusCodes: [],
      });

      // Auto-advance opponent if not allowed to participate
      if (!allowBackdrawParticipation) {
        const opponentSideIndex = backdrawMatchUp.sides.findIndex(
          (s) => s.participantId !== losingParticipantId && s.participantId,
        );
        if (opponentSideIndex !== -1) {
          backdrawMatchUp.sides[opponentSideIndex].matchUpStatus = WALKOVER;
          modifyMatchUpScore({
            tournamentRecord,
            drawDefinition,
            matchUpId: backdrawMatchUp.matchUpId,
            matchUp: backdrawMatchUp,
            matchUpStatus: WALKOVER,
            matchUpStatusCodes: [],
            winningSide: opponentSideIndex + 1,
          });
        }
      }
    }
  }
}
