import React, { useState } from 'react';
import { MessageCircle, FileText, FileCode, X, ArrowLeft, Loader2, Link as LinkIcon } from 'lucide-react';
import axios from 'axios';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (content: string) => void;
}

type Step = 'select' | 'input';

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImport }) => {
  const [step, setStep] = useState<Step>('select');
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleWeChatImport = async () => {
    // 1. Client-side strict sanitization
    const trimmedUrl = url.trim().replace(/\s/g, '');
    
    if (!trimmedUrl) {
        setError('Please enter a URL');
        return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      // 2. Send request
      const { data } = await axios.post('/api/parse-wechat', { url: trimmedUrl });
      
      const importedMarkdown = `
# ${data.title}

${data.content}
`;
      onImport(importedMarkdown);
      onClose();
      // Reset state
      setStep('select');
      setUrl('');
    } catch (err: any) {
      console.error("Import Error:", err);
      
      // 3. Robust Error Extraction
      let msg = 'Failed to import.';
      
      if (err.response?.data?.error) {
        // Server provided a specific error message
        msg = err.response.data.error;
      } else if (err.message === "Failed to construct 'URL': Invalid URL") {
        // Catch specific client-side URL construction errors
        msg = "Browser Error: The URL format is invalid.";
      } else if (err.message) {
         msg = err.message;
      }

      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="bg-white rounded-2xl shadow-2xl w-[640px] max-w-full overflow-hidden relative z-10 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
             {step === 'input' && (
                <button 
                  onClick={() => setStep('select')} 
                  className="p-1 hover:bg-neutral-100 rounded-full transition-colors"
                >
                  <ArrowLeft size={20} className="text-slate-500" />
                </button>
             )}
             <h2 className="text-lg font-semibold text-slate-800">
               {step === 'select' ? 'Import Content' : 'Import from WeChat'}
             </h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
          >
            <X size={20} className="text-slate-400 hover:text-slate-600" />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 bg-neutral-50 min-h-[320px]">
           
           {/* Step 1: Source Selection */}
           {step === 'select' && (
             <div className="grid grid-cols-3 gap-4 h-full">
                <button 
                  onClick={() => setStep('input')}
                  className="flex flex-col items-center justify-center gap-4 p-6 bg-white border-2 border-transparent hover:border-green-500 rounded-xl shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <MessageCircle size={32} />
                  </div>
                  <span className="font-semibold text-slate-700">WeChat Article</span>
                </button>

                <div className="flex flex-col items-center justify-center gap-4 p-6 bg-white border border-neutral-200 rounded-xl opacity-60 cursor-not-allowed">
                  <div className="w-16 h-16 bg-neutral-100 text-slate-400 rounded-2xl flex items-center justify-center">
                    <FileText size={32} />
                  </div>
                  <span className="font-medium text-slate-400">Notion (Soon)</span>
                </div>

                <div className="flex flex-col items-center justify-center gap-4 p-6 bg-white border border-neutral-200 rounded-xl opacity-60 cursor-not-allowed">
                  <div className="w-16 h-16 bg-blue-50 text-blue-300 rounded-2xl flex items-center justify-center">
                    <FileCode size={32} />
                  </div>
                  <span className="font-medium text-slate-400">Feishu (Soon)</span>
                </div>
             </div>
           )}

           {/* Step 2: Input URL */}
           {step === 'input' && (
             <div className="flex flex-col gap-6 max-w-md mx-auto mt-4">
                <div className="text-center">
                   <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                     <LinkIcon size={24} />
                   </div>
                   <h3 className="font-medium text-slate-800">Paste Article URL</h3>
                   <p className="text-sm text-slate-500 mt-1">Supports WeChat Official Account Articles</p>
                </div>

                <div className="space-y-4">
                   <input 
                      type="text" 
                      placeholder="https://mp.weixin.qq.com/s/..." 
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm font-mono text-slate-600"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      autoFocus
                   />
                   
                   {error && (
                     <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600 flex items-start gap-2 break-all text-left">
                       <span className="mt-0.5 w-1.5 h-1.5 bg-red-500 rounded-full shrink-0" />
                       <span className="flex-1">{error}</span>
                     </div>
                   )}

                   <button
                     onClick={handleWeChatImport}
                     disabled={isLoading || !url}
                     className="w-full bg-slate-900 text-white font-medium py-3 rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                   >
                     {isLoading ? (
                       <>
                         <Loader2 size={18} className="animate-spin" />
                         <span>Parsing...</span>
                       </>
                     ) : (
                       <span>Start Import</span>
                     )}
                   </button>
                </div>
             </div>
           )}

        </div>
      </div>
    </div>
  );
};