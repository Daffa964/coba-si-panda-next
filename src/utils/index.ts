import QRCode from 'qrcode';

/**
 * Generate a unique QR token for a child
 * @returns A unique token string
 */
export function generateQRToken(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * Generate QR code as data URL
 * @param text - The text to encode in the QR code
 * @returns A promise that resolves to the QR code data URL
 */
export async function generateQRCode(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text);
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Calculate age in months from birth date
 * @param birthDate - The birth date of the child
 * @returns Age in months
 */
export function calculateAgeInMonths(birthDate: Date): number {
  const today = new Date();
  const birth = new Date(birthDate);
  
  let months = (today.getFullYear() - birth.getFullYear()) * 12;
  months += today.getMonth() - birth.getMonth();
  
  // Adjust if the day of the month hasn't occurred yet
  if (today.getDate() < birth.getDate()) {
    months--;
  }
  
  return Math.max(0, months); // Ensure non-negative value
}

/**
 * Classify nutritional status based on Z-scores
 * @param zscoreBbU - Z-score for Weight for Age
 * @param zscoreTbU - Z-score for Height for Age
 * @param zscoreBbTb - Z-score for Weight for Height
 * @returns Nutritional status classification
 */
export function classifyNutritionalStatus(
  zscoreBbU: number | null,
  zscoreTbU: number | null,
  zscoreBbTb: number | null
): string {
  // Check for stunting (low height-for-age)
  if (zscoreTbU !== null && zscoreTbU < -2) {
    if (zscoreTbU < -3) {
      return 'Stunting Berat';
    }
    return 'Stunting';
  }

  // Check for underweight (low weight-for-age)
  if (zscoreBbU !== null && zscoreBbU < -2) {
    if (zscoreBbU < -3) {
      return 'Underweight Berat';
    }
    return 'Underweight';
  }

  // Check for wasted (low weight-for-height)
  if (zscoreBbTb !== null && zscoreBbTb < -2) {
    if (zscoreBbTb < -3) {
      return 'Wasted Berat';
    }
    return 'Wasted';
  }

  // Check for overweight (high weight-for-height)
  if (zscoreBbTb !== null && zscoreBbTb > 2) {
    if (zscoreBbTb > 3) {
      return 'Obese';
    }
    return 'Overweight';
  }

  // If no issues detected
  return 'Normal';
}

/**
 * Calculate Z-score for Weight for Age
 * @param weight - Weight in kg
 * @param ageInMonths - Age in months
 * @returns Z-score for Weight for Age
 */
export function calculateZScoreBbU(weight: number, ageInMonths: number): number | null {
  // This is a simplified calculation - in a real application, 
  // you would use WHO growth standards
  if (ageInMonths <= 0) return null;
  
  // Placeholder calculation - replace with actual WHO standards
  // This is just a simplified example
  const referenceWeight = 3.5 + (0.5 * ageInMonths); // Simplified reference weight
  return (weight - referenceWeight) / (referenceWeight * 0.1); // Simplified standard deviation
}

/**
 * Calculate Z-score for Height for Age
 * @param height - Height in cm
 * @param ageInMonths - Age in months
 * @returns Z-score for Height for Age
 */
export function calculateZScoreTbU(height: number, ageInMonths: number): number | null {
  // This is a simplified calculation - in a real application, 
  // you would use WHO growth standards
  if (ageInMonths <= 0) return null;
  
  // Placeholder calculation - replace with actual WHO standards
  // This is just a simplified example
  const referenceHeight = 50 + (1.5 * ageInMonths); // Simplified reference height
  return (height - referenceHeight) / (referenceHeight * 0.05); // Simplified standard deviation
}

/**
 * Calculate Z-score for Weight for Height
 * @param weight - Weight in kg
 * @param height - Height in cm
 * @returns Z-score for Weight for Height
 */
export function calculateZScoreBbTb(weight: number, height: number): number | null {
  // This is a simplified calculation - in a real application, 
  // you would use WHO growth standards
  if (height <= 0) return null;
  
  // Placeholder calculation - replace with actual WHO standards
  // This is just a simplified example
  const referenceWeight = (height / 100) * (height / 100) * 16; // Simplified BMI-based reference
  return (weight - referenceWeight) / (referenceWeight * 0.1); // Simplified standard deviation
}

/**
 * Format date to Indonesian format (DD/MM/YYYY)
 * @param date - Date to format
 * @returns Formatted date string
 */
export function formatDateToIndonesian(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
}