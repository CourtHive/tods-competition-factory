import drawEngine from '../../sync';
import tournamentEngine from '../../../tournamentEngine/sync';

import { generateTournamentWithParticipants } from '../../../mocksEngine/generators/generateTournamentWithParticipants';
import { allPlayoffPositionsFilled } from '../../governors/queryGovernor/structureActions';
import { generateMatchUpOutcome } from '../primitives/generateMatchUpOutcome';
import { reset, initialize } from '../primitives/primitives';
import { generateRange } from '../../../utilities';

import {
  MAIN,
  PLAY_OFF,
  POSITION,
  WATERFALL,
  ROUND_ROBIN_WITH_PLAYOFF,
} from '../../../constants/drawDefinitionConstants';

import { SUCCESS } from '../../../constants/resultConstants';
import { SINGLES } from '../../../constants/eventConstants';

export function roundRobinWithPlayoffsTest({
  drawSize,
  groupSize,
  groupsCount,
  playoffGroups,
  participantsCount,
  finishingGroupSizes,
}) {
  reset();
  initialize();
  groupsCount = groupsCount || drawSize / groupSize;
  const drawType = ROUND_ROBIN_WITH_PLAYOFF;
  const structureOptions = {
    groupSize,
    playoffGroups,
  };

  const { tournamentRecord } = generateTournamentWithParticipants({
    participantsCount,
  });
  const { participants } = tournamentRecord;
  tournamentEngine.setState(tournamentRecord);

  const event = {
    eventName: 'Round Robin w/ Playoffs',
    eventType: SINGLES,
  };

  let result = tournamentEngine.addEvent({ event });
  const { event: createdEvent, success } = result;
  const { eventId } = createdEvent;
  expect(success).toEqual(true);

  const participantIds = participants.map((p) => p.participantId);
  result = tournamentEngine.addEventEntries({ eventId, participantIds });
  expect(result).toEqual(SUCCESS);

  const matchUpFormat = 'SET3-S:6/TB7';
  const { drawDefinition } = tournamentEngine.generateDrawDefinition({
    eventId,
    drawType,
    drawSize,
    matchUpFormat,
    structureOptions,
    seedingProfile: WATERFALL,
  });

  // the number of links should equal the number of playoff playoffGroups
  expect(drawDefinition.links.length).toEqual(playoffGroups.length);

  result = tournamentEngine.addDrawDefinition({ eventId, drawDefinition });
  expect(result).toEqual(SUCCESS);

  const mainStructure = drawDefinition.structures.find(
    (structure) => structure.stage === MAIN
  );

  // the number of structureType: ITEM structures in the MAIN structureType: CONTAINER
  // should equal the number of groups
  expect(mainStructure.structures.length).toEqual(groupsCount);

  // the groupSize for each ITEM structure should be the same
  mainStructure.structures.forEach((structure) => {
    expect(structure.positionAssignments.length).toEqual(groupSize);
  });

  // itemdify all playoff structures by stage: PLAY_OFF
  const playoffStructures = drawDefinition.structures.reduce(
    (structures, structure) => {
      return structure.stage === PLAY_OFF
        ? structures.concat(structure)
        : structures;
    },
    []
  );

  // the number of playoff structures should equal the number of specified playoff groups
  expect(playoffStructures.length).toEqual(playoffGroups.length);

  // check that each group has the expected number of possition asignments
  playoffStructures.forEach((structure, index) => {
    expect(structure.positionAssignments.length).toEqual(
      playoffGroups[index].positionAssignmentsCount
    );
  });

  const playoffStructureIds = playoffStructures.map(
    (structure) => structure.structureId
  );

  const positioningLinks = drawDefinition.links.filter(
    (link) => link.linkType === POSITION
  );

  positioningLinks.forEach((link) => {
    expect(link.source.structureId).toEqual(mainStructure.structureId);
    const targetIsPlayoffStructure = playoffStructureIds.includes(
      link.target.structureId
    );
    expect(targetIsPlayoffStructure).toEqual(true);
  });

  const { drawId } = drawDefinition;

  // now complete all matchUps in the Round Robin (MAIN) structure
  mainStructure.structures.forEach((structure) => {
    const structureMatchUps = structure.matchUps;
    structureMatchUps.forEach((matchUp) => {
      const { matchUpId } = matchUp;
      if (matchUp.matchUpStatus !== 'BYE') {
        const setValues = [
          [6, 0],
          [6, 0],
        ];
        const outcome = generateMatchUpOutcome({
          matchUpFormat,
          setValues,
        });
        const result = tournamentEngine.setMatchUpStatus({
          drawId,
          matchUpId,
          outcome,
        });
        expect(result.success).toEqual(true);
      }
    });
  });

  const { matchUps: eventMatchUps } = tournamentEngine.allEventMatchUps({
    eventId,
    inContext: true,
  });

  const finishingPositionGroups = {};
  const structureParticipantGroupings = [];

  const orderValues = generateRange(1, groupSize + 1);
  mainStructure.structures.forEach((structure) => {
    const { structureId } = structure;

    const structureMatchUps = eventMatchUps.filter(
      (matchUp) => matchUp.structureId === structureId
    );

    const { participantResults } = drawEngine.tallyParticipantResults({
      matchUps: structureMatchUps,
      matchUpFormat,
    });

    const structureParticipantIds = Object.keys(participantResults);
    structureParticipantGroupings.push(structureParticipantIds);

    structureParticipantIds.forEach((key) => {
      const { groupOrder } = participantResults[key];
      if (!finishingPositionGroups[groupOrder])
        finishingPositionGroups[groupOrder] = [];
      finishingPositionGroups[groupOrder].push(key);
      expect(orderValues.includes(groupOrder)).toEqual(true);
    });
  });

  Object.keys(finishingPositionGroups).forEach((key, index) => {
    expect(finishingPositionGroups[key].length).toEqual(
      finishingGroupSizes[index]
    );
  });

  result = tournamentEngine.automatedPlayoffPositioning({
    drawId,
    structureId: mainStructure.structureId,
  });
  expect(result).toEqual(SUCCESS);

  let {
    drawDefinition: updatedDrawDefinition,
  } = tournamentEngine.getDrawDefinition({ drawId });

  const updatedPlayoffStructures = updatedDrawDefinition.structures.reduce(
    (structures, structure) => {
      return structure.stage === PLAY_OFF
        ? structures.concat(structure)
        : structures;
    },
    []
  );

  updatedPlayoffStructures.forEach((structure, index) => {
    const participantIds = structure.positionAssignments
      .map((assignment) => assignment.participantId)
      .filter((f) => f);
    expect(participantIds.length).toEqual(
      playoffGroups[index].participantIdsCount
    );
    const byes = structure.positionAssignments
      .map((assignment) => assignment.bye)
      .filter((f) => f);
    expect(byes.length).toEqual(playoffGroups[index].byesCount);
  });

  ({ drawDefinition: updatedDrawDefinition } = tournamentEngine.getEvent({
    drawId,
  }));
  const allPositionsFilled = allPlayoffPositionsFilled({
    drawDefinition: updatedDrawDefinition,
    structureId: mainStructure.structureId,
  });
  expect(allPositionsFilled).toEqual(true);

  return { drawDefinition: updatedDrawDefinition };
}
