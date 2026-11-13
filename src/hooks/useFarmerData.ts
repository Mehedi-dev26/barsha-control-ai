import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { toggleMotor, toggleValve } from "./useIrrigationData";

export type Farmer = {
  id: string;
  name: string;
  phone: string;
  village: string;
  upazila?: string;
  district?: string;
  nid?: string;
  password?: string;
  joinedAt: string;
};

export type FarmerLand = {
  id: string;
  farmerId: string;
  landName: string;
  subNodeId: string; // e.g. "SUB-01", "SUB-02"
  zoneId: string;    // e.g. "z1", "z2"
  areaDecimals: number;
  cropType: string;
  soilType?: string;
};

export type IrrigationRequest = {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  landId: string;
  landName: string;
  subNodeId: string;
  zoneId: string;
  durationMinutes: number;
  status: "pending" | "approved" | "rejected" | "in_progress" | "completed";
  requestedAt: string;
  approvedAt?: string;
  completedAt?: string;
  notes?: string;
};

const DEFAULT_FARMERS: Farmer[] = [
  {
    id: "farmer-1",
    name: "মো: রফিকুল ইসলাম",
    phone: "01712345678",
    village: "মোহনপুর",
    upazila: "মোহনপুর",
    district: "রাজশাহী",
    nid: "১৯৮৪৫৬৭৮৯০১২৩",
    password: "123",
    joinedAt: "২০২৪-০১-১৫",
  },
  {
    id: "farmer-2",
    name: "আবদুল খালেক",
    phone: "01812345678",
    village: "গোদাগাড়ী",
    upazila: "গোদাগাড়ী",
    district: "রাজশাহী",
    nid: "১৯৮১২৩৪৫৬৭৮৯০",
    password: "123",
    joinedAt: "২০২৪-০২-০১",
  },
];

const DEFAULT_LANDS: FarmerLand[] = [
  {
    id: "land-1",
    farmerId: "farmer-1",
    landName: "উত্তর মাঠের বোরো ধান জমি",
    subNodeId: "SUB-01",
    zoneId: "z1",
    areaDecimals: 45,
    cropType: "ব্রি ধান-২৮",
    soilType: "দোআঁশ মাটি",
  },
  {
    id: "land-2",
    farmerId: "farmer-1",
    landName: "পুকুরপাড়ের সরিষা জমি",
    subNodeId: "SUB-02",
    zoneId: "z2",
    areaDecimals: 28,
    cropType: "বারি সরিষা-১৪",
    soilType: "বেলে দোআঁশ",
  },
  {
    id: "land-3",
    farmerId: "farmer-2",
    landName: "পশ্চিম বিলের ভুট্টা ক্ষেত",
    subNodeId: "SUB-03",
    zoneId: "z3",
    areaDecimals: 60,
    cropType: "এনকে-৪০ হাইব্রিড ভুট্টা",
    soilType: "পলি মাটি",
  },
];

const DEFAULT_REQUESTS: IrrigationRequest[] = [
  {
    id: "req-1",
    farmerId: "farmer-1",
    farmerName: "মো: রফিকুল ইসলাম",
    farmerPhone: "01712345678",
    landId: "land-1",
    landName: "উত্তর মাঠের বোরো ধান জমি",
    subNodeId: "SUB-01",
    zoneId: "z1",
    durationMinutes: 30,
    status: "pending",
    requestedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    notes: "ধানের শিষ বের হচ্ছে, জরুরি সেচ প্রয়োজন।",
  },
];

const STORAGE_KEYS = {
  FARMERS: "chashi_farmers_v1",
  LANDS: "chashi_farmer_lands_v1",
  REQUESTS: "chashi_irrigation_requests_v1",
  CURRENT_FARMER: "chashi_current_farmer_v1",
};

