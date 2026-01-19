import { X, Camera, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploadPreviewProps {
  capturedImage: string | null;
  onClear: () => void;
  onOpenWebcam: () => void;
  onFileSelect: (file: File) => void;
}

const ImageUploadPreview = ({
  capturedImage,
  onClear,
  onOpenWebcam,
  onFileSelect,
}: ImageUploadPreviewProps) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  if (capturedImage) {
    return (
      <div className="relative">
        <img
          src={capturedImage}
          alt="Preview"
          className="w-full h-40 object-cover rounded-lg border border-border"
        />
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8"
          onClick={onClear}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <Button
        type="button"
        variant="outline"
        className="flex-1 h-24 flex-col gap-2"
        onClick={onOpenWebcam}
      >
        <Camera className="w-6 h-6" />
        <span className="text-xs">Take Photo</span>
      </Button>
      <label className="flex-1">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="h-24 flex flex-col items-center justify-center gap-2 border border-dashed border-border rounded-md cursor-pointer hover:bg-muted/50 transition-colors">
          <Upload className="w-6 h-6 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Upload File</span>
        </div>
      </label>
    </div>
  );
};

export default ImageUploadPreview;
