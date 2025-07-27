import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, File, Image, FileText, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number; // in MB
  disabled?: boolean;
  multiple?: boolean;
  className?: string;
  children?: React.ReactNode;
  "data-testid"?: string;
}

export function FileUpload({
  onFileSelect,
  accept = "*/*",
  maxSize = 10,
  disabled = false,
  multiple = false,
  className,
  children,
  "data-testid": testId,
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (maxSize && file.size > maxSize * 1024 * 1024) {
      return `Datei ist zu groß. Maximal ${maxSize}MB erlaubt.`;
    }
    
    if (accept !== "*/*") {
      const acceptedTypes = accept.split(",").map(type => type.trim());
      const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
      const mimeType = file.type;
      
      const isValidType = acceptedTypes.some(acceptedType => {
        if (acceptedType.startsWith(".")) {
          return fileExtension === acceptedType;
        }
        return mimeType.match(acceptedType.replace("*", ".*"));
      });
      
      if (!isValidType) {
        return `Dateityp nicht unterstützt. Erlaubt: ${accept}`;
      }
    }
    
    return null;
  };

  const handleFiles = async (files: FileList) => {
    setError(null);
    
    if (files.length === 0) return;
    
    const file = files[0]; // For now, handle single file
    const validationError = validateFile(file);
    
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setIsUploading(true);
    try {
      await onFileSelect(file);
    } catch (err) {
      setError("Fehler beim Hochladen der Datei.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    handleFiles(files);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFiles(files);
    }
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension || "")) {
      return <Image className="w-8 h-8 text-swiss-blue" />;
    }
    
    if (["pdf", "doc", "docx", "txt"].includes(extension || "")) {
      return <FileText className="w-8 h-8 text-swiss-blue" />;
    }
    
    return <File className="w-8 h-8 text-swiss-blue" />;
  };

  return (
    <div className={cn("w-full", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
        data-testid={testId ? `${testId}-input` : undefined}
      />
      
      <Card
        className={cn(
          "file-upload-area border-2 border-dashed transition-all cursor-pointer",
          isDragOver && "dragover border-swiss-blue bg-blue-50",
          disabled && "opacity-50 cursor-not-allowed",
          error && "border-red-300 bg-red-50"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        data-testid={testId}
      >
        <CardContent className="p-8 text-center">
          {isUploading ? (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="w-12 h-12 text-swiss-blue animate-spin" />
              <div>
                <div className="font-medium text-slate-900">Wird hochgeladen...</div>
                <div className="text-sm text-slate-600">Bitte warten Sie</div>
              </div>
            </div>
          ) : children ? (
            children
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
                <Upload className="w-8 h-8 text-swiss-blue" />
              </div>
              <div>
                <div className="font-medium text-slate-900 mb-1">
                  Datei hochladen
                </div>
                <div className="text-sm text-slate-600">
                  Klicken oder ziehen Sie eine Datei hierher
                </div>
              </div>
              <div className="text-xs text-slate-500">
                {accept !== "*/*" && `Erlaubte Formate: ${accept}`}
                {maxSize && ` • Max. ${maxSize}MB`}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {error && (
        <div className="mt-2 text-sm text-red-600 flex items-center space-x-1">
          <X className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
