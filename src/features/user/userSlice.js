import { createSlice } from '@reduxjs/toolkit';
import { getAddress } from '../../services/apiGeocoding';
import { createAsyncThunk } from '@reduxjs/toolkit';

function getPosition() {
  return new Promise(function (resolve, reject) {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}

//By convention, we name the async function that fetches the user's address fetchAddress
//not getAddress
// We use createAsyncThunk to create a thunk that will fetch the user's address
// This thunk will be dispatched in the OrderForm component
export const fetchAddress = createAsyncThunk('user/fetchAddress', async () => {
  // 1) We get the user's geolocation position
  const positionObj = await getPosition();
  const position = {
    latitude: positionObj.coords.latitude,
    longitude: positionObj.coords.longitude,
  };

  // 2) Then we use a reverse geocoding API to get a description of the user's address, so we can display it the order form, so that the user can correct it if wrong
  const addressObj = await getAddress(position);
  const address = `${addressObj?.locality}, ${addressObj?.city} ${addressObj?.postcode}, ${addressObj?.countryName}`;

  // 3) Then we return an object with the data that we are interested in
  //Payload of the fulfilled state
  return { position, address };
});

const initialState = {
  username: 'Oliver Hidalgo',
  status: 'idle',
  position: {},
  address: '',
  error: '',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateName(state, action) {
      state.username = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchAddress.pending, (state, action) => {
      state.status = 'loading';
    });
    builder.addCase(fetchAddress.fulfilled, (state, action) => {
      state.status = 'idle';
      state.position = action.payload.position;
      state.address = action.payload.address;
    });
    builder.addCase(fetchAddress.rejected, (state, action) => {
      state.status = 'error';
      state.error = action.error.message;
    });
  },
});

export const { updateName } = userSlice.actions;

export default userSlice.reducer;

export const getUsername = (state) => state.user.username;
