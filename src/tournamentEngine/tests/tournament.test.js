import { tournamentRecordWithParticipants } from './primitives/generateTournament';
import { tournamentEngine } from '../../tournamentEngine';
import { drawEngine } from '../../drawEngine';

import ITF_SEEDING_POLICY from '../../fixtures/SEEDING_ITF';
import { eventConstants } from '../../constants/eventConstants';
import { resultConstants } from '../../constants/resultConstants';
import { getAppliedPolicies } from '../../drawEngine/governors/policyGovernor/getAppliedPolicies';

const { SINGLES } = eventConstants;
const { SUCCESS } = resultConstants;

it('can generate a tournament with events and draws', () => {
  const { tournamentRecord, participants } = tournamentRecordWithParticipants({
    startDate: '2020-01-01',
    endDate: '2020-01-06',
    participantsCount: 32,
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
    drawSize: 32,
    eventId,
    seedsCount: 8,
    event: eventResult,
    seedingPolicy: ITF_SEEDING_POLICY,
  };
  const { drawDefinition } = tournamentEngine.generateDrawDefinition(values);
  const { drawId } = drawDefinition;

  result = tournamentEngine.addDrawDefinition({ eventId, drawDefinition });
  expect(result).toEqual(SUCCESS);

  drawEngine.setState(drawDefinition);

  const { extensions } = drawDefinition;
  expect(extensions.length).toEqual(1);
  const { appliedPolicies } = getAppliedPolicies({ drawDefinition });
  expect(appliedPolicies.seeding.policyType).toEqual('ITF');

  const structureSeedAssignments = drawEngine.getSeedAssignments();
  const { seedAssignments } = structureSeedAssignments[0];
  expect(structureSeedAssignments.length).toEqual(1);
  expect(seedAssignments.length).toEqual(8);

  result = tournamentEngine.assignSeedPositions({
    eventId,
    drawId,
  });
  expect(result?.error).toEqual('Missing assignments');

  const { positionAssignments } = drawDefinition.structures[0];
  function getPositionParticipantId(drawPosition) {
    const targetAssignment = positionAssignments.find(
      assignment => assignment.drawPosition === drawPosition
    );
    return targetAssignment?.participantId;
  }

  let assignments = [
    { seedNumber: 1, seedValue: 1, participantId: getPositionParticipantId(1) },
  ];
  result = tournamentEngine.assignSeedPositions({
    assignments,
    eventId,
    drawId,
  });
  expect(result?.success).toEqual(true);

  // drawPositions are already assigned, so drawPosition 2 is not valid for 1st seed

  assignments = [
    { seedNumber: 1, seedValue: 1, participantId: getPositionParticipantId(2) },
  ];
  result = tournamentEngine.assignSeedPositions({
    assignments,
    eventId,
    drawId,
  });
  expect(result?.error).not.toBeUndefined();
});

it('can set tournament names', () => {
  let result = tournamentEngine.newTournamentRecord();
  expect(result?.success).toEqual(true);

  const tournamentName = 'CourtHive Challenge';
  result = tournamentEngine.setTournamentName({ name: tournamentName });
  expect(result?.success).toEqual(true);

  let tournamentRecord = tournamentEngine.getState();
  expect(tournamentRecord.name).toEqual(tournamentName);

  result = tournamentEngine.setTournamentName({ formalName: tournamentName });
  expect(result?.success).toEqual(true);

  tournamentRecord = tournamentEngine.getState();
  expect(tournamentRecord.formalName).toBeUndefined();

  result = tournamentEngine.setTournamentName({ formalName: 'Formal Name' });
  expect(result?.success).toEqual(true);

  tournamentRecord = tournamentEngine.getState();
  expect(tournamentRecord.formalName).toEqual('Formal Name');

  result = tournamentEngine.setTournamentName({
    promotionalName: tournamentName,
  });
  expect(result?.success).toEqual(true);

  tournamentRecord = tournamentEngine.getState();
  expect(tournamentRecord.promotionalName).toBeUndefined();

  result = tournamentEngine.setTournamentName({
    formalName: 'Promotional Name',
  });
  expect(result?.success).toEqual(true);

  tournamentRecord = tournamentEngine.getState();
  expect(tournamentRecord.formalName).toEqual('Promotional Name');
});

it('can set tournament categories', () => {
  let result = tournamentEngine.newTournamentRecord();
  expect(result?.success).toEqual(true);

  const categories = [
    {
      categoryName: 'U18',
      type: eventConstants.AGE,
    },
    {
      categoryName: 'U16',
      type: eventConstants.AGE,
    },
    {
      categoryName: 'WTN',
      type: eventConstants.RATING,
    },
    {
      categoryName: 'FAILURE',
    },
  ];
  result = tournamentEngine.setTournamentCategories({ categories });
  expect(result?.success).toEqual(true);

  const tournamentRecord = tournamentEngine.getState();
  expect(tournamentRecord.tournamentCategories.length).toEqual(3);
});
