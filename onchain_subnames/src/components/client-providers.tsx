'use client'
import { createAppKit } from '@reown/appkit/react'
import { WagmiProvider } from 'wagmi'
import { sepolia } from '@reown/appkit/networks'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import {
  MintClientConfig,
  createMintClient,
  MintClient,
} from "@namespacesdk/mint-manager";
import { sep } from 'path'
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

const clientConfig: MintClientConfig = {
  customRpcUrls: {
    [sepolia.id]: sepolia.rpcUrls.default.http[0],
  },
  mintSource: "my-ens-nikku-dapp",
  isTestnet:true,
  environment:'staging'
};

export const mintClient: MintClient = createMintClient(clientConfig);
export const MY_ENS_NAME = "kalidecoder.eth";