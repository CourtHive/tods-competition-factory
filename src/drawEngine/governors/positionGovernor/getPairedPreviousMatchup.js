import { getMappedStructureMatchUps } from '../../getters/getMatchUps/getMatchUpsMap';

export function getPairedPreviousMatchUp({
  matchUp,
  structureId,
  matchUpsMap,
}) {
  const sourceRoundPosition = matchUp?.roundPosition;
  const offset = sourceRoundPosition % 2 ? 1 : -1;
  const pairedRoundPosition = sourceRoundPosition + offset;
  const structureMatchUps = getMappedStructureMatchUps({
    matchUpsMap,
    structureId,
  });
  const pairedPreviousMatchUp = structureMatchUps.find(
    ({ roundNumber, roundPosition }) =>
      roundNumber === matchUp.roundNumber &&
      roundPosition === pairedRoundPosition
  );
  return { pairedPreviousMatchUp };
}
