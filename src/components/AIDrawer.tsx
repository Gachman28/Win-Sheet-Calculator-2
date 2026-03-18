import React, { useState, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { EXTRACTION_SYSTEM_PROMPT, SECTION_MAP } from '../constants';

interface AIDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onDataExtracted: (data: Record<string, string>) => void;
}

export default function AIDrawer({ isOpen, onClose, onDataExtracted }: AIDrawerProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [stage, setStage] = useState<'idle' | 'read' | 'ai' | 'fill'>('idle');
  const [progress, setProgress] = useState({ pct: 0, msg: '' });
  const [results, setResults] = useState<{ count: number; sections: Record<string, number>; skipped: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev: File[]) => {
        const combined: File[] = [...prev];
        newFiles.forEach((nf: File) => {
          if (!combined.find((f: File) => f.name === nf.name && f.size === nf.size)) {
            combined.push(nf);
          }
        });
        return combined;
      });
      setResults(null);
      setError(null);
      setStage('idle');
    }
  };

  const removeFile = (idx: number) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const clearAll = () => {
    setFiles([]);
    setResults(null);
    setError(null);
    setStage('idle');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = () => reject(new Error('Failed to read file: ' + file.name));
      reader.readAsDataURL(file);
    });
  };

  const getMediaType = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'application/pdf';
    if (ext === 'csv') return 'text/csv';
    if (ext === 'png') return 'image/png';
    if (ext === 'gif') return 'image/gif';
    if (ext === 'webp') return 'image/webp';
    return 'image/jpeg';
  };

  const runExtraction = async () => {
    setIsExtracting(true);
    setResults(null);
    setError(null);
    setStage('read');
    setProgress({ pct: 10, msg: 'Reading uploaded files…' });

    try {
      const parts: any[] = [];

      for (let i = 0; i < files.length; i++) {
        setProgress({ pct: 10 + Math.round((i / files.length) * 20), msg: `Reading file ${i + 1}/${files.length}` });
        const b64 = await fileToBase64(files[i]);
        parts.push({ inlineData: { mimeType: getMediaType(files[i]), data: b64 } });
      }
      parts.push({ text: 'Extract info and return JSON.' });

      setStage('ai');
      setProgress({ pct: 35, msg: 'AI is processing documents and calculating...' });

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("API key is missing. Please make sure your GEMINI_API_KEY is set in the Secrets menu and republish your app.");
      }
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: [{ role: 'user', parts }],
        config: {
          systemInstruction: EXTRACTION_SYSTEM_PROMPT,
          responseMimeType: 'application/json',
          tools: [{ googleSearch: {} }]
        }
      });

      setProgress({ pct: 75, msg: 'Parsing AI response...' });
      const rawText = response.text;
      if (!rawText) throw new Error("No response from Gemini API.");

      let extracted: Record<string, string>;
      try {
        extracted = JSON.parse(rawText.replace(/^```json\s*/i, '').replace(/\s*```\s*$/, '').trim());
      } catch (err) {
        throw new Error('Could not parse JSON.');
      }

      setStage('fill');
      setProgress({ pct: 85, msg: 'Applying data to form...' });

      const sectionCounts: Record<string, number> = {};
      const skipped: string[] = [];
      let totalFilled = 0;
      const validData: Record<string, string> = {};

      for (const [fieldId, value] of Object.entries(extracted)) {
        if (value === null || value === undefined || value === '') continue;
        validData[fieldId] = String(value);
        totalFilled++;
        const section = SECTION_MAP[fieldId] || 'Other Sections';
        sectionCounts[section] = (sectionCounts[section] || 0) + 1;
      }

      onDataExtracted(validData);

      setProgress({ pct: 100, msg: `Done! ${totalFilled} fields populated.` });
      setResults({ count: totalFilled, sections: sectionCounts, skipped });

    } catch (err: any) {
      setError(err.message || 'An error occurred during extraction.');
      setProgress({ pct: 0, msg: 'Failed.' });
    } finally {
      setIsExtracting(false);
    }
  };

  const getDotClass = (s: string) => {
    const stages = ['read', 'ai', 'fill'];
    const currentIdx = stages.indexOf(stage);
    const thisIdx = stages.indexOf(s);
    if (stage === 'idle') return 'w-2 h-2 rounded-full bg-slate-600';
    if (thisIdx < currentIdx || stage === 'fill') return 'w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]';
    if (thisIdx === currentIdx) return 'w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_#818cf8] animate-pulse';
    return 'w-2 h-2 rounded-full bg-slate-600';
  };

  const getLblClass = (s: string) => {
    const stages = ['read', 'ai', 'fill'];
    const currentIdx = stages.indexOf(stage);
    const thisIdx = stages.indexOf(s);
    if (stage === 'idle') return 'text-slate-500';
    if (thisIdx < currentIdx || stage === 'fill') return 'text-emerald-400';
    if (thisIdx === currentIdx) return 'text-indigo-300 font-bold';
    return 'text-slate-500';
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-slate-900/60 z-[99] transition-opacity duration-300 ${isOpen ? 'opacity-100 block' : 'opacity-0 hidden'}`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`fixed top-0 right-0 w-full max-w-md h-full bg-slate-900 text-slate-200 z-[100] flex flex-col shadow-2xl border-l border-slate-700 transition-transform duration-350 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        <div className="bg-slate-800 p-5 flex items-center justify-between border-b border-slate-700 shrink-0">
          <div className="font-bold text-lg flex items-center gap-2 text-indigo-300">
            <span>🤖</span> Gemini AI Extractor
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white bg-slate-700 hover:bg-slate-600 rounded p-1 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          
          <div className="bg-indigo-900/30 border border-indigo-500/30 rounded-md p-4 text-sm text-indigo-200 leading-relaxed">
            <strong>📋 Instructions:</strong> Upload SSA Notices, Decisions, and Fee Agreements for the specific claimant below.
          </div>

          {/* Drop Zone */}
          <div className="border-2 border-dashed border-indigo-500/50 rounded-xl p-8 text-center bg-slate-800/50 relative cursor-pointer hover:bg-slate-800 transition-colors">
            <input 
              type="file" 
              multiple 
              accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.csv" 
              onChange={handleFiles} 
              ref={fileInputRef}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
            />
            <div className="text-4xl mb-2">📂</div>
            <div className="text-sm font-medium text-slate-300"><strong>Click to browse</strong> or drag files here</div>
            <div className="text-xs text-slate-500 mt-2">PDF • PNG • JPG • CSV</div>
          </div>

          {/* File list */}
          <div className="flex flex-col gap-2">
            {files.map((file, idx) => {
              const ext = file.name.split('.').pop()?.toLowerCase();
              let icon = '🖼️';
              if (ext === 'pdf') icon = '📄';
              else if (ext === 'csv') icon = '📊';
              const size = file.size < 1024 * 1024 ? (file.size / 1024).toFixed(0) + ' KB' : (file.size / (1024 * 1024)).toFixed(1) + ' MB';
              return (
                <div key={idx} className="bg-slate-800 border border-slate-700 rounded p-2 flex items-center gap-3 text-sm">
                  <span>{icon}</span>
                  <span className="flex-1 truncate text-indigo-200" title={file.name}>{file.name}</span>
                  <span className="text-slate-500 text-xs">{size}</span>
                  <button onClick={() => removeFile(idx)} className="text-slate-500 hover:text-rose-400">✕</button>
                </div>
              );
            })}
          </div>

          {/* Extract button */}
          <button 
            onClick={runExtraction} 
            disabled={files.length === 0 || isExtracting} 
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            {isExtracting ? 'Extracting...' : '✨ Extract & Fill Document'}
          </button>

          {/* Progress */}
          {stage !== 'idle' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <div className={getDotClass('read')}></div><span className={getLblClass('read')}>Reading</span>
                <div className="w-4 h-[1px] bg-slate-700"></div>
                <div className={getDotClass('ai')}></div><span className={getLblClass('ai')}>AI Analyzing</span>
                <div className="w-4 h-[1px] bg-slate-700"></div>
                <div className={getDotClass('fill')}></div><span className={getLblClass('fill')}>Populating</span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300" style={{ width: `${progress.pct}%` }}></div>
              </div>
              <div className="text-xs text-slate-400">{progress.msg}</div>
            </div>
          )}

          {/* Results */}
          {results && (
            <div>
              <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-4">
                <div className="text-3xl font-extrabold text-emerald-400">{results.count}</div>
                <div className="text-xs text-emerald-200 font-medium mb-3">fields auto-populated</div>
                <div className="flex flex-col gap-1">
                  {Object.entries(results.sections).sort((a, b) => (b[1] as number) - (a[1] as number)).map(([sec, cnt]) => (
                    <div key={sec} className="flex justify-between text-[11px] text-emerald-100 border-b border-emerald-500/20 pb-1">
                      <span>{sec}</span><span className="font-bold">{cnt as number}</span>
                    </div>
                  ))}
                </div>
              </div>
              {results.skipped.length > 0 && (
                <div className="mt-3 bg-slate-800 border-l-2 border-slate-500 p-3 rounded text-xs text-slate-400">
                  <span>Skipped {results.skipped.length} invalid fields: {results.skipped.slice(0, 5).join(', ')}...</span>
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-rose-900/30 border border-rose-500/30 rounded-lg p-4 text-sm text-rose-300">
              <span>⚠️ Error: {error}</span>
            </div>
          )}

          {/* Clear */}
          <button onClick={clearAll} className="mt-auto w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700 rounded-lg text-sm font-medium transition-colors">
            🗑️ Clear Files & Reset
          </button>
        </div>
      </div>
    </>
  );
}
