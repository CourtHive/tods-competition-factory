import { tallyParticipantResults } from '@Query/matchUps/roundRobinTally/tallyParticipantResults';
import { getStructureSeedAssignments } from '@Query/structure/getStructureSeedAssignments';
import { getAllStructureMatchUps } from '@Query/matchUps/getAllStructureMatchUps';
import { getPositionAssignments } from '@Query/drawDefinition/positionsGetter';
import { getEventPublishStatus } from '@Query/event/getEventPublishStatus';
import { getDrawIsPublished } from '@Query/publishing/getDrawIsPublished';
import { getStructureGroups } from '@Query/structure/getStructureGroups';
import { createSubOrderMap } from '@Query/structure/createSubOrderMap';
import { getPublishState } from '@Query/publishing/getPublishState';
import { structureSort } from '@Functions/sorters/structureSort';
import { findStructure } from '@Acquire/findStructure';
import { findExtension } from '@Acquire/findExtension';
import { makeDeepCopy } from '@Tools/makeDeepCopy';
import { xa } from '@Tools/extractAttributes';

// constants and types
import { ErrorType, MISSING_DRAW_DEFINITION, UNLINKED_STRUCTURES } from '@Constants/errorConditionConstants';
import { CONSOLATION, MAIN, PLAY_OFF, QUALIFYING } from '@Constants/drawDefinitionConstants';
import { PARTICIPANT_ID } from '@Constants/attributeConstants';
import { PUBLIC } from '@Constants/timeItemConstants';
import { TALLY } from '@Constants/extensionConstants';
import { SUCCESS } from '@Constants/resultConstants';
import {
  ABANDONED,
  BYE,
  CANCELLED,
  COMPLETED,
  DEFAULTED,
  DOUBLE_DEFAULT,
  DOUBLE_WALKOVER,
  IN_PROGRESS,
  RETIRED,
  WALKOVER,
} from '@Constants/matchUpStatusConstants';

