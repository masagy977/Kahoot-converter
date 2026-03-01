import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, CheckCircle2 } from 'lucide-react';

interface FileUploadProps {
  onFileLoaded: (content: string, fileName: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileLoaded }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      onFileLoaded(text, file.name);
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div 
      className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer group overflow-hidden ${
        isDragging 
          ? 'border-indigo-500 bg-indigo-50/50 ring-4 ring-indigo-500/10' 
          : 'border-slate-200 bg-white hover:border-indigo-400 hover:bg-slate-50 shadow-sm hover:shadow-md'
      }`}
      onClick={() => fileInputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".csv,.txt" 
        className="hidden" 
      />
      
      {/* Background Decoration */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-50 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-50 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity"></div>

      <div className="relative flex flex-col items-center gap-6">
        <div className={`p-6 rounded-2xl transition-all duration-300 ${
          isDragging ? 'bg-indigo-600 text-white scale-110' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100'
        }`}>
          <UploadCloud className="w-10 h-10" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Húzd ide a fájlt</h3>
          <p className="text-slate-500 text-sm max-w-xs mx-auto leading-relaxed">
            Válaszd ki a NotebookLM-ből letöltött <span className="font-bold text-slate-700">.csv</span> vagy <span className="font-bold text-slate-700">.txt</span> fájlt a kezdéshez.
          </p>
        </div>
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Gyors feldolgozás
          </div>
          <div className="w-1 h-1 rounded-full bg-slate-300"></div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <CheckCircle2 className="w-3.5 h-3.5" />
            100% Privát
          </div>
        </div>
      </div>
    </div>
  );
};
