const Reserva = require('../models/Reserva');

exports.crearReserva = async (req, res) => {
  try {
    const {
      userId,
      cabinas,
      fecha,
      horaInicio,
      horaSalida,
      precio,
      puntosGanados
    } = req.body;

    const nuevaReserva = new Reserva({
      userId,
      cabinas,
      fecha,
      horaInicio,
      horaSalida,
      precio,
      puntosGanados
    });

    await nuevaReserva.save();

    res.status(201).json({ message: 'Reserva creada exitosamente', reserva: nuevaReserva });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear reserva' });
  }
};
