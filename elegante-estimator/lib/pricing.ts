// ============================================================
// ELEGANTE CARPET LLC — PRICING CONFIGURATION
// Edit prices here. They will update everywhere automatically.
// ============================================================

export const PRICING = {
  // --- Wall-to-Wall Installation ---
  installation: 15.00,       // per square yard (Wall-to-Wall Installation)
  doubleStick: 15.00,        // per square yard (Double Stick Installation) — edit here to change price
  ripUp: 5.50,               // per square yard (Rip Up & Disposal of Old Carpet)
  pad40oz: 8.75,             // per square yard
  receiveDelivery: 95.00,    // flat fee

  // --- Stairs ---
  regularStep: 35.00,        // per step
  landing: 55.00,            // per landing
  pieStep: 45.00,            // per pie/curved step

  // --- Edge Finishing (per linear foot) ---
  serging: 6.75,
  cottonBinding: 5.50,
  wideBinding: 9.50,

  // --- Rug Extras ---
  handSewnMiter: 30.00,      // per miter
  handSewing: 10.00,         // per linear foot
  nonSkidPad: 12.50,         // per square yard (NOTE: spec says 12.50)

  // --- Seaming ---
  seaming: 7.00,             // per linear foot

  // --- Extra Services ---
  furnitureHandling: 75.00,  // per room
  bedDisassembly: 150.00,    // per bed
  tacklessDefault: 75.00,    // per box (editable on form)

  // --- Travel ---
  tripBase: 139.00,          // flat base charge
  tripPerMile: 1.45,         // per mile

  // --- Rug Size Tables ---
  // Key format: "WxL" → price
  // If rug doesn't match exactly, pick the next size up.

  rugReceiveFabricate: {
    "8x10": 200,
    "9x12": 225,
    "10x12": 250,
    "10x14": 275,
    "12x15": 325,
  } as Record<string, number>,

  rugReceiveInspect: {
    "8x10": 150,
    "9x12": 175,
    "10x12": 200,
    "10x14": 250,
    "12x15": 300,
  } as Record<string, number>,

  rugWrapShip: {
    "8x10": 125,
    "9x12": 150,
    "10x12": 175,
    "10x14": 185,
    "12x15": 225,
  } as Record<string, number>,

  rugDelivery: {
    "8x10": 200,
    "9x12": 225,
    "10x12": 250,
    "10x14": 275,
    "12x15": 350,
  } as Record<string, number>,
};

// Standard rug sizes in order (smallest to largest area).
// Used to find the "next size up" when a rug doesn't match exactly.
export const RUG_SIZE_TIERS = [
  { key: "8x10",  w: 8,  l: 10 },
  { key: "9x12",  w: 9,  l: 12 },
  { key: "10x12", w: 10, l: 12 },
  { key: "10x14", w: 10, l: 14 },
  { key: "12x15", w: 12, l: 15 },
];
