import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  File,
  FileImage,
  FileText,
  FileVideo,
  Music,
  Upload,
  X
} from "lucide-react";

interface FileUploadProps extends React.HTMLAttributes<HTMLDivElement> {
  onChange: (files: File[]) => void;
  value?: File[];
  maxFiles?: number;
  maxSize?: number; // In MB
  accept?: string;
  multiple?: boolean;
  preview?: boolean;
  showFileList?: boolean;
}

export function FileUpload({
  onChange,
  value = [],
  maxFiles = 5,
  maxSize = 10, // 10MB
  accept,
  multiple = true,
  preview = true,
  showFileList = true,
  className,
  ...props
}: FileUploadProps) {
  const [files, setFiles] = React.useState<File[]>(value);
  const [isDragging, setIsDragging] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState<Record<string, number>>({});
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Update files when value changes from parent
  React.useEffect(() => {
    setFiles(value);
  }, [value]);

  // Update parent when files change
  React.useEffect(() => {
    onChange(files);
  }, [files, onChange]);

  const handleDragOver = React.useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = React.useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File is too large. Maximum size is ${maxSize}MB.`;
    }

    // Check file type if accept is specified
    if (accept) {
      const fileType = file.type;
      const acceptTypes = accept.split(",").map(type => type.trim());

      // Handle image/*, video/*, etc.
      const isAccepted = acceptTypes.some(type => {
        if (type.endsWith("/*")) {
          const category = type.split("/")[0];
          return fileType.startsWith(`${category}/`);
        }
        return type === fileType;
      });

      if (!isAccepted) {
        return "File type not accepted.";
      }
    }

    return null;
  };

  const processFiles = (newFiles: FileList | File[]) => {
    if (!multiple && files.length + newFiles.length > 1) {
      setErrors({ general: "Only one file can be uploaded." });
      return;
    }

    if (files.length + newFiles.length > maxFiles) {
      setErrors({ general: `Maximum ${maxFiles} files allowed.` });
      return;
    }

    const fileArray = Array.from(newFiles);
    const newErrors: Record<string, string> = {};
    const validFiles: File[] = [];
    const newProgress: Record<string, number> = { ...uploadProgress };

    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        newErrors[file.name] = error;
      } else {
        validFiles.push(file);
        newProgress[file.name] = 0;

        // Simulate upload progress
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.floor(Math.random() * 10) + 5;
          if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
          }
          setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
        }, 200);
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    }

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
      setUploadProgress(newProgress);
    }
  };

  const handleDrop = React.useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [files.length, maxFiles, multiple]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleBrowseClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      const removedFile = newFiles[index];
      newFiles.splice(index, 1);

      // Clean up progress and errors
      if (removedFile) {
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[removedFile.name];
          return newProgress;
        });

        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[removedFile.name];
          return newErrors;
        });
      }

      return newFiles;
    });
  };

  const getFileIcon = (file: File) => {
    const type = file.type;

    if (type.startsWith("image/")) return <FileImage className="h-5 w-5" />;
    if (type.startsWith("video/")) return <FileVideo className="h-5 w-5" />;
    if (type.startsWith("audio/")) return <Music className="h-5 w-5" />;
    if (type.startsWith("text/") || type.includes("document")) return <FileText className="h-5 w-5" />;

    return <File className="h-5 w-5" />;
  };

  const getPreviewUrl = (file: File) => {
    if (file.type.startsWith("image/")) {
      return URL.createObjectURL(file);
    }
    return null;
  };

  return (
    <div className={cn("space-y-4", className)} {...props}>
      {/* Drag and drop area */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-border bg-muted/40 hover:bg-muted/70",
          "cursor-pointer"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
      >
        <input
          type="file"
          ref={inputRef}
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInputChange}
        />
        <div className="mx-auto flex flex-col items-center justify-center gap-1">
          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm font-medium">
            Drag and drop your files here or click to browse
          </p>
          <p className="text-xs text-muted-foreground">
            {accept
              ? `Accepts: ${accept.split(",").join(", ")}`
              : "Accepts all file types"}
            {" "}(max {maxSize}MB{multiple ? `, up to ${maxFiles} files` : ""})
          </p>
          <Button variant="outline" size="sm" className="mt-4" type="button">
            Browse Files
          </Button>
        </div>
      </div>

      {/* Error messages */}
      {Object.entries(errors).length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800/30 dark:bg-red-900/10 dark:text-red-400">
          <div className="flex gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5" />
            <div className="space-y-1">
              {Object.entries(errors).map(([key, error]) => (
                <p key={key}>{error}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* File list */}
      {showFileList && files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center gap-3 rounded-lg border p-3 text-sm"
            >
              <div className="shrink-0">
                {preview && file.type.startsWith("image/") ? (
                  <div className="h-10 w-10 rounded overflow-hidden bg-muted flex items-center justify-center">
                    <img
                      src={getPreviewUrl(file) || ""}
                      alt={file.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                    {getFileIcon(file)}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="truncate font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                {uploadProgress[file.name] !== undefined && uploadProgress[file.name] < 100 && (
                  <Progress value={uploadProgress[file.name]} className="h-1.5 mt-1" />
                )}
              </div>

              <div className="flex items-center gap-2">
                {uploadProgress[file.name] === 100 ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : errors[file.name] ? (
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                ) : null}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full hover:bg-muted"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Remove file</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
