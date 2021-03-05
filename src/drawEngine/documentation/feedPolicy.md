---
name: Feed Policies
menu: Draw Engine
route: /drawEngine/feedPolicies
---

# Overview

```js
const feedPolicy = {
  roundGroupedOrder: [
    [1], // complete round TOP_DOWN
    [1], // complete round BOTTOM_UP
    [1, 2], // 1st half BOTTOM_UP, 2nd half BOTTOM_UP
    [2, 1, 4, 3], // 2nd Qtr BOTTOM_UP, 1st Qtr BOTTOM_UP, 4th Qtr BOTTOM_UP, 3rd Qtr BOTTOM_UP
    [2, 1, 4, 3, 6, 5, 8, 7], // 1st Qtr BOTTOM_UP, 2nd Qtr BOTTOM_UP, 3rd Qtr BOTTOM_UP, 4th Qtr BOTTOM_UP
    [1], // complete round BOTTOM_UP
  ],
  roundFeedProfiles: [
    TOP_DOWN,
    BOTTOM_UP,
    BOTTOM_UP,
    BOTTOM_UP,
    BOTTOM_UP,
    BOTTOM_UP,
    BOTTOM_UP,
    BOTTOM_UP,
  ],
};
```
