import tournamentEngine from '../../tournamentEngine/sync';
import { makeDeepCopy } from '../makeDeepCopy';
import mocksEngine from '../../mocksEngine';
import { UUID } from '../UUID';

import { INDIVIDUAL } from '../../constants/participantConstants';
import { COMPETITOR } from '../../constants/participantRoles';
import { MALE } from '../../constants/genderConstants';

it('can convert extensions during deepCopy', () => {
  let { tournamentRecord } = mocksEngine.generateTournamentRecord();
  tournamentEngine.setState(tournamentRecord);

  const scoringPolicy = {
    scoring: {
      policyName: 'TEST',
    },
  };
  let result = tournamentEngine.attachPolicies({
    policyDefinitions: scoringPolicy,
  });
  expect(result.success).toEqual(true);

  ({ tournamentRecord } = tournamentEngine.getState());
  expect(tournamentRecord.extensions.length).toEqual(1);

  ({ tournamentRecord } = tournamentEngine.getState({
    convertExtensions: true,
  }));
  expect(tournamentRecord.extensions).toBeUndefined();
  expect(tournamentRecord._appliedPolicies.scoring).not.toBeUndefined();

  const participantId = UUID();
  const participant = {
    participantId,
    participantRole: COMPETITOR,
    participantType: INDIVIDUAL,
    person: {
      standardFamilyName: 'Family',
      standardGivenName: 'Given',
      extensions: [{ name: 'someExtension', value: 'extensionValue' }],
    },
    extensions: [{ name: 'anotherExtension', value: 'anotherExtensionValue' }],
  };

  result = tournamentEngine.addParticipant({ participant });
  expect(result.success).toEqual(true);

  const participantCopy = makeDeepCopy(participant, true);
  expect(participantCopy._anotherExtension).toEqual('anotherExtensionValue');
  expect(participantCopy.person._someExtension).toEqual('extensionValue');

  ({ tournamentRecord } = tournamentEngine.getState({
    convertExtensions: true,
  }));

  const tournamentParticipants = tournamentRecord.participants;
  const targetParticipant = tournamentParticipants.find(
    (participant) => participant.participantId === participantId
  );
  expect(targetParticipant._anotherExtension).toEqual('anotherExtensionValue');
  expect(targetParticipant.person._someExtension).toEqual('extensionValue');
});

it('can remove extensions', () => {
  let { tournamentRecord } = mocksEngine.generateTournamentRecord();
  tournamentEngine.setState(tournamentRecord);

  const scoringPolicy = {
    scoring: {
      policyName: 'TEST',
    },
  };
  let result = tournamentEngine.attachPolicies({
    policyDefinitions: scoringPolicy,
  });
  expect(result.success).toEqual(true);

  ({ tournamentRecord } = tournamentEngine.getState());
  expect(tournamentRecord.extensions.length).toEqual(1);

  ({ tournamentRecord } = tournamentEngine.getState({
    removeExtensions: true,
  }));
  expect(tournamentRecord.extensions).toEqual([]);
});

it('can disable deepCopy without compromising source document', () => {
  const drawProfiles = [
    {
      drawSize: 32,
      participantsCount: 30,
    },
  ];
  let { tournamentRecord } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    inContext: true,
  });

  tournamentEngine.setState(tournamentRecord);

  let { matchUps } = tournamentEngine.allTournamentMatchUps();
  expect(matchUps[0].sides).not.toBeUndefined();

  ({ tournamentRecord } = tournamentEngine.getState());
  expect(
    tournamentRecord.events[0].drawDefinitions[0].structures[0].matchUps[0]
      .sides
  ).toBeUndefined();

  tournamentEngine.setState(tournamentRecord, false);

  ({ matchUps } = tournamentEngine.allTournamentMatchUps());
  expect(matchUps[0].sides).not.toBeUndefined();

  ({ tournamentRecord } = tournamentEngine.getState());

  expect(
    tournamentRecord.events[0].drawDefinitions[0].structures[0].matchUps[0]
      .sides
  ).toBeUndefined();
});

it('can selectively stringify or ignore attributes when used internally', () => {
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize: 2 }],
  });

  tournamentEngine.setState(tournamentRecord, false, {
    stringify: ['_id', 'foo'],
    ignore: ['testing'],
    toJSON: ['bar'],
  });

  let { matchUps } = tournamentEngine.allTournamentMatchUps();
  const { drawId, matchUpId } = matchUps[0];

  const myObject = {
    _id: {
      fx: (x) => x * x,
    },
    foo: {
      toString: () => '######',
    },
    bar: {
      toJSON: () => '{ "some": "json" }',
    },
    keep: {
      num: 1,
      str: 'string',
      obj: {
        a: 1,
        b: 2,
      },
    },
    testing: true,
  };

  let result = tournamentEngine.setMatchUpStatus({
    notes: myObject,
    matchUpId,
    drawId,
  });
  expect(result.success).toEqual(true);

  ({ matchUps } = tournamentEngine.allTournamentMatchUps());
  expect(matchUps[0].notes).toEqual({
    _id: '[object Object]',
    foo: '######',
    bar: '{ "some": "json" }',
    keep: { num: 1, str: 'string', obj: { a: 1, b: 2 } },
  });
});

test('can throttle makeDeepCopy by setting a threshold', () => {
  // prettier-ignore
  let eventProfiles = [{ eventName: `Boy's U16 Doubles`, gender: MALE }];
  const { tournamentRecord, eventIds } = mocksEngine.generateTournamentRecord({
    participantsProfile: { participantsCount: 0 },
    eventProfiles,
  });

  expect(tournamentRecord.participants.length).toEqual(0);

  const drawSize = 4;
  // prettier-ignore
  eventProfiles = [{ eventId: eventIds[0], drawProfiles: [{ drawSize }] }];
  let result = mocksEngine
    .setDeepCopy(false, { threshold: 2 })
    .devContext({ makeDeepCopy: true, iterations: 3 }) // in this case setting { iterations: 2 } will result in logging
    .modifyTournamentRecord({
      tournamentRecord,
      eventProfiles,
    });
  expect(result.success).toEqual(true);
  expect(result.drawIds.length).toEqual(1);
  expect(tournamentRecord.participants.length).toEqual(drawSize);
});
