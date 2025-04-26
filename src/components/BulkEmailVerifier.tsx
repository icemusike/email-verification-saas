import React, { useState, useRef } from 'react';
import { Upload, FileText, X, Download, Loader2, Check, AlertTriangle } from 'lucide-react';
import { EmailVerificationResult, VerificationStats, ExportType, VerificationSettings as VerificationSettingsType } from '../types';
import { verifyBulkEmails, defaultVerificationSettings } from '../services/emailVerification';
import VerificationSettings from './VerificationSettings';

const BulkEmailVerifier: React.FC = () => {
  const [emails, setEmails] = useState<string[]>([]);
  const [results, setResults] = useState<EmailVerificationResult[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [settings, setSettings] = useState<VerificationSettingsType>(defaultVerificationSettings);
  const [stats, setStats] = useState<VerificationStats>({
    total: 0,
    valid: 0,
    invalid: 0,
    disposable: 0,
    roleBased: 0,
    free: 0,
    typos: 0,
    processed: 0,
    averageVerificationTime: 0
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      
      // Process the content based on file type
      let emailList: string[] = [];
      
      if (file.name.endsWith('.csv')) {
        // For CSV files, split by lines and take only the first field from each line
        emailList = content
          .split('\n')
          .map(line => {
            // Split the line by comma and take only the first part (email)
            const parts = line.split(',');
            return parts.length > 0 ? parts[0].trim() : '';
          })
          .filter(email => email.length > 0 && email.includes('@')); // Basic validation
      } else {
        // For TXT files or other formats, split by newlines, commas, or semicolons
        emailList = content
          .split(/[\n,;]/)
          .map(email => email.trim())
          .filter(email => email.length > 0 && email.includes('@')); // Basic validation
      }
      
      setEmails(emailList);
      setStats(prev => ({ ...prev, total: emailList.length }));
    };
    reader.readAsText(file);
  };

  const handleVerify = async () => {
    if (emails.length === 0) return;
    
    setIsVerifying(true);
    setProgress(0);
    setResults([]);
    setStats({
      total: emails.length,
      valid: 0,
      invalid: 0,
      disposable: 0,
      roleBased: 0,
      free: 0,
      typos: 0,
      processed: 0,
      averageVerificationTime: 0
    });

    let totalVerificationTime = 0;

    try {
      await verifyBulkEmails(
        emails,
        (result) => {
          setResults(prev => [...prev, result]);
          
          if (result.verificationTime) {
            totalVerificationTime += result.verificationTime;
          }
          
          setStats(prev => {
            const newProcessed = prev.processed + 1;
            return {
              ...prev,
              valid: prev.valid + (result.isValid ? 1 : 0),
              invalid: prev.invalid + (!result.isValid ? 1 : 0),
              disposable: prev.disposable + (result.isDisposable ? 1 : 0),
              roleBased: prev.roleBased + (result.isRoleBased ? 1 : 0),
              free: prev.free + (result.isFree ? 1 : 0),
              typos: prev.typos + (result.isTypo ? 1 : 0),
              processed: newProcessed,
              averageVerificationTime: totalVerificationTime / newProcessed
            };
          });
          
          setProgress(Math.floor((prev.processed + 1) / emails.length * 100));
        },
        settings
      );
    } catch (error) {
      console.error('Error verifying emails:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleExport = (type: ExportType) => {
    let dataToExport: EmailVerificationResult[] = [];
    
    switch (type) {
      case 'all':
        dataToExport = results;
        break;
      case 'valid':
        dataToExport = results.filter(r => r.isValid);
        break;
      case 'invalid':
        dataToExport = results.filter(r => !r.isValid);
        break;
      default:
        dataToExport = results;
    }
    
    const csvContent = [
      'Email,Valid,Syntax,Domain,MX Record,SMTP,Disposable,Role-Based,Free Provider,Typo,Details',
      ...dataToExport.map(r => 
        `${r.email},${r.isValid},${r.syntaxValid},${r.domainValid},${r.mxRecordValid},${r.smtpValid},${r.isDisposable},${r.isRoleBased},${r.isFree},${r.isTypo},"${r.details || ''}"`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `email-verification-${type}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearData = () => {
    setEmails([]);
    setResults([]);
    setProgress(0);
    setStats({
      total: 0,
      valid: 0,
      invalid: 0,
      disposable: 0,
      roleBased: 0,
      free: 0,
      typos: 0,
      processed: 0,
      averageVerificationTime: 0
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Bulk Email Verification</h2>
      
      <VerificationSettings 
        settings={settings}
        onSettingsChange={setSettings}
      />
      
      <div className="mb-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".txt,.csv"
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">
              Drag and drop your file here, or <span className="text-blue-600">browse</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Supported formats: .txt, .csv
            </p>
            <p className="text-xs text-gray-500">
              For CSV files, only the first column (email) will be used
            </p>
          </label>
        </div>
        
        {emails.length > 0 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-gray-500 mr-2" />
              <span className="text-sm text-gray-700">
                {emails.length} email{emails.length !== 1 ? 's' : ''} loaded
              </span>
            </div>
            <button
              onClick={clearData}
              className="text-sm text-red-600 hover:text-red-800 flex items-center"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </button>
          </div>
        )}
      </div>
      
      <div className="flex justify-between mb-6">
        <button
          onClick={handleVerify}
          disabled={isVerifying || emails.length === 0}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
        >
          {isVerifying ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Verifying...
            </>
          ) : (
            'Start Verification'
          )}
        </button>
        
        {results.length > 0 && (
          <div className="flex space-x-2">
            <button
              onClick={() => handleExport('all')}
              className="px-3 py-1 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 text-sm flex items-center"
            >
              <Download className="h-4 w-4 mr-1" />
              Export All
            </button>
            <button
              onClick={() => handleExport('valid')}
              className="px-3 py-1 bg-green-100 text-green-800 rounded-md hover:bg-green-200 text-sm flex items-center"
            >
              <Download className="h-4 w-4 mr-1" />
              Export Valid
            </button>
            <button
              onClick={() => handleExport('invalid')}
              className="px-3 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200 text-sm flex items-center"
            >
              <Download className="h-4 w-4 mr-1" />
              Export Invalid
            </button>
          </div>
        )}
      </div>
      
      {(isVerifying || results.length > 0) && (
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-500">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          {stats.averageVerificationTime > 0 && (
            <div className="text-xs text-gray-500 mt-1 text-right">
              Average verification time: {stats.averageVerificationTime.toFixed(0)}ms per email
            </div>
          )}
        </div>
      )}
      
      {stats.processed > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-lg font-semibold">{stats.total}</p>
          </div>
          <div className="bg-green-50 p-3 rounded-md">
            <p className="text-xs text-green-600">Valid</p>
            <p className="text-lg font-semibold text-green-700">{stats.valid}</p>
          </div>
          <div className="bg-red-50 p-3 rounded-md">
            <p className="text-xs text-red-600">Invalid</p>
            <p className="text-lg font-semibold text-red-700">{stats.invalid}</p>
          </div>
          <div className="bg-yellow-50 p-3 rounded-md">
            <p className="text-xs text-yellow-600">Disposable</p>
            <p className="text-lg font-semibold text-yellow-700">{stats.disposable}</p>
          </div>
          <div className="bg-purple-50 p-3 rounded-md">
            <p className="text-xs text-purple-600">Role-Based</p>
            <p className="text-lg font-semibold text-purple-700">{stats.roleBased}</p>
          </div>
          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-xs text-blue-600">Free Providers</p>
            <p className="text-lg font-semibold text-blue-700">{stats.free}</p>
          </div>
          <div className="bg-orange-50 p-3 rounded-md">
            <p className="text-xs text-orange-600">Typos</p>
            <p className="text-lg font-semibold text-orange-700">{stats.typos}</p>
          </div>
          <div className="bg-indigo-50 p-3 rounded-md">
            <p className="text-xs text-indigo-600">Processed</p>
            <p className="text-lg font-semibold text-indigo-700">{stats.processed}</p>
          </div>
        </div>
      )}
      
      {results.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Syntax
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Domain
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  MX
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SMTP
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {results.map((result, index) => (
                <tr key={index} className={result.isValid ? 'bg-green-50' : 'bg-red-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {result.email}
                    {result.isTypo && result.suggestedCorrection && (
                      <div className="text-xs text-yellow-600">
                        Suggestion: {result.suggestedCorrection}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      result.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {result.isValid ? 'Valid' : 'Invalid'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {result.syntaxValid ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {result.domainValid ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {result.mxRecordValid ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {result.smtpValid ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {result.isDisposable && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 mr-1">
                        Disposable
                      </span>
                    )}
                    {result.isRoleBased && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800 mr-1">
                        Role
                      </span>
                    )}
                    {result.isFree && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 mr-1">
                        Free
                      </span>
                    )}
                    {result.isTypo && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
                        Typo
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BulkEmailVerifier;
