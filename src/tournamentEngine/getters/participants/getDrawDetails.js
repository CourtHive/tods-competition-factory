import { getPositionAssignments } from '../../../drawEngine/getters/positionsGetter';
import { getDrawStructures } from '../../../drawEngine/getters/findStructure';

import { MAIN, QUALIFYING } from '../../../constants/drawDefinitionConstants';

// ADD: orderedStructures with stage, stageSequence info
export function getDrawDetails({ event, eventEntries }) {
  const derivedInfo = {};
  const drawDetails = Object.assign(
    {},
    ...(event.drawDefinitions || []).map((drawDefinition) => {
      const entriesMap = Object.assign(
        {},
        ...eventEntries
          .filter((entry) => entry.participantId)
          .map((entry) => ({ [entry.participantId]: entry })),
        ...drawDefinition.entries
          .filter((entry) => entry.participantId)
          .map((entry) => ({ [entry.participantId]: entry }))
      );
      const drawEntries = Object.values(entriesMap);
      const mainStructure = getDrawStructures({
        stageSequence: 1,
        drawDefinition,
        stage: MAIN,
      })?.structures?.[0];

      const mainPositionAssignments =
        mainStructure &&
        getPositionAssignments({
          structure: mainStructure,
        })?.positionAssignments;
      const drawSize = mainPositionAssignments?.length;
      const qualifyingStructure = getDrawStructures({
        stageSequence: 1,
        drawDefinition,
        stage: QUALIFYING,
      })?.structures?.[0];
      const qualifyingPositionAssignments =
        mainStructure &&
        getPositionAssignments({
          structure: qualifyingStructure,
        })?.positionAssignments;
      const qualifyingDrawSize = qualifyingPositionAssignments?.length;

      derivedInfo[drawDefinition.drawId] = {
        qualifyingPositionAssignments,
        mainPositionAssignments,
        qualifyingDrawSize,
        drawSize,
      };

      return {
        [drawDefinition.drawId]: {
          drawType: drawDefinition.drawType,
          drawEntries,
        },
      };
    })
  );

  return { derivedInfo, drawDetails };
}
