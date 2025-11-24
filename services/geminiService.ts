
import { CampaignData } from "../types";
import { FALLBACK_DATA } from "../constants";

export const fetchCupioCampaign = async (): Promise<CampaignData> => {
  // We are bypassing the AI generation to ensure strict adherence to the 
  // specific product list and images provided by the user.
  // This prevents "invented" products or emojis from appearing.
  
  // Simulate a small network delay for effect
  await new Promise(resolve => setTimeout(resolve, 800));

  return {
    ...FALLBACK_DATA,
    groundingUrls: ["https://www.cupio.ro"]
  };
};
