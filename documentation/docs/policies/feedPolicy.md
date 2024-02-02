---
title: Feed Policy
---

A **_Feed Policy_** controls how participants are fed into CONSOLATION structures. For MAIN structures, participants are fed starting from **final rounds**, always "Top Down" and there are currently no policy configurations.

Feeding participants into COSOLATION structures is controlled by the following attributes:

## **feedFromMainFinal**

Allow participants to feed into CONSOLATION from MAIN final. This is considered an edge case and is **_false_** by default.

## **roundGroupedOrder**

Controls the order in which participants are fed from rounds of the MAIN structure into round of a CONSOLATION structure. Works in conjunction with **roundFeedProfiles**. For every item in the **roundGroupedOrder** array there should be a corresponding directive in the **roundFeedProfiles** array.

Each array element is an array specifying how many divisions are to be made in the round being fed. For example, for a MAIN structure with 64 participants in the first round, 32 participants will be fed into the CONSOLATION structure. The array **[1]** specifies that these 16 participants should be treated as one group.

In the example given below, the third round grouped order is **[1, 2]**. This specifies that participants should be treated as two groups and that the first group will be processed first using the corresponding feed profile directive; in a draw of 64 when the feed profile is BOTTOM_UP this means that the first half of 16 players being fed into the third round will be fed as follows:

[**1**, 2] => [**8, 7, 6, 5, 4, 3, 2, 1**, 16, 15, 14, 13, 12, 11, 10, 9].

The 8 players being fed in the fourth round start with the 3rd division, e.g. [5, 6]. BOTTOM_UP reverses this to [6, 5].

[**3**, 4, **1**, 2] => [**6, 5**, 8, 7 , **2, 1**, 3, 4]

## **roundFeedProfiles**

An array of directives specifying whether the feed for each fed round will be TOP_DOWN or BOTTOM_UP.

## EXAMPLE

This example is sufficient to cover MAIN draw sizes up to 128. This is because the fifth element of the **roundGroupedOrder** array corresponds to the eighth round of a CONSOLATION structure. With a 128 MAIN structure, fed rounds contain 64, 32, 16, 8, 4 and 2 participants. When a MAIN draw size is less than 128, the factory uses an internal method `reduceGroupOrder` to ensure the number of array elements is never greater than the number of participants being fed.

```js
const feedPolicy = {
  feedFromMainFinal, // optional - defaults to false; drawSize: 4 will not feed from main final unless true
  roundGroupedOrder: [
    [1], // complete round TOP_DOWN
    [1], // complete round BOTTOM_UP
    [1, 2], // 1st half BOTTOM_UP, 2nd half BOTTOM_UP
    [3, 4, 1, 2], // 3rd Qtr BOTTOM_UP, 4th Qtr BOTTOM_UP, 1st Qtr BOTTOM_UP, 2nd Qtr BOTTOM_UP
    [2, 1, 4, 3, 6, 5, 8, 7], // 1st Qtr BOTTOM_UP, 2nd Qtr BOTTOM_UP, 3rd Qtr BOTTOM_UP, 4th Qtr BOTTOM_UP
    [1], // complete round BOTTOM_UP
  ],
  roundFeedProfiles: [TOP_DOWN, BOTTOM_UP, BOTTOM_UP, BOTTOM_UP, BOTTOM_UP, BOTTOM_UP, BOTTOM_UP, BOTTOM_UP],
};
```
