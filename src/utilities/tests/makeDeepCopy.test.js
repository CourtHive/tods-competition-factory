import { COMPETITOR } from '../../constants/participantRoles';
import { INDIVIDUAL } from '../../constants/participantTypes';
import mocksEngine from '../../mocksEngine';
import tournamentEngine from '../../tournamentEngine/sync';
import { makeDeepCopy } from '../makeDeepCopy';
import { UUID } from '../UUID';

it('can convert extensions during deepCopy', () => {
  let { tournamentRecord } = mocksEngine.generateTournamentRecord();
  tournamentEngine.setState(tournamentRecord);

  const scoringPolicy = {
    scoring: {
      policyName: 'TEST',
      allowedMatchUpFormats: ['SET3-S:6/TB7'],
    },
  };
  let result = tournamentEngine.attachPolicy({
    policyDefinition: scoringPolicy,
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
