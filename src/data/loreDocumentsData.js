// ============================================================================
// src/data/loreDocumentsData.js
// Readable atmospheric lore documents scattered across Route 312 Lembah Batu:
// 1. forestry_memo    — Illegal Forestry / Roadworks Permit #LB-312/04
// 2. missing_poster   — Missing Persons Poster at the Old Ranger Watchtower
// 3. local_newspaper  — Yellowed Local Newspaper at Stilt House #2 (Outer Ruin)
// 4. logging_pamphlet — Crumpled Illegal Logging & Road Safety Pamphlet
// ============================================================================

export const LORE_DOCUMENTS = {
  forestry_memo: {
    header: 'INTERNAL SITE MEMORANDUM • PERMIT #LB-312/04',
    stamp: 'UNAUTHORIZED',
    agency: 'LEMBAH BATU FORESTRY & ROADWORKS CONTRACTOR OFFICE',
    date: 'SIGNED 4 YEARS AGO — CONFIDENTIAL / DO NOT POST PUBLICLY',
    title: 'UNAUTHORIZED CONTINUATION OF ROUTE 312 FOREST TRUNK CLEARING',
    paragraphs: [
      'By directive of senior project management (Permit #LB-312/04, signed four years ago), excavation and paving of the Route 312 Lembah Batu forest shortcut proceeded despite suspension orders from the District Forestry Office and local Kampung Hulu council.',
      'Environmental impact clearance and ancestral valley boundary permits were NEVER granted. All site supervisors were instructed to bypass municipal checkpoints, remove warning signage at the E18 junction, and avoid filing incident reports.',
      'ADDENDUM (HANDWRITTEN IN RED INK): Three night-shift surveyors fled after passing KM 14. They locked the spare Starter Relay inside the Mossy Wakaf chest using a riddle carved onto the brass lock—and warned never to stop at the lit warung ahead.',
    ],
  },
  missing_poster: {
    header: 'PUBLIC NOTICE • DISTRICT POLICE BULLETIN',
    stamp: 'MISSING',
    agency: 'KAMPUNG HULU & LEMBAH BATU SEARCH UNIT',
    date: 'POSTED 11 MONTHS AGO — WEATHER-STAINED',
    title: 'HILANG / MISSING: AHMAD DANIEL, 22',
    paragraphs: [
      'Last seen at 11:40 PM driving a dark hatchback south from Universiti Alam after evening study. Traffic cameras recorded his car taking the unlit left detour onto old Route 312 Lembah Batu.',
      'His vehicle was recovered two days later near Kilometer 14 with its hood open and battery cell missing. No footprints were found leaving the asphalt road.',
      'SCRATCHED AT BOTTOM IN CHARCOAL: "If you hear voices from a bright stall in the woods, DO NOT SIT DOWN. Stay where the Surau lamp burns."',
    ],
  },
  local_newspaper: {
    header: 'LEMBAH HARIAN • ARCHIVE CLIPPING',
    stamp: 'SEALED ROAD',
    agency: 'REGIONAL METRO EDITION — YELLOWED FRONT PAGE',
    date: '4 YEARS AGO — PAGE A1',
    title: 'LEMBAH BATU ROAD PROJECT ABANDONED AFTER 4 WORKERS VANISH',
    paragraphs: [
      'Roadworks along the controversial Route 312 valley corridor came to an abrupt halt last week after four contract engineers vanished overnight during a heavy fog near the old timber watchtower.',
      'Elders from neighboring districts insisted the deep forest valley was never settled by humans and should never have been cut open. Survivors reported seeing a tall dark figure standing motionless beyond the generator lights.',
      'MARGIN NOTE: "Left the heavy crowbar here on the porch. They nailed the spare car belt inside the west stilt house crate before running."',
    ],
  },
  logging_pamphlet: {
    header: 'FORESTRY SAFETY & ANTI-LOGGING PAMPHLET',
    stamp: 'RESTRICTED',
    agency: 'STATE FORESTRY CONSERVATION BOARD',
    date: 'CRUMPLED & DAMP — FOUND AT RANGER WATCHTOWER',
    title: 'STAY ON MARKED TRAILS — VALLEY CLOSURE ADVISORY',
    paragraphs: [
      'Entry into the Lembah Batu timber reserve after dusk is strictly prohibited. Illegal clearing along Route 312 destabilized old forest paths and disturbed protected sanctuary ground.',
      'All tool sheds along the East trail remain padlocked by site supervisors. Authorized maintenance keys are kept strictly on the desk inside the West Forestry Contractor Office.',
      'WARNING: Do not rely on old handheld maps alone—follow the woodland footpaths and lantern light back to the main road.',
    ],
  },
};
