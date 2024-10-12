'use client';

import React from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';

import { GrantForm, RetrieveForm, RevokeForm, StoreForm } from './_components';

const Home = () => {
  return (
    <div className='w-full py-24'>
      <Tabs
        className='mx-auto w-full max-w-xl rounded-3xl'
        defaultValue='grant'
      >
        <TabsList className='w-full'>
          <TabsTrigger className='w-full' value='grant'>
            Grant Fee Allowance
          </TabsTrigger>
          <TabsTrigger className='w-full' value='revoke'>
            Revoke Fee Allowance
          </TabsTrigger>
          <TabsTrigger className='w-full' value='store-value'>
            Store Value
          </TabsTrigger>
          <TabsTrigger className='w-full' value='retrieve-value'>
            Retrieve Value
          </TabsTrigger>
        </TabsList>
        <TabsContent value='grant'>
          <GrantForm />
        </TabsContent>
        <TabsContent value='revoke'>
          <RevokeForm />
        </TabsContent>
        <TabsContent value='store-value'>
          <StoreForm />
        </TabsContent>{' '}
        <TabsContent value='retrieve-value'>
          <RetrieveForm />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Home;
