import React, { useState } from 'react';
import { Check, X, Loader2, AlertTriangle } from 'lucide-react';
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
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Single Email Verification</h2>
      
      <VerificationSettings 
        settings={settings}
        onSettingsChange={setSettings}
      />
      
      <div className="flex space-x-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email address"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleVerify}
          disabled={isVerifying || !email}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isVerifying ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            'Verify'
          )}
        </button>
      </div>

      {result && (
        <div className="mt-6 border rounded-md overflow-hidden">
          <div className={`p-4 ${result.isValid ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className="flex items-center">
              {result.isValid ? (
                <Check className="h-5 w-5 text-green-500 mr-2" />
              ) : (
                <X className="h-5 w-5 text-red-500 mr-2" />
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
                className="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-2 py-1 rounded"
              >
                Use this instead
              </button>
            </div>
          )}
          
          <div className="p-4 border-t">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Syntax Check</p>
                <p className="flex items-center">
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
                <p className="flex items-center">
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
                <p className="flex items-center">
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
                <p className="flex items-center">
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
                <p className="flex items-center">
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
                <p className="flex items-center">
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
                <p className="flex items-center">
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
                <p className="flex items-center">
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
              <div className="mt-4">
                <p className="text-sm text-gray-500">Details</p>
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
