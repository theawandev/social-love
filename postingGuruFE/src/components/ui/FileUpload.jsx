// src/components/ui/FileUpload.jsx
import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, File, Image, Video } from 'lucide-react';
import { cn } from '@/utils/cn';
import Button from './Button';
import { formatFileSize } from '@/utils/helpers';

const FileUpload = ({
                      onFilesSelect,
                      accept = {
                        'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
                        'video/*': ['.mp4', '.mov', '.avi', '.wmv'],
                      },
                      maxFiles = 10,
                      maxSize = 100 * 1024 * 1024, // 100MB
                      multiple = true,
                      className,
                      disabled = false,
                    }) => {
  const [files, setFiles] = React.useState([]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept,
    maxFiles,
    maxSize,
    multiple,
    disabled,
    onDrop: (acceptedFiles, rejectedFiles) => {
      setFiles(prev => [...prev, ...acceptedFiles]);
      onFilesSelect?.(acceptedFiles);

      if (rejectedFiles.length > 0) {
        console.warn('Rejected files:', rejectedFiles);
      }
    },
  });

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-4 w-4" />;
    } else if (file.type.startsWith('video/')) {
      return <Video className="h-4 w-4" />;
    }
    return <File className="h-4 w-4" />;
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
      >
        <input {...getInputProps()} />
        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {isDragActive
            ? 'Drop files here...'
            : 'Drag & drop files here, or click to select'
          }
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Max {maxFiles} files, {formatFileSize(maxSize)} each
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Selected Files</h4>
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-accent rounded-lg"
            >
              <div className="flex items-center space-x-2">
                {getFileIcon(file)}
                <div>
                  <p className="text-sm font-medium truncate max-w-48">
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
                className="h-8 w-8 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
