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

## Explanation

Each engine is an instance of FactoryEngine. Engine objects provides several methods for managing state, executing commands, and interacting with a tournament or set of linked tournaments.

Engine objects have several properties:

- setState: This method sets the state of the system. It accepts records, deepCopyOption, and deepCopyAttributes as arguments. It sets the deep copy options, sets the state, and returns the result of processResult(result).
- setTournamentRecord: adds a single tournamentRecord to state
- getState: This method retrieves the state of the system. It accepts an optional params object and passes its properties (convertExtensions and removeExtensions) to the getState function imported from stateMethods.
- getTournament: returns a specific tournament from state
- reset: resets the engine, removing all tournament records
- version: holds the version of the factory, assigned the value of factoryVersion.
- execute: calls engineInvoke with the engine object and any arguments passed to invokeMethod.
- executionQueue: executes an array of method/params objects, deferring all notifications until all methods have been executed
- devContext: controls execution behaviors including logging
- getDevContext: This method retrieves the development context based on the contextCriteria argument.

The engine object is immediately invoked and exported, making it a singleton. This means that there's only one instance of engine throughout the application, ensuring data consistency across different parts of the application that use it.
