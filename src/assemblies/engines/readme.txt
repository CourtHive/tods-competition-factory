1. no methods may take a function as a parameter (e.g. custom sorting)
2. Ways to invoke methods:
  a: engine.execute({ method: 'methodName', params: {}}) // methodName is a function which is defined by engine.setMethods({})
  b: engine.execute({ getParticipants, params: {}}) // getParticipants is a method
  c: engine.execute({ getParticipants, participantFilters }) // all params which are not functions are passed to the method