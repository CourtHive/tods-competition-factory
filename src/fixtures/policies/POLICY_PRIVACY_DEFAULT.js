import { POLICY_TYPE_PARTICIPANT } from '../../constants/policyConstants';

export const POLICY_PRIVACY_DEFAULT = {
  [POLICY_TYPE_PARTICIPANT]: {
    policyName: 'Participant Privacy Policy',
    participant: {
      contacts: false,
      individualParticipants: true,
      individualParticipantIds: true,
      onlineResources: false,
      participantName: true,
      participantOtherName: true,
      participantId: true,
      participantRole: true,
      participantStatus: true,
      penalties: false,
      representing: true,
      participantRoleResponsabilities: false,
      participantType: true,
      person: {
        addresses: false,
        biographicalInformation: false,
        birthDate: false,
        contacts: false,
        nationalityCode: true,
        nativeFamilyName: false,
        nativeGivenName: false,
        onlineResources: false,
        otherNames: true,
        parentOrganisationId: false,
        passportFamilyName: false,
        passportGivenName: false,
        personId: false,
        personOtherIds: false,
        previousNames: false,
        sex: false,
        standardFamilyName: true,
        standardGivenName: true,
        status: false,
        tennisId: false,
        wheelchair: true,
      },
    },
  },
};

export default POLICY_PRIVACY_DEFAULT;
