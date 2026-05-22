"use client";
import { useRef } from "react";
import { CustomerData } from "./CustomerInfo";
import { RoomCalcResult, StairCalcResult, RugCalcResult, ExtrasCalcResult, TravelCalcInput } from "../lib/calculations";
import { RugCalcInput } from "../lib/calculations";
import { fmt, fmtNum, formatDate } from "../lib/format";
import { safeNum } from "../lib/calculations";
import { PRICING } from "../lib/pricing";

const TERMS = [
  "This quote is valid for 90 days.",
  "Pricing is based on the measurements and project details provided.",
  "Final pricing may change if field measurements, carpet pattern repeat, site conditions, furniture quantity, stairs, seams, or project scope changes.",
  "Customer is responsible for supplying specialty materials unless listed in this quote.",
  "Payment is due according to the agreed invoice terms.",
  "Additional work not listed in this quote may require a separate charge.",
];

interface RoomRow {
  id: number; name: string; width: string; length: string; qty: string;
  installType: "none" | "wallToWall" | "doubleStick";
  ripUp: boolean; pad: boolean; receiveDelivery: boolean;
}

interface CustomLineItem { id: number; description: string; qty: string; unitPrice: string; }

interface Props {
  customer: CustomerData;
  rooms: RoomRow[];
  roomCalcs: RoomCalcResult[];
  stairCalc: StairCalcResult;
  rugCalc: RugCalcResult;
  rug: RugCalcInput;
  seamTotal: number;
  seamingLF: number;
  extraCalc: ExtrasCalcResult;
  customItems: CustomLineItem[];
  travelTotal: number;
  travel: TravelCalcInput;
  grandTotal: number;
}

interface LineItem { description: string; qty: string; unit: string; unitPrice: string; total: string; }

function buildLineItems(props: Props): LineItem[] {
  const items: LineItem[] = [];
  const add = (description: string, qty: string, unit: string, unitPrice: string, total: number) => {
    if (total <= 0) return;
    items.push({ description, qty, unit, unitPrice, total: fmt(total) });
  };

  // Rooms
  props.rooms.forEach((room, i) => {
    const c = props.roomCalcs[i];
    const name = room.name || `Room ${i + 1}`;
    if (c.ripUpTotal > 0)           add(`${name} — Rip Up & Disposal of Old Carpet`, fmt(c.sqYd), "SY", fmt(PRICING.ripUp), c.ripUpTotal);
    if (c.installTotal > 0) {
      const label = room.installType === "doubleStick" ? "Double Stick Installation" : "Wall-to-Wall Installation";
      const rate  = room.installType === "doubleStick" ? PRICING.doubleStick : PRICING.installation;
      add(`${name} — ${label}`, fmt(c.sqYd), "SY", fmt(rate), c.installTotal);
    }
    if (c.padTotal > 0)             add(`${name} — 40 oz Pad`, fmt(c.sqYd), "SY", fmt(PRICING.pad40oz), c.padTotal);
    if (c.receiveDeliveryTotal > 0) add(`${name} — Receive & Deliver Goods`, "1", "flat", fmt(PRICING.receiveDelivery), c.receiveDeliveryTotal);
  });

  // Stairs
  const sc = props.stairCalc;
  if (sc.regularTotal > 0)         add("Regular Steps", String(safeNum(props.rooms[0]?.qty) || 1), "ea", fmt(PRICING.regularStep), sc.regularTotal); // uses step count
  if (sc.landingTotal > 0)         add("Landings", "—", "ea", fmt(PRICING.landing), sc.landingTotal);
  if (sc.pieTotal > 0)             add("Pie / Curved Steps", "—", "ea", fmt(PRICING.pieStep), sc.pieTotal);
  if (sc.padTotal > 0)             add("Stair Pad (40 oz)", "—", "SY", fmt(PRICING.pad40oz), sc.padTotal);
  if (sc.receiveDeliveryTotal > 0) add("Stair — Receive & Deliver Goods", "1", "flat", fmt(PRICING.receiveDelivery), sc.receiveDeliveryTotal);

  // Rug
  const rc = props.rugCalc;
  if (rc.finishingTotal > 0)        add(`Rug — Edge Finishing (${props.rug.finishingStyle})`, fmt(rc.linearFt), "LF", "—", rc.finishingTotal);
  if (rc.miterTotal > 0)            add("Rug — Hand-Sewn Miters", String(props.rug.miterCount), "ea", fmt(PRICING.handSewnMiter), rc.miterTotal);
  if (rc.handSewingTotal > 0)       add("Rug — Hand Sewing", fmt(props.rug.handSewingLF), "LF", fmt(PRICING.handSewing), rc.handSewingTotal);
  if (rc.receiveFabricateTotal > 0) add(`Rug — Receive & Fabricate (${rc.tierKey ?? "custom"})`, "1", "ea", "—", rc.receiveFabricateTotal);
  if (rc.receiveInspectTotal > 0)   add(`Rug — Receive & Inspect (${rc.tierKey ?? "custom"})`, "1", "ea", "—", rc.receiveInspectTotal);
  if (rc.wrapShipTotal > 0)         add(`Rug — Wrap & Ship (${rc.tierKey ?? "custom"})`, "1", "ea", "—", rc.wrapShipTotal);
  if (rc.nonSkidPadTotal > 0)       add("Rug — Non-Skid Pad", fmt(rc.sqYd), "SY", fmt(PRICING.nonSkidPad), rc.nonSkidPadTotal);
  if (rc.deliveryTotal > 0)         add(`Rug — Delivery (${rc.tierKey ?? "custom"})`, "1", "ea", "—", rc.deliveryTotal);

  // Seaming
  if (props.seamTotal > 0)          add("Seaming", fmt(props.seamingLF), "LF", fmt(PRICING.seaming), props.seamTotal);

  // Extras
  const ex = props.extraCalc;
  if (ex.furnitureTotal > 0) add("Furniture Handling", String(Math.round(ex.furnitureTotal / PRICING.furnitureHandling)), "rooms", fmt(PRICING.furnitureHandling), ex.furnitureTotal);
  if (ex.bedTotal > 0)       add("Bed Disassembly", String(Math.round(ex.bedTotal / PRICING.bedDisassembly)), "beds", fmt(PRICING.bedDisassembly), ex.bedTotal);
  if (ex.tacklessTotal > 0)  add("Tackless Strip", "—", "boxes", "—", ex.tacklessTotal);

  // Custom items
  props.customItems.forEach(item => {
    const total = safeNum(item.qty) * safeNum(item.unitPrice);
    if (total > 0) add(item.description || "Custom Service", item.qty, "ea", fmtNum(safeNum(item.unitPrice)), total);
  });

  // Travel
  if (props.travelTotal > 0) add("Travel", "1", "trip", "—", props.travelTotal);

  return items;
}

