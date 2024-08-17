'use client'

// SolanaWalletGenerator.tsx
import React, { FC, useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import bs58 from "bs58";
import nacl from "tweetnacl";
import { generateMnemonic, mnemonicToSeedSync, validateMnemonic } from "bip39";
import { derivePath } from "ed25519-hd-key";
import { Keypair } from "@solana/web3.js";
import { toast } from "sonner";

interface Wallet {
  publicKey: string;
  privateKey: string;
}

const SolanaWalletGenerator: FC = () => {
  const [mnemonic, setMnemonic] = useState<string>("");
  const [initialMnemonic, setInitialMnemonic] = useState<string | null>(null);
  const [inputMnemonic, setInputMnemonic] = useState<string>("");
  const [wallets, setWallets] = useState<Wallet[]>([]);

  useEffect(() => {
    const storedWallets = localStorage.getItem("solanaWallets");
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
      const path = `m/44'/501'/${wallets.length}'/0'`; // Path for Solana
      const { key: derivedSeed } = derivePath(path, seedBuffer.toString("hex"));
      const { secretKey } = nacl.sign.keyPair.fromSeed(derivedSeed);
      const keypair = Keypair.fromSecretKey(secretKey);

      const privateKeyBase58 = bs58.encode(secretKey);
      const publicKeyBase58 = keypair.publicKey.toBase58();

      const newWallet: Wallet = {
        publicKey: publicKeyBase58,
        privateKey: privateKeyBase58,
      };

      const updatedWallets = [...wallets, newWallet];
      setWallets(updatedWallets);
      localStorage.setItem("solanaWallets", JSON.stringify(updatedWallets));

      toast.success("Wallet generated successfully!");
    } catch (error) {
      toast.error("Failed to generate wallet. Please try again.");
    }
  };

  const handleDeleteWallets = () => {
    setWallets([]);
    localStorage.removeItem("solanaWallets");

    setMnemonic("");
    setInputMnemonic("");
    setInitialMnemonic(null);

    toast.success("All wallets deleted.");
  };

  return (
    <Card className="w-full shadow-lg rounded-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">Wallet Generator for Solana</CardTitle>
        <CardDescription>Generate or manage your Solana wallets</CardDescription>
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
            onClick={handleDeleteWallets}
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
                      onClick={() => {
                        const updatedWallets = wallets.filter((_, i) => i !== index);
                        setWallets(updatedWallets);
                        localStorage.setItem("solanaWallets", JSON.stringify(updatedWallets));
                        toast.success("Wallet deleted.");

                        if (updatedWallets.length === 0) {
                          setMnemonic("");
                          setInputMnemonic("");
                          setInitialMnemonic(null);
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                  <p className="text-sm">
                    <strong>Public Key:</strong>{" "}
                    <span className="p-2 rounded-md block">{wallet.publicKey}</span>
                  </p>
                  <p className="text-sm">
                    <strong>Private Key:</strong>{" "}
                    <span className="p-2 rounded-md block">{wallet.privateKey}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SolanaWalletGenerator;
