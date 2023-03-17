import drawEngine from '../../../drawEngine/sync';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';
import { expect, it } from 'vitest';

import { QUALIFYING_PARTICIPANT } from '../../../constants/positionActionConstants';
import { MAIN } from '../../../constants/drawDefinitionConstants';
import { TO_BE_PLAYED } from '../../../constants/matchUpStatusConstants';

it('can generate and seed a qualifying structure', () => {
  let {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [
      {
        drawSize: 16,
        qualifyingProfiles: [
          {
            structureProfiles: [
              {
                qualifyingPositions: 4,
                drawSize: 8,
              },
            ],
          },
        ],
      },
    ],
    completeAllMatchUps: true,
  });

  let result = tournamentEngine.setState(tournamentRecord);
  expect(result.success).toEqual(true);

  let { drawDefinition } = tournamentEngine.getEvent({ drawId });
  const mainStructureId = drawDefinition.structures.find(
    ({ stage }) => stage === MAIN
  ).structureId;

  const { positionAssignments } = tournamentEngine.getPositionAssignments({
    structureId: mainStructureId,
    drawId,
  });

  const qualifyingDrawPositions = positionAssignments
    .filter(({ qualifier }) => qualifier)
    .map(({ drawPosition }) => drawPosition);

  // assign all qualifiers to main structure positions
  for (const drawPosition of qualifyingDrawPositions) {
    let result = tournamentEngine.positionActions({
      structureId: mainStructureId,
      drawPosition,
      drawId,
    });
    let qualifyingAction = result.validActions.find(
      ({ type }) => type === QUALIFYING_PARTICIPANT
    );
    const qualifyingParticipantId =
      qualifyingAction.qualifyingParticipantIds[0];
    const payload = { ...qualifyingAction.payload, qualifyingParticipantId };
    result = tournamentEngine[qualifyingAction.method](payload);
    expect(result.success).toEqual(true);
  }

  // complete all remaining matchUps
  let incompleteMatchUps = tournamentEngine.allDrawMatchUps({
    matchUpFilters: { matchUpStatuses: [TO_BE_PLAYED] },
    drawId,
  }).matchUps;

  let safety = incompleteMatchUps.length;
  while (incompleteMatchUps.length && safety) {
    const { roundProfile } = drawEngine.getRoundMatchUps({
      matchUps: incompleteMatchUps,
    });
    const minRound = Math.min(...Object.keys(roundProfile));
    const matchUp = incompleteMatchUps.find(
      ({ roundNumber }) => roundNumber === minRound
    );

    let { outcome } = mocksEngine.generateOutcome();
    result = tournamentEngine.setMatchUpStatus({
      matchUpId: matchUp.matchUpId,
      outcome,
      drawId,
    });
    expect(result.success).toEqual(true);

    incompleteMatchUps = tournamentEngine.allDrawMatchUps({
      matchUpFilters: { matchUpStatuses: [TO_BE_PLAYED] },
      drawId,
    }).matchUps;
    safety -= 1;
  }
  expect(incompleteMatchUps.length).toEqual(0);

  let tournamentParticipants = tournamentEngine.getTournamentParticipants({
    convertExtensions: true,
    withStatistics: true,
    withOpponents: true,
    withGroupings: true,
    withMatchUps: true,
    withSeeding: true,
    inContext: true,
    withDraws: true,
    participantFilters: {
      participantRoles: ['COMPETITOR'],
    },
  }).tournamentParticipants;

  const mmw = tournamentParticipants.find((p) => {
    const stages = p.matchUps.map((m) => m.stage);
    return stages.includes('MAIN') && stages.includes('QUALIFYING');
  });
  expect(mmw.matchUps.length >= 2).toEqual(true);

  let p = tournamentEngine.getParticipants({
    withDraws: true,
  }).participants;

  const pwd = p.find((x) => x.participantId === mmw.participantId);
  expect(mmw.draws.length).toEqual(1);
  expect(pwd.draws.length).toEqual(mmw.draws.length);
});
