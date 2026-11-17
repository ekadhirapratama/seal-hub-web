# Seal Online Data Source Research & Schema Mapping

## 1. Overview
This research maps data sources, structures, formats, and gaps on the Seal Online Indonesian fandom wiki (`https://sealonline.fandom.com/id/wiki/`) and complementary official/English wiki references for the client-only static SvelteKit web application companion.

---

## 2. Feature-by-Feature Data Inventory

### Feature 1: Quest Items & Fame Reward (Level Ranges)
- **Page URLs**:
  - `https://sealonline.fandom.com/id/wiki/Quest_Item_1_-_30`
  - `https://sealonline.fandom.com/id/wiki/Quest_Item_45_-_97`
  - `https://sealonline.fandom.com/id/wiki/Quest_Item_135_-_180`
  - `https://sealonline.fandom.com/id/wiki/Quest_Item_160_-_230`
- **Table Columns Observed**:
  - `Item` (index number)
  - `Name` (quest item name)
  - `Qty` (required quantity)
  - `Fame` (fame reward)
  - `Exp` (experience reward, sometimes 0 for high level items)
  - `Cegel` (cegel/gold reward)
  - `Quest Lv. Limits` (Lowest limit / Highest limit / Lv limits)
  - `Dropped by` (monster source list)
- **Sample Rows (Real Data)**:
  1. *Quest Item 1 - 30*: `[1] | Geranium | 30 | 20 | 260 | 100 | Above Lv. 1 | Below Lv. 8 | Piya , Beanie`
  2. *Quest Item 45 - 97*: `[1] | Sharp Tooth | 20 | 170 | 16500 | Above Lv. 45 | Below Lv. 64 | Bale: Tarantula Ben, Flying Pig`
  3. *Quest Item 135 - 180*: `[1] | Devil's Nail | 30 | 350 | 126000 | Above Lv. 135 | Below Fame 182178 | Mob: Soul Collector`
- **Data Gaps & Inconsistencies**:
  - Inconsistent table header naming across level ranges (`Lowest Limit` vs `LowestLimit`, `Quest Lv. Limits` vs separate limit columns).
  - Missing intermediate level range pages on ID wiki (e.g., levels 31-44, 98-134) which require referencing English wiki or fallback computation.

---

### Feature 2: Fame Titles / Ranks & Required Fame Numbers
- **Page URLs**:
  - `https://sealonline.fandom.com/id/wiki/Fame` (also referenced via `Reputasi`)
- **Table Columns Observed**:
  - `Title` (in-game rank name)
  - `Alternative Title` (alternative designation)
  - `Fame` (cumulative numeric requirement)
  - `Sleep Avatar` (resting pose/avatar in-game)
  - `Death Deduction` (% fame penalty upon death)
- **Sample Rows (Real Data)**:
  1. `Beggar | Baby | 0 | Newspaper | -10%`
  2. `Drifter | Child | 50 | Newspaper | -7%`
  3. `Brute | Soldier | 581 | Newspaper | -7%`
  4. `Fodder | King | 182,178 | Bed | -2%`
  5. `Demigod | Hades the God of Death | 41,375,680 | - | -`
- **Data Gaps & Inconsistencies**:
  - Occasional formatting commas in numeric fame values require string parsing (`182,178` -> `182178`).
  - Sleep avatar and death penalty percentages vary across tiers.

---

### Feature 3: Quest Sources & Walkthrough Guidance
- **Page URLs**:
  - `https://sealonline.fandom.com/id/wiki/Quests`
  - `https://sealonline.fandom.com/id/wiki/Quest_Sentral_Misi` (Quest Center)
  - `https://sealonline.fandom.com/id/wiki/Menghilangnya_Bale_Quest` (Main Quest / Hanael Episode 1)
  - `https://sealonline.fandom.com/id/wiki/4_Heroes_Quest`
