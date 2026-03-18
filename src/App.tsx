import React, { useState, useEffect, useRef } from 'react';
import domtoimage from 'dom-to-image';
import { jsPDF } from 'jspdf';
import AIDrawer from './components/AIDrawer';
import { ClaimantInfo, SSAOffice, FeeAgreement, T2Details, PERCCombined, T16Computations, AuxCDR } from './components/Sections';
import { INITIAL_FORM_DATA } from './constants';
import { MAX_FEE, fmtMoney, calculatePC, calculateFO, calculateT16Gross } from './utils';

export default function App() {
  const [data, setData] = useState<Record<string, string>>(INITIAL_FORM_DATA);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [caseId, setCaseId] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let id = params.get('id');
    
    if (!id) {
      id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
      window.history.replaceState(null, '', `?id=${id}`);
    }
    
    setCaseId(id);

    const saved = localStorage.getItem(`pdbws_saved_case_${id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && Object.keys(parsed).length > 0) {
          setData(parsed);
        }
      } catch (e) {
        console.error('Failed to parse saved case data');
      }
    }
  }, []);

  // Save to localStorage on data change
  useEffect(() => {
    if (caseId) {
      localStorage.setItem(`pdbws_saved_case_${caseId}`, JSON.stringify(data));
    }
  }, [data, caseId]);

  // Derived state
  const claimantName = `${data['cl-first']} ${data['cl-last']}`.trim() || 'N/A';
  const ssnDisplay = data['cl-ssn'] || '***-**-****';
  
  const t2Gross = parseFloat(data['t2-gross']) || 0;
  const t16Gross = parseFloat(data['t16-gross']) || 0;
  const auxRetro = parseFloat(data['aux-retro']) || 0;
  const cdrRetro = parseFloat(data['cdr-retro']) || 0;
  const t16StateRepay = parseFloat(data['t16-state-repay']) || 0;
  const wcOffset = parseFloat(data['wc-offset']) || 0;
  const windfallOffset = parseFloat(data['windfall-offset']) || 0;

  const t16NetDisplay = '$' + fmtMoney(t16Gross - t16StateRepay);
  const totalNetBackpay = (t2Gross + t16Gross + auxRetro + cdrRetro) - t16StateRepay - wcOffset - windfallOffset;
  const totalRetroForFee = (t2Gross + t16Gross + auxRetro + cdrRetro) - windfallOffset;
  
  let calculatedFee = totalRetroForFee * 0.25;
  if (calculatedFee > MAX_FEE) calculatedFee = MAX_FEE;

  const showFeeFlag = data['fee-status'] === 'Denied' || data['fee-petition'] === 'Yes';
  const showWaiveFlag = data['claim-type'] === 'Concurrent' && t2Gross > 0;

  const calculateProgress = () => {
    let relevantFields: string[] = [
      'assigned-specialist', 'date-assigned', 'claim-type',
      'cl-first', 'cl-middle', 'cl-last', 'cl-ssn', 'cl-dob', 'cl-phone', 'cl-address', 'cl-csz', 'cl-pob', 'cl-mother', 'cl-father',
      'ssa-fo', 'ssa-fo-phone', 'ssa-fo-fax', 'ssa-pc', 'ssa-pc-phone', 'ssa-pc-fax',
      'fee-status'
    ];

    if (data['fee-status'] !== 'Approved') {
      relevantFields.push('fee-petition', 'time-del', 'reason-fee-denied', 'date-petition-sent', 'date-petition-app', 'petition-amount');
    }

    if (data['claim-type'] !== 'T16 Only') {
      relevantFields.push('t2-filing', 't2-aod', 't2-eod', 't2-doe', 't2-dli', 't2-pia', 't2-fm', 't2-gross');
    }

    relevantFields.push('aux-children', 'aux-num-children', 'aux-retro', 'aux-fee-due', 'aux-fee-paid');

    if (data['claim-type'] !== 'T2 Only') {
      relevantFields.push(
        'perc-marital', 'perc-pah', 'perc-family-details', 'perc-la-type', 'perc-expenses-claimant',
        'res-cash', 'res-bank-high', 'res-bank-current', 'res-vehicles', 'res-other',
        'inc-earned', 'inc-spouse', 'perc-ltd', 'perc-va', 'perc-other-unearned'
      );
      if (data['perc-has-inheritance'] === 'Yes') {
        relevantFields.push('perc-inh-date', 'perc-inh-amount', 'perc-inh-left', 'perc-inh-spent');
      }

      relevantFields.push('t16-pfd', 't16-eod', 't16-doe', 't16-retro-months', 't16-gross', 't16-state-repay', 't16-fee-due', 't16-fee-paid');
    }

    let filledCount = 0;
    relevantFields.forEach(field => {
      const val = data[field];
      if (val !== undefined && val !== null && val.toString().trim() !== '' && val !== '0.00' && val !== '0') {
        filledCount++;
      }
    });

    if (relevantFields.length === 0) return 0;
    return Math.round((filledCount / relevantFields.length) * 100);
  };

  const progress = calculateProgress();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setData(prev => {
      const newData = { ...prev, [id]: value };
      const today = new Date();
      
      // Auto-fill logic
      if (id === 'cl-ssn') {
        newData['ssa-pc'] = calculatePC(value);
      }
      if (id === 'cl-csz') {
        newData['ssa-fo'] = calculateFO(value);
      }
      
      // T16 Auto-calc
      if (id === 't16-retro-months') {
        const months = parseInt(value) || 0;
        newData['t16-gross'] = months > 0 ? (months * 991).toFixed(2) : '0.00';
      }
      if (id === 't16-doe') {
        const doe = new Date(value);
        if (!isNaN(doe.getTime())) {
          const months = (today.getFullYear() - doe.getFullYear()) * 12 + (today.getMonth() - doe.getMonth());
          if (months > 0) {
            newData['t16-retro-months'] = months.toString();
            newData['t16-gross'] = (months * 991).toFixed(2);
          }
        }
      }

      // T2 Auto-calc
      if (id === 't2-eod') {
        const eod = new Date(value);
        if (!isNaN(eod.getTime())) {
          eod.setMonth(eod.getMonth() + 5);
          const doeStr = eod.toISOString().split('T')[0];
          newData['t2-doe'] = doeStr;
          
          const pia = parseFloat(newData['t2-pia']) || 0;
          const months = (today.getFullYear() - eod.getFullYear()) * 12 + (today.getMonth() - eod.getMonth());
          if (months > 0 && pia > 0) {
            newData['t2-gross'] = (months * pia).toFixed(2);
          }
        }
      }
      if (id === 't2-doe' || id === 't2-pia') {
         const doeStr = id === 't2-doe' ? value : newData['t2-doe'];
         const piaStr = id === 't2-pia' ? value : newData['t2-pia'];
         if (doeStr && piaStr) {
           const doe = new Date(doeStr);
           if (!isNaN(doe.getTime())) {
             const months = (today.getFullYear() - doe.getFullYear()) * 12 + (today.getMonth() - doe.getMonth());
             const pia = parseFloat(piaStr) || 0;
             if (months > 0 && pia > 0) {
               newData['t2-gross'] = (months * pia).toFixed(2);
             }
           }
         }
      }

      return newData;
    });
  };

  const handleDataExtracted = (extractedData: Record<string, string>) => {
    setData(prev => {
      const newData = { ...prev, ...extractedData };
      if (extractedData['cl-ssn']) newData['ssa-pc'] = calculatePC(extractedData['cl-ssn']);
      if (extractedData['cl-csz']) newData['ssa-fo'] = calculateFO(extractedData['cl-csz']);
      return newData;
    });
  };

  const handleSaveHTML = () => {
    const lastName = data['cl-last']?.trim() || 'Claimant';
    const element = document.getElementById('printable-content');
    if (!element) return;

    const clone = element.cloneNode(true) as HTMLElement;
    
    const originalInputs = element.querySelectorAll('input, select, textarea');
    const clonedInputs = clone.querySelectorAll('input, select, textarea');
    
    originalInputs.forEach((input: any, index) => {
      const clonedInput = clonedInputs[index] as any;
      if (clonedInput) {
        if (input.tagName === 'SELECT') {
          const options = clonedInput.querySelectorAll('option');
          options.forEach((opt: any) => {
            if (opt.value === input.value) opt.setAttribute('selected', 'selected');
          });
        } else if (input.tagName === 'TEXTAREA') {
          clonedInput.textContent = input.value;
        } else {
          clonedInput.setAttribute('value', input.value);
          if (input.type === 'checkbox' || input.type === 'radio') {
            if (input.checked) clonedInput.setAttribute('checked', 'checked');
          }
        }
        clonedInput.setAttribute('readonly', 'readonly');
        clonedInput.setAttribute('disabled', 'disabled');
      }
    });

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Post Decision Backpay Win Sheet & Calculator - ${lastName}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background-color: #f8fafc; padding: 2rem; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
    input:disabled, select:disabled, textarea:disabled {
      background-color: #f1f5f9;
      color: #0f172a;
      opacity: 1;
      cursor: default;
    }
  </style>
</head>
<body>
  <div class="max-w-7xl mx-auto mb-8 bg-slate-900 text-white p-6 rounded-xl shadow-lg">
    <h1 class="text-2xl font-bold mb-4">Post Decision Backpay Win Sheet & Calculator</h1>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
      <div><span class="text-slate-400 block">Claimant</span><span class="font-bold text-lg">${claimantName}</span></div>
      <div><span class="text-slate-400 block">SSN</span><span class="font-bold text-lg">${ssnDisplay}</span></div>
      <div><span class="text-slate-400 block">Claim Type</span><span class="font-bold text-lg">${data['claim-type'] || 'N/A'}</span></div>
      <div><span class="text-slate-400 block">Est. Net Backpay</span><span class="font-bold text-emerald-400 text-lg">$${fmtMoney(totalNetBackpay)}</span></div>
    </div>
  </div>
  ${clone.outerHTML}
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PDBWS_Master_${lastName}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = async () => {
    const lastName = data['cl-last']?.trim() || 'Claimant';
    const filename = `${lastName}_Win_Sheet.pdf`;
    const element = document.getElementById('printable-content');
    
    if (!element) return;
    
    setIsGeneratingPDF(true);
    
    try {
      // Use dom-to-image to capture the element as a high-quality JPEG
      const dataUrl = await domtoimage.toJpeg(element, { 
        quality: 0.98, 
        bgcolor: '#ffffff',
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        }
      });
      
      // Initialize jsPDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'in',
        format: 'letter'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate image dimensions to fit within the PDF page
      const imgProps = pdf.getImageProperties(dataUrl);
      const margin = 0.3; // 0.3 inch margin
      const availableWidth = pdfWidth - (margin * 2);
      const imgHeight = (imgProps.height * availableWidth) / imgProps.width;
      
      let heightLeft = imgHeight;
      let position = margin;
      
      // Add first page
      pdf.addImage(dataUrl, 'JPEG', margin, position, availableWidth, imgHeight);
      heightLeft -= (pdfHeight - (margin * 2));
      
      // Add subsequent pages if the content is longer than one page
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + margin; // Shift the image up
        pdf.addPage();
        pdf.addImage(dataUrl, 'JPEG', margin, position, availableWidth, imgHeight);
        heightLeft -= (pdfHeight - (margin * 2));
      }
      
      pdf.save(filename);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleAutoCalculate = () => {
    setData(prev => {
      const newData = { ...prev };
      const today = new Date();
      
      // T2 Logic
      if (newData['t2-eod'] && !newData['t2-doe']) {
        const eod = new Date(newData['t2-eod']);
        if (!isNaN(eod.getTime())) {
          eod.setMonth(eod.getMonth() + 5);
          newData['t2-doe'] = eod.toISOString().split('T')[0];
        }
      }
      
      if (newData['t2-doe'] && newData['t2-pia']) {
        const doe = new Date(newData['t2-doe']);
        if (!isNaN(doe.getTime())) {
          const months = (today.getFullYear() - doe.getFullYear()) * 12 + (today.getMonth() - doe.getMonth());
          const pia = parseFloat(newData['t2-pia']) || 0;
          if (months > 0 && pia > 0) {
            newData['t2-gross'] = (months * pia).toFixed(2);
          }
        }
      }

      // T16 Logic
      let t16Months = parseInt(newData['t16-retro-months']) || 0;
      if (newData['t16-doe']) {
        const doe = new Date(newData['t16-doe']);
        if (!isNaN(doe.getTime())) {
          const months = (today.getFullYear() - doe.getFullYear()) * 12 + (today.getMonth() - doe.getMonth());
          if (months > 0) {
            t16Months = months;
            newData['t16-retro-months'] = months.toString();
            
            // Calculate tiered FBR based on the years
            let totalGross = 0;
            let current = new Date(doe);
            for (let i = 0; i < months; i++) {
              const year = current.getFullYear();
              if (year <= 2023) totalGross += 914;
              else if (year === 2024) totalGross += 943;
              else if (year === 2025) totalGross += 967;
              else totalGross += 991; // 2026+
              current.setMonth(current.getMonth() + 1);
            }
            newData['t16-gross'] = totalGross.toFixed(2);
          }
        }
      } else if (t16Months > 0) {
        // Fallback if no DOE but months provided
        newData['t16-gross'] = (t16Months * 991).toFixed(2);
      }

      return newData;
    });
  };

  const handleSaveCase = () => {
    const lastName = data['cl-last']?.trim() || 'Claimant';
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PDBWS_Case_${lastName}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleLoadCase = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const loadedData = JSON.parse(event.target?.result as string);
        setData(loadedData);
      } catch (err) {
        console.error('Invalid case file.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  return (
    <div className="absolute inset-0 flex flex-col text-slate-800 bg-slate-50 font-sans overflow-hidden">
      {/* Header */}
      <header className="shrink-0 bg-slate-900 border-b border-slate-800 text-white z-50 no-print shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center font-bold text-lg">P</div>
            <h1 className="font-bold text-lg tracking-tight">Post Decision Backpay Win Sheet & Calculator</h1>
            <div className="ml-4 flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
              <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
              </div>
              <span className="text-xs font-bold text-emerald-400">{progress}%</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium">
            <button onClick={() => setIsClearModalOpen(true)} className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 px-4 py-2 rounded-md transition-colors text-white shadow-sm">
              <span>🗑️</span> New Case
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-md transition-colors text-white">
              <span>📂</span> Load Case
            </button>
            <input type="file" accept=".json" ref={fileInputRef} onChange={handleLoadCase} className="hidden" />
            <button onClick={handleSaveCase} className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-md transition-colors text-white">
              <span>💾</span> Save Case
            </button>
            <button onClick={() => setIsDrawerOpen(true)} className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 px-4 py-2 rounded-md shadow-lg transition-all transform hover:scale-105">
              <span>✨</span> AI Data Extraction
            </button>
            <button onClick={handleAutoCalculate} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 px-4 py-2 rounded-md transition-colors text-slate-900 font-semibold">
              <span>🧮</span> Auto-Calculate
            </button>
            <button onClick={handleSaveHTML} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-md transition-colors">
              <span>📄</span> Save as HTML
            </button>
            <button onClick={handlePrint} disabled={isGeneratingPDF} className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <span>🖨️</span> {isGeneratingPDF ? 'Generating PDF...' : 'Save as PDF'}
            </button>
          </div>
        </div>
        
        {/* Summary Strip */}
        <div className="bg-slate-800 px-4 py-2 border-t border-slate-700 text-sm shadow-md">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-x-6 gap-y-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Assigned Specialist:</span>
              <input type="text" id="assigned-specialist" value={data['assigned-specialist']} onChange={handleChange} placeholder="Name" className="bg-slate-700 border-slate-600 text-white rounded px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-indigo-500 w-32" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Date Assigned:</span>
              <input type="date" id="date-assigned" value={data['date-assigned']} onChange={handleChange} className="bg-slate-700 border-slate-600 text-white rounded px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-x-6 gap-y-2">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Claimant:</span>
              <span className="font-bold text-white">{claimantName}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">SSN:</span>
              <span className="font-bold text-white">{ssnDisplay}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Claim Type:</span>
              <select id="claim-type" value={data['claim-type']} onChange={handleChange} className="bg-slate-700 border-slate-600 text-white rounded px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="T2 Only">T2 Only (SSDI)</option>
                <option value="T16 Only">T16 Only (SSI)</option>
                <option value="Concurrent">Concurrent (T2 & T16)</option>
              </select>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-slate-400">Est. Net Backpay:</span>
              <span className="font-bold text-emerald-400 text-base">${fmtMoney(totalNetBackpay)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Est. Fee:</span>
              <span className="font-bold text-rose-400 text-base">${fmtMoney(calculatedFee)}</span>
            </div>
          </div>
          
          {/* Dynamic Flags */}
          {(showFeeFlag || showWaiveFlag) && (
            <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-slate-700 flex flex-wrap gap-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Active Flags:</span>
              {showFeeFlag && <span className="bg-rose-900/50 text-rose-200 border border-rose-500/30 px-2 py-0.5 rounded text-xs font-bold">Fee Petition Needed</span>}
              {showWaiveFlag && <span className="bg-amber-900/50 text-amber-200 border border-amber-500/30 px-2 py-0.5 rounded text-xs font-bold">Review SSI Waiver</span>}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <div id="printable-content" className="max-w-7xl mx-auto bg-slate-50 p-2">
          <ClaimantInfo data={data} handleChange={handleChange} />
          <SSAOffice data={data} handleChange={handleChange} />
          <FeeAgreement data={data} handleChange={handleChange} />
          {data['claim-type'] !== 'T16 Only' && (
            <T2Details data={data} handleChange={handleChange} />
          )}
          <AuxCDR data={data} handleChange={handleChange} />
          {data['claim-type'] !== 'T2 Only' && (
            <>
              <PERCCombined data={data} handleChange={handleChange} />
              <T16Computations 
                data={data} 
                handleChange={handleChange} 
                t16NetDisplay={t16NetDisplay} 
                onAutoCalc={() => {
                  const gross = calculateT16Gross(data);
                  setData(prev => ({ ...prev, 't16-gross': gross.toFixed(2) }));
                }}
              />
            </>
          )}

          {/* Result Banner */}
          <div className="bg-indigo-100 border-2 border-indigo-500 rounded-lg p-6 text-center shadow-sm mb-12">
            <h2 className="text-xl font-bold text-indigo-900">Total Authorized Rep Fee (Calculated)</h2>
            <div className="text-3xl font-extrabold text-indigo-700 mt-2">${fmtMoney(calculatedFee)}</div>
          </div>
        </div>
      </main>

      <AIDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        onDataExtracted={handleDataExtracted} 
      />

      {/* Clear Data Modal */}
      {isClearModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Start New Case?</h2>
            <p className="text-slate-600 mb-6">Are you sure you want to clear all form data? This action cannot be undone unless you have saved the case to a file.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsClearModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md transition-colors font-medium">Cancel</button>
              <button onClick={() => { 
                const newId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
                window.history.pushState(null, '', `?id=${newId}`);
                setCaseId(newId);
                setData(INITIAL_FORM_DATA); 
                setIsClearModalOpen(false); 
              }} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-md transition-colors font-medium">Clear Data</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
