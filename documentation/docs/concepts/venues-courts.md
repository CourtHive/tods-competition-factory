---
title: Venues and Courts
---

## Overview

Venues and courts are the physical foundation of tournament scheduling. The Competition Factory provides comprehensive venue and court management, enabling everything from simple single-venue tournaments to complex multi-venue professional events with shared resources.

## Venue Structure

A **venue** represents a physical location that contains one or more courts. Venues are stored in the tournament record and can be shared across multiple linked tournaments.

### Venue Properties

```ts
{
  venueId: string;              // Unique identifier (UUID)
  venueName: string;            // Display name
  venueAbbreviation?: string;   // Short name for schedules

  // Location information
  address?: {
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };

  latitude?: number;            // GPS coordinates
  longitude?: number;

  // Venue details
  courts?: Court[];             // Array of court objects
  timeZone?: string;            // IANA timezone (e.g., 'America/New_York')

  // Optional metadata
  notes?: string;
  onlineResources?: Array<{
    type: string;               // 'WEBSITE', 'DIRECTIONS', etc.
    url: string;
  }>;
}
```

### Creating Venues

```js
import { tournamentEngine } from 'tods-competition-factory';

// Create a venue
const result = tournamentEngine.addVenue({
  venue: {
    venueName: 'Central Tennis Club',
    venueAbbreviation: 'CTC',
    address: {
      addressLine1: '123 Tennis Drive',
      city: 'Austin',
      state: 'TX',
      postalCode: '78701',
      country: 'USA',
    },
    timeZone: 'America/Chicago',
  },
});

const { venue } = result;
console.log(venue.venueId); // Generated UUID
```

### Modifying Venues

```js

**API Reference:** [addVenue](/docs/governors/venue-governor#addvenue)

// Update venue properties
tournamentEngine.modifyVenue({
  venueId: 'venue-uuid',
  modifications: {
    venueName: 'Central Tennis & Pickleball Club',
    notes: 'Indoor courts available',
  },
});

// Delete a venue (removes all courts)
tournamentEngine.deleteVenues({
  venueIds: ['venue-uuid'],
});
```

---

## Court Structure

A **court** represents an individual playing surface within a venue. Courts have detailed availability scheduling and can be booked for non-match purposes.

### Court Properties

```ts


**API Reference:** [modifyVenue](/docs/governors/venue-governor#modifyvenue)

**API Reference:** [deleteVenues](/docs/governors/venue-governor#deletevenues)

{
  courtId: string;              // Unique identifier (UUID)
  courtName: string;            // Display name (e.g., 'Court 1', 'Centre Court')
  venueId?: string;             // Parent venue reference

  // Court attributes
  altitude?: number;            // Elevation in meters
  surfaceType?: string;         // 'HARD', 'CLAY', 'GRASS', 'CARPET', etc.
  surfaceCategory?: string;     // 'INDOOR', 'OUTDOOR', 'COVERED'
  courtDimensions?: string;     // Dimensions description

  // Lighting and features
  lighting?: boolean;           // Has lights for night play
  lightingType?: string;        // 'LED', 'Metal Halide', etc.

  // Scheduling
  dateAvailability?: DateAvailability[];  // When court is available

  // Optional metadata
  notes?: string;
  onlineResources?: Array<{
    type: string;
    url: string;
  }>;
}
```

### Creating Courts

```js
// Add courts to a venue
const result = tournamentEngine.addCourts({
  venueId: 'venue-uuid',
  courts: [
    {
      courtName: 'Court 1',
      surfaceType: 'HARD',
      surfaceCategory: 'OUTDOOR',
      lighting: true,
    },
    {
      courtName: 'Court 2',
      surfaceType: 'HARD',
      surfaceCategory: 'OUTDOOR',
      lighting: true,
    },
    {
      courtName: 'Stadium Court',
      surfaceType: 'HARD',
      surfaceCategory: 'OUTDOOR',
      lighting: true,
      notes: 'Priority court for finals',
    },
  ],
});

const { courts } = result;
console.log(courts.map((c) => c.courtId)); // Generated UUIDs
```

### Modifying Courts

