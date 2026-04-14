import { v4 as uuidv4 } from "uuid";
import { PaymentMethod, PaymentStatus } from "../../types";

export type ExternalPaymentStatus = "pending" | "completed" | "failed";

export interface ExternalPaymentRequest {
  amount: number;
  method: PaymentMethod;
}

export interface ExternalPaymentResponse {
  externalId: string;
  provider: string;
  status: ExternalPaymentStatus;
  paymentStatus: PaymentStatus;
  referenceNumber: string;
  createdAt: Date;
}

export interface ExternalPaymentResult {
  externalId: string;
  status: ExternalPaymentStatus;
  paymentStatus: PaymentStatus;
  message: string;
}

const PROVIDER_MAP: Record<PaymentMethod, string> = {
  cash: "CashProvider",
  credit_card: "CreditCardProvider",
  debit_card: "DebitCardProvider",
  bank_transfer: "BankTransferProvider",
};

const REF_PREFIX: Record<PaymentMethod, string> = {
  cash: "CSH",
  credit_card: "CC",
  debit_card: "DB",
  bank_transfer: "BT",
};

export class ExternalPaymentService {
  async createPayment(
    request: ExternalPaymentRequest,
  ): Promise<ExternalPaymentResponse> {
    const externalId = uuidv4();
    const { amount, method } = request;

    await this.simulateDelay(method);

    const status = this.getStatus(method, amount);
    const paymentStatus: PaymentStatus =
      status === "completed" ? "complete" : "pending";

    const referenceNumber = this.generateRef(method, externalId);

    return {
      externalId,
      provider: PROVIDER_MAP[method],
      status,
      paymentStatus,
      referenceNumber,
      createdAt: new Date(),
    };
  }

  private getStatus(method: PaymentMethod, amount: number): ExternalPaymentStatus {
    if (method === "cash") return "completed";
    if (method === "bank_transfer") return "pending";
    if (method === "credit_card") return amount > 10000 ? "pending" : "completed";
    return Math.random() > 0.1 ? "completed" : "failed";
  }

  private generateRef(method: PaymentMethod, id: string): string {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    return `REF-${REF_PREFIX[method]}-${date}-${id.slice(0, 8)}`;
  }

  private async simulateDelay(method: PaymentMethod): Promise<void> {
    const delay: Record<PaymentMethod, number> = {
      cash: 50,
      credit_card: 150,
      debit_card: 120,
      bank_transfer: 80,
    };
    return new Promise((r) => setTimeout(r, delay[method]));
  }
}

export const externalPaymentService = new ExternalPaymentService();
