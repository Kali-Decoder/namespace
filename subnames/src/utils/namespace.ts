import { mintClient, MY_ENS_NAME } from "@/components/client-providers";
import { ChainName, } from "@namespacesdk/mint-manager"
export const checkAvailability = async (subnameLabel: string, parentName: string) => {
    const fullName = `${subnameLabel}.${parentName}`;
    // const isAvailable = await mintClient.isL2SubnameAvailable(fullName, sepolia.id);
    const isAvail = await mintClient.isL1SubnameAvailable(fullName);
    console.log(isAvail);
    if (!isAvail) {
        throw new Error(`${fullName} is already taken!`);
    }

    console.log(`${fullName} is available for minting`);
    return true;
};

export const getMintDetails = async (address: `0x${string}`, subnameLabel: string) => {
    const mintDetails = await mintClient.getMintDetails({
        minterAddress: address,
        parentName: MY_ENS_NAME,
        label: subnameLabel,
    });

    if (!mintDetails.canMint) {
        const errorMessage = mintDetails.validationErrors[0] || "Unknown reason";
        throw new Error(`Subname cannot be minted: ${errorMessage}`);
    }

    const totalPrice = mintDetails.estimatedPriceEth + mintDetails.estimatedFeeEth;
    console.log(`Total minting cost: ${totalPrice} ETH`);
    console.log(`Base price: ${mintDetails.estimatedPriceEth} ETH`);
    console.log(`Network fee: ${mintDetails.estimatedFeeEth} ETH`);

    return mintDetails;
};

export const generateTransaction = async (address: `0x${string}`, subnameLabel: string) => {
    const txParameters = await mintClient.getMintTransactionParameters({
        parentName: MY_ENS_NAME,
        label: subnameLabel,
        minterAddress: address,
        expiryInYears: 1,
        records: {
            addresses: {
                value: address,
                chain : ChainName.Ethereum
            },
            texts: {
                key: "description", // Custom text record
                value: "Hello World",   // Website record
            },
        },
    });

    return txParameters;
};