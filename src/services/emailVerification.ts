import { EmailVerificationResult, VerificationSettings } from '../types';

// Mock data for disposable email domains
const disposableDomains = [
  'mailinator.com',
  'tempmail.com',
  'throwawaymail.com',
  'guerrillamail.com',
  '10minutemail.com',
  'yopmail.com',
  'trashmail.com',
  'sharklasers.com',
  'temp-mail.org',
  'dispostable.com'
];

// Mock data for free email domains
const freeDomains = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'aol.com',
  'icloud.com',
  'protonmail.com',
  'mail.com',
  'zoho.com',
  'gmx.com'
];

// Mock data for role-based email prefixes
const roleBasedPrefixes = [
  'admin',
  'info',
  'support',
  'sales',
  'contact',
  'help',
  'service',
  'billing',
  'marketing',
  'webmaster',
  'postmaster',
  'hostmaster',
  'noreply',
  'no-reply',
  'mail',
  'office',
  'hr'
];

// Common email typos for domain correction
const commonTypos: Record<string, string> = {
  'gmial.com': 'gmail.com',
  'gamil.com': 'gmail.com',
  'gmal.com': 'gmail.com',
  'gmail.co': 'gmail.com',
  'gmail.cm': 'gmail.com',
  'yaho.com': 'yahoo.com',
  'yahooo.com': 'yahoo.com',
  'yahoo.co': 'yahoo.com',
  'hotmial.com': 'hotmail.com',
  'hotmal.com': 'hotmail.com',
  'hotmai.com': 'hotmail.com',
  'outlok.com': 'outlook.com',
  'outloo.com': 'outlook.com',
  'outlook.co': 'outlook.com'
};

// Default verification settings
export const defaultVerificationSettings: VerificationSettings = {
  checkSyntax: true,
  checkDomain: true,
  checkMX: true,
  checkSMTP: true,
  detectDisposable: true,
  detectRoleBased: true,
  detectFree: true,
  detectTypos: true,
  suggestCorrections: true,
  concurrentLimit: 5
};

// Helper function to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Function to validate email syntax
const validateEmailSyntax = (email: string): boolean => {
  // More comprehensive regex for email validation
  const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return emailRegex.test(email);
};

// Function to check if domain is valid (mock implementation)
const validateDomain = async (domain: string): Promise<boolean> => {
  await delay(300); // Simulate network delay
  // In a real implementation, this would check if the domain exists
  // For demo purposes, we'll randomly return true/false with a bias towards true
  return Math.random() < 0.9;
};

// Function to check if MX records exist (mock implementation)
const validateMXRecords = async (domain: string): Promise<boolean> => {
  await delay(400); // Simulate network delay
  // In a real implementation, this would check if MX records exist for the domain
  // For demo purposes, we'll randomly return true/false with a bias towards true
  return Math.random() < 0.85;
};

// Function to check if SMTP server is valid (mock implementation)
const validateSMTP = async (email: string): Promise<boolean> => {
  await delay(500); // Simulate network delay
  // In a real implementation, this would check if the SMTP server accepts the email
  // For demo purposes, we'll randomly return true/false with a bias towards true
  return Math.random() < 0.8;
};

// Function to check if email is disposable
const isDisposableEmail = (email: string): boolean => {
  const domain = email.split('@')[1].toLowerCase();
  return disposableDomains.includes(domain);
};

// Function to check if email is from a free provider
const isFreeEmail = (email: string): boolean => {
  const domain = email.split('@')[1].toLowerCase();
  return freeDomains.includes(domain);
};

// Function to check if email is role-based
const isRoleBasedEmail = (email: string): boolean => {
  const prefix = email.split('@')[0].toLowerCase();
  return roleBasedPrefixes.some(role => prefix === role || prefix.startsWith(role + '.'));
};

// Function to check for typos in email domain and suggest corrections
const checkForTypos = (email: string): { isTypo: boolean; suggestion?: string } => {
  const [localPart, domain] = email.split('@');
  
  if (!domain) {
    return { isTypo: false };
  }
  
  const lowerDomain = domain.toLowerCase();
  
  // Check for common typos
  if (commonTypos[lowerDomain]) {
    return { 
      isTypo: true, 
      suggestion: `${localPart}@${commonTypos[lowerDomain]}` 
    };
  }
  
  // Check for close matches using Levenshtein distance (simplified)
  for (const correctDomain of [...freeDomains, ...disposableDomains]) {
    if (lowerDomain !== correctDomain && isCloseMatch(lowerDomain, correctDomain)) {
      return { 
        isTypo: true, 
        suggestion: `${localPart}@${correctDomain}` 
      };
    }
  }
  
  return { isTypo: false };
};

