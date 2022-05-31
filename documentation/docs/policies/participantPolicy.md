---
title: Participant Policy
---

A **Participant Policy** specifies which participant attributes will be present on participants returned via factory methods.

:::note
The filters for Array elements are specified as Objects. In the example policy below, `individualParticipants` filters the attributes of all members of the array in the source data
:::

```js
const privacyPolicy = {
  policyName: 'Participant Privacy Policy',
  participant: {
    individualParticipants: {
      participantName: true,
      participantOtherName: true,
      participantId: true,
      participantRole: true,
      participantStatus: true,
      representing: true,
      participantType: true,
      person: {
        addresses: false,
        nationalityCode: true,
        otherNames: true,
        sex: false,
        standardFamilyName: true,
        standardGivenName: true,
      },
    },
    individualParticipantIds: true,
    participantName: true,
    participantOtherName: true,
    participantId: true,
    participantRole: true,
    participantStatus: true,
    representing: true,
    participantType: true,
    person: {
      nationalityCode: true,
      otherNames: true,
      sex: false,
      standardFamilyName: true,
      standardGivenName: true,
    },
  },
};
```

## Advanced Filtering

- Multible attributes may share the same privacy template via the use of `||` syntax, as shown below.
- Attributes which are strings may be used to filter the array objects in which they appear; e.g. `scaleName: ['WTN']` will cause other `scaleItems` to be filtered out.
- A wildcard may be used to default all object attributes to `true`, except those explicitly defined as `false`.

```js
const privacyPolicy = {
  /* ... */
  ratings: {
    'SINGLES||DOUBLES': {
      scaleName: ['WTN'],
      scaleValue: {
        '*': true,
        confidence: false,
      },
    },
  },
};
```
