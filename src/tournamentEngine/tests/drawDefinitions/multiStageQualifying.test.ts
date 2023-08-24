import { isCompletedStructure } from '../../../drawEngine/governors/queryGovernor/structureActions';
import { getRoundMatchUps } from '../../../drawEngine/accessors/matchUpAccessor/getRoundMatchUps';
import { getPositionAssignments } from '../../../drawEngine/getters/positionsGetter';
import { getDrawStructures } from '../../../drawEngine/getters/findStructure';
import tournamentEngine from '../../sync';
import { mocksEngine } from '../../..';
import { expect, it } from 'vitest';

import fs from 'fs';

import POLICY_POSITION_ACTIONS_UNRESTRICTED from '../../../fixtures/policies/POLICY_POSITION_ACTIONS_UNRESTRICTED';
import {
  QUALIFYING_PARTICIPANT,
  ASSIGN_BYE,
  ADD_PENALTY,
  REMOVE_SEED,
  SEED_VALUE,
  SWAP_PARTICIPANTS,
  WITHDRAW_PARTICIPANT,
  REMOVE_ASSIGNMENT,
  ADD_NICKNAME,
} from '../../../constants/positionActionConstants';
import {
  DRAW,
  MAIN,
  QUALIFYING,
} from '../../../constants/drawDefinitionConstants';
import {
  COMPLETED,
  TO_BE_PLAYED,
} from '../../../constants/matchUpStatusConstants';

it('supports multi-sequence qualifying structures', () => {
  const drawProfiles = [
    {
      drawSize: 32,
      qualifyingProfiles: [
        {
          roundTarget: 1,
          structureProfiles: [
            { stageSequence: 1, drawSize: 32, qualifyingRoundNumber: 3 },
            { stageSequence: 2, drawSize: 16, qualifyingPositions: 4 },
          ],
        },
      ],
    },
  ];
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles,
  });

  tournamentEngine.setState(tournamentRecord);

  const { tournamentParticipants } =
    tournamentEngine.getTournamentParticipants();

  // if there are qualifiers then all participants are unique
  // 32 + 32 unique + 32 qualifying + 16 qualifying = 112
  expect(tournamentParticipants.length).toEqual(112);

  const { drawDefinition } = tournamentEngine.getEvent({ drawId });
  expect(drawDefinition.structures.length).toEqual(3);
  expect(drawDefinition.links.length).toEqual(2);

  const {
    structures: [mainStructure],
  } = getDrawStructures({ stage: MAIN, drawDefinition });

  const { positionAssignments } = getPositionAssignments({
    structure: mainStructure,
  });

  const qualifiersCount = positionAssignments?.filter(
    (assignment) => assignment.qualifier
  ).length;
  expect(qualifiersCount).toEqual(4);

  const {
    structures: [q1],
  } = getDrawStructures({
    stage: QUALIFYING,
    stageSequence: 1,
    drawDefinition,
  });
  const { positionAssignments: q1pa } = getPositionAssignments({
    structure: q1,
  });
  expect(q1pa?.length).toEqual(32);

  const q1positioned = q1pa?.filter((q) => q.participantId);
  expect(q1positioned?.length).toEqual(32);

  let { roundMatchUps } = getRoundMatchUps({ matchUps: q1.matchUps });
  let roundNumbers = roundMatchUps
    ? Object.keys(roundMatchUps).map((r) => parseInt(r))
    : [];
  let qualifyingRoundNumber = Math.max(...roundNumbers);
  expect(qualifyingRoundNumber).toEqual(3);

  const {
    structures: [q2],
  } = getDrawStructures({
    stage: QUALIFYING,
    stageSequence: 2,
    drawDefinition,
  });
  const { positionAssignments: q2pa } = getPositionAssignments({
    structure: q2,
  });
  expect(q2pa?.length).toEqual(16);
  const q2positioned = q2pa?.filter((q) => q.participantId);
  expect(q2positioned?.length).toEqual(12);

  ({ roundMatchUps } = getRoundMatchUps({ matchUps: q2.matchUps }));
  roundNumbers = roundMatchUps
    ? Object.keys(roundMatchUps).map((r) => parseInt(r))
    : [];
  qualifyingRoundNumber = Math.max(...roundNumbers);
  expect(qualifyingRoundNumber).toEqual(2);

  expect(q1.structureName).toEqual('QUALIFYING 1');
  expect(q2.structureName).toEqual('QUALIFYING 2');

  const firstLink = drawDefinition.links.find(
    (link) => link.source.structureId === q1.structureId
  );
  const secondLink = drawDefinition.links.find(
    (link) => link.source.structureId === q2.structureId
  );

  expect(firstLink.target.structureId).toEqual(q2.structureId);
  expect(secondLink.target.structureId).toEqual(mainStructure.structureId);

  expect(firstLink.source.roundNumber).toEqual(3);
  expect(secondLink.source.roundNumber).toEqual(2);

  expect(firstLink.target.roundNumber).toEqual(1);
  expect(secondLink.target.roundNumber).toEqual(1);
  expect(firstLink.target.feedProfile).toEqual(DRAW);
  expect(secondLink.target.feedProfile).toEqual(DRAW);

  const drawPosition = 1;
  const result = tournamentEngine.positionActions({
    policyDefinitions: POLICY_POSITION_ACTIONS_UNRESTRICTED,
    structureId: q1.structureId,
    drawPosition,
    drawId,
  });

  const validTypes = result.validActions.map(({ type }) => type).sort();

  // prettier-ignore
  expect(validTypes).toEqual([
    ASSIGN_BYE, ADD_NICKNAME, ADD_PENALTY,
    REMOVE_ASSIGNMENT, REMOVE_SEED, SEED_VALUE, SWAP_PARTICIPANTS, WITHDRAW_PARTICIPANT,
  ]);
});

