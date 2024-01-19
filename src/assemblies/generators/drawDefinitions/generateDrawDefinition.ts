import { addVoluntaryConsolationStructure } from '../../../mutate/drawDefinitions/addVoluntaryConsolationStructure';
import { setMatchUpMatchUpFormat } from '../../../mutate/matchUps/matchUpFormat/setMatchUpMatchUpFormat';
import { generateDrawTypeAndModifyDrawDefinition } from './generateDrawTypeAndModifyDrawDefinition';
import { addDrawEntry } from '../../../mutate/drawDefinitions/entryGovernor/addDrawEntries';
import { generateQualifyingStructures } from './drawTypes/generateQualifyingStructures';
import { attachPolicies } from '../../../mutate/extensions/policies/attachPolicies';
import { getQualifiersCount } from '../../../query/drawDefinition/getQualifiersCount';
import { addAdHocMatchUps } from '../../../mutate/structures/addAdHocMatchUps';
import { getParticipants } from '../../../query/participants/getParticipants';
import { validateAndDeriveDrawValues } from './validateAndDeriveDrawValues';
import { checkTieFormat } from '../../../mutate/tieFormat/checkTieFormat';
import { generateQualifyingLink } from './links/generateQualifyingLink';
import { getParticipantId } from '../../../global/functions/extractors';
import { generateAdHocMatchUps } from './generateAdHocMatchUps';
import structureTemplate from '../templates/structureTemplate';
import { mustBeAnArray } from '../../../tools/mustBeAnArray';
import { constantToString } from '../../../tools/strings';
import { generateRange } from '../../../tools/arrays';
import { newDrawDefinition } from './newDrawDefinition';
import { ensureInt } from '../../../tools/ensureInt';
import { drawMatic } from './drawMatic/drawMatic';
import { prepareStage } from './prepareStage';
import {
  setStageDrawSize,
  setStageQualifiersCount,
} from '../../../mutate/drawDefinitions/entryGovernor/stageEntryCounts';

import { AD_HOC, LUCKY_DRAW, MAIN, POSITION, QUALIFYING } from '../../../constants/drawDefinitionConstants';
import { ErrorType, INVALID_VALUES, MISSING_VALUE } from '../../../constants/errorConditionConstants';
import { QUALIFIER, STRUCTURE_SELECTED_STATUSES } from '../../../constants/entryStatusConstants';
import { POLICY_TYPE_AVOIDANCE, POLICY_TYPE_SEEDING } from '../../../constants/policyConstants';
import { ResultType, decorateResult } from '../../../global/functions/decorateResult';
import POLICY_SEEDING_DEFAULT from '../../../fixtures/policies/POLICY_SEEDING_DEFAULT';
import { DrawDefinition, DrawTypeUnion, Entry } from '../../../types/tournamentTypes';
import { GenerateDrawDefinitionArgs } from '../../../types/factoryTypes';
import { SUCCESS } from '../../../constants/resultConstants';
import { getDrawFormat } from './getDrawFormat';

