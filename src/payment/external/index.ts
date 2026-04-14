import { v4 as uuidv4 } from "uuid";
import { PaymentStatus } from "../../types";

export type ExternalPaymentStatus = "pending" | "completed" | "failed";

export interface ExternalPaymentRequest {
  amount: number;
  method: string;
}

export interface ExternalPaymentResponse {
  externalId: string;
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

export class ExternalPaymentService {
  async createPayment(request: ExternalPaymentRequest): Promise<ExternalPaymentResponse> {
    const externalId = uuidv4();
    const { amount, method } = request;
    
    await this.simulateDelay();
    
    const isPending = method === "bank_transfer" || Math.random() < 0.3;
    const status: ExternalPaymentStatus = isPending ? "pending" : "completed";
    const paymentStatus: PaymentStatus = status === "completed" ? "complete" : "pending";
    
    const referenceNumber = this.generateReferenceNumber(method, externalId);
    
    return {
      externalId,
      status,
      paymentStatus,
      referenceNumber,
      createdAt: new Date(),
    };
  }

  async confirmPayment(externalId: string): Promise<ExternalPaymentResult> {
    await this.simulateDelay();
    
    const isCompleted = Math.random() > 0.2;
    const status: ExternalPaymentStatus = isCompleted ? "completed" : "failed";
    const paymentStatus: PaymentStatus = status === "completed" ? "complete" : "pending";
    
    return {
      externalId,
      status,
      paymentStatus,
      message: status === "completed" 
        ? "Payment confirmed successfully" 
        : "Payment failed",
    };
  }

  async getPaymentStatus(externalId: string): Promise<ExternalPaymentResult> {
    await this.simulateDelay();
    
    const statuses: ExternalPaymentStatus[] = ["pending", "completed", "failed"];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const paymentStatus: PaymentStatus = status === "completed" ? "complete" : "pending";
    
    return {
      externalId,
      status,
      paymentStatus,
      message: `Current status: ${status}`,
    };
  }

  private generateReferenceNumber(method: string, externalId: string): string {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
    const methodPrefix = method.substring(0, 3).toUpperCase();
    return `REF-${methodPrefix}-${dateStr}-${externalId.substring(0, 8)}`;
  }

  private async simulateDelay(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 100));
  }
}

export const externalPaymentService = new ExternalPaymentService();
