// ============================================================
// ELEGANTE CARPET LLC — CALCULATION HELPERS
// All math lives here. UI components just call these functions.
// ============================================================

import { PRICING, RUG_SIZE_TIERS } from "./pricing";

/** Safely parse a number from a form field. Returns 0 if blank or invalid. */
export function safeNum(val: string | number | undefined): number {
  const n = Number(val);
  return isNaN(n) || n < 0 ? 0 : n;
}

/** Convert square feet → square yards */
export function sqFtToSqYd(sqFt: number): number {
  return sqFt / 9;
}

/** Round to 2 decimal places */
export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// ─── WALL-TO-WALL ROOM ──────────────────────────────────────

// installType: "none" | "wallToWall" | "doubleStick"
export type InstallType = "none" | "wallToWall" | "doubleStick";

export interface RoomCalcInput {
  width: number;
  length: number;
  qty: number;
  installType: InstallType;  // replaces old boolean "installation"
  ripUp: boolean;
  pad: boolean;
  receiveDelivery: boolean;
}

export interface RoomCalcResult {
  sqFt: number;
  sqYd: number;
  installTotal: number;      // wall-to-wall OR double stick total
  ripUpTotal: number;
  padTotal: number;
  receiveDeliveryTotal: number;
  subtotal: number;
}

export function calcRoom(input: RoomCalcInput): RoomCalcResult {
  const qty = Math.max(1, safeNum(input.qty));
  const sqFt = round2(safeNum(input.width) * safeNum(input.length) * qty);
  const sqYd = round2(sqFtToSqYd(sqFt));

  // Installation: wall-to-wall or double stick (mutually exclusive)
  const installRate =
    input.installType === "wallToWall"  ? PRICING.installation :
    input.installType === "doubleStick" ? PRICING.doubleStick  : 0;
  const installTotal         = round2(sqYd * installRate);
  const ripUpTotal           = input.ripUp           ? round2(sqYd * PRICING.ripUp)   : 0;
  const padTotal             = input.pad             ? round2(sqYd * PRICING.pad40oz) : 0;
  const receiveDeliveryTotal = input.receiveDelivery ? PRICING.receiveDelivery        : 0;

  const subtotal = round2(installTotal + ripUpTotal + padTotal + receiveDeliveryTotal);
  return { sqFt, sqYd, installTotal, ripUpTotal, padTotal, receiveDeliveryTotal, subtotal };
}

// ─── STAIRS ─────────────────────────────────────────────────

export interface StairCalcInput {
  regularSteps: number;
  landings: number;
  pieSteps: number;
  receiveDelivery: boolean;
  pad: boolean;
  padSqYd: number;
}

export interface StairCalcResult {
  regularTotal: number;
  landingTotal: number;
  pieTotal: number;
  padTotal: number;
  receiveDeliveryTotal: number;
  subtotal: number;
}

export function calcStairs(input: StairCalcInput): StairCalcResult {
  const regularTotal         = round2(safeNum(input.regularSteps) * PRICING.regularStep);
  const landingTotal         = round2(safeNum(input.landings) * PRICING.landing);
  const pieTotal             = round2(safeNum(input.pieSteps) * PRICING.pieStep);
  const padTotal             = input.pad ? round2(safeNum(input.padSqYd) * PRICING.pad40oz) : 0;
  const receiveDeliveryTotal = input.receiveDelivery ? PRICING.receiveDelivery : 0;

  const subtotal = round2(regularTotal + landingTotal + pieTotal + padTotal + receiveDeliveryTotal);
  return { regularTotal, landingTotal, pieTotal, padTotal, receiveDeliveryTotal, subtotal };
}

// ─── RUG SIZE LOOKUP ─────────────────────────────────────────

/**
 * Given a rug width and length, return the pricing tier key (e.g. "10x12").
 * Picks the smallest tier that fits both dimensions.
 * Returns null if larger than all tiers (oversize — needs custom pricing).
 */
export function getRugTierKey(width: number, length: number): string | null {
  // Ensure width ≤ length for consistent matching (rugs can be rotated)
  const w = Math.min(width, length);
  const l = Math.max(width, length);

  for (const tier of RUG_SIZE_TIERS) {
    if (w <= tier.w && l <= tier.l) {
      return tier.key;
    }
  }
  return null; // oversize
}

// ─── RUG FABRICATION ────────────────────────────────────────

export type FinishingStyle = "serging" | "cottonBinding" | "wideBinding";

export interface RugCalcInput {
  width: number;
  length: number;
  finishingStyle: FinishingStyle;
  miters: boolean;
  miterCount: number;
  handSewing: boolean;
  handSewingLF: number;
  receiveFabricate: boolean;
  receiveInspect: boolean;
  wrapShip: boolean;
  nonSkidPad: boolean;
  delivery: boolean;
  customOversizePrice: number;
}

