import tournamentEngine from '../../sync';
import { mocksEngine } from '../../..';
import { expect, it } from 'vitest';

import { ROUND_ROBIN } from '../../../constants/drawDefinitionConstants';
import { COMPLETED } from '../../../constants/matchUpStatusConstants';
import { DOMINANT_DUO } from '../../../constants/tieFormatConstants';
import { TALLY } from '../../../constants/extensionConstants';
import { SINGLES } from '../../../constants/matchUpTypes';
import { TEAM } from '../../../constants/eventConstants';

/*
Geneate a ROUND_ROBIN in a TEAM event and complete singles tieMatchUps such that all teams are tied in all TEAM matchUps at 1-1
Demonstrate that tieMatchUps can be tallied
*/

it('handles TEAM ROUND_ROBIN tallyParticipants', () => {
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [
      {
        tieFormatName: DOMINANT_DUO,
        drawType: ROUND_ROBIN,
        eventType: TEAM,
        drawSize: 4,
      },
    ],
  });

  tournamentEngine.setState(tournamentRecord);

  const scoreStrings = [
    '6-0 6-0',
    '6-0 6-1',
    '6-0 6-2',
    '6-0 6-3',
    '6-0 6-4',
    '6-0 7-5',
    '6-1 6-1',
    '6-1 6-2',
    '6-1 6-3',
    '6-1 6-4',
    '6-1 7-5',
    '6-4 6-4',
  ];

  const { matchUps } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [TEAM] },
  });

  for (const matchUp of matchUps) {
    const singlesMatchUps = matchUp.tieMatchUps.filter(
      ({ matchUpType }) => matchUpType === SINGLES
    );
    singlesMatchUps.forEach((singlesMatchUp, i) => {
      const { outcome } = mocksEngine.generateOutcomeFromScoreString({
        scoreString: scoreStrings.pop(),
        matchUpStatus: COMPLETED,
        winningSide: i + 1,
      });

      const { matchUpId } = singlesMatchUp;
      const result = tournamentEngine.setMatchUpStatus({
        matchUpId,
        outcome,
        drawId,
      });
      expect(result.success).toEqual(true);
    });
  }

  const { drawDefinition } = tournamentEngine.getEvent({ drawId });
  const structureId = drawDefinition.structures[0].structureId;

  const { positionAssignments } = tournamentEngine.getPositionAssignments({
    drawDefinition,
    structureId,
  });

  const assignmentsWithTally = positionAssignments.filter(
    ({ extensions }) => extensions
  );
  expect(assignmentsWithTally.length).toEqual(4);

  assignmentsWithTally.forEach((assignment) => {
    expect(
      assignment.extensions.filter(({ name }) => name === TALLY).length
    ).toEqual(1);
  });

  const GEMscores = assignmentsWithTally
    .map((assignment) => {
      const { GEMscore, provisionalOrder } = assignment.extensions[0].value;
      return [GEMscore, provisionalOrder];
    })
    .sort((a, b) => a[1] - b[1]);

  expect(GEMscores).toEqual([
    [5000500051100000, 1],
    [5000500051000000, 2],
    [5000500050500000, 3],
    [5000500047300000, 4],
  ]);
});
