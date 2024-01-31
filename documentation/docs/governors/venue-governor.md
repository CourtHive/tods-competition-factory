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

Convenience function to bulk add courts to a Venue. Only adds **dataAvailability** and **courtName**. See [Scheduling](/docs/concepts/venues-courts).

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

## deleteCourt

```js
engine.deleteCourt({
  courtId,
  force, // override warnings about matchUps scheduled on specified court
});
```

---

## deleteVenue

If a venue has scheduled matchUps then it will not be deleted unless `{ force: true }` in which case all relevant matchUps will be unscheduled.

```js
engine.deleteVenue({ venueId, force });
```

---

## deleteVenues

If a venue has scheduled matchUps then it will not be deleted unless `{ force: true }` in which case all relevant matchUps will be unscheduled.

```js
engine.deleteVenues({ venueIds, force });
```

---

## disableCourts

```js
engine.disableCourts({
  courtIds,
  dates, // optional - if not provided, courts will be disalbed for all dates
});
```

---

## disableVenues

```js
engine.disableVenues({ venueIds });
```

---

## enableCourts

```js
engine.enableCourts({
  enableAll, // optional boolean
  courtIds,
  dates, // optional - array of dates to enable (if they have been disabled)
});
```

---

## enableVenues

```js
engine.enableVenues({ venueIds, enableAll });
```

---

## findCourt

```js
const { court, venue } = engine.findCourt({ courtId });
```

---

## findVenue

Returns a complete venue object. Primarily used internally.

```js
engine.findVenue({ venueId });
```

---

## modifyCourt

```js
engine.modifyCourt({
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

## modifyCourtAvailability

Modifies the `dateAvailability` attribute of a specified court. Warns if existing scheduled matchUps would be affected. See [Scheduling](/docs/concepts/venues-courts).

```js
const result = engine.modifyCourtAvailability({
  dateAvailability,
  courtId,
  force, // override warning that existing scheduled matchUps exist
});
```

---

## modifyVenue

Courts present on venue will replaced with courts specified in parameters. If courts are not present in parameters, courts will be unchanged.

See [Scheduling](/docs/concepts/venues-courts) for more detail on court `dateAvailability`.

```js
const modifications = {
  venueAbbreviation,
  onlineResources,
  venueName,
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
engine.modifyVenue({ venueId, modifications });
```

---
