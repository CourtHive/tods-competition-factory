# Engines

Engines manage state (any number of tournamentRecords)

- **_async_** performs mutations synchronously and generates notifications for subscribers
- **_sync_** performs mutations synchronously and generates notifications for subscribers
- **_ask_** performs only queries and does not generate notifications for subscribers
- **_mock_** generates mock tournamentRecords and components of tournamentRecords

## Methods

Methods can be invoked in various ways using an engine:

- `engine.execute({ method: 'methodName', params: {}})` // methodName is a function which is defined by engine.setMethods({})
- `engine.execute({ getParticipants, params: {}})` // getParticipants is a method
- `engine.execute({ getParticipants, participantFilters })` // all params which are not functions are passed to the method

:::info
No parameter of a method can be a function
:::
