import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SolanaWalletGenerator from './walletGenerator';
import EthereumWalletGenerator from './ethereumWallet';

const WalletTab = () => {
  return (
    <div className="flex justify-center mt-12 min-h-screen">
      <Tabs defaultValue="solana" className="w-full max-w-4xl">
        <TabsList className="flex justify-center mb-4">
          <TabsTrigger value="solana" className="flex-1 text-center">Solana</TabsTrigger>
          <TabsTrigger value="ethereum" className="flex-1 text-center">Ethereum</TabsTrigger>
        </TabsList>
        <div className="flex gap-8">
          <TabsContent value="solana" className="flex-1">
            <SolanaWalletGenerator />
          </TabsContent>
          <TabsContent value="ethereum" className="flex-1">
            <EthereumWalletGenerator />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default WalletTab;