```js

**API Reference:** [addCourts](/docs/governors/venue-governor#addcourts)

// Update court properties
tournamentEngine.modifyCourt({
  courtId: 'court-uuid',
  modifications: {
    courtName: 'Centre Court',
    lighting: true,
    notes: 'Stadium seating - 500 capacity',
  },
});

// Move court to different venue
tournamentEngine.modifyCourt({
  courtId: 'court-uuid',
  modifications: {
    venueId: 'new-venue-uuid',
  },
});

// Delete courts
tournamentEngine.deleteCourts({
  courtIds: ['court-uuid-1', 'court-uuid-2'],
});
```

---

## Date Availability

`dateAvailability` defines when courts are available for scheduling matches. This is the most critical aspect of court configuration for automated scheduling.

### Basic Structure

```ts

**API Reference:** [modifyCourt](/docs/governors/venue-governor#modifycourt)

type DateAvailability = {
  date?: string; // ISO date (YYYY-MM-DD) - optional
  startTime?: string; // HH:MM format
  endTime?: string; // HH:MM format
  bookings?: Booking[]; // Reserved time blocks
};

type Booking = {
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  bookingType?: string; // 'PRACTICE', 'MAINTENANCE', 'EVENT', etc.
  notes?: string;
};
```

### Default Availability

When `date` is **not specified**, the availability applies to **all tournament dates**:

```js
// Courts available 9 AM to 9 PM every day
tournamentEngine.addCourts({
  venueId: 'venue-uuid',
  courts: [
    {
      courtName: 'Court 1',
      dateAvailability: [
        {
          startTime: '09:00',
          endTime: '21:00',
        },
      ],
    },
  ],
});
```

### Date-Specific Availability

When `date` **is specified**, the availability applies only to that date:

```js

**API Reference:** [addCourts](/docs/governors/venue-governor#addcourts)

// Different hours on different days
const dateAvailability = [
  // Default availability (all days)
  {
    startTime: '09:00',
    endTime: '21:00',
  },
  // Sunday: Open later
  {
    date: '2024-03-17', // Sunday
    startTime: '12:00',
    endTime: '20:00',
  },
  // Finals day: Extended hours
  {
    date: '2024-03-24',
    startTime: '08:00',
    endTime: '23:00',
  },
];
```

### Multiple Time Blocks

Courts can have multiple availability windows per day:

```js
// Morning and evening sessions (closed for lunch)
dateAvailability: [
  {
    startTime: '08:00',
    endTime: '13:00',
  },
  {
    startTime: '15:00',
    endTime: '21:00',
  },
];
```

### Court Bookings

Block out times when courts are reserved for non-match purposes:

```js
dateAvailability: [
  {
    date: '2024-03-20',
    startTime: '09:00',
    endTime: '21:00',
    bookings: [
      {
        startTime: '12:00',
        endTime: '13:00',
        bookingType: 'MAINTENANCE',
        notes: 'Court resurfacing inspection',
      },
      {
        startTime: '16:00',
        endTime: '17:30',
        bookingType: 'PRACTICE',
        notes: 'Seeded player practice - Reserved',
      },
    ],
  },
];
```

The scheduling engine will **not schedule matches** during booked times.

### Updating Court Availability

```js
// Add or modify date availability
tournamentEngine.modifyCourtDateAvailability({
  courtId: 'court-uuid',
  dateAvailability: [
    {
      date: '2024-03-21',
      startTime: '10:00',
      endTime: '20:00',
      bookings: [
        {
          startTime: '14:00',
          endTime: '15:00',
          bookingType: 'EVENT',
          notes: 'Trophy presentation ceremony',
        },
      ],
    },
  ],
});
```

---

## Scheduling Integration

### How Automated Scheduling Uses Venues/Courts

When you call `scheduleMatchUps()` or `scheduleProfileRounds()`, the engine:

1. **Retrieves all courts** for the specified venue(s)
2. **Checks dateAvailability** for the scheduling date
3. **Calculates available time slots** considering:
   - Court start/end times
   - Existing scheduled matches
   - Court bookings
   - Average match duration (from scheduling policy)
4. **Assigns matches to courts and times** using the Garman formula
5. **Respects constraints** like recovery times and daily limits

