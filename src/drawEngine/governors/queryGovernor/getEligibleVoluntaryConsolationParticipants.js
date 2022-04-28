import { allDrawMatchUps } from '../../../tournamentEngine/getters/matchUpsGetter';

import { MISSING_DRAW_DEFINITION } from '../../../constants/errorConditionConstants';
import { MAIN, PLAY_OFF } from '../../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function getEligibleVoluntaryConsolationParticipants({
  finishingRoundLimit,
  tournamentRecord,
  drawDefinition,
  winsLimit = 0,
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };

  const { matchUps } = allDrawMatchUps({
    contextFilters: { stages: [MAIN, PLAY_OFF] },
    tournamentRecord,
    inContext: true,
    drawDefinition,
  });

  const losingParticipants = {};
  const participantWins = {};

  for (const matchUp of matchUps) {
    if (![1, 2].includes(matchUp.winningSide)) continue;
    if (
      !isNaN(finishingRoundLimit) &&
      matchUp.finishingRound >= finishingRoundLimit
    )
      continue;

    const losingSide = matchUp.sides?.find(
      ({ sideNumber }) => sideNumber !== matchUp.winningSide
    );
    if (losingSide?.participant) {
      losingParticipants[losingSide.participant.participantId] =
        losingSide.participant;
    }

    const winningSide = matchUp.sides?.find(
      ({ sideNumber }) => sideNumber === matchUp.winningSide
    );
    if (winningSide?.participant) {
      const participantId = winningSide.participant.participantId;
      if (!participantWins[participantId]) participantWins[participantId] = 0;
      participantWins[participantId] += 1;
    }
  }

  const eligibleParticipants = Object.values(losingParticipants).filter(
    ({ participantId }) => (participantWins[participantId] || 0) <= winsLimit
  );

  const losingParticipantIds = Object.keys(losingParticipants);

  return { eligibleParticipants, losingParticipantIds, ...SUCCESS };
}
