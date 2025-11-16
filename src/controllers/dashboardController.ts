import { Request, Response } from "express";
import { db } from "../database/db";

export const getStudentDashboard = async (req: Request, res: Response) => {
  const { studentId } = req.params;

  try {
    // Obtener reservas del estudiante
    const [reservas]: any = await db.query(
      `SELECT r.id, r.tutor_id, u.name AS tutor_name, r.fecha_inicio, r.duracion_min,
              r.modalidad, r.precio, r.estado
       FROM reservations r
       JOIN tutors t ON r.tutor_id = t.id
       JOIN users u ON t.user_id = u.id
       WHERE r.student_id = ?
       ORDER BY r.fecha_inicio DESC`,
      [studentId]
    );

    // Formatear fechas
    const reservasFormatted = reservas.map((r: any) => ({
      ...r,
      fecha_inicio: new Date(r.fecha_inicio).toISOString()
    }));

    //  Obtener pagos
    const [pagos]: any = await db.query(
      `SELECT p.id, p.reservation_id, p.amount, p.status, p.payment_method, p.created_at
       FROM payment_logs p
       JOIN reservations r ON p.reservation_id = r.id
       WHERE r.student_id = ?
       ORDER BY p.created_at DESC`,
      [studentId]
    );

    // 3Historial resumido
    const [historial]: any = await db.query(
      `SELECT estado, COUNT(*) AS total
       FROM reservations
       WHERE student_id = ?
       GROUP BY estado`,
      [studentId]
    );

    res.json({
      reservas: reservasFormatted,
      pagos,
      historial,
    });
  } catch (err) {
    console.error("Error en getStudentDashboard:", err);
    res.status(500).json({ error: "Error al obtener dashboard" });
  }
};


export const getTutorDashboard = async (req: Request, res: Response) => {
  const { tutorId } = req.params;

  try {
    // 1️⃣ Obtener reservas asignadas al tutor
    const [reservas]: any = await db.query(
      `SELECT r.id, r.student_id, u.name AS student_name, r.fecha_inicio, r.duracion_min,
              r.modalidad, r.precio, r.estado
       FROM reservations r
       JOIN users u ON r.student_id = u.id
       WHERE r.tutor_id = ?
       ORDER BY r.fecha_inicio DESC`,
      [tutorId]
    );

    // Formatear fechas
    const reservasFormatted = reservas.map((r: any) => ({
      ...r,
      fecha_inicio: new Date(r.fecha_inicio).toISOString()
    }));

    // 2️⃣ Obtener pagos recibidos por el tutor
    // Suponiendo que payments se registran por reservation_id
    const [pagos]: any = await db.query(
      `SELECT p.id, p.reservation_id, p.amount, p.status, p.payment_method, p.created_at
       FROM payment_logs p
       JOIN reservations r ON p.reservation_id = r.id
       WHERE r.tutor_id = ?
       ORDER BY p.created_at DESC`,
      [tutorId]
    );

    // 3️⃣ Historial resumido del tutor (clases por estado)
    const [historial]: any = await db.query(
      `SELECT estado, COUNT(*) AS total
       FROM reservations
       WHERE tutor_id = ?
       GROUP BY estado`,
      [tutorId]
    );

    res.json({
      reservas: reservasFormatted,
      pagos,
      historial,
    });
  } catch (err) {
    console.error("Error en getTutorDashboard:", err);
    res.status(500).json({ error: "Error al obtener dashboard del tutor" });
  }
};
