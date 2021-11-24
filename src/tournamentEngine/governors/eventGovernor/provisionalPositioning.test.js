import tournamentEngine from '../../sync';
import { mocksEngine } from '../../..';

import { ROUND_ROBIN_WITH_PLAYOFF } from '../../../constants/drawDefinitionConstants';

test('provisional positioning', () => {
  const mockProfile = {
    drawProfiles: [
      { drawType: ROUND_ROBIN_WITH_PLAYOFF, drawSize: 16, completionGoal: 23 },
    ],
  };

  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord(mockProfile);

  tournamentEngine.setState(tournamentRecord);

  const matchUps = tournamentEngine.tournamentMatchUps();
  const upcomingMatchUps = matchUps.upcomingMatchUps;
  expect(upcomingMatchUps.length).toEqual(1);
  console.log(upcomingMatchUps[0]);
  const { matchUpId, containerStructureId } = upcomingMatchUps[0];
  const { outcome } = mocksEngine.generateOutcomeFromScoreString({
    scoreString: '7-5 7-5',
    winningSide: 1,
  });
  let result = tournamentEngine.setMatchUpStatus({
    matchUpId,
    outcome,
    drawId,
  });
  expect(result.success).toEqual(true);

  result = tournamentEngine.automatedPlayoffPositioning({
    // applyPositioning: false,
    structureId: containerStructureId,
    drawId,
  });
  expect(result.success).toEqual(true);

  console.log(result);
});

test.skip.each([
  { completionGoal: 23, playoffAssignmentsCount: 0 },
  { completionGoal: 24, playoffAssignmentsCount: 4 },
])(
  'round robin playoff structures are not generated if source structure is not complete',
  ({ completionGoal, playoffAssignmentsCount }) => {
    const mockProfile = {
      drawProfiles: [
        {
          drawType: ROUND_ROBIN_WITH_PLAYOFF,
          drawSize: 16,
          completionGoal,
        },
      ],
    };

    const { tournamentRecord } =
      mocksEngine.generateTournamentRecord(mockProfile);

    tournamentEngine.setState(tournamentRecord);

    const matchUps = tournamentEngine.tournamentMatchUps().completedMatchUps;
    expect(matchUps.length).toEqual(completionGoal);

    const assignedPositionsCount =
      tournamentRecord.events[0].drawDefinitions[0].structures[1].positionAssignments.filter(
        (assignment) => assignment.participantId || assignment.bye
      ).length;

    expect(assignedPositionsCount).toEqual(playoffAssignmentsCount);
  }
);
