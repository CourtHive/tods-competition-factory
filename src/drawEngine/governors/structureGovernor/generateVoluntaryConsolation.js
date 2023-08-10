import { getTournamentParticipants } from '../../../tournamentEngine/getters/participants/getTournamentParticipants';
import { resolveTieFormat } from '../../../matchUpEngine/governors/tieFormatGovernor/getTieFormat/resolveTieFormat';
import { validateTieFormat } from '../../../matchUpEngine/governors/tieFormatGovernor/tieFormatUtilities';
import { copyTieFormat } from '../../../matchUpEngine/governors/tieFormatGovernor/copyTieFormat';
import { getAllStructureMatchUps } from '../../getters/getMatchUps/getAllStructureMatchUps';
import { automatedPositioning } from '../positionGovernor/automatedPositioning';
import { modifyDrawNotice } from '../../notifications/drawNotifications';
import { generateTieMatchUps } from '../../generators/tieMatchUps';
import { makeDeepCopy, nextPowerOf2 } from '../../../utilities';
import { getDrawStructures } from '../../getters/findStructure';
import { definedAttributes } from '../../../utilities/objects';
import { getStageEntries } from '../../getters/stageGetter';
import { getGenerators } from './getGenerators';

import { SUCCESS } from '../../../constants/resultConstants';
import { SINGLES } from '../../../constants/matchUpTypes';
import {
  INVALID_DRAW_SIZE,
  INVALID_STRUCTURE,
  MISSING_DRAW_DEFINITION,
  UNRECOGNIZED_DRAW_TYPE,
} from '../../../constants/errorConditionConstants';
import {
  DOUBLE_ELIMINATION,
  FEED_IN,
  ROUND_ROBIN,
  ROUND_ROBIN_WITH_PLAYOFF,
  SINGLE_ELIMINATION,
  VOLUNTARY_CONSOLATION,
} from '../../../constants/drawDefinitionConstants';

export function generateVoluntaryConsolation(params = {}) {
  const {
    drawType = SINGLE_ELIMINATION,
    attachConsolation = true,
    applyPositioning = true,
    tournamentRecord,
    staggeredEntry, // optional - specifies main structure FEED_IN for drawTypes CURTIS_CONSOLATION, FEED_IN_CHAMPIONSHIPS, FMLC
    automated,
    placeByes,
    isMock,
    event,
  } = params;

  let { drawDefinition } = params;

  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };

  // get participants both for entry validation and for automated placement
  // automated placement requires them to be "inContext" for avoidance policies to work
  const tournamentParticipants = getTournamentParticipants({
    tournamentRecord,
    inContext: true,
  })?.tournamentParticipants;

  const stage = VOLUNTARY_CONSOLATION;
  const entries = getStageEntries({
    stageSequence: 1,
    drawDefinition,
    stage,
  });
  const drawSize = ![
    ROUND_ROBIN,
    DOUBLE_ELIMINATION,
    ROUND_ROBIN_WITH_PLAYOFF,
  ].includes(drawType)
    ? nextPowerOf2(entries.length)
    : entries.length;

  if (
    (!staggeredEntry && drawType === FEED_IN && entries.length < 2) ||
    (drawType === ROUND_ROBIN && entries.length < 3)
  )
    return { error: INVALID_DRAW_SIZE };

  let { tieFormat, matchUpType } = params;
  if (tieFormat) {
    const result = validateTieFormat({ tieFormat });
    if (result.error) return result;
  }

  tieFormat = copyTieFormat(
    tieFormat || resolveTieFormat({ drawDefinition })?.tieFormat
  );
  matchUpType = matchUpType || drawDefinition.matchUpType || SINGLES;

  const { structures: stageStructures } = getDrawStructures({
    stageSequence: 1,
    drawDefinition,
    stage,
  });

  // invalid to have more than one existing VOLUNTARY_CONSOLATION structure
  const structureCount = stageStructures.length;
  if (structureCount > 1) return { error: INVALID_STRUCTURE };

  // invalid to already have matchUps generated for any existing structure
  if (stageStructures?.[0]?.matchUps?.length)
    return { error: INVALID_STRUCTURE };
  const structureId = stageStructures?.[0]?.structureId;

  Object.assign(
    params,
    definedAttributes({
      structureName: params.structureName || VOLUNTARY_CONSOLATION,
      structureId,
      matchUpType,
      tieFormat,
      drawSize,
      stage,
    })
  );

  const result = getGenerators(params);
  if (result.error) return result;

  const generator = result.generators[drawType];
  if (!generator) return { error: UNRECOGNIZED_DRAW_TYPE };

  const generatorResult = generator?.();
  if (generatorResult.error) return generatorResult;

  let { structures, links } = generatorResult;

  const matchUps = structures
    .map((structure) => getAllStructureMatchUps({ structure }).matchUps)
    .flat();

  if (tieFormat) {
    matchUps.forEach((matchUp) => {
      const { tieMatchUps } = generateTieMatchUps({ tieFormat, isMock });
      Object.assign(matchUp, { tieMatchUps, matchUpType });
    });
  }

  if (!applyPositioning || !attachConsolation) {
    drawDefinition = makeDeepCopy(drawDefinition, false, true);
  }

  if (links.length) drawDefinition.links.push(...links);
  const generatedStructureIds = structures.map(
    ({ structureId }) => structureId
  );
  const existingStructureIds = drawDefinition.structures.map(
    ({ structureId }) => structureId
  );

  // replace any existing structures with newly generated structures
  // this is done because it is possible that a consolation structure exists without matchUps
  drawDefinition.structures = drawDefinition.structures.map((structure) => {
    return generatedStructureIds.includes(structure.structureId)
      ? structures.find(
          ({ structureId }) => structureId === structure.structureId
        )
      : structure;
  });

  const newStructures = structures.filter(
    ({ structureId }) => !existingStructureIds.includes(structureId)
  );
  if (newStructures.length) drawDefinition.structures.push(...newStructures);

  if (automated) {
    automatedPositioning({
      seedingProfile: params.seedingProfile,
      participants: tournamentParticipants,
      applyPositioning,
      tournamentRecord,
      drawDefinition,
      structureId,
      placeByes,
      event,
    });
  }

  if (attachConsolation) modifyDrawNotice({ drawDefinition });

  return { links, structures, ...SUCCESS };
}
