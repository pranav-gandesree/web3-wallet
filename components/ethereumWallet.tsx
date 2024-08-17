// EthereumWalletGenerator.tsx
'use client'

import React, { FC, useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { ethers } from "ethers";
import { toast } from "sonner";
import { generateMnemonic, mnemonicToSeedSync, validateMnemonic } from "bip39";
import { derivePath } from "ed25519-hd-key";

interface Wallet {
  address: string;
  privateKey: string;
}

const EthereumWalletGenerator: FC = () => {
  const [mnemonic, setMnemonic] = useState<string>("");
  const [initialMnemonic, setInitialMnemonic] = useState<string | null>(null);
  const [inputMnemonic, setInputMnemonic] = useState<string>("");
  const [wallets, setWallets] = useState<Wallet[]>([]);

  useEffect(() => {
    const storedWallets = localStorage.getItem("ethereumWallets");
    if (storedWallets) {
      setWallets(JSON.parse(storedWallets));
    }
  }, []);

  const handleGenerateWallet = () => {
    let mnemonicToUse = inputMnemonic.trim();

    if (wallets.length === 0) {
      if (!mnemonicToUse) {
        mnemonicToUse = generateMnemonic();
      } else if (!validateMnemonic(mnemonicToUse)) {
        toast.error("Invalid recovery phrase. Please try again.");
        return;
      }

      setMnemonic(mnemonicToUse);
      setInitialMnemonic(mnemonicToUse);
    } else {
      mnemonicToUse = initialMnemonic!;
    }

    try {
      const seedBuffer = mnemonicToSeedSync(mnemonicToUse);
      const path = `m/44'/60'/${wallets.length}'/0'`; // Path for Ethereum
      const { key: derivedSeed } = derivePath(path, seedBuffer.toString("hex"));
      const privateKey = Buffer.from(derivedSeed).toString("hex");

      if (privateKey.length !== 64) {
        throw new Error("Invalid private key length.");
      }

      const wallet = new ethers.Wallet(privateKey);
      const newWallet: Wallet = {
        address: wallet.address,
        privateKey: wallet.privateKey,
      };

      const updatedWallets = [...wallets, newWallet];
      setWallets(updatedWallets);
      localStorage.setItem("ethereumWallets", JSON.stringify(updatedWallets));

      toast.success("Wallet generated successfully!");
    } catch (error) {
      toast.error("Failed to generate wallet. Please try again.");
    }
  };

  const handleDeleteWallet = (index: number) => {
    const updatedWallets = wallets.filter((_, i) => i !== index);
    setWallets(updatedWallets);
    localStorage.setItem("ethereumWallets", JSON.stringify(updatedWallets));

    if (updatedWallets.length === 0) {
      setMnemonic("");
      setInputMnemonic("");
      setInitialMnemonic(null);
    }

    toast.success("Wallet deleted.");
  };

  const handleDeleteAllWallets = () => {
    setWallets([]);
    localStorage.removeItem("ethereumWallets");

    setMnemonic("");
    setInputMnemonic("");
    setInitialMnemonic(null);

    toast.success("All wallets deleted.");
  };

  const viewBalance = () =>{
    
  }

  return (
    <Card className="w-full shadow-lg rounded-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">Wallet Generator for Ethereum</CardTitle>
        <CardDescription>Generate or manage your Ethereum wallets</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <Input
            type="text"
            placeholder="Enter your secret phrase (or leave blank to generate)"
            value={inputMnemonic}
            onChange={(e) => setInputMnemonic(e.target.value)}
            className="border rounded-lg"
          />
          {mnemonic && (
            <div className="mt-4 p-4 border rounded-lg">
              <p className="font-medium">Mnemonic Phrase:</p>
              <p>{mnemonic}</p>
            </div>
          )}
          <Button
            className="text-white rounded-lg"
            onClick={handleGenerateWallet}
          >
            Generate Wallet
          </Button>

          <Button
            className="rounded-lg mt-4"
            onClick={handleDeleteAllWallets}
          >
            Delete All Wallets
          </Button>

          <div className="mt-6 space-y-4 text-slate-500">
            {wallets.map((wallet, index) => (
              <div
                key={index}
                className="p-4 border rounded-lg flex justify-between items-center">
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="font-medium text-xl">Wallet {index + 1}</p>
                    <Button
                      className="rounded-lg"
                      variant="secondary"
                      onClick={() => handleDeleteWallet(index)}
                    >
                      Delete
                    </Button>
                  </div>
                  <p className="text-sm">
                    <strong>Address:</strong>{" "}
                    <span className="p-2 rounded-md block">{wallet.address}</span>
                  </p>
                  <p className="text-sm">
                    <strong>Private Key:</strong>{" "}
                    <span className="p-2 rounded-md block">{wallet.privateKey}</span>
                  </p>
                  <Button  variant="secondary" className="rounded-lg" onClick={viewBalance}>View Balance</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EthereumWalletGenerator;
