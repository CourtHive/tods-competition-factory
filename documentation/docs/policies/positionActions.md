---
title: Position Actions
---

See [Actions](/docs/concepts/actions) for context.

`positionActions` returns an array of valid actions for a specified drawPosition. Valid actions can be determined, in part, by
`policyDefinitions`. In the Competition Factory source there are four examples of position action policies:

1. Default position actions
2. No movement (disallows swapping participants & etc.)
3. Disabled position actions
4. Unrestricted position actions (all available actions)

```js
const { positionActions } = tournamentEngine.positionActions({
  drawId,
  eventId,
  drawPosition,
  policyDefinitions: positionActionsPolicy, // optional - policy defining what actions are allowed in client context
});
```
