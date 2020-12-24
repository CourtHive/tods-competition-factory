import drawEngine from '../../../drawEngine';
import tournamentEngine from '../../../tournamentEngine';
import { getDrawStructures } from '../../getters/findStructure';
import { generateTournament } from '../../../mocksEngine/generators/generateTournament';
import {
  CONSOLATION,
  FEED_IN_CHAMPIONSHIP,
} from '../../../constants/drawDefinitionConstants';
import { SINGLES } from '../../../constants/eventConstants';
import { SUCCESS } from '../../../constants/resultConstants';
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
    drawType: FEED_IN_CHAMPIONSHIP,
  });
  result = tournamentEngine.addDrawDefinition({ eventId, drawDefinition });
  expect(result).toEqual(SUCCESS);

  drawEngine.setState(drawDefinition);

  const {
    structures: [consolationStructure],
  } = getDrawStructures({ drawDefinition, stage: CONSOLATION });

  const { roundMatchUps } = drawEngine.getRoundMatchUps(consolationStructure);
  const round1ByeCount = roundMatchUps[1].map(
    (matchUp) => matchUp.matchUpStatus === BYE
  ).length;
  expect(round1ByeCount).toEqual(8);
  const round2ByeCount = roundMatchUps[2].map(
    (matchUp) => matchUp.matchUpStatus === BYE
  ).length;
  expect(round2ByeCount).toEqual(8);
});
