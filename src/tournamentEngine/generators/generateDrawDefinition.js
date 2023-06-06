import { generateDrawTypeAndModifyDrawDefinition } from '../../drawEngine/governors/structureGovernor/generateDrawTypeAndModifyDrawDefinition';
import { generateQualifyingStructures } from '../../drawEngine/governors/structureGovernor/generateQualifyingStructures';
import { addVoluntaryConsolationStructure } from '../governors/eventGovernor/addVoluntaryConsolationStructure';
import { addDrawDefinition } from '../governors/eventGovernor/drawDefinitions/addDrawDefinition';
import { setMatchUpFormat } from '../../drawEngine/governors/matchUpGovernor/setMatchUpFormat';
import { getTournamentParticipants } from '../getters/participants/getTournamentParticipants';
import { generateQualifyingLink } from '../../drawEngine/generators/generateQualifyingLink';
import { attachPolicies } from '../../drawEngine/governors/policyGovernor/attachPolicies';
import { getAppliedPolicies } from '../../global/functions/deducers/getAppliedPolicies';
import { checkValidEntries } from '../governors/eventGovernor/entries/checkValidEntries';
import { addDrawEntry } from '../../drawEngine/governors/entryGovernor/addDrawEntries';
import { getQualifiersCount } from '../../drawEngine/getters/getQualifiersCount';
import { getAllowedDrawTypes } from '../governors/policyGovernor/allowedTypes';
import structureTemplate from '../../drawEngine/generators/structureTemplate';
import { decorateResult } from '../../global/functions/decorateResult';
import { newDrawDefinition } from '../../drawEngine/stateMethods';
import { mustBeAnArray } from '../../utilities/mustBeAnArray';
import { isConvertableInteger } from '../../utilities/math';
import { tieFormatDefaults } from './tieFormatDefaults';
import { nextPowerOf2 } from '../../utilities';
import { prepareStage } from './prepareStage';
import {
  checkTieFormat,
  validateTieFormat,
} from '../../matchUpEngine/governors/tieFormatGovernor/tieFormatUtilities';
import {
  setStageDrawSize,
  setStageQualifiersCount,
} from '../../drawEngine/governors/entryGovernor/stageEntryCounts';