- **Formats Observed**:
  - **Item Table Format**: Tabular layout listing item requirements, rewards, and level limits (e.g., Quest Center / Quest Items).
  - **Walkthrough Story Format**: Sequential step-by-step prose instructions detailing NPC interactions, prerequisites, and location warps (e.g., Main Quests like *Menghilangnya Bale* and *4 Heroes Quest*).
- **Sample Data**:
  - *4 Heroes Quest*: `-- Bicaralah kpd npc D.End (terletak di menara pelatihan kota lime/elim... Level minimal 15`
- **Data Gaps & Inconsistencies**:
  - Story walkthroughs lack structured reward metadata (Exp/Cegel/Fame) in uniform tables, requiring heuristic extraction or manual curation.

---

### Feature 4: Pet Evolution Trees & Materials
- **Page URLs**:
  - `https://sealonline.fandom.com/id/wiki/Pet` (English / ID references)
  - `https://sealonline.fandom.com/id/wiki/Seed_Egg`
  - `https://sealonline.fandom.com/id/wiki/Piya_Egg`
  - `https://sealonline.fandom.com/id/wiki/Bird_Egg`
  - `https://sealonline.fandom.com/id/wiki/Heaven_Egg`
  - `https://sealonline.fandom.com/id/wiki/Mandra_Seed`
  - `https://sealonline.fandom.com/id/wiki/Black_Dragon_Egg`
- **Categories & Evolution Stages**:
  - Categories: Seed, Piya, Bird, Heaven, Mandragora (Mandra), Kitsune, Black Dragon (Dragon).
  - Evolution stages span Stage 1 through Stage 7, with branches into Rare / Very Rare / Class-specific variants (e.g., Warrior Moo Moo, Valkyrie).
- **Sample Evolution Data**:
  - *Piya Egg*: Stage 1 (`Piya Egg (Pet)`) -> Stage 2 (`Baby Piya`) via Evolution Items: `Hatching Stone, Milk, Soy Milk, Geranium, Piya's Unfertilized Egg, Chicken Feather, Egg, Sap, Vegetable Oil, Lucky Card`.
- **Data Gaps & Inconsistencies**:
  - Complex branching trees with probabilistic success rates and strict ingredient ordering order sensitivity. ID wiki pet pages are sparse; core tree structures rely on English wiki (`Seed_Egg`, `Piya_Egg`, etc.).

---

### Feature 5: Jobs / Classes List
- **Page URLs**:
  - `https://sealonline.fandom.com/id/wiki/Profesi`
  - `https://sealonline.fandom.com/id/wiki/Karakter`
- **Data Structure**:
  - 1st Job / Base Classes: Beginner, Warrior, Knight, Mage, Priest/Cleric, Jester/Clown, Craftsman, Hunter.
  - 2nd Job / Advanced Classes (Job 2): Vagabond, Freezer, Burner, Destroyer, Paladin, Blademaster, Barbarian, Priest, Prophet, Assassin, Trickster, Bomber, Smith, Archer, Gunner.
- **Sample Data**:
  - `WARRIOR | Karena memiliki daya serang dan kombinasi yang tinggi... | Daya serang tertinggi`
- **Data Gaps & Inconsistencies**:
  - 2nd job promotion quest details are scattered across individual job sub-pages (`Assassin job2`, `Knight`, etc.).

---

## 3. Draft JSON Schemas (With Sample Data)

