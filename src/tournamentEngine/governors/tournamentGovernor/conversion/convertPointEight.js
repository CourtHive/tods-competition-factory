import { newTournamentRecord } from '../../../generators/newTournamentRecord';

import { MISSING_TOURNAMENT_RECORD } from '../../../../constants/errorConditionConstants';
import { DOUBLES, SINGLES, TEAM } from '../../../../constants/eventConstants';
import { FEMALE, MALE } from '../../../../constants/genderConstants';
import { SUCCESS } from '../../../../constants/resultConstants';
import {
  CONSOLATION,
  MAIN,
  PLAY_OFF,
  QUALIFYING,
} from '../../../../constants/drawDefinitionConstants';

export function convertPointEight({ tournament }) {
  if (!tournament) return { error: MISSING_TOURNAMENT_RECORD };

  const {
    providerTournamentID: tournamentId,
    hostCountryCode,
    tournamentLevel,
    totalPrizeMoney,
    tournamentName,
    extensions,
    startDate,
    endDate,
  } = tournament;

  const tournamentRecord = newTournamentRecord({
    hostCountryCode,
    tournamentLevel,
    totalPrizeMoney,
    tournamentName,
    tournamentId,
    extensions,
    startDate,
    endDate,
  });

  tournamentRecord.events = [];

  for (const legacyEvent of tournament.events || []) {
    const {
      extensions,
      ageCategory,
      discipline,
      eventType,
      eventId,
      gender,
      stages,
    } = legacyEvent;

    const event = {
      drawDefinitions: deriveDraws(stages),
      category: { ageCategory },
      gender:
        (['M', MALE].includes(gender) && MALE) ||
        (['F', FEMALE].includes(gender) && FEMALE) ||
        undefined,
      eventType:
        (['D', DOUBLES].includes(eventType) && DOUBLES) ||
        ['T', TEAM].includes(eventType)
          ? TEAM
          : SINGLES,
      extensions,
      discipline,
      eventId,
    };

    tournamentRecord.events.push(event);
  }

  return { ...SUCCESS, tournamentRecord };
}

function deriveDraws(stages) {
  const drawDefinitions = [];

  for (const legacyStage of stages || []) {
    const { stageType } = legacyStage;
    const stage =
      (['M', MAIN].includes(stageType) && MAIN) ||
      (['Q', QUALIFYING].includes(stageType) && QUALIFYING) ||
      (['C', CONSOLATION].includes(stageType) && CONSOLATION) ||
      (['P', PLAY_OFF].includes(stageType) && PLAY_OFF) ||
      undefined;

    for (const draw of legacyStage.draws || []) {
      const { drawId, drawSize, matchUps } = draw;
      const drawDefinition = { stage, drawId, drawSize };
      drawDefinitions.push(drawDefinition);
      console.log(
        matchUps.map(({ roundNumber, roundPosition }) => ({
          roundNumber,
          roundPosition,
        })),
        { draw, drawDefinition }
      );
    }
  }

  return drawDefinitions;
}
