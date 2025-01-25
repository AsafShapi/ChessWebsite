import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios';

export const fetchUser = createAsyncThunk(
    'auth/fetchUser',
    async () => {
      try {
        const response = await axios.get('/api/current_user');
        return response.data;
      } catch (error) {
        throw error;
      }
    }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    loading: false,
    error: null
  },
  extraReducers: (builder) => {
    builder
        .addCase(fetchUser.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(fetchUser.fulfilled, (state, action) => {
          state.loading = false;
          state.user = action.payload;
          state.error = null;
        })
        .addCase(fetchUser.rejected, (state, action) => {
          state.loading = false;
          state.error = action.error.message;
        });
  }
});

export default authSlice.reducer;

