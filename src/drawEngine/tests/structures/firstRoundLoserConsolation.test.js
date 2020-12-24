import drawEngine from '../../../drawEngine';
import tournamentEngine from '../../../tournamentEngine';
import { getDrawStructures } from '../../getters/findStructure';
import { generateTournament } from '../../../tournamentEngine/tests/primitives';
import {
  CONSOLATION,
  FIRST_ROUND_LOSER_CONSOLATION,
} from '../../../constants/drawDefinitionConstants';
import { SINGLES } from '../../../constants/eventConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { unique } from '../../../utilities';
import { BYE } from '../../../constants/matchUpStatusConstants';

it('correctly assigns BYE positions in consolation structure', () => {
  const drawSize = 32;
  const participantsCount = 17;
  const { participants, tournamentRecord } = generateTournament({
    participantsCount,
  });
  tournamentEngine.setState(tournamentRecord);

  const event = {
    eventName: 'Feed In Championship',
    eventType: SINGLES,
  };

  let result = tournamentEngine.addEvent({ event });
  const { event: createdEvent } = result;
  const { eventId } = createdEvent;

  const participantIds = participants.map((p) => p.participantId);
  result = tournamentEngine.addEventEntries({ eventId, participantIds });

  const { drawDefinition } = tournamentEngine.generateDrawDefinition({
    eventId,
    drawSize,
    matchUpFormat: 'SET3-S:6/TB7',
    drawType: FIRST_ROUND_LOSER_CONSOLATION,
  });
  result = tournamentEngine.addDrawDefinition({ eventId, drawDefinition });
  expect(result).toEqual(SUCCESS);

  drawEngine.setState(drawDefinition);

  const {
    structures: [consolationStructure],
  } = getDrawStructures({ drawDefinition, stage: CONSOLATION });

  const { roundMatchUps } = drawEngine.getRoundMatchUps(consolationStructure);

  // in this case there is only one participant going to the consolation structure
  // ... so all consolation matchUps have matchUpStatus: BYE
  Object.keys(roundMatchUps).forEach((roundNumber) => {
    const uniqueMatchUpStatuses = unique(
      roundMatchUps[roundNumber].map((matchUp) => matchUp.matchUpStatus)
    );
    expect(uniqueMatchUpStatuses.length).toEqual(1);
    expect(uniqueMatchUpStatuses[0]).toEqual(BYE);
  });
});
