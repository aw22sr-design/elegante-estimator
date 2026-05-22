"use client";

export interface CustomerData {
  name: string;
  projectName: string;
  address: string;
  email: string;
  phone: string;
  notes: string;
  quoteNumber: string;
}

interface Props {
  data: CustomerData;
  onChange: (data: CustomerData) => void;
}

function Field({ label, value, onChange, type = "text", placeholder = "" }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent"
      />
    </div>
  );
}

export default function CustomerInfo({ data, onChange }: Props) {
  const set = (key: keyof CustomerData) => (val: string) => onChange({ ...data, [key]: val });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Field label="Customer Name"           value={data.name}        onChange={set("name")}        placeholder="John Smith" />
      <Field label="Project Name / Side Mark" value={data.projectName} onChange={set("projectName")} placeholder="Master Bedroom Reno" />
      <div className="sm:col-span-2">
        <Field label="Address" value={data.address} onChange={set("address")} placeholder="123 Main St, Atlanta, GA 30301" />
      </div>
      <Field label="Email" value={data.email} onChange={set("email")} type="email" placeholder="client@email.com" />
      <Field label="Phone" value={data.phone} onChange={set("phone")} type="tel"   placeholder="(555) 000-0000" />
      <Field label="Quote Number (auto-generated, editable)" value={data.quoteNumber} onChange={set("quoteNumber")} />
      <div className="sm:col-span-2 flex flex-col gap-1">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Notes</label>
        <textarea
          value={data.notes}
          onChange={e => onChange({ ...data, notes: e.target.value })}
          rows={3}
          placeholder="Special instructions, material details, etc."
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-navy resize-none"
        />
      </div>
    </div>
  );
}
