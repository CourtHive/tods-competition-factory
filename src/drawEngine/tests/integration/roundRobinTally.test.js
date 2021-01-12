import drawEngine from '../..';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../../tournamentEngine';

import { ROUND_ROBIN } from '../../../constants/drawDefinitionConstants';
import { SINGLES } from '../../../constants/eventConstants';
import { FORMAT_STANDARD } from '../../../fixtures/scoring/matchUpFormats/formatConstants';

it('properly orders round robin participants', () => {
  const drawProfiles = [
    {
      drawSize: 3,
      eventType: SINGLES,
      participantsCount: 3,
      matchUpFormat: FORMAT_STANDARD,
      drawType: ROUND_ROBIN,
      outcomes: [
        {
          roundNumber: 1,
          structureIndex: 1,
          scoreString: '6-2 6-2',
          matchUpFormat: FORMAT_STANDARD,
          winningSide: 1,
        },
        {
          roundNumber: 2,
          structureIndex: 1,
          scoreString: '6-2 6-2',
          matchUpFormat: FORMAT_STANDARD,
          winningSide: 2,
        },
        {
          roundNumber: 3,
          structureIndex: 1,
          scoreString: '6-2 3-6 [10-3]',
          matchUpFormat: FORMAT_STANDARD,
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
  });
  tournamentEngine.setState(tournamentRecord);

  const { drawDefinition } = tournamentEngine.getEvent({ drawId });
  const { matchUps } = tournamentEngine.allDrawMatchUps({
    drawId,
    inContext: true,
  });
  const mainStructure = drawDefinition.structures[0];

  mainStructure.structures.forEach((structure) => {
    const { structureId } = structure;

    const structureMatchUps = matchUps.filter(
      (matchUp) => matchUp.structureId === structureId
    );
    const matchUpFormat = structureMatchUps.find(
      ({ matchUpFormat }) => matchUpFormat
    )?.matchUpFormat;

    const { participantResults } = drawEngine.tallyParticipantResults({
      matchUps: structureMatchUps,
      matchUpFormat,
    });

    Object.values(participantResults).forEach((result) => {
      expect(isNaN(result.gamesWon)).toEqual(false);
      expect(isNaN(result.matchUpsWon)).toEqual(false);
      expect(isNaN(result.matchUpsLost)).toEqual(false);
      expect(isNaN(result.matchUpsCancelled)).toEqual(false);
      expect(isNaN(result.setsWon)).toEqual(false);
      expect(isNaN(result.setsLost)).toEqual(false);
      expect(isNaN(result.gamesWon)).toEqual(false);
      expect(isNaN(result.gamesLost)).toEqual(false);
      expect(isNaN(result.pointsWon)).toEqual(false);
      expect(isNaN(result.pointsLost)).toEqual(false);
      expect(isNaN(result.setsRatio)).toEqual(false);
      expect(isNaN(result.matchUpsRatio)).toEqual(false);
      expect(isNaN(result.gamesRatio)).toEqual(false);
      expect(isNaN(result.gamesDifference)).toEqual(false);
      expect(isNaN(result.pointsRatio)).toEqual(false);
      expect(isNaN(result.groupOrder)).toEqual(false);
      expect(isNaN(result.pointsOrder)).toEqual(false);
    });
  });
});
