import { tournamentEngine, mocksEngine } from '../../..';
import { instanceCount, unique } from '../../../utilities';
import { expect, it } from 'vitest';

import { TEAM_EVENT } from '../../../constants/eventConstants';
import { RANKING } from '../../../constants/scaleConstants';
import { ASC } from '../../../constants/sortingConstants';
import {
  INDIVIDUAL,
  TEAM_PARTICIPANT,
} from '../../../constants/participantConstants';
import {
  DOMINANT_DUO_MIXED,
  USTA_GOLD_TEAM_CHALLENGE,
} from '../../../constants/tieFormatConstants';

it('can generate lineUps for TEAM events', () => {
  const categoryName = '18U';
  const participantsProfile = {
    category: { categoryName },
    scaleAllParticipants: true,
  };
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    tournamentName: 'Dominant Duo',
    participantsProfile,
    drawProfiles: [
      {
        category: { ageCategoryCode: categoryName },
        tieFormatName: DOMINANT_DUO_MIXED,
        eventType: TEAM_EVENT,
        drawSize: 8,
      },
    ],
  });

  let result = tournamentEngine.setState(tournamentRecord);
  expect(result.success).toEqual(true);

  const { participants } = tournamentEngine.getParticipants({
    withIndividualParticipants: true,
    withScaleValues: true,
    withDraws: true,
  });

  // expect that all individual participants should be scaled
  const individualParticipants = participants.filter(
    (participant) => participant.participantType === INDIVIDUAL
  );
  expect(
    individualParticipants.every((p) => p.rankings?.SINGLES.length)
  ).toEqual(true);

  const teamParticipants = participants.filter(
    (participant) =>
      participant.participantType === TEAM_PARTICIPANT &&
      participant.draws?.[0]?.drawId === drawId
  );
  // expect that DOMINANT_DUO_MIXED produces mixed sex teams
  teamParticipants.forEach((p) =>
    expect(p.individualParticipants.map((ip) => ip.person.sex)).toEqual([
      'FEMALE',
      'MALE',
    ])
  );

  const scaleAccessor = {
    scaleName: categoryName,
    scaleType: RANKING,
    sortOrder: ASC,
  };
  result = tournamentEngine.generateLineUps({
    singlesOnly: true,
    scaleAccessor,
    drawId,
  });

  Object.values(result.lineUps).forEach((lineUp) => {
    // each lineUp should consist of two participants
    expect(lineUp.length).toEqual(2);
    lineUp.forEach((participant) => {
      // each member of the DOMINANT_DUO should have two assignments
      expect(participant.collectionAssignments.length).toEqual(2);
    });
  });
});

it('will assign TEAM positions based on ranking', () => {
  const categoryName = '18U';
  const participantsProfile = {
    category: { categoryName },
    scaleAllParticipants: true,
  };
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    tournamentName: 'Gold Team Challenge',
    participantsProfile,
    drawProfiles: [
      {
        category: { ageCategoryCode: categoryName },
        tieFormatName: USTA_GOLD_TEAM_CHALLENGE,
        eventType: TEAM_EVENT,
        drawSize: 8,
      },
    ],
  });

  let result = tournamentEngine.setState(tournamentRecord);
  expect(result.success).toEqual(true);

  const { participants } = tournamentEngine.getParticipants({
    withIndividualParticipants: true,
    withScaleValues: true,
    withDraws: true,
  });

  // expect that all individual participants should be scaled
  const individualParticipants = participants.filter(
    (participant) => participant.participantType === INDIVIDUAL
  );
  expect(
    individualParticipants.every((p) => p.rankings?.SINGLES.length)
  ).toEqual(true);

  const teamParticipants = participants.filter(
    (participant) =>
      participant.participantType === TEAM_PARTICIPANT &&
      participant.draws?.[0]?.drawId === drawId
  );

  // expect that USTA_GOLD_TEAM_CHALLENGE produces mixed sex teams
  teamParticipants.forEach((p) =>
    expect(
      p.individualParticipants &&
        instanceCount(p.individualParticipants.map((ip) => ip.person.sex))
    ).toEqual({ FEMALE: 4, MALE: 4 })
  );

  const { event } = tournamentEngine.getEvent({ drawId });
  const collectionIds = event.tieFormat.collectionDefinitions.map(
    ({ collectionId }) => collectionId
  );

  const scaleAccessor = {
    scaleName: categoryName,
    scaleType: RANKING,
    sortOrder: ASC,
  };
  result = tournamentEngine.generateLineUps({
    singlesOnly: true,
    scaleAccessor,
    drawId,
  });

  Object.values(result.lineUps).forEach((lineUp) => {
    // each lineUp should consist of two participants
    expect(lineUp.length).toEqual(8);

    const collectionParticipantIds = {};
    const collectionDefinitions = {};

    lineUp.forEach((participant) => {
      participant.collectionAssignments.forEach((assignment) => {
        const { collectionId, collectionPosition } = assignment;
        if (!collectionDefinitions[collectionId]) {
          collectionDefinitions[collectionId] = [];
        }
        if (!collectionParticipantIds[participant.participantId])
          collectionParticipantIds[participant.participantId] = [];
        collectionParticipantIds[participant.participantId].push(collectionId);
        collectionDefinitions[collectionId].push(collectionPosition);
      });
      // each member of the USTA_GOLD_TEAM_CHALLENGE should have three assignments
      // SINGLES, same-sex DOUBLES and MIXED DOUBLES
      expect(participant.collectionAssignments.length).toEqual(3);
    });
    expect(Object.values(collectionDefinitions).map((c) => c)).toEqual([
      [1, 2, 3, 4], // MALE SINGLES
      [1, 1, 2, 2], // MALE DOUBLES
      [1, 2, 3, 4, 1, 2, 3, 4], // MIXED DOUBLES
      [1, 2, 3, 4], // FEMALE SINGLES
      [1, 1, 2, 2], // FEMALE DOUBLES
    ]);

    // each participant is in 3 collections
    const everyParticipantIn3 = Object.values(collectionParticipantIds).every(
      (cids) => cids.every((cid) => collectionIds.includes(cid))
    );
    expect(everyParticipantIn3).toEqual(true);
    expect(
      unique(Object.values(collectionParticipantIds).map((v) => v.length))
    ).toEqual([3]);
  });
});