export default function QuoteSummary(props: Props) {
  const printRef = useRef<HTMLDivElement>(null);
  const items    = buildLineItems(props);
  const today    = formatDate(new Date());

  // ── PRINT ──────────────────────────────────────────────────
  const handlePrint = () => {
    const win = window.open("", "_blank");
    if (!win || !printRef.current) return;
    win.document.write(`
      <html><head><title>Quote ${props.customer.quoteNumber}</title>
      <style>
        body { font-family: Georgia, serif; margin: 40px; color: #1a1a2e; }
        h1 { color: #1a1a2e; } .gold { color: #b8960c; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th { background: #1a1a2e; color: #f5c842; padding: 8px; text-align: left; font-size: 12px; }
        td { padding: 7px 8px; font-size: 12px; border-bottom: 1px solid #eee; }
        tr:nth-child(even) td { background: #f8f8fc; }
        .total-row td { font-weight: bold; background: #1a1a2e; color: white; }
        .terms { margin-top: 24px; font-size: 11px; color: #555; }
        .terms h4 { color: #1a1a2e; margin-bottom: 4px; }
        .terms li { margin-bottom: 3px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; }
        .meta { font-size: 12px; color: #555; margin-top: 8px; }
        @media print { body { margin: 20px; } }
      </style></head><body>
      ${printRef.current.innerHTML}
      </body></html>
    `);
    win.document.close();
    win.print();
  };

  // ── COPY ──────────────────────────────────────────────────
  const handleCopy = () => {
    const lines = [
      `ELEGANTE CARPET LLC`,
      `1166 Franklin Gateway, Unit 5, Marietta, GA 30067`,
      `Phone: 516-851-4482 | Email: elegantecarpetinc@gmail.com`,
      ``,
      `QUOTE NO: ${props.customer.quoteNumber}   DATE: ${today}`,
      props.customer.name    ? `Customer: ${props.customer.name}` : "",
      props.customer.projectName ? `Project: ${props.customer.projectName}` : "",
      props.customer.address ? `Address: ${props.customer.address}` : "",
      ``,
      `DESCRIPTION                          QTY     UNIT    UNIT PRICE    TOTAL`,
      `─────────────────────────────────────────────────────────────────────────`,
      ...items.map(it => `${it.description.padEnd(36)} ${it.qty.padStart(6)}  ${it.unit.padEnd(6)}  ${it.unitPrice.padStart(10)}  ${it.total.padStart(10)}`),
      `─────────────────────────────────────────────────────────────────────────`,
      `GRAND TOTAL: ${fmt(props.grandTotal)}`,
      ``,
      `Standard Quote Terms:`,
      ...TERMS.map((t, i) => `${i + 1}. ${t}`),
    ].filter(Boolean).join("\n");

    navigator.clipboard.writeText(lines).then(() => alert("Quote copied to clipboard!"));
  };

  // ── PDF (opens print dialog styled for PDF save) ──────────
  const handleDownloadPDF = () => handlePrint();

  if (items.length === 0 && props.grandTotal === 0) {
    return (
      <div className="lg:sticky lg:top-6">
        <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6 text-center text-slate-400 text-sm">
          <div className="text-4xl mb-3">📋</div>
          Your quote summary will appear here as you fill in the form.
        </div>
      </div>
    );
  }

  return (
    <div className="lg:sticky lg:top-6">
      <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
        {/* HEADER */}
        <div className="bg-navy px-5 py-4">
          <p className="text-gold font-bold text-xs uppercase tracking-widest mb-0.5">Quote Summary</p>
          <p className="text-white text-xs">{today} · {props.customer.quoteNumber || "—"}</p>
        </div>

        {/* CUSTOMER */}
        {(props.customer.name || props.customer.projectName) && (
          <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 text-sm">
            {props.customer.name && <p className="font-semibold text-slate-800">{props.customer.name}</p>}
            {props.customer.projectName && <p className="text-slate-500 text-xs">{props.customer.projectName}</p>}
            {props.customer.address && <p className="text-slate-400 text-xs">{props.customer.address}</p>}
          </div>
        )}

        {/* LINE ITEMS TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-navy/5">
                <th className="text-left px-4 py-2 text-slate-500 font-semibold">Description</th>
                <th className="text-right px-2 py-2 text-slate-500 font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                  <td className="px-4 py-2 text-slate-700">
                    {item.description}
                    <span className="text-slate-400 ml-1">({item.qty} {item.unit}{item.unitPrice !== "—" ? ` × ${item.unitPrice}` : ""})</span>
                  </td>
                  <td className="px-2 py-2 text-right font-mono font-semibold text-navy">{item.total}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-navy">
                <td className="px-4 py-3 text-white font-bold text-sm">GRAND TOTAL</td>
                <td className="px-2 py-3 text-right text-gold font-bold text-sm font-mono">{fmt(props.grandTotal)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* TERMS */}
        <div className="px-5 py-4 border-t border-slate-100">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Standard Quote Terms</p>
          <ol className="list-decimal list-inside text-xs text-slate-400 space-y-1">
            {TERMS.map((t, i) => <li key={i}>{t}</li>)}
          </ol>
        </div>

        {/* ACTION BUTTONS */}
        <div className="px-5 py-4 border-t border-slate-100 flex flex-wrap gap-2">
          <button onClick={handlePrint}
            className="flex-1 bg-navy text-white text-xs font-semibold py-2 rounded-lg hover:bg-navy-dark transition-colors">
            🖨 Print Quote
          </button>
          <button onClick={handleDownloadPDF}
            className="flex-1 bg-gold text-navy text-xs font-semibold py-2 rounded-lg hover:opacity-90 transition-colors">
            ⬇ Download PDF
          </button>
          <button onClick={handleCopy}
            className="w-full border border-slate-200 text-slate-600 text-xs font-semibold py-2 rounded-lg hover:bg-slate-50 transition-colors">
            📋 Copy Quote
          </button>
        </div>
      </div>

      {/* HIDDEN PRINT TEMPLATE */}
      <div style={{ display: "none" }}>
        <div ref={printRef}>
          <div className="header">
            <div>
              <h1 style={{ margin: 0 }}>ELEGANTE CARPET LLC</h1>
              <p style={{ margin: "4px 0", fontSize: 13, color: "#555" }}>
                1166 Franklin Gateway, Unit 5, Marietta, GA 30067<br/>
                Phone: 516-851-4482 | Email: elegantecarpetinc@gmail.com
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ margin: 0, fontWeight: "bold", fontSize: 14 }}>QUOTE</p>
              <p style={{ margin: "4px 0", fontSize: 12, color: "#555" }}>{props.customer.quoteNumber}</p>
              <p style={{ margin: 0, fontSize: 12, color: "#555" }}>{today}</p>
            </div>
          </div>

          {props.customer.name && (
            <div className="meta" style={{ marginTop: 16, fontSize: 12 }}>
              <strong>Customer:</strong> {props.customer.name}<br/>
              {props.customer.projectName && <><strong>Project:</strong> {props.customer.projectName}<br/></>}
              {props.customer.address && <><strong>Address:</strong> {props.customer.address}<br/></>}
              {props.customer.email && <><strong>Email:</strong> {props.customer.email}<br/></>}
              {props.customer.phone && <><strong>Phone:</strong> {props.customer.phone}<br/></>}
              {props.customer.notes && <><strong>Notes:</strong> {props.customer.notes}<br/></>}
            </div>
          )}

          <table>
            <thead>
              <tr>
                <th style={{ width: "50%" }}>Description</th>
                <th>Qty</th>
                <th>Unit</th>
                <th>Unit Price</th>
                <th style={{ textAlign: "right" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i}>
                  <td>{item.description}</td>
                  <td>{item.qty}</td>
                  <td>{item.unit}</td>
                  <td>{item.unitPrice}</td>
                  <td style={{ textAlign: "right", fontFamily: "monospace" }}>{item.total}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="total-row">
                <td colSpan={4}>GRAND TOTAL</td>
                <td style={{ textAlign: "right", fontFamily: "monospace" }}>{fmt(props.grandTotal)}</td>
              </tr>
            </tfoot>
          </table>

          <div className="terms">
            <h4>Standard Quote Terms</h4>
            <ol>{TERMS.map((t, i) => <li key={i}>{t}</li>)}</ol>
          </div>
        </div>
      </div>
    </div>
  );
}
