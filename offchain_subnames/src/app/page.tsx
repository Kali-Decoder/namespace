"use client";

import { useState } from "react";
import ConnectButton from "@/components/wallet-connect";
import { MY_ENS_NAME } from "@/components/client-providers";
import { useAccount } from "wagmi";
import {
  checkSubnameAvailability,
  createSubname,
  fetchAllSubnamesByOwner,
  getRecordsOfSubname,
} from "@/utils/namespace";

export default function Home() {
  const { address } = useAccount();

  const [subLabel, setSubLabel] = useState("");
  const [availability, setAvailability] = useState<null | boolean>(null);


  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [minting, setMinting] = useState(false);
  const [fetchingOwned, setFetchingOwned] = useState(false);
  const [recordLoading, setRecordLoading] = useState<{ [key: number]: boolean }>({});

  const [ownedSubnames, setOwnedSubnames] = useState<any[]>([]);
  const [message, setMessage] = useState("");


  const handleCheckAvailability = async () => {
    if (!subLabel) return;
    setCheckingAvailability(true);
    const available = await checkSubnameAvailability(subLabel);
    setAvailability(available);
    setCheckingAvailability(false);
  };

  // Mint subname
  const handleMintSubname = async () => {
    if (!address) {
      setMessage("⚠️ Please connect your wallet first.");
      return;
    }
    if (!subLabel) {
      setMessage("⚠️ Please enter a subname.");
      return;
    }

    setMinting(true);
    const created = await createSubname(subLabel, address);
    if (created) {
      setMessage(`✅ Successfully minted: ${created}`);
      setAvailability(null);
      setSubLabel("");
      await handleFetchOwned();
    } else {
      setMessage("❌ Failed to mint subname. Maybe it's taken?");
    }
    setMinting(false);
  };

  // Fetch owned subnames
  const handleFetchOwned = async () => {
    if (!address) {
      setMessage("⚠️ Connect your wallet to fetch subnames.");
      return;
    }
    setFetchingOwned(true);
    const subs = await fetchAllSubnamesByOwner(address);
    setOwnedSubnames(subs);
    setFetchingOwned(false);
  };

  // Fetch record for a subname
  const handleViewRecord = async (idx: number, label: string) => {
    setRecordLoading((prev) => ({ ...prev, [idx]: true }));
    const record = await getRecordsOfSubname(label);
    setOwnedSubnames((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, record } : item))
    );
    setRecordLoading((prev) => ({ ...prev, [idx]: false }));
  };

  return (
    <div className="font-sans flex flex-col items-center min-h-screen p-10 gap-8 bg-black text-white">
      <ConnectButton />

      <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-400 to-teal-300 bg-clip-text text-transparent drop-shadow-lg">
        ENS OffChain Subname Minting
      </h1>
      <p className="text-lg text-gray-300">
        Under <span className="text-blue-400">{MY_ENS_NAME}</span>
      </p>

      <div className="flex flex-col gap-4 w-full max-w-md bg-gray-900/60 p-6 rounded-2xl shadow-lg border border-gray-800">
        <input
          type="text"
          placeholder="Enter desired subname (e.g. alice)"
          value={subLabel}
          onChange={(e) => setSubLabel(e.target.value)}
          className="px-4 py-3 rounded-xl text-white focus:ring-2 focus:ring-blue-400 outline-none"
        />

        <button
          onClick={handleCheckAvailability}
          disabled={checkingAvailability || !subLabel}
          className="px-4 py-3 rounded-xl cursor-pointer bg-gradient-to-r from-blue-500 to-teal-400 text-black font-semibold hover:opacity-90 transition-all"
        >
          {checkingAvailability ? "⏳ Checking..." : "🔍 Check Availability"}
        </button>

        {availability !== null && (
          <p
            className={`text-sm font-medium ${
              availability ? "text-green-400" : "text-red-400"
            }`}
          >
            {availability
              ? `✅ ${subLabel}.${MY_ENS_NAME} is available!`
              : `❌ ${subLabel}.${MY_ENS_NAME} is not available.`}
          </p>
        )}

        {availability && (
          <button
            onClick={handleMintSubname}
            disabled={minting}
            className="px-4 py-3 rounded-xl bg-gradient-to-r from-green-500 to-lime-400 text-black font-semibold hover:opacity-90 transition-all"
          >
            {minting ? "🚀 Minting..." : "✨ Mint Subname"}
          </button>
        )}
      </div>

      {message && (
        <p className="mt-4 text-yellow-300 font-medium drop-shadow-md">
          {message}
        </p>
      )}


      <div className="w-full max-w-md mt-6 bg-gray-900/60 p-6 rounded-2xl shadow-lg border border-gray-800">
        <button
          onClick={handleFetchOwned}
          disabled={fetchingOwned}
          className="w-full px-4 py-3 cursor-pointer rounded-xl bg-gradient-to-r from-purple-500 to-pink-400 text-black font-semibold hover:opacity-90 transition-all"
        >
          {fetchingOwned ? "📂 Fetching..." : "📂 Fetch My Subnames"}
        </button>

        {ownedSubnames.length > 0 && (
          <ul className="mt-4 space-y-3 w-full">
            {ownedSubnames.map((sn, idx) => (
              <li
                key={idx}
                className="px-4 py-3 rounded-xl bg-gray-800/70 shadow-md"
              >
                <div className="flex justify-between items-center">
                  <span className="text-gray-200">{sn.fullName}</span>
                  <button
                    onClick={() => handleViewRecord(idx, sn.label)}
                    disabled={recordLoading[idx]}
                    className="text-sm text-blue-400 hover:text-blue-300 transition-all"
                  >
                    {recordLoading[idx] ? "⏳ Loading..." : "🔎 View Record"}
                  </button>
                </div>

                {sn.record && (
                  <div className="mt-2 ml-4 text-sm text-gray-300 space-y-1 border-l border-gray-600 pl-3">
                    <div>
                      <span className="text-xs text-gray-400">name:</span>
                      <span className="ml-2">{sn.record.name}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400">url:</span>
                      <a
                        href={sn.record.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-blue-400 hover:underline break-all"
                      >
                        {sn.record.url}
                      </a>
                    </div>
                  </div>
                )}

                {sn.record && !sn.record.name && !sn.record.url && (
                  <p className="mt-2 ml-4 text-sm text-gray-500 italic">
                    No record found.
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
