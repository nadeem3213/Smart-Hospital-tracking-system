import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Hospital } from "../data/hospitals";
import { API_BASE } from "@/config";
import { io, Socket } from "socket.io-client";

const API_URL = `${API_BASE}/api/hospitals`;

let socketInstance: Socket | null = null;
const getSocket = () => {
  if (!socketInstance) {
    socketInstance = io(API_BASE);
  }
  return socketInstance;
};

// Fetch all hospitals
export const useHospitals = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = getSocket();

    const handleHospitalUpdated = (updatedHospital: Hospital) => {
      queryClient.setQueryData<Hospital[]>(["hospitals"], (oldData) => {
        if (!oldData) return oldData;
        return oldData.map((h) => 
          (h as any)._id === (updatedHospital as any)._id 
            ? { ...h, ...updatedHospital } 
            : h
        );
      });
    };

    const handleHospitalAdded = (newHospital: Hospital) => {
      queryClient.setQueryData<Hospital[]>(["hospitals"], (oldData) => {
        if (!oldData) return [newHospital];
        if (oldData.find((h: any) => h._id === (newHospital as any)._id)) return oldData;
        return [...oldData, newHospital];
      });
    };

    socket.on("HOSPITAL_UPDATED", handleHospitalUpdated);
    socket.on("HOSPITAL_ADDED", handleHospitalAdded);

    return () => {
      socket.off("HOSPITAL_UPDATED", handleHospitalUpdated);
      socket.off("HOSPITAL_ADDED", handleHospitalAdded);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ["hospitals"],
    queryFn: async (): Promise<Hospital[]> => {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    },
  });
};

// Add a new hospital
export const useAddHospital = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newHospital: Omit<Hospital, "status" | "distance" | "eta">) => {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newHospital),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add hospital");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch fallback
      // Since Socket.io handles local updates instantly, this ensures full sync.
      queryClient.invalidateQueries({ queryKey: ["hospitals"] });
    },
  });
};

// Update a hospital (admin only)
export const useUpdateHospital = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Hospital> }) => {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update hospital");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hospitals"] });
    },
  });
};
