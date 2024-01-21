import { generateDrawTypeAndModifyDrawDefinition } from '../generateDrawTypeAndModifyDrawDefinition';
import { addDrawEntry } from '../../../../mutate/drawDefinitions/entryGovernor/addDrawEntries';
import { generateQualifyingStructures } from '../drawTypes/generateQualifyingStructures';
import { getQualifiersCount } from '../../../../query/drawDefinition/getQualifiersCount';
import { addAdHocMatchUps } from '../../../../mutate/structures/addAdHocMatchUps';
import { checkFormatScopeEquivalence } from './checkFormatScopeEquivalence';
import { getParticipantId } from '../../../../global/functions/extractors';
import { generateQualifyingLink } from '../links/generateQualifyingLink';
import { policyAttachment } from './drawDefinitionPolicyAttachment';
import { generateAdHocMatchUps } from '../generateAdHocMatchUps';
import { generateRange } from '../../../../tools/arrays';
import { ensureInt } from '../../../../tools/ensureInt';
import { newDrawDefinition } from '../newDrawDefinition';
import { drawMatic } from '../drawMatic/drawMatic';
import { prepareStage } from './prepareStage';
import {
  setStageDrawSize,
  setStageQualifiersCount,
} from '../../../../mutate/drawDefinitions/entryGovernor/stageEntryCounts';

import { AD_HOC, LUCKY_DRAW, MAIN, QUALIFYING } from '../../../../constants/drawDefinitionConstants';
import { STRUCTURE_SELECTED_STATUSES } from '../../../../constants/entryStatusConstants';
import { ResultType, decorateResult } from '../../../../global/functions/decorateResult';
import { DrawMaticArgs, PolicyDefinitions } from '../../../../types/factoryTypes';
import {
  DrawDefinition,
  DrawTypeUnion,
  Entry,
  Event,
  EventTypeUnion,
  Participant,
  TieFormat,
  Tournament,
} from '../../../../types/tournamentTypes';

type GenerateOrGetExisting = {
  automated?: boolean | { seedsOnly: boolean };
  policyDefinitions?: PolicyDefinitions;
  appliedPolicies?: PolicyDefinitions;
  tournamentRecord: Tournament;
  matchUpType?: EventTypeUnion;
  participants?: Participant[];
  ignoreStageSpace?: boolean;
  qualifyingProfiles?: any[];
  drawMatic?: DrawMaticArgs;
  qualifyingOnly?: boolean;
  drawType?: DrawTypeUnion;
  processCodes?: string[];
  seedingProfile?: string;
  matchUpFormat?: string;
  eventEntries?: Entry[];
  drawEntries?: Entry[];
  tieFormat?: TieFormat;
  roundsCount?: number;
  seedsCount?: number;
  placeByes?: boolean;
  drawSize?: number;
  idPrefix?: string;
  isMock?: boolean;
  uuids?: string[];
  drawId?: string;
  event: Event;
};

export function generateOrGetExisting(params: GenerateOrGetExisting): ResultType & {
  existingDrawDefinition?: DrawDefinition;
  drawDefinition?: DrawDefinition;
  positioningReports?: any[];
  drawTypeResult?: any;
  structureId?: string;
  entries?: Entry[];
  conflicts?: any[];
} {
  const {
    ignoreStageSpace,
    tournamentRecord,
    policyDefinitions,
    appliedPolicies,
    qualifyingOnly,
    matchUpFormat,
    seedingProfile,
    participants,
    eventEntries,
    drawEntries,
    matchUpType,
    placeByes,
    tieFormat,
    drawType,
    drawSize,
    idPrefix,
    isMock,
    event,
  } = params;

  const stack = 'generateOrGetExisting';
  const positioningReports: any[] = [];
  let conflicts: any[] = [];

  const existingDrawDefinition = params.drawId
    ? (event?.drawDefinitions?.find((d) => d.drawId === params.drawId) as DrawDefinition)
    : undefined;

  if (existingDrawDefinition && drawType !== existingDrawDefinition.drawType)
    existingDrawDefinition.drawType = drawType as DrawTypeUnion;

  let drawDefinition: any =
    existingDrawDefinition ??
    newDrawDefinition({
      processCodes: params.processCodes,
      drawId: params.drawId,
      drawType,
    });

  const equivalenceResult = checkFormatScopeEquivalence({
    tournamentRecord,
    drawDefinition,
    matchUpFormat,
    matchUpType,
    tieFormat,
    event,
  });
  if (equivalenceResult.error) return decorateResult({ result: equivalenceResult, stack });

  const attachmentResult = policyAttachment({ appliedPolicies, policyDefinitions, drawDefinition, stack });
  if (attachmentResult.error) return attachmentResult;
  // ---------------------------------------------------------------------------

  // find existing MAIN structureId if existingDrawDefinition
  let structureId = existingDrawDefinition?.structures?.find(
    (structure) => structure.stage === MAIN && structure.stageSequence === 1,
  )?.structureId;
  const entries = drawEntries ?? eventEntries ?? [];
  let drawTypeResult;

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

  return {
    existingDrawDefinition,
    drawTypeResult,
    drawDefinition,
    positioningReports,
    conflicts,
    structureId,
    entries,
  };
}
