import { getRoundMatchUps } from '../../accessors/matchUpAccessor/getRoundMatchUps';
import { makeDeepCopy } from '../../../utilities';

/**
 *
 * @param {boolean} isRoundRobin - flag to determine whether to generate for round robin or elimination structure
 * @param {object[]} matchUps - inContext matchUp objects, generally provided by getAllStructureMatchUps()
 *
 */
export function getRoundPresentationProfile({ isRoundRobin, matchUps }) {
  let roundPresentationProfile = {};
  const { roundMatchUps, roundProfile } = getRoundMatchUps({ matchUps });
  if (isRoundRobin) {
    console.log('round robin');
  } else {
    roundPresentationProfile = generateEliminationPresentationProfile({
      roundMatchUps,
      roundProfile,
    });
  }

  return { roundPresentationProfile };
}

function generateEliminationPresentationProfile({
  roundMatchUps,
  roundProfile,
}) {
  let feedTop = true;

  const roundNumbers = Object.keys(roundMatchUps).map((roundNumber) =>
    parseInt(roundNumber)
  );
  const firstRoundMatchUpsCount = roundMatchUps[roundNumbers[0]].length;
  const presentationProfile = roundNumbers.map((roundNumber) => {
    const previousRoundMatchUps =
      roundNumber > 1 && roundMatchUps[roundNumber - 1];
    const matchUps = roundMatchUps[roundNumber]
      .map((matchUp) => makeDeepCopy(matchUp))
      .map((matchUp) => {
        matchUp.sides.forEach((side) => {
          if (previousRoundMatchUps && side?.participantId) {
            side.sourceMatchUp = previousRoundMatchUps.find((matchUp) =>
              matchUp.drawPositions.includes(side.drawPosition)
            );
          }
        });
        return matchUp;
      });
    const matchUpsCount = matchUps.length;
    const columnFactor =
      Math.log(firstRoundMatchUpsCount / matchUpsCount) / Math.log(2);

    const profile = {
      columnFactor,
      columnType: 'matchUps',
      matchUps,
      roundName: matchUps[0].roundName,
      roundNumber,
    };

    const feedRound = roundProfile[roundNumber].feedRound;
    if (feedRound) {
      if (feedTop) {
        profile.feedTop = true;
        feedTop = false;
      } else {
        profile.feedBottom = true;
        feedTop = true;
      }
    }

    return profile;
  });

  return presentationProfile;
}