### Venue Assignment

Matches can be assigned to venues without specific courts:

```js
// Assign venue only (court TBD)
tournamentEngine.assignMatchUpVenue({
  matchUpId: 'match-uuid',
  venueId: 'venue-uuid',
});

// Assign specific court
tournamentEngine.assignMatchUpCourt({
  matchUpId: 'match-uuid',
  courtId: 'court-uuid',
});
```

This flexibility supports workflows where:

- **Pre-scheduling**: Assign dates/venues early
- **Day-of scheduling**: Assign specific courts on tournament day
- **Flexible assignments**: Move matches between courts as needed

---

## Multi-Venue Tournaments

Professional tournaments often use multiple venues:

```js
// Main tournament venue
const mainVenue = tournamentEngine.addVenue({
  venue: {
    venueName: 'Tennis Stadium',
    venueAbbreviation: 'STAD',
  },
});

// Practice venue
const practiceVenue = tournamentEngine.addVenue({
  venue: {
    venueName: 'Practice Courts',
    venueAbbreviation: 'PRAC',
  },
});

// Add courts to each venue
tournamentEngine.addCourts({
  venueId: mainVenue.venue.venueId,
  courts: [{ courtName: 'Centre Court' }, { courtName: 'Court 1' }, { courtName: 'Court 2' }],
});

tournamentEngine.addCourts({
  venueId: practiceVenue.venue.venueId,
  courts: [
    { courtName: 'Practice Court 1' },
    { courtName: 'Practice Court 2' },
    { courtName: 'Practice Court 3' },
    { courtName: 'Practice Court 4' },
  ],
});
```

### Scheduling Across Venues

```js


**API Reference:** [addVenue](/docs/governors/venue-governor#addvenue)

**API Reference:** [addCourts](/docs/governors/venue-governor#addcourts)

// Schedule early rounds at practice venue
tournamentEngine.scheduleMatchUps({
  venueId: practiceVenue.venue.venueId,
  date: '2024-03-18',
  matchUpIds: earlyRoundMatchUpIds,
});

// Schedule finals at main stadium
tournamentEngine.scheduleMatchUps({
  venueId: mainVenue.venue.venueId,
  date: '2024-03-24',
  matchUpIds: finalsMatchUpIds,
});
```

---

## Linked Tournaments & Shared Venues

Multiple tournaments can share venues (common for professional circuits):

```js
// Tournament A
const tournamentA = { tournamentId: 'tournament-a-uuid', ... };

// Tournament B
const tournamentB = { tournamentId: 'tournament-b-uuid', ... };

// Link tournaments to share venues
competitionEngine.linkTournaments({
  tournamentRecords: [tournamentA, tournamentB]
});

// Add shared venue (available to both tournaments)
const sharedVenue = tournamentEngine.addVenue({
  venue: {
    venueName: 'Shared Tennis Complex'
  },
  tournamentRecord: tournamentA
});

// The venue and its courts are now accessible from both tournaments
// Scheduling engine prevents double-booking across tournaments
```

### Cross-Tournament Scheduling

The Garman scheduling algorithm considers matches from **all linked tournaments** when:

- Calculating available court time
- Detecting scheduling conflicts
- Optimizing court utilization

This ensures efficient use of shared facilities without conflicts.

---

## Court Attributes & Metadata

### Surface Types

Common surface types:

- `HARD` - Hard court (acrylic, concrete)
- `CLAY` - Clay court (red/green clay)
- `GRASS` - Grass court
- `CARPET` - Indoor carpet
- `ARTIFICIAL_GRASS` - Synthetic grass
- `ARTIFICIAL_CLAY` - Synthetic clay

### Surface Categories

- `INDOOR` - Fully enclosed
- `OUTDOOR` - Open air
- `COVERED` - Outdoor with roof coverage
- `RETRACTABLE` - Retractable roof

### Lighting

Courts with lighting can host evening matches:

```js

**API Reference:** [addVenue](/docs/governors/venue-governor#addvenue)

{
  courtName: 'Court 1',
  lighting: true,
  lightingType: 'LED',
  dateAvailability: [
    {
      // Can schedule until 11 PM with lights
      startTime: '09:00',
      endTime: '23:00'
    }
  ]
}
```

