---
title: structureSort
---

Sorting function to arrange structures by stage, positionAssignments count (size) then stageSequence
Used internally to order Compass structures

```js
import { utilities } from 'tods-competition-factory';
const sortedStructures = drawDefinition.structures.sort(
  utilities.structureSort
);
```

Optionally pass configuration object. Mode 'finishing positions' sorts MAIN stage structures by participant final positions first, followwed by PLAY_OFF, CONSOLATION, QUALIFYING and finally VOLUNTARY_CONSOLATION. NOTE: Compass directions are all considered MAIN stage.

```js
import { drawDefinitionConstants, utilities } from 'tods-competition-factory';
const { FINISHING_POSITIONS } = drawDefinitionConstants;

const sortedStructures = drawDefinition.structures.sort((a, b) =>
  utilities.structureSort(a, b, { mode: FINISHING_POSITIONS })
);
```

---
