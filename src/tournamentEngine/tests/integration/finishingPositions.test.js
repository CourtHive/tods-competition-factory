import { tournamentRecordWithParticipants } from '../primitives/generateTournament';
import { tournamentEngine } from '../../../tournamentEngine';
import { drawEngine } from '../../../drawEngine';

import ITF_SEEDING_POLICY from '../../../fixtures/seeding/SEEDING_ITF';
import { eventConstants } from '../../../constants/eventConstants';
import { resultConstants } from '../../../constants/resultConstants';
import { getAppliedPolicies } from '../../../drawEngine/governors/policyGovernor/getAppliedPolicies';
import { MISSING_ASSIGNMENTS } from '../../../constants/errorConditionConstants';

const { SINGLES } = eventConstants;
const { SUCCESS } = resultConstants;

it('can aggrgate participant finishingPositions', () => {
  const { tournamentRecord, participants } = tournamentRecordWithParticipants({
    participantsCount: 14,
  });

  tournamentEngine.setState(tournamentRecord);

  const event = {
    eventName: 'Test Event',
    eventType: SINGLES,
  };

  let result = tournamentEngine.addEvent({ event });
  const { event: eventResult, success } = result;
  const { eventId } = eventResult;
  expect(success).toEqual(true);

  const participantIds = participants.map(p => p.participantId);
  result = tournamentEngine.addEventEntries({ eventId, participantIds });
  expect(result).toEqual(SUCCESS);

  const values = {
    automated: true,
    drawSize: 16,
    eventId,
    seedsCount: 4,
    event: eventResult,
    policyDefinitions: [ITF_SEEDING_POLICY],
  };
  const { drawDefinition } = tournamentEngine.generateDrawDefinition(values);
  const { drawId } = drawDefinition;

  result = tournamentEngine.addDrawDefinition({ eventId, drawDefinition });
  expect(result).toEqual(SUCCESS);

  drawEngine.setState(drawDefinition);

  const { extensions } = drawDefinition;
  expect(extensions.length).toEqual(1);
  const { appliedPolicies } = getAppliedPolicies({ drawDefinition });
  expect(appliedPolicies.seeding.policyName).toEqual('ITF');

  // find main structureId more intelligently
  const mainStructureId = drawDefinition.structures[0].structureId;

  const { seedAssignments } = drawEngine.getStructureSeedAssignments({
    structureId: mainStructureId,
  });
  expect(seedAssignments.length).toEqual(4);

  result = tournamentEngine.assignSeedPositions({
    structureId: mainStructureId,
    eventId,
    drawId,
  });
  expect(result?.error).toEqual(MISSING_ASSIGNMENTS);

  const { matchUps } = tournamentEngine.allTournamentMatchUps();

  const outcomes = [
    [1, 2, 1],
    [1, 3, 2],
    [1, 4, 2],
    [1, 5, 1],
    [1, 6, 2],
    [1, 7, 1],
    [2, 1, 1],
    [2, 2, 1],
    [2, 3, 2],
    [2, 4, 2],
    [3, 1, 1],
    [3, 2, 1],
    [4, 1, 1],
  ];

  outcomes.forEach(outcome => {
    const [roundNumber, roundPosition, winningSide] = outcome;
    scoreMatchUp({
      roundNumber,
      roundPosition,
      matchUps,
      winningSide,
      drawId,
    });
  });

  result = tournamentEngine.getParticipantIdFinishingPositions({
    drawId,
  });

  console.log(result);
});

function scoreMatchUp({
  roundNumber,
  roundPosition,
  matchUps,
  drawId,
  winningSide,
}) {
  const matchUp = matchUps.find(
    matchUp =>
      matchUp.roundNumber === roundNumber &&
      matchUp.roundPosition === roundPosition
  );
  const { matchUpId } = matchUp || {};
  const result = tournamentEngine.setMatchUpStatus({
    drawId,
    matchUpId,
    outcome: { winningSide },
  });
  expect(result).toEqual(SUCCESS);
}
