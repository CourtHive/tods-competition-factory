import { toBePlayed } from '../../../fixtures/scoring/outcomes/toBePlayed';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import {
  CONSOLATION,
  FIRST_MATCH_LOSER_CONSOLATION,
  MAIN,
} from '../../../constants/drawDefinitionConstants';
import { INDIVIDUAL } from '../../../constants/participantTypes';
import { SINGLES } from '../../../constants/eventConstants';
import {
  BYE,
  DEFAULTED,
  TO_BE_PLAYED,
  WALKOVER,
} from '../../../constants/matchUpStatusConstants';

tournamentEngine.devContext(true);

it('directs participant to FIRST_MATCH_LOSER_CONSOLATION consolation when walkover', () => {
  const participantsProfile = {
    participantsCount: 16,
    participantType: INDIVIDUAL,
  };
  const drawProfiles = [
    {
      drawSize: 16,
      eventType: SINGLES,
      participantsCount: 14,
      drawType: FIRST_MATCH_LOSER_CONSOLATION,
      outcomes: [
        {
          roundNumber: 1,
          roundPosition: 2,
          scoreString: '',
          matchUpStatus: WALKOVER,
          winningSide: 1,
        },
        {
          roundNumber: 2,
          roundPosition: 1,
          scoreString: '6-2 6-1',
          winningSide: 1,
        },
      ],
    },
  ];
  let {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    participantsProfile,
  });

  let result = tournamentEngine.setState(tournamentRecord);
  expect(result.success).toEqual(true);

  let { completedMatchUps, byeMatchUps } = tournamentEngine.drawMatchUps({
    drawId,
    inContext: true,
  });
  expect(completedMatchUps.length).toEqual(2);

  // target specific matchUp
  const targetMatchUp = byeMatchUps.find(
    ({ roundNumber, roundPosition, stage, stageSequence }) =>
      roundNumber === 1 &&
      roundPosition === 1 &&
      stage === CONSOLATION &&
      stageSequence === 1
  );
  expect(targetMatchUp.matchUpStatus).toEqual(BYE);

  const { drawDefinition } = tournamentEngine.getEvent({ drawId });
  const [mainStructure, consolationStructure] = drawDefinition.structures;
  const mainDrawPosition = mainStructure.positionAssignments.find(
    ({ drawPosition }) => drawPosition === 3
  );
  const consolationDrawPosition = consolationStructure.positionAssignments.find(
    ({ drawPosition }) => drawPosition === 5
  );

  expect(mainDrawPosition.participantId).not.toBeUndefined();
  expect(consolationDrawPosition.bye).toEqual(true);
});

it('correctly places consolation bye for winner of 2nd round match who had bye', () => {
  const participantsProfile = {
    participantsCount: 16,
    participantType: INDIVIDUAL,
  };
  const drawProfiles = [
    {
      drawSize: 16,
      eventType: SINGLES,
      participantsCount: 14,
      drawType: FIRST_MATCH_LOSER_CONSOLATION,
      outcomes: [
        {
          roundNumber: 1,
          roundPosition: 2,
          scoreString: '6-1 6-2',
          winningSide: 1,
        },
        {
          roundNumber: 2,
          roundPosition: 1,
          scoreString: '6-2 6-1',
          winningSide: 1,
        },
      ],
    },
  ];
  let {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    participantsProfile,
  });

  let result = tournamentEngine.setState(tournamentRecord);
  expect(result.success).toEqual(true);

  let { completedMatchUps, byeMatchUps } = tournamentEngine.drawMatchUps({
    drawId,
    inContext: true,
  });
  expect(completedMatchUps.length).toEqual(2);

  // target specific matchUp
  const targetMatchUp = byeMatchUps.find(
    ({ roundNumber, roundPosition, stage, stageSequence }) =>
      roundNumber === 1 &&
      roundPosition === 1 &&
      stage === CONSOLATION &&
      stageSequence === 1
  );
  expect(targetMatchUp.matchUpStatus).toEqual(BYE);

  const { drawDefinition } = tournamentEngine.getEvent({ drawId });
  const [mainStructure, consolationStructure] = drawDefinition.structures;
  const mainDrawPosition = mainStructure.positionAssignments.find(
    ({ drawPosition }) => drawPosition === 4
  );
  const consolationDrawPosition = consolationStructure.positionAssignments.find(
    ({ drawPosition }) => drawPosition === 6
  );

  expect(mainDrawPosition.participantId).toEqual(
    consolationDrawPosition.participantId
  );
});

