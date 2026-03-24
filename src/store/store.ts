import { configureStore, createSlice } from "@reduxjs/toolkit";
import userReducer from "@/app/slices/userSlice";

// Placeholder slice — replace with real slices as features are added
const appSlice = createSlice({
  name: "app",
  initialState: {},
  reducers: {},
});

export const store = configureStore({
  reducer: {
    app: appSlice.reducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
