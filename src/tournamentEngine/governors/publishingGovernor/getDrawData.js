import { getAllStructureMatchUps } from '../../../drawEngine/getters/getMatchUps/getAllStructureMatchUps';
import { getStructureSeedAssignments } from '../../../drawEngine/getters/getStructureSeedAssignments';
import { getPositionAssignments } from '../../../drawEngine/getters/positionsGetter';
import { findStructure } from '../../../drawEngine/getters/findStructure';
import { structureSort } from '../../../drawEngine/getters/structureSort';
import { findExtension } from '../queryGovernor/extensionQueries';
import { getDevContext } from '../../../global/globalState';
import {
  generateRange,
  intersection,
  makeDeepCopy,
  unique,
} from '../../../utilities';

import { MISSING_DRAW_DEFINITION } from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  ABANDONED,
  BYE,
  CANCELLED,
  COMPLETED,
  DEFAULTED,
  DOUBLE_WALKOVER,
  IN_PROGRESS,
  RETIRED,
  WALKOVER,
} from '../../../constants/matchUpStatusConstants';
import {
  CONSOLATION,
  MAIN,
  PLAY_OFF,
  QUALIFYING,
} from '../../../constants/drawDefinitionConstants';

export function getDrawData({
  tournamentParticipants = [],
  policyDefinition,
  inContext = true,
  drawDefinition,
  context,
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };

  const drawInfo = (({ drawId, drawName, matchUpFormat }) => ({
    drawId,
    drawName,
    matchUpFormat,
  }))(drawDefinition);

  let mainStageSeedAssignments, qualificationStageSeedAssignments;
  const { structureGroups } = getStructureGroups({ drawDefinition });

  let drawActive = false;
  let participantPlacements = false; // if any positionAssignments include a participantId
  const groupedStructures = structureGroups.map((structureIds) => {
    const structures = structureIds
      .map((structureId) => {
        const { structure } = findStructure({ drawDefinition, structureId });
        const { seedAssignments } = getStructureSeedAssignments({
          drawDefinition,
          structure,
        });

        // capture the seedAssignments for MAIN/QUALIFYING { stageSequence: 1 }
        if (structure.stage === MAIN && structure.stageSequence === 1) {
          mainStageSeedAssignments = seedAssignments;
        }
        if (structure.stage === QUALIFYING && structure.stageSequence === 1) {
          qualificationStageSeedAssignments = seedAssignments;
        }

        return structure;
      })
      .sort(structureSort)
      .map((structure) => {
        const { structureId } = structure;
        let seedAssignments = [];

        // pass seedAssignments from { stageSequence: 1 } to other stages
        if ([MAIN, CONSOLATION, PLAY_OFF].includes(structure.stage)) {
          seedAssignments = mainStageSeedAssignments;
        }

        if (structure.stage === QUALIFYING) {
          seedAssignments = qualificationStageSeedAssignments;
        }

        const { matchUps, roundMatchUps } = getAllStructureMatchUps({
          context: { drawId: drawInfo.drawId, ...context },
          tournamentParticipants,
          policyDefinition,
          seedAssignments,
          drawDefinition,
          structure,
          inContext,
        });

        const { positionAssignments } = getPositionAssignments({
          structure,
        });

        const participantResults = positionAssignments
          .filter(({ participantId }) => participantId)
          .map((assignment) => {
            participantPlacements = true;
            const { drawPosition, participantId } = assignment;
            const { extension } = findExtension({
              element: assignment,
              name: 'tally',
            });
            return (
              extension && {
                drawPosition,
                participantId,
                participantResult: extension.value,
              }
            );
          })
          .filter((f) => f?.participantResult);

        const structureInfo = (({
          stage,
          stageSequence,
          structureName,
          structureType,
          matchUpFormat,
          positionAssignments,
        }) => ({
          stage,
          stageSequence,
          structureName,
          structureType,
          matchUpFormat,
          positionAssignments,
        }))(structure);

        structureInfo.structureActive = matchUps.reduce((active, matchUp) => {
          const activeMatchUpStatus = [
            COMPLETED,
            CANCELLED,
            DEFAULTED,
            RETIRED,
            WALKOVER,
            IN_PROGRESS,
            DOUBLE_WALKOVER,
          ].includes(matchUp.matchUpStatus);
          return (
            active ||
            activeMatchUpStatus ||
            !!matchUp.winningSide ||
            !!matchUp.score?.scoreStringSide1
          );
        }, false);

        structureInfo.structureCompleted = matchUps.reduce(
          (completed, matchUp) => {
            return (
              completed &&
              [
                BYE,
                COMPLETED,
                RETIRED,
                WALKOVER,
                DEFAULTED,
                ABANDONED,
              ].includes(matchUp.matchUpStatus)
            );
          },
          true
        );

        if (structureInfo.structureActive) drawActive = true;

        return {
          ...structureInfo,
          structureId,
          roundMatchUps,
          seedAssignments,
          participantResults,
        };
      });

    // cleanup attribute used for sorting
    structures.forEach((structure) => delete structure.positionAssignments);

    return structures;
  });

  if (groupedStructures.length > 1) {
    const error = { error: 'drawDefinition contains unlinked structures' };
    if (getDevContext()) console.log(error);
    return error;
  }

  const structures = groupedStructures.flat();

  drawInfo.drawActive = drawActive;
  drawInfo.participantPlacements = participantPlacements;
  drawInfo.drawGenerated = structures?.reduce((generated, structure) => {
    return generated || !!structure?.roundMatchUps;
  }, false);
  drawInfo.drawCompleted = structures?.reduce(
    (completed, structure) => completed && structure.structureCompleted,
    true
  );

  return Object.assign({}, SUCCESS, {
    drawInfo: makeDeepCopy(drawInfo),
    structures: makeDeepCopy(structures),
  });
}

