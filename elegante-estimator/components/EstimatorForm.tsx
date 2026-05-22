"use client";
import { useState, useCallback } from "react";
import SectionCard from "./SectionCard";
import CustomerInfo, { CustomerData } from "./CustomerInfo";
import QuoteSummary from "./QuoteSummary";
import {
  calcRoom, calcStairs, calcRug, calcSeaming, calcExtras, calcTravel,
  safeNum, RoomCalcInput, StairCalcInput, RugCalcInput, ExtrasCalcInput, TravelCalcInput,
  InstallType,
} from "../lib/calculations";
import { PRICING } from "../lib/pricing";
import { generateQuoteNumber, fmt } from "../lib/format";
import type { FinishingStyle } from "../lib/calculations";

// ─── Small reusable input primitives ──────────────────────────────────────────

function NumInput({ label, value, onChange, suffix, min = 0, step = 1 }: {
  label: string; value: number | string; onChange: (v: string) => void;
  suffix?: string; min?: number; step?: number;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
      <div className="flex items-center gap-1">
        <input
          type="number" min={min} step={step}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy"
        />
        {suffix && <span className="text-xs text-slate-400 whitespace-nowrap">{suffix}</span>}
      </div>
    </div>
  );
}

function CheckBox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <input
        type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}
        className="w-4 h-4 accent-navy rounded"
      />
      <span className="text-sm text-slate-700">{label}</span>
    </label>
  );
}

function CalcBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-xs">
      <span className="text-slate-400">{label}: </span>
      <span className="font-bold text-navy">{value}</span>
    </div>
  );
}

function LineTotal({ label, value }: { label: string; value: number }) {
  if (!value) return null;
  return (
    <div className="flex justify-between text-sm border-t border-slate-100 pt-2 mt-2">
      <span className="text-slate-600">{label}</span>
      <span className="font-semibold text-navy">{fmt(value)}</span>
    </div>
  );
}

// ─── ROOM ROW ─────────────────────────────────────────────────────────────────

// ─── CARPET INSTALLATION ROW ──────────────────────────────────────────────────
// Simplified: just width + length, auto-calculates SY, checkbox services

interface CarpetRow {
  id: number;
  width: string;
  length: string;
  installType: InstallType; // "none" | "wallToWall" | "doubleStick"
  ripUp: boolean;
  pad: boolean;
}

