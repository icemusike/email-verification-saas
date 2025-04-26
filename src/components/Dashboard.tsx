import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import SingleEmailVerifier from './SingleEmailVerifier';
import BulkEmailVerifier from './BulkEmailVerifier';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('single');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Email Verification Dashboard</h1>
      
      <div className="mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
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
