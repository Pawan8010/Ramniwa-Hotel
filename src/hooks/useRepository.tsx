import { useEffect, useState } from 'react';
import { getMergedAssets } from '../data/assets';
import { hotelRepo, type HotelState } from '../data/repo';
import type { AssetItem } from '../types/hotel';

export function useHotelData() {
  const [state, setState] = useState<HotelState>(() => hotelRepo.getState());
  const [assets, setAssets] = useState<AssetItem[]>(() => getMergedAssets());

  useEffect(() => {
    const syncData = () => setState(hotelRepo.getState());
    const syncMedia = () => setAssets(getMergedAssets());

    window.addEventListener('ramniwas:data-updated', syncData);
    window.addEventListener('ramniwas:media-updated', syncMedia);
    window.addEventListener('storage', syncData);
    return () => {
      window.removeEventListener('ramniwas:data-updated', syncData);
      window.removeEventListener('ramniwas:media-updated', syncMedia);
      window.removeEventListener('storage', syncData);
    };
  }, []);

  return { state, assets, repo: hotelRepo };
}
