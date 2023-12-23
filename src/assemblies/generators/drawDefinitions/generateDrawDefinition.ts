import { generateDrawTypeAndModifyDrawDefinition } from './generateDrawTypeAndModifyDrawDefinition';
import { generateQualifyingStructures } from './drawTypes/generateQualifyingStructures';
import { addVoluntaryConsolationStructure } from '../../../mutate/drawDefinitions/addVoluntaryConsolationStructure';
import { setMatchUpFormat } from '../../../mutate/matchUps/matchUpFormat/setMatchUpFormat';
import { addDrawDefinition } from '../../../tournamentEngine/governors/eventGovernor/drawDefinitions/addDrawDefinition';
import { generateQualifyingLink } from './links/generateQualifyingLink';
import { generateAdHocMatchUps } from './generateAdHocMatchUps';
import { attachPolicies } from '../../../mutate/extensions/policies/attachPolicies';
import { checkValidEntries } from '../../../tournamentEngine/governors/eventGovernor/entries/checkValidEntries';
import { getAppliedPolicies } from '../../../query/extensions/getAppliedPolicies';
import { addDrawEntry } from '../../../drawEngine/governors/entryGovernor/addDrawEntries';
import { getQualifiersCount } from '../../../query/drawDefinition/getQualifiersCount';
import { getAllowedDrawTypes } from '../../../query/tournaments/allowedTypes';
import structureTemplate from './templates/structureTemplate';
import { getParticipants } from '../../../query/participants/getParticipants';
import { newDrawDefinition } from './newDrawDefinition';
import { mustBeAnArray } from '../../../utilities/mustBeAnArray';
import { isConvertableInteger } from '../../../utilities/math';
import { constantToString } from '../../../utilities/strings';
import { tieFormatDefaults } from '../../../tournamentEngine/generators/tieFormatDefaults';
import { ensureInt } from '../../../utilities/ensureInt';
import { validateTieFormat } from '../../../validators/validateTieFormat';
import { checkTieFormat } from '../../../mutate/tieFormat/checkTieFormat';
import { prepareStage } from './prepareStage';
import {
  setStageDrawSize,
  setStageQualifiersCount,
} from '../../../drawEngine/governors/entryGovernor/stageEntryCounts';
import { DrawMaticArgs, drawMatic } from './drawMatic/drawMatic';
import {
  extractAttributes,
  generateRange,
  makeDeepCopy,
  nextPowerOf2,
} from '../../../utilities';

import POLICY_SEEDING_DEFAULT from '../../../fixtures/policies/POLICY_SEEDING_DEFAULT';
import { FORMAT_STANDARD } from '../../../fixtures/scoring/matchUpFormats';
import { SUCCESS } from '../../../constants/resultConstants';
import { TEAM } from '../../../constants/matchUpTypes';
import {
  ErrorType,
  INVALID_DRAW_TYPE,
  INVALID_VALUES,
  MISSING_DRAW_SIZE,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';
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
} from '../../../constants/drawDefinitionConstants';
import {
  ResultType,
  decorateResult,
} from '../../../global/functions/decorateResult';
import {
  QUALIFIER,
  STRUCTURE_SELECTED_STATUSES,
} from '../../../constants/entryStatusConstants';
import {
  POLICY_TYPE_AVOIDANCE,
  POLICY_TYPE_DRAWS,
  POLICY_TYPE_MATCHUP_ACTIONS,
  POLICY_TYPE_SEEDING,
} from '../../../constants/policyConstants';
import {
  DrawDefinition,
  DrawTypeUnion,
  Entry,
  Event,
  TieFormat,
  Tournament,
  EventTypeUnion,
} from '../../../types/tournamentTypes';
import {
  PlayoffAttributes,
  PolicyDefinitions,
  SeedingProfile,
} from '../../../types/factoryTypes';

