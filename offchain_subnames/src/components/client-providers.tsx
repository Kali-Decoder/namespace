'use client'
import { createAppKit } from '@reown/appkit/react'
import { WagmiProvider } from 'wagmi'
import { sepolia } from '@reown/appkit/networks'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { createOffchainClient } from '@thenamespace/offchain-manager'
const projectId = '684cdccc0de232f65a62603583571f5e'
// 2. Create a metadata object - optional
const metadata = {
    name: 'SubNames',
    description: 'SubNames',
    url: 'https://example.com', // origin must match your domain & subdomain
    icons: ['https://avatars.githubusercontent.com/u/179229932']
}
const networks = [sepolia]

// 4. Create Wagmi Adapter
export const wagmiAdapter = new WagmiAdapter({
    networks,
    projectId,
    ssr: true
})
createAppKit({
    adapters: [wagmiAdapter],
    networks: [networks[0], ...networks.slice(1)],
    projectId,
    metadata,
    features: {
        analytics: true 
    }
})

export default function AppKitProvider({ children }: { children: React.ReactNode }) {
    const queryClient = new QueryClient();
    return (
        <WagmiProvider config={wagmiAdapter.wagmiConfig}>
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </WagmiProvider>
    )
} 
const API_KEY = process.env.NEXT_PUBLIC_NAMESPACE_API_KEY as string;
if (!API_KEY) throw new Error('Missing NAMESPACE_API_KEY');

export const clientConfig = createOffchainClient({ 
  mode: 'sepolia', 
  timeout: 5000,
  defaultApiKey: API_KEY,
});
export const MY_ENS_NAME = "kalidecoder.eth";
console.log('Offchain client initialized');