import POLICY_SEEDING_USTA from '../../fixtures/policies/POLICY_SEEDING_USTA';
import { POLICY_TYPE_SEEDING } from '../../constants/policyConstants';
import { SUCCESS } from '../../constants/resultConstants';
import { TEAM } from '../../constants/matchUpTypes';
import {
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
  POSITION,
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
    hydrateCollections,
    policyDefinitions,
    ignoreStageSpace,
    tournamentRecord,
    qualifyingOnly,
    tieFormatName,
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

  if (validEntriesResult?.error)
    return decorateResult({ result: validEntriesResult, stack });

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
    return decorateResult({ result: { error: INVALID_DRAW_TYPE }, stack });
  }

  const eventEntries =
    event?.entries?.filter((entry) =>
      [...STRUCTURE_ENTERED_TYPES, QUALIFIER].includes(entry.entryStatus)
    ) || [];

  const consideredEntries = qualifyingOnly
    ? []
    : (drawEntries || (considerEventEntries ? eventEntries : [])).filter(
        ({ entryStage }) => !entryStage || entryStage === MAIN
      );

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
      result: { error: MISSING_DRAW_SIZE },
      stack,
    });
  }

  let seedsCount =
    typeof params.seedsCount !== 'number'
      ? parseInt(params.seedsCount || 0)
      : params.seedsCount || 0;

  const eventType = event?.eventType;
  const matchUpType = params.matchUpType || eventType;

  const existingDrawDefinition =
    params.drawId &&
    event?.drawDefinitions?.find((d) => d.drawId === params.drawId);

  // drawDefinition cannot have both tieFormat and matchUpFormat
  let { tieFormat, matchUpFormat } = params;

  if (tieFormat) {
    const result = validateTieFormat({ tieFormat });
    if (result.error) return decorateResult({ result, stack });
  }

  if (matchUpType === TEAM && eventType === TEAM) {
    // if there is an existingDrawDefinition which has a tieFormat on MAIN structure
    // use this tieFormat ONLY when no tieFormat is specified in params
    const existingMainTieFormat = existingDrawDefinition?.structures?.find(
      ({ stage }) => stage === MAIN
    )?.tieFormat;

    tieFormat =
      tieFormat ||
      existingMainTieFormat ||
      // if tieFormatName is provided and it matches the name of the tieFormat attached to parent event...
      (tieFormatName &&
        event?.tieFormat?.tieFormatName === tieFormatName &&
        event.tieFormat) ||
      // if the tieFormatName is not found in the factory then will use default
      (tieFormatName &&
        tieFormatDefaults({
          namedFormat: tieFormatName,
          hydrateCollections,
          event,
        })) ||
      // if no tieFormat is found on event then will use default
      event?.tieFormat ||
      tieFormatDefaults({ event, hydrateCollections });

    matchUpFormat = undefined;
  } else if (!matchUpFormat) {
    tieFormat = undefined;
    if (!event?.matchUpFormat) {
      matchUpFormat = 'SET3-S:6/TB7';
    }
  }

  const invalidDrawId = params.drawId && typeof params.drawId !== 'string';
  if (invalidDrawId)
    return decorateResult({ result: { error: INVALID_VALUES }, stack });

  // ---------------------------------------------------------------------------
  // Begin construction of drawDefinition
  if (existingDrawDefinition && drawType !== existingDrawDefinition.drawType)
    existingDrawDefinition.drawType = drawType;

  let drawDefinition =
    existingDrawDefinition ||
    newDrawDefinition({ drawType, drawId: params.drawId });

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
        if (result.error) return decorateResult({ result, stack });

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
      return decorateResult(
        {
          result: {
            info: 'policyDefinitions must be an object',
            error: INVALID_VALUES,
          },
        },
        stack
      );
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

  // find existing MAIN structureId if existingDrawDefinition
  let structureId = existingDrawDefinition?.structures?.find(
    (structure) => structure.stage === MAIN && structure.stageSequence === 1
  )?.structureId;
  const entries = drawEntries || eventEntries;
  const positioningReports = [];
  let drawTypeResult;
  let conflicts = [];

  const generateQualifyingPlaceholder =
    params.qualifyingPlaceholder &&
    !params.qualifyingProfiles?.length &&
    !existingDrawDefinition;

  const existingQualifyingStructures =
    existingDrawDefinition?.structures.filter(
      (structure) => structure.stage === QUALIFYING
    );
  const existingQualifyingPlaceholderStructureId =
    existingQualifyingStructures?.length === 1 &&
    !existingQualifyingStructures[0].matchUps?.length &&
    existingQualifyingStructures[0].structureId;

  if (existingQualifyingPlaceholderStructureId) {
    const qualifyingProfiles = params.qualifyingProfiles;
    const qualifyingResult =
      qualifyingProfiles?.length &&
      generateQualifyingStructures({
        idPrefix: params.idPrefix,
        isMock: params.isMock,
        uuids: params.uuids,
        qualifyingProfiles,
        appliedPolicies,
        matchUpType,
      });

    if (qualifyingResult?.error) {
      return qualifyingResult;
    }

    drawDefinition.structures = drawDefinition.structures.filter(
      ({ structureId }) =>
        structureId !== existingQualifyingPlaceholderStructureId
    );
    drawDefinition.links = drawDefinition.links.filter(
      ({ source }) =>
        source.structureId !== existingQualifyingPlaceholderStructureId
    );

    const { qualifiersCount, qualifyingDrawPositionsCount, qualifyingDetails } =
      qualifyingResult;

    if (qualifyingDrawPositionsCount) {
      if (qualifyingResult?.structures) {
        drawDefinition.structures.push(...qualifyingResult.structures);
      }
      if (qualifyingResult?.links) {
        drawDefinition.links.push(...qualifyingResult.links);
      }
    }

    const mainStructure = drawDefinition.structures.find(
      ({ stage, stageSequence }) => stage === MAIN && stageSequence === 1
    );
    const { qualifiersCount: existingQualifiersCount } = getQualifiersCount({
      drawDefinition,
      stageSequence: 1,
      structureId,
      stage: MAIN,
    });

    const derivedQualifiersCount = Math.max(
      qualifiersCount || 0,
      existingQualifiersCount || 0
    );

    let result = setStageQualifiersCount({
      qualifiersCount: derivedQualifiersCount,
      drawDefinition,
      stage: MAIN,
    });
    if (result.error) return result;

    result = setStageDrawSize({
      drawSize: qualifyingDrawPositionsCount,
      stage: QUALIFYING,
      drawDefinition,
    });
    if (result.error) return result;

    for (const entry of (drawEntries || []).filter(
      ({ entryStage }) => entryStage === QUALIFYING
    )) {
      const entryData = {
        ...entry,
        entryStage: entry.entryStage || MAIN,
        drawDefinition,
      };
      // ignore errors (EXITING_PARTICIPANT)
      addDrawEntry(entryData);
    }

    for (const qualifyingDetail of qualifyingDetails || []) {
      const {
        finalQualifyingRoundNumber: qualifyingRoundNumber,
        finalQualifyingStructureId: qualifyingStructureId,
        roundTarget: targetEntryRound,
        finishingPositions,
        linkType,
      } = qualifyingDetail;

      const link =
        mainStructure &&
        generateQualifyingLink({
          targetStructureId: mainStructure.structureId,
          sourceStructureId: qualifyingStructureId,
          sourceRoundNumber: qualifyingRoundNumber,
          finishingPositions,
          targetEntryRound,
          linkType,
        })?.link;
      if (link?.error) return link;

      if (link) {
        drawDefinition.links.push(link);
      }
    }

    drawTypeResult = { drawDefinition };
  } else {
    drawTypeResult = generateDrawTypeAndModifyDrawDefinition({
      ...params,
      modifyOriginal: false,
      tournamentRecord,
      appliedPolicies,
      drawDefinition,
      matchUpFormat,
      matchUpType,
      tieFormat,
      drawSize,
    });
    if (drawTypeResult.error) {
      return decorateResult({ result: drawTypeResult, stack });
    }
    drawDefinition = drawTypeResult.drawDefinition;

    // add all entries to the draw
    for (const entry of entries) {
      // if drawEntries and entryStage !== stage ignore
      if (drawEntries && entry.entryStage && entry.entryStage !== MAIN)
        continue;
      const entryData = {
        ...entry,
        entryStage: entry.entryStage || MAIN,
        ignoreStageSpace,
        drawDefinition,
      };
      const result = addDrawEntry(entryData);
      if (drawEntries && result.error) {
        // only report errors with drawEntries
        // if entries are taken from event.entries assume stageSpace is not available
        return decorateResult({ result, stack });
      }
    }

    // temporary until seeding is supported in LUCKY_DRAW
    if (drawType === LUCKY_DRAW) seedsCount = 0;

    const structureResult = prepareStage({
      ...drawTypeResult,
      ...params,
      qualifyingOnly: !drawSize || qualifyingOnly, // ooo!! If there is no drawSize then MAIN is not being generated
      appliedPolicies,
      drawDefinition,
      participants,
      stage: MAIN,
      seedsCount,
      placeByes,
      drawSize,
      entries,
    });

    if (structureResult.error && !structureResult.conflicts) {
      return structureResult;
      // // console.log('MAIN', structureResult);
      //return decorateResult({ result: structureResult, stack });
    }

    if (structureResult.positioningReport?.length)
      positioningReports.push({ [MAIN]: structureResult.positioningReport });

    structureId = structureResult.structureId;
    conflicts = structureResult.conflicts;
  }

  const qualifyingConflicts = [];

  if (params.qualifyingProfiles) {
    const sequenceSort = (a, b) => a.stageSequence - b.stageSequence;
    const roundTargetSort = (a, b) => a.roundTarget - b.roundTarget;

    // keep track of structures already prepared in case of multiple matching structures
    const preparedStructureIds = [];
    let roundTarget = 1;

    for (const roundTargetProfile of params.qualifyingProfiles.sort(
      roundTargetSort
    )) {
      if (!Array.isArray(roundTargetProfile.structureProfiles))
        return decorateResult({
          result: { error: MISSING_VALUE },
          info: mustBeAnArray('structureProfiles'),
        });

      roundTarget = roundTargetProfile.roundTarget || roundTarget;
      let stageSequence = 1;

      const sortedStructureProfiles =
        roundTargetProfile.structureProfiles?.sort(sequenceSort) || [];

      for (const structureProfile of sortedStructureProfiles) {
        const {
          qualifyingRoundNumber,
          qualifyingPositions,
          seededParticipants,
          seedingScaleName,
          seedsCount = 0,
          seedingProfile,
          seedByRanking,
          placeByes,
          drawSize,
        } = structureProfile;

        const qualifyingStageResult = prepareStage({
          ...drawTypeResult,
          ...params,
          qualifyingRoundNumber,
          preparedStructureIds,
          qualifyingPositions,
          seededParticipants,
          stage: QUALIFYING,
          seedingScaleName,
          appliedPolicies,
          drawDefinition,
          qualifyingOnly,
          seedingProfile,
          stageSequence,
          seedByRanking,
          participants,
          roundTarget,
          seedsCount,
          placeByes,
          drawSize,
          entries,
        });

        if (qualifyingStageResult.error) {
          return qualifyingStageResult;
        }

        if (qualifyingStageResult.structureId) {
          preparedStructureIds.push(qualifyingStageResult.structureId);
        }

        stageSequence += 1;

        if (qualifyingStageResult.conflicts?.length)
          qualifyingConflicts.push(...qualifyingStageResult.conflicts);

        if (qualifyingStageResult.positioningReport?.length)
          positioningReports.push({
            [QUALIFYING]: qualifyingStageResult.positioningReport,
          });
      }

      roundTarget += 1;
    }
  } else if (generateQualifyingPlaceholder) {
    const qualifyingStructure = structureTemplate({
      structureName: QUALIFYING,
      stage: QUALIFYING,
    });
    const { link } = generateQualifyingLink({
      sourceStructureId: qualifyingStructure.structureId,
      sourceRoundNumber: 0,
      targetStructureId: structureId,
      linkType: POSITION,
    });
    drawDefinition.structures.push(qualifyingStructure);
    drawDefinition.links.push(link);
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
    existingDrawDefinition: !!existingDrawDefinition,
    qualifyingConflicts,
    positioningReports,
    drawDefinition,
    structureId,
    ...SUCCESS,
    conflicts,
  };
}
