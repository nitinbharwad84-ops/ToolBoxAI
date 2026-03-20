'use client';

import { cn } from '@/lib/utils';
import { Upload, X } from 'lucide-react';
import { useCallback, useState, type DragEvent, type ChangeEvent } from 'react';

interface FileDropzoneProps {
  accept?: string;
  maxSizeMb: number;
  file: File | null;
  onFileChange: (file: File | null) => void;
  disabled?: boolean;
}

export default function FileDropzone({ accept = '.pdf,.xlsx,.xls', maxSizeMb, file, onFileChange, disabled }: FileDropzoneProps) {
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(
    (f: File) => {
      if (f.size > maxSizeMb * 1024 * 1024) return;
      onFileChange(f);
    },
    [maxSizeMb, onFileChange]
  );

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  if (file) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/5 border border-primary/20">
        <Upload className="w-4 h-4 text-primary flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-surface-700 truncate">{file.name}</p>
          <p className="text-xs text-surface-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
        <button onClick={() => onFileChange(null)} className="p-1 rounded hover:bg-surface-200/50" aria-label="Remove file">
          <X className="w-3.5 h-3.5 text-surface-500" />
        </button>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      className={cn(
        'border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer',
        dragOver ? 'border-primary bg-primary/5' : 'border-surface-300/50 hover:border-surface-400/50',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <label className="cursor-pointer space-y-2" aria-label="Upload file">
        <Upload className="w-6 h-6 text-surface-400 mx-auto" />
        <p className="text-sm text-surface-600">
          <span className="text-primary font-medium">Upload</span> or drag & drop
        </p>
        <p className="text-xs text-surface-400">Max {maxSizeMb}MB • PDF & Excel</p>
        <input type="file" accept={accept} className="hidden" onChange={onChange} disabled={disabled} />
      </label>
    </div>
  );
}
