import { createJSONStorage } from "zustand/middleware";

export const zustandStorage = createJSONStorage(() => localStorage);
