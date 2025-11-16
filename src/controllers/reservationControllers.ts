import { Request, Response } from "express";
import { db } from "../database/db";
import { v4 as uuidv4 } from "uuid";

// Crear reserva, simular pago y generar videollamada si es online
export const createReservationWithPayment = async (req: Request, res: Response) => {
  try {
    const {
      student_id,
      tutor_id,
      fecha_inicio,
      duracion_min,
      modalidad,
      notes,
      paymentMethod
    } = req.body;

    if (!student_id || !tutor_id || !fecha_inicio || !duracion_min) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    if (!paymentMethod) {
      return res.status(400).json({ error: "Debe seleccionar una opción de pago" });
    }

    // Obtener datos del tutor
    const [tutorRows]: any = await db.query(
      `SELECT u.name AS tutor_name, t.bio AS description, t.precio_hora, t.experiencia_anios, t.ubicacion, t.disponibilidad
       FROM tutors t
       JOIN users u ON u.id = t.user_id
       WHERE t.id = ?`,
      [tutor_id]
    );

    if (tutorRows.length === 0) {
      return res.status(404).json({ error: "Tutor no encontrado" });
    }

    const tutor = tutorRows[0];

    // Calcular precio total
    const total_price = Number(tutor.precio_hora) * (duracion_min / 60);

    // Crear reserva en estado PENDING
    await db.query(
      `INSERT INTO reservations
        (id, student_id, tutor_id, fecha_inicio, duracion_min, modalidad, precio, estado, created_at, updated_at)
       VALUES
        (UUID(), ?, ?, ?, ?, ?, ?, 'PENDING', NOW(), NOW())`,
      [student_id, tutor_id, fecha_inicio, duracion_min, modalidad ?? "Online", total_price]
    );

    // Obtener id de la reserva recién creada
    const [reservationRow]: any = await db.query(
      "SELECT id FROM reservations WHERE student_id = ? ORDER BY created_at DESC LIMIT 1",
      [student_id]
    );
    const reservationId = reservationRow[0].id;

    // Simular pago
    const fakePaymentId = `SIM-${uuidv4().slice(0, 8)}`;

    await db.query(
      `INSERT INTO payment_logs
        (id, reservation_id, stripe_payment_id, amount, status, payment_method, created_at)
       VALUES
        (UUID(), ?, ?, ?, 'COMPLETED', ?, NOW())`,
      [reservationId, fakePaymentId, total_price, paymentMethod]
    );

    // Actualizar reserva a PAGADO
    await db.query(
      `UPDATE reservations
       SET estado = 'ACCEPTED', updated_at = NOW()
       WHERE id = ?`,
      [reservationId]
    );

    // 🔹 Generar videollamada si la modalidad es Online
    let meetLink: string | null = null;
    if ((modalidad ?? "Online").toLowerCase() === "online") {
      meetLink = `https://meet.google.com/${uuidv4().slice(0, 10)}`;
      await db.query(
        `UPDATE reservations
         SET meet_link = ?
         WHERE id = ?`,
        [meetLink, reservationId]
      );
    }

    res.json({
      message: "Reserva creada y pagada correctamente",
      reservation: {
        id: reservationId,
        student_id,
        tutor_id,
        fecha_inicio,
        duracion_min,
        modalidad: modalidad ?? "Online",
        total_price,
        estado: "PAGADO",
        tutor_details: tutor,
        meet_link: meetLink
      },
      payment: {
        paymentId: fakePaymentId,
        amount: total_price,
        status: "COMPLETED",
        paymentMethod
      }
    });

  } catch (err) {
    console.error("Error en createReservationWithPayment:", err);
    res.status(500).json({ error: "Error creando reserva y simulando pago" });
  }
};
