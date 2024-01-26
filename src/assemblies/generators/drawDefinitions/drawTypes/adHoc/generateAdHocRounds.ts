import { ResultType, decorateResult } from '@Functions/global/decorateResult';
import { generateRange } from '@Tools/arrays';

import { generateAdHocMatchUps } from './generateAdHocMatchUps';

// types
import { DrawDefinition, Event, MatchUp } from '../../../../../types/tournamentTypes';

type GenerateAdHocRoundsArgs = {
  restrictRoundsCoung?: boolean;
  drawDefinition: DrawDefinition;
  matchUpsCount?: number; // number of matchUps to be generated
  matchUpIds?: string[];
  roundNumber?: number;
  structureId?: string;
  roundsCount: number;
  newRound?: boolean; // optional - whether to auto-increment to the next roundNumber
  idPrefix?: string;
  isMock?: boolean;
  event: Event;
};

export function generateAdHocRounds({
  roundsCount = 1,
  drawDefinition,
  matchUpsCount,
  structureId,
  idPrefix,
  isMock,
  event,
}: GenerateAdHocRoundsArgs): ResultType & { matchUps?: MatchUp[] } {
  const matchUps: MatchUp[] = [];
  let roundNumber;

  for (const iteration of generateRange(1, roundsCount + 1)) {
    // on the first iteration roundNumber is undefined and generateAdHocMatchUps will infer the roundNumber from existing matchUps
    // on subsequent iterations roundNumber will be incremented and ignoreLastRoundNumber will be true to avoid inference error
    const genResult = generateAdHocMatchUps({
      ignoreLastRoundNumber: !!roundNumber,
      newRound: !roundNumber,
      drawDefinition,
      matchUpsCount,
      structureId,
      roundNumber,
      idPrefix,
      isMock,
      event,
    });
    if (genResult.error) return decorateResult({ result: genResult, info: { iteration } });
    if (genResult.matchUps?.length) matchUps.push(...genResult.matchUps);
    roundNumber = (genResult?.roundNumber ?? 1) + 1;
  }

  return { matchUps };
}