it('can advance participants through multi-stage qualifying structures', () => {
  const drawProfiles = [
    {
      drawSize: 4,
      qualifyingProfiles: [
        {
          roundTarget: 1,
          structureProfiles: [
            { stageSequence: 1, drawSize: 4, qualifyingPositions: 2 },
            { stageSequence: 2, drawSize: 4, qualifyingPositions: 2 },
          ],
        },
      ],
    },
  ];
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    completeAllMatchUps: true,
    drawProfiles,
  });

  tournamentEngine.setState(tournamentRecord);

  const { drawDefinition } = tournamentEngine.getEvent({ drawId });
  expect(drawDefinition.structures.length).toEqual(3);
  expect(drawDefinition.links.length).toEqual(2);

  // expect all { stage: QUALIFYING, stageSequence: 1 } matchUps to be completed
  let { matchUps } = tournamentEngine.allTournamentMatchUps({
    contextFilters: { stages: [QUALIFYING], stageSequences: [1] },
    matchUpFilters: { matchUpStatuses: [COMPLETED] },
  });
  expect(matchUps.length).toEqual(2);

  const qualifying1 = drawDefinition.structures.find(
    ({ stage, stageSequence }) => stage === QUALIFYING && stageSequence === 1
  );
  const qualifying2 = drawDefinition.structures.find(
    ({ stage, stageSequence }) => stage === QUALIFYING && stageSequence === 2
  );

  const isCompleted = isCompletedStructure({
    structureId: qualifying1.structureId,
    drawDefinition,
  });
  expect(isCompleted).toEqual(true);

  // expect there to be two qualifying positions in QUALIFYING stageSequence: 2
  const { positionAssignments } = getPositionAssignments({
    structure: qualifying2,
  });
  const qualifyingPositions = positionAssignments
    ?.filter(({ qualifier }) => qualifier)
    .map(({ drawPosition }) => drawPosition);
  expect(qualifyingPositions?.length).toEqual(2);

  // first pop 2 then pop 1
  const expectations = [1, 2];

  // assign qualifiers in QUALIFYING stageSequence: 2
  for (const drawPosition of qualifyingPositions || []) {
    let result = tournamentEngine.positionActions({
      // policyDefinitions: POLICY_POSITION_ACTIONS_UNRESTRICTED,
      structureId: qualifying2.structureId,
      drawPosition,
      drawId,
    });
    const qualifyingAction = result.validActions.find(
      ({ type }) => type === QUALIFYING_PARTICIPANT
    );
    expect(qualifyingAction).not.toBeUndefined();

    const expectation = expectations.pop();
    expect(qualifyingAction.qualifyingParticipantIds.length).toEqual(
      expectation
    );

    const qualifyingParticipantId =
      qualifyingAction.qualifyingParticipantIds[0];
    const payload = { ...qualifyingAction.payload, qualifyingParticipantId };
    result = tournamentEngine[qualifyingAction.method](payload);
    expect(result.success).toEqual(true);
    expect(result.context.removedParticipantId).toBeUndefined();
  }

  // depdending on where the qualifiers are placed there could be 1 or 2 matchUps TO_BE_PLAYED
  matchUps = tournamentEngine.allTournamentMatchUps({
    contextFilters: { stages: [QUALIFYING], stageSequences: [2] },
    matchUpFilters: { matchUpStatuses: [TO_BE_PLAYED] },
  }).matchUps;

  expect(
    matchUps.map(({ winnerMatchUpId }) => winnerMatchUpId).filter(Boolean)
  ).toEqual([]);

  const readyToScore = matchUps.filter((matchUp) => matchUp.readyToScore);
  expect(readyToScore.length).toEqual(matchUps.length);

  // attempt to complete all matchUps in QUALIFYING stageSequence: 2
  // must use scoreString because test will not pass in the rare instance outcome id DEFAULT
  const { outcome } = mocksEngine.generateOutcomeFromScoreString({
    scoreString: '6-1 6-1',
    winningSide: 2,
  });
  for (const matchUp of readyToScore) {
    const result = tournamentEngine.setMatchUpStatus({
      matchUpId: matchUp.matchUpId,
      outcome,
      drawId,
    });
    expect(result.success).toEqual(true);
  }

  matchUps = tournamentEngine.allTournamentMatchUps({
    contextFilters: { stages: [QUALIFYING], stageSequences: [2] },
    matchUpFilters: { matchUpStatuses: [COMPLETED] },
  }).matchUps;

  expect(matchUps.length).toEqual(2);
});

