import { NEIGHBORING_MAP, TOWNS } from '../data/towns';

export interface AdventureResult {
  city: string;
  name: string;
  region: string;
  desc?: string;
}

/**
 * 根據使用者居住地與配置的環境變數進行過濾
 */
export const filterTowns = (userCity: string, excludeNeighbors: boolean): AdventureResult[] => {
  if (!userCity) return TOWNS;

  let excludedCities = [userCity];

  // 條件B：濾除鄰近縣市
  if (excludeNeighbors && NEIGHBORING_MAP[userCity]) {
    excludedCities = [...excludedCities, ...NEIGHBORING_MAP[userCity]];
  }

  return TOWNS.filter(town => !excludedCities.includes(town.city));
};

/**
 * 從過濾後的清單中隨機抽取一個鄉鎮
 */
export const pickRandomTown = (filteredTowns: AdventureResult[]): AdventureResult | null => {
  if (filteredTowns.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * filteredTowns.length);
  return filteredTowns[randomIndex];
};

/**
 * 產生 DiceBear 像素角色的 URL 
 * (因 Unsplash Source API 已停用/不穩定，改回像素頭像以確保不破圖)
 */
export const getTownImageUrl = (seed: string): string => {
  return `https://api.dicebear.com/8.x/pixel-art/svg?seed=${encodeURIComponent(seed)}`;
};

/**
 * 模擬傳送資料至後端 (Google Apps Script)
 */
export const sendResultToGas = async (
  userId: string, 
  userCity: string, 
  result: AdventureResult
) => {
  const gasUrl = import.meta.env.VITE_GAS_API_URL;
  if (!gasUrl) {
    console.warn("未設定 VITE_GAS_API_URL 環境變數，資料無法傳送！");
    return;
  }

  try {
    const payload = {
      userId,
      userCity,
      resultText: `${result.city}${result.name}`,
      timestamp: new Date().toISOString()
    };

    // 此處使用 no-cors 或 x-www-form-urlencoded 避開 GAS CORS 問題
    // 通常 GAS 寫入時用 POST 可以接受 form-data 格式
    const formData = new URLSearchParams();
    Object.entries(payload).forEach(([key, value]) => formData.append(key, value));

    fetch(gasUrl, {
      method: "POST",
      body: formData,
      headers: {
         "Content-Type": "application/x-www-form-urlencoded",
      },
    }).catch(err => console.error("GAS 發送失敗", err));
    
  } catch (error) {
    console.error("發送紀錄至 GAS 失敗", error);
  }
};
