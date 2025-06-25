// src/utils/subirInitialData.js
import { getDatabase, ref, set } from "firebase/database";
import { initialData } from "../data/initialData";

export const subirInitialDataAFirebase = () => {
  const db = getDatabase();
  const calendarioRef = ref(db, "calendario");

  set(calendarioRef, initialData.calendario)
    .then(() => {
      console.log("✅ Calendario subido correctamente a Firebase.");
    })
    .catch((error) => {
      console.error("❌ Error al subir el calendario:", error);
    });
};
