"use client";
import { useState, useCallback } from "react";
import ConnectButton from "@/components/wallet-connect";
import { MY_ENS_NAME } from "@/components/client-providers";
import {
  checkAvailability,
  getMintDetails,
  generateTransaction,
} from "@/utils/namespace";
import {
  useAccount,
  usePublicClient,
  useWalletClient,
} from "wagmi";
import { sepolia } from "viem/chains";

// 🪄 Custom mint hook
function useMint() {
  const publicClient = usePublicClient({ chainId: sepolia.id });
  const { data: walletClient } = useWalletClient({ chainId: sepolia.id });

  const mint = useCallback(
    async (address: `0x${string}`, subnameLabel: string) => {
      const params = await generateTransaction(address, subnameLabel);

      const { request } = await publicClient!.simulateContract({
        abi: params.abi,
        address: params.contractAddress,
        functionName: params.functionName,
        args: params.args,
        account: address,
        value: params.value,
      });

      return walletClient!.writeContract(request);
    },
    [publicClient, walletClient]
  );

  return { mint };
}

export default function Home() {
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { address, isConnected, chain } = useAccount();
  const [txHash, setTxHash] = useState<string | null>(null);

  const { mint } = useMint();

  const handleSearch = async () => {
    if (!search) return;
    setLoading(true);

    try {
      const isAvailable = await checkAvailability(search, MY_ENS_NAME);
      const suggestionList = [
        `${search}.${MY_ENS_NAME}`,
        `${search}123.${MY_ENS_NAME}`,
        `my${search}.${MY_ENS_NAME}`,
        `the${search}.${MY_ENS_NAME}`,
      ];

      setSuggestions(
        suggestionList.map((s) => (isAvailable ? s : `${s} (taken)`))
      );
    } catch (error) {
      console.error(error);
      setSuggestions([`${search}.${MY_ENS_NAME} (taken)`]);
    }

    setLoading(false);
  };

  const handleMint = async (name: string) => {
    try {
      if (!isConnected || !address) {
        throw new Error("Please connect your wallet first");
      }
      if (chain?.id !== sepolia.id) {
        throw new Error("Please switch to Sepolia network");
      }

      const subnameLabel = name.replace(`.${MY_ENS_NAME}`, "");
      const tx = await mint(address as `0x${string}`, subnameLabel);
      setTxHash(tx);

      const mintDetails = await getMintDetails(
        address as `0x${string}`,
        subnameLabel
      );
      console.log("Mint details:", mintDetails);
    } catch (err: any) {
      console.error(err);
      // alert(`Mint failed: ${err.message}`);
    }
  };

  return (
    <div className="font-sans flex flex-col items-center min-h-screen p-8 gap-6 bg-black">
      {/* Wallet Connect */}
      <ConnectButton />

      <h1 className="text-2xl font-bold text-center font-sans">
        ENS Subname Minting under <span className="text-blue-600">{MY_ENS_NAME}</span>
      </h1>

      {/* Search Box */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search ENS name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border font-sans rounded-lg px-4 py-2 w-64 focus:ring focus:ring-blue-200 outline-none"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-blue-500 font-sans text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="mt-6 w-full max-w-md space-y-3">
          {suggestions.map((name) => (
            <div
              key={name}
              className="flex justify-between items-center border p-4 rounded-xl shadow-sm bg-black "
            >
              <span className="font-medium font-sans">
                {name.includes("taken") ? (
                  <span className="text-gray-500">{name}</span>
                ) : (
                  <span>{name}</span>
                )}
              </span>

              {!name.includes("taken") ? (
                <button
                  onClick={() => handleMint(name)}
                  className="bg-green-500 text-white px-4 py-1 rounded-lg hover:bg-green-600"
                >
                  Mint
                </button>
              ) : (
                <span className="text-red-400">Unavailable</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tx Feedback */}
      {txHash && (
        <div className="mt-6 p-4 border rounded-lg bg-green-50 text-green-700">
          ✅ Mint successful!{" "}
          <a
            href={`https://sepolia.etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-blue-600 ml-2"
          >
            View on Etherscan
          </a>
        </div>
      )}
    </div>
  );
}
