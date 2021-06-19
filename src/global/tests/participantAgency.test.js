import tournamentEngine from '../../tournamentEngine/sync';
import { makeDeepCopy, nextPowerOf2, randomPop } from '../../utilities';
import mocksEngine from '../../mocksEngine';
import { randomInt } from '../../utilities/math';

// these tests were written in preparation for enabling automated draw positioning
// using "participant agency" protocols including drawPosition preferences for non-seeded particpants

it.each([
  { participantsCount: 64, seedsCount: 16, automated: true },
  { participantsCount: 63, seedsCount: 16, automated: true },
  { participantsCount: 63, seedsCount: 16, automated: false },
  { participantsCount: 63, seedsCount: 16, automated: { seedsOnly: true } },
  // { participantsCount: 45, seedsCount: 16, automated: { seedsOnly: true } }, // only places byes for seeded participants
  // { participantsCount: 50, seedsCount: 16, automated: { seedsOnly: true } },
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
          const preferences = [1, 2, 3].map(() => {
            const index = randomInt(0, unassignedDrawPositions.length - 1);
            const drawPosition = unassignedDrawPositions[index];
            return drawPosition;
          });
          return { [participantId]: { preferences } };
        })
      );

      participantAgency({ participantFactors, unassignedDrawPositions });
    }
  }
);

function participantAgency({ participantFactors, unassignedDrawPositions }) {
  let participantPreferences = makeDeepCopy(participantFactors, false, true);

  let drawPositionResolutions;
  let remainingPreferences = true;
  while (remainingPreferences) {
    ({ drawPositionResolutions, remainingPreferences, participantPreferences } =
      resolvePreferences({
        participantPreferences,
        drawPositionResolutions,
      }));
  }

  const resolvedDrawPositions = Object.keys(drawPositionResolutions).map((dp) =>
    parseInt(dp)
  );
  const remainingDrawPositions = unassignedDrawPositions.filter(
    (drawPosition) => !resolvedDrawPositions.includes(drawPosition)
  );
  const unresolvedParticipantIds = Object.keys(participantPreferences);

  console.log({
    drawPositionResolutions,
    unresolvedParticipantIds,
    remainingDrawPositions,
  });
}

function resolvePreferences({
  participantPreferences,
  drawPositionResolutions = {},
}) {
  const drawPositionsMap = Object.keys(participantPreferences).reduce(
    (dpm, participantId) => {
      const pp = participantPreferences[participantId];
      const firstPreference = pp.preferences[0];
      // there may be no preferences left!
      if (firstPreference) {
        if (!dpm[firstPreference]) dpm[firstPreference] = [];
        dpm[firstPreference].push(participantId);
      }
      return dpm;
    },
    {}
  );
  const minimumContentionCount = Math.min(
    ...Object.values(drawPositionsMap)
      .filter((f) => f.length)
      .map((v) => v.length)
  );
  const minimumContentionPositions = Object.keys(drawPositionsMap).filter(
    (drawPosition) =>
      drawPositionsMap[drawPosition].length &&
      minimumContentionCount &&
      drawPositionsMap[drawPosition].length === minimumContentionCount
  );

  minimumContentionPositions.forEach((position) => {
    const candidates = drawPositionsMap[position];
    const selectedParticipantId = randomPop(candidates);
    drawPositionResolutions[position] = selectedParticipantId;
    // remove resolved participants from preferences
    delete participantPreferences[selectedParticipantId];
  });

  // now filter resolved positions from every participant's preferences
  let remainingPreferences;
  Object.values(participantPreferences).forEach((pd) => {
    pd.preferences = pd.preferences.filter((dp) => {
      const notResolved = !minimumContentionPositions.includes(dp.toString());
      if (notResolved) remainingPreferences = true;
      return notResolved;
    });
  });

  return {
    drawPositionResolutions,
    remainingPreferences,
    participantPreferences,
  };
}