export function generateDrawDefinition(params: GenerateDrawDefinitionArgs): ResultType & {
  existingDrawDefinition?: boolean;
  qualifyingConflicts?: any[];
  positioningReports?: any[];
  drawDefinition?: DrawDefinition;
  structureId?: string;
  success?: boolean;
  error?: ErrorType;
  conflicts?: any[];
} {
  const stack = 'generateDrawDefinition';
  const { voluntaryConsolation, ignoreStageSpace, tournamentRecord, qualifyingOnly, drawEntries, placeByes, event } =
    params;

  const isMock = params.isMock ?? true;
  const idPrefix = params.idPrefix;

  // get participants both for entry validation and for automated placement
  // automated placement requires them to be "inContext" for avoidance policies to work
  const { participants, participantMap } = getParticipants({
    withIndividualParticipants: true,
    convertExtensions: true,
    internalUse: true,
    tournamentRecord,
  });

  const eventEntries =
    event?.entries?.filter(
      (entry: Entry) => entry.entryStatus && [...STRUCTURE_SELECTED_STATUSES, QUALIFIER].includes(entry.entryStatus),
    ) ?? [];

  const validDerivedResult = validateAndDeriveDrawValues({
    ...params, // order is important here
    participantMap,
    participants,
    eventEntries,
  });
  if (validDerivedResult.error) return decorateResult({ result: validDerivedResult, stack });
  const { appliedPolicies, policyDefinitions, drawSize, drawType, enforceGender, seedingProfile } = validDerivedResult;

  const eventType = event?.eventType;
  const matchUpType = params.matchUpType ?? eventType;

  const existingDrawDefinition = params.drawId
    ? (event?.drawDefinitions?.find((d) => d.drawId === params.drawId) as DrawDefinition)
    : undefined;

  const drawFormatResult = getDrawFormat({ ...params, enforceGender, eventType, matchUpType });
  if (drawFormatResult.error) return decorateResult({ result: drawFormatResult, stack });
  const { matchUpFormat, tieFormat } = drawFormatResult;

  const invalidDrawId = params.drawId && typeof params.drawId !== 'string';
  if (invalidDrawId) return decorateResult({ result: { error: INVALID_VALUES }, stack });

  // ---------------------------------------------------------------------------
  // Begin construction of drawDefinition
  if (existingDrawDefinition && drawType !== existingDrawDefinition.drawType)
    existingDrawDefinition.drawType = drawType as DrawTypeUnion;

  let drawDefinition: any =
    existingDrawDefinition ??
    newDrawDefinition({
      drawType,
      drawId: params.drawId,
      processCodes: params.processCodes,
    });

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
        if (result.error) return decorateResult({ result, stack });

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
            error: result.error,
            info: 'matchUpFormat or tieFormat error',
          };
        }
      }

      if (matchUpType) drawDefinition.matchUpType = matchUpType;
    }
  }

  // ---------------------------------------------------------------------------
  // Attach policies to the drawDefinition
  // if there is an avoidance policy on the event, it must be preserved in the drawDefinition
  // if there is an avoidance policy in policyDefinitions, it will override
  // avoidance policies on the event can be changed (if location used for UI)

  const policiesToAttach = {
    [POLICY_TYPE_AVOIDANCE]: appliedPolicies?.[POLICY_TYPE_AVOIDANCE],
  };

  if (policyDefinitions) {
    if (typeof policyDefinitions !== 'object') {
      return decorateResult({
        info: 'policyDefinitions must be an object',
        result: { error: INVALID_VALUES },
        stack,
      });
    } else {
      for (const key of Object.keys(policyDefinitions)) {
        if (JSON.stringify(appliedPolicies?.[key]) !== JSON.stringify(policyDefinitions[key])) {
          policiesToAttach[key] = policyDefinitions[key];
        }
      }

      if (Object.keys(policiesToAttach).length) {
        // attach any policyDefinitions which have been provided and are not already present
        attachPolicies({
          policyDefinitions: policiesToAttach,
          drawDefinition,
        });
        if (appliedPolicies) Object.assign(appliedPolicies, policiesToAttach);
      }
    }
  } else if (policiesToAttach.avoidance) {
    attachPolicies({ drawDefinition, policyDefinitions: policiesToAttach });
  }

  if (!appliedPolicies?.[POLICY_TYPE_SEEDING] && !policyDefinitions?.[POLICY_TYPE_SEEDING]) {
    attachPolicies({
      policyDefinitions: POLICY_SEEDING_DEFAULT,
      drawDefinition,
    });
    if (appliedPolicies) Object.assign(appliedPolicies, POLICY_SEEDING_DEFAULT);
  }
  // ---------------------------------------------------------------------------

  // find existing MAIN structureId if existingDrawDefinition
  let structureId = existingDrawDefinition?.structures?.find(
    (structure) => structure.stage === MAIN && structure.stageSequence === 1,
  )?.structureId;
  const entries = drawEntries ?? eventEntries;
  const positioningReports: any[] = [];
  let drawTypeResult;
  let conflicts: any[] = [];

  const generateQualifyingPlaceholder =
    params.qualifyingPlaceholder && !params.qualifyingProfiles?.length && !existingDrawDefinition;

  const existingQualifyingStructures = existingDrawDefinition
    ? existingDrawDefinition.structures?.filter((structure) => structure.stage === QUALIFYING)
    : [];
  const existingQualifyingPlaceholderStructureId =
    existingQualifyingStructures?.length === 1 &&
    !existingQualifyingStructures[0].matchUps?.length &&
    existingQualifyingStructures[0].structureId;

  if (existingQualifyingPlaceholderStructureId) {
    const qualifyingProfiles = params.qualifyingProfiles;
    const qualifyingResult = qualifyingProfiles?.length
      ? generateQualifyingStructures({
          uuids: params.uuids,
          qualifyingProfiles,
          appliedPolicies,
          idPrefix,
          isMock,
        })
      : undefined;

    if (qualifyingResult?.error) {
      return qualifyingResult;
    }

    drawDefinition.structures = drawDefinition.structures?.filter(
      ({ structureId }) => structureId !== existingQualifyingPlaceholderStructureId,
    );
    drawDefinition.links = drawDefinition.links?.filter(
      ({ source }) => source.structureId !== existingQualifyingPlaceholderStructureId,
    );

    const { qualifiersCount, qualifyingDrawPositionsCount, qualifyingDetails } = qualifyingResult ?? {};

    if (qualifyingDrawPositionsCount) {
      if (qualifyingResult?.structures) {
        drawDefinition.structures?.push(...qualifyingResult.structures);
      }
      if (qualifyingResult?.links) {
        drawDefinition.links?.push(...qualifyingResult.links);
      }
    }

    const mainStructure = drawDefinition.structures?.find(
      ({ stage, stageSequence }) => stage === MAIN && stageSequence === 1,
    );
    const { qualifiersCount: existingQualifiersCount } = getQualifiersCount({
      stageSequence: 1,
      drawDefinition,
      structureId,
      stage: MAIN,
    });

    const derivedQualifiersCount = Math.max(qualifiersCount ?? 0, existingQualifiersCount ?? 0);

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

    for (const entry of (drawEntries ?? []).filter(({ entryStage }) => entryStage === QUALIFYING)) {
      const entryData = {
        ...entry,
        entryStage: entry.entryStage ?? MAIN,
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
        if (!drawDefinition.links) drawDefinition.links = [];
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
      isMock,
    });
    if (drawTypeResult.error) {
      return decorateResult({ result: drawTypeResult, stack });
    }
    drawDefinition = drawTypeResult.drawDefinition;

    // add all entries to the draw
    for (const entry of entries) {
      // if drawEntries and entryStage !== stage ignore
      if (drawEntries && entry.entryStage && entry.entryStage !== MAIN) continue;

      const entryData = {
        ...entry,
        ignoreStageSpace: ignoreStageSpace ?? drawType === AD_HOC,
        entryStage: entry.entryStage ?? MAIN,
        drawDefinition,
        drawType,
      };
      const result = addDrawEntry(entryData);
      if (drawEntries && result.error) {
        // only report errors with drawEntries
        // if entries are taken from event.entries assume stageSpace is not available
        return decorateResult({ result, stack });
      }
    }

    // temporary until seeding is supported in LUCKY_DRAW
    const seedsCount = drawType === LUCKY_DRAW ? 0 : ensureInt(params.seedsCount ?? 0);

    const structureResult = prepareStage({
      ...drawTypeResult,
      ...params,
      qualifyingOnly: !drawSize || qualifyingOnly, // ooo!! If there is no drawSize then MAIN is not being generated
      appliedPolicies,
      drawDefinition,
      seedingProfile,
      participants,
      stage: MAIN,
      seedsCount,
      placeByes,
      drawSize,
      entries,
    });

    if (structureResult.error && !structureResult.conflicts) {
      return structureResult;
    }

    if (structureResult.positioningReport?.length)
      positioningReports.push({ [MAIN]: structureResult.positioningReport });

    structureId = structureResult.structureId;
    if (structureResult.conflicts) conflicts = structureResult.conflicts;

    if (drawType === AD_HOC && params.roundsCount) {
      const entries = event?.entries?.filter(
        ({ entryStage, entryStatus }) =>
          (!entryStage || entryStage === MAIN) && entryStatus && STRUCTURE_SELECTED_STATUSES.includes(entryStatus),
      );
      const participantIds = entries?.map(getParticipantId);
      const matchUpsCount = entries ? Math.floor(entries.length / 2) : 0;

      if (params.automated) {
        const { restrictEntryStatus, generateMatchUps, structureId, matchUpIds, scaleName } = params.drawMatic ?? {};

        const result = drawMatic({
          eventType: params.drawMatic?.eventType ?? matchUpType,
          generateMatchUps: generateMatchUps ?? true,
          roundsCount: params.roundsCount,
          restrictEntryStatus,
          tournamentRecord,
          participantIds,
          drawDefinition,
          structureId,
          matchUpIds,
          scaleName, // custom rating name to seed dynamic ratings
          idPrefix,
          isMock,
          event,
        });

        result?.matchUps?.length &&
          addAdHocMatchUps({
            suppressNotifications: true,
            matchUps: result.matchUps,
            tournamentRecord,
            drawDefinition,
            structureId,
            event,
          });
      } else {
        generateRange(1, params.roundsCount + 1).forEach(() => {
          const matchUps = generateAdHocMatchUps({
            newRound: true,
            drawDefinition,
            matchUpsCount,
            idPrefix,
            isMock,
            event,
          }).matchUps;

          matchUps?.length &&
            addAdHocMatchUps({
              suppressNotifications: true,
              tournamentRecord,
              drawDefinition,
              structureId,
              matchUps,
              event,
            });
        });
      }
    }
  }

  const qualifyingConflicts: any[] = [];

  if (params.qualifyingProfiles) {
    const sequenceSort = (a, b) => a.stageSequence - b.stageSequence;
    const roundTargetSort = (a, b) => a.roundTarget - b.roundTarget;

    // keep track of structures already prepared in case of multiple matching structures
    const preparedStructureIds: string[] = [];
    let roundTarget = 1;

    params.qualifyingProfiles.sort(roundTargetSort);

    for (const roundTargetProfile of params.qualifyingProfiles) {
      if (!Array.isArray(roundTargetProfile.structureProfiles))
        return decorateResult({
          info: mustBeAnArray('structureProfiles'),
          result: { error: MISSING_VALUE },
          stack,
        });

      roundTarget = roundTargetProfile.roundTarget || roundTarget;

      const sortedStructureProfiles = roundTargetProfile.structureProfiles?.sort(sequenceSort) || [];

      let sequence = 1;
      for (const structureProfile of sortedStructureProfiles) {
        const {
          qualifyingRoundNumber,
          qualifyingPositions,
          seededParticipants,
          seedingScaleName,
          seedsCount = 0,
          seedByRanking,
          placeByes,
          drawSize,
        } = structureProfile;

        const qualifyingStageResult = prepareStage({
          ...drawTypeResult,
          ...params,
          seedingProfile: structureProfile.seedingProfile ?? seedingProfile,
          stageSequence: sequence,
          qualifyingRoundNumber,
          preparedStructureIds,
          qualifyingPositions,
          seededParticipants,
          stage: QUALIFYING,
          seedingScaleName,
          appliedPolicies,
          drawDefinition,
          qualifyingOnly,
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

        sequence += 1;

        if (qualifyingStageResult.conflicts?.length) qualifyingConflicts.push(...qualifyingStageResult.conflicts);

        if (qualifyingStageResult.positioningReport?.length)
          positioningReports.push({
            [QUALIFYING]: qualifyingStageResult.positioningReport,
          });
      }

      roundTarget += 1;
    }
  } else if (structureId && generateQualifyingPlaceholder) {
    const qualifyingStructure = structureTemplate({
      structureName: constantToString(QUALIFYING),
      stage: QUALIFYING,
    });
    const { link } = generateQualifyingLink({
      sourceStructureId: qualifyingStructure.structureId,
      targetStructureId: structureId,
      sourceRoundNumber: 0,
      linkType: POSITION,
    });
    if (!drawDefinition.structures) drawDefinition.structures = [];
    drawDefinition.structures.push(qualifyingStructure);
    if (!drawDefinition.links) drawDefinition.links = [];
    drawDefinition.links.push(link);
  }

  drawDefinition.drawName = params.drawName ?? (drawType && constantToString(drawType));

  if (drawSize && typeof voluntaryConsolation === 'object' && drawSize >= 4) {
    addVoluntaryConsolationStructure({
      ...voluntaryConsolation,
      drawDefinition,
      matchUpType,
    });
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
