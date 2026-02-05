import tournamentEngine from '@Engines/syncEngine';
import { expect, it } from 'vitest';

// constants
import { INDOOR, OUTDOOR } from '@Constants/venueConstants';
import { CLAY, HARD, GRASS } from '@Constants/surfaceConstants';

it('can modify court attributes including indoorOutdoor', () => {
  tournamentEngine.reset();
  let result = tournamentEngine.newTournamentRecord({
    startDate: '2024-01-01',
    endDate: '2024-01-07',
  });
  expect(result.success).toEqual(true);

  // Add a venue with a court
  const myCourts = { venueName: 'Test Venue', venueAbbreviation: 'TV' };
  result = tournamentEngine.devContext({ addVenue: true }).addVenue({ venue: myCourts });
  const {
    venue: { venueId },
  } = result;
  expect(result.success).toEqual(true);

  // Add a court to the venue
  result = tournamentEngine.addCourt({
    venueId,
    court: { courtName: 'Court 1' },
  });
  expect(result.success).toEqual(true);
  const courtId = result.court.courtId;

  // Verify initial court has no indoorOutdoor or surfaceType
  let { venue } = tournamentEngine.findVenue({ venueId });
  let court = venue.courts.find((c: any) => c.courtId === courtId);
  expect(court.courtName).toEqual('Court 1');
  expect(court.indoorOutdoor).toBeUndefined();
  expect(court.surfaceType).toBeUndefined();
  expect(court.floodlit).toBeUndefined();

  // Modify court to add indoorOutdoor
  result = tournamentEngine.modifyCourt({
    courtId,
    modifications: {
      indoorOutdoor: INDOOR,
    },
  });
  expect(result.success).toEqual(true);

  // Verify indoorOutdoor was set
  ({ venue } = tournamentEngine.findVenue({ venueId }));
  court = venue.courts.find((c: any) => c.courtId === courtId);
  expect(court.indoorOutdoor).toEqual(INDOOR);

  // Modify court to change indoorOutdoor and add surfaceType
  result = tournamentEngine.modifyCourt({
    courtId,
    modifications: {
      indoorOutdoor: OUTDOOR,
      surfaceType: CLAY,
    },
  });
  expect(result.success).toEqual(true);

  // Verify both attributes were updated
  ({ venue } = tournamentEngine.findVenue({ venueId }));
  court = venue.courts.find((c: any) => c.courtId === courtId);
  expect(court.indoorOutdoor).toEqual(OUTDOOR);
  expect(court.surfaceType).toEqual(CLAY);

  // Modify court name and surfaceType
  result = tournamentEngine.modifyCourt({
    courtId,
    modifications: {
      courtName: 'Center Court',
      surfaceType: HARD,
      floodlit: true,
    },
  });
  expect(result.success).toEqual(true);

  // Verify all attributes
  ({ venue } = tournamentEngine.findVenue({ venueId }));
  court = venue.courts.find((c: any) => c.courtId === courtId);
  expect(court.courtName).toEqual('Center Court');
  expect(court.indoorOutdoor).toEqual(OUTDOOR);
  expect(court.surfaceType).toEqual(HARD);
  expect(court.floodlit).toEqual(true);

  // Test clearing indoorOutdoor by setting to undefined
  result = tournamentEngine.modifyCourt({
    courtId,
    modifications: {
      indoorOutdoor: undefined,
    },
  });
  expect(result.success).toEqual(true);

  ({ venue } = tournamentEngine.findVenue({ venueId }));
  court = venue.courts.find((c: any) => c.courtId === courtId);
  expect(court.indoorOutdoor).toBeUndefined();
  expect(court.surfaceType).toEqual(HARD); // Other attributes unchanged
  expect(court.floodlit).toEqual(true);

  // Test all surface types
  result = tournamentEngine.modifyCourt({
    courtId,
    modifications: {
      surfaceType: GRASS,
    },
  });
  expect(result.success).toEqual(true);

  ({ venue } = tournamentEngine.findVenue({ venueId }));
  court = venue.courts.find((c: any) => c.courtId === courtId);
  expect(court.surfaceType).toEqual(GRASS);
});

it('can modify multiple courts with different attributes', () => {
  tournamentEngine.reset();
  let result = tournamentEngine.newTournamentRecord({
    startDate: '2024-01-01',
    endDate: '2024-01-07',
  });
  expect(result.success).toEqual(true);

  // Add a venue
  const venue = { venueName: 'Tennis Club', venueAbbreviation: 'TC' };
  result = tournamentEngine.devContext({ addVenue: true }).addVenue({ venue });
  const {
    venue: { venueId },
  } = result;
  expect(result.success).toEqual(true);

  // Add multiple courts
  result = tournamentEngine.addCourts({
    venueId,
    courtsCount: 3,
  });
  expect(result.success).toEqual(true);

  const { venue: venueData } = tournamentEngine.findVenue({ venueId });
  expect(venueData.courts.length).toEqual(3);

  const [court1, court2, court3] = venueData.courts;

  // Modify first court as indoor clay
  result = tournamentEngine.modifyCourt({
    courtId: court1.courtId,
    modifications: {
      indoorOutdoor: INDOOR,
      surfaceType: CLAY,
      floodlit: false,
    },
  });
  expect(result.success).toEqual(true);

  // Modify second court as outdoor hard with lights
  result = tournamentEngine.modifyCourt({
    courtId: court2.courtId,
    modifications: {
      indoorOutdoor: OUTDOOR,
      surfaceType: HARD,
      floodlit: true,
    },
  });
  expect(result.success).toEqual(true);

  // Modify third court as outdoor grass without lights
  result = tournamentEngine.modifyCourt({
    courtId: court3.courtId,
    modifications: {
      indoorOutdoor: OUTDOOR,
      surfaceType: GRASS,
      floodlit: false,
    },
  });
  expect(result.success).toEqual(true);

  // Verify all courts have correct attributes
  const { venue: updatedVenue } = tournamentEngine.findVenue({ venueId });
  const [c1, c2, c3] = updatedVenue.courts;

  expect(c1.indoorOutdoor).toEqual(INDOOR);
  expect(c1.surfaceType).toEqual(CLAY);
  expect(c1.floodlit).toEqual(false);

  expect(c2.indoorOutdoor).toEqual(OUTDOOR);
  expect(c2.surfaceType).toEqual(HARD);
  expect(c2.floodlit).toEqual(true);

  expect(c3.indoorOutdoor).toEqual(OUTDOOR);
  expect(c3.surfaceType).toEqual(GRASS);
  expect(c3.floodlit).toEqual(false);
});
