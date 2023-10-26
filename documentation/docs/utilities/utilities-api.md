---
title: utilities API
---

Convenience methods useful for projects working with the Competition Factory.

---

## addExtension

Adds extension entry to element `.extensions` attribute; error checking; creates attribute if necessary; overwrites existing value;

```js
addExtension({
  extension: { name, value },
  creationTime, // boolean - add timeStamp
  element: obj,
});
```

---

## calculateWinCriteria

---

## chunkArray

---

## compareTieFormats

---

## countValues

---

## createMap

---

## dateRange

---

## dateTime

---

## definedAttributes

---

## dehydrateMatchUps

---

## extractAttributes

---

## findExtension

```js
const { extension } = findExtension({ element, name });
```

---

## generateHashCode

---

## generateRange

---

## generateScoreString

---

## generateTimeCode

---

## getScaleValues

---

## getTimeItem

---

## hasAttributeValues

---

## instanceCount

---

## intersection

---

## isAdHoc

---

## isConvertableInteger

---

## isPowerOf2

---

## JSON2CSV

---

## makeDeepCopy

---

## matchUpSort

---

## nearestPowerOf2

---

## nextPowerOf2

---

## overlap

---

## parseAgeCategoryCode

---

## parseScoreString

---

## randomMember

---

## randomPop

---

## roundRobinGroups

---

## scoreHasValue

---

## shuffleArray

---

## structureSort

---

## tidyScore

---

## unique

---

## UUID

---

## UUIDS

---

## validateTieFormat

---

## visualizeScheduledMatchUps

Generate color-coded printout of matchUp schedule details

```js
visualizeScheduledMatchUps({ scheduledMatchUps, showGlobalLogs: true });
```
