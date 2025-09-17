"use client";
import { useState, useCallback } from "react";
import ConnectButton from "@/components/wallet-connect";
import { MY_ENS_NAME } from "@/components/client-providers";
import {
  checkAvailability,
  getMintDetails,
  generateTransaction,
} from "@/utils/namespace";
import axios from "axios";
import { Abis } from "@/constant/abi";
import { getL1NamespaceContracts } from "@/constant/index";
import { Address, Hash, namehash, toHex, zeroAddress } from "viem";
import {
  useAccount,
  usePublicClient,
  useWalletClient,
} from "wagmi";
import { sepolia } from "viem/chains";

const FactoryContextTypes = {
  FactoryContext: [
    { name: "tokenName", type: "string" },
    { name: "tokenSymbol", type: "string" },
    { name: "label", type: "string" },
    { name: "TLD", type: "string" },
    { name: "owner", type: "address" },
    { name: "parentControl", type: "uint8" },
    { name: "expirableType", type: "uint8" },
  ],
};

interface MintParametersRequest { label: string; parentName: string; minterAddress: string; expiryInYears?: number; owner?: string; isTestnet?: boolean; }
interface MintParametersResponse {
  content: {
    label: string;
    owner: string;
    fee: string;
    price: string;
    parentNode: string;
    paymentReceiver: string;
    verifiedMinter: string;
    signatureExpiry: number;
    expiry: number;
    fuses?: number;
  };
  signature: string;
}
const mintManagerHttp = axios.create({
  baseURL: "https://staging.mint-manager.namespace.ninja",
});

const getMintParameters = async (
  request: MintParametersRequest
): Promise<MintParametersResponse> => {
  const res = await mintManagerHttp.post<MintParametersResponse>(
    "/api/v1/minting-parameters",
    request
  );
  return res.data;
};


export function useMint() {
  const publicClient = usePublicClient({ chainId: sepolia.id });
  const { data: walletClient } = useWalletClient({ chainId: sepolia.id });

  const mint = useCallback(
    async (params: {
      abi: any;
      contractAddress: `0x${string}`;
      functionName: string;
      args: any[];
      account: `0x${string}`;
      value: bigint;
    }) => {
      const { request } = await publicClient!.simulateContract({
        abi: params.abi,
        address: params.contractAddress,
        functionName: params.functionName,
        args: params.args,
        account: params.account,
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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { mint } = useMint();

  // 🔍 Search handler
  const handleSearch = async () => {
    if (!search.trim()) return;
    setLoading(true);
    setErrorMsg(null);

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
      setSuggestions([]);
      setErrorMsg("Something went wrong while checking availability.");
    }

    setLoading(false);
  };

  // 🪙 Mint handler
  const handleMint = async (name: string) => {
    try {
      if (!isConnected || !address) {
        throw new Error("Please connect your wallet first");
      }
      if (chain?.id !== sepolia.id) {
        throw new Error("Please switch to Sepolia network");
      }

      const subnameLabel = name.replace(`.${MY_ENS_NAME}`, "");

      // 🔹 Step 1: Call API to get mint parameters
      const mintParamsRequest: MintParametersRequest = {
        label: subnameLabel,
        parentName: MY_ENS_NAME,
        minterAddress: address as `0x${string}`,
        expiryInYears: 1,
        owner: address as `0x${string}`,
        isTestnet: true,
      };

      // 🔹 Step 2: Use response params for signature generation
    
      const paramResponse = await getMintParameters(mintParamsRequest);
      console.log("Mint parameters:", paramResponse);

      const params = {
      abi: Abis.L1_MINT_CONTROLLER,
      args: [
        paramResponse.content,
        paramResponse.signature,
        [],
        toHex("namespace-sdk"),
      ],
      functionName: "mint",
      contractAddress: getL1NamespaceContracts(true).mintController,
      account: address as `0x${string}`,
      value:
        BigInt(paramResponse.content.fee) + BigInt(paramResponse.content.price),
    }

      // 🔹 Step 3: Call mint with API response values
      const tx = await mint(params);
      setTxHash(tx);

      const mintDetails = await getMintDetails(
        address as `0x${string}`,
        subnameLabel
      );
      console.log("Mint details:", mintDetails);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Mint failed. Please try again.");
    }
  };

  return (
    <div className="font-sans flex flex-col items-center min-h-screen p-8 gap-8 bg-gradient-to-b from-gray-950 to-black text-white">
      {/* Wallet Connect */}
      <ConnectButton />

      {/* Title */}
      <h1 className="text-3xl font-bold text-center">
        ENS Subname Minting under{" "}
        <span className="text-blue-500">{MY_ENS_NAME}</span>
      </h1>

      {/* Search Box */}
      <div className="flex gap-3 w-full max-w-md">
        <input
          type="text"
          placeholder="Search ENS subname..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-3 rounded-xl border border-gray-700 bg-gray-900 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-all font-medium"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {/* Error Msg */}
      {errorMsg && (
        <div className="w-full max-w-md p-4 rounded-lg bg-red-500/20 border border-red-500 text-red-400 text-sm">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="w-full max-w-md space-y-3">
          {suggestions.map((name) => (
            <div
              key={name}
              className="flex justify-between items-center p-4 rounded-xl bg-gray-900 border border-gray-700 hover:border-blue-500 transition-all"
            >
              <span className="font-medium">
                {name.includes("taken") ? (
                  <span className="text-gray-500">{name}</span>
                ) : (
                  name
                )}
              </span>

              {!name.includes("taken") ? (
                <button
                  onClick={() => handleMint(name)}
                  className="px-4 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 transition-all text-sm font-medium"
                >
                  Mint
                </button>
              ) : (
                <span className="text-red-400 text-sm">Unavailable</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tx Feedback */}
      {txHash && (
        <div className="w-full max-w-md p-4 rounded-lg bg-green-500/20 border border-green-500 text-green-400 text-sm">
          ✅ Mint successful!{" "}
          <a
            href={`https://sepolia.etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline ml-1 hover:text-green-300"
          >
            View on Etherscan
          </a>
        </div>
      )}
    </div>
  );
}



// [
//     {
//         "expiry": 9007199254740991,
//         "fuses": 327680,
//         "fee": "0",
//         "price": "0",
//         "label": "mint",
//         "owner": "0xdAF0182De86F904918Db8d07c7340A1EfcDF8244",
//         "parentNode": "0xa105689ff411d8e803f2e4f45900e073b45aaf75ded3d55c685eacdbe618d100",
//         "paymentReceiver": "0xdAF0182De86F904918Db8d07c7340A1EfcDF8244",
//         "signatureExpiry": 1758109247,
//         "verifiedMinter": "0xdAF0182De86F904918Db8d07c7340A1EfcDF8244"
//     },
//     "0x6205745ac44e6421b8e07e5ba4fb2cf5cae02eea2143863f853e5c37766c0f1e3a4bd9ba8f1e6aff0955372f4b34e7b06e91ba3a6bf2f6646312c1bc4848e4f71c",
//     [],
//     "0x6d792d656e732d6e696b6b752d64617070"
// ]