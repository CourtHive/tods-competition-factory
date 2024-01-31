import { automatedPositioning } from '@Mutate/drawDefinitions/automatedPositioning';
import { resolveTieFormat } from '@Query/hierarchical/tieFormats/resolveTieFormat';
import { getAllStructureMatchUps } from '@Query/matchUps/getAllStructureMatchUps';
import { copyTieFormat } from '@Query/hierarchical/tieFormats/copyTieFormat';
import { modifyDrawNotice } from '@Mutate/notifications/drawNotifications';
import { getStageEntries } from '@Query/drawDefinition/stageGetter';
import { validateTieFormat } from '@Validators/validateTieFormat';
import { definedAttributes } from '@Tools/definedAttributes';
import { getDrawStructures } from '@Acquire/findStructure';
import { makeDeepCopy } from '@Tools/makeDeepCopy';
import { constantToString } from '@Tools/strings';
import { nextPowerOf2 } from '@Tools/math';
import { generateTieMatchUps } from '../tieMatchUps';
import { getGenerators } from '../getGenerators';

import { PlayoffAttributes, SeedingProfile } from '@Types/factoryTypes';
import { SUCCESS } from '@Constants/resultConstants';
import { SINGLES } from '@Constants/matchUpTypes';
import {
  EXISTING_STRUCTURE,
  ErrorType,
  INVALID_DRAW_SIZE,
  MISSING_DRAW_DEFINITION,
  STAGE_SEQUENCE_LIMIT,
  UNRECOGNIZED_DRAW_TYPE,
} from '@Constants/errorConditionConstants';
import {
  DOUBLE_ELIMINATION,
  FEED_IN,
  ROUND_ROBIN,
  ROUND_ROBIN_WITH_PLAYOFF,
  SINGLE_ELIMINATION,
  VOLUNTARY_CONSOLATION,
} from '@Constants/drawDefinitionConstants';
import {
  DrawDefinition,
  DrawLink,
  Event,
  Structure,
  TieFormat,
  Tournament,
  EventTypeUnion,
} from '@Types/tournamentTypes';

type GenerateVoluntaryConsolationArgs = {
  playoffAttributes?: PlayoffAttributes;
  tournamentRecord: Tournament;
  seedingProfile?: SeedingProfile;
  drawDefinition: DrawDefinition;
  matchUpType?: EventTypeUnion;
  attachConsolation?: boolean;
  applyPositioning?: boolean;
  staggeredEntry?: boolean;
  structureName?: string;
  tieFormat?: TieFormat;
  automated?: boolean;
  placeByes?: boolean;
  drawType?: string;
  isMock?: boolean;
  event?: Event;
};
export function generateVoluntaryConsolation(params: GenerateVoluntaryConsolationArgs): {
  structures?: Structure[];
  links?: DrawLink[];
  success?: boolean;
  error?: ErrorType;
} {
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

  let drawDefinition = params?.drawDefinition;

  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };

  const stage = VOLUNTARY_CONSOLATION;
  const entries = getStageEntries({
    stageSequence: 1,
    drawDefinition,
    stage,
  });
  const drawSize = ![ROUND_ROBIN, DOUBLE_ELIMINATION, ROUND_ROBIN_WITH_PLAYOFF].includes(drawType)
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

  tieFormat = copyTieFormat(tieFormat ?? resolveTieFormat({ drawDefinition })?.tieFormat);
  matchUpType = matchUpType ?? drawDefinition.matchUpType ?? SINGLES;

  const { structures: stageStructures } = getDrawStructures({
    stageSequence: 1,
    drawDefinition,
    stage,
  });

  // invalid to have more than one existing VOLUNTARY_CONSOLATION structure
  const structureCount = stageStructures.length;
  if (structureCount > 1) return { error: STAGE_SEQUENCE_LIMIT };

  // invalid to already have matchUps generated for any existing structure
  if (stageStructures?.[0]?.matchUps?.length) return { error: EXISTING_STRUCTURE };
  const structureId = stageStructures?.[0]?.structureId;

  Object.assign(
    params,
    definedAttributes({
      structureName: params.structureName ?? constantToString(VOLUNTARY_CONSOLATION),
      structureId,
      matchUpType,
      tieFormat,
      drawSize,
      stage,
    }),
  );

  const result = getGenerators(params);
  if (result.error) return result;

  const generator = result.generators[drawType];
  if (!generator) return { error: UNRECOGNIZED_DRAW_TYPE };

  const generatorResult = generator?.();
  if (generatorResult.error) return generatorResult;

  const { structures, links } = generatorResult;

  const matchUps = structures.map((structure) => getAllStructureMatchUps({ structure }).matchUps).flat();

  if (tieFormat) {
    matchUps.forEach((matchUp) => {
      const { tieMatchUps } = generateTieMatchUps({ matchUp, tieFormat, isMock });
      Object.assign(matchUp, { tieMatchUps, matchUpType });
    });
  }

  if (!applyPositioning || !attachConsolation) {
    drawDefinition = makeDeepCopy(drawDefinition, false, true);
  }

  if (!drawDefinition.links) drawDefinition.links = [];
  if (links.length) drawDefinition.links.push(...links);
  const generatedStructureIds = structures.map(({ structureId }) => structureId);
  if (!drawDefinition.structures) drawDefinition.structures = [];
  const existingStructureIds = drawDefinition.structures.map(({ structureId }) => structureId);

  // replace any existing structures with newly generated structures
  // this is done because it is possible that a consolation structure exists without matchUps
  drawDefinition.structures = drawDefinition.structures.map((structure) => {
    return generatedStructureIds.includes(structure.structureId)
      ? structures.find(({ structureId }) => structureId === structure.structureId)
      : structure;
  });

  const newStructures = structures.filter(({ structureId }) => !existingStructureIds.includes(structureId));
  if (newStructures.length) drawDefinition.structures.push(...newStructures);

  if (automated) {
    automatedPositioning({
      seedingProfile: params.seedingProfile,
      applyPositioning,
      tournamentRecord,
      drawDefinition,
      structureId,
      placeByes,
      drawSize,
      event,
    });
  }

  if (attachConsolation) modifyDrawNotice({ drawDefinition });

  return { links, structures, ...SUCCESS };
}
