---
title: Venue Governor
---

## addCourt

Add a court to a Venue. See **court** under **venue** in [Type Defs](/docs/types/typedefs#venue).

```js
const court = {
  altitude, // optional
  courtDimensions, // optional
  courtId, // generated automatically if not provided
  courtName,
  dateAvailability, // optional - see below
  latitude, // optional
  longitude, // optional
  onlineResources,  // optional
  pace, // optional - string; ITF enums
  surfaceCategory, // optional - surface constant, e.g. CLAY, HARD, GRASS, CARPET, or ARTIFICIAL
  surfaceType, // string; see: https://www.itftennis.com/en/about-us/tennis-tech/recognised-courts/
  surfacedDate?: Date;
}

engine.addCourt({ venueId, court });
```

---

## addCourts

Convenience function to bulk add courts to a Venue. Only adds **dataAvailability** and **courtName**. See [Scheduling](/docs/concepts/scheduling).

```js
const dateAvailability = [
  {
    date: '2020-01-01T00:00', // if no date is provided then this profile will be used as default
    startTime: '07:00',
    endTime: '19:00',
    bookings: [
      { startTime: '07:00', endTime: '08:30', bookingType: 'PRACTICE' },
      { startTime: '08:30', endTime: '09:00', bookingType: 'MAINTENANCE' },
      { startTime: '13:30', endTime: '14:00', bookingType: 'MAINTENANCE' },
    ],
  },
];
engine.addCourts({
  venueAbbreviationRoot, // optional boolean; whether to use venue.venueAbbreviation in court naming
  dateAvailability, // optional -- see definition in Tournament Engine API
  courtNameRoot, // optional; defaults to 'Court'
  courtNames: ['Court 1', 'Court 2', 'Court 3'], // optional
  courtsCount: 3, // optional, can be added/modified later; also can be derived from courtNames.length
  venueId,
});
```

---

## addVenue

Adds **venueId** if not provided.

```js
engine.addVenue({
  venue: { venueName },
  context, // optional - adds detail in CONTEXT extension
});
```

---

## modifyCourt

```js
competitionEngine.modifyCourt({
  courtId,
  force, // applies only to dateAvailability, will remove scheduling information from matchUps where court is no longer available
  modifications: {
    courtName,
    dateAvailability,
    courtDimensions,
    onlineResources,
    surfaceCategory,
    surfacedDate,
    surfaceType,
    altitude,
    latitude,
    longitude,
    notes,
    pace,
  },
});
```

---

## modifyVenue

See [Scheduling](/docs/concepts/scheduling).

```js
const modifications = {
  venueName,
  onlineResources,
  venueAbbreviation,
  courts: [
    {
      courtId: 'b9df6177-e430-4a70-ba47-9b9ff60258cb',
      courtName: 'Custom Court 1',
      dateAvailability: [
        {
          date: '2020-01-01', // if no date is provided then `startTime` and `endTime` will be considered default values
          startTime: '16:30',
          endTime: '17:30',
        },
      ],
    },
  ],
};
competitionEngine.modifyVenue({ venueId, modifications });
```

---
