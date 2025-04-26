import React, { useState } from 'react';
import { Settings, Info } from 'lucide-react';
import { VerificationSettings as SettingsType, defaultVerificationSettings } from '../services/emailVerification';

interface VerificationSettingsProps {
  settings: SettingsType;
  onSettingsChange: (settings: SettingsType) => void;
}

const VerificationSettings: React.FC<VerificationSettingsProps> = ({ 
  settings, 
  onSettingsChange 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = (key: keyof SettingsType) => {
    if (typeof settings[key] === 'boolean') {
      onSettingsChange({
        ...settings,
        [key]: !settings[key]
      });
    }
  };

  const handleConcurrentLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0 && value <= 10) {
      onSettingsChange({
        ...settings,
        concurrentLimit: value
      });
    }
  };

  const resetToDefaults = () => {
    onSettingsChange(defaultVerificationSettings);
  };

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-sm text-gray-600 hover:text-gray-900"
      >
        <Settings className="h-4 w-4 mr-1" />
        Verification Settings
      </button>

      {isOpen && (
        <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-md font-medium">Verification Options</h3>
            <button
              onClick={resetToDefaults}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Reset to Defaults
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="checkSyntax"
                checked={settings.checkSyntax}
                onChange={() => handleToggle('checkSyntax')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="checkSyntax" className="ml-2 text-sm text-gray-700">
                Syntax Check
              </label>
              <div className="ml-1 text-gray-400 cursor-help group relative">
                <Info className="h-3 w-3" />
                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 w-48">
                  Validates the format of the email address
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="checkDomain"
                checked={settings.checkDomain}
                onChange={() => handleToggle('checkDomain')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="checkDomain" className="ml-2 text-sm text-gray-700">
                Domain Check
              </label>
              <div className="ml-1 text-gray-400 cursor-help group relative">
                <Info className="h-3 w-3" />
                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 w-48">
                  Verifies that the domain exists
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="checkMX"
                checked={settings.checkMX}
                onChange={() => handleToggle('checkMX')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="checkMX" className="ml-2 text-sm text-gray-700">
                MX Record Check
              </label>
              <div className="ml-1 text-gray-400 cursor-help group relative">
                <Info className="h-3 w-3" />
                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 w-48">
                  Checks if the domain has mail exchange records
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="checkSMTP"
                checked={settings.checkSMTP}
                onChange={() => handleToggle('checkSMTP')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="checkSMTP" className="ml-2 text-sm text-gray-700">
                SMTP Check
              </label>
              <div className="ml-1 text-gray-400 cursor-help group relative">
                <Info className="h-3 w-3" />
                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 w-48">
                  Verifies if the mail server accepts the email address
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="detectDisposable"
                checked={settings.detectDisposable}
                onChange={() => handleToggle('detectDisposable')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="detectDisposable" className="ml-2 text-sm text-gray-700">
                Detect Disposable Emails
              </label>
              <div className="ml-1 text-gray-400 cursor-help group relative">
                <Info className="h-3 w-3" />
                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 w-48">
                  Identifies temporary or disposable email addresses
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="detectRoleBased"
                checked={settings.detectRoleBased}
                onChange={() => handleToggle('detectRoleBased')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="detectRoleBased" className="ml-2 text-sm text-gray-700">
                Detect Role-Based Emails
              </label>
              <div className="ml-1 text-gray-400 cursor-help group relative">
                <Info className="h-3 w-3" />
                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 w-48">
                  Identifies non-personal email addresses (e.g., info@, support@)
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="detectFree"
                checked={settings.detectFree}
                onChange={() => handleToggle('detectFree')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="detectFree" className="ml-2 text-sm text-gray-700">
                Detect Free Email Providers
              </label>
              <div className="ml-1 text-gray-400 cursor-help group relative">
                <Info className="h-3 w-3" />
                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 w-48">
                  Identifies emails from free providers like Gmail, Yahoo, etc.
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="detectTypos"
                checked={settings.detectTypos}
                onChange={() => handleToggle('detectTypos')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="detectTypos" className="ml-2 text-sm text-gray-700">
                Detect Typos
              </label>
              <div className="ml-1 text-gray-400 cursor-help group relative">
                <Info className="h-3 w-3" />
                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 w-48">
                  Identifies potential typos in email domains
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="suggestCorrections"
                checked={settings.suggestCorrections}
                onChange={() => handleToggle('suggestCorrections')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="suggestCorrections" className="ml-2 text-sm text-gray-700">
                Suggest Corrections
              </label>
              <div className="ml-1 text-gray-400 cursor-help group relative">
                <Info className="h-3 w-3" />
                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 w-48">
                  Provides suggestions for correcting typos
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="concurrentLimit" className="block text-sm text-gray-700 mb-1">
              Concurrent Verification Limit (1-10)
            </label>
            <input
              type="number"
              id="concurrentLimit"
              min="1"
              max="10"
              value={settings.concurrentLimit}
              onChange={handleConcurrentLimitChange}
              className="w-full md:w-24 px-2 py-1 text-sm border border-gray-300 rounded-md"
            />
            <p className="text-xs text-gray-500 mt-1">
              Higher values may improve speed but increase server load
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationSettings;
