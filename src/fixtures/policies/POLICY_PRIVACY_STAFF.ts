import { POLICY_TYPE_PARTICIPANT } from '@Constants/policyConstants';

export const POLICY_PRIVACY_STAFF = {
  [POLICY_TYPE_PARTICIPANT]: {
    policyName: 'Staff Privacy Policy',
    participant: {
      contacts: false,
      individualParticipants: false,
      individualParticipantIds: false,
      onlineResources: false,
      participantName: true,
      participantOtherName: true,
      participantId: true,
      participantRole: true,
      participantRoleResponsibilities: true,
      participantStatus: true,
      penalties: false,
      representing: true,
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

export default POLICY_PRIVACY_STAFF;
