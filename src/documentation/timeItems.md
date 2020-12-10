---
name: Time Items
menu: General Concepts
route: /concepts/timeItems
---

# Time Items

**timeItems** can exist on any document element in TODS and are used to capture attributes which may change over time and where it is desierable to keep track of such changes.

For instance, a **matchUp** may be assigned to one court and scheduled, and then be interrupted and re-scheduled to start later on another court. **matchUp** _duration_ can be calculated from all **timeItems** which relate to the starting and stopping of play.

## Object properties

```js
const timeItem = {
  itemSubject: SCALE,
  itemType: RANKING,
  itemSubType: undefined,
  itemName: 'WTN'
  itemValue: 13.20
  createdAt: '2020-01-01T00:00'

}
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

tournamentEngine.getTournamentTimeItem({ itemAttributes });
tournamentEngine.getEventTimeItem({ eventId, itemAttributes });
tournamentEngine.getDrawDefinitionTimeItem({ drawId, itemAttributes });
```

### Ranking and Ratings

Sometimes a tournament organizer may want to fetch player Rankings and Ratings from a remote service. In such scenarios it is desireable to both capture a time stamp for when the last retrieval occurred and be able to query an event's **timeItems** to be able to display the value.

#### Adding a timeITem to an event

```js
const timeItem = {
  itemSubject: RETRIEVAL,
  itemType: RANKING,
  itemName: 'U18',
  itemValue: '2021-01-01T00',
};
tournamentEngine.addEventTimeItem({ eventId, timeItem });
```

#### Retrieving a timeITem from an event

```js
const itemAttributes = {
  itemSubject: RETRIEVAL,
  itemType: RANKING,
  itemName: 'U18',
};
const {
  timeItem: retrievedTimeItem,
  message,
} = tournamentEngine.getEventTimeItem({
  eventId,
  itemAttributes,
});
```
