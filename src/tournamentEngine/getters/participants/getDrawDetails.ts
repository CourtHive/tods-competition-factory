import { getPositionAssignments } from '../../../drawEngine/getters/positionsGetter';
import { getDrawStructures } from '../../../drawEngine/getters/findStructure';
import { structureSort } from '../../../drawEngine/getters/structureSort';

import { MAIN, QUALIFYING } from '../../../constants/drawDefinitionConstants';
import { Entry, Event } from '../../../types/tournamentFromSchema';

// ADD: orderedStructures with stage, stageSequence info
type GetDrawDetailsArgs = {
  event: Event & { [key: string]: any };
  eventEntries?: Entry[];
  sortConfig?: any;
};
export function getDrawDetails({
  eventEntries,
  sortConfig,
  event,
}: GetDrawDetailsArgs) {
  const derivedInfo = {};

  const drawDetails = Object.assign(
    {},
    ...(event.drawDefinitions || []).map((drawDefinition: any) => {
      const entriesMap = Object.assign(
        {},
        ...(eventEntries || [])
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
        stage: QUALIFYING,
        drawDefinition,
      })?.structures?.[0];
      const qualifyingPositionAssignments =
        mainStructure &&
        getPositionAssignments({
          structure: qualifyingStructure,
        })?.positionAssignments;
      const qualifyingDrawSize = qualifyingPositionAssignments?.length;

      const mainSeedAssignments = mainStructure?.seedAssignments;
      const qualifyingSeedAssignments = qualifyingStructure?.seedAssignments;

      // used in rankings pipeline.
      // the structures in which a particpant particpates are ordered
      // to enable differentiation for Points-per-round and points-per-win
      const orderedStructureIds = (drawDefinition.structures || [])
        .sort((a, b) => structureSort(a, b, sortConfig))
        .map(({ structureId, structures }) => {
          return [
            structureId,
            ...(structures || []).map(({ structureId }) => structureId),
          ];
        })
        .flat(Infinity);

      const flightNumber = event?._flightProfile?.flights?.find(
        (flight) => flight.drawId === drawDefinition.drawId
      )?.flightNumber;

      derivedInfo[drawDefinition.drawId] = {
        qualifyingPositionAssignments,
        qualifyingSeedAssignments,
        mainPositionAssignments,
        mainSeedAssignments,
        orderedStructureIds,
        qualifyingDrawSize,
        flightNumber,
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
