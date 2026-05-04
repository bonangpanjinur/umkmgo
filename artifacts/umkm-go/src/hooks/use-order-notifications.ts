import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listOrders } from "@workspace/api-client-react";
import { getToken } from "@/lib/auth";

const STORAGE_KEY = "umkm_seen_order_ids";
const POLL_INTERVAL = 10_000;

function getSeenIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

function markSeen(ids: string[]) {
  try {
    const existing = getSeenIds();
    ids.forEach((id) => existing.add(id));
    const arr = Array.from(existing);
    if (arr.length > 300) arr.splice(0, arr.length - 300);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  } catch {}
}

export interface NewOrder {
  id: string;
  buyerName: string;
  totalAmount: number;
  tableNumber?: string | null;
  source?: string | null;
  notes?: string | null;
}

export function useOrderNotifications(enabled: boolean) {
  const seenRef = useRef<Set<string>>(getSeenIds());
  const initialLoadRef = useRef(true);
  const [newOrders, setNewOrders] = useState<NewOrder[]>([]);

  const token = getToken();

  const { data } = useQuery({
    queryKey: ["orders-notifications"],
    queryFn: () =>
      listOrders(
        { page: 1, limit: 20 },
        { request: { headers: { Authorization: `Bearer ${token}` } } }
      ),
    enabled: !!token && enabled,
    refetchInterval: POLL_INTERVAL,
    refetchIntervalInBackground: false,
  });

  useEffect(() => {
    if (!data?.data) return;
    const orders: any[] = data.data;

    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      const allIds = orders.map((o) => o.id);
      markSeen(allIds);
      seenRef.current = new Set(allIds);
      return;
    }

    const newOnes = orders.filter(
      (o) => !seenRef.current.has(o.id) && o.status === "pending"
    );

    if (newOnes.length > 0) {
      setNewOrders(
        newOnes.map((o) => ({
          id: o.id,
          buyerName: o.buyerName,
          totalAmount: Number(o.totalAmount),
          tableNumber: o.tableNumber ?? null,
          source: o.source ?? null,
          notes: o.notes ?? null,
        }))
      );
      const newIds = newOnes.map((o) => o.id);
      markSeen(newIds);
      newIds.forEach((id) => seenRef.current.add(id));
    }
  }, [data]);

  const pendingCount =
    data?.data?.filter((o: any) => o.status === "pending").length ?? 0;

  const clearNewOrders = () => setNewOrders([]);

  return { pendingCount, newOrders, clearNewOrders };
}
