import React from 'react';
import SectionCard from './SectionCard';
import FormInput from './FormInput';

export function ClaimantInfo({ data, handleChange }: { data: any, handleChange: any }) {
  return (
    <SectionCard title="1. Claimant Information (PII)" id="sec-pii">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <FormInput label="First Name" id="cl-first" value={data['cl-first']} onChange={handleChange} />
        <FormInput label="Middle Name" id="cl-middle" value={data['cl-middle']} onChange={handleChange} />
        <FormInput label="Last Name" id="cl-last" value={data['cl-last']} onChange={handleChange} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <FormInput label="SSN" id="cl-ssn" placeholder="XXX-XX-XXXX" value={data['cl-ssn']} onChange={handleChange} />
        <FormInput label="Date of Birth" id="cl-dob" type="date" value={data['cl-dob']} onChange={handleChange} />
        <FormInput label="Phone Number" id="cl-phone" value={data['cl-phone']} onChange={handleChange} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <FormInput label="Street Address" id="cl-address" value={data['cl-address']} onChange={handleChange} />
        <FormInput label="City, State, ZIP" id="cl-csz" placeholder="e.g. Orlando, FL 32801" value={data['cl-csz']} onChange={handleChange} />
      </div>
      <h3 className="text-sm font-bold text-indigo-900 border-b border-slate-200 pb-1 mb-3 uppercase">Verification Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <FormInput label="Place of Birth" id="cl-pob" value={data['cl-pob']} onChange={handleChange} />
        <FormInput label="Mother's First & Maiden Name" id="cl-mother" value={data['cl-mother']} onChange={handleChange} />
        <FormInput label="Father's Name" id="cl-father" value={data['cl-father']} onChange={handleChange} />
      </div>
      <div>
        <FormInput label="Specialist Notes" id="notes-sec1" isTextArea rows={2} value={data['notes-sec1']} onChange={handleChange} />
      </div>
    </SectionCard>
  );
}

export function SSAOffice({ data, handleChange }: { data: any, handleChange: any }) {
  return (
    <SectionCard title="2. SSA Routing & Offices" id="sec-ssa">
      <div className="bg-indigo-50 border-l-4 border-indigo-500 p-3 rounded-r-md text-sm text-indigo-900 mb-5">
        <strong>AI Routing Active:</strong> The AI will automatically search the web to look up the correct FO and PC names, phone, and fax numbers based on the claimant's ZIP, Age, and SSN.
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <FormInput label="SSA Field Office (FO)" hint="Handles Title XVI (SSI)" id="ssa-fo" placeholder="Auto-fills from ZIP" className="bg-slate-50" value={data['ssa-fo']} onChange={handleChange} />
        <FormInput label="FO Phone Number" id="ssa-fo-phone" value={data['ssa-fo-phone']} onChange={handleChange} />
        <FormInput label="FO Fax Number" id="ssa-fo-fax" value={data['ssa-fo-fax']} onChange={handleChange} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <FormInput label="Payment Center (PC)" hint="Handles Title II (SSDI)" id="ssa-pc" placeholder="Auto-fills from SSN" className="bg-slate-50" value={data['ssa-pc']} onChange={handleChange} />
        <FormInput label="PC Phone Number" id="ssa-pc-phone" value={data['ssa-pc-phone']} onChange={handleChange} />
        <FormInput label="PC Fax Number" id="ssa-pc-fax" value={data['ssa-pc-fax']} onChange={handleChange} />
      </div>
      <div className="mb-4">
        <FormInput label="Prior Rep Issues / General Notes" id="office-notes" isTextArea rows={2} value={data['office-notes']} onChange={handleChange} />
      </div>
      <div>
        <FormInput label="Specialist Notes" id="notes-sec2" isTextArea rows={2} value={data['notes-sec2']} onChange={handleChange} />
      </div>
    </SectionCard>
  );
}

