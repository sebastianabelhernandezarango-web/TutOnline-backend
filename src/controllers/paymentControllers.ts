import { Request, Response } from "express";
import { db } from "../database/db";
import { v4 as uuidv4 } from "uuid";

// Simulación de pago con opción seleccionada
export const fakePayment = async (req: Request, res: Response) => {
  try {
    const { reservationId, paymentMethod } = req.body;

    if (!reservationId) return res.status(400).json({ error: "Falta reservationId" });
    if (!paymentMethod) return res.status(400).json({ error: "Falta paymentMethod" });

    // Obtener precio de la reserva
    const [rows]: any = await db.query(
      "SELECT precio FROM reservations WHERE id = ?",
      [reservationId]
    );

    if (rows.length === 0) return res.status(404).json({ error: "Reserva no encontrada" });

    const precio = rows[0].precio;
    const fakePaymentId = `SIM-${uuidv4().slice(0, 8)}`;

    // Registrar pago simulado en payment_logs
    await db.query(
      `INSERT INTO payment_logs
        (id, reservation_id, stripe_payment_id, amount, status, created_at, payment_method)
       VALUES
        (UUID(), ?, ?, ?, 'COMPLETED', NOW(), ?)`,
      [reservationId, fakePaymentId, precio, paymentMethod]
    );

    // Actualizar reserva a PAGADO
    await db.query(
      `UPDATE reservations
       SET estado = 'ACCEPTED', updated_at = NOW()
       WHERE id = ?`,
      [reservationId]
    );

    res.json({
      success: true,
      message: "Pago simulado correctamente",
      payment: {
        paymentId: fakePaymentId,
        amount: precio,
        status: "COMPLETED",
        paymentMethod
      }
    });

  } catch (err) {
    console.error("Error en fakePayment:", err);
    res.status(500).json({ error: "Error simulando pago" });
  }
};
