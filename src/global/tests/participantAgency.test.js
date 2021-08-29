import { resolveDrawPositions } from '../../drawEngine/generators/drawPositionsResolver';
import tournamentEngine from '../../tournamentEngine/sync';
import mocksEngine from '../../mocksEngine';
import {
  generateRange,
  nextPowerOf2,
  randomPop,
  unique,
} from '../../utilities';

// these tests were written in preparation for enabling automated draw positioning
// using "participant agency" protocols including drawPosition preferences for non-seeded particpants

it.each([
  { participantsCount: 64, seedsCount: 16, automated: true },
  { participantsCount: 63, seedsCount: 16, automated: true },
  { participantsCount: 63, seedsCount: 16, automated: false },
  { participantsCount: 45, seedsCount: 8, automated: { seedsOnly: true } }, // only places byes for seeded participants
  { participantsCount: 63, seedsCount: 16, automated: { seedsOnly: true } },
  { participantsCount: 50, seedsCount: 16, automated: { seedsOnly: true } },
])(
  'mocksEngine can generate seedsCount seeded participants',
  ({ participantsCount, seedsCount, automated }) => {
    const drawSize = nextPowerOf2(participantsCount);
    const expectedByes = drawSize - participantsCount;
    const drawProfiles = [
      {
        drawSize,
        participantsCount,
        seedsCount,
        automated,
      },
    ];
    const {
      tournamentRecord,
      drawIds: [drawId],
    } = mocksEngine.generateTournamentRecord({
      participantsProfile: { participantsCount },
      drawProfiles,
    });

    tournamentEngine.setState(tournamentRecord);

    const { drawDefinition } = tournamentEngine.getEvent({ drawId });

    const { positionAssignments, seedAssignments } =
      drawDefinition.structures[0];
    const assignedParticipantIds = positionAssignments
      .filter(({ participantId }) => participantId)
      .map(({ participantId }) => participantId);
    const seedsOnly = typeof automated === 'object' && automated.seedsOnly;
    const assignedByes = positionAssignments.filter(({ bye }) => bye);
    expect(assignedByes.length).toEqual(
      seedsOnly
        ? Math.min(expectedByes, seedsCount)
        : automated
        ? expectedByes
        : 0
    );

    expect(assignedParticipantIds.length).toEqual(
      seedsOnly ? seedsCount : automated ? participantsCount : 0
    );
    const assignedSeedParticipantIds = seedAssignments.map(
      ({ participantId }) => participantId
    );
    expect(assignedSeedParticipantIds.length).toEqual(seedsCount);

    if (seedsOnly) {
      const participantIds = tournamentRecord.participants.map(
        ({ participantId }) => participantId
      );
      const unassignedParticipantIds = participantIds.filter(
        (participantId) => !assignedParticipantIds.includes(participantId)
      );
      const unseededParticipantsCount =
        drawSize - assignedByes.length - assignedSeedParticipantIds.length;
      const unassignedDrawPositions = positionAssignments
        .filter((assignment) => !assignment.participantId && !assignment.bye)
        .map(({ drawPosition }) => drawPosition);
      expect(unassignedDrawPositions.length).toEqual(unseededParticipantsCount);

      const participantIdsWithAgency = unassignedParticipantIds.slice(
        0,
        unseededParticipantsCount
      );
      expect(unseededParticipantsCount).toEqual(
        participantIdsWithAgency.length
      );

      const participantFactors = Object.assign(
        ...participantIdsWithAgency.map((participantId) => {
          const range = generateRange(0, unassignedDrawPositions.length - 1);
          const preferences = [1, 2, 3].map(() => {
            const index = randomPop(range);
            const drawPosition = unassignedDrawPositions[index];
            return drawPosition;
          });
          return { [participantId]: { preferences } };
        })
      );

      const { drawPositionResolutions, report } = resolveDrawPositions({
        participantFactors,
        positionAssignments,
      });
      expect(typeof report === 'object').toEqual(true);
      // logging for diagnostics
      // console.log({ report });

      const resolvedDrawPositions = Object.keys(drawPositionResolutions);
      expect(unassignedDrawPositions.length).toEqual(
        resolvedDrawPositions.length
      );

      expect(unique(resolvedDrawPositions).length).toEqual(
        unique(Object.values(drawPositionResolutions)).length
      );
    }
  }
);