export function FeeAgreement({ data, handleChange }: { data: any, handleChange: any }) {
  return (
    <SectionCard title="3. Fee Agreement Status" id="sec-fee">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <FormInput label="Fee Approved or Denied?" id="fee-status" options={[{value: 'Approved', label: 'Approved'}, {value: 'Denied', label: 'Denied'}]} value={data['fee-status']} onChange={handleChange} />
        {data['fee-status'] !== 'Approved' && (
          <>
            <FormInput label="Fee Petition Needed?" id="fee-petition" options={[{value: 'No', label: 'No'}, {value: 'Yes', label: 'Yes'}]} value={data['fee-petition']} onChange={handleChange} />
            <FormInput label="Time Del Completed?" id="time-del" options={[{value: 'No', label: 'No'}, {value: 'Yes', label: 'Yes'}]} value={data['time-del']} onChange={handleChange} />
          </>
        )}
      </div>
      {data['fee-status'] !== 'Approved' && (
        <>
          <div className="mb-4">
            <FormInput label="Why was Fee Denied? (If Applicable)" id="reason-fee-denied" value={data['reason-fee-denied']} onChange={handleChange} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <FormInput label="Date Petition Sent" id="date-petition-sent" type="date" value={data['date-petition-sent']} onChange={handleChange} />
            <FormInput label="Date Petition Approved" id="date-petition-app" type="date" value={data['date-petition-app']} onChange={handleChange} />
            <FormInput label="Petition Amount Approved" id="petition-amount" type="number" step="0.01" value={data['petition-amount']} onChange={handleChange} />
          </div>
        </>
      )}
      <div>
        <FormInput label="Specialist Notes" id="notes-sec3" isTextArea rows={2} value={data['notes-sec3']} onChange={handleChange} />
      </div>
    </SectionCard>
  );
}

export function T2Details({ data, handleChange }: { data: any, handleChange: any }) {
  return (
    <SectionCard title="4. Title II (SSDI) Dates & Computations" id="sec-t2">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <FormInput label="Filing Date" id="t2-filing" type="date" value={data['t2-filing']} onChange={handleChange} />
        <FormInput label="Alleged Onset (AOD)" id="t2-aod" type="date" value={data['t2-aod']} onChange={handleChange} />
        <FormInput label="Established Onset (EOD)" id="t2-eod" type="date" value={data['t2-eod']} onChange={handleChange} />
        <FormInput label="Date of Entitlement (DOE)" hint="EOD + 5 months" id="t2-doe" type="date" value={data['t2-doe']} onChange={handleChange} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <FormInput label="Date Last Insured (DLI)" id="t2-dli" type="date" value={data['t2-dli']} onChange={handleChange} />
        <FormInput label="Primary Ins. Amount (PIA)" id="t2-pia" type="number" step="0.01" className="text-sky-700 font-bold" value={data['t2-pia']} onChange={handleChange} />
        <FormInput label="Family Maximum (FM)" id="t2-fm" type="number" step="0.01" className="text-sky-700 font-bold" value={data['t2-fm']} onChange={handleChange} />
        <FormInput label="Gross T2 Retro" id="t2-gross" type="number" step="0.01" className="font-bold text-emerald-700" value={data['t2-gross']} onChange={handleChange} />
      </div>
      
      <div className="bg-slate-50 p-4 rounded-md border border-slate-200 mb-4">
        <h3 className="text-sm font-bold text-slate-800 mb-3">T2 Fee & Offsets</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <FormInput label="T2 Fee Due" id="t2-fee-due" type="number" step="0.01" className="text-rose-600" value={data['t2-fee-due']} onChange={handleChange} />
          <FormInput label="T2 Fee Paid" id="t2-fee-paid" type="number" step="0.01" value={data['t2-fee-paid']} onChange={handleChange} />
          <FormInput label="Total WC Offset" id="wc-offset" type="number" step="0.01" value={data['wc-offset']} onChange={handleChange} />
          <FormInput label="Windfall Offset" id="windfall-offset" type="number" step="0.01" value={data['windfall-offset']} onChange={handleChange} />
        </div>
      </div>

      <div className="mb-4 mt-6">
        <FormInput label="Did Claimant Receive Worker's Compensation After the Established Onset Date?" id="t2-has-wc" options={[{value: 'No', label: 'No'}, {value: 'Yes', label: 'Yes'}]} value={data['t2-has-wc']} onChange={handleChange} />
      </div>
      {data['t2-has-wc'] === 'Yes' && (
        <>
          <h3 className="text-sm font-bold text-indigo-900 border-b border-slate-200 pb-1 mb-3 uppercase">Workers' Compensation Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <FormInput label="WC Start Date" id="t2-wc-start" type="date" value={data['t2-wc-start']} onChange={handleChange} />
            <FormInput label="WC Stop Date" id="t2-wc-stop" type="date" value={data['t2-wc-stop']} onChange={handleChange} />
            <FormInput label="WC Monthly Amount" id="t2-wc-monthly" type="number" step="0.01" value={data['t2-wc-monthly']} onChange={handleChange} />
            <FormInput label="Settlement Amount" id="t2-wc-settlement" type="number" step="0.01" value={data['t2-wc-settlement']} onChange={handleChange} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <FormInput label="If Settlement: Amount Left" id="t2-wc-left" type="number" step="0.01" value={data['t2-wc-left']} onChange={handleChange} />
            <FormInput label="If Settlement: How Spent?" id="t2-wc-spent" value={data['t2-wc-spent']} onChange={handleChange} />
          </div>
        </>
      )}
      <div>
        <FormInput label="Specialist Notes" id="notes-sec4" isTextArea rows={2} value={data['notes-sec4']} onChange={handleChange} />
      </div>
    </SectionCard>
  );
}

