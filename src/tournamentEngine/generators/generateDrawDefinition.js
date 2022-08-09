import { generateDrawTypeAndModifyDrawDefinition } from '../../drawEngine/governors/structureGovernor/generateDrawTypeAndModifyDrawDefinition';
import { addVoluntaryConsolationStructure } from '../governors/eventGovernor/addVoluntaryConsolationStructure';
import { addDrawDefinition } from '../governors/eventGovernor/drawDefinitions/addDrawDefinition';
import { getTournamentParticipants } from '../getters/participants/getTournamentParticipants';
import { setMatchUpFormat } from '../../drawEngine/governors/matchUpGovernor/setMatchUpFormat';
import { attachPolicies } from '../../drawEngine/governors/policyGovernor/attachPolicies';
import { getAppliedPolicies } from '../../global/functions/deducers/getAppliedPolicies';
import { checkValidEntries } from '../governors/eventGovernor/entries/checkValidEntries';
import { addDrawEntry } from '../../drawEngine/governors/entryGovernor/addDrawEntries';
import { getAllowedDrawTypes } from '../governors/policyGovernor/allowedTypes';
import { decorateResult } from '../../global/functions/decorateResult';
import { newDrawDefinition } from '../../drawEngine/stateMethods';
import { isConvertableInteger } from '../../utilities/math';
import { tieFormatDefaults } from './tieFormatDefaults';
import { nextPowerOf2 } from '../../utilities';
import { prepareStage } from './prepareStage';
import {
  checkTieFormat,
  validateTieFormat,
} from '../../matchUpEngine/governors/tieFormatGovernor/tieFormatUtilities';

import POLICY_SEEDING_USTA from '../../fixtures/policies/POLICY_SEEDING_USTA';
import { POLICY_TYPE_SEEDING } from '../../constants/policyConstants';
import { SUCCESS } from '../../constants/resultConstants';
import { TEAM } from '../../constants/matchUpTypes';
import {
  DRAW_ID_EXISTS,
  INVALID_DRAW_TYPE,
  INVALID_VALUES,
  MISSING_DRAW_SIZE,
  MISSING_VALUE,
} from '../../constants/errorConditionConstants';
import {
  AD_HOC,
  DOUBLE_ELIMINATION,
  FEED_IN,
  LUCKY_DRAW,
  MAIN,
  QUALIFYING,
  ROUND_ROBIN,
  ROUND_ROBIN_WITH_PLAYOFF,
  SINGLE_ELIMINATION,
} from '../../constants/drawDefinitionConstants';
import {
  QUALIFIER,
  STRUCTURE_ENTERED_TYPES,
} from '../../constants/entryStatusConstants';

/**
 * automated = true, // can be true/false or "truthy" { seedsOnly: true }
 */
