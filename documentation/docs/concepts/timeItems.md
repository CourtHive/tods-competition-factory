---
title: Time Items
---

**timeItems** can exist on any document element in TODS and are used to capture attributes which may change over time and where it is desierable to keep track of such changes.

For instance, a **matchUp** may be assigned to one court and scheduled, and then be interrupted and re-scheduled to start later on another court. **matchUp** _duration_ can be calculated from all **timeItems** which relate to the starting and stopping of play.

## Object properties

```js
const timeItem = {
  itemType: 'SCALE.RANKING.SINGLES.WTN',
  itemSubTypes; [], // optional
  itemValue: 13.20,
  itemDate: '2020-01-01T00:00',
  createdAt: '2020-01-03T06:21'
}
```

### itemType and itemSubTypes

itemType is a string, while itemSubTypes is an array of strings. In Competition Factory itemType uses dot notation to represent a hierarchical structure. This is useful for matching fragments of a type in some internal functions.

#### Example itemTypes

```js
itemType: 'SCHEDULE.ASSIGNMENT.VENUE',
itemType: 'SCHEDULE.ASSIGNMENT.COURT',
itemType: 'SCHEDULE.ASSIGNMENT.OFFICIAL',
itemType: 'SCHEDULE.DATE',
itemType: 'SCHEDULE.TIME.SCHEDULED',
itemType: 'SCHEDULE.TIME.START',
itemType: 'SCHEDULE.TIME.STOP',
itemType: 'SCHEDULE.TIME.RESUME',
itemType: 'SCHEDULE.TIME.END,
```

## Internal usage

In most cases **timeItems** are used internally by the various Competition Factory engines.

### Participants

**timeItems** are used to track participant registration, sign-in and payment status as well as penalties and rankings and ratings values for different event categories. They are also used to capture manual seedings for events.

### matchUps

**timeItems** are used to capture scheduling attributes including start, stop, resume, end as well as assignment of court, referee & etc. Schedule related attributes are extracted from **timeItems** when a matchUp is retrieved with "context" and added to the **matchUp.schedule** object.

## Other use cases

Competition Factory defines methods for adding and retrieving arbitrary **timeItems** for the tournament record, event, and drawDefinitions.

```js
tournamentEngine.addTournamentTimeItem({ timeItem });
tournamentEngine.addEventTimeItem({ eventId, timeItem });
tournamentEngine.addDrawDefinitionTimeItem({ drawId, timeItem });

tournamentEngine.getTournamentTimeItem({ itemType, itemSubTypes });
tournamentEngine.getEventTimeItem({ eventId, itemType, itemSubTypes });
tournamentEngine.getDrawDefinitionTimeItem({ drawId, itemType, itemSubTypes });
```

### Ranking and Ratings

Sometimes a tournament organizer may want to fetch player Rankings and Ratings from a remote service. In such scenarios it is desireable to both capture a time stamp for when the last retrieval occurred and be able to query an event's **timeItems** to be able to display the value.

#### Adding a timeITem to an event

```js
const timeItem = {
  itemType: 'RETRIEVAL.RANKING.SINGLES.U18',
  itemValue: '2021-01-01T00:00',
};
tournamentEngine.addEventTimeItem({ eventId, timeItem });
```

#### Retrieving a timeITem from an event

```js
const {
  timeItem: retrievedTimeItem,
  message,
} = tournamentEngine.getEventTimeItem({
  itemType: 'RETRIEVAL.RANKING.SINGLES.U18',
  eventId,
});
```