/**
 * return an array of arrays of grouped structureIds => structureGroups
 * the expectation is that all structures within a drawDefintion are linked
 * return a boolean whether this condition is met => allSructuresLinked
 */
export function getStructureGroups({ drawDefinition }) {
  const links = drawDefinition.links || [];

  let linkedStructureIds = links.map((link) => [
    link.source.structureId,
    link.target.structureId,
  ]);

  // iterate through all groups of structureIds to flatten tree of links between structures
  const iterations = linkedStructureIds.length;
  generateRange(0, Math.ceil(iterations / 2)).forEach(() => {
    linkedStructureIds = generateRange(0, iterations).map((index) => {
      const structureIds = linkedStructureIds[index];
      const mergedWithOverlappingIds =
        linkedStructureIds.reduce((biggest, ids) => {
          const overlap = intersection(structureIds, ids).length;
          return overlap ? biggest.concat(...ids) : biggest;
        }, []) || [];
      return unique(structureIds.concat(...mergedWithOverlappingIds));
    });
  });

  // at this point all linkedStructureIds arrays should be equivalent
  // use the first of these as the identity array
  const groupedStructures = linkedStructureIds[0];

  // utility method to recognize equivalent arrays of structureIds
  const identityLink = (a, b) => intersection(a, b).length === a.length;

  // check that all arrays of linkedStructureIds are equivalent to identity array
  const allLinkStructuresLinked = linkedStructureIds
    .slice(1)
    .reduce((allLinkStructuresLinked, ids) => {
      return allLinkStructuresLinked && identityLink(ids, groupedStructures);
    }, true);

  // if a drawDefinition contains no links the no structure groups will exist
  // filter out undefined when there are no links in a drawDefinition
  const structureGroups = [groupedStructures].filter((f) => f);

  // iterate through all structures to add missing structureIds
  const structures = drawDefinition.structures || [];
  structures.forEach((structure) => {
    const { structureId } = structure;
    const existingGroup = structureGroups.find((group) => {
      return group.includes(structureId);
    });
    if (!existingGroup) {
      structureGroups.push([structureId]);
    }
  });

  const allStructuresLinked =
    allLinkStructuresLinked && structureGroups.length === 1;

  return { structureGroups, allStructuresLinked };
}
