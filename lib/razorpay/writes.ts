import { razorpayWritesEnabled } from "@/lib/env";
import type { SimulatedWrite } from "./types";

export function assertRazorpayWritesEnabled(): SimulatedWrite | null {
  if (razorpayWritesEnabled()) return null;
  return {
    simulated: true,
    message: "Simulation mode — no financial action was sent to Razorpay.",
  };
}
