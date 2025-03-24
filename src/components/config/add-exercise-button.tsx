import { useState } from "react";

export default function ExerciseButtons() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleRequest = async (method: string) => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:3000/api/config/exercise",
        {
          method,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        setMessage(
          method === "POST"
            ? "Ejercicios agregados correctamente!"
            : "Ejercicios duplicados eliminados!"
        );
      } else {
        setMessage(data.error || "Error en la operación");
      }
    } catch (error) {
      console.log(error);
      setMessage("Error de conexión");
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <button
        onClick={() => handleRequest("POST")}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
      >
        {loading ? "Procesando..." : "Agregar Ejercicios"}
      </button>
      <button
        onClick={() => handleRequest("DELETE")}
        disabled={loading}
        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 disabled:bg-gray-400"
      >
        {loading ? "Procesando..." : "Eliminar Duplicados"}
      </button>
      {message && <p className="text-sm text-gray-700">{message}</p>}
    </div>
  );
}
