import { tournamentEngine } from '../..';
import { drawEngine } from '../../../drawEngine';

import { generateTournamentWithParticipants } from '../../../mocksEngine/generators/generateTournamentWithParticipants';
import { getAppliedPolicies } from '../../../drawEngine/governors/policyGovernor/getAppliedPolicies';
import { parseScoreString } from '../../../mocksEngine/utilities/parseScoreString';

import { resultConstants } from '../../../constants/resultConstants';
import { eventConstants } from '../../../constants/eventConstants';

import { MISSING_ASSIGNMENTS } from '../../../constants/errorConditionConstants';

import ITF_SEEDING_POLICY from '../../../fixtures/seeding/SEEDING_ITF';

const { SINGLES } = eventConstants;
const { SUCCESS } = resultConstants;

it('can generate a tournament with events and draws', () => {
  const { tournamentRecord } = generateTournamentWithParticipants({
    startDate: '2020-01-01',
    endDate: '2020-01-06',
    participantsCount: 32,
  });
  const { participants } = tournamentRecord;

  tournamentEngine.setState(tournamentRecord);

  const event = {
    eventName: 'Test Event',
    eventType: SINGLES,
  };

  let result = tournamentEngine.addEvent({ event });
  const { event: eventResult, success } = result;
  const { eventId } = eventResult;
  expect(success).toEqual(true);

  const participantIds = participants.map((p) => p.participantId);
  result = tournamentEngine.addEventEntries({ eventId, participantIds });
  expect(result).toEqual(SUCCESS);

  const values = {
    automated: true,
    drawSize: 32,
    eventId,
    seedsCount: 8,
    event: eventResult,
    policyDefinitions: [ITF_SEEDING_POLICY],
  };
  const { drawDefinition } = tournamentEngine.generateDrawDefinition(values);
  const { drawId } = drawDefinition;

  result = tournamentEngine.addDrawDefinition({ eventId, drawDefinition });
  expect(result).toEqual(SUCCESS);

  drawEngine.setState(drawDefinition);

  const { extensions } = drawDefinition;
  expect(extensions.length).toEqual(3);
  const { appliedPolicies } = getAppliedPolicies({ drawDefinition });
  expect(appliedPolicies.seeding.policyName).toEqual('ITF');

  // find main structureId more intelligently
  const mainStructureId = drawDefinition.structures[0].structureId;

  const { seedAssignments } = drawEngine.getStructureSeedAssignments({
    structureId: mainStructureId,
  });
  expect(seedAssignments.length).toEqual(8);

  result = tournamentEngine.assignSeedPositions({
    structureId: mainStructureId,
    eventId,
    drawId,
  });
  expect(result?.error).toEqual(MISSING_ASSIGNMENTS);

  const { positionAssignments } = drawDefinition.structures[0];
  function getPositionParticipantId(drawPosition) {
    const targetAssignment = positionAssignments.find(
      (assignment) => assignment.drawPosition === drawPosition
    );
    return targetAssignment?.participantId;
  }

  let assignments = [
    { seedNumber: 1, seedValue: 1, participantId: getPositionParticipantId(1) },
  ];
  result = tournamentEngine.assignSeedPositions({
    structureId: mainStructureId,
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
    structureId: mainStructureId,
    assignments,
    eventId,
    drawId,
  });
  expect(result?.error).not.toBeUndefined();

  const { upcomingMatchUps } = tournamentEngine.tournamentMatchUps();

  const matchUp = upcomingMatchUps[0];
  const { matchUpId } = matchUp;
  const matchUpFormat = 'SET1-S:T10';
  result = tournamentEngine.setMatchUpStatus({
    drawId,
    matchUpId,
    matchUpFormat,
  });
  const {
    upcomingMatchUps: modifiedUpcoming,
  } = tournamentEngine.tournamentMatchUps();
  const modifiedMatchUp = modifiedUpcoming[0];
  expect(modifiedMatchUp.matchUpId).toEqual(matchUpId);
  expect(modifiedMatchUp.matchUpFormat).toEqual(matchUpFormat);

  const secondMatchUpFormat = 'SET3-S:T10';
  const sets = parseScoreString({ scoreString: '6-3' });
  const score = { sets };
  result = tournamentEngine.setMatchUpStatus({
    drawId,
    matchUpId,
    matchUpFormat: secondMatchUpFormat,
    outcome: { score },
  });
  expect(result.success).toEqual(true);

  const { matchUps } = tournamentEngine.allTournamentMatchUps();
  const targetMatchUp = matchUps.find(
    (matchUp) => matchUp.matchUpId === matchUpId
  );
  expect(targetMatchUp.matchUpFormat).toEqual(secondMatchUpFormat);
  const expectedScore = Object.assign({}, score, {
    scoreStringSide1: '6-3',
    scoreStringSide2: '3-6',
  });
  expect(targetMatchUp.score).toEqual(expectedScore);
  expect(targetMatchUp.winningSide).toBeUndefined();
});

it('can set tournament names', () => {
  let result = tournamentEngine.newTournamentRecord();
  expect(result?.success).toEqual(true);

  const tournamentName = 'CourtHive Challenge';
  result = tournamentEngine.setTournamentName({
    name: tournamentName,
    tournamentName,
  });
  expect(result?.success).toEqual(true);

  let { tournamentRecord } = tournamentEngine.getState();
  expect(tournamentRecord.name).toEqual(tournamentName);

  result = tournamentEngine.setTournamentName({ formalName: tournamentName });
  expect(result?.success).toEqual(true);

  ({ tournamentRecord } = tournamentEngine.getState());
  expect(tournamentRecord.formalName).toBeUndefined();

  result = tournamentEngine.setTournamentName({ formalName: 'Formal Name' });
  expect(result?.success).toEqual(true);

  ({ tournamentRecord } = tournamentEngine.getState());
  expect(tournamentRecord.formalName).toEqual('Formal Name');

  result = tournamentEngine.setTournamentName({
    promotionalName: tournamentName,
  });
  expect(result?.success).toEqual(true);

  ({ tournamentRecord } = tournamentEngine.getState());
  expect(tournamentRecord.promotionalName).toBeUndefined();

  result = tournamentEngine.setTournamentName({
    formalName: 'Promotional Name',
  });
  expect(result?.success).toEqual(true);

  ({ tournamentRecord } = tournamentEngine.getState());
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

  const { tournamentRecord } = tournamentEngine.getState();
  expect(tournamentRecord.tournamentCategories.length).toEqual(3);
});
