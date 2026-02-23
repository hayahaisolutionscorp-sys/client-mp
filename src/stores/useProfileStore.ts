import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ProfileState {
  profileTab: string;
  setProfileTab: (tab: string) => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profileTab: 'overview',
      setProfileTab: (tab) => set({ profileTab: tab }),
    }),
    {
      name: 'ayahay-profile',
      // sessionStorage clears automatically when the tab/browser is closed
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