it('will ignore winnerMatchUpId when feedProfile is DRAW', () => {
  const tournamentRecordJSON = fs.readFileSync(
    './src/global/testHarness/multiStageQualifying.tods.json',
    'utf-8'
  );

  const tournamentRecord = JSON.parse(tournamentRecordJSON);
  tournamentEngine.setState(tournamentRecord);

  const matchUps = tournamentEngine.allTournamentMatchUps({
    contextFilters: { stages: [QUALIFYING], stageSequences: [2] },
    matchUpFilters: { matchUpStatuses: [TO_BE_PLAYED] },
  }).matchUps;

  const readyToScore = matchUps.filter((matchUp) => matchUp.readyToScore);
  expect(readyToScore.length).toEqual(matchUps.length);

  const drawId = readyToScore[0].drawId;

  // must use scoreString because test will not pass in the rare instance outcome id DEFAULT
  const { outcome } = mocksEngine.generateOutcomeFromScoreString({
    scoreString: '6-1 6-1',
    winningSide: 2,
  });

  for (const matchUp of readyToScore) {
    const result = tournamentEngine.setMatchUpStatus({
      matchUpId: matchUp.matchUpId,
      outcome,
      drawId,
    });
    expect(result.success).toEqual(true);
  }
});

it('does what Jeff wants it to', () => {
  const drawProfiles = [
    {
      drawSize: 2,
      mathcUpType: 'DOUBLES',
      qualifyingProfiles: [
        {
          roundTarget: 1,
          structureProfiles: [
            {
              structureOptions: { groupSize: 8 },
              drawType: 'ROUND_ROBIN',
              qualifyingPositions: 2,
              stageSequence: 1,
              drawSize: 16,
            },
            {
              structureOptions: { groupSize: 6 },
              drawType: 'ROUND_ROBIN',
              qualifyingPositions: 2,
              stageSequence: 2,
              drawSize: 12,
            },
            {
              structureOptions: { groupSize: 10, groupSizeLimit: 10 },
              drawType: 'ROUND_ROBIN',
              qualifyingPositions: 2,
              stageSequence: 3,
              drawSize: 20,
            },
          ],
        },
      ],
    },
  ];
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles,
  });

  expect(tournamentRecord).not.toBeUndefined();

  tournamentEngine.setState(tournamentRecord);

  const { drawDefinition } = tournamentEngine.getEvent({ drawId });

  for (const structure of drawDefinition.structures) {
    if (structure.stage === QUALIFYING) {
      expect(structure.structures.length).toEqual(2);
      const { positionAssignments } = getPositionAssignments({ structure });
      const qualifyingPositionsCount = positionAssignments?.filter(
        ({ qualifier }) => qualifier
      ).length;
      const unassignedPositionsCount = positionAssignments?.filter(
        ({ qualifier, bye, participantId }) =>
          !qualifier && !bye && !participantId
      ).length;
      if (structure.stageSequence > 1) {
        expect(qualifyingPositionsCount).toEqual(2);
      }
      expect(unassignedPositionsCount).toEqual(0);
    }
  }
});
