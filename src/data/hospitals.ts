import { DEFAULT_POSITION } from "@/config";

export interface Hospital {
  name: string;
  type: "government" | "private";
  distance: string;
  eta: string;
  icuBeds: number;
  generalBeds: number;
  doctors: number;
  specialization: string;
  status: "available" | "busy" | "critical";
  lat: number;
  lng: number;
  rating: number;
  description: string;
  phone: string;
  email: string;
  established: string;
  specialties: string[];
}

export const AMBULANCE_POSITION: [number, number] = DEFAULT_POSITION;
