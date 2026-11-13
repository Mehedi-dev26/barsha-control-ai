import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Sprout, Droplets, Thermometer, Wind, Gauge, Sparkles, Send, CheckCircle2,
  Clock, AlertTriangle, LogOut, Phone, MapPin, User, ChevronRight, Check,
  Bot, RefreshCw, Radio, ShieldCheck, Activity
} from "lucide-react";
import { useFarmerData, type FarmerLand } from "@/hooks/useFarmerData";
import { useIrrigationData } from "@/hooks/useIrrigationData";
import { toast } from "sonner";

export const Route = createFileRoute("/farmer")({
  head: () => ({
    meta: [
      { title: "কৃষক প্যানেল · Chashi.io" },
      { name: "description", content: "কৃষকদের নিজস্ব জমির রিয়েল-টাইম সেচ ও আর্দ্রতা মনিটরিং পোর্টাল।" },
    ],
  }),
  component: FarmerPortalPage,
});

const bn = (s: string | number) => String(s).replace(/[0-9]/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]);

function FarmerPortalPage() {
  const navigate = useNavigate();
  const { currentFarmer, currentFarmerLands, currentFarmerRequests, submitIrrigationRequest, logoutFarmer } = useFarmerData();
  const { zones, motor, weather } = useIrrigationData();

  const [selectedLandId, setSelectedLandId] = useState<string>(currentFarmerLands[0]?.id || "land-1");
  const [duration, setDuration] = useState<number>(30);
  const [notes, setNotes] = useState<string>("");
  const [requestModalOpen, setRequestModalOpen] = useState(false);

  // AI chat state
  const [aiMessage, setAiMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    {
      sender: "ai",
      text: "নমস্কার! আমি আপনার কৃষি এআই সহকারী। আপনার জমির মাটির আর্দ্রতা এবং ফসলের অবস্থা দেখে যেকোনো পরামর্শ চাইতে পারেন।",
    },
  ]);

  const activeLand = currentFarmerLands.find((l) => l.id === selectedLandId) || currentFarmerLands[0];
  const activeZone = useMemo(() => {
    if (!activeLand) return zones[0];
    return zones.find((z) => z.id === activeLand.zoneId || z.valveNodeId === activeLand.subNodeId) || zones[0];
  }, [zones, activeLand]);

  const handleLogout = () => {
    logoutFarmer();
    toast.success("সফলভাবে লগআউট হয়েছে");
    navigate({ to: "/auth" });
  };

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLand) return;

    submitIrrigationRequest({
      landId: activeLand.id,
      durationMinutes: duration,
      notes,
    });

    setRequestModalOpen(false);
    setNotes("");
  };

  const handleAiAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiMessage.trim()) return;

    const query = aiMessage.trim();
    const newChat = [...chatHistory, { sender: "user" as const, text: query }];
    setChatHistory(newChat);
    setAiMessage("");

    setTimeout(() => {
      let reply = `আপনার জমি "${activeLand?.landName || "বোরো ধান"}"-এ বর্তমান মাটির আর্দ্রতা ${bn(activeZone?.soilMoisture ?? 42)}%। `;
      if ((activeZone?.soilMoisture ?? 42) < 35) {
        reply += "মাটির আর্দ্রতা কম, এখনই সেচের আবেদন করা জরুরি। ৩০–৪৫ মিনিট সেচ দিলে গাছের বৃদ্ধি স্বাভাবিক থাকবে।";
      } else {
        reply += "মাটিতে পর্যাপ্ত রস রয়েছে। আগামী ২৪ ঘণ্টার মধ্যে অতিরিক্ত সেচের প্রয়োজন নেই। ইউরিয়া সার দেওয়ার উপযুক্ত সময়।";
      }
      setChatHistory([...newChat, { sender: "ai", text: reply }]);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#080D1A] text-foreground flex flex-col relative overflow-hidden">
      {/* Background glow effects matching main panel */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[350px] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[500px] h-[400px] bg-teal-500/10 blur-[140px] rounded-full pointer-events-none" />

      {/* Top Navigation */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-[#0B1222]/80 border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5 hover:opacity-85 transition">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-400 to-cyan-500 grid place-items-center shadow-lg shadow-emerald-500/30">
              <Sprout className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xl font-bold tracking-tight">
                <span className="brand-chashi">Chashi</span><span className="brand-chashi-dot">.</span><span className="brand-chashi">io</span>
              </p>
              <p className="text-[10px] text-emerald-400 font-medium">কৃষক সেচ পোর্টাল · বরেন্দ্র</p>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-muted-foreground">মাস্টার পাম্প:</span>
            <span className={`font-bold ${motor.isOn ? "text-emerald-400" : "text-amber-400"}`}>
              {motor.isOn ? "চালু আছে" : "স্ট্যান্ডবাই"}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="h-9 px-3.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-muted-foreground hover:text-rose-400 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <LogOut className="h-3.5 w-3.5" /> লগআউট
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Welcome & Farmer Profile Card */}
        <div className="glass-card rounded-2xl p-5 sm:p-6 relative overflow-hidden border border-white/10 bg-gradient-to-r from-emerald-950/40 via-slate-900/60 to-teal-950/40">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black text-2xl grid place-items-center shadow-xl shadow-emerald-500/30 shrink-0">
                {(currentFarmer?.name || "র").slice(0, 1)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-white">{currentFarmer?.name || "মো: রফিকুল ইসলাম"}</h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    নিবন্ধিত কৃষক
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1.5">
                  <span className="flex items-center gap-1 text-white/80">
                    <Phone className="h-3.5 w-3.5 text-emerald-400" /> {currentFarmer?.phone || "01712345678"}
                  </span>
                  <span className="flex items-center gap-1 text-white/80">
                    <MapPin className="h-3.5 w-3.5 text-teal-400" /> {currentFarmer?.village || "মোহনপুর, রাজশাহী"}
                  </span>
                  <span className="text-muted-foreground">
                    সংযুক্ত জমি: <strong className="text-white">{bn(currentFarmerLands.length)}</strong> টি
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setRequestModalOpen(true)}
              className="h-12 px-6 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white font-bold text-sm shadow-xl shadow-emerald-500/30 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.99] transition flex items-center justify-center gap-2 shrink-0"
            >
              <Droplets className="h-4 w-4" /> সেচের আবেদন করুন
            </button>
          </div>
        </div>

        {/* Land Selection Tabs */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sprout className="h-4 w-4 text-emerald-400" /> আপনার জমিসমূহ
              </h2>
              <p className="text-xs text-muted-foreground">যে জমির রিয়েল-টাইম তথ্য দেখতে চান তা নির্বাচন করুন</p>
            </div>
            <span className="text-xs text-muted-foreground bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
              মোট জমি: {bn(currentFarmerLands.length)}টি
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {currentFarmerLands.map((land) => {
              const isSelected = land.id === activeLand?.id;
              const matchedZone = zones.find((z) => z.id === land.zoneId || z.valveNodeId === land.subNodeId);
              const sm = matchedZone?.soilMoisture ?? 45;

              return (
                <div
                  key={land.id}
                  onClick={() => setSelectedLandId(land.id)}
                  className={`cursor-pointer rounded-2xl p-4 transition-all relative overflow-hidden border ${
                    isSelected
                      ? "bg-emerald-950/40 border-emerald-500/50 shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-500/40"
                      : "bg-[#0E1626]/70 border-white/10 hover:border-white/20 hover:bg-[#121D32]"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-sm sm:text-base text-white">{land.landName}</p>
                      <p className="text-xs text-emerald-400 mt-0.5">{land.cropType} · {bn(land.areaDecimals)} শতাংশ</p>
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white/10 border border-white/10 text-cyan-300">
                      {land.subNodeId}
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">মাটির আর্দ্রতা:</span>
                    <span className="font-bold text-white flex items-center gap-1">
                      <span className={`h-2 w-2 rounded-full ${sm < 30 ? "bg-rose-400" : sm < 60 ? "bg-emerald-400" : "bg-sky-400"}`} />
                      {bn(sm)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Land Live Telemetry & Monitoring */}
        {activeLand && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Real-time Meters (2 cols) */}
            <div className="lg:col-span-2 space-y-5">
              <div className="glass-card rounded-2xl p-5 border border-white/10 bg-[#0E1626]/80">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                  <div>
                    <h3 className="font-bold text-white text-base flex items-center gap-2">
                      <Activity className="h-4 w-4 text-emerald-400" /> {activeLand.landName} · লাইভ সেন্সর ডেটা
                    </h3>
                    <p className="text-xs text-muted-foreground">সংযুক্ত আইওটি সাব-নোড: <span className="font-mono text-cyan-300 font-semibold">{activeLand.subNodeId}</span></p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-semibold text-emerald-400">রিয়েল-টাইম সংযুক্ত</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                  {/* Moisture Card */}
                  <div className="rounded-xl p-4 bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/20">
                    <div className="flex items-center justify-between text-muted-foreground text-xs">
                      <span>মাটির আর্দ্রতা</span>
                      <Droplets className="h-4 w-4 text-emerald-400" />
                    </div>
                    <p className="text-2xl sm:text-3xl font-black text-white mt-2">
                      {bn(activeZone?.soilMoisture ?? 42)}<span className="text-sm font-normal text-muted-foreground">%</span>
                    </p>
                    <p className="text-[11px] text-emerald-400 mt-1 font-medium">
                      {(activeZone?.soilMoisture ?? 42) < 30 ? "⚠ জরুরি সেচ প্রয়োজন" : (activeZone?.soilMoisture ?? 42) < 60 ? "✓ স্বাভাবিক আর্দ্রতা" : "উপযুক্ত রস বজায় আছে"}
                    </p>
                  </div>

                  {/* Temperature Card */}
                  <div className="rounded-xl p-4 bg-gradient-to-br from-amber-950/50 to-slate-900 border border-amber-500/20">
                    <div className="flex items-center justify-between text-muted-foreground text-xs">
                      <span>জমির তাপমাত্রা</span>
                      <Thermometer className="h-4 w-4 text-amber-400" />
                    </div>
                    <p className="text-2xl sm:text-3xl font-black text-white mt-2">
                      {bn(weather.temperature ?? 28.5)}<span className="text-sm font-normal text-muted-foreground">°C</span>
                    </p>
                    <p className="text-[11px] text-amber-300 mt-1 font-medium">বাতাসের আর্দ্রতা: {bn(weather.humidity ?? 65)}%</p>
                  </div>

                  {/* Valve/Water Status */}
                  <div className="rounded-xl p-4 bg-gradient-to-br from-sky-950/50 to-slate-900 border border-sky-500/20 col-span-2 sm:col-span-1">
                    <div className="flex items-center justify-between text-muted-foreground text-xs">
                      <span>সাব-নোড ভালভ</span>
                      <Gauge className="h-4 w-4 text-sky-400" />
                    </div>
                    <p className="text-2xl sm:text-3xl font-black text-white mt-2">
                      {activeZone?.valveOpen ? "খোলা" : "বন্ধ"}
                    </p>
                    <p className="text-[11px] text-sky-300 mt-1 font-medium">
                      {activeZone?.valveOpen ? "💧 জমিতে পানি প্রবাহিত হচ্ছে" : "পানি প্রবাহ বন্ধ"}
                    </p>
                  </div>
                </div>

                {/* Progress bar visual */}
                <div className="mt-5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">আর্দ্রতার স্কেল (০ - ১০০%)</span>
                    <span className="font-bold text-white">{bn(activeZone?.soilMoisture ?? 42)}%</span>
                  </div>
                  <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden p-0.5">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(100, Math.max(5, activeZone?.soilMoisture ?? 42))}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Irrigation Requests History for this farmer */}
              <div className="glass-card rounded-2xl p-5 border border-white/10 bg-[#0E1626]/80">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <Clock className="h-4 w-4 text-teal-400" /> আপনার সেচ আবেদনের অবস্থা
                  </h3>
                  <button
                    onClick={() => setRequestModalOpen(true)}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-bold"
                  >
                    + নতুন আবেদন
                  </button>
                </div>

                {currentFarmerRequests.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4 text-center">এখনও কোনো সেচের আবেদন করা হয়নি।</p>
                ) : (
                  <div className="space-y-2.5">
                    {currentFarmerRequests.map((req) => (
                      <div
                        key={req.id}
                        className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white">{req.landName}</span>
                            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/10 text-cyan-300">
                              {req.subNodeId}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            অনুরোধের সময়সীমা: <strong className="text-white">{bn(req.durationMinutes)} মিনিট</strong> · {req.notes || "নিয়মিত সেচ"}
                          </p>
                        </div>

                        <div>
                          {req.status === "pending" && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" /> অপেক্ষমাণ (অ্যাডমিন অনুমোদন বাকি)
                            </span>
                          )}
                          {req.status === "approved" && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> অনুমোদিত · পানি চালু
                            </span>
                          )}
                          {req.status === "completed" && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                              ✓ সেচ সম্পন্ন
                            </span>
                          )}
                          {req.status === "rejected" && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              ✕ বাতিল
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* AI Assistant for Farmer (1 col) */}
            <div className="space-y-5">
              <div className="glass-card rounded-2xl p-5 border border-white/10 bg-[#0E1626]/80 flex flex-col h-[520px]">
                <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 grid place-items-center text-white shadow-md shadow-violet-500/30">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Chashi AI কৃষি সহকারী</h3>
                    <p className="text-[10px] text-muted-foreground">মাটির লাইভ আর্দ্রতাভিত্তিক পরামর্শ</p>
                  </div>
                </div>

                {/* Chat message list */}
                <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1 text-xs">
                  {chatHistory.map((c, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-xl leading-relaxed ${
                        c.sender === "user"
                          ? "bg-emerald-600/30 border border-emerald-500/30 ml-6 text-white text-right"
                          : "bg-white/5 border border-white/10 mr-6 text-white/90"
                      }`}
                    >
                      {c.text}
                    </div>
                  ))}
                </div>

                {/* Chat input */}
                <form onSubmit={handleAiAsk} className="pt-2 border-t border-white/10 flex gap-2">
                  <input
                    type="text"
                    value={aiMessage}
                    onChange={(e) => setAiMessage(e.target.value)}
                    placeholder="কীটনাশক বা সেচ বিষয়ে বাংলায় লিখুন…"
                    className="flex-1 h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  />
                  <button
                    type="submit"
                    className="h-10 px-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs flex items-center justify-center hover:opacity-90 transition"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal: Request Irrigation */}
      {requestModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl p-6 max-w-md w-full border border-white/20 bg-[#0E1626] space-y-4 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Droplets className="h-5 w-5 text-emerald-400" /> সেচের জন্য আবেদন করুন
              </h3>
              <button
                onClick={() => setRequestModalOpen(false)}
                className="text-muted-foreground hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendRequest} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">আবেদনের জমি</label>
                <select
                  value={selectedLandId}
                  onChange={(e) => setSelectedLandId(e.target.value)}
                  className="w-full h-11 px-3 mt-1 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {currentFarmerLands.map((l) => (
                    <option key={l.id} value={l.id} className="bg-[#0B101B] text-white">
                      {l.landName} ({l.subNodeId}) · {l.cropType}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">কত সময় সেচ প্রয়োজন?</label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {[15, 30, 60].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setDuration(mins)}
                      className={`h-10 rounded-xl text-xs font-bold transition border ${
                        duration === mins
                          ? "bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-500/30"
                          : "bg-white/5 text-muted-foreground border-white/10 hover:text-white"
                      }`}
                    >
                      {bn(mins)} মিনিট
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">মন্তব্য বা বিশেষ প্রয়োজন (ঐচ্ছিক)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="যেমন: ধানের গোড়া শুকিয়ে গেছে, দ্রুত পানি ছাড়া প্রয়োজন…"
                  className="w-full h-20 p-3 mt-1 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                ℹ আবেদন পাঠানোর সাথে সাথে অ্যাডমিন প্যানেলে নোটিফিকেশন যাবে এবং অ্যাডমিন অনুমোদন দিলে মেইন পাম্প ও আপনার জমির ভালভ স্বয়ংক্রিয়ভাবে খুলে যাবে।
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRequestModalOpen(false)}
                  className="flex-1 h-11 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold transition"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm shadow-lg hover:shadow-xl transition"
                >
                  আবেদন জমা দিন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
