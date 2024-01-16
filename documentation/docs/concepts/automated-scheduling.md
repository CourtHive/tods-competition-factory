---
title: Automated Scheduling
---

## Automated Scheduling

Once the `schedulingProfile`, `matchUpFormatTiming` and `dailyLimits` have been defined, automated assignment of **scheduleTimes** to `matchUps` is straightforward.

```js
engine.scheduleProfileRounds({
  scheduleDates, // optional array of dates to be scheduled
});
```

### Pseudocode

The highest level auto-scheduling method is `engine.scheduleProfileRounds`.

1. Validate and filter `schedulingProfile` dates by specified `scheduleDates`
2. Construct `matchUpDependencies` to ensure matchUps are scheduled before their dependents
3. Get an array of **inContext** `matchUps` for all relevant `tournamentRecords`
4. Retrieve `matchUpDailyLimits` and `personRequests`
5. Sort `scheduleDates` and for each iterate through all venues
6. Construct hash tables of `matchUpNotBeforeTimes` and `matchUpPotentialParticipantIds`
7. Ensure `rounds` specified for `scheduleDate` are sorted as specified
8. Generate ordered array of `matchUpIds` derived from specified `rounds`
9. Build up a mapping of `matchUpIds` to `recoveryMinutes` so that `matchUps` with equivalent `averageMatchUpMinutes`
   can be block scheduled while still considering varying `recoveryMinutes`
10. Group ordered `matchUpIds` by **averageMatchUpMinutes|periodLength**
11. Loop through groups of `matchUpIds` ...
12. Calculate available scheduleTimes, considering court availability, already scheduled matchUps, and `remainingScheduleTimes` from previous iteration
13. Construct per-participant hash tables of `matchUps` played and `timeAfterRecovery`
14. Filter out `matchUps` which are not appropriate for scheduling
15. Filter out `matchUps` which include participants who have reached daily limits
16. Loop through available `scheduleTimes` and build up mapping of `matchUpIds` to `scheduleTimes`
    - Defer scheduling of matchUps where `timeAfterRecovery` has not been reached
    - Defer scheduling of matchUps where `personRequests` include `{ requestType: DO_NOT_SCHEDULE }` conflicts
17. Group `matchUpIds` by **eventId|drawId|structureId** and assign `scheduleTimes` to `matchUps`
18. Return array of `remainingScheduleTimes` from current iteration to seed next iteration of virtualCourtBookings
