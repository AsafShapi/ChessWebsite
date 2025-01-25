import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "../../api/axios"

export const fetchFriends = createAsyncThunk("friends/fetchFriends", async () => {
    const response = await axios.get("/api/friends")
    return response.data
})

export const searchUsers = createAsyncThunk("friends/searchUsers", async (username) => {
    const response = await axios.get(`/api/users/search?username=${username}`)
    return response.data
})

export const sendFriendRequest = createAsyncThunk("friends/sendRequest", async (friendId) => {
    const response = await axios.post("/api/friends/request", { friendId })
    return response.data
})

export const respondToFriendRequest = createAsyncThunk("friends/respond", async ({ requestId, action }) => {
    const response = await axios.put(`/api/friends/request/${requestId}`, { action })
    return { requestId, action, response: response.data }
})

const friendsSlice = createSlice({
    name: "friends",
    initialState: {
        friends: [],
        searchResults: [],
        loading: false,
        error: null,
    },
    reducers: {
        clearSearchResults: (state) => {
            state.searchResults = []
        },
        updateFriendsList: (state, action) => {
            state.friends = action.payload
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchFriends.pending, (state) => {
                state.loading = true
            })
            .addCase(fetchFriends.fulfilled, (state, action) => {
                state.friends = action.payload
                state.loading = false
            })
            .addCase(fetchFriends.rejected, (state, action) => {
                state.error = action.error.message
                state.loading = false
            })
            .addCase(searchUsers.fulfilled, (state, action) => {
                state.searchResults = action.payload
            })
            .addCase(sendFriendRequest.fulfilled, (state, action) => {
                state.friends.push({
                    ...action.payload,
                    type: "sent",
                    friend: action.meta.arg,
                })
            })
            .addCase(respondToFriendRequest.fulfilled, (state, action) => {
                if (action.payload.action === "accept") {
                    const request = state.friends.find((f) => f.requestId === action.payload.requestId)
                    if (request) {
                        request.status = "accepted"
                        state.friends = [...state.friends.filter((f) => f.requestId !== action.payload.requestId), request]
                    }
                } else {
                    state.friends = state.friends.filter((f) => f.requestId !== action.payload.requestId)
                }
            })
    },
})

export const { clearSearchResults, updateFriendsList } = friendsSlice.actions
export default friendsSlice.reducer