export function useFarmerData() {
  const [farmers, setFarmers] = useState<Farmer[]>(() => {
    if (typeof window === "undefined") return DEFAULT_FARMERS;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.FARMERS);
      return stored ? JSON.parse(stored) : DEFAULT_FARMERS;
    } catch {
      return DEFAULT_FARMERS;
    }
  });

  const [lands, setLands] = useState<FarmerLand[]>(() => {
    if (typeof window === "undefined") return DEFAULT_LANDS;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LANDS);
      return stored ? JSON.parse(stored) : DEFAULT_LANDS;
    } catch {
      return DEFAULT_LANDS;
    }
  });

  const [requests, setRequests] = useState<IrrigationRequest[]>(() => {
    if (typeof window === "undefined") return DEFAULT_REQUESTS;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.REQUESTS);
      return stored ? JSON.parse(stored) : DEFAULT_REQUESTS;
    } catch {
      return DEFAULT_REQUESTS;
    }
  });

  const [currentFarmer, setCurrentFarmer] = useState<Farmer | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_FARMER);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Sync to localStorage and dispatch custom events for multi-tab/component live update
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FARMERS, JSON.stringify(farmers));
  }, [farmers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LANDS, JSON.stringify(lands));
  }, [lands]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    if (currentFarmer) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_FARMER, JSON.stringify(currentFarmer));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_FARMER);
    }
  }, [currentFarmer]);

  // Listen for storage changes across tabs/windows
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.REQUESTS && e.newValue) {
        setRequests(JSON.parse(e.newValue));
      }
      if (e.key === STORAGE_KEYS.LANDS && e.newValue) {
        setLands(JSON.parse(e.newValue));
      }
      if (e.key === STORAGE_KEYS.FARMERS && e.newValue) {
        setFarmers(JSON.parse(e.newValue));
      }
      if (e.key === STORAGE_KEYS.CURRENT_FARMER) {
        setCurrentFarmer(e.newValue ? JSON.parse(e.newValue) : null);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Login farmer
  const loginFarmer = useCallback(
    (phone: string, pass: string): { success: boolean; message: string; farmer?: Farmer } => {
      const normalizedPhone = phone.trim().replace(/^(\+88)/, "");
      const found = farmers.find(
        (f) => f.phone.replace(/^(\+88)/, "") === normalizedPhone && (f.password ?? "123") === pass
      );

      if (found) {
        setCurrentFarmer(found);
        return { success: true, message: `স্বাগতম, ${found.name}!`, farmer: found };
      }
      return { success: false, message: "মোবাইল নম্বর অথবা পাসওয়ার্ড সঠিক নয়।" };
    },
    [farmers]
  );

  const logoutFarmer = useCallback(() => {
    setCurrentFarmer(null);
  }, []);

  // Admin: Register a new farmer
  const registerFarmer = useCallback(
    (newFarmer: Omit<Farmer, "id" | "joinedAt">) => {
      const id = `farmer-${Date.now()}`;
      const farmer: Farmer = {
        ...newFarmer,
        id,
        joinedAt: new Date().toISOString().split("T")[0],
      };
      setFarmers((prev) => [farmer, ...prev]);
      toast.success(`কৃষক "${farmer.name}" সফলভাবে যুক্ত হয়েছেন।`);
      return farmer;
    },
    []
  );

  // Admin: Add or link a land to a farmer with a specific sub-node
  const assignLandToFarmer = useCallback(
    (landData: Omit<FarmerLand, "id">) => {
      const id = `land-${Date.now()}`;
      const newLand: FarmerLand = { ...landData, id };
      setLands((prev) => [newLand, ...prev]);
      toast.success(`জমি "${newLand.landName}" (${newLand.subNodeId}) সফলভাবে সংযুক্ত হয়েছে।`);
      return newLand;
    },
    []
  );

  // Farmer: Submit an irrigation request
  const submitIrrigationRequest = useCallback(
    (input: { landId: string; durationMinutes: number; notes?: string }) => {
      if (!currentFarmer) {
        toast.error("অনুরোধ পাঠাতে অনুগ্রহ করে লগইন করুন");
        return null;
      }
      const targetLand = lands.find((l) => l.id === input.landId);
      if (!targetLand) {
        toast.error("জমির তথ্য পাওয়া যায়নি");
        return null;
      }

      const req: IrrigationRequest = {
        id: `req-${Date.now()}`,
        farmerId: currentFarmer.id,
        farmerName: currentFarmer.name,
        farmerPhone: currentFarmer.phone,
        landId: targetLand.id,
        landName: targetLand.landName,
        subNodeId: targetLand.subNodeId,
        zoneId: targetLand.zoneId,
        durationMinutes: input.durationMinutes,
        status: "pending",
        requestedAt: new Date().toISOString(),
        notes: input.notes,
      };

      setRequests((prev) => [req, ...prev]);
      toast.success("সেচের আবেদন সফলভাবে পাঠানো হয়েছে! অ্যাডমিন অনুমোদনের অপেক্ষা করছে।");
      return req;
    },
    [currentFarmer, lands]
  );

  // Admin: Approve request -> triggers motor ON + sub-node valve OPEN!
  const approveIrrigationRequest = useCallback(
    async (requestId: string) => {
      const req = requests.find((r) => r.id === requestId);
      if (!req) return;

      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? { ...r, status: "approved" as const, approvedAt: new Date().toISOString() }
            : r
        )
      );

      // Trigger hardware motor and subnode valve
      try {
        await toggleMotor(true);
        if (req.zoneId) {
          await toggleValve(req.zoneId, true);
        }
        toast.success(`আবেদন অনুমোদিত! ${req.farmerName} এর ${req.landName}-এ (${req.subNodeId}) পানি সরবরাহ চালু হয়েছে।`);
      } catch {
        toast.success(`আবেদন অনুমোদিত হয়েছে (${req.landName})।`);
      }
    },
    [requests]
  );

  // Admin: Reject request
  const rejectIrrigationRequest = useCallback(
    (requestId: string, reason?: string) => {
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? { ...r, status: "rejected" as const, notes: reason ? `${r.notes ?? ""} (বাতিল কারণ: ${reason})` : r.notes }
            : r
        )
      );
      toast.info("আবেদনটি বাতিল করা হয়েছে।");
    },
    []
  );

  // Admin: Complete / Stop irrigation
  const completeIrrigationRequest = useCallback(
    async (requestId: string) => {
      const req = requests.find((r) => r.id === requestId);
      if (!req) return;

      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? { ...r, status: "completed" as const, completedAt: new Date().toISOString() }
            : r
        )
      );

      if (req.zoneId) {
        try {
          await toggleValve(req.zoneId, false);
        } catch {
          // ignore
        }
      }
      toast.success(`${req.landName}-এ সেচ সম্পন্ন হয়েছে এবং ভালভ বন্ধ করা হয়েছে।`);
    },
    [requests]
  );

  // Filtered queries for currently logged-in farmer
  const currentFarmerLands = lands.filter((l) => l.farmerId === currentFarmer?.id);
  const currentFarmerRequests = requests.filter((r) => r.farmerId === currentFarmer?.id);

  return {
    farmers,
    lands,
    requests,
    currentFarmer,
    currentFarmerLands,
    currentFarmerRequests,
    loginFarmer,
    logoutFarmer,
    registerFarmer,
    assignLandToFarmer,
    submitIrrigationRequest,
    approveIrrigationRequest,
    rejectIrrigationRequest,
    completeIrrigationRequest,
  };
}
