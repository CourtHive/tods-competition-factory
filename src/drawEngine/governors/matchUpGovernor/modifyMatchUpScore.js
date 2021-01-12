/**
 *
 * Single place where matchUp.score can be modified.
 * Moving forward this will be used for integrity checks and any middleware that needs to execute
 *
 * @param {*} param0
 */

export function modifyMatchUpScore({
  drawDefinition,
  matchUp,
  score,
  matchUpStatus,
  matchUpStatusCodes,
  matchUpFormat,
  winningSide,
}) {
  if (score) matchUp.score = score;
  if (matchUpFormat) matchUp.matchUpFormat = matchUpFormat;
  if (matchUpStatus) matchUp.matchUpStatus = matchUpStatus;
  if (matchUpStatusCodes) matchUp.matchUpStatusCodes = matchUpStatusCodes;
  if (winningSide) matchUp.winningSide = winningSide;
  if (drawDefinition) {
    console.log({ matchUp, score });
    // middleware methods
  }
}
