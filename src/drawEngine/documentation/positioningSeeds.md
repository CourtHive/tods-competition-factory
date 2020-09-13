---
name: Positioning Seeds
menu: Draw Engine
route: /drawEngine/seedPositiioning
---

# Positioning Seeds

**drawEngine** manages a **seedAssignments** attribute of **structure** which expects there to be one **participantId** per **seedNumber**

**seedNumber** must be unique and serves to keep track of the *number of seeds* allowed within a draw structure

Each **seedAssignment** has a **seedValue** which can occur multiple times and enables multiple participants to effectively be seeded to the same **seedNumber**.

When placing seed blocks, **getNextSeedBlock** uses a policy to determine whether to return unplaced seeds whose **seedNumber** is specified by the seedBlock definition, or whether to return seeded participants with the lowest **seedValues** who have yet to be placed.  

When **seedValues** are used it is possiible to have players seeded [1],[2],[3,4],[4,4,4,5] and for a randomly selected player seeded 4th to be placed in the 3-4 seed block, with all remaining seeded players placed in the 5-8 seed block.
