// ============================================================================
// src/data/modelCatalog.js
// Central verified catalog of Kenney.nl .glb models in public/models/
// with URL encoding and core preload helper (zero 404s, zero frame stalls).
// ============================================================================

import { useGLTF } from '@react-three/drei';

const m = (rel) => encodeURI(`/models/${rel}`);

export const MODELS = {
  // Vehicles (Kenney Car Kit — native forward is +Z)
  sedan: m('kenney_car-kit/Models/GLB format/sedan.glb'),
  sedanSports: m('kenney_car-kit/Models/GLB format/sedan-sports.glb'),
  hatchback: m('kenney_car-kit/Models/GLB format/hatchback-sports.glb'),
  suv: m('kenney_car-kit/Models/GLB format/suv.glb'),
  suvLuxury: m('kenney_car-kit/Models/GLB format/suv-luxury.glb'),
  taxi: m('kenney_car-kit/Models/GLB format/taxi.glb'),
  van: m('kenney_car-kit/Models/GLB format/van.glb'),

  // Home Interior & Cafe Furniture (Kenney Furniture Kit)
  bedDouble: m('kenney_furniture-kit/Models/GLTF format/bedDouble.glb'),
  nightstand: m('kenney_furniture-kit/Models/GLTF format/cabinetBedDrawer.glb'),
  desk: m('kenney_furniture-kit/Models/GLTF format/desk.glb'),
  laptop: m('kenney_furniture-kit/Models/GLTF format/laptop.glb'),
  kitchenCabinet: m('kenney_furniture-kit/Models/GLTF format/kitchenCabinet.glb'),
  coffeeMachine: m('kenney_furniture-kit/Models/GLTF format/kitchenCoffeeMachine.glb'),
  sofaCorner: m('kenney_furniture-kit/Models/GLTF format/loungeSofaCorner.glb'),
  sofaLong: m('kenney_furniture-kit/Models/GLTF format/loungeSofaLong.glb'),
  coffeeTable: m('kenney_furniture-kit/Models/GLTF format/tableCoffee.glb'),
  roundTable: m('kenney_furniture-kit/Models/GLTF format/tableRound.glb'),
  chair: m('kenney_furniture-kit/Models/GLTF format/chairModernFrameCushion.glb'),
  books: m('kenney_furniture-kit/Models/GLTF format/books.glb'),

  // Trees, Undergrowth & Forest Floor Props (Kenney Nature Kit)
  pineTall: m('kenney_nature-kit/Models/GLTF format/tree_pineTallA.glb'),
  pineTallB: m('kenney_nature-kit/Models/GLTF format/tree_pineTallB.glb'),
  pineTallC: m('kenney_nature-kit/Models/GLTF format/tree_pineTallC_detailed.glb'),
  pineAlt: m('kenney_nature-kit/Models/GLTF format/tree_pineDefaultB.glb'),
  oakTree: m('kenney_nature-kit/Models/GLTF format/tree_oak.glb'),
  oakDark: m('kenney_nature-kit/Models/GLTF format/tree_oak_dark.glb'),
  detailedTree: m('kenney_nature-kit/Models/GLTF format/tree_detailed.glb'),
  detailedDark: m('kenney_nature-kit/Models/GLTF format/tree_detailed_dark.glb'),
  tallDark: m('kenney_nature-kit/Models/GLTF format/tree_tall_dark.glb'),
  bushDetailed: m('kenney_nature-kit/Models/GLTF format/plant_bushDetailed.glb'),
  bushLarge: m('kenney_nature-kit/Models/GLTF format/plant_bushLarge.glb'),
  fernTall: m('kenney_nature-kit/Models/GLTF format/plant_flatTall.glb'),
  rockLargeA: m('kenney_nature-kit/Models/GLTF format/rock_largeA.glb'),
  rockLargeC: m('kenney_nature-kit/Models/GLTF format/rock_largeC.glb'),
  stumpOld: m('kenney_nature-kit/Models/GLTF format/stump_old.glb'),
  stumpRound: m('kenney_nature-kit/Models/GLTF format/stump_roundDetailed.glb'),
  fallenLog: m('kenney_nature-kit/Models/GLTF format/log.glb'),
  logStack: m('kenney_nature-kit/Models/GLTF format/log_stack.glb'),
  woodFence: m('kenney_nature-kit/Models/GLTF format/fence_simple.glb'),

  // Roads, Streetlights & Props (Kenney City Kit Roads)
  streetlight: m('kenney_city-kit-roads/Models/GLB format/light-curved.glb'),
  streetlightDouble: m('kenney_city-kit-roads/Models/GLB format/light-curved-double.glb'),
  utilityPole: m('kenney_city-kit-roads/Models/GLB format/electricity-pole.glb'),
  highwaySign: m('kenney_city-kit-roads/Models/GLB format/sign-highway.glb'),
  barrier: m('kenney_city-kit-roads/Models/GLB format/construction-barrier.glb'),

  // Suburban Houses & Fences (Kenney City Kit Suburban)
  houseA: m('kenney_city-kit-suburban_20/Models/GLB format/building-type-a.glb'),
  houseB: m('kenney_city-kit-suburban_20/Models/GLB format/building-type-b.glb'),
  houseE: m('kenney_city-kit-suburban_20/Models/GLB format/building-type-e.glb'),
  picketFence: m('kenney_city-kit-suburban_20/Models/GLB format/fence.glb'),

  // Commercial Shophouses & Campus Wings (Kenney City Kit Commercial)
  commercialA: m('kenney_city-kit-commercial_2.1/Models/GLB format/building-a.glb'),
  commercialC: m('kenney_city-kit-commercial_2.1/Models/GLB format/building-c.glb'),
  commercialE: m('kenney_city-kit-commercial_2.1/Models/GLB format/building-e.glb'),
  commercialG: m('kenney_city-kit-commercial_2.1/Models/GLB format/building-g.glb'),
  awningWide: m('kenney_city-kit-commercial_2.1/Models/GLB format/detail-awning-wide.glb'),
};