type GenerateDrawDefinitionArgs = {
  automated?: boolean | { seedsOnly: boolean };
  playoffAttributes?: PlayoffAttributes;
  policyDefinitions?: PolicyDefinitions;
  voluntaryConsolation?: {
    structureAbbreviation?: string;
    structureName?: string;
    structureId?: string;
  };
  ignoreAllowedDrawTypes?: boolean;
  qualifyingPlaceholder?: boolean;
  considerEventEntries?: boolean;
  seedingProfile?: SeedingProfile;
  hydrateCollections?: boolean;
  tournamentRecord: Tournament;
  drawTypeCoercion?: boolean;
  ignoreStageSpace?: boolean;
  qualifyingProfiles?: any[];
  drawMatic?: DrawMaticArgs;
  qualifyingOnly?: boolean;
  drawType?: DrawTypeUnion;
  enforceGender?: boolean;
  processCodes?: string[];
  matchUpFormat?: string;
  matchUpType?: EventTypeUnion;
  structureName?: string;
  tieFormatName?: string;
  tieFormat?: TieFormat;
  drawEntries?: Entry[];
  roundsCount?: number;
  addToEvent?: boolean;
  seedsCount?: number;
  placeByes?: boolean;
  drawName?: string;
  drawSize?: number;
  idPrefix?: string;
  isMock?: boolean;
  uuids?: string[];
  drawId?: string;
  event: Event;
};