it('correctly places consolation BYE for WALKOVER outcome 2nd round match with participant who had bye', () => {
  const participantsProfile = {
    participantsCount: 16,
    participantType: INDIVIDUAL,
  };
  const drawProfiles = [
    {
      drawSize: 16,
      eventType: SINGLES,
      participantsCount: 14,
      drawType: FIRST_MATCH_LOSER_CONSOLATION,
      outcomes: [
        {
          roundNumber: 1,
          roundPosition: 2,
          scoreString: '6-1 6-2',
          winningSide: 1,
        },
        {
          roundNumber: 2,
          roundPosition: 1,
          matchUpStatus: WALKOVER,
          winningSide: 1,
        },
      ],
    },
  ];
  let {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    participantsProfile,
  });

  let result = tournamentEngine.setState(tournamentRecord);
  expect(result.success).toEqual(true);

  let { matchUps } = tournamentEngine.allDrawMatchUps({
    drawId,
    inContext: true,
  });

  // target specific matchUp
  const targetMatchUp = matchUps.find(
    ({ roundNumber, roundPosition, stage, stageSequence }) =>
      roundNumber === 1 &&
      roundPosition === 1 &&
      stage === CONSOLATION &&
      stageSequence === 1
  );
  expect(targetMatchUp.matchUpStatus).toEqual(BYE);

  const { drawDefinition } = tournamentEngine.getEvent({ drawId });
  const [mainStructure, consolationStructure] = drawDefinition.structures;
  const mainDrawPosition = mainStructure.positionAssignments.find(
    ({ drawPosition }) => drawPosition === 2
  );
  const consolationDrawPosition = consolationStructure.positionAssignments.find(
    ({ drawPosition }) => drawPosition === 1
  );

  expect(mainDrawPosition.bye).toEqual(true);
  expect(consolationDrawPosition.participantId).toBeUndefined();
});

it('correctly places WALKOVER loser of 2nd round match who had bye into consolation', () => {
  const participantsProfile = {
    participantsCount: 16,
    participantType: INDIVIDUAL,
  };
  const drawProfiles = [
    {
      drawSize: 16,
      eventType: SINGLES,
      participantsCount: 14,
      drawType: FIRST_MATCH_LOSER_CONSOLATION,
      outcomes: [
        {
          roundNumber: 1,
          roundPosition: 2,
          scoreString: '6-1 6-2',
          winningSide: 1,
        },
        {
          roundNumber: 2,
          roundPosition: 1,
          matchUpStatus: WALKOVER,
          winningSide: 2,
        },
      ],
    },
  ];
  let {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    participantsProfile,
  });

  let result = tournamentEngine.setState(tournamentRecord);
  expect(result.success).toEqual(true);

  let { completedMatchUps, byeMatchUps } = tournamentEngine.drawMatchUps({
    drawId,
    inContext: true,
  });
  expect(completedMatchUps.length).toEqual(2);

  // target specific matchUp
  const targetMatchUp = byeMatchUps.find(
    ({ roundNumber, roundPosition, stage, stageSequence }) =>
      roundNumber === 1 &&
      roundPosition === 1 &&
      stage === CONSOLATION &&
      stageSequence === 1
  );
  expect(targetMatchUp.matchUpStatus).toEqual(BYE);

  const { drawDefinition } = tournamentEngine.getEvent({ drawId });
  const [mainStructure, consolationStructure] = drawDefinition.structures;
  const mainDrawPosition = mainStructure.positionAssignments.find(
    ({ drawPosition }) => drawPosition === 2
  );
  const consolationDrawPosition = consolationStructure.positionAssignments.find(
    ({ drawPosition }) => drawPosition === 1
  );

  expect(mainDrawPosition.bye).toEqual(true);
  expect(consolationDrawPosition.participantId).not.toBeUndefined();
});

