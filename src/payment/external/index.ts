import { v4 as uuidv4 } from 'uuid';
import { PaymentMethod, PaymentStatus } from '../../types';

export interface ExternalPaymentRequest {
  amount: number;
  method: PaymentMethod;
}

export interface ExternalPaymentResponse {
  externalId: string;
  provider: string;
  status: PaymentStatus;
  referenceNumber: string;
  createdAt: Date;
}

export interface ExternalPaymentResult {
  externalId: string;
  status: PaymentStatus;
  message: string;
}

const PROVIDER_MAP: Record<PaymentMethod, string> = {
  cash: 'CashProvider',
  bank_transfer: 'BankTransferProvider',
};

const REF_PREFIX: Record<PaymentMethod, string> = {
  cash: 'CSH',
  bank_transfer: 'BT',
};

export class ExternalPaymentService {
  async createPayment(
    request: ExternalPaymentRequest
  ): Promise<ExternalPaymentResponse> {
    const externalId = uuidv4();
    const { amount, method } = request;

    await this.simulateDelay(method);

    const status = this.getStatus(method, amount);
    const referenceNumber = this.generateRef(method, externalId);

    return {
      externalId,
      provider: PROVIDER_MAP[method],
      status,
      referenceNumber,
      createdAt: new Date(),
    };
  }

  private getStatus(method: PaymentMethod, amount: number): PaymentStatus {
    if (method === 'cash') return 'complete';
    return 'pending';
  }

  private generateRef(method: PaymentMethod, id: string): string {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    return `REF-${REF_PREFIX[method]}-${date}-${id.slice(0, 8)}`;
  }

  private async simulateDelay(method: PaymentMethod): Promise<void> {
    const delay: Record<PaymentMethod, number> = {
      cash: 50,
      bank_transfer: 80,
    };
    return new Promise((r) => setTimeout(r, delay[method]));
  }
}

export const externalPaymentService = new ExternalPaymentService();
