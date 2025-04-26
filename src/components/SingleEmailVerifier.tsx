import React, { useState } from 'react';
import { Check, X, Loader2, AlertTriangle, Search } from 'lucide-react';
import { EmailVerificationResult, VerificationSettings as VerificationSettingsType } from '../types';
import { verifySingleEmail, defaultVerificationSettings } from '../services/emailVerification';
import VerificationSettings from './VerificationSettings';

const SingleEmailVerifier: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<EmailVerificationResult | null>(null);
  const [settings, setSettings] = useState<VerificationSettingsType>(defaultVerificationSettings);

  const handleVerify = async () => {
    if (!email) return;
    
    setIsVerifying(true);
    try {
      const verificationResult = await verifySingleEmail(email, settings);
      setResult(verificationResult);
    } catch (error) {
      console.error('Error verifying email:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCorrection = (suggestion: string) => {
    setEmail(suggestion);
  };

  return (
    <div className="card p-6">
      <h2 className="text-xl font-semibold mb-4">Single Email Verification</h2>
      
      <VerificationSettings 
        settings={settings}
        onSettingsChange={setSettings}
      />
      
      <div className="flex space-x-2">
        <div className="relative flex-1">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address"
            className="input w-full pl-10"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Search className="h-4 w-4" />
          </div>
        </div>
        <button
          onClick={handleVerify}
          disabled={isVerifying || !email}
          className="btn btn-primary"
        >
          {isVerifying ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            'Verify'
          )}
        </button>
      </div>

      {result && (
        <div className="mt-6 border rounded-lg overflow-hidden shadow-sm">
          <div className={`p-4 ${result.isValid ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className="flex items-center">
              {result.isValid ? (
                <div className="rounded-full bg-green-100 p-1 mr-2">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
              ) : (
                <div className="rounded-full bg-red-100 p-1 mr-2">
                  <X className="h-5 w-5 text-red-600" />
                </div>
              )}
              <span className="text-lg font-medium">
                {result.email} is {result.isValid ? 'valid' : 'invalid'}
              </span>
            </div>
            {result.verificationTime && (
              <div className="text-xs text-gray-500 mt-1">
                Verification completed in {result.verificationTime.toFixed(0)}ms
              </div>
            )}
          </div>
          
          {result.isTypo && result.suggestedCorrection && (
            <div className="p-3 bg-yellow-50 border-t border-yellow-200 flex items-center justify-between">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
                <span className="text-sm">
                  Did you mean <strong>{result.suggestedCorrection}</strong>?
                </span>
              </div>
              <button
                onClick={() => handleCorrection(result.suggestedCorrection!)}
                className="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-2 py-1 rounded transition-colors duration-200"
              >
                Use this instead
              </button>
            </div>
          )}
          
          <div className="p-4 border-t">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Syntax Check</p>
                <p className="flex items-center mt-1">
                  {result.syntaxValid ? (
                    <Check className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <X className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  {result.syntaxValid ? 'Valid' : 'Invalid'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Domain Check</p>
                <p className="flex items-center mt-1">
                  {result.domainValid ? (
                    <Check className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <X className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  {result.domainValid ? 'Valid' : 'Invalid'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">MX Record</p>
                <p className="flex items-center mt-1">
                  {result.mxRecordValid ? (
                    <Check className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <X className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  {result.mxRecordValid ? 'Valid' : 'Invalid'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">SMTP Check</p>
                <p className="flex items-center mt-1">
                  {result.smtpValid ? (
                    <Check className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <X className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  {result.smtpValid ? 'Valid' : 'Invalid'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Disposable Email</p>
                <p className="flex items-center mt-1">
                  {result.isDisposable ? (
                    <X className="h-4 w-4 text-red-500 mr-1" />
                  ) : (
                    <Check className="h-4 w-4 text-green-500 mr-1" />
                  )}
                  {result.isDisposable ? 'Yes' : 'No'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Role-Based Email</p>
                <p className="flex items-center mt-1">
                  {result.isRoleBased ? (
                    <X className="h-4 w-4 text-red-500 mr-1" />
                  ) : (
                    <Check className="h-4 w-4 text-green-500 mr-1" />
                  )}
                  {result.isRoleBased ? 'Yes' : 'No'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Free Email Provider</p>
                <p className="flex items-center mt-1">
                  {result.isFree ? (
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mr-1" />
                  ) : (
                    <Check className="h-4 w-4 text-green-500 mr-1" />
                  )}
                  {result.isFree ? 'Yes' : 'No'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Typo Detection</p>
                <p className="flex items-center mt-1">
                  {result.isTypo ? (
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mr-1" />
                  ) : (
                    <Check className="h-4 w-4 text-green-500 mr-1" />
                  )}
                  {result.isTypo ? 'Possible typo' : 'No typos'}
                </p>
              </div>
            </div>
            {result.details && (
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-500 mb-1">Details</p>
                <p className="text-sm">{result.details}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleEmailVerifier;