it('correctly places WALKOVER loser of 2nd round match who had BYE into consolation', () => {
  const participantsProfile = {
    participantsCount: 16,
    participantType: INDIVIDUAL,
  };
  const drawProfiles = [
    {
      drawSize: 16,
      eventType: SINGLES,
      participantsCount: 14,
      drawType: FIRST_MATCH_LOSER_CONSOLATION,
      outcomes: [
        {
          roundNumber: 1,
          roundPosition: 2,
          matchUpStatus: WALKOVER,
          winningSide: 1,
        },
        {
          roundNumber: 2,
          roundPosition: 1,
          matchUpStatus: WALKOVER,
          winningSide: 2,
        },
      ],
    },
  ];
  let {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    participantsProfile,
  });

  let result = tournamentEngine.setState(tournamentRecord);
  expect(result.success).toEqual(true);

  let { completedMatchUps, byeMatchUps } = tournamentEngine.drawMatchUps({
    drawId,
    inContext: true,
  });
  expect(completedMatchUps.length).toEqual(2);

  // target specific matchUp
  const targetMatchUp = byeMatchUps.find(
    ({ roundNumber, roundPosition, stage, stageSequence }) =>
      roundNumber === 1 &&
      roundPosition === 1 &&
      stage === CONSOLATION &&
      stageSequence === 1
  );
  expect(targetMatchUp.matchUpStatus).toEqual(BYE);

  const { drawDefinition } = tournamentEngine.getEvent({ drawId });
  const [mainStructure, consolationStructure] = drawDefinition.structures;
  const mainDrawPosition = mainStructure.positionAssignments.find(
    ({ drawPosition }) => drawPosition === 2
  );
  const consolationDrawPosition = consolationStructure.positionAssignments.find(
    ({ drawPosition }) => drawPosition === 1
  );

  expect(mainDrawPosition.bye).toEqual(true);
  expect(consolationDrawPosition.participantId).not.toBeUndefined();
});

it('correctly places DEFAULTED loser of 2nd round match who had BYE into consolation', () => {
  const participantsProfile = {
    participantsCount: 16,
    participantType: INDIVIDUAL,
  };
  const drawProfiles = [
    {
      drawSize: 16,
      eventType: SINGLES,
      participantsCount: 14,
      drawType: FIRST_MATCH_LOSER_CONSOLATION,
      outcomes: [
        {
          roundNumber: 1,
          roundPosition: 2,
          matchUpStatus: DEFAULTED,
          winningSide: 1,
        },
        {
          roundNumber: 2,
          roundPosition: 1,
          matchUpStatus: DEFAULTED,
          winningSide: 2,
        },
      ],
    },
  ];
  let {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    participantsProfile,
  });

  let result = tournamentEngine.setState(tournamentRecord);
  expect(result.success).toEqual(true);

  let { completedMatchUps, byeMatchUps } = tournamentEngine.drawMatchUps({
    drawId,
    inContext: true,
  });
  expect(completedMatchUps.length).toEqual(2);

  // target specific matchUp
  let targetMatchUp = byeMatchUps.find(
    ({ roundNumber, roundPosition, stage, stageSequence }) =>
      roundNumber === 1 &&
      roundPosition === 1 &&
      stage === CONSOLATION &&
      stageSequence === 1
  );
  expect(targetMatchUp.matchUpStatus).toEqual(BYE);

  let { drawDefinition } = tournamentEngine.getEvent({ drawId });
  let [mainStructure, consolationStructure] = drawDefinition.structures;
  let mainDrawPosition = mainStructure.positionAssignments.find(
    ({ drawPosition }) => drawPosition === 2
  );
  let consolationDrawPosition = consolationStructure.positionAssignments.find(
    ({ drawPosition }) => drawPosition === 1
  );

  expect(mainDrawPosition.bye).toEqual(true);
  expect(consolationDrawPosition.participantId).not.toBeUndefined();

  // find 2nd round WALKOVER matchUp
  let matchUp = completedMatchUps.find(
    ({ roundNumber, roundPosition, stage, stageSequence }) =>
      roundNumber === 2 &&
      roundPosition === 1 &&
      stage === MAIN &&
      stageSequence === 1
  );
  expect(matchUp.matchUpStatus).toEqual(DEFAULTED);

  // remove outcome
  result = tournamentEngine.setMatchUpStatus({
    drawId,
    matchUpId: matchUp.matchUpId,
    outcome: toBePlayed,
  });
  expect(result.success).toEqual(true);

  const { matchUps } = tournamentEngine.allDrawMatchUps({
    drawId,
    inContext: true,
  });
  targetMatchUp = matchUps.find(
    ({ matchUpId }) => matchUp.matchUpId === matchUpId
  );
  expect(targetMatchUp.matchUpStatus).toEqual(TO_BE_PLAYED);
  expect(targetMatchUp.score.scoreStringSide1).toEqual('');
  expect(targetMatchUp.winningSide).toBeUndefined();

  ({ drawDefinition } = tournamentEngine.getEvent({ drawId }));
  consolationStructure = drawDefinition.structures[1];
  expect(consolationStructure.positionAssignments[0].bye).not.toEqual(true);
  expect(
    consolationStructure.positionAssignments[1].participantId
  ).toBeUndefined();
});