export function PERCCombined({ data, handleChange }: { data: any, handleChange: any }) {
  return (
    <SectionCard title="6. PERC Review: Living Arrangements, Income & Resources" id="sec-perc-combined">
      <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3 rounded-r-md text-sm text-emerald-900 mb-5">
        <strong>Goal:</strong> Determine if claimant receives In-Kind Support and Maintenance (ISM) triggering the 1/3 VTR reduction, check for spouse/parent deeming, and review resource limits ($2,000 Individual / $3,000 Couple).
      </div>
      
      <h3 className="text-sm font-bold text-indigo-900 border-b border-slate-200 pb-1 mb-3 uppercase">Living Arrangements & Household</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <FormInput label="Marital Status" id="perc-marital" options={[
          {value: 'Single', label: 'Single / Never Married'},
          {value: 'Married', label: 'Married (Living Together)'},
          {value: 'Separated', label: 'Married (Separated)'},
          {value: 'Divorced', label: 'Divorced'},
          {value: 'Widowed', label: 'Widowed'}
        ]} value={data['perc-marital']} onChange={handleChange} />
        <FormInput label="Public Assistance Household?" id="perc-pah" options={[{value: 'No', label: 'No'}, {value: 'Yes', label: 'Yes'}]} value={data['perc-pah']} onChange={handleChange} />
      </div>
      <div className="mb-4">
        <FormInput label="Spouse Details (Name, DOB, SSN)" id="perc-family-details" isTextArea rows={2} value={data['perc-family-details']} onChange={handleChange} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <FormInput label="Primary Living Category" id="perc-la-type" options={[
          {value: 'A', label: 'FLA-A (Owns/Rents)'},
          {value: 'B', label: 'FLA-B (Room & Board / Fair Share)'},
          {value: 'C', label: 'FLA-C (Household of another - 1/3 Red.)'},
          {value: 'D', label: 'FLA-D (Institution / Nursing Home)'},
          {value: 'Transient', label: 'Transient / Homeless'}
        ]} value={data['perc-la-type']} onChange={handleChange} />
        <FormInput label="Claimant's Contribution/Mo" id="perc-expenses-claimant" type="number" step="1" value={data['perc-expenses-claimant']} onChange={handleChange} />
      </div>

      <h3 className="text-sm font-bold text-indigo-900 border-b border-slate-200 pb-1 mb-3 uppercase">Resources</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <FormInput label="Cash on Hand" id="res-cash" type="number" step="1" value={data['res-cash']} onChange={handleChange} />
        <FormInput label="Highest Bank Balance" id="res-bank-high" type="number" step="1" className="text-rose-700 font-bold" value={data['res-bank-high']} onChange={handleChange} />
        <FormInput label="Current Bank Balance" id="res-bank-current" type="number" step="1" value={data['res-bank-current']} onChange={handleChange} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <FormInput label="Vehicles Owned (If you own more than 1 provide values)" id="res-vehicles" isTextArea rows={2} value={data['res-vehicles']} onChange={handleChange} />
        <FormInput label="Other Resources (Life Ins, Property owned other than the house where you live)" id="res-other" isTextArea rows={2} value={data['res-other']} onChange={handleChange} />
      </div>
      
      <h3 className="text-sm font-bold text-indigo-900 border-b border-slate-200 pb-1 mb-3 uppercase">Income Received Since Filing</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <FormInput label="Earned Income (Wages)" id="inc-earned" isTextArea rows={2} value={data['inc-earned']} onChange={handleChange} />
        <FormInput label="Spouse's Income (Deeming)" id="inc-spouse" isTextArea rows={2} value={data['inc-spouse']} onChange={handleChange} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <FormInput label="LTD Monthly" id="perc-ltd" type="number" step="0.01" value={data['perc-ltd']} onChange={handleChange} />
        <FormInput label="VA Disability Monthly" id="perc-va" type="number" step="0.01" value={data['perc-va']} onChange={handleChange} />
        <FormInput label="Other Unearned" id="perc-other-unearned" value={data['perc-other-unearned']} onChange={handleChange} />
      </div>

      <div className="mb-4 mt-6">
        <FormInput label="Did You Receive an Inheritance or any other Settlements since the established onset date?" id="perc-has-inheritance" options={[{value: 'No', label: 'No'}, {value: 'Yes', label: 'Yes'}]} value={data['perc-has-inheritance']} onChange={handleChange} />
      </div>
      {data['perc-has-inheritance'] === 'Yes' && (
        <>
          <h3 className="text-sm font-bold text-indigo-900 border-b border-slate-200 pb-1 mb-3 uppercase mt-6">Inheritance / Settlements</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <FormInput label="Date Received" id="perc-inh-date" type="date" value={data['perc-inh-date']} onChange={handleChange} />
            <FormInput label="Total Amount" id="perc-inh-amount" type="number" step="0.01" value={data['perc-inh-amount']} onChange={handleChange} />
            <FormInput label="Amount Left" id="perc-inh-left" type="number" step="0.01" value={data['perc-inh-left']} onChange={handleChange} />
            <FormInput label="Spend Down Details" id="perc-inh-spent" value={data['perc-inh-spent']} onChange={handleChange} />
          </div>
        </>
      )}
      <div>
        <FormInput label="Specialist Notes" id="notes-sec6" isTextArea rows={2} value={data['notes-sec6']} onChange={handleChange} />
      </div>
    </SectionCard>
  );
}

