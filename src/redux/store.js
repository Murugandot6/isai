import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';

import playerReducer from './features/playerSlice';
import libraryReducer from './features/librarySlice';
import promptReducer from './features/promptSlice';
import { saavnApi } from './services/saavnApi'; // Import the new Saavn API
import { radioBrowserApi } from './services/radioBrowserApi';

export const store = configureStore({
  reducer: {
    [saavnApi.reducerPath]: saavnApi.reducer, // Use Saavn API reducer
    [radioBrowserApi.reducerPath]: radioBrowserApi.reducer,
    player: playerReducer,
    library: libraryReducer,
    prompt: promptReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(saavnApi.middleware, radioBrowserApi.middleware) // Use Saavn API middleware
});