export function generateDrawDefinition(params) {
  const stack = 'generateDrawDefinition';
  const {
    drawType = SINGLE_ELIMINATION,
    considerEventEntries = true, // in the absence of drawSize and drawEntries, look to event.entries
    ignoreAllowedDrawTypes,
    voluntaryConsolation,
    overwriteExisting,
    policyDefinitions,
    tournamentRecord,
    tieFormatName,
    stage = MAIN,
    drawEntries,
    addToEvent,
    placeByes,
    event,
  } = params;

  // get participants both for entry validation and for automated placement
  // automated placement requires them to be "inContext" for avoidance policies to work
  const { tournamentParticipants: participants } = getTournamentParticipants({
    tournamentRecord,
    inContext: true,
  });

  // entries participantTypes must correspond with eventType
  // this is only possible if the event is provided
  const validEntriesResult =
    event && participants && checkValidEntries({ event, participants });

  if (validEntriesResult?.error) return validEntriesResult;

  // if tournamentRecord is provided, and unless instructed to ignore valid types,
  // check for restrictions on allowed drawTypes
  const allowedDrawTypes =
    !ignoreAllowedDrawTypes &&
    tournamentRecord &&
    getAllowedDrawTypes({
      tournamentRecord,
      categoryType: event?.categoryType,
      categoryName: event?.categoryName,
    });
  if (allowedDrawTypes?.length && !allowedDrawTypes.includes(drawType)) {
    return { error: INVALID_DRAW_TYPE };
  }

  const eventEntries =
    event?.entries?.filter((entry) =>
      [...STRUCTURE_ENTERED_TYPES, QUALIFIER].includes(entry.entryStatus)
    ) || [];

  const consideredEntries = (
    drawEntries || (considerEventEntries ? eventEntries : [])
  ).filter(({ entryStage }) => !entryStage || entryStage === stage);

  const derivedDrawSize =
    !params.drawSize &&
    consideredEntries.length &&
    ![
      AD_HOC,
      DOUBLE_ELIMINATION,
      FEED_IN,
      ROUND_ROBIN,
      ROUND_ROBIN_WITH_PLAYOFF,
    ].includes(drawType) &&
    nextPowerOf2(consideredEntries.length);

  // coersion of drawSize and seedsCount to integers
  let drawSize =
    derivedDrawSize ||
    (isConvertableInteger(params.drawSize) && parseInt(params.drawSize));

  if (isNaN(drawSize) && drawType !== AD_HOC) {
    return decorateResult({
      result: { error: MISSING_DRAW_SIZE, info: 'drawSize' },
      stack,
    });
  }

  let seedsCount =
    typeof params.seedsCount !== 'number'
      ? parseInt(params.seedsCount || 0)
      : params.seedsCount || 0;

  const eventType = event?.eventType;
  const matchUpType = params.matchUpType || eventType;

  // drawDefinition cannot have both tieFormat and matchUpFormat
  let { tieFormat, matchUpFormat } = params;

  if (tieFormat) {
    const result = validateTieFormat({ tieFormat });
    if (result.error) return result;
  }

  if (matchUpType === TEAM && eventType === TEAM) {
    tieFormat =
      tieFormat ||
      // if tieFormatName is proviced and it matches the name of the tieFormat attached to parent event...
      (tieFormatName &&
        event?.tieFormat?.tieFormatName === tieFormatName &&
        event.tieFormat) ||
      // if the tieFormatName is not found in the factory then will use default
      (tieFormatName && tieFormatDefaults({ namedFormat: tieFormatName })) ||
      // if no tieFormat is found on event then will use default
      event?.tieFormat ||
      tieFormatDefaults();

    matchUpFormat = undefined;
  } else if (!matchUpFormat) {
    tieFormat = undefined;
    if (!event?.matchUpFormat) {
      matchUpFormat = 'SET3-S:6/TB7';
    }
  }

  // ---------------------------------------------------------------------------
  // Begin construction of drawDefinition
  const existingDrawDefinition = !!(
    params.drawId &&
    event?.drawDefinitions?.find((d) => d.drawId === params.drawId)
  );
  if (existingDrawDefinition && !overwriteExisting) {
    return { error: DRAW_ID_EXISTS };
  }

  const drawDefinition = newDrawDefinition({ drawType, drawId: params.drawId });

  // if there is a defined matchUpFormat/tieFormat only attach to drawDefinition...
  // ...when there is not an equivalent definition on the parent event
  if (matchUpFormat || tieFormat) {
    let equivalentInScope =
      (matchUpFormat && event?.matchUpFormat === matchUpFormat) ||
      (event?.tieFormat &&
        tieFormat &&
        JSON.stringify(event.tieFormat) === JSON.stringify(tieFormat));

    // if an equivalent matchUpFormat or tieFormat is attached to the event
    // there is no need to attach to the drawDefinition
    if (!equivalentInScope) {
      if (tieFormat) {
        const result = checkTieFormat(tieFormat);
        if (result.error) return result;

        drawDefinition.tieFormat = result.tieFormat || tieFormat;
      } else {
        let result = setMatchUpFormat({
          tournamentRecord,
          drawDefinition,
          matchUpFormat,
          tieFormat,
          event,
        });
        if (result.error) {
          return {
            error: result.error,
            info: 'matchUpFormat or tieFormat error',
          };
        }
      }

      if (matchUpType) drawDefinition.matchUpType = matchUpType;
    }
  }

  const { appliedPolicies } = getAppliedPolicies({
    tournamentRecord,
    event,
  });

  if (policyDefinitions) {
    if (typeof policyDefinitions !== 'object') {
      return {
        info: 'policyDefinitions must be an object',
        error: INVALID_VALUES,
      };
    } else {
      const policiesToAttach = {};
      for (const key of Object.keys(policyDefinitions)) {
        if (
          JSON.stringify(appliedPolicies[key]) !==
          JSON.stringify(policyDefinitions[key])
        ) {
          policiesToAttach[key] = policyDefinitions[key];
        }
      }

      if (Object.keys(policiesToAttach).length) {
        // attach any policyDefinitions which have been provided and are not already present
        attachPolicies({ drawDefinition, policyDefinitions: policiesToAttach });
        Object.assign(appliedPolicies, policiesToAttach);
      }
    }
  }

  if (!appliedPolicies[POLICY_TYPE_SEEDING]) {
    attachPolicies({ drawDefinition, policyDefinitions: POLICY_SEEDING_USTA });
    Object.assign(appliedPolicies, POLICY_SEEDING_USTA);
  }

  let drawTypeResult = generateDrawTypeAndModifyDrawDefinition({
    ...params,
    tournamentRecord,
    appliedPolicies,
    drawDefinition,
    matchUpFormat,
    matchUpType,
    tieFormat,
    drawSize,
  });
  if (drawTypeResult.error) return drawTypeResult;

  // add all entries to the draw
  const entries = drawEntries || eventEntries;
  for (const entry of entries) {
    // convenience: assume MAIN as entryStage if none provided
    const entryData = {
      ...entry,
      entryStage: entry.entryStage || MAIN,
      drawDefinition,
    };
    const result = addDrawEntry(entryData);
    if (drawEntries && result.error) {
      // only report errors with drawEntries
      // if entries are taken from event.entries assume stageSpace is not available
      return result;
    }
  }

  // temporary until seeding is supported in LUCKY_DRAW
  if (drawType === LUCKY_DRAW) seedsCount = 0;

  const structureResult = prepareStage({
    ...drawTypeResult,
    ...params,
    appliedPolicies,
    drawDefinition,
    participants,
    seedsCount,
    placeByes,
    drawSize,
    entries,
    stage,
  });

  const structureId = structureResult.structureId;
  const conflicts = structureResult.conflicts;
  const qualifyingConflicts = [];

  const sequenceSort = (a, b) => a.stageSequence - b.stageSequence;
  const roundTargetSort = (a, b) => a.roundTarget - b.roundTarget;

  if (params.qualifyingProfiles) {
    // keep track of structures already prepared in case of multiple matching structures
    const preparedStructureIds = [];
    let roundTarget = 1;

    for (const roundTargetProfile of params.qualifyingProfiles.sort(
      roundTargetSort
    )) {
      roundTarget = roundTargetProfile.roundTarget || roundTarget;
      let stageSequence = 1;

      if (!Array.isArray(roundTargetProfile.structureProfiles))
        return decorateResult({
          result: { error: MISSING_VALUE },
          info: 'structureProfiles must be an array',
        });

      const sortedStructureProfiles =
        roundTargetProfile.structureProfiles.sort(sequenceSort) || [];
      for (const structureProfile of sortedStructureProfiles) {
        const {
          qualifyingRoundNumber,
          qualifyingPositions,
          seedsCount = 0,
          drawSize,
        } = structureProfile;

        const qualifyingStageResult = prepareStage({
          ...drawTypeResult,
          ...params,
          qualifyingRoundNumber,
          preparedStructureIds,
          qualifyingPositions,
          stage: QUALIFYING,
          appliedPolicies,
          drawDefinition,
          stageSequence,
          participants,
          roundTarget,
          seedsCount,
          placeByes,
          drawSize,
          entries,
        });

        if (qualifyingStageResult.structureId) {
          preparedStructureIds.push(qualifyingStageResult.structureId);
        }

        stageSequence += 1;

        if (qualifyingStageResult.conflicts?.length)
          qualifyingConflicts.push(...qualifyingStageResult.conflicts);
      }

      roundTarget += 1;
    }
  }

  drawDefinition.drawName = params.drawName || drawType;

  if (typeof voluntaryConsolation === 'object') {
    addVoluntaryConsolationStructure({
      ...voluntaryConsolation,
      tournamentRecord,
      appliedPolicies,
      drawDefinition,
      matchUpType,
    });
  }

  if (addToEvent) {
    addDrawDefinition({ tournamentRecord, drawDefinition, event });
  }

  return {
    existingDrawDefinition,
    qualifyingConflicts,
    drawDefinition,
    structureId,
    ...SUCCESS,
    conflicts,
  };
}
