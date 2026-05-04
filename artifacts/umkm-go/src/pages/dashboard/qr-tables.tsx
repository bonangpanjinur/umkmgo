import { useState, useRef, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useGetMyStore } from "@workspace/api-client-react";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import { Printer, Download, Plus, Minus, QrCode, Store, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const BASE_ORIGIN = window.location.origin;

function getTableUrl(slug: string, table: number) {
  return `${BASE_ORIGIN}/store/${slug}?table=${table}`;
}

function QRTableCard({
  slug,
  storeName,
  tableNumber,
  accent,
}: {
  slug: string;
  storeName: string;
  tableNumber: number;
  accent: string;
}) {
  const url = getTableUrl(slug, tableNumber);
  const canvasRef = useRef<HTMLDivElement>(null);

  const downloadQR = useCallback(() => {
    const canvas = canvasRef.current?.querySelector("canvas") as HTMLCanvasElement | null;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `qr-meja-${tableNumber}-${slug}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, [slug, tableNumber]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
      {/* Colored header */}
      <div
        className="px-4 py-2.5 flex items-center justify-between"
        style={{ backgroundColor: accent }}
      >
        <span className="text-white font-bold text-sm tracking-wide">MEJA {tableNumber}</span>
        <span className="text-white/80 text-xs truncate max-w-[120px]">{storeName}</span>
      </div>

      {/* QR code area */}
      <div className="flex flex-col items-center p-4 flex-1">
        <div ref={canvasRef} className="bg-white p-2 rounded-xl border border-gray-100 shadow-inner">
          <QRCodeCanvas
            value={url}
            size={140}
            level="M"
            includeMargin={false}
            fgColor="#1a1a1a"
            bgColor="#ffffff"
          />
        </div>
        <p className="mt-3 text-xs text-gray-400 text-center leading-tight px-2">
          Scan untuk melihat menu
        </p>
      </div>

      {/* Footer URL */}
      <div className="px-3 pb-3">
        <p className="text-[10px] text-gray-400 truncate text-center mb-3 font-mono">
          /store/{slug}?table={tableNumber}
        </p>
        <button
          onClick={downloadQR}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border-2 transition-all hover:opacity-90 active:scale-95 text-white"
          style={{ backgroundColor: accent, borderColor: accent }}
        >
          <Download className="w-3.5 h-3.5" />
          Unduh QR
        </button>
      </div>
    </div>
  );
}

export default function QRTablesPage() {
  const { data: store, isLoading } = useGetMyStore();
  const [tableCount, setTableCount] = useState(6);
  const printRef = useRef<HTMLDivElement>(null);

  const accent = "#4f46e5";

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;
    const originalBody = document.body.innerHTML;
    const printStyle = `
      <style>
        @page { size: A4; margin: 10mm; }
        body { margin: 0; font-family: sans-serif; }
        .print-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .print-card { border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; break-inside: avoid; }
        .print-header { background: ${accent}; padding: 8px 12px; display: flex; justify-content: space-between; align-items: center; }
        .print-header span { color: white; font-weight: bold; font-size: 13px; }
        .print-body { display: flex; flex-direction: column; align-items: center; padding: 12px; }
        .print-url { font-size: 9px; color: #9ca3af; font-family: monospace; text-align: center; margin-top: 6px; }
        .print-label { font-size: 11px; color: #6b7280; margin-top: 8px; text-align: center; }
        canvas { display: block; }
      </style>
    `;
    document.body.innerHTML = printStyle + printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalBody;
    window.location.reload();
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      </DashboardLayout>
    );
  }

  if (!store?.slug) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Store className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">Toko belum dibuat</p>
          <p className="text-gray-400 text-sm mt-1">Buat toko dulu sebelum membuat QR meja.</p>
        </div>
      </DashboardLayout>
    );
  }

  const tables = Array.from({ length: tableCount }, (_, i) => i + 1);
  const storeUrl = `${BASE_ORIGIN}/store/${store.slug}`;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <QrCode className="w-6 h-6 text-indigo-600" />
              QR Code Meja
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Cetak dan tempel di setiap meja agar pelanggan bisa scan langsung ke menu toko.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint} className="gap-2">
              <Printer className="w-4 h-4" />
              Cetak Semua
            </Button>
          </div>
        </div>

        {/* Store Info Card */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0">
            <Store className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 truncate">{store.name}</p>
            <a
              href={storeUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-indigo-600 hover:underline flex items-center gap-1 mt-0.5"
            >
              {storeUrl}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Table Count Control */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">Jumlah Meja</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setTableCount((v) => Math.max(1, v - 1))}
              disabled={tableCount <= 1}
              className="w-10 h-10 rounded-xl border-2 border-gray-200 flex items-center justify-center hover:border-indigo-300 hover:bg-indigo-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Minus className="w-4 h-4 text-gray-600" />
            </button>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={1}
                max={50}
                value={tableCount}
                onChange={(e) => {
                  const v = parseInt(e.target.value);
                  if (!isNaN(v) && v >= 1 && v <= 50) setTableCount(v);
                }}
                className="w-16 text-center text-xl font-bold text-gray-900 border-2 border-gray-200 rounded-xl py-1.5 focus:outline-none focus:border-indigo-400"
              />
              <span className="text-gray-500 text-sm ml-1">meja</span>
            </div>
            <button
              onClick={() => setTableCount((v) => Math.min(50, v + 1))}
              disabled={tableCount >= 50}
              className="w-10 h-10 rounded-xl border-2 border-gray-200 flex items-center justify-center hover:border-indigo-300 hover:bg-indigo-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4 text-gray-600" />
            </button>
            <div className="flex gap-2 ml-2">
              {[4, 8, 12, 20].map((n) => (
                <button
                  key={n}
                  onClick={() => setTableCount(n)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all ${
                    tableCount === n
                      ? "bg-indigo-600 border-indigo-600 text-white"
                      : "border-gray-200 text-gray-600 hover:border-indigo-300"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tip */}
        <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-sm text-amber-700 flex items-start gap-2">
          <span className="text-lg leading-none mt-0.5">💡</span>
          <div>
            <strong>Tips:</strong> Setiap QR code sudah menyimpan nomor meja. Ketika pelanggan scan, nomor meja akan muncul otomatis di halaman toko — memudahkan staf mengetahui pesanan dari meja mana.
          </div>
        </div>

        {/* QR Grid */}
        <div ref={printRef}>
          <div className="print-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {tables.map((n) => (
              <div key={n} className="print-card">
                <QRTableCard
                  slug={store.slug!}
                  storeName={store.name}
                  tableNumber={n}
                  accent={accent}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
