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
          
          setProgress(Math.floor((stats.processed + 1) / emails.length * 100));
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
    <div className="card p-6">
      <h2 className="text-xl font-semibold mb-4">Bulk Email Verification</h2>
      
      <VerificationSettings 
        settings={settings}
        onSettingsChange={setSettings}
      />
      
      <div className="mb-6">
        <div className="upload-area">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".txt,.csv"
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="bg-blue-50 rounded-full p-3 mx-auto mb-3 w-16 h-16 flex items-center justify-center">
              <Upload className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-sm text-gray-600 font-medium">
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
          <div className="mt-4 flex items-center justify-between bg-gray-50 p-3 rounded-md">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-full p-2 mr-3">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {emails.length} email{emails.length !== 1 ? 's' : ''} loaded
                </p>
                <p className="text-xs text-gray-500">Ready for verification</p>
              </div>
            </div>
            <button
              onClick={clearData}
              className="text-sm text-red-600 hover:text-red-800 flex items-center px-3 py-1 rounded-md hover:bg-red-50 transition-colors duration-200"
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
          className="btn btn-primary flex items-center"
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
              className="btn btn-secondary flex items-center text-sm"
            >
              <Download className="h-4 w-4 mr-1" />
              Export All
            </button>
            <button
              onClick={() => handleExport('valid')}
              className="btn btn-success flex items-center text-sm"
            >
              <Download className="h-4 w-4 mr-1" />
              Export Valid
            </button>
            <button
              onClick={() => handleExport('invalid')}
              className="btn btn-danger flex items-center text-sm"
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
          <div className="progress-bar">
            <div
              className="progress-value bg-blue-600"
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
          <div className="stat-card bg-gray-50">
            <p className="stat-label text-gray-500">Total</p>
            <p className="stat-value">{stats.total}</p>
          </div>
          <div className="stat-card bg-green-50">
            <p className="stat-label text-green-600">Valid</p>
            <p className="stat-value text-green-700">{stats.valid}</p>
          </div>
          <div className="stat-card bg-red-50">
            <p className="stat-label text-red-600">Invalid</p>
            <p className="stat-value text-red-700">{stats.invalid}</p>
          </div>
          <div className="stat-card bg-yellow-50">
            <p className="stat-label text-yellow-600">Disposable</p>
            <p className="stat-value text-yellow-700">{stats.disposable}</p>
          </div>
          <div className="stat-card bg-purple-50">
            <p className="stat-label text-purple-600">Role-Based</p>
            <p className="stat-value text-purple-700">{stats.roleBased}</p>
          </div>
          <div className="stat-card bg-blue-50">
            <p className="stat-label text-blue-600">Free Providers</p>
            <p className="stat-value text-blue-700">{stats.free}</p>
          </div>
          <div className="stat-card bg-orange-50">
            <p className="stat-label text-orange-600">Typos</p>
            <p className="stat-value text-orange-700">{stats.typos}</p>
          </div>
          <div className="stat-card bg-indigo-50">
            <p className="stat-label text-indigo-600">Processed</p>
            <p className="stat-value text-indigo-700">{stats.processed}</p>
          </div>
        </div>
      )}
      
      {results.length > 0 && (
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="table-header rounded-tl-lg">Email</th>
                <th className="table-header">Status</th>
                <th className="table-header">Syntax</th>
                <th className="table-header">Domain</th>
                <th className="table-header">MX</th>
                <th className="table-header">SMTP</th>
                <th className="table-header rounded-tr-lg">Type</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {results.map((result, index) => (
                <tr key={index} className={result.isValid ? 'bg-green-50/30' : 'bg-red-50/30'}>
                  <td className="table-cell font-medium text-gray-900">
                    {result.email}
                    {result.isTypo && result.suggestedCorrection && (
                      <div className="text-xs text-yellow-600">
                        Suggestion: {result.suggestedCorrection}
                      </div>
                    )}
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${result.isValid ? 'badge-success' : 'badge-danger'}`}>
                      {result.isValid ? 'Valid' : 'Invalid'}
                    </span>
                  </td>
                  <td className="table-cell">
                    {result.syntaxValid ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                  </td>
                  <td className="table-cell">
                    {result.domainValid ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                  </td>
                  <td className="table-cell">
                    {result.mxRecordValid ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                  </td>
                  <td className="table-cell">
                    {result.smtpValid ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                  </td>
                  <td className="table-cell">
                    <div className="flex flex-wrap gap-1">
                      {result.isDisposable && (
                        <span className="badge badge-warning">Disposable</span>
                      )}
                      {result.isRoleBased && (
                        <span className="badge badge-purple">Role</span>
                      )}
                      {result.isFree && (
                        <span className="badge badge-info">Free</span>
                      )}
                      {result.isTypo && (
                        <span className="badge badge-orange">Typo</span>
                      )}
                    </div>
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