export function generateDrawDefinition(
  params: GenerateDrawDefinitionArgs
): ResultType & {
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
  const {
    considerEventEntries = true, // in the absence of drawSize and drawEntries, look to event.entries
    ignoreAllowedDrawTypes,
    voluntaryConsolation,
    hydrateCollections,
    ignoreStageSpace,
    tournamentRecord,
    qualifyingOnly,
    tieFormatName,
    drawEntries,
    addToEvent,
    placeByes,
    event,
  } = params;

  const appliedPolicies =
    getAppliedPolicies({
      tournamentRecord,
      event,
    }).appliedPolicies ?? {};

  const policyDefinitions = makeDeepCopy(
    params.policyDefinitions ?? {},
    false,
    true
  );

  const drawTypeCoercion =
    params.drawTypeCoercion ??
    policyDefinitions?.[POLICY_TYPE_DRAWS]?.drawTypeCoercion ??
    appliedPolicies?.[POLICY_TYPE_DRAWS]?.drawTypeCoercion ??
    true;

  const drawType =
    (drawTypeCoercion && params.drawSize === 2 && SINGLE_ELIMINATION) ||
    params.drawType ||
    SINGLE_ELIMINATION;

  const seedingPolicy =
    policyDefinitions?.[POLICY_TYPE_SEEDING] ??
    appliedPolicies?.[POLICY_TYPE_SEEDING];

  const seedingProfile =
    params.seedingProfile ??
    seedingPolicy?.seedingProfile?.drawTypes?.[drawType] ??
    seedingPolicy?.seedingProfile;

  // extend policyDefinitions only if a seedingProfile was specified in params
  if (params.seedingProfile) {
    if (!policyDefinitions[POLICY_TYPE_SEEDING]) {
      policyDefinitions[POLICY_TYPE_SEEDING] = {
        ...POLICY_SEEDING_DEFAULT[POLICY_TYPE_SEEDING],
      };
    }
    policyDefinitions[POLICY_TYPE_SEEDING].seedingProfile = seedingProfile;
  }

  // get participants both for entry validation and for automated placement
  // automated placement requires them to be "inContext" for avoidance policies to work
  const { participants, participantMap } = getParticipants({
    withIndividualParticipants: true,
    convertExtensions: true,
    internalUse: true,
    tournamentRecord,
  });

  const enforceGender =
    params.enforceGender ??
    policyDefinitions?.[POLICY_TYPE_MATCHUP_ACTIONS]?.participants
      ?.enforceGender ??
    appliedPolicies?.[POLICY_TYPE_MATCHUP_ACTIONS]?.participants?.enforceGender;

  // if tournamentRecord is provided, and unless instructed to ignore valid types,
  // check for restrictions on allowed drawTypes
  const allowedDrawTypes =
    !ignoreAllowedDrawTypes &&
    tournamentRecord &&
    getAllowedDrawTypes({
      tournamentRecord,
      categoryType: event?.category?.categoryType,
      categoryName: event?.category?.categoryName,
    });
  if (allowedDrawTypes?.length && !allowedDrawTypes.includes(drawType)) {
    return decorateResult({ result: { error: INVALID_DRAW_TYPE }, stack });
  }

  const eventEntries =
    event?.entries?.filter(
      (entry: Entry) =>
        entry.entryStatus &&
        [...STRUCTURE_SELECTED_STATUSES, QUALIFIER].includes(entry.entryStatus)
    ) ?? [];

  const consideredEntries = (
    (qualifyingOnly && []) ||
    drawEntries ||
    (considerEventEntries ? eventEntries : [])
  ).filter(({ entryStage }) => !entryStage || entryStage === MAIN);

  // entries participantTypes must correspond with eventType
  // this is only possible if the event is provided
  const validEntriesResult =
    event &&
    participants &&
    checkValidEntries({
      consideredEntries,
      appliedPolicies,
      participantMap,
      enforceGender,
      participants,
      event,
    });

  if (validEntriesResult?.error)
    return decorateResult({ result: validEntriesResult, stack });

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
  const drawSize =
    derivedDrawSize ||
    (params.drawSize &&
      isConvertableInteger(params.drawSize) &&
      ensureInt(params.drawSize)) ||
    false; // required for isNaN check

  if (isNaN(drawSize) && drawType !== AD_HOC) {
    return decorateResult({
      result: { error: MISSING_DRAW_SIZE },
      stack,
    });
  }

  let seedsCount =
    typeof params.seedsCount !== 'number'
      ? ensureInt(params.seedsCount ?? 0)
      : params.seedsCount ?? 0;

  const eventType = event?.eventType;
  const matchUpType = params.matchUpType ?? eventType;

  const existingDrawDefinition = params.drawId
    ? (event?.drawDefinitions?.find(
        (d) => d.drawId === params.drawId
      ) as DrawDefinition)
    : undefined;

  // drawDefinition cannot have both tieFormat and matchUpFormat
  let { tieFormat, matchUpFormat } = params;

  // TODO: implement use of tieFormatId and tieFormats array
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
      matchUpFormat = FORMAT_STANDARD;
    }
  }

  if (tieFormat) {
    const result = validateTieFormat({
      gender: event?.gender,
      enforceGender,
      tieFormat,
    });
    if (result.error) return decorateResult({ result, stack });
  }

  const invalidDrawId = params.drawId && typeof params.drawId !== 'string';
  if (invalidDrawId)
    return decorateResult({ result: { error: INVALID_VALUES }, stack });

  // ---------------------------------------------------------------------------
  // Begin construction of drawDefinition
  if (existingDrawDefinition && drawType !== existingDrawDefinition.drawType)
    existingDrawDefinition.drawType = drawType;

  let drawDefinition =
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
      (event?.tieFormat &&
        tieFormat &&
        JSON.stringify(event.tieFormat) === JSON.stringify(tieFormat));

    // if an equivalent matchUpFormat or tieFormat is attached to the event
    // there is no need to attach to the drawDefinition
    if (!equivalentInScope) {
      if (tieFormat) {
        const result = checkTieFormat({ tieFormat });
        if (result.error) return decorateResult({ result, stack });

        drawDefinition.tieFormat = result.tieFormat ?? tieFormat;
      } else if (matchUpFormat) {
        const result = setMatchUpFormat({
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
    [POLICY_TYPE_AVOIDANCE]: appliedPolicies[POLICY_TYPE_AVOIDANCE],
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
        if (
          JSON.stringify(appliedPolicies?.[key]) !==
          JSON.stringify(policyDefinitions[key])
        ) {
          policiesToAttach[key] = policyDefinitions[key];
        }
      }

      if (Object.keys(policiesToAttach).length) {
        // attach any policyDefinitions which have been provided and are not already present
        attachPolicies({
          policyDefinitions: policiesToAttach,
          drawDefinition,
        });
        Object.assign(appliedPolicies, policiesToAttach);
      }
    }
  } else if (policiesToAttach.avoidance) {
    attachPolicies({ drawDefinition, policyDefinitions: policiesToAttach });
  }

  if (
    !appliedPolicies[POLICY_TYPE_SEEDING] &&
    !policyDefinitions[POLICY_TYPE_SEEDING]
  ) {
    attachPolicies({
      policyDefinitions: POLICY_SEEDING_DEFAULT,
      drawDefinition,
    });
    Object.assign(appliedPolicies, POLICY_SEEDING_DEFAULT);
  }
  // ---------------------------------------------------------------------------

  // find existing MAIN structureId if existingDrawDefinition
  let structureId = existingDrawDefinition?.structures?.find(
    (structure) => structure.stage === MAIN && structure.stageSequence === 1
  )?.structureId;
  const entries = drawEntries ?? eventEntries;
  const positioningReports: any[] = [];
  let drawTypeResult;
  let conflicts: any[] = [];

  const generateQualifyingPlaceholder =
    params.qualifyingPlaceholder &&
    !params.qualifyingProfiles?.length &&
    !existingDrawDefinition;

  const existingQualifyingStructures = existingDrawDefinition
    ? existingDrawDefinition.structures?.filter(
        (structure) => structure.stage === QUALIFYING
      )
    : [];
  const existingQualifyingPlaceholderStructureId =
    existingQualifyingStructures?.length === 1 &&
    !existingQualifyingStructures[0].matchUps?.length &&
    existingQualifyingStructures[0].structureId;

  if (existingQualifyingPlaceholderStructureId) {
    const qualifyingProfiles = params.qualifyingProfiles;
    const qualifyingResult = qualifyingProfiles?.length
      ? generateQualifyingStructures({
          idPrefix: params.idPrefix,
          isMock: params.isMock,
          uuids: params.uuids,
          qualifyingProfiles,
          appliedPolicies,
        })
      : undefined;

    if (qualifyingResult?.error) {
      return qualifyingResult;
    }

    drawDefinition.structures = drawDefinition.structures?.filter(
      ({ structureId }) =>
        structureId !== existingQualifyingPlaceholderStructureId
    );
    drawDefinition.links = drawDefinition.links?.filter(
      ({ source }) =>
        source.structureId !== existingQualifyingPlaceholderStructureId
    );

    const { qualifiersCount, qualifyingDrawPositionsCount, qualifyingDetails } =
      qualifyingResult ?? {};

    if (qualifyingDrawPositionsCount) {
      if (qualifyingResult?.structures) {
        drawDefinition.structures?.push(...qualifyingResult.structures);
      }
      if (qualifyingResult?.links) {
        drawDefinition.links?.push(...qualifyingResult.links);
      }
    }

    const mainStructure = drawDefinition.structures?.find(
      ({ stage, stageSequence }) => stage === MAIN && stageSequence === 1
    );
    const { qualifiersCount: existingQualifiersCount } = getQualifiersCount({
      stageSequence: 1,
      drawDefinition,
      structureId,
      stage: MAIN,
    });

    const derivedQualifiersCount = Math.max(
      qualifiersCount ?? 0,
      existingQualifiersCount ?? 0
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

    for (const entry of (drawEntries ?? []).filter(
      ({ entryStage }) => entryStage === QUALIFYING
    )) {
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
    if (drawType === LUCKY_DRAW) seedsCount = 0;

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
          (!entryStage || entryStage === MAIN) &&
          entryStatus &&
          STRUCTURE_SELECTED_STATUSES.includes(entryStatus)
      );
      const participantIds = entries?.map(extractAttributes('participantId'));
      const matchUpsCount = entries ? Math.floor(entries.length / 2) : 0;
      generateRange(1, params.roundsCount + 1).forEach(() => {
        if (params.automated) {
          const {
            restrictEntryStatus,
            generateMatchUps,
            addToStructure,
            maxIterations,
            structureId,
            matchUpIds,
            scaleName,
          } = params.drawMatic ?? {};

          drawMatic({
            tournamentRecord,
            participantIds,
            drawDefinition,

            eventType: params.drawMatic?.eventType ?? matchUpType,
            generateMatchUps: generateMatchUps ?? true,
            restrictEntryStatus,
            addToStructure,
            maxIterations,
            structureId,
            matchUpIds,
            scaleName, // custom rating name to seed dynamic ratings
          });
        } else {
          generateAdHocMatchUps({
            addToStructure: true,
            tournamentRecord,
            newRound: true,
            drawDefinition,
            matchUpsCount,
          });
        }
      });
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

      const sortedStructureProfiles =
        roundTargetProfile.structureProfiles?.sort(sequenceSort) || [];

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

        if (qualifyingStageResult.conflicts?.length)
          qualifyingConflicts.push(...qualifyingStageResult.conflicts);

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

  drawDefinition.drawName =
    params.drawName ?? (drawType && constantToString(drawType));

  if (typeof voluntaryConsolation === 'object' && drawSize >= 4) {
    addVoluntaryConsolationStructure({
      ...voluntaryConsolation,
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
