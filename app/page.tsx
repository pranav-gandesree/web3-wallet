import { ModeToggle } from "@/components/ui/theme-button";
import { Separator } from "@/components/ui/separator"
import WalletGenerator from '../components/walletGenerator'
import WalletTab from "@/components/walletTab";

export default function Home() {
  return (
    <>
    <div className="">
      <nav className="flex justify-between items-center p-6">
      <div className="text-3xl">Web3 Wallet  </div> 
        <ModeToggle/>
      </nav>
      <Separator />
    </div>
    <WalletTab/>
    {/* <WalletGenerator/> */}
    </>

  );
}