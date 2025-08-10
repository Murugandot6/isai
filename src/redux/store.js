import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';

import playerReducer from './features/playerSlice';
import libraryReducer from './features/librarySlice';
import promptReducer from './features/promptSlice';
import settingsReducer from './features/settingsSlice'; // Import the new settings reducer
import { saavnApi } from './services/saavnApi';
import { radioBrowserApi } from './services/radioBrowserApi';

export const store = configureStore({
  reducer: {
    [saavnApi.reducerPath]: saavnApi.reducer,
    [radioBrowserApi.reducerPath]: radioBrowserApi.reducer,
    player: playerReducer,
    library: libraryReducer,
    prompt: promptReducer,
    settings: settingsReducer, // Add the settings reducer here
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(saavnApi.middleware, radioBrowserApi.middleware)
});