// NOTE: if { usePublishState: true } then { eventPublished } or { event } must be provided
export function getDrawData(params): {
  structures?: any[];
  success?: boolean;
  error?: ErrorType;
  drawInfo?: any;
} {
  const {
    tournamentParticipants = [],
    includePositionAssignments,
    policyDefinitions,
    tournamentRecord,
    inContext = true,
    usePublishState,
    status = PUBLIC,
    pressureRating,
    refreshResults,
    drawDefinition,
    noDeepCopy,
    sortConfig,
    context,
    event,
  } = params;

  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };

  const drawInfo: any = (({ matchUpFormat, updatedAt, drawType, drawName, drawId }) => ({
    matchUpFormat,
    updatedAt,
    drawName,
    drawType,
    drawId,
  }))(drawDefinition);

  let mainStageSeedAssignments, qualificationStageSeedAssignments;
  const { allStructuresLinked, sourceStructureIds, hasDrawFeedProfile, structureGroups } = getStructureGroups({
    drawDefinition,
  });

  if (!allStructuresLinked) return { error: UNLINKED_STRUCTURES };

  const publishStatus = params?.publishStatus ?? getEventPublishStatus({ event, status });
  const eventPublished = params.eventPublished ?? !!getPublishState({ event }).publishState?.status?.published;

  let drawActive = false;
  let participantPlacements = false; // if any positionAssignments include a participantId
  const groupedStructures = structureGroups.map((structureIds) => {
    const completedStructures = {};
    const structures = structureIds
      .map((structureId) => {
        const { structure } = findStructure({ drawDefinition, structureId });
        const { seedAssignments } = getStructureSeedAssignments({
          drawDefinition,
          structure,
        });

        // capture the seedAssignments for MAIN/QUALIFYING { stageSequence: 1 }
        if (structure?.stage === MAIN && structure.stageSequence === 1) {
          mainStageSeedAssignments = seedAssignments;
        }
        if (structure?.stage === QUALIFYING && structure.stageSequence === 1) {
          qualificationStageSeedAssignments = seedAssignments;
        }

        return structure;
      })
      .sort((a, b) => structureSort(a, b, sortConfig))
      .map((structure) => {
        if (!structure) return;
        const structureId = structure?.structureId;
        let seedAssignments = [];

        // pass seedAssignments from { stageSequence: 1 } to other stages
        if (structure.stage && [MAIN, CONSOLATION, PLAY_OFF].includes(structure.stage)) {
          seedAssignments = mainStageSeedAssignments;
        }

        if (structure?.stage === QUALIFYING) {
          seedAssignments = qualificationStageSeedAssignments;
        }

        const { matchUps, roundMatchUps, roundProfile } = getAllStructureMatchUps({
          // only propagate seedAssignments where none are present
          seedAssignments: !structure?.seedAssignments?.length ? seedAssignments : undefined,
          context: { drawId: drawInfo.drawId, ...context },
          tournamentParticipants,
          policyDefinitions,
          tournamentRecord,
          usePublishState,
          publishStatus,
          drawDefinition,
          inContext,
          structure,
          event,
        });

        const { positionAssignments } = getPositionAssignments({
          structure,
        });

        let participantResults = positionAssignments?.filter(xa(PARTICIPANT_ID)).map((assignment) => {
          const { drawPosition, participantId } = assignment;
          const { extension } = findExtension({
            element: assignment,
            name: TALLY,
          });
          participantPlacements = true;

          return {
            participantResult: extension?.value,
            participantId,
            drawPosition,
          };
        });

        if (matchUps.length && ((!participantResults?.length && params.allParticipantResults) || refreshResults)) {
          const { subOrderMap } = createSubOrderMap({ positionAssignments });
          const result = tallyParticipantResults({
            matchUpFormat: structure.matchUpFormat,
            policyDefinitions,
            pressureRating,
            subOrderMap,
            matchUps,
          });
          participantResults = positionAssignments?.filter(xa(PARTICIPANT_ID)).map((assignment) => {
            const { drawPosition, participantId } = assignment;
            participantPlacements = true;

            return {
              participantResult: participantId && result.participantResults[participantId],
              participantId,
              drawPosition,
            };
          });
        }

        const structureInfo: any = structure
          ? (({ stageSequence, structureName, structureType, matchUpFormat, stage }) => ({
              stageSequence,
              structureName,
              structureType,
              matchUpFormat,
              stage,
            }))(structure)
          : {};

        structureInfo.sourceStructureIds = sourceStructureIds[structureId];
        structureInfo.hasDrawFeedProfile = hasDrawFeedProfile[structureId];
        structureInfo.positionAssignments = positionAssignments;

        structureInfo.structureActive = matchUps.reduce((active, matchUp) => {
          const activeMatchUpStatus = [
            DOUBLE_WALKOVER,
            DOUBLE_DEFAULT,
            IN_PROGRESS,
            COMPLETED,
            CANCELLED,
            DEFAULTED,
            RETIRED,
            WALKOVER,
          ].includes(matchUp.matchUpStatus);
          return active || activeMatchUpStatus || !!matchUp.winningSide || !!matchUp.score?.scoreStringSide1;
        }, false);

        const structureCompleted = matchUps.reduce((completed, matchUp) => {
          return completed && [BYE, COMPLETED, RETIRED, WALKOVER, DEFAULTED, ABANDONED].includes(matchUp.matchUpStatus);
        }, !!matchUps.length);
        structureInfo.structureCompleted = structureCompleted;
        completedStructures[structureId] = structureCompleted;

        if (structureInfo.structureActive) drawActive = true;

        return {
          ...structureInfo,
          participantResults,
          seedAssignments,
          roundMatchUps,
          roundProfile,
          structureId,
        };
      });

    // cleanup attribute used for sorting
    structures.forEach((structure) => {
      if (!includePositionAssignments) delete structure.positionAssignments;
      structure.sourceStructuresComplete = structure.sourceStructureIds?.every((id) => completedStructures[id]);
    });

    return structures;
  });

  const structures = groupedStructures.flat();

  drawInfo.drawActive = drawActive;
  drawInfo.participantPlacements = participantPlacements;
  drawInfo.drawGenerated = structures?.reduce((generated, structure) => {
    return generated || !!structure?.roundMatchUps;
  }, false);
  drawInfo.drawCompleted = structures?.reduce(
    (completed, structure) => completed && structure.structureCompleted,
    true,
  );
  drawInfo.drawPublished = usePublishState
    ? eventPublished && getDrawIsPublished({ publishStatus, drawId: drawInfo.drawId })
    : undefined;

  return {
    structures:
      !usePublishState || drawInfo.drawPublished
        ? noDeepCopy
          ? structures
          : makeDeepCopy(structures, false, true)
        : undefined,
    drawInfo: noDeepCopy ? drawInfo : makeDeepCopy(drawInfo, false, true),
    ...SUCCESS,
  };
}
