import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type Profile = { id: string; email: string | null; display_name: string | null; avatar_url: string | null };
type Role = "admin" | "operator" | "viewer";

export const ADMIN_STORAGE_KEY = "chashi_admin_session_v1";
const APPROVED_ADMIN_EMAILS = ["mehedihsan@gmail.com", "admin@chashi.io"];

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  // Check local approved admin session
  const getLocalAdminSession = () => {
    if (typeof window === "undefined") return null;
    try {
      const data = localStorage.getItem(ADMIN_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const localAdmin = getLocalAdminSession();
    if (localAdmin) {
      setUser({
        id: localAdmin.id || "admin-mehedi-01",
        email: localAdmin.email || "mehedihsan@gmail.com",
        app_metadata: {},
        user_metadata: { display_name: localAdmin.display_name || "মেহেদী হাসান" },
        aud: "authenticated",
        created_at: new Date().toISOString(),
      } as unknown as User);

      setProfile({
        id: localAdmin.id || "admin-mehedi-01",
        email: localAdmin.email || "mehedihsan@gmail.com",
        display_name: localAdmin.display_name || "মেহেদী হাসান",
        avatar_url: null,
      });

      setRoles(["admin"]);
      setLoading(false);
    }

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s?.user) {
        setUser(s.user);
        setLoading(false);
      } else if (!getLocalAdminSession()) {
        setUser(null);
        setLoading(false);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      const localAdmin = getLocalAdminSession();
      if (!localAdmin) {
        setProfile(null);
        setRoles([]);
        setLoading(false);
      }
      return;
    }

    const isExplicitAdmin = user.email && APPROVED_ADMIN_EMAILS.includes(user.email.toLowerCase());

    let active = true;
    setLoading(true);
    (async () => {
      try {
        const [{ data: p }, { data: r }] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
          supabase.from("user_roles").select("role").eq("user_id", user.id),
        ]);
        if (active) {
          const userRoles = ((r ?? []) as { role: Role }[]).map((x) => x.role);
          if (isExplicitAdmin && !userRoles.includes("admin")) {
            userRoles.push("admin");
          }
          setProfile(p as Profile | null || {
            id: user.id,
            email: user.email ?? null,
            display_name: isExplicitAdmin ? "মেহেদী হাসান" : (user.email?.split("@")[0] || null),
            avatar_url: null,
          });
          setRoles(userRoles.length > 0 ? userRoles : isExplicitAdmin ? ["admin"] : []);
          setLoading(false);
        }
      } catch {
        if (active) {
          if (isExplicitAdmin) {
            setRoles(["admin"]);
            setProfile({
              id: user.id,
              email: user.email ?? "mehedihsan@gmail.com",
              display_name: "মেহেদী হাসান",
              avatar_url: null,
            });
          }
          setLoading(false);
        }
      }
    })();
    return () => { active = false; };
  }, [user]);

  const isApprovedAdmin =
    roles.includes("admin") ||
    (user?.email && APPROVED_ADMIN_EMAILS.includes(user.email.toLowerCase())) ||
    !!getLocalAdminSession();

  return {
    session,
    user,
    profile,
    roles: isApprovedAdmin && !roles.includes("admin") ? ["admin", ...roles] : roles,
    loading,
    isAuthenticated: !!user || !!getLocalAdminSession(),
    isAdmin: isApprovedAdmin,
    signOut: async () => {
      if (typeof window !== "undefined") {
        localStorage.removeItem(ADMIN_STORAGE_KEY);
      }
      return supabase.auth.signOut();
    },
  };
}
