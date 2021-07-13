# setMatchUpStatus pseudocode

1. Check for missing parameters (drawDefinition)
2. Check validity of matchUpStatus and matchUpStatus/winningSide combination
3. Get matchUpsMap and inContextDrawMatchUps (optimization)
4. Find matchUp and inContextMatchUp
5. Check validity of matchUpStatus considering assigned drawPositions
6. Get winner/loser position targets
   - IF matchUpType === TEAM, get targets for TEAM, not INDIVIDUAL/PAIR matchUp
7. IF matchUp is part of TEAM matchUp, check for TEAM projected winning side to determine if scoring INDIVIDUAL/PAIR matchUp would have downstream effects
8. Modify matchUp scheduling information (if any schedule information is part of parameters)
