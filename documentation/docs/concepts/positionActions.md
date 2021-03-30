---
name: Position Actions
menu: General Concepts
route: /concepts/positionActions
---

# Position Actions

```js
const { positionActions } = tournamentEngine.positionActions({
  drawId,
  eventId,
  drawPosition,
  policyDefinition: positionActionsPolicy, // optional - policy defining what actions are allowed in client context
});
```