// Simple implementation of string similarity check
const isCloseMatch = (str1: string, str2: string): boolean => {
  // If length difference is too great, not a close match
  if (Math.abs(str1.length - str2.length) > 2) {
    return false;
  }
  
  // Count differences
  let differences = 0;
  const maxLength = Math.max(str1.length, str2.length);
  
  for (let i = 0; i < maxLength; i++) {
    if (str1[i] !== str2[i]) {
      differences++;
      if (differences > 2) {
        return false;
      }
    }
  }
  
  return true;
};

// Main function to verify a single email
export const verifySingleEmail = async (
  email: string, 
  settings: VerificationSettings = defaultVerificationSettings
): Promise<EmailVerificationResult> => {
  const startTime = performance.now();
  
  // Initialize result
  const result: EmailVerificationResult = {
    email,
    isValid: false,
    syntaxValid: false,
    domainValid: false,
    mxRecordValid: false,
    smtpValid: false,
    isDisposable: false,
    isRoleBased: false,
    isFree: false,
    isTypo: false,
    details: ''
  };
  
  // Step 1: Validate syntax
  if (settings.checkSyntax) {
    result.syntaxValid = validateEmailSyntax(email);
    if (!result.syntaxValid) {
      result.details = 'Invalid email syntax';
      result.verificationTime = performance.now() - startTime;
      return result;
    }
  } else {
    result.syntaxValid = true;
  }

  // Extract domain
  const domain = email.split('@')[1];

  // Step 2: Check for typos
  if (settings.detectTypos) {
    const typoCheck = checkForTypos(email);
    result.isTypo = typoCheck.isTypo;
    if (typoCheck.isTypo && settings.suggestCorrections) {
      result.suggestedCorrection = typoCheck.suggestion;
    }
  }

  // Step 3: Validate domain
  if (settings.checkDomain) {
    result.domainValid = await validateDomain(domain);
    if (!result.domainValid) {
      result.details = 'Domain does not exist';
      result.verificationTime = performance.now() - startTime;
      return result;
    }
  } else {
    result.domainValid = true;
  }

  // Step 4: Validate MX records
  if (settings.checkMX) {
    result.mxRecordValid = await validateMXRecords(domain);
    if (!result.mxRecordValid) {
      result.details = 'No MX records found for domain';
      result.verificationTime = performance.now() - startTime;
      return result;
    }
  } else {
    result.mxRecordValid = true;
  }

  // Step 5: Validate SMTP
  if (settings.checkSMTP) {
    result.smtpValid = await validateSMTP(email);
  } else {
    result.smtpValid = true;
  }

  // Step 6: Check if disposable
  if (settings.detectDisposable) {
    result.isDisposable = isDisposableEmail(email);
  }

  // Step 7: Check if free email
  if (settings.detectFree) {
    result.isFree = isFreeEmail(email);
  }

  // Step 8: Check if role-based
  if (settings.detectRoleBased) {
    result.isRoleBased = isRoleBasedEmail(email);
  }

  // Determine if email is valid overall
  result.isValid = result.syntaxValid && 
                  result.domainValid && 
                  result.mxRecordValid && 
                  result.smtpValid && 
                  !result.isDisposable;

  // Generate details message
  if (!result.smtpValid) {
    result.details = 'SMTP verification failed';
  } else if (result.isDisposable) {
    result.details = 'Email is from a disposable domain';
  } else if (result.isRoleBased) {
    result.details = 'Email appears to be a role-based address';
  } else if (result.isTypo) {
    result.details = `Possible typo detected. Did you mean ${result.suggestedCorrection}?`;
  } else if (result.isFree) {
    result.details = 'Email is from a free provider';
  } else if (result.isValid) {
    result.details = 'Email is valid and deliverable';
  }

  result.verificationTime = performance.now() - startTime;
  return result;
};

// Function to verify multiple emails in bulk
export const verifyBulkEmails = async (
  emails: string[],
  onProgress: (result: EmailVerificationResult) => void,
  settings: VerificationSettings = defaultVerificationSettings
): Promise<void> => {
  const concurrentLimit = settings.concurrentLimit || 5;
  
  // Process emails in batches
  for (let i = 0; i < emails.length; i += concurrentLimit) {
    const batch = emails.slice(i, Math.min(i + concurrentLimit, emails.length));
    
    // Process batch in parallel
    await Promise.all(
      batch.map(async (email) => {
        const result = await verifySingleEmail(email, settings);
        onProgress(result);
      })
    );
  }
};
