import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import { db } from "../database/db";

dotenv.config();

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// Este endpoint NO usa JSON.parse
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const signature = req.headers["stripe-signature"] as string;

    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET as string
      );

      if (event.type === "checkout.session.completed") {
        const session: any = event.data.object;

        const reservationId = session.metadata.reservationId;
        const stripePaymentId = session.payment_intent;
        const amount = session.amount_total / 100;

        // Guardar pago en DB
        await db.query(
          `
          INSERT INTO payment_logs (id, reservation_id, stripe_payment_id, amount, status)
          VALUES (UUID(), ?, ?, ?, 'COMPLETED')
        `,
          [reservationId, stripePaymentId, amount]
        );

        // Marcar reserva como pagada
        await db.query(
          `
          UPDATE reservations
          SET status = 'PAID'
          WHERE id = ?
        `,
          [reservationId]
        );
      }

      res.sendStatus(200);
    } catch (err) {
      console.error("Webhook error:", err);
      res.sendStatus(400);
    }
  }
);

export default router;
