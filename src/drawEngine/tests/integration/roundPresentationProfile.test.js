import { drawEngine } from '../../../drawEngine';
import { findStructure } from '../../getters/findStructure';
import { getAllStructureMatchUps } from '../../getters/getMatchUps';
// import { getRoundPresentationProfile } from '../../getters/getMatchUps/getRoundPresentationProfile';
import { generateDrawStructure } from '../primitives/generateDrawStructure';
import { completeMatchUp } from '../primitives/verifyMatchUps';

it('can reliably generate presentation profiles', () => {
  const { structureId } = generateDrawStructure({
    drawSize: 16,
    participantsCount: 16,
  });

  completeMatchUp({
    structureId,
    roundNumber: 1,
    roundPosition: 2,
    winningSide: 1,
    score: '6-1 6-2',
  });

  completeMatchUp({
    structureId,
    roundNumber: 1,
    roundPosition: 4,
    winningSide: 1,
    score: '6-1 6-4',
  });

  completeMatchUp({
    structureId,
    roundNumber: 1,
    roundPosition: 5,
    winningSide: 2,
    score: '6-1 7-5',
  });

  completeMatchUp({
    structureId,
    roundNumber: 1,
    roundPosition: 8,
    winningSide: 1,
    score: '6-1 7-6(8)',
  });

  const { roundPresentationProfile } = getPresentationProfile({ structureId });

  checkSide({
    profile: roundPresentationProfile,
    roundNumber: 2,
    roundPosition: 1,
    drawPosition: 3,
    score: '6-1 6-2',
  });

  checkSide({
    profile: roundPresentationProfile,
    roundNumber: 2,
    roundPosition: 2,
    drawPosition: 7,
    score: '6-1 6-4',
  });

  checkSide({
    profile: roundPresentationProfile,
    roundNumber: 2,
    roundPosition: 3,
    drawPosition: 10,
    score: '6-1 7-5',
  });

  checkSide({
    profile: roundPresentationProfile,
    roundNumber: 2,
    roundPosition: 4,
    drawPosition: 15,
    score: '6-1 7-6(8)',
  });
});

function getPresentationProfile({ structureId }) {
  const { drawDefinition } = drawEngine.getState();
  const { structure } = findStructure({ drawDefinition, structureId });
  const { matchUps } = getAllStructureMatchUps({
    drawDefinition,
    requireParticipants: false,
    inContext: true,
    structure,
  });
  return drawEngine.getRoundPresentationProfile({ matchUps });
}

function checkSide({
  profile,
  roundNumber,
  roundPosition,
  drawPosition,
  score,
}) {
  const side = profile[roundNumber - 1].matchUps[roundPosition - 1].sides.find(
    side => side?.drawPosition === drawPosition
  );
  expect(side?.sourceMatchUp?.score).toEqual(score);
}
