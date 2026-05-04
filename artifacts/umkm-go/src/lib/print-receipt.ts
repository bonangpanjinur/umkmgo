export interface ReceiptStore {
  name: string;
  slug?: string;
  whatsapp?: string | null;
  logoUrl?: string | null;
  description?: string | null;
  address?: string | null;
}

export interface ReceiptOrder {
  id: string;
  buyerName: string;
  buyerPhone: string;
  tableNumber?: string | null;
  source?: string | null;
  items: { name: string; quantity?: number; qty?: number; price?: number }[];
  totalAmount: number;
  notes?: string | null;
  paymentStatus?: string;
  createdAt: string;
}

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);
}

function sourceLabel(src: string | null | undefined) {
  if (src === "qr_table") return "QR Meja";
  if (src === "pos") return "Kasir";
  if (src === "storefront") return "Toko Online";
  if (src === "whatsapp") return "WhatsApp";
  return "Manual";
}

function paymentLabel(status: string | undefined) {
  if (status === "paid") return "LUNAS";
  if (status === "failed") return "GAGAL";
  if (status === "refunded") return "DIKEMBALIKAN";
  return "BELUM BAYAR";
}

export function printReceipt(store: ReceiptStore, order: ReceiptOrder) {
  const items = order.items ?? [];
  const subtotal = items.reduce((s, it) => {
    const qty = Number(it.quantity ?? it.qty ?? 1);
    const price = Number(it.price ?? 0);
    return s + qty * price;
  }, 0);
  const total = Number(order.totalAmount);
  const date = new Date(order.createdAt);
  const dateStr = date.toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  });
  const timeStr = date.toLocaleTimeString("id-ID", {
    hour: "2-digit", minute: "2-digit",
  });
  const orderId = order.id.slice(-8).toUpperCase();
  const isPaid = order.paymentStatus === "paid";

  const itemRows = items.map((it) => {
    const qty = Number(it.quantity ?? it.qty ?? 1);
    const price = Number(it.price ?? 0);
    const subtotalItem = qty * price;
    return `
      <tr>
        <td class="item-name">${it.name}</td>
        <td class="item-qty">${qty}×</td>
        <td class="item-price">${price > 0 ? formatIDR(price) : "—"}</td>
        <td class="item-total">${price > 0 ? formatIDR(subtotalItem) : "—"}</td>
      </tr>`;
  }).join("");

  const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>Struk — ${store.name}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Courier New', Courier, monospace;
    font-size: 12px;
    width: 80mm;
    max-width: 80mm;
    margin: 0 auto;
    padding: 4mm 4mm 8mm;
    color: #111;
    background: #fff;
  }
  .center { text-align: center; }
  .right  { text-align: right; }
  .bold   { font-weight: bold; }
  .large  { font-size: 15px; }
  .xlarge { font-size: 18px; }
  .muted  { color: #666; }
  .separator { border: none; border-top: 1px dashed #999; margin: 6px 0; }
  .separator-solid { border: none; border-top: 1px solid #111; margin: 6px 0; }

  /* Store header */
  .store-name { font-size: 17px; font-weight: bold; letter-spacing: 0.5px; }
  .store-sub  { font-size: 10px; color: #555; margin-top: 2px; }

  /* Meta rows */
  .meta-table { width: 100%; border-collapse: collapse; margin: 4px 0; }
  .meta-table td { padding: 1px 0; vertical-align: top; font-size: 11px; }
  .meta-table .label { color: #555; width: 40%; }
  .meta-table .value { font-weight: 600; }

  /* Table badge */
  .table-badge {
    display: inline-block;
    border: 2px solid #111;
    border-radius: 4px;
    padding: 4px 10px;
    font-size: 20px;
    font-weight: 900;
    letter-spacing: 1px;
    margin: 6px 0;
  }

  /* Items */
  .items-table { width: 100%; border-collapse: collapse; margin: 4px 0; }
  .items-table th {
    font-size: 10px; color: #555; font-weight: 600;
    text-align: left; padding: 2px 0; border-bottom: 1px dashed #aaa;
  }
  .items-table th.right { text-align: right; }
  .items-table td { padding: 3px 0; vertical-align: top; }
  .items-table .item-name  { width: 44%; font-size: 11px; }
  .items-table .item-qty   { width: 10%; text-align: center; font-size: 11px; color: #444; }
  .items-table .item-price { width: 23%; text-align: right; font-size: 10px; color: #555; }
  .items-table .item-total { width: 23%; text-align: right; font-size: 11px; font-weight: 600; }

  /* Totals */
  .totals-table { width: 100%; border-collapse: collapse; margin: 2px 0; }
  .totals-table td { padding: 2px 0; font-size: 11px; }
  .totals-table .label { color: #555; }
  .totals-table .value { text-align: right; font-weight: 600; }
  .grand-total { font-size: 15px; font-weight: 900; }

  /* Payment status */
  .payment-status {
    text-align: center;
    font-size: 13px;
    font-weight: 900;
    letter-spacing: 1px;
    border: 2px solid;
    border-radius: 4px;
    padding: 4px 0;
    margin: 6px 0;
  }
  .paid     { border-color: #166534; color: #166534; }
  .unpaid   { border-color: #92400e; color: #92400e; }

  /* Footer */
  .footer { font-size: 10px; color: #555; margin-top: 6px; }
  .footer .thank-you { font-size: 12px; font-weight: bold; color: #111; margin-bottom: 3px; }
  .footer .wa { font-size: 10px; }

  @media print {
    body { width: 80mm; padding: 0 2mm 6mm; }
    @page { margin: 4mm 0; size: 80mm auto; }
  }
</style>
</head>
<body>

<!-- Store Header -->
<div class="center" style="margin-bottom:8px;">
  <div class="store-name">${store.name}</div>
  ${store.description ? `<div class="store-sub">${store.description}</div>` : ""}
  ${store.address ? `<div class="store-sub">${store.address}</div>` : ""}
  ${store.whatsapp ? `<div class="store-sub">WA: ${store.whatsapp}</div>` : ""}
</div>

<hr class="separator-solid">

<!-- Order Meta -->
${order.tableNumber ? `
  <div class="center">
    <div class="muted" style="font-size:10px;margin-bottom:2px;">NOMOR MEJA</div>
    <div class="table-badge">${order.tableNumber}</div>
  </div>
` : ""}

<table class="meta-table">
  <tr><td class="label">No. Struk</td><td class="value">#${orderId}</td></tr>
  <tr><td class="label">Tanggal</td><td class="value">${dateStr}</td></tr>
  <tr><td class="label">Jam</td><td class="value">${timeStr}</td></tr>
  <tr><td class="label">Kasir/Sumber</td><td class="value">${sourceLabel(order.source)}</td></tr>
  <tr><td class="label">Nama</td><td class="value">${order.buyerName}</td></tr>
  <tr><td class="label">No. HP</td><td class="value">${order.buyerPhone}</td></tr>
</table>

${order.notes ? `
  <hr class="separator">
  <div style="font-size:10px;color:#444;">Catatan: <strong>${order.notes}</strong></div>
` : ""}

<hr class="separator">

<!-- Items -->
<table class="items-table">
  <thead>
    <tr>
      <th>Item</th>
      <th style="text-align:center;">Qty</th>
      <th style="text-align:right;">Harga</th>
      <th style="text-align:right;">Subtotal</th>
    </tr>
  </thead>
  <tbody>
    ${itemRows}
  </tbody>
</table>

<hr class="separator">

<!-- Totals -->
<table class="totals-table">
  ${subtotal !== total ? `<tr><td class="label">Subtotal</td><td class="value">${formatIDR(subtotal)}</td></tr>` : ""}
  <tr>
    <td class="label grand-total">TOTAL</td>
    <td class="value grand-total">${formatIDR(total)}</td>
  </tr>
</table>

<hr class="separator">

<!-- Payment status -->
<div class="payment-status ${isPaid ? "paid" : "unpaid"}">
  ${paymentLabel(order.paymentStatus)}
</div>

<!-- Footer -->
<div class="center footer">
  <div class="thank-you">Terima kasih!</div>
  <div>Atas kepercayaan Anda berbelanja</div>
  <div>di <strong>${store.name}</strong></div>
  ${store.whatsapp ? `<div class="wa" style="margin-top:4px;">Info &amp; order: wa.me/${store.whatsapp.replace(/\D/g, "")}</div>` : ""}
  <div style="margin-top:6px;font-size:9px;color:#aaa;">Powered by UMKM Go</div>
</div>

</body>
</html>`;

  const win = window.open("", "_blank", "width=400,height=650,scrollbars=yes");
  if (!win) {
    alert("Popup diblokir browser. Izinkan popup untuk mencetak struk.");
    return;
  }
  win.document.write(html);
  win.document.close();
  win.onload = () => {
    win.focus();
    win.print();
  };
}
