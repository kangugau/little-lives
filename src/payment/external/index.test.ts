import { describe, it, expect } from "vitest";
import { ExternalPaymentService } from "./index";

describe("ExternalPaymentService", () => {
  const service = new ExternalPaymentService();

  describe("createPayment", () => {
    it("should create payment with external ID", async () => {
      const result = await service.createPayment({
        amount: 100,
        method: "credit_card",
      });

      expect(result.externalId).toMatch(/^[0-9a-f-]{36}$/);
      expect(result.provider).toBe("CreditCardProvider");
      expect(result.status).toMatch(/^(pending|complete|rejected)$/);
      expect(result.referenceNumber).toMatch(/^REF-CC-\d{8}-[a-f0-9]+$/);
      expect(result.createdAt).toBeInstanceOf(Date);
    });

    it("should create payment with cash method", async () => {
      const result = await service.createPayment({
        amount: 200,
        method: "cash",
      });

      expect(result.externalId).toBeTruthy();
      expect(result.provider).toBe("CashProvider");
      expect(result.status).toBe("complete");
      expect(result.referenceNumber).toMatch(/^REF-CSH-\d{8}-/);
    });
  });
});
