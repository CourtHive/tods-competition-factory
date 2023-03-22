import { getParticipantId } from '../../../global/functions/extractors';
import { generateTeamTournament } from './generateTestTeamTournament';
import { setDevContext } from '../../../global/state/globalState';
import tournamentEngine from '../../sync';
import { expect, test } from 'vitest';

import { INDIVIDUAL } from '../../../constants/participantConstants';
import { DOUBLES, SINGLES } from '../../../constants/matchUpTypes';

test('collection matchUps appear in participant reports', () => {
  const drawSize = 8;
  const { tournamentRecord, drawId } = generateTeamTournament({ drawSize });
  tournamentEngine.setState(tournamentRecord);

  let { drawDefinition } = tournamentEngine.getEvent({ drawId });
  const { positionAssignments } = drawDefinition.structures[0];

  const getTeamParticipants = (drawPositions = []) => {
    const teamParticipantIds = positionAssignments
      .filter(({ drawPosition }) => drawPositions.includes(drawPosition))
      .map(getParticipantId);

    const { tournamentParticipants: teamParticipants } =
      tournamentEngine.getTournamentParticipants({
        participantFilters: { participantIds: teamParticipantIds },
      });

    return teamParticipants;
  };

  let { matchUps: doublesMatchUps } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [DOUBLES] },
  });

  // create collectionAssignments for all doublesMatchUps
  doublesMatchUps.forEach((doublesMatchUp) => {
    let { drawPositions, matchUpId: doublesMatchUpId } = doublesMatchUp;
    const teamParticipants = getTeamParticipants(drawPositions);
    teamParticipants.forEach((teamParticipant) => {
      const individualParticipantIds =
        teamParticipant.individualParticipantIds.slice(0, 2);
      individualParticipantIds.forEach((individualParticipantId, i) => {
        const result = tournamentEngine.assignTieMatchUpParticipantId({
          participantId: individualParticipantId,
          tieMatchUpId: doublesMatchUpId,
          drawId,
        });
        expect(result.success).toEqual(true);
        expect(result.modifiedLineUp.length).toEqual(i + 1);
      });
    });
  });

  ({ matchUps: doublesMatchUps } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [DOUBLES] },
  }));

  doublesMatchUps.forEach(({ sides }) => {
    if (sides) {
      sides.forEach((side) => {
        if (side.participant) {
          expect(side.participant.individualParticipantIds.length).toEqual(2);
        }
      });
    }
  });

  let { matchUps: singlesMatchUps } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [SINGLES] },
  });

  const teamSinglesCount = {};

  // create collectionAssignments for all singlesMatchUps
  singlesMatchUps.forEach((singlesMatchUp) => {
    let { drawPositions, matchUpId: doublesMatchUpId } = singlesMatchUp;
    const teamParticipants = getTeamParticipants(drawPositions);
    teamParticipants.forEach((teamParticipant) => {
      const { participantId } = teamParticipant;

      if (!teamSinglesCount[participantId]) teamSinglesCount[participantId] = 0;
      const count = teamSinglesCount[participantId];

      const individualParticipantId =
        teamParticipant.individualParticipantIds.slice(count, count + 1)[0];
      teamSinglesCount[participantId] += 1;

      const result = tournamentEngine.assignTieMatchUpParticipantId({
        participantId: individualParticipantId,
        tieMatchUpId: doublesMatchUpId,
        drawId,
      });
      expect(result.success).toEqual(true);
    });
  });

  singlesMatchUps.forEach(({ sides }) => {
    if (sides) {
      sides.forEach((side) => {
        if (side.participant) {
          expect(side.participant.individualParticipantIds.length).toEqual(1);
        }
      });
    }
  });

  const { tournamentParticipants } = tournamentEngine.getTournamentParticipants(
    {
      participantFilters: { participantTypes: [INDIVIDUAL] },
      withGroupings: true,
      withMatchUps: true,
    }
  );
  expect(
    tournamentParticipants[0].draws[0].partnerParticipantIds.length
  ).toEqual(1);
  expect(
    tournamentParticipants[0].events[0].partnerParticipantIds.length
  ).toEqual(1);

  // check that the generated pairParticipant was used...
  // ...and that the intermediate pairParticipants (with one individualParticipantId), were deleted
  expect(tournamentParticipants[0].pairParticipantIds.length).toEqual(1);

  const { matchUps } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [DOUBLES] },
    tournamentRecord,
  });
  const placedParticipantIds = matchUps
    .map(({ sides }) => sides.map(({ participantId }) => participantId))
    .flat()
    .filter(Boolean);
  expect(placedParticipantIds.length).toEqual(drawSize);

  setDevContext({ ppp: true });
  const { tournamentParticipants: placedPairParticipants } =
    tournamentEngine.getTournamentParticipants({
      participantFilters: { participantIds: placedParticipantIds },
      withGroupings: true,
      withMatchUps: true,
    });

  expect(placedPairParticipants.length).toEqual(drawSize);

  // unless withTeamMatchUps, DOUBLES pairParticipants will only appear in DOUBLES matchUps
  placedPairParticipants.forEach((participant) => {
    expect(participant.matchUps.length).toEqual(1);
  });
});
