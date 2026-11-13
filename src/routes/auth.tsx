import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sprout, Mail, Lock, Phone, ArrowRight, Loader2, UserCheck, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useFarmerData } from "@/hooks/useFarmerData";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "লগ ইন · Chashi.io প্ল্যাটফর্ম" },
      { name: "description", content: "Chashi.io প্ল্যাটফর্মে কৃষক ও অ্যাডমিন প্রবেশদ্বার।" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"farmer" | "admin">("farmer");

  // Admin form
  const [email, setEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  // Farmer form
  const [phone, setPhone] = useState("01712345678");
  const [farmerPassword, setFarmerPassword] = useState("123");

  const [busy, setBusy] = useState(false);
  const { loginFarmer, currentFarmer } = useFarmerData();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/app" });
    });
  }, [navigate]);

  useEffect(() => {
    if (currentFarmer) {
      navigate({ to: "/farmer" });
    }
  }, [currentFarmer, navigate]);

  const submitAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password: adminPassword });
      if (error) throw error;
      toast.success("স্বাগতম! মেইন প্যানেলে প্রবেশ করছি…");
      navigate({ to: "/app" });
    } catch (err: unknown) {
      toast.error((err as Error).message || "ভুল credentials — প্রবেশ অনুমোদিত নয়");
    } finally {
      setBusy(false);
    }
  };

  const submitFarmer = (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = loginFarmer(phone, farmerPassword);
      if (res.success) {
        toast.success(res.message);
        navigate({ to: "/farmer" });
      } else {
        toast.error(res.message);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-10 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 grid-bg opacity-40" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 blur-3xl rounded-full -z-10" />

      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2.5 mb-6 hover:opacity-80 transition w-fit">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 via-lime-400 to-amber-400 grid place-items-center shadow-lg shadow-amber-500/30">
            <Sprout className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-2xl leading-tight tracking-tight">
              <span className="brand-chashi">Chashi</span>
              <span className="brand-chashi-dot">.</span>
              <span className="brand-chashi">io</span>
            </p>
            <p className="text-[10px] text-muted-foreground">স্মার্ট সেচ ব্যবস্থাপনা</p>
          </div>
        </Link>

        <div className="glass-card rounded-2xl p-7 sm:p-8">
          {/* Tabs */}
          <div className="grid grid-cols-2 p-1 bg-secondary/80 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => setTab("farmer")}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                tab === "farmer"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/30"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <UserCheck className="h-3.5 w-3.5" /> কৃষক লগইন
            </button>
            <button
              type="button"
              onClick={() => setTab("admin")}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                tab === "admin"
                  ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-orange-500/30"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" /> মেইন প্যানেল (অ্যাডমিন)
            </button>
          </div>

          {tab === "farmer" ? (
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 mb-3">
                <UserCheck className="h-3 w-3" /> কৃষক প্রবেশদ্বার
              </div>
              <h1 className="text-2xl font-black tracking-tight">কৃষক একাউন্টে প্রবেশ</h1>
              <p className="text-xs text-muted-foreground mt-1">
                আপনার নিবন্ধিত মোবাইল নম্বর ও পাসওয়ার্ড দিয়ে লগইন করে জমির সেচ ও আর্দ্রতা পর্যবেক্ষণ করুন।
              </p>

              <form onSubmit={submitFarmer} autoComplete="off" className="space-y-3.5 mt-5">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">মোবাইল নম্বর</label>
                  <div className="mt-1 relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full h-11 pl-10 pr-3 rounded-xl border border-border bg-background/70 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-sm"
                      placeholder="017XXXXXXXX"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground">পাসওয়ার্ড</label>
                  <div className="mt-1 relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="password"
                      required
                      value={farmerPassword}
                      onChange={(e) => setFarmerPassword(e.target.value)}
                      className="w-full h-11 pl-10 pr-3 rounded-xl border border-border bg-background/70 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-700 dark:text-emerald-300">
                  💡 <strong>পরীক্ষামূলক ডেমো লগইন:</strong> মোবাইল: <code className="bg-emerald-500/20 px-1 rounded">01712345678</code> · পাসওয়ার্ড: <code className="bg-emerald-500/20 px-1 rounded">123</code>
                </div>

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 text-white font-bold text-sm shadow-lg hover:shadow-xl hover:scale-[1.01] transition flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <>কৃষক প্যানেলে প্রবেশ করুন <ArrowRight className="h-4 w-4" /></>}
                </button>
              </form>
            </div>
          ) : (
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-[10px] font-bold text-amber-900 dark:text-amber-300 mb-3">
                <Lock className="h-3 w-3" /> RESTRICTED · অনুমোদিত অ্যাডমিন
              </div>
              <h1 className="text-2xl font-black tracking-tight">মেইন প্যানেল Access</h1>
              <p className="text-xs text-muted-foreground mt-1">
                প্রবেশের জন্য অনুমোদিত ইমেইল ও পাসওয়ার্ড প্রদান করুন।
              </p>

              <form onSubmit={submitAdmin} autoComplete="off" className="space-y-3.5 mt-5">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">অনুমোদিত ইমেইল</label>
                  <div className="mt-1 relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="off"
                      className="w-full h-11 pl-10 pr-3 rounded-xl border border-border bg-background/70 focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                      placeholder="admin@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">পাসওয়ার্ড</label>
                  <div className="mt-1 relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="password"
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      autoComplete="new-password"
                      className="w-full h-11 pl-10 pr-3 rounded-xl border border-border bg-background/70 focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-sm shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <>মেইন প্যানেলে প্রবেশ <ArrowRight className="h-4 w-4" /></>}
                </button>
              </form>
            </div>
          )}

          <p className="text-[11px] text-center text-muted-foreground mt-6">
            অ্যাকাউন্ট সংক্রান্ত সহায়তার জন্য সিস্টেম অ্যাডমিনের সাথে যোগাযোগ করুন।
          </p>
        </div>

        <p className="text-center text-[11px] text-muted-foreground mt-6">
          © {new Date().getFullYear()} বরেন্দ্র বহুমুখী উন্নয়ন কর্তৃপক্ষ · IoT v২.৬
        </p>
      </div>
    </div>
  );
}
