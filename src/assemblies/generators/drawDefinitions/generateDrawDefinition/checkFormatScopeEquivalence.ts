import { setMatchUpMatchUpFormat } from '../../../../mutate/matchUps/matchUpFormat/setMatchUpMatchUpFormat';
import { checkTieFormat } from '../../../../mutate/tieFormat/checkTieFormat';

export function checkFormatScopeEquivalence({
  tournamentRecord,
  drawDefinition,
  matchUpFormat,
  matchUpType,
  tieFormat,
  event,
}) {
  // if there is a defined matchUpFormat/tieFormat only attach to drawDefinition...
  // ...when there is not an equivalent definition on the parent event
  if (matchUpFormat || tieFormat) {
    const equivalentInScope =
      (matchUpFormat && event?.matchUpFormat === matchUpFormat) ||
      (event?.tieFormat && tieFormat && JSON.stringify(event.tieFormat) === JSON.stringify(tieFormat));

    // if an equivalent matchUpFormat or tieFormat is attached to the event
    // there is no need to attach to the drawDefinition
    if (!equivalentInScope) {
      if (tieFormat) {
        const result = checkTieFormat({ tieFormat });
        if (result.error) return result;

        drawDefinition.tieFormat = result.tieFormat ?? tieFormat;
      } else if (matchUpFormat) {
        const result = setMatchUpMatchUpFormat({
          tournamentRecord,
          drawDefinition,
          matchUpFormat,
          event,
        });
        if (result.error) {
          return {
            info: 'matchUpFormat or tieFormat error',
            error: result.error,
          };
        }
      }

      if (matchUpType) drawDefinition.matchUpType = matchUpType;
    }
  }

  return { error: undefined };
}
