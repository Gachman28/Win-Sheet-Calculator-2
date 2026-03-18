export const MAX_FEE = 9200.00;

export const fmtMoney = (num: number | string) => {
  const parsed = typeof num === 'string' ? parseFloat(num) : num;
  return (isNaN(parsed) ? 0 : parsed).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const extractNumber = (str: string | undefined) => {
  if (!str) return 0;
  const match = str.match(/[\d,]+\.?\d*/);
  if (match) return parseFloat(match[0].replace(/,/g, ''));
  return 0;
};

export const calculateT16Gross = (data: Record<string, string>) => {
  const retroMonths = parseInt(data['t16-retro-months']) || 0;
  if (retroMonths <= 0) return 0;

  // Extract income from Section 6
  const ltd = parseFloat(data['perc-ltd']) || 0;
  const va = parseFloat(data['perc-va']) || 0;
  const otherUnearned = extractNumber(data['perc-other-unearned']);
  const earned = extractNumber(data['inc-earned']);
  const spouse = extractNumber(data['inc-spouse']);

  const totalUnearned = ltd + va + otherUnearned + spouse;
  
  // Standard SSI calculation: $20 general exclusion, $65 earned income exclusion
  let remainingGeneralExclusion = 20;
  let countableUnearned = totalUnearned - remainingGeneralExclusion;
  if (countableUnearned < 0) {
    remainingGeneralExclusion = Math.abs(countableUnearned);
    countableUnearned = 0;
  } else {
    remainingGeneralExclusion = 0;
  }

  let countableEarned = earned - remainingGeneralExclusion - 65;
  if (countableEarned < 0) countableEarned = 0;
  countableEarned = countableEarned / 2;

  const totalCountableIncome = countableUnearned + countableEarned;

  // Use a default FBR if not specified (using 2025 FBR as default)
  const fbr = parseFloat(data['t16-fbr']) || 967;
  
  const monthlySSI = Math.max(0, fbr - totalCountableIncome);
  return monthlySSI * retroMonths;
};

export const calculatePC = (ssn: string) => {
  const cleanSSN = ssn.replace(/\D/g, '');
  if (cleanSSN.length >= 3) {
    const prefix = parseInt(cleanSSN.substring(0, 3), 10);
    if (prefix >= 1 && prefix <= 134) return 'PC1 (Northeastern - Jamaica, NY)';
    if (prefix >= 135 && prefix <= 222) return 'PC2 (Mid-Atlantic - Philadelphia, PA)';
    if ((prefix >= 223 && prefix <= 267) || (prefix >= 400 && prefix <= 428)) return 'PC3 (Southeastern - Birmingham, AL)';
    if ((prefix >= 268 && prefix <= 302) || (prefix >= 316 && prefix <= 399)) return 'PC4 (Great Lakes - Chicago, IL)';
    if ((prefix >= 429 && prefix <= 504) || (prefix >= 516 && prefix <= 539)) return 'PC5 (Mid-America - Kansas City, MO)';
    if ((prefix >= 505 && prefix <= 515) || (prefix >= 540 && prefix <= 645)) return 'PC6 (Western - Richmond, CA)';
    return 'PC7 (ODO / Baltimore, MD)';
  }
  return '';
};

export const calculateFO = (csz: string) => {
  const zipMatch = csz.match(/\b\d{5}\b/);
  return zipMatch ? `Local FO for ZIP ${zipMatch[0]}` : '';
};
