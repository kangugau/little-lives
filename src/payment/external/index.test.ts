import { describe, it, expect } from "vitest";
import { v4 as uuidv4 } from "uuid";
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
      expect(result.status).toMatch(/^(pending|completed)$/);
      expect(result.paymentStatus).toMatch(/^(complete|pending)$/);
      expect(result.referenceNumber).toMatch(/^REF-[A-Z]{3}-\d{8}-[a-f0-9]+$/);
      expect(result.createdAt).toBeInstanceOf(Date);
    });

    it("should create payment with cash method", async () => {
      const result = await service.createPayment({
        amount: 200,
        method: "cash",
      });

      expect(result.externalId).toBeTruthy();
      expect(result.status).toMatch(/^(pending|completed)$/);
      expect(result.referenceNumber).toMatch(/^REF-[A-Z]{3}/);
    });
  });

  describe("confirmPayment", () => {
    it("should confirm payment and return result", async () => {
      const result = await service.confirmPayment(uuidv4());

      expect(result.externalId).toBeDefined();
      expect(result.status).toMatch(/^(completed|failed)$/);
      expect(result.paymentStatus).toMatch(/^(complete|pending)$/);
      expect(result.message).toBeDefined();
    });
  });

  describe("getPaymentStatus", () => {
    it("should return current payment status", async () => {
      const result = await service.getPaymentStatus(uuidv4());

      expect(result.externalId).toBeDefined();
      expect(result.status).toMatch(/^(pending|completed|failed)$/);
      expect(result.paymentStatus).toMatch(/^(complete|pending)$/);
      expect(result.message).toContain("Current status:");
    });
  });
});
