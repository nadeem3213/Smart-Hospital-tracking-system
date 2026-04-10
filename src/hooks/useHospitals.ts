import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Hospital } from "../data/hospitals";
import { API_BASE } from "@/config";

const API_URL = `${API_BASE}/api/hospitals`;

// Fetch all hospitals
export const useHospitals = () => {
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
    mutationFn: async (newHospital: Omit<Hospital, "status" | "distance" | "eta" | "rating">) => {
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
      // Invalidate and refetch
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
