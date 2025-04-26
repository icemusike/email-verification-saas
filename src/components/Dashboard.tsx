import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import SingleEmailVerifier from './SingleEmailVerifier';
import BulkEmailVerifier from './BulkEmailVerifier';
import { BarChart3, Users, Mail, CheckCircle, XCircle } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('single');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Email Verification Dashboard</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Last updated: Today at 10:45 AM</span>
          <div className="h-2 w-2 rounded-full bg-green-500"></div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-4 flex items-center">
          <div className="rounded-full bg-blue-100 p-3 mr-4">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Verified</p>
            <p className="text-xl font-semibold">12,345</p>
          </div>
        </div>
        <div className="card p-4 flex items-center">
          <div className="rounded-full bg-green-100 p-3 mr-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Valid Emails</p>
            <p className="text-xl font-semibold">10,567</p>
          </div>
        </div>
        <div className="card p-4 flex items-center">
          <div className="rounded-full bg-red-100 p-3 mr-4">
            <XCircle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Invalid Emails</p>
            <p className="text-xl font-semibold">1,778</p>
          </div>
        </div>
        <div className="card p-4 flex items-center">
          <div className="rounded-full bg-purple-100 p-3 mr-4">
            <BarChart3 className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Success Rate</p>
            <p className="text-xl font-semibold">85.6%</p>
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <div className="card overflow-hidden">
          <div className="border-b border-gray-100 px-6 py-4 bg-gray-50 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Email Verification</h2>
            <div className="flex items-center text-sm text-gray-500">
              <Users className="h-4 w-4 mr-1" />
              <span>Unlimited verifications available</span>
            </div>
          </div>
          <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="single">Single Email</TabsTrigger>
                <TabsTrigger value="bulk">Bulk Verification</TabsTrigger>
              </TabsList>
              <TabsContent value="single">
                <SingleEmailVerifier />
              </TabsContent>
              <TabsContent value="bulk">
                <BulkEmailVerifier />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
