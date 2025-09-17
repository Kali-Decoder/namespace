type Address = `0x${string}`

const mainnetId = 1;
const sepoliaId = 1115511;
const baseId = 8453;
const baseSepoliaId = 84532;
const opId = 10;

export interface L1ContractAddresses {
    mintController: Address
    nameWrapperProxy: Address
    hybridResolver: Address
    oldHybridResolver: Address
    bulkEnsRegistrar: Address
}

export interface L2ContractAddresses {
    controller: Address;
    resolver: Address;
    registryResolver: Address;
    emitter: Address;
}

export interface EnsContracts {
    nameWrapper: Address
    ensRegistry: Address
    publicResolver: Address
    ethRegistrarController: Address
    universalResolver: Address
}

const l1Contracts: Record<number, L1ContractAddresses> = {
    [mainnetId]: {
        mintController: "0xCf7625A2fb60B0822444E5964b4Ce80c148e7Fad",
        nameWrapperProxy: "0x25ADB7e69390FbfeEe26F3C8053955d4D4428Afd",
        hybridResolver: "0xe5A0277018879679d18cCDb66B52BD06f7fE95FD",
        oldHybridResolver: "0x0dcD506D1Be162E50A2b434028A9a148F2686444",
        bulkEnsRegistrar: "0x99393f6ceb39a6fdefdfeed1606669b16c49c453"
    },
    [sepoliaId]: {
        mintController: "0x313442ba3A0b12193787BD162f99Ed3C415F2886",
        nameWrapperProxy: "0x0Ff41b99D7185B01bA47Ca85e9049166Cb3CD6bd",
        hybridResolver: "0xd5568c739f3a615c27e8926f1067b9a791893c3e",
        oldHybridResolver: "0x2F5E9E8B4495e4CDC5bC6C5FCBa93B8AaBDeF595",
        bulkEnsRegistrar: "0x94df1d05e6f1e064c586cee6be8b94eeaacc14aa"
    }
}

const l2Contracts: Record<number, L2ContractAddresses> = {
    [baseId]: {
        controller: "0xa8e61891626f86ae6397217823701183de947c7d",
        emitter: "0xA9EA3fbBDB2d1696dC67C5FA45D9A64Ac432888C",
        registryResolver: "0x0D8e2772B4D8d58C8a66EEc5bf77c07934b84942",
        resolver: "0x32d63B83BBA5a25f1f8aE308d7fd1F3c0b1abfA6"
    },
    [opId]:  {
        controller: "0x5C1220C4C5D75aC2d0A2f893995b5eCec98F3Aa6",
        emitter: "0x87516B5518a6548433AB97aE59b15B1A31472F11",
        registryResolver: "0x0798278Ff2c8aD096447B5C368Ce682118D87f63",
        resolver: "0xD8de4F5D7117BA37bA171ec9180Da798056f2CEd"
    },
    [baseSepoliaId]:  {
        controller: "0x56c4A2A6e302B314D600c45a7bA385693486c798",
        emitter: "0xa391631503109f35831d14dC20A16EA83b48c42d",
        registryResolver: "0x71C79717Bb907DBd73b564DA0F591209005a6695",
        resolver: "0x91FE109266b2EEcf6018Cb1ECd957fF9caAd0657"
    },
};

const ensContracts: Record<number, EnsContracts> = {
    [mainnetId]: {
        ensRegistry: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
        nameWrapper: "0xd4416b13d2b3a9abae7acd5d6c2bbdbe25686401",
        ethRegistrarController: "0x253553366Da8546fC250F225fe3d25d0C782303b",
        publicResolver: "0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63",
        universalResolver: "0xce01f8eee7E479C928F8919abD53E553a36CeF67"
    },
    [sepoliaId]: {
        ensRegistry: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
        nameWrapper: "0x0635513f179D50A207757E05759CbD106d7dFcE8",
        ethRegistrarController: "0xFED6a969AaA60E4961FCD3EBF1A2e8913ac65B72",
        publicResolver: "0x8FADE66B79cC9f707aB26799354482EB93a5B7dD",
        universalResolver: "0xc8af999e38273d658be1b921b88a9ddf005769cc"
    }
}

export const getEnsContracts = (isTestnet: boolean = false): EnsContracts => {

    return ensContracts[!isTestnet ? mainnetId : sepoliaId]
}

export const getL1NamespaceContracts = (isTestnet: boolean = false): L1ContractAddresses => {
    return l1Contracts[!isTestnet ? mainnetId : sepoliaId];
}

export const getL2NamespaceContracts = (chainId: number): L2ContractAddresses => {
    const contracts = l2Contracts[chainId];

    if (!contracts) {
        throw new Error(`L2 Contracts for chain: ${chainId} are not present`)
    }
    return contracts;

}