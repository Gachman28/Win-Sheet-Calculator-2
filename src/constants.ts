export const EXTRACTION_SYSTEM_PROMPT = `You are an expert Social Security Disability (SSD) case processor. Extract information from uploaded documents and return a JSON object mapping form field IDs to their values.

CRITICAL INSTRUCTIONS:
- Respond with ONLY a valid JSON object mapping the exact field IDs to their values. No markdown fences.
- Omit fields if the info is not present — do not guess or use $0.00 defaults.
- DATE FORMAT: YYYY-MM-DD.
- NUMBER FORMAT: Plain numbers only (e.g., 12500.00).

CROSS-REFERENCING OFFICE DIRECTORIES:
You MUST use your web search capabilities to find the correct names, phone, and fax numbers for the Field Office (FO) and Payment Center (PC):
- Field Office (ssa-fo, ssa-fo-phone, ssa-fo-fax): Find the claimant's ZIP code in the case files, then search the web for the local SSA Field Office name, phone, and fax numbers for that ZIP code. For 'ssa-fo', output the actual City and State (e.g., "Lake Mary, FL") or specific office name. DO NOT use generic phrases like "Local FO for ZIP".
- Payment Center (ssa-pc, ssa-pc-phone, ssa-pc-fax): The PC is determined FIRST by age (e.g., Under age 54 or Over age 54), THEN by the claimant's SSN. Search the web for the correct SSA Payment Center name, phone, and fax numbers based on the claimant's age and SSN routing rules. For 'ssa-pc', output the actual name of the Payment Center (e.g., "Southeastern Program Service Center" or "SEPSC"). DO NOT use generic phrases.

CALCULATING BACKPAY FROM PIA & FM (T2):
If the total gross retroactive backpay amounts are not explicitly stated, you MUST calculate them using the Primary Insurance Amount (PIA) and Family Maximum (FM):
1. Claimant base monthly = PIA.
2. Total monthly auxiliary pool = (FM - PIA).
3. Determine payable months from Date of Entitlement (DOE) to Notice date.
4. "t2-gross" = (PIA * payable months).
5. "aux-retro" = ((FM - PIA) * payable months) if there are eligible dependents.

CALCULATING T16 SSI BACKPAY:
If the T16 SSI gross backpay is not explicitly stated, you MUST calculate it:
1. Determine the payable months from the Date of Entitlement (DOE) to the Notice date.
2. "t16-retro-months" = number of payable months.
3. Determine Countable Monthly Income from the PERC / Income & Resources section (e.g., Earned Income, Spouse's Income, LTD, VA Disability, Other Unearned).
4. "t16-gross" = Calculate the total by multiplying the payable months by the applicable Federal Benefit Rate (FBR) for those specific years (e.g., 2024: $943, 2025: $967, 2026: $991), MINUS the Countable Monthly Income for each month.

SELECT FIELD EXACT VALUES:
  "claim-type": "T2 Only" | "T16 Only" | "Concurrent"
  "fee-status": "Approved" | "Denied"
  "fee-petition": "No" | "Yes"
  "perc-marital": "Single" | "Married" | "Separated" | "Divorced" | "Widowed"
  "perc-pah": "No" | "Yes"
  "perc-la-type": "A" | "B" | "C" | "D" | "Transient"

FIELD ID MAP:
"assigned-specialist", "date-assigned", "claim-type", "cl-first", "cl-middle", "cl-last", "cl-ssn", "cl-dob", "cl-phone", "cl-address", "cl-csz", "cl-pob", "cl-mother", "cl-father", "notes-sec1", "ssa-fo", "ssa-fo-phone", "ssa-fo-fax", "ssa-pc", "ssa-pc-phone", "ssa-pc-fax", "office-notes", "notes-sec2", "fee-status", "fee-petition", "time-del", "reason-fee-denied", "date-petition-sent", "date-petition-app", "petition-amount", "notes-sec3", "t2-filing", "t2-aod", "t2-eod", "t2-doe", "t2-dli", "t2-pia", "t2-fm", "t2-gross", "t2-fee-due", "t2-fee-paid", "wc-offset", "windfall-offset", "t2-has-wc", "t2-wc-start", "t2-wc-stop", "t2-wc-monthly", "t2-wc-settlement", "t2-wc-left", "t2-wc-spent", "notes-sec4", "aux-children", "aux-num-children", "aux-retro", "aux-fee-due", "aux-fee-paid", "is-cdr-case", "cdr-cease", "cdr-eod", "cdr-doe", "cdr-retro", "notes-sec5", "perc-marital", "perc-pah", "perc-family-details", "perc-la-type", "perc-expenses-claimant", "res-cash", "res-bank-high", "res-bank-current", "res-vehicles", "res-other", "inc-earned", "inc-spouse", "perc-ltd", "perc-va", "perc-other-unearned", "perc-wc-start", "perc-wc-stop", "perc-wc-monthly", "perc-wc-settlement", "perc-wc-left", "perc-wc-spent", "perc-has-inheritance", "perc-inh-date", "perc-inh-amount", "perc-inh-left", "perc-inh-spent", "notes-sec6", "t16-pfd", "t16-eod", "t16-doe", "t16-retro-months", "t16-gross", "t16-state-repay", "t16-fee-due", "t16-fee-paid", "t16-notes", "notes-sec7"`;

