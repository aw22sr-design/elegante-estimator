import EstimatorForm from "../components/EstimatorForm";

export const metadata = {
  title: "Elegante Carpet LLC — Estimator",
  description: "Professional carpet installation quote estimator for Elegante Carpet LLC",
};

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* ── TOP HEADER ── */}
      <header className="bg-navy shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-white text-xl font-bold tracking-wide">
              ELEGANTE <span className="text-gold">CARPET</span> LLC
            </h1>
            <p className="text-slate-300 text-xs mt-0.5">Crafting Elegance One Thread at a Time</p>
          </div>
          <div className="text-right text-xs text-slate-300 leading-relaxed">
            <p>1166 Franklin Gateway, Unit 5 · Marietta, GA 30067</p>
            <p>516-851-4482 · elegantecarpetinc@gmail.com</p>
          </div>
        </div>
      </header>

      {/* ── PAGE TITLE ── */}
      <div className="bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <p className="text-navy font-semibold text-sm">📋 Carpet Installation Estimator</p>
        </div>
      </div>

      {/* ── FORM ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <EstimatorForm />
      </div>

      {/* ── FOOTER ── */}
      <footer className="bg-navy text-slate-400 text-xs text-center py-4 mt-8">
        © {new Date().getFullYear()} Elegante Carpet LLC · All quotes are estimates and subject to field verification.
      </footer>
    </main>
  );
}
