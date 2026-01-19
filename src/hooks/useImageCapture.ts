import { useState, useRef, useCallback } from "react";

export const useImageCapture = () => {
  const [isWebcamOpen, setIsWebcamOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const openWebcam = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      setStream(mediaStream);
      setIsWebcamOpen(true);
      return mediaStream;
    } catch (error) {
      console.error("Error accessing webcam:", error);
      throw error;
    }
  }, []);

  const closeWebcam = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsWebcamOpen(false);
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current) return null;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    setCapturedImage(dataUrl);

    // Convert to file
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], `capture-${Date.now()}.jpg`, {
            type: "image/jpeg",
          });
          setImageFile(file);
        }
      },
      "image/jpeg",
      0.8
    );

    closeWebcam();
    return dataUrl;
  }, [closeWebcam]);

  const handleFileSelect = useCallback((file: File) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setCapturedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const clearImage = useCallback(() => {
    setCapturedImage(null);
    setImageFile(null);
  }, []);

  return {
    isWebcamOpen,
    stream,
    capturedImage,
    imageFile,
    videoRef,
    openWebcam,
    closeWebcam,
    capturePhoto,
    handleFileSelect,
    clearImage,
  };
};
