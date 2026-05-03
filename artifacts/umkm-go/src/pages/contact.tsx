import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Store, MessageSquare, Mail, Phone, MapPin, Send, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ContactPage() {
  const { toast } = useToast();
  const [form, setForm] = useState({ nama: "", email: "", telepon: "", subjek: "", pesan: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    toast({ title: "Pesan berhasil dikirim! Kami akan membalas dalam 1×24 jam." });
  };

  const contacts = [
    { icon: MessageSquare, label: "WhatsApp Support", val: "+62 821-xxxx-xxxx", sub: "Senin–Sabtu, 08:00–20:00 WIB", color: "text-green-600", bg: "bg-green-50" },
    { icon: Mail, label: "Email", val: "hello@umkmgo.id", sub: "Balasan dalam 1×24 jam kerja", color: "text-blue-600", bg: "bg-blue-50" },
    { icon: Phone, label: "Telepon Sales", val: "+62 21-xxxx-xxxx", sub: "Senin–Jumat, 09:00–17:00 WIB", color: "text-indigo-600", bg: "bg-indigo-50" },
    { icon: MapPin, label: "Kantor", val: "Jakarta, Indonesia", sub: "Kunjungan dengan appointment", color: "text-orange-600", bg: "bg-orange-50" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b border-gray-100 h-16 flex items-center px-4 bg-white sticky top-0 z-20">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center"><Store className="w-5 h-5 text-white" /></div>
            <span className="font-bold text-xl">UMKM Go</span>
          </Link>
          <Link href="/register"><Button size="sm">Coba Gratis</Button></Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Hubungi Kami</h1>
          <p className="text-gray-500 text-lg">Ada pertanyaan atau ingin demo? Kami siap membantu bisnis Anda berkembang</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Contact info */}
          <div className="space-y-4">
            {contacts.map((c) => (
              <div key={c.label} className={`flex items-start gap-4 p-5 rounded-xl border border-gray-200 bg-white`}>
                <div className={`p-2.5 rounded-xl ${c.bg}`}>
                  <c.icon className={`h-5 w-5 ${c.color}`} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{c.label}</p>
                  <p className={`font-medium ${c.color}`}>{c.val}</p>
                  <p className="text-sm text-gray-400 mt-0.5">{c.sub}</p>
                </div>
              </div>
            ))}

            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 text-white mt-6">
              <h3 className="font-bold text-lg mb-2">Program Mitra Reseller</h3>
              <p className="text-indigo-200 text-sm mb-4">Jadi reseller UMKM Go dan dapatkan komisi 20–30% recurring dari setiap pelanggan yang Anda referensikan.</p>
              <Button variant="secondary" size="sm">Daftar Jadi Mitra</Button>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            {sent ? (
              <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                <h3 className="text-xl font-bold text-gray-900">Pesan Terkirim!</h3>
                <p className="text-gray-500 mt-2">Terima kasih, kami akan menghubungi Anda dalam 1×24 jam.</p>
                <Button className="mt-6" onClick={() => { setSent(false); setForm({ nama: "", email: "", telepon: "", subjek: "", pesan: "" }); }}>
                  Kirim Pesan Lain
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Kirim Pesan</h2>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Nama Lengkap *</Label>
                    <Input className="mt-1" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Email *</Label>
                    <Input className="mt-1" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Nomor WhatsApp</Label>
                    <Input className="mt-1" value={form.telepon} onChange={(e) => setForm({ ...form, telepon: e.target.value })} />
                  </div>
                  <div>
                    <Label>Subjek *</Label>
                    <Input className="mt-1" value={form.subjek} onChange={(e) => setForm({ ...form, subjek: e.target.value })} required />
                  </div>
                </div>
                <div>
                  <Label>Pesan *</Label>
                  <Textarea className="mt-1" rows={5} value={form.pesan} onChange={(e) => setForm({ ...form, pesan: e.target.value })} placeholder="Ceritakan kebutuhan bisnis Anda..." required />
                </div>
                <Button type="submit" className="w-full h-12">
                  <Send className="h-4 w-4 mr-2" />
                  Kirim Pesan
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