function CarpetRowEditor({ row, onChange, onRemove, index }: {
  row: CarpetRow;
  onChange: (r: CarpetRow) => void;
  onRemove: () => void;
  index: number;
}) {
  const set = (key: keyof CarpetRow) => (val: string | boolean) => onChange({ ...row, [key]: val });

  const handleInstallType = (type: InstallType) => {
    onChange({ ...row, installType: row.installType === type ? "none" : type });
  };

  const calc = calcRoom({
    width: safeNum(row.width), length: safeNum(row.length), qty: 1,
    installType: row.installType, ripUp: row.ripUp, pad: row.pad, receiveDelivery: false,
  });

  return (
    <div className="border border-slate-200 rounded-xl p-4 mb-3 bg-slate-50">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-bold text-navy">Area {index + 1}</span>
        <button onClick={onRemove} className="text-red-400 hover:text-red-600 text-xs font-bold">✕ Remove</button>
      </div>

      {/* Measurements */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <NumInput label="Carpet Width (ft)"  value={row.width}  onChange={v => set("width")(v)}  step={0.5} />
        <NumInput label="Carpet Length (ft)" value={row.length} onChange={v => set("length")(v)} step={0.5} />
      </div>

      {/* Auto-calculated SY */}
      {calc.sqYd > 0 && (
        <div className="flex gap-3 mb-4">
          <CalcBadge label="Sq Ft" value={`${calc.sqFt}`} />
          <CalcBadge label="Sq Yd" value={`${calc.sqYd}`} />
        </div>
      )}

      {/* Services */}
      <div className="space-y-1 mb-3">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Select Services</p>

        {/* Rip Up */}
        <label className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white cursor-pointer border border-transparent hover:border-slate-200 transition-all">
          <input type="checkbox" checked={row.ripUp} onChange={e => set("ripUp")(e.target.checked)}
            className="w-4 h-4 accent-navy rounded" />
          <span className="flex-1 text-sm text-slate-700">Rip Up &amp; Disposal of Old Carpet</span>
          <span className="text-xs font-mono font-semibold text-navy">
            {row.ripUp && calc.sqYd > 0 ? fmt(calc.ripUpTotal) : `${PRICING.ripUp}/SY`}
          </span>
        </label>

        {/* Double Stick */}
        <label className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white cursor-pointer border border-transparent hover:border-slate-200 transition-all">
          <input type="checkbox"
            checked={row.installType === "doubleStick"}
            onChange={() => handleInstallType("doubleStick")}
            className="w-4 h-4 accent-navy rounded" />
          <span className="flex-1 text-sm text-slate-700">Double Stick Installation</span>
          <span className="text-xs font-mono font-semibold text-navy">
            {row.installType === "doubleStick" && calc.sqYd > 0 ? fmt(calc.installTotal) : `${PRICING.doubleStick}/SY`}
          </span>
        </label>

        {/* 40 oz Pad */}
        <label className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white cursor-pointer border border-transparent hover:border-slate-200 transition-all">
          <input type="checkbox" checked={row.pad} onChange={e => set("pad")(e.target.checked)}
            className="w-4 h-4 accent-navy rounded" />
          <span className="flex-1 text-sm text-slate-700">40 oz Pad</span>
          <span className="text-xs font-mono font-semibold text-navy">
            {row.pad && calc.sqYd > 0 ? fmt(calc.padTotal) : `${PRICING.pad40oz}/SY`}
          </span>
        </label>
      </div>

      {/* Row total */}
      {calc.subtotal > 0 && (
        <div className="flex justify-between items-center pt-2 border-t border-slate-200">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Area Total</span>
          <span className="text-navy font-bold text-sm">{fmt(calc.subtotal)}</span>
        </div>
      )}
    </div>
  );
}

// ─── CUSTOM LINE ITEM ─────────────────────────────────────────────────────────

interface CustomLineItem {
  id: number;
  description: string;
  qty: string;
  unitPrice: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN FORM COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function EstimatorForm() {
  // ── Customer info ──────────────────────────────────────────
  const [customer, setCustomer] = useState<CustomerData>({
    name: "", projectName: "", address: "", email: "", phone: "", notes: "",
    quoteNumber: generateQuoteNumber(),
  });

  // ── Carpet Installation areas ──────────────────────────────
  const [carpets, setCarpets] = useState<CarpetRow[]>([]);
  const addCarpet = () => setCarpets(prev => [...prev, {
    id: Date.now(), width: "", length: "",
    installType: "none" as InstallType, ripUp: false, pad: false,
  }]);
  const removeCarpet = (id: number) => setCarpets(prev => prev.filter(r => r.id !== id));
  const updateCarpet = (id: number, r: CarpetRow) => setCarpets(prev => prev.map(x => x.id === id ? r : x));

  // ── Stairs ─────────────────────────────────────────────────
  const [stairs, setStairs] = useState<StairCalcInput>({
    regularSteps: 0, landings: 0, pieSteps: 0, receiveDelivery: false, pad: false, padSqYd: 0,
  });
  const setStair = (key: keyof StairCalcInput) => (val: string | boolean) =>
    setStairs(prev => ({ ...prev, [key]: val }));

  // ── Rug ────────────────────────────────────────────────────
  const [rug, setRug] = useState<RugCalcInput>({
    width: 0, length: 0, finishingStyle: "serging",
    miters: false, miterCount: 0,
    handSewing: false, handSewingLF: 0,
    receiveFabricate: false, receiveInspect: false, wrapShip: false,
    nonSkidPad: false, delivery: false, customOversizePrice: 0,
  });
  const setRugVal = (key: keyof RugCalcInput) => (val: string | boolean | number) =>
    setRug(prev => ({ ...prev, [key]: val }));

  // ── Seaming ────────────────────────────────────────────────
  const [seamingLF, setSeamingLF] = useState("");

  // ── Extras ─────────────────────────────────────────────────
  const [extras, setExtras] = useState<ExtrasCalcInput>({
    furnitureRooms: 0, beds: 0, tacklessBoxes: 0, tacklessPricePerBox: PRICING.tacklessDefault,
  });
  const setExtra = (key: keyof ExtrasCalcInput) => (val: string) =>
    setExtras(prev => ({ ...prev, [key]: safeNum(val) }));

  // ── Custom line items ──────────────────────────────────────
  const [customItems, setCustomItems] = useState<CustomLineItem[]>([]);
  const addCustomItem = () => setCustomItems(prev => [...prev, { id: Date.now(), description: "", qty: "1", unitPrice: "" }]);
  const removeCustomItem = (id: number) => setCustomItems(prev => prev.filter(x => x.id !== id));
  const updateCustomItem = (id: number, key: keyof CustomLineItem, val: string) =>
    setCustomItems(prev => prev.map(x => x.id === id ? { ...x, [key]: val } : x));

  // ── Travel ─────────────────────────────────────────────────
  const [travel, setTravel] = useState<TravelCalcInput>({ miles: 0, roundTrip: false, manualOverride: 0 });
  const setTravelVal = (key: keyof TravelCalcInput) => (val: string | boolean) =>
    setTravel(prev => ({ ...prev, [key]: val }));

  // ── Computed values ────────────────────────────────────────
  const carpetCalcs = carpets.map(r => calcRoom({
    width: safeNum(r.width), length: safeNum(r.length), qty: 1,
    installType: r.installType, ripUp: r.ripUp, pad: r.pad, receiveDelivery: false,
  }));
  const stairCalc  = calcStairs(stairs);
  const rugCalc    = calcRug(rug);
  const seamTotal  = calcSeaming(safeNum(seamingLF));
  const extraCalc  = calcExtras(extras);
  const travelTotal = calcTravel(travel);
  const customTotal = customItems.reduce((sum, item) => sum + safeNum(item.qty) * safeNum(item.unitPrice), 0);

  const carpetTotal = carpetCalcs.reduce((sum, c) => sum + c.subtotal, 0);
  const grandTotal = carpetTotal + stairCalc.subtotal + rugCalc.subtotal + seamTotal + extraCalc.subtotal + travelTotal + customTotal;

  // ── Reset ──────────────────────────────────────────────────
  const resetForm = useCallback(() => {
    if (!confirm("Reset everything? This cannot be undone.")) return;
    setCustomer({ name: "", projectName: "", address: "", email: "", phone: "", notes: "", quoteNumber: generateQuoteNumber() });
    setCarpets([]);
    setStairs({ regularSteps: 0, landings: 0, pieSteps: 0, receiveDelivery: false, pad: false, padSqYd: 0 });
    setRug({ width: 0, length: 0, finishingStyle: "serging", miters: false, miterCount: 0, handSewing: false, handSewingLF: 0, receiveFabricate: false, receiveInspect: false, wrapShip: false, nonSkidPad: false, delivery: false, customOversizePrice: 0 });
    setSeamingLF("");
    setExtras({ furnitureRooms: 0, beds: 0, tacklessBoxes: 0, tacklessPricePerBox: PRICING.tacklessDefault });
    setCustomItems([]);
    setTravel({ miles: 0, roundTrip: false, manualOverride: 0 });
  }, []);

  const stairNumInput = (label: string, key: keyof StairCalcInput, suffix?: string) => (
    <NumInput label={label} value={stairs[key] as number}
      onChange={v => setStairs(prev => ({ ...prev, [key]: safeNum(v) }))} suffix={suffix} />
  );

  return (
    <div className="lg:flex lg:gap-6">
      {/* ─── LEFT COLUMN: FORM ─── */}
      <div className="flex-1 min-w-0">

        {/* CUSTOMER INFO */}
        <SectionCard title="Customer Information" icon="👤">
          <CustomerInfo data={customer} onChange={setCustomer} />
        </SectionCard>

        {/* CARPET INSTALLATION */}
        <SectionCard title="Carpet Installation" icon="🏠">
          {carpets.map((row, i) => (
            <CarpetRowEditor
              key={row.id}
              row={row}
              index={i}
              onChange={r => updateCarpet(row.id, r)}
              onRemove={() => removeCarpet(row.id)}
            />
          ))}
          <button onClick={addCarpet}
            className="w-full border-2 border-dashed border-navy/30 rounded-xl py-2 text-navy text-sm font-semibold hover:border-navy/60 hover:bg-navy/5 transition-colors">
            + Add Area
          </button>
          {carpetTotal > 0 && (
            <div className="mt-3 text-right text-sm font-bold text-navy">
              Section Total: {fmt(carpetTotal)}
            </div>
          )}
        </SectionCard>

        {/* STAIRS */}
        <SectionCard title="Stair Installation" icon="🪜" defaultOpen={false}>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {stairNumInput("Regular Steps (35 ea)", "regularSteps")}
            {stairNumInput("Landings (55 ea)", "landings")}
            {stairNumInput("Pie / Curved Steps (45 ea)", "pieSteps")}
            {stairNumInput("Pad Sq Yards (for stairs)", "padSqYd", "SY")}
          </div>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <CheckBox label={`Receive & Deliver Goods (${PRICING.receiveDelivery} flat)`}
              checked={stairs.receiveDelivery} onChange={v => setStairs(p => ({ ...p, receiveDelivery: v }))} />
            <CheckBox label={`40 oz Pad (${PRICING.pad40oz}/SY)`}
              checked={stairs.pad} onChange={v => setStairs(p => ({ ...p, pad: v }))} />
          </div>
          <div className="flex flex-wrap gap-2">
            {stairCalc.regularTotal > 0 && <CalcBadge label="Regular Steps" value={fmt(stairCalc.regularTotal)} />}
            {stairCalc.landingTotal > 0 && <CalcBadge label="Landings"      value={fmt(stairCalc.landingTotal)} />}
            {stairCalc.pieTotal     > 0 && <CalcBadge label="Pie Steps"     value={fmt(stairCalc.pieTotal)} />}
            {stairCalc.padTotal     > 0 && <CalcBadge label="Pad"           value={fmt(stairCalc.padTotal)} />}
            {stairCalc.receiveDeliveryTotal > 0 && <CalcBadge label="Receive/Deliver" value={fmt(stairCalc.receiveDeliveryTotal)} />}
            {stairCalc.subtotal > 0 && <CalcBadge label="Section Total" value={fmt(stairCalc.subtotal)} />}
          </div>
        </SectionCard>

        {/* CUSTOM RUG FABRICATION */}
        <SectionCard title="Custom Rug Fabrication" icon="🪡" defaultOpen={false}>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <NumInput label="Rug Width (ft)"  value={rug.width}  onChange={v => setRugVal("width")(safeNum(v))}  step={0.5} />
            <NumInput label="Rug Length (ft)" value={rug.length} onChange={v => setRugVal("length")(safeNum(v))} step={0.5} />
          </div>

          <div className="mb-4 flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Edge Finishing Style</label>
            <select
              value={rug.finishingStyle}
              onChange={e => setRugVal("finishingStyle")(e.target.value as FinishingStyle)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy"
            >
              <option value="serging">Serging — 6.75/LF</option>
              <option value="cottonBinding">Cotton Binding 1¼" — 5.50/LF</option>
              <option value="wideBinding">Wide Binding — 9.50/LF</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            <CheckBox label={`Hand-Sewn Miters (${PRICING.handSewnMiter} ea)`} checked={rug.miters} onChange={v => setRugVal("miters")(v)} />
            {rug.miters && (
              <NumInput label="Number of Miters" value={rug.miterCount} onChange={v => setRugVal("miterCount")(safeNum(v))} />
            )}
            <CheckBox label={`Hand Sewing (${PRICING.handSewing}/LF)`} checked={rug.handSewing} onChange={v => setRugVal("handSewing")(v)} />
            {rug.handSewing && (
              <NumInput label="Hand Sewing LF" value={rug.handSewingLF} onChange={v => setRugVal("handSewingLF")(safeNum(v))} suffix="LF" />
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            <CheckBox label="Receive & Fabricate" checked={rug.receiveFabricate} onChange={v => setRugVal("receiveFabricate")(v)} />
            <CheckBox label="Receive & Inspect"   checked={rug.receiveInspect}   onChange={v => setRugVal("receiveInspect")(v)} />
            <CheckBox label="Wrap & Ship"          checked={rug.wrapShip}         onChange={v => setRugVal("wrapShip")(v)} />
            <CheckBox label={`Non-Skid Pad (${PRICING.nonSkidPad}/SY)`} checked={rug.nonSkidPad} onChange={v => setRugVal("nonSkidPad")(v)} />
            <CheckBox label="Delivery / Spread"    checked={rug.delivery}         onChange={v => setRugVal("delivery")(v)} />
          </div>

          {/* Rug size info */}
          {(rug.width > 0 && rug.length > 0) && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-3 text-xs text-blue-800">
              {rugCalc.isOversize
                ? <><strong>⚠ Oversize rug</strong> — no standard size tier applies. Enter a custom price below.</>
                : <>Size tier: <strong>{rugCalc.tierKey}</strong> · Sq Ft: {rugCalc.sqFt} · Sq Yd: {rugCalc.sqYd} · Perimeter: {rugCalc.linearFt} LF</>
              }
            </div>
          )}

          {rugCalc.isOversize && (
            <div className="mb-3">
              <NumInput label="Custom Oversize Price (manual)" value={rug.customOversizePrice} onChange={v => setRugVal("customOversizePrice")(safeNum(v))} />
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {rugCalc.finishingTotal       > 0 && <CalcBadge label="Edge Finishing"     value={fmt(rugCalc.finishingTotal)} />}
            {rugCalc.miterTotal           > 0 && <CalcBadge label="Miters"             value={fmt(rugCalc.miterTotal)} />}
            {rugCalc.handSewingTotal      > 0 && <CalcBadge label="Hand Sewing"        value={fmt(rugCalc.handSewingTotal)} />}
            {rugCalc.receiveFabricateTotal> 0 && <CalcBadge label="Receive/Fabricate"  value={fmt(rugCalc.receiveFabricateTotal)} />}
            {rugCalc.receiveInspectTotal  > 0 && <CalcBadge label="Receive/Inspect"    value={fmt(rugCalc.receiveInspectTotal)} />}
            {rugCalc.wrapShipTotal        > 0 && <CalcBadge label="Wrap & Ship"        value={fmt(rugCalc.wrapShipTotal)} />}
            {rugCalc.nonSkidPadTotal      > 0 && <CalcBadge label="Non-Skid Pad"       value={fmt(rugCalc.nonSkidPadTotal)} />}
            {rugCalc.deliveryTotal        > 0 && <CalcBadge label="Delivery"           value={fmt(rugCalc.deliveryTotal)} />}
            {rugCalc.subtotal             > 0 && <CalcBadge label="Section Total"      value={fmt(rugCalc.subtotal)} />}
          </div>
        </SectionCard>

        {/* SEAMING */}
        <SectionCard title="Seaming" icon="✂️" defaultOpen={false}>
          <div className="grid grid-cols-2 gap-3">
            <NumInput label={`Seam Linear Feet (${PRICING.seaming}/LF)`} value={seamingLF} onChange={setSeamingLF} suffix="LF" />
            {seamTotal > 0 && <CalcBadge label="Seaming Total" value={fmt(seamTotal)} />}
          </div>
        </SectionCard>

        {/* EXTRA SERVICES */}
        <SectionCard title="Extra Services" icon="⚙️" defaultOpen={false}>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <NumInput label={`Furniture Rooms (${PRICING.furnitureHandling}/rm)`} value={extras.furnitureRooms} onChange={setExtra("furnitureRooms")} />
            <NumInput label={`Bed Disassembly (${PRICING.bedDisassembly}/bed)`}   value={extras.beds}          onChange={setExtra("beds")} />
            <NumInput label="Tackless / Tack Strip Boxes" value={extras.tacklessBoxes}        onChange={setExtra("tacklessBoxes")} />
            <NumInput label="Price Per Tackless Box"      value={extras.tacklessPricePerBox}  onChange={setExtra("tacklessPricePerBox")} />
          </div>

          {/* Custom line items */}
          <div className="border-t border-slate-100 pt-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Custom Line Items</p>
            {customItems.map(item => (
              <div key={item.id} className="flex gap-2 mb-2 items-center">
                <input
                  value={item.description} onChange={e => updateCustomItem(item.id, "description", e.target.value)}
                  placeholder="Description"
                  className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy"
                />
                <input
                  type="number" min="0" value={item.qty} onChange={e => updateCustomItem(item.id, "qty", e.target.value)}
                  placeholder="Qty" className="w-16 border border-slate-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy"
                />
                <input
                  type="number" min="0" value={item.unitPrice} onChange={e => updateCustomItem(item.id, "unitPrice", e.target.value)}
                  placeholder="Price" className="w-24 border border-slate-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy"
                />
                <button onClick={() => removeCustomItem(item.id)} className="text-red-400 hover:text-red-600 font-bold">✕</button>
              </div>
            ))}
            <button onClick={addCustomItem}
              className="mt-1 border-2 border-dashed border-navy/30 rounded-xl py-2 px-4 text-navy text-sm font-semibold hover:border-navy/60 hover:bg-navy/5 transition-colors">
              + Add Custom Item
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            {extraCalc.furnitureTotal > 0 && <CalcBadge label="Furniture" value={fmt(extraCalc.furnitureTotal)} />}
            {extraCalc.bedTotal       > 0 && <CalcBadge label="Beds"      value={fmt(extraCalc.bedTotal)} />}
            {extraCalc.tacklessTotal  > 0 && <CalcBadge label="Tackless"  value={fmt(extraCalc.tacklessTotal)} />}
            {customTotal              > 0 && <CalcBadge label="Custom"    value={fmt(customTotal)} />}
            {extraCalc.subtotal + customTotal > 0 && <CalcBadge label="Section Total" value={fmt(extraCalc.subtotal + customTotal)} />}
          </div>
        </SectionCard>

        {/* TRAVEL */}
        <SectionCard title="Travel" icon="🚗" defaultOpen={false}>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <NumInput label="Miles (one way)"      value={travel.miles}          onChange={v => setTravelVal("miles")(v)} />
            <NumInput label="Manual Override Total" value={travel.manualOverride} onChange={v => setTravelVal("manualOverride")(v)} />
          </div>
          <div className="mb-3">
            <CheckBox label="Round Trip" checked={travel.roundTrip} onChange={v => setTravelVal("roundTrip")(v)} />
          </div>
          <p className="text-xs text-slate-400">
            Formula: 139 base + (miles{travel.roundTrip ? " × 2" : ""} × 1.45)
            {safeNum(travel.manualOverride) > 0 ? " — Manual override active" : ""}
          </p>
          {travelTotal > 0 && <div className="mt-2"><CalcBadge label="Travel Total" value={fmt(travelTotal)} /></div>}
        </SectionCard>

        {/* RESET BUTTON */}
        <div className="text-right mt-2 mb-8">
          <button onClick={resetForm}
            className="text-sm text-slate-400 hover:text-red-500 underline transition-colors">
            Reset Form
          </button>
        </div>
      </div>

      {/* ─── RIGHT COLUMN: QUOTE SUMMARY (sticky on desktop) ─── */}
      <div className="lg:w-96 lg:flex-shrink-0">
        <QuoteSummary
          customer={customer}
          carpets={carpets}
          carpetCalcs={carpetCalcs}
          stairCalc={stairCalc}
          rugCalc={rugCalc}
          rug={rug}
          seamTotal={seamTotal}
          seamingLF={safeNum(seamingLF)}
          extraCalc={extraCalc}
          customItems={customItems}
          travelTotal={travelTotal}
          travel={travel}
          grandTotal={grandTotal}
        />
      </div>
    </div>
  );
}