export function T16Computations({ data, handleChange, t16NetDisplay, onAutoCalc }: { data: any, handleChange: any, t16NetDisplay: string, onAutoCalc?: () => void }) {
  return (
    <SectionCard title="7. Title XVI (SSI) Backpay Computations" id="sec-t16-comp">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <FormInput label="Protective Filing (PFD)" id="t16-pfd" type="date" value={data['t16-pfd']} onChange={handleChange} />
        <FormInput label="Established Onset (EOD)" id="t16-eod" type="date" value={data['t16-eod']} onChange={handleChange} />
        <FormInput label="Date of Entitlement (DOE)" id="t16-doe" type="date" value={data['t16-doe']} onChange={handleChange} />
        <FormInput label="Total Months Retro" id="t16-retro-months" type="number" step="1" value={data['t16-retro-months']} onChange={handleChange} />
      </div>
      
      <div className="bg-slate-50 p-4 rounded-md border border-slate-200 mb-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-bold text-slate-800">Calculations</h3>
          {onAutoCalc && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <label htmlFor="t16-fbr" className="text-xs font-bold text-slate-600">Base FBR ($):</label>
                <input 
                  type="number" 
                  id="t16-fbr" 
                  value={data['t16-fbr'] || 967} 
                  onChange={handleChange} 
                  className="w-20 px-2 py-1 text-xs border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
                  title="Federal Benefit Rate (e.g., 943 for 2024, 967 for 2025)"
                />
              </div>
              <button 
                onClick={onAutoCalc}
                className="text-xs bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-bold py-1 px-3 rounded border border-indigo-300 transition-colors"
                title="Calculates Gross SSI using Total Months Retro, deducting income from Section 6"
              >
                Auto-Calculate Gross
              </button>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <FormInput label="Gross SSI Retro" id="t16-gross" type="number" step="0.01" className="font-bold text-emerald-700" value={data['t16-gross']} onChange={handleChange} />
          <FormInput label="Less State/IAR Repay" id="t16-state-repay" type="number" step="0.01" className="text-rose-600" value={data['t16-state-repay']} onChange={handleChange} />
          <FormInput label="Net T16 Display" id="t16-net-display" className="bg-slate-200 font-bold" value={t16NetDisplay} onChange={() => {}} readOnly />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput label="SSI Fee Due" id="t16-fee-due" type="number" step="0.01" className="text-rose-600" value={data['t16-fee-due']} onChange={handleChange} />
          <FormInput label="SSI Fee Paid" id="t16-fee-paid" type="number" step="0.01" value={data['t16-fee-paid']} onChange={handleChange} />
        </div>
      </div>
      <div className="mb-4">
        <FormInput label="Computation Notes (Zero pay months?)" id="t16-notes" isTextArea rows={2} value={data['t16-notes']} onChange={handleChange} />
      </div>
      <div>
        <FormInput label="Specialist Notes" id="notes-sec7" isTextArea rows={2} value={data['notes-sec7']} onChange={handleChange} />
      </div>
    </SectionCard>
  );
}

export function AuxCDR({ data, handleChange }: { data: any, handleChange: any }) {
  return (
    <SectionCard title="5. Auxiliary (T2) & CDR Information" id="sec-aux">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <FormInput label="Children's Details (Names, DOBs, & SSNs)" id="aux-children" isTextArea rows={2} value={data['aux-children']} onChange={handleChange} />
        <FormInput label="Number of Dependents" id="aux-num-children" type="number" min="0" value={data['aux-num-children']} onChange={handleChange} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <FormInput label="Retro Aux Benefits" id="aux-retro" type="number" step="0.01" className="font-bold text-emerald-700" value={data['aux-retro']} onChange={handleChange} />
        <FormInput label="Aux Fee Due" id="aux-fee-due" type="number" step="0.01" className="text-rose-600" value={data['aux-fee-due']} onChange={handleChange} />
        <FormInput label="Aux Fee Paid" id="aux-fee-paid" type="number" step="0.01" value={data['aux-fee-paid']} onChange={handleChange} />
      </div>
      
      <div className="mb-4 mt-6">
        <FormInput label="Is this a CDR Case?" id="is-cdr-case" options={[{value: 'No', label: 'No'}, {value: 'Yes', label: 'Yes'}]} value={data['is-cdr-case']} onChange={handleChange} />
      </div>
      {data['is-cdr-case'] === 'Yes' && (
        <>
          <h3 className="text-sm font-bold text-indigo-900 border-b border-slate-200 pb-1 mb-3 uppercase">CDR Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <FormInput label="CDR Cease Date" id="cdr-cease" type="date" value={data['cdr-cease']} onChange={handleChange} />
            <FormInput label="CDR EOD" id="cdr-eod" type="date" value={data['cdr-eod']} onChange={handleChange} />
            <FormInput label="CDR DOE" id="cdr-doe" type="date" value={data['cdr-doe']} onChange={handleChange} />
            <FormInput label="CDR Retro Due" id="cdr-retro" type="number" step="0.01" className="font-bold text-emerald-700" value={data['cdr-retro']} onChange={handleChange} />
          </div>
        </>
      )}
      <div>
        <FormInput label="Specialist Notes" id="notes-sec5" isTextArea rows={2} value={data['notes-sec5']} onChange={handleChange} />
      </div>
    </SectionCard>
  );
}
