const handleSubmit = async () => {
    setMensaje("");
    setError("");

    // 1. Forzamos un paquete de datos válido para saltarnos el estado del prototipo
    const payload = {
        titulo: "Discusión en el patio trasero",
        descripcion: "Estudiantes de segundo medio se enfrentan verbalmente durante el horario de recreo general.",
        fecha: "27/05/2026 14:30",
        estudiantes: ["Martina Vargas", "Joaquín López"],
        nombre_docente: "Profesora Carla Mendoza — Lenguaje"
    };

    try {
      setLoading(true);

      // 2. Enviamos los datos fijos a tu backend de Python
      const incidenteCreado = await registrarIncidente(payload);

      // 3. Mostramos el éxito con el ID real calculado por tu código Python
      setMensaje(
        `¡Conexión Full-Stack Exitosa! Guardado en Python. Folio generado: ${incidenteCreado.id_i}`
      );

    } catch (err) {
      console.error(err);
      setError("No se pudo registrar el incidente.");
    } finally {
      setLoading(false);
    }
  };