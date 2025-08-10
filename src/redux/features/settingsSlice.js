import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedLanguage: 'english', // Default language
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setLanguage: (state, action) => {
      state.selectedLanguage = action.payload;
    },
  },
});

export const { setLanguage } = settingsSlice.actions;

export default settingsSlice.reducer;