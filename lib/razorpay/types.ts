export type RazorpayMode = "mock" | "test" | "live";

export type RazorpayDisputeStatus =
  | "open"
  | "action_required"
  | "under_review"
  | "won"
  | "lost"
  | "closed";

export type RazorpayDispute = {
  id: string;
  payment_id: string;
  amount: number;
  currency: string;
  reason_code: string;
  reason_description: string;
  status: RazorpayDisputeStatus;
  phase?: string;
  respond_by?: number;
  created_at: number;
  evidence?: Record<string, unknown>;
};

export type RazorpayPayment = {
  id: string;
  order_id?: string;
  amount: number;
  currency: string;
  status: string;
  method?: string;
  captured: boolean;
  amount_refunded: number;
  created_at: number;
};

export type RazorpayDocument = {
  id: string;
  purpose: "dispute_evidence";
  mime_type: string;
  created_at: number;
};

export type ContestPayload = {
  amount: number;
  summary: string;
  documentIds: string[];
  action: "draft" | "submit";
};

export type SimulatedWrite = {
  simulated: true;
  message: string;
};

export type RazorpayWriteResult<T> = T | SimulatedWrite;

export function isSimulatedWrite<T>(value: RazorpayWriteResult<T>): value is SimulatedWrite {
  return typeof value === "object" && value !== null && "simulated" in value;
}

export type RazorpayAdapter = {
  mode: RazorpayMode;
  fetchDisputes(): Promise<RazorpayDispute[]>;
  fetchDispute(id: string): Promise<RazorpayDispute | null>;
  fetchPayment(id: string): Promise<RazorpayPayment | null>;
  contestDispute(id: string, payload: ContestPayload): Promise<RazorpayWriteResult<RazorpayDispute>>;
  acceptDispute(id: string): Promise<RazorpayWriteResult<RazorpayDispute>>;
  uploadDocument(input: {
    filename: string;
    mimeType: string;
    bytes: Buffer;
  }): Promise<RazorpayWriteResult<RazorpayDocument>>;
};
