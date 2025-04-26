export interface EmailVerificationResult {
  email: string;
  isValid: boolean;
  syntaxValid: boolean;
  domainValid: boolean;
  mxRecordValid: boolean;
  smtpValid: boolean;
  isDisposable: boolean;
  isRoleBased: boolean;
  isFree: boolean;
  isTypo: boolean;
  suggestedCorrection?: string;
  details?: string;
  verificationTime?: number;
}

export interface VerificationStats {
  total: number;
  valid: number;
  invalid: number;
  disposable: number;
  roleBased: number;
  free: number;
  typos: number;
  processed: number;
  averageVerificationTime: number;
}

export type ExportType = 'all' | 'valid' | 'invalid' | 'custom';

export interface VerificationSettings {
  checkSyntax: boolean;
  checkDomain: boolean;
  checkMX: boolean;
  checkSMTP: boolean;
  detectDisposable: boolean;
  detectRoleBased: boolean;
  detectFree: boolean;
  detectTypos: boolean;
  suggestCorrections: boolean;
  concurrentLimit: number;
}

export interface VerificationHistory {
  id: string;
  date: Date;
  totalEmails: number;
  validEmails: number;
  invalidEmails: number;
  disposableEmails: number;
  roleBasedEmails: number;
  freeEmails: number;
  typoEmails: number;
  fileName?: string;
}