### 1. Quest Items (`quest-items.json`)
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "id": { "type": "string" },
      "levelRange": { "type": "string" },
      "itemName": { "type": "string" },
      "quantity": { "type": "integer" },
      "fameReward": { "type": "integer" },
      "expReward": { "type": "integer" },
      "cegelReward": { "type": "integer" },
      "minLevel": { "type": "integer" },
      "maxLevel": { "type": "integer" },
      "droppedBy": { "type": "array", "items": { "type": "string" } }
    },
    "required": ["id", "levelRange", "itemName", "quantity", "fameReward", "minLevel"]
  }
}
```
**Sample:**
```json
[
  {
    "id": "qi-1-30-1",
    "levelRange": "1-30",
    "itemName": "Geranium",
    "quantity": 30,
    "fameReward": 20,
    "expReward": 260,
    "cegelReward": 100,
    "minLevel": 1,
    "maxLevel": 8,
    "droppedBy": ["Piya", "Beanie"]
  }
]
```

---

### 2. Fame Titles (`fame-titles.json`)
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "rank": { "type": "integer" },
      "title": { "type": "string" },
      "alternativeTitle": { "type": "string" },
      "requiredFame": { "type": "integer" },
      "sleepAvatar": { "type": "string" },
      "deathDeduction": { "type": "string" }
    },
    "required": ["rank", "title", "requiredFame"]
  }
}
```
**Sample:**
```json
[
  {
    "rank": 1,
    "title": "Beggar",
    "alternativeTitle": "Baby",
    "requiredFame": 0,
    "sleepAvatar": "Newspaper",
    "deathDeduction": "-10%"
  }
]
```

---

### 3. Quests (`quests.json`)
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "id": { "type": "string" },
      "title": { "type": "string" },
      "category": { "type": "string", "enum": ["quest_center", "main_quest", "story_walkthrough"] },
      "minLevel": { "type": "integer" },
      "startNpc": { "type": "string" },
      "location": { "type": "string" },
      "steps": { "type": "array", "items": { "type": "string" } },
      "rewards": {
        "type": "object",
        "properties": {
          "fame": { "type": "integer" },
          "exp": { "type": "integer" },
          "cegel": { "type": "integer" },
          "items": { "type": "array", "items": { "type": "string" } }
        }
      }
    },
    "required": ["id", "title", "category"]
  }
}
```
**Sample:**
```json
[
  {
    "id": "q-4-heroes",
    "title": "4 Heroes Quest",
    "category": "main_quest",
    "minLevel": 15,
    "startNpc": "D.End",
    "location": "Lime / Elim Training Tower",
    "steps": [
      "Bicaralah kepada NPC D.End di menara pelatihan kota Lime/Elim.",
      "Gunakan warp portal di belakang D.End menuju masa depan.",
      "Bicaralah kepada Joan dan pilih semua pilihan dialog."
    ],
    "rewards": {
      "fame": 0,
      "exp": 0,
      "cegel": 0,
      "items": []
    }
  }
]
```

---

### 4. Pets (`pets.json`)
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "category": { "type": "string", "enum": ["Seed", "Piya", "Bird", "Heaven", "Mandragora", "Kitsune", "Black Dragon"] },
      "stages": {
        "type": "array",
        "items": {
          "object": {
            "properties": {
              "stage": { "type": "integer" },
              "name": { "type": "string" },
              "evolutionItems": { "type": "array", "items": { "type": "string" } }
            }
          }
        }
      }
    },
    "required": ["category", "stages"]
  }
}
```
**Sample:**
```json
[
  {
    "category": "Piya",
    "stages": [
      {
        "stage": 1,
        "name": "Piya Egg (Pet)",
        "evolutionItems": ["Hatching Stone", "Milk", "Soy Milk", "Geranium", "Piya's Unfertilized Egg"]
      },
      {
        "stage": 2,
        "name": "Baby Piya",
        "evolutionItems": ["Chicken Feather", "Egg", "Sap", "Vegetable Oil"]
      }
    ]
  }
]
```

---

### 5. Jobs (`jobs.json`)
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "className": { "type": "string" },
      "tier": { "type": "integer", "enum": [1, 2] },
      "baseClass": { "type": "string" },
      "description": { "type": "string" },
      "attackType": { "type": "string" }
    },
    "required": ["className", "tier"]
  }
}
```
**Sample:**
```json
[
  {
    "className": "Warrior",
    "tier": 1,
    "baseClass": "Beginner",
    "description": "High damage and combo capability.",
    "attackType": "Melee"
  },
  {
    "className": "Blademaster",
    "tier": 2,
    "baseClass": "Warrior",
    "description": "Advanced warrior specialization.",
    "attackType": "Melee"
  }
]
```
