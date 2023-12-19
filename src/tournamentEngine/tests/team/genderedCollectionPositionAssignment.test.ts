import { extractAttributes as xa, unique } from '../../../utilities';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../../test/engines/tournamentEngine';
import { expect, it } from 'vitest';

import { INVALID_PARTICIPANT } from '../../../constants/errorConditionConstants';
import { USTA_GOLD_TEAM_CHALLENGE } from '../../../constants/tieFormatConstants';
import { ASSIGN_PARTICIPANT } from '../../../constants/positionActionConstants';
import { SINGLES_MATCHUP, TEAM_MATCHUP } from '../../../constants/matchUpTypes';
import { INDIVIDUAL } from '../../../constants/participantConstants';
import { FEMALE, MALE } from '../../../constants/genderConstants';
import { TEAM_EVENT } from '../../../constants/eventConstants';

it('can enforce collection gender', () => {
  // 1. generate gendered tieFormat
  // 2. matchUpActions return individualParticipants filtered by collection gender
  // 3. errors thrown for attempting to assign inappropriate gender
  // 4. Mixed Doubles will filter on 2nd participant placement (UI modal must filter independently?)

  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    drawProfiles: [
      {
        tieFormatName: USTA_GOLD_TEAM_CHALLENGE,
        eventType: TEAM_EVENT,
        drawSize: 2,
      },
    ],
  });
  let result = tournamentEngine.setState(tournamentRecord);
  expect(result.success).toEqual(true);

  const participants = tournamentEngine.getParticipants({
    withGroupings: true,
  }).participants;
  const individualParticipants = participants.filter(
    ({ participantType }) => participantType === INDIVIDUAL
  );
  expect(individualParticipants.length).toEqual(16);

  const { matchUps } = tournamentEngine.allTournamentMatchUps();
  const dualMatchUps = matchUps.filter(
    ({ matchUpType }) => matchUpType === TEAM_MATCHUP
  );
  expect(dualMatchUps.length).toEqual(1);
  const femaleSingles = matchUps.filter(
    ({ matchUpType, gender }) =>
      matchUpType === SINGLES_MATCHUP && gender === FEMALE
  );
  expect(femaleSingles.length).toEqual(4);
  const maleSingles = matchUps.filter(
    ({ matchUpType, gender }) =>
      matchUpType === SINGLES_MATCHUP && gender === MALE
  );
  expect(maleSingles.length).toEqual(4);

  const side2team = dualMatchUps[0].sides.find(
    ({ sideNumber }) => sideNumber === 2
  ).participant;
  const side2Individuals = side2team.individualParticipants;

  const testMatchUps = [maleSingles[0], femaleSingles[0]];
  for (const matchUp of testMatchUps) {
    const { matchUpId, drawId } = matchUp;
    const { validActions } = tournamentEngine.matchUpActions({
      sideNumber: 1,
      matchUpId,
      drawId,
    });
    // first ensure that gender is present on hydrated matchUp
    expect([MALE, FEMALE].includes(matchUp.gender)).toBeTruthy();

    // should only return participants matching collectionDefinition.gender
    expect(
      unique(validActions[2].availableParticipants.map((p) => p.person.sex))[0]
    ).toEqual(matchUp.gender);

    const assignPositionAction = validActions.find(
      ({ type }) => type === ASSIGN_PARTICIPANT
    );
    const { method, payload, availableParticipantIds } = assignPositionAction;
    let participantId = availableParticipantIds[0];

    result = tournamentEngine[method]({ ...payload, participantId });
    expect(result.success).toEqual(true);

    const side2incorrectGenderedIndividuals = side2Individuals.filter(
      ({ person }) => person.sex !== matchUp.gender
    );
    participantId = side2incorrectGenderedIndividuals[0].participantId;
    result = tournamentEngine[method]({ ...payload, participantId });
    expect(result.error).toEqual(INVALID_PARTICIPANT);
  }

  const targetMatchUps = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: {
      matchUpIds: testMatchUps.map(xa('matchUpId')),
    },
  }).matchUps;

  // count the number of sides (out of 4) that have participants
  // should only be one assigned side per matchUp => 2
  expect(
    targetMatchUps.flatMap(xa('sides')).filter(xa('participant')).length
  ).toEqual(2);
});