### Online Resources

Link to court/venue information:

```js
{
  venueName: 'National Tennis Center',
  onlineResources: [
    {
      type: 'WEBSITE',
      url: 'https://example.com/venue'
    },
    {
      type: 'DIRECTIONS',
      url: 'https://maps.google.com/...'
    },
    {
      type: 'PARKING',
      url: 'https://example.com/parking'
    }
  ]
}
```

---

## Best Practices

### Naming Conventions

- **Venues**: Use full names (`"Central Tennis Club"` not `"CTC"`)
- **Courts**: Use consistent naming (`"Court 1"`, `"Court 2"` or `"Court A"`, `"Court B"`)
- **Abbreviations**: Keep short (3-4 characters) for schedule displays

### Availability Setup

1. **Set default availability first** (no date specified)
2. **Override specific dates** as needed (finals day, holidays)
3. **Add bookings** for known reservations (maintenance, practice)
4. **Update dynamically** as tournament progresses (weather delays, court issues)

### Court Organization

- **Priority courts first**: Stadium/Centre courts at top of list
- **Group by surface**: Keep same surface types together
- **Indoor vs outdoor**: Separate indoor from outdoor for weather planning
- **Lighting indication**: Clearly mark courts with lights for evening scheduling

### Multi-Venue Strategy

- **Main venue**: Feature courts, finals, marquee matches
- **Secondary venues**: Early rounds, qualifying
- **Practice venues**: Warm-up courts, player practice
- **Geographic proximity**: Consider travel time between venues

---

## Common Scenarios

### Weekend Tournament

```js
// Friday evening setup (after work)
{
  date: '2024-03-22',
  startTime: '18:00',
  endTime: '23:00'
}

// Saturday (all day)
{
  date: '2024-03-23',
  startTime: '08:00',
  endTime: '22:00'
}

// Sunday (morning/afternoon)
{
  date: '2024-03-24',
  startTime: '09:00',
  endTime: '18:00'
}
```

### Indoor/Outdoor Flexibility

```js
// Outdoor courts (weather dependent)
{
  courtName: 'Court 1',
  surfaceCategory: 'OUTDOOR',
  dateAvailability: [
    {
      startTime: '09:00',
      endTime: '20:00'
    }
  ]
}

// Indoor courts (backup for weather)
{
  courtName: 'Indoor Court A',
  surfaceCategory: 'INDOOR',
  dateAvailability: [
    {
      startTime: '08:00',
      endTime: '23:00'  // Extended hours
    }
  ]
}
```

### Championship Week

```js
// Qualifying (multiple courts, normal hours)
{
  date: '2024-03-18',
  startTime: '10:00',
  endTime: '20:00'
}

// Main draw (longer days)
{
  date: '2024-03-20',
  startTime: '09:00',
  endTime: '22:00'
}

// Finals day (prime time)
{
  date: '2024-03-24',
  startTime: '12:00',
  endTime: '21:00',
  bookings: [
    {
      startTime: '17:00',
      endTime: '17:30',
      bookingType: 'EVENT',
      notes: 'Opening ceremony for finals'
    }
  ]
}
```

---

## Retrieving Venue Information

```js
// Get all venues
const { venues } = tournamentEngine.getVenues();

// Get specific venue with courts
const { venue } = tournamentEngine.getVenue({
  venueId: 'venue-uuid',
});

// Get courts for a venue
const { courts } = tournamentEngine.getCourts({
  venueId: 'venue-uuid',
});

// Get specific court
const { court } = tournamentEngine.getCourt({
  courtId: 'court-uuid',
});

// Get matchUps scheduled on a court
const { matchUps } = tournamentEngine.getCourtMatchUps({
  courtId: 'court-uuid',
  date: '2024-03-20',
});
```

---

## Related Documentation

- **[Scheduling Overview](./scheduling-overview)** - Understanding scheduling workflows
- **[Scheduling Profile](./scheduling-profile)** - Multi-day schedule configuration
- **[Automated Scheduling](./automated-scheduling)** - How the scheduling algorithm works
- **[Venue Governor](/docs/governors/venue-governor)** - Complete API reference
