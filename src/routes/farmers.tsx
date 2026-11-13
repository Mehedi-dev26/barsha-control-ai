import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  Users, Droplets, CheckCircle2, Clock, XCircle, Plus, Phone, MapPin,
  Sprout, Radio, ShieldCheck, Play, Square, AlertCircle, Sparkles
} from "lucide-react";
import { useFarmerData, type Farmer, type FarmerLand } from "@/hooks/useFarmerData";
import { useIrrigationData } from "@/hooks/useIrrigationData";
import { toast } from "sonner";

export const Route = createFileRoute("/farmers")({
  head: () => ({
    meta: [
      { title: "কৃষক ও সেচ আবেদন পরিচালনা · Chashi.io" },
      { name: "description", content: "কৃষকদের জমি, সাব-নোড লিঙ্কিং এবং সেচ আবেদন অনুমোদন হাব।" },
    ],
  }),
  component: FarmersAdminPage,
});

const bn = (s: string | number) => String(s).replace(/[0-9]/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]);

function FarmersAdminPage() {
  const {
    farmers,
    lands,
    requests,
    registerFarmer,
    assignLandToFarmer,
    approveIrrigationRequest,
    rejectIrrigationRequest,
    completeIrrigationRequest,
  } = useFarmerData();

  const { zones, motor } = useIrrigationData();

  const [activeTab, setActiveTab] = useState<"requests" | "farmers">("requests");
  const [addFarmerOpen, setAddFarmerOpen] = useState(false);
  const [addLandOpen, setAddLandOpen] = useState(false);

  // Add Farmer Form
  const [newFarmerName, setNewFarmerName] = useState("");
  const [newFarmerPhone, setNewFarmerPhone] = useState("");
  const [newFarmerVillage, setNewFarmerVillage] = useState("");
  const [newFarmerPassword, setNewFarmerPassword] = useState("123");
  const [newFarmerNid, setNewFarmerNid] = useState("");

  // Add Land Form
  const [selectedFarmerId, setSelectedFarmerId] = useState("");
  const [newLandName, setNewLandName] = useState("");
  const [newSubNodeId, setNewSubNodeId] = useState("SUB-01");
  const [newArea, setNewArea] = useState(30);
  const [newCrop, setNewCrop] = useState("বোরো ধান");

  const pendingRequests = requests.filter((r) => r.status === "pending");

  const handleCreateFarmer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFarmerName || !newFarmerPhone) {
      toast.error("নাম ও ফোন নম্বর দিন");
      return;
    }
    registerFarmer({
      name: newFarmerName,
      phone: newFarmerPhone,
      village: newFarmerVillage || "রাজশাহী",
      password: newFarmerPassword || "123",
      nid: newFarmerNid,
    });
    setAddFarmerOpen(false);
    setNewFarmerName("");
    setNewFarmerPhone("");
    setNewFarmerVillage("");
  };

  const handleCreateLand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFarmerId || !newLandName) {
      toast.error("কৃষক এবং জমির নাম নির্বাচন করুন");
      return;
    }
    assignLandToFarmer({
      farmerId: selectedFarmerId,
      landName: newLandName,
      subNodeId: newSubNodeId,
      zoneId: "z1",
      areaDecimals: newArea,
      cropType: newCrop,
      soilType: "দোআঁশ মাটি",
    });
    setAddLandOpen(false);
    setNewLandName("");
  };

  return (
    <DashboardLayout
      title="কৃষক ও সেচ আবেদন হাব · Chashi.io"
      subtitle="কৃষক প্রোফাইল, জমির সাব-নোড লিঙ্কিং এবং এক-ক্লিকে সেচ আবেদন অনুমোদন"
      actions={
        <div className="flex gap-2">
          <button
            onClick={() => setAddFarmerOpen(true)}
            className="h-10 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md hover:shadow-lg transition"
          >
            <Plus className="h-4 w-4" /> নতুন কৃষক যোগ
          </button>
          <button
            onClick={() => {
              if (farmers.length > 0) setSelectedFarmerId(farmers[0].id);
              setAddLandOpen(true);
            }}
            className="h-10 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center gap-1.5 border border-white/10 transition"
          >
            <Sprout className="h-4 w-4 text-emerald-400" /> জমি ও সাব-নোড লিঙ্ক
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Metric summary strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="glass-card rounded-2xl p-4 border border-white/10 bg-[#0E1626]/80">
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-emerald-400" /> মোট কৃষক
            </span>
            <p className="text-2xl font-black text-white mt-1">{bn(farmers.length)} জন</p>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-white/10 bg-[#0E1626]/80">
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Sprout className="h-3.5 w-3.5 text-teal-400" /> মোট সংযুক্ত জমি
            </span>
            <p className="text-2xl font-black text-white mt-1">{bn(lands.length)} টি</p>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-white/10 bg-[#0E1626]/80">
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-amber-400" /> অপেক্ষমাণ আবেদন
            </span>
            <p className="text-2xl font-black text-amber-300 mt-1">{bn(pendingRequests.length)} টি</p>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-white/10 bg-[#0E1626]/80">
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Droplets className="h-3.5 w-3.5 text-sky-400" /> মেইন মোটর অবস্থা
            </span>
            <p className={`text-2xl font-black mt-1 ${motor.isOn ? "text-emerald-400" : "text-muted-foreground"}`}>
              {motor.isOn ? "চালু আছে" : "বন্ধ"}
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-white/10 gap-6 text-sm font-bold">
          <button
            onClick={() => setActiveTab("requests")}
            className={`pb-3 relative flex items-center gap-2 transition ${
              activeTab === "requests" ? "text-emerald-400" : "text-muted-foreground hover:text-white"
            }`}
          >
            <Droplets className="h-4 w-4" /> সেচ আবেদন ও অনুমোদন হাব
            {pendingRequests.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500 text-black font-extrabold animate-pulse">
                {bn(pendingRequests.length)}
              </span>
            )}
            {activeTab === "requests" && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-emerald-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("farmers")}
            className={`pb-3 relative flex items-center gap-2 transition ${
              activeTab === "farmers" ? "text-emerald-400" : "text-muted-foreground hover:text-white"
            }`}
          >
            <Users className="h-4 w-4" /> কৃষক ও জমি ডিরেক্টরি ({bn(farmers.length)})
            {activeTab === "farmers" && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-emerald-400 rounded-full" />
            )}
          </button>
        </div>

        {/* Tab 1: Irrigation Requests Approval Hub */}
        {activeTab === "requests" && (
          <div className="glass-card rounded-2xl p-5 border border-white/10 bg-[#0E1626]/80 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="font-bold text-white text-base">আবেদন তালিকা ও রিয়েল-টাইম মোটর অনুমোদন</h3>
                <p className="text-xs text-muted-foreground">
                  অনুমোদন দিলে স্বয়ংক্রিয়ভাবে মেইন পাম্প এবং কৃষকের জমির সাব-নোড সার্ভো ভালভ খুলে যাবে।
                </p>
              </div>
            </div>

            {requests.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">
                বর্তমানে কোনো সেচ আবেদন নেই।
              </div>
            ) : (
              <div className="divide-y divide-white/5 space-y-3">
                {requests.map((req) => {
                  const matchedZone = zones.find((z) => z.id === req.zoneId || z.valveNodeId === req.subNodeId);
                  const currentMoisture = matchedZone?.soilMoisture ?? 40;

                  return (
                    <div
                      key={req.id}
                      className="pt-3 p-4 rounded-xl bg-white/5 hover:bg-white/8 transition border border-white/5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-black text-base text-white">{req.farmerName}</span>
                          <span className="text-xs text-emerald-400 flex items-center gap-1 font-mono">
                            <Phone className="h-3 w-3" /> {req.farmerPhone}
                          </span>
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800 text-cyan-300">
                            {req.subNodeId}
                          </span>
                          {req.status === "pending" && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              অনুমোদনের অপেক্ষায়
                            </span>
                          )}
                          {req.status === "approved" && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              ✓ অনুমোদিত · পানি চালু
                            </span>
                          )}
                          {req.status === "completed" && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                              ✓ সম্পন্ন
                            </span>
                          )}
                          {req.status === "rejected" && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              বাতিল
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-muted-foreground">
                          জমির নাম: <strong className="text-white">{req.landName}</strong> · সময়কাল:{" "}
                          <strong className="text-cyan-300">{bn(req.durationMinutes)} মিনিট</strong> · আবেদনের সময়:{" "}
                          {new Date(req.requestedAt).toLocaleTimeString("bn-BD")}
                        </p>

                        <div className="flex items-center gap-4 text-xs pt-1">
                          <span className="text-muted-foreground">
                            বর্তমান মাটির আর্দ্রতা:{" "}
                            <strong className={currentMoisture < 35 ? "text-rose-400" : "text-emerald-400"}>
                              {bn(currentMoisture)}%
                            </strong>
                          </span>
                          {req.notes && (
                            <span className="text-amber-200/90 italic">"{req.notes}"</span>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        {req.status === "pending" && (
                          <>
                            <button
                              onClick={() => approveIrrigationRequest(req.id)}
                              className="h-10 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/30 hover:scale-[1.02] transition"
                            >
                              <Play className="h-3.5 w-3.5 fill-current" /> অনুমোদন ও পানি ছাড়ুন
                            </button>
                            <button
                              onClick={() => rejectIrrigationRequest(req.id)}
                              className="h-10 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-semibold transition"
                            >
                              বাতিল
                            </button>
                          </>
                        )}
                        {req.status === "approved" && (
                          <button
                            onClick={() => completeIrrigationRequest(req.id)}
                            className="h-10 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 flex items-center gap-1.5 transition"
                          >
                            <Square className="h-3.5 w-3.5" /> সেচ সম্পন্ন করুন
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Farmers & Lands Directory */}
        {activeTab === "farmers" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {farmers.map((farmer) => {
                const farmerLands = lands.filter((l) => l.farmerId === farmer.id);

                return (
                  <div
                    key={farmer.id}
                    className="glass-card rounded-2xl p-5 border border-white/10 bg-[#0E1626]/80 space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black text-lg grid place-items-center shadow-md shadow-emerald-500/30">
                          {farmer.name.slice(0, 1)}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-base">{farmer.name}</h4>
                          <p className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {farmer.phone}
                          </p>
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3 text-teal-400" /> {farmer.village}
                          </p>
                        </div>
                      </div>

                      <span className="text-xs bg-white/5 border border-white/10 text-muted-foreground px-2.5 py-1 rounded-lg">
                        জমি: <strong className="text-white">{bn(farmerLands.length)}</strong> টি
                      </span>
                    </div>

                    {/* Lands list for this farmer */}
                    <div className="space-y-2 pt-2 border-t border-white/10">
                      <p className="text-xs font-semibold text-muted-foreground">সংযুক্ত জমি ও আইওটি সাব-নোড:</p>
                      {farmerLands.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic">এখনও কোনো জমি যুক্ত করা হয়নি।</p>
                      ) : (
                        farmerLands.map((land) => (
                          <div
                            key={land.id}
                            className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs"
                          >
                            <div>
                              <p className="font-bold text-white">{land.landName}</p>
                              <p className="text-[11px] text-muted-foreground">{land.cropType} · {bn(land.areaDecimals)} শতাংশ</p>
                            </div>
                            <span className="font-mono text-xs px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 font-bold">
                              {land.subNodeId}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal: Add Farmer */}
      {addFarmerOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl p-6 max-w-md w-full border border-white/20 bg-[#0E1626] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-400" /> নতুন কৃষক অ্যাকাউন্ট তৈরি
              </h3>
              <button onClick={() => setAddFarmerOpen(false)} className="text-muted-foreground hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateFarmer} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-muted-foreground">কৃষকের পূর্ণ নাম</label>
                <input
                  type="text"
                  required
                  value={newFarmerName}
                  onChange={(e) => setNewFarmerName(e.target.value)}
                  placeholder="যেমন: মো: রফিকুল ইসলাম"
                  className="w-full h-10 px-3 mt-1 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
              </div>

              <div>
                <label className="font-semibold text-muted-foreground">মোবাইল নম্বর (১১ ডিজিট)</label>
                <input
                  type="tel"
                  required
                  value={newFarmerPhone}
                  onChange={(e) => setNewFarmerPhone(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full h-10 px-3 mt-1 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
              </div>

              <div>
                <label className="font-semibold text-muted-foreground">গ্রাম / ইউনিয়ন / উপজেলা</label>
                <input
                  type="text"
                  value={newFarmerVillage}
                  onChange={(e) => setNewFarmerVillage(e.target.value)}
                  placeholder="যেমন: মোহনপুর, রাজশাহী"
                  className="w-full h-10 px-3 mt-1 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
              </div>

              <div>
                <label className="font-semibold text-muted-foreground">লগইন পাসওয়ার্ড (প্রাথমিক)</label>
                <input
                  type="text"
                  value={newFarmerPassword}
                  onChange={(e) => setNewFarmerPassword(e.target.value)}
                  className="w-full h-10 px-3 mt-1 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400 font-mono"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setAddFarmerOpen(false)}
                  className="flex-1 h-10 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Land & Link Sub-Node */}
      {addLandOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl p-6 max-w-md w-full border border-white/20 bg-[#0E1626] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sprout className="h-5 w-5 text-emerald-400" /> জমি ও সাব-নোড লিঙ্ক করুন
              </h3>
              <button onClick={() => setAddLandOpen(false)} className="text-muted-foreground hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateLand} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-muted-foreground">কৃষক নির্বাচন করুন</label>
                <select
                  value={selectedFarmerId}
                  onChange={(e) => setSelectedFarmerId(e.target.value)}
                  className="w-full h-10 px-3 mt-1 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400"
                >
                  {farmers.map((f) => (
                    <option key={f.id} value={f.id} className="bg-[#0B101B] text-white">
                      {f.name} ({f.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-muted-foreground">জমির নাম</label>
                <input
                  type="text"
                  required
                  value={newLandName}
                  onChange={(e) => setNewLandName(e.target.value)}
                  placeholder="যেমন: উত্তর মাঠের বোরো ধান জমি"
                  className="w-full h-10 px-3 mt-1 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
              </div>

              <div>
                <label className="font-semibold text-muted-foreground">আইওটি সাব-নোড নির্বাচন করুন</label>
                <select
                  value={newSubNodeId}
                  onChange={(e) => setNewSubNodeId(e.target.value)}
                  className="w-full h-10 px-3 mt-1 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-mono focus:outline-none focus:ring-1 focus:ring-emerald-400"
                >
                  {["SUB-01", "SUB-02", "SUB-03", "SUB-04", "SUB-05", "SUB-06"].map((sn) => (
                    <option key={sn} value={sn} className="bg-[#0B101B] text-white">
                      {sn} (ESP8266 + Soil Moisture Sensor)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-muted-foreground">জমির আয়তন (শতাংশ)</label>
                  <input
                    type="number"
                    value={newArea}
                    onChange={(e) => setNewArea(Number(e.target.value))}
                    className="w-full h-10 px-3 mt-1 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  />
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground">ফসলের নাম</label>
                  <input
                    type="text"
                    value={newCrop}
                    onChange={(e) => setNewCrop(e.target.value)}
                    placeholder="ব্রি ধান-২৮"
                    className="w-full h-10 px-3 mt-1 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setAddLandOpen(false)}
                  className="flex-1 h-10 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold"
                >
                  লিঙ্ক সম্পন্ন করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
