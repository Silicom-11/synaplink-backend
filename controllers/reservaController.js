const Reserva = require('../models/Reserva');
const User = require('../models/User'); // Asegúrate de importar el modelo de usuario

exports.crearReserva = async (req, res) => {
  try {
    const {
      username,
      cabinas,
      fecha,
      horaInicio,
      horaSalida,
      precio,
      puntosGanados
    } = req.body;

    // 🔍 Buscar el userId basado en el username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const nuevaReserva = new Reserva({
      userId: user._id, // ✅ usa el ObjectId del usuario
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