export interface RugCalcResult {
  sqFt: number;
  sqYd: number;
  linearFt: number;
  tierKey: string | null;
  isOversize: boolean;
  finishingTotal: number;
  miterTotal: number;
  handSewingTotal: number;
  receiveFabricateTotal: number;
  receiveInspectTotal: number;
  wrapShipTotal: number;
  nonSkidPadTotal: number;
  deliveryTotal: number;
  subtotal: number;
}

export function calcRug(input: RugCalcInput): RugCalcResult {
  const w = safeNum(input.width);
  const l = safeNum(input.length);

  const sqFt     = round2(w * l);
  const sqYd     = round2(sqFtToSqYd(sqFt));
  // Perimeter = linear feet of edge to finish
  const linearFt = round2((w + l) * 2);

  const tierKey   = getRugTierKey(w, l);
  const isOversize = tierKey === null;

  // Edge finishing price per LF
  const finishRate =
    input.finishingStyle === "serging"        ? PRICING.serging :
    input.finishingStyle === "cottonBinding"  ? PRICING.cottonBinding :
    input.finishingStyle === "wideBinding"    ? PRICING.wideBinding : 0;

  const finishingTotal   = round2(linearFt * finishRate);
  const miterTotal       = input.miters     ? round2(safeNum(input.miterCount) * PRICING.handSewnMiter) : 0;
  const handSewingTotal  = input.handSewing ? round2(safeNum(input.handSewingLF) * PRICING.handSewing)  : 0;
  const nonSkidPadTotal  = input.nonSkidPad ? round2(sqYd * PRICING.nonSkidPad)                         : 0;

  // Size-based pricing — if oversize, use custom price
  const getPrice = (table: Record<string, number>) =>
    isOversize ? safeNum(input.customOversizePrice) : (tierKey ? (table[tierKey] ?? 0) : 0);

  const receiveFabricateTotal = input.receiveFabricate ? getPrice(PRICING.rugReceiveFabricate) : 0;
  const receiveInspectTotal   = input.receiveInspect   ? getPrice(PRICING.rugReceiveInspect)   : 0;
  const wrapShipTotal         = input.wrapShip         ? getPrice(PRICING.rugWrapShip)         : 0;
  const deliveryTotal         = input.delivery         ? getPrice(PRICING.rugDelivery)         : 0;

  const subtotal = round2(
    finishingTotal + miterTotal + handSewingTotal +
    receiveFabricateTotal + receiveInspectTotal +
    wrapShipTotal + nonSkidPadTotal + deliveryTotal
  );

  return {
    sqFt, sqYd, linearFt, tierKey, isOversize,
    finishingTotal, miterTotal, handSewingTotal,
    receiveFabricateTotal, receiveInspectTotal,
    wrapShipTotal, nonSkidPadTotal, deliveryTotal,
    subtotal,
  };
}

// ─── SEAMING ────────────────────────────────────────────────

export function calcSeaming(linearFt: number): number {
  return round2(safeNum(linearFt) * PRICING.seaming);
}

// ─── EXTRA SERVICES ─────────────────────────────────────────

export interface ExtrasCalcInput {
  furnitureRooms: number;
  beds: number;
  tacklessBoxes: number;
  tacklessPricePerBox: number;
}

export interface ExtrasCalcResult {
  furnitureTotal: number;
  bedTotal: number;
  tacklessTotal: number;
  subtotal: number;
}

export function calcExtras(input: ExtrasCalcInput): ExtrasCalcResult {
  const furnitureTotal = round2(safeNum(input.furnitureRooms) * PRICING.furnitureHandling);
  const bedTotal       = round2(safeNum(input.beds) * PRICING.bedDisassembly);
  const tacklessTotal  = round2(safeNum(input.tacklessBoxes) * safeNum(input.tacklessPricePerBox));
  const subtotal       = round2(furnitureTotal + bedTotal + tacklessTotal);
  return { furnitureTotal, bedTotal, tacklessTotal, subtotal };
}

// ─── TRAVEL ─────────────────────────────────────────────────

export interface TravelCalcInput {
  miles: number;
  roundTrip: boolean;
  manualOverride: number; // 0 means no override
}

export function calcTravel(input: TravelCalcInput): number {
  if (safeNum(input.manualOverride) > 0) {
    return round2(safeNum(input.manualOverride));
  }
  const miles = safeNum(input.miles);
  const totalMiles = input.roundTrip ? miles * 2 : miles;
  return round2(PRICING.tripBase + totalMiles * PRICING.tripPerMile);
}