export const TRAFFIC_VARIANTS = [
  MODELS.sedanSports,
  MODELS.hatchback,
  MODELS.suv,
  MODELS.suvLuxury,
  MODELS.taxi,
  MODELS.van,
];

export const HOUSE_VARIANTS = [MODELS.houseA, MODELS.houseB, MODELS.houseE];

export const FOREST_TREE_VARIANTS = [
  MODELS.pineTall,
  MODELS.pineTallB,
  MODELS.pineTallC,
  MODELS.pineAlt,
  MODELS.oakDark,
  MODELS.detailedDark,
  MODELS.tallDark,
];

export const FOREST_BUSH_VARIANTS = [
  MODELS.bushDetailed,
  MODELS.bushLarge,
  MODELS.fernTall,
];

export const FOREST_FLOOR_VARIANTS = [
  MODELS.rockLargeA,
  MODELS.rockLargeC,
  MODELS.stumpOld,
  MODELS.stumpRound,
  MODELS.fallenLog,
  MODELS.logStack,
];

// Preload ALL forest GLB variants upfront to eliminate mid-cutscene shader/asset stalls
export function preloadAllForestModels() {
  [
    MODELS.sedan,
    ...FOREST_TREE_VARIANTS,
    ...FOREST_BUSH_VARIANTS,
    ...FOREST_FLOOR_VARIANTS,
    MODELS.utilityPole,
    MODELS.woodFence,
    MODELS.barrier,
  ].forEach((url) => useGLTF.preload(url));
}

// Preload core models used immediately across scenes to prevent frame stalls
export function preloadCoreModels() {
  preloadAllForestModels();
  [
    MODELS.sedanSports,
    MODELS.hatchback,
    MODELS.suv,
    MODELS.taxi,
    MODELS.oakTree,
    MODELS.streetlight,
    MODELS.bedDouble,
    MODELS.desk,
    MODELS.sofaCorner,
    MODELS.houseA,
    MODELS.commercialC,
  ].forEach((url) => useGLTF.preload(url));
}
