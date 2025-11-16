// services/reservationService.ts
import { db } from "../database/db";

export const calculatePrice = (precioHora: number, duracionMin: number) => {
  return Number(precioHora) * (duracionMin / 60);
};

export const checkTutorAvailability = async (tutorId: string, fecha_inicio: string, duracion_min: number) => {
  const [rows]: any = await db.query(
    `SELECT * FROM reservations
     WHERE tutor_id = ? AND estado IN ('PENDING','PAGADO') 
       AND TIMESTAMPDIFF(MINUTE, fecha_inicio, ?) < duracion_min`,
    [tutorId, fecha_inicio]
  );
  return rows.length === 0; // true si disponible
};

export const createPaymentLog = async (reservationId: string, amount: number, paymentMethod: string) => {
  const { v4: uuidv4 } = await import('uuid');
  const fakePaymentId = `SIM-${uuidv4().slice(0, 8)}`;
  await db.query(
    `INSERT INTO payment_logs
      (id, reservation_id, stripe_payment_id, amount, status, payment_method, created_at)
     VALUES
      (UUID(), ?, ?, ?, 'COMPLETED', ?, NOW())`,
    [reservationId, fakePaymentId, amount, paymentMethod]
  );
  return fakePaymentId;
};
