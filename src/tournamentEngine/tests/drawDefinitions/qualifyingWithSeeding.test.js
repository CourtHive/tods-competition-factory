import { getParticipantId } from '../../../global/functions/extractors';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';
import { expect, it } from 'vitest';

import { MAIN, QUALIFYING } from '../../../constants/drawDefinitionConstants';
import { RATING, SEEDING } from '../../../constants/scaleConstants';
import { SINGLES } from '../../../constants/eventConstants';
import { ELO } from '../../../constants/ratingConstants';

// TODO: unPublishEventSeeding - unPublish only MAIN or only QUALIFYING or both...
const scenarios = [
  {
    qualifyingPositions: 4,
    seededDrawPositions: [
      [1, 1],
      [2, 9],
      [3, 17],
      [4, 25],
    ],
    seedsCount: 4,
    drawSize: 32,
  },
];

it.each(scenarios)(
  'can generate and seed a qualifying structure',
  (scenario) => {
    const ratingType = ELO;
    const participantsCount = 44;
    const {
      eventIds: [eventId],
      tournamentRecord,
    } = mocksEngine.generateTournamentRecord({
      eventProfiles: [
        { eventName: 'QTest', category: { categoryName: 'U18' } },
      ],
      participantsProfile: {
        scaledParticipantsCount: participantsCount,
        category: { ratingType },
        participantsCount,
      },
    });

    tournamentEngine.setState(tournamentRecord);

    let event = tournamentEngine.getEvent({ eventId }).event;
    expect(event.entries.length).toEqual(0);

    const participants =
      tournamentEngine.getTournamentParticipants().tournamentParticipants;
    expect(participants.length).toEqual(participantsCount);

    const scaledParticipants = participants.filter(
      ({ timeItems }) => timeItems
    );
    expect(scaledParticipants.length).toEqual(participantsCount);

    const scaleAttributes = {
      scaleType: RATING,
      eventType: SINGLES,
      scaleName: ELO,
    };
    let result = tournamentEngine.participantScaleItem({
      participant: scaledParticipants[0],
      scaleAttributes,
    });
    expect(result.scaleItem.scaleName).toEqual(ratingType);

    const participantIds = participants.map(getParticipantId);
    const mainStageEntryIds = participantIds.slice(0, 12);
    const qualifyingStageEntryIds = participantIds.slice(12);

    const sortedQualifyingParticipantIds = qualifyingStageEntryIds.sort(
      (a, b) =>
        tournamentEngine.getParticipantScaleItem({
          scaleAttributes,
          participantId: a,
        }).scaleItem.scaleValue -
        tournamentEngine.getParticipantScaleItem({
          scaleAttributes,
          participantId: b,
        }).scaleItem.scaleValue
    );

    result = tournamentEngine.addEventEntries({
      participantIds: mainStageEntryIds,
      eventId,
    });
    expect(result.success).toEqual(true);

    result = tournamentEngine.addEventEntries({
      participantIds: qualifyingStageEntryIds,
      entryStage: QUALIFYING,
      eventId,
    });
    expect(result.success).toEqual(true);

    const qualifyingSeedingScaleName = 'QS';
    const scaleValues = [1, 2, 3, 4, 5, 6, 7, 8];
    scaleValues.forEach((scaleValue, index) => {
      let scaleItem = {
        scaleName: qualifyingSeedingScaleName,
        scaleType: SEEDING,
        eventType: SINGLES,
        scaleValue,
      };
      const participantId = sortedQualifyingParticipantIds[index];
      let result = tournamentEngine.setParticipantScaleItem({
        participantId,
        scaleItem,
      });
      expect(result.success).toEqual(true);
    });

    const sortedMainParticipantIds = mainStageEntryIds.sort(
      (a, b) =>
        tournamentEngine.getParticipantScaleItem({
          scaleAttributes,
          participantId: a,
        }).scaleItem.scaleValue -
        tournamentEngine.getParticipantScaleItem({
          scaleAttributes,
          participantId: b,
        }).scaleItem.scaleValue
    );

    const mainSeedingScaleName = 'MS';
    scaleValues.forEach((scaleValue, index) => {
      let scaleItem = {
        scaleName: mainSeedingScaleName,
        scaleType: SEEDING,
        eventType: SINGLES,
        scaleValue,
      };
      const participantId = sortedMainParticipantIds[index];
      let result = tournamentEngine.setParticipantScaleItem({
        participantId,
        scaleItem,
      });
      expect(result.success).toEqual(true);
    });

    // first get all participants that have SEEDING timeItems
    let { tournamentParticipants } =
      tournamentEngine.getTournamentParticipants();

    let seedScaledParticipants = tournamentParticipants.filter(
      ({ timeItems }) =>
        timeItems?.find(
          (timeItem) => timeItem.itemType.split('.')[1] === 'SEEDING'
        )
    );

    let seedScaledParticipantIds = seedScaledParticipants.map(getParticipantId);
    expect(seedScaledParticipantIds.length).toEqual(16);

    // now attempt to get hydrated seeding information when { usePublishState: true }
    tournamentParticipants = tournamentEngine.getTournamentParticipants({
      convertExtensions: true,
      usePublishState: true,
      withStatistics: true,
      withGroupings: true,
      withOpponents: true,
      withMatchUps: true,
      withSeeding: true,
      inContext: true,
      withDraws: true,
      participantFilters: {
        participantRoles: ['COMPETITOR'],
      },
    }).tournamentParticipants;

    let targetParticipants = tournamentParticipants
      .filter(({ participantId }) =>
        seedScaledParticipantIds.includes(participantId)
      )
      .filter(({ events }) => events[0].seedAssignments);
    // no seeding has been published, so we expect no participants with hydrated seeding information
    expect(targetParticipants.length).toEqual(0);

    // test getParticipants parity
    let p = tournamentEngine.getParticipants({
      usePublishState: true,
      withSeeding: true,
      withEvents: true,
      withDraws: true,
    }).participants;

    let tP = p
      .filter(({ participantId }) =>
        seedScaledParticipantIds.includes(participantId)
      )
      .filter(({ events }) => events[0].seedAssignments);
    expect(tP.length).toEqual(0);

    // now attempt to get hydrated seeding information when { usePublishState: false }
    tournamentParticipants = tournamentEngine.getTournamentParticipants({
      convertExtensions: true,
      usePublishState: false,
      withStatistics: true,
      withOpponents: true,
      withGroupings: true,
      withMatchUps: true,
      inContext: true,
      withSeeding: {
        // NOTE: this currently only works for a single event...
        [QUALIFYING]: qualifyingSeedingScaleName,
        [MAIN]: mainSeedingScaleName,
      },
      participantFilters: {
        participantRoles: ['COMPETITOR'],
      },
    }).tournamentParticipants;

    targetParticipants = tournamentParticipants
      .filter(({ participantId }) =>
        seedScaledParticipantIds.includes(participantId)
      )
      .filter(({ events }) => events[0].seedAssignments);
    expect(targetParticipants.length).toEqual(16);

    // test getParticipants parity
    p = tournamentEngine.getParticipants({
      usePublishState: false,
      withSeeding: {
        // NOTE: this currently only works for a single event...
        [QUALIFYING]: qualifyingSeedingScaleName,
        [MAIN]: mainSeedingScaleName,
      },
      withEvents: true,
      withDraws: true,
    }).participants;

    tP = p
      .filter(({ participantId }) =>
        seedScaledParticipantIds.includes(participantId)
      )
      .filter(({ events }) => events[0].seedAssignments);
    expect(tP.length).toEqual(16);

    result = tournamentEngine.publishEventSeeding({
      stageSeedingScaleNames: {
        [QUALIFYING]: qualifyingSeedingScaleName,
        [MAIN]: mainSeedingScaleName,
      },
      eventId,
    });

    tournamentParticipants = tournamentEngine.getTournamentParticipants({
      convertExtensions: true,
      usePublishState: true,
      withStatistics: true,
      withGroupings: true,
      withOpponents: true,
      withMatchUps: true,
      withSeeding: true,
      inContext: true,
      participantFilters: {
        participantRoles: ['COMPETITOR'],
      },
    }).tournamentParticipants;
    targetParticipants = tournamentParticipants
      .filter(({ participantId }) =>
        seedScaledParticipantIds.includes(participantId)
      )
      .filter(({ events }) => events[0].seedAssignments);
    expect(targetParticipants.length).toEqual(16);

    let seedAssignments = targetParticipants.map(
      ({ events }) => events[0].seedAssignments
    );
    for (const seedAssignment of seedAssignments) {
      expect(Object.values(seedAssignment)[0].seedValue).not.toBeUndefined();
    }
    expect(targetParticipants.length).toEqual(16);

    // test getParticipants parity
    p = tournamentEngine.getParticipants({
      usePublishState: true,
      withSeeding: true,
      withEvents: true,
    }).participants;

    tP = p
      .filter(({ participantId }) =>
        seedScaledParticipantIds.includes(participantId)
      )
      .filter(({ events }) => events[0].seedAssignments);
    seedAssignments = tP.map(({ events }) => events[0].seedAssignments);
    for (const seedAssignment of seedAssignments) {
      expect(Object.values(seedAssignment)[0].seedValue).not.toBeUndefined();
    }
    // end parity check

    result = tournamentEngine.generateDrawDefinition({
      qualifyingProfiles: [
        {
          structureProfiles: [
            {
              seedingScaleName: qualifyingSeedingScaleName,
              ...scenario,
            },
          ],
        },
      ],
      qualifyingOnly: true,
      eventId,
    });
    expect(result.success).toEqual(true);
    const drawDefinition = result.drawDefinition;
    expect(drawDefinition.structures.length).toEqual(2);
    expect(
      drawDefinition.structures[0].positionAssignments.filter(
        ({ participantId }) => participantId
      ).length
    ).toEqual(scenario.drawSize);

    expect(drawDefinition.structures[1].matchUps.length).toEqual(0);
    expect(
      drawDefinition.structures[0].seedAssignments.map(
        ({ participantId }) => participantId
      ).length
    ).toEqual(scenario.seedsCount);

    const participantIdDrawPositionMap = Object.assign(
      {},
      ...drawDefinition.structures[0].positionAssignments.map(
        ({ participantId, drawPosition }) => ({ [participantId]: drawPosition })
      )
    );
    const seededDrawPositions =
      drawDefinition.structures[0].seedAssignments.map((assignment) => [
        assignment.seedNumber,
        participantIdDrawPositionMap[assignment.participantId],
      ]);
    expect(seededDrawPositions).toEqual(scenario.seededDrawPositions);

    result = tournamentEngine.addDrawDefinition({ eventId, drawDefinition });
    expect(result.success).toEqual(true);

    tournamentParticipants = tournamentEngine.getTournamentParticipants({
      convertExtensions: true,
      usePublishState: true,
      withStatistics: true,
      withOpponents: true,
      withGroupings: true,
      withMatchUps: true,
      withSeeding: true,
      inContext: true,
      withDraws: true,
      participantFilters: {
        participantRoles: ['COMPETITOR'],
      },
    }).tournamentParticipants;
    targetParticipants = tournamentParticipants
      .filter(({ participantId }) =>
        seedScaledParticipantIds.includes(participantId)
      )
      .filter(({ events }) => events[0].seedAssignments);
    expect(targetParticipants.length).toEqual(12);

    event = tournamentEngine.getEvent({ eventId }).event;
    expect(event.drawDefinitions.length).toEqual(1);

    const drawId = drawDefinition.drawId;
    result = tournamentEngine.generateDrawDefinition({
      seedingScaleName: mainSeedingScaleName,
      seedsCount: 4,
      drawSize: 16,
      drawId,
    });
    expect(result.existingDrawDefinition).toEqual(true);
    expect(result.success).toEqual(true);

    for (const structure of result.drawDefinition.structures) {
      const seededParticipantIds = structure.seedAssignments.filter(
        ({ participantId }) => participantId
      );
      expect(seededParticipantIds.length).toEqual(4);
    }

    result = tournamentEngine.addDrawDefinition({
      drawDefinition: result.drawDefinition,
      allowReplacement: true,
      eventId,
    });
    expect(result.success).toEqual(true);

    result = tournamentEngine.publishEventSeeding({
      // seedingScaleNames: [qualifyingSeedingScaleName, mainSeedingScaleName],
      stageSeedingScaleNames: {
        [QUALIFYING]: qualifyingSeedingScaleName,
        [MAIN]: mainSeedingScaleName,
      },
      eventId,
    });

    tournamentParticipants = tournamentEngine.getTournamentParticipants({
      convertExtensions: true,
      usePublishState: true,
      withStatistics: true,
      withOpponents: true,
      withGroupings: true,
      withMatchUps: true,
      withSeeding: true,
      inContext: true,
      participantFilters: {
        participantRoles: ['COMPETITOR'],
      },
    }).tournamentParticipants;

    seedScaledParticipants = tournamentParticipants.filter(({ timeItems }) =>
      timeItems?.find(
        (timeItem) => timeItem.itemType.split('.')[1] === 'SEEDING'
      )
    );

    // 8 in qualifying, 8 in main
    // this is the # of participants with a timeItem specifying their seed number
    // this is NOT the # of participants who have been assigned a seed position
    seedScaledParticipantIds = seedScaledParticipants.map(getParticipantId);
    expect(seedScaledParticipantIds.length).toEqual(16);

    targetParticipants = tournamentParticipants
      .filter(({ participantId }) =>
        seedScaledParticipantIds.includes(participantId)
      )
      .filter(({ events }) => events[0].seedAssignments);
    expect(targetParticipants.length).toEqual(8);

    seedAssignments = targetParticipants.map(
      ({ events }) => events[0].seedAssignments
    );
    for (const seedAssignment of seedAssignments) {
      expect(Object.values(seedAssignment)[0].seedValue).not.toBeUndefined();
    }
    const drawSeedAssignments = targetParticipants
      .filter(({ draws }) => draws[0].seedAssignments)
      .map(({ draws }) => draws[0].seedAssignments);
    for (const seedAssignment of drawSeedAssignments) {
      expect(Object.values(seedAssignment)[0].seedValue).not.toBeUndefined();
    }

    // unpublish only qualifying stage seeding
    result = tournamentEngine.unPublishEventSeeding({
      stages: [QUALIFYING],
      eventId,
    });
    expect(result.success).toEqual(true);

    tournamentParticipants = tournamentEngine.getTournamentParticipants({
      convertExtensions: true,
      usePublishState: true,
      withStatistics: true,
      withOpponents: true,
      withGroupings: true,
      withMatchUps: true,
      withSeeding: true,
      inContext: true,
      participantFilters: {
        participantRoles: ['COMPETITOR'],
      },
    }).tournamentParticipants;

    targetParticipants = tournamentParticipants
      .filter(({ participantId }) =>
        seedScaledParticipantIds.includes(participantId)
      )
      .filter(({ events }) => events[0].seedAssignments);
    expect(targetParticipants.length).toEqual(4);
  }
);