export const SECTION_MAP: Record<string, string> = {
  'claim-type': 'Summary Strip', 'cl-first': 'Claimant PII', 'cl-ssn': 'Claimant PII',
  'ssa-fo-phone': 'SSA Offices', 'ssa-pc-phone': 'SSA Offices', 'fee-status': 'Fee Agreement',
  't2-gross': 'T2 SSDI', 't2-pia': 'T2 SSDI', 't2-fm': 'T2 SSDI', 'perc-marital': 'PERC: Living',
  'res-cash': 'PERC: Income', 't16-gross': 'T16 SSI', 'aux-retro': 'Aux/CDR'
};

export const INITIAL_FORM_DATA: Record<string, string> = {
  'assigned-specialist': '', 'date-assigned': '',
  'claim-type': 'Concurrent',
  'cl-first': '', 'cl-middle': '', 'cl-last': '', 'cl-ssn': '', 'cl-dob': '', 'cl-phone': '', 'cl-address': '', 'cl-csz': '', 'cl-pob': '', 'cl-mother': '', 'cl-father': '', 'notes-sec1': '',
  'ssa-fo': '', 'ssa-fo-phone': '', 'ssa-fo-fax': '', 'ssa-pc': '', 'ssa-pc-phone': '', 'ssa-pc-fax': '', 'office-notes': '', 'notes-sec2': '',
  'fee-status': 'Approved', 'fee-petition': 'No', 'time-del': 'No', 'reason-fee-denied': '', 'date-petition-sent': '', 'date-petition-app': '', 'petition-amount': '', 'notes-sec3': '',
  't2-filing': '', 't2-aod': '', 't2-eod': '', 't2-doe': '', 't2-dli': '', 't2-pia': '', 't2-fm': '', 't2-gross': '0.00', 't2-fee-due': '0.00', 't2-fee-paid': '0.00', 'wc-offset': '0.00', 'windfall-offset': '0.00', 't2-has-wc': 'No', 't2-wc-start': '', 't2-wc-stop': '', 't2-wc-monthly': '0.00', 't2-wc-settlement': '0.00', 't2-wc-left': '0.00', 't2-wc-spent': '', 'notes-sec4': '',
  'aux-children': '', 'aux-num-children': '0', 'aux-retro': '0.00', 'aux-fee-due': '0.00', 'aux-fee-paid': '0.00',
  'is-cdr-case': 'No', 'cdr-cease': '', 'cdr-eod': '', 'cdr-doe': '', 'cdr-retro': '0.00', 'notes-sec5': '',
  'perc-marital': 'Single', 'perc-pah': 'No', 'perc-family-details': '', 'perc-la-type': 'A', 'perc-expenses-claimant': '',
  'res-cash': '0', 'res-bank-high': '0', 'res-bank-current': '0', 'res-vehicles': '', 'res-other': '', 'inc-earned': '', 'inc-spouse': '', 'perc-ltd': '0.00', 'perc-va': '0.00', 'perc-other-unearned': '', 'perc-wc-start': '', 'perc-wc-stop': '', 'perc-wc-monthly': '0.00', 'perc-wc-settlement': '0.00', 'perc-wc-left': '0.00', 'perc-wc-spent': '', 'perc-has-inheritance': 'No', 'perc-inh-date': '', 'perc-inh-amount': '0.00', 'perc-inh-left': '0.00', 'perc-inh-spent': '', 'notes-sec6': '',
  't16-pfd': '', 't16-eod': '', 't16-doe': '', 't16-retro-months': '0', 't16-gross': '0.00', 't16-state-repay': '0.00', 't16-fee-due': '0.00', 't16-fee-paid': '0.00', 't16-notes': '', 'notes-sec7': ''
};
