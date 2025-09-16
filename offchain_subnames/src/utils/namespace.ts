import { clientConfig } from "@/components/client-providers";
import { MY_ENS_NAME } from "@/components/client-providers";
import { ChainName } from "@thenamespace/offchain-manager";
export async function checkSubnameAvailability(
    subname: string
): Promise<boolean> {
    try {
        const fullName = `${subname}.${MY_ENS_NAME}`; // combine
        const { isAvailable } = await clientConfig.isSubnameAvailable(fullName);
        return isAvailable;
    } catch (error) {
        console.error("Error checking subname availability:", error);
        return false;
    }
}

export async function createSubname(
  subLabel: string,
  ownerAddress: string
): Promise<string | null> {
  try {
    const fullName = `${subLabel}.${MY_ENS_NAME}`;


    const { isAvailable } = await clientConfig.isSubnameAvailable(fullName);
    if (!isAvailable) {
      console.warn(`Subname ${fullName} is not available`);
      return null;
    }
    await clientConfig.createSubname({
      label: subLabel,
      parentName: MY_ENS_NAME,
      texts: [
        { key: "name", value: subLabel },
        { key: "url", value: "https://example.com" }, 
      ],
      addresses: [
        {
          chain: ChainName.Ethereum,
          value: ownerAddress,
        },
      ],
      owner: ownerAddress,
      metadata: [{ key: "sender", value: ownerAddress }],
    });

    console.log(`✅ Created subname: ${fullName}`);
    return fullName;
  } catch (error) {
    console.error("Error creating subname:", error);
    return null;
  }
}


export async function fetchAllSubnamesByOwner(
  ownerAddress: string,
  pageSize: number = 50
): Promise<any[]> {
  try {
    let allSubnames: any[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await clientConfig.getFilteredSubnames({
        parentName:MY_ENS_NAME,
        owner: ownerAddress,
        page,
        size: pageSize,
      });

      allSubnames = [...allSubnames, ...response.items];
      hasMore = response.items.length === pageSize;
      page++;
    }

    return allSubnames;
  } catch (error) {
    console.error("Error fetching subnames:", error);
    return [];
  }
}

export async function getRecordsOfSubname(subLabel:string){
    try {
        const fullName = `${subLabel}.${MY_ENS_NAME}`;
        const all = await clientConfig.getTextRecords(fullName);
        return all;
    } catch (error) {
        console.error("Error fetching records:", error);
    }
}
