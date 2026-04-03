import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";

type RevisionMap = Record<string, { revision: number; updatedAt: string }>;

type SyncResponse = {
  revisions: RevisionMap;
  serverTime: string;
};

function hasRevisionChanged(previous: RevisionMap | null, current: RevisionMap) {
  if (!previous) return false;

  return Object.keys(current).some((key) => (previous[key]?.revision ?? 0) !== current[key].revision);
}

export function useLiveSync() {
  const queryClient = useQueryClient();
  const previousRevisions = useRef<RevisionMap | null>(null);

  const query = useQuery({
    queryKey: ["sync-revisions"],
    queryFn: () => apiRequest<SyncResponse>("/sync/revisions"),
    refetchInterval: () => (document.visibilityState === "visible" ? 3000 : false),
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    retry: false,
    staleTime: 0,
  });

  useEffect(() => {
    const revisions = query.data?.revisions;
    if (!revisions) return;

    const changed = hasRevisionChanged(previousRevisions.current, revisions);
    previousRevisions.current = revisions;

    if (!changed) return;

    queryClient.invalidateQueries({
      predicate: (cachedQuery) => cachedQuery.queryKey[0] !== "sync-revisions",
      refetchType: "active",
    });
  }, [query.data?.revisions, queryClient]);
}

