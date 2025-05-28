// ✅ ModalFoto.jsx — con límites visuales y crop seguro

import React, { useState, useCallback } from "react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Cropper from "react-easy-crop";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { database, storage } from "../firebase";
import { ref as dbRef, update } from "firebase/database";
import getCroppedImg from "../utils/cropImage";

export default function ModalFoto({ open, onClose, usuario, onUploadSuccess }) {
  const [image, setImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [subiendo, setSubiendo] = useState(false);

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleArchivo = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const subirImagen = async () => {
    setSubiendo(true);
    const canvas = await getCroppedImg(image, croppedAreaPixels);
    const urlBase64 = canvas.toDataURL("image/jpeg");
    localStorage.setItem(`fotoPerfil_${usuario.uid}`, urlBase64);

    onUploadSuccess(urlBase64);
    setSubiendo(false);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box className="bg-white rounded-lg p-4 shadow-lg w-full max-w-md mx-auto mt-32 max-h-[90vh] overflow-hidden">
        <h2 className="text-lg font-bold mb-4 text-center">Editar Foto de Perfil</h2>

        {image ? (
          <div className="relative w-full h-[300px] bg-black">
            <Cropper
              image={image}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
        ) : (
          <input type="file" accept="image/*" onChange={handleArchivo} />
        )}

        <div className="flex justify-end mt-4 gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
            Cancelar
          </button>
          {image && (
            <button
              onClick={subirImagen}
              disabled={subiendo}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              {subiendo ? "Subiendo..." : "Guardar"}
            </button>
          )}
        </div>
      </Box>
    </Modal>
  );
}