import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Vehicle } from "@/types/types";
import {
  VehicleStatus,
  createVehiclesManagerApi,
  getVehicleManagersApi,
  GetVehicleManagersParams,
  GetVehicleManagersResponse,
  getVehicleMasterVariantsApi,
  getVehicleMasterCodesApi,
  getVehicleManagerVendorsApi,
  getVehicleMasterAmenitiesApi,
  getAllCitiesApi,
  updateVehicleStatusApi,
  getVehicleManagerByIdApi,
  VehicleMasterCode,
  VehicleMasterVariant,
  VehicleManagerVendor,
  VehicleMasterAmenity,
  VehicleCity,
} from "./vehicleManagerApi";

type CreateVehicleManagerPayload = Omit<Vehicle, "id">;

interface VehicleManagerState {
  vehicles: Vehicle[];
  loading: boolean;
  error: string | null;
  categories: string[];
  variants: string[];
  seats: string[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  vehicleMasterCodes: VehicleMasterCode[];
  vehicleMasterVariants: VehicleMasterVariant[];
  vendors: VehicleManagerVendor[];
  vehicleMasterAmenities: VehicleMasterAmenity[];
  cities: VehicleCity[];
  codesLoading: boolean;
  variantsLoading: boolean;
  vendorsLoading: boolean;
  amenitiesLoading: boolean;
  citiesLoading: boolean;
  statusUpdatingId: number | string | null;
  vehicleManagerDetails: Vehicle | null;
  vehicleManagerDetailsLoading: boolean;
  vehicleManagerDetailsError: string | null;
}

const initialState: VehicleManagerState = {
  vehicles: [],
  loading: false,
  error: null,
  categories: [],
  variants: [],
  seats: [],
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 0,
  vehicleMasterCodes: [],
  vehicleMasterVariants: [],
  vendors: [],
  vehicleMasterAmenities: [],
  cities: [],
  codesLoading: false,
  variantsLoading: false,
  vendorsLoading: false,
  amenitiesLoading: false,
  citiesLoading: false,
  statusUpdatingId: null,
  vehicleManagerDetails: null,
  vehicleManagerDetailsLoading: false,
  vehicleManagerDetailsError: null,
};

export const createVehicleManager = createAsyncThunk<
  Vehicle,
  CreateVehicleManagerPayload,
  { rejectValue: string }
>(
  "vehicleManager/createVehicleManager",

  async (vehicleData, { rejectWithValue }) => {
    try {
      return await createVehiclesManagerApi(vehicleData);
    } catch (error: any) {
      return rejectWithValue(
        error?.message || "Failed to create vehicle manager",
      );
    }
  },
);

export const getVehicleManagers = createAsyncThunk<
  GetVehicleManagersResponse,
  GetVehicleManagersParams | undefined,
  { rejectValue: string }
>(
  "vehicleManager/getVehicleManagers",

  async (params, { rejectWithValue }) => {
    try {
      return await getVehicleManagersApi(params);
    } catch (error: any) {
      return rejectWithValue(
        error?.message || "Failed to fetch vehicle managers",
      );
    }
  },
);

export const getVehicleManagerById = createAsyncThunk<
  Vehicle,
  number | string,
  { rejectValue: string }
>(
  "vehicleManager/getVehicleManagerById",

  async (id, { rejectWithValue }) => {
    try {
      return await getVehicleManagerByIdApi(id);
    } catch (error: any) {
      return rejectWithValue(
        error?.message || "Failed to fetch vehicle manager details",
      );
    }
  },
);

export const getVehicleMasterCodes = createAsyncThunk<
  VehicleMasterCode[],
  void,
  { rejectValue: string }
>(
  "vehicleManager/getVehicleMasterCodes",

  async (_, { rejectWithValue }) => {
    try {
      return await getVehicleMasterCodesApi();
    } catch (error: any) {
      return rejectWithValue(
        error?.message || "Failed to fetch vehicle master codes",
      );
    }
  },
);

export const getVehicleMasterVariants = createAsyncThunk<
  VehicleMasterVariant[],
  string, // ✅ ab "code" argument leta hai
  { rejectValue: string }
>(
  "vehicle/getVehicleMasterVariants",

  async (code, { rejectWithValue }) => {
    try {
      return await getVehicleMasterVariantsApi(code);
    } catch (error: any) {
      return rejectWithValue(
        error?.message || "Failed to fetch vehicle master variants",
      );
    }
  },
);

export const getVehicleMasterAmenities = createAsyncThunk<
  VehicleMasterAmenity[],
  void,
  { rejectValue: string }
>(
  "vehicleManager/getVehicleMasterAmenities",

  async (_, { rejectWithValue }) => {
    try {
      return await getVehicleMasterAmenitiesApi();
    } catch (error: any) {
      return rejectWithValue(
        error?.message || "Failed to fetch vehicle master amenities",
      );
    }
  },
);

export const getVehicleManagerVendors = createAsyncThunk<
  VehicleManagerVendor[],
  void,
  { rejectValue: string }
>(
  "vehicleManager/getVehicleManagerVendors",

  async (_, { rejectWithValue }) => {
    try {
      return await getVehicleManagerVendorsApi();
    } catch (error: any) {
      return rejectWithValue(error?.message || "Failed to fetch vendors");
    }
  },
);

export const getAllCities = createAsyncThunk<
  VehicleCity[],
  void,
  { rejectValue: string }
>(
  "vehicleManager/getAllCities",

  async (_, { rejectWithValue }) => {
    try {
      return await getAllCitiesApi();
    } catch (error: any) {
      return rejectWithValue(error?.message || "Failed to fetch cities");
    }
  },
);

export const updateVehicleStatus = createAsyncThunk<
  Vehicle,
  {
    vehicleId: number | string;
    status: VehicleStatus;
  },
  { rejectValue: string }
>(
  "vehicleManager/updateVehicleStatus",
  async ({ vehicleId, status }, { rejectWithValue }) => {
    try {
      const response = await updateVehicleStatusApi(vehicleId, status);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error?.message || "Failed to update vehicle status",
      );
    }
  },
);

const vehicleManagerSlice = createSlice({
  name: "vehicleManager",
  initialState,

  reducers: {
    clearVehicleManagerDetails: (state) => {
      state.vehicleManagerDetails = null;
      state.vehicleManagerDetailsLoading = false;
      state.vehicleManagerDetailsError = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(createVehicleManager.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createVehicleManager.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.vehicles.unshift(action.payload);
        state.total += 1;
      })

      .addCase(createVehicleManager.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create vehicle manager";
      });

    builder
      .addCase(getVehicleManagers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getVehicleManagers.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.vehicles = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
        state.totalPages = action.payload.totalPages;
      })

      .addCase(getVehicleManagers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch vehicle managers";
      });

    builder
      .addCase(getVehicleManagerById.pending, (state) => {
        state.vehicleManagerDetailsLoading = true;
        state.vehicleManagerDetailsError = null;
        state.vehicleManagerDetails = null;
      })

      .addCase(getVehicleManagerById.fulfilled, (state, action) => {
        state.vehicleManagerDetailsLoading = false;
        state.vehicleManagerDetailsError = null;
        state.vehicleManagerDetails = action.payload;
      })

      .addCase(getVehicleManagerById.rejected, (state, action) => {
        state.vehicleManagerDetailsLoading = false;
        state.vehicleManagerDetails = null;
        state.vehicleManagerDetailsError =
          action.payload || "Failed to fetch vehicle manager details";
      });

    builder
      .addCase(getVehicleMasterCodes.pending, (state) => {
        state.codesLoading = true;
      })

      .addCase(getVehicleMasterCodes.fulfilled, (state, action) => {
        state.codesLoading = false;
        state.vehicleMasterCodes = action.payload;
      })

      .addCase(getVehicleMasterCodes.rejected, (state, action) => {
        state.codesLoading = false;

        state.error = action.payload || "Failed to fetch vehicle master codes";
      });

    builder
      .addCase(getVehicleMasterVariants.pending, (state) => {
        state.variantsLoading = true;
      })

      .addCase(getVehicleMasterVariants.fulfilled, (state, action) => {
        state.variantsLoading = false;
        state.vehicleMasterVariants = action.payload;
      })

      .addCase(getVehicleMasterVariants.rejected, (state, action) => {
        state.variantsLoading = false;
        state.error =
          action.payload || "Failed to fetch vehicle master variants";
      });

    builder
      .addCase(getVehicleMasterAmenities.pending, (state) => {
        state.amenitiesLoading = true;
      })

      .addCase(getVehicleMasterAmenities.fulfilled, (state, action) => {
        state.amenitiesLoading = false;
        state.vehicleMasterAmenities = action.payload;
      })

      .addCase(getVehicleMasterAmenities.rejected, (state, action) => {
        state.amenitiesLoading = false;
        state.error =
          action.payload || "Failed to fetch vehicle master amenities";
      });

    builder
      .addCase(getVehicleManagerVendors.pending, (state) => {
        state.vendorsLoading = true;
      })
      .addCase(getVehicleManagerVendors.fulfilled, (state, action) => {
        state.vendorsLoading = false;
        state.vendors = action.payload;
      })

      .addCase(getVehicleManagerVendors.rejected, (state, action) => {
        state.vendorsLoading = false;
        state.error = action.payload || "Failed to fetch vendors";
      });

    builder
      .addCase(getAllCities.pending, (state) => {
        state.citiesLoading = true;
      })

      .addCase(getAllCities.fulfilled, (state, action) => {
        state.citiesLoading = false;
        state.cities = action.payload;
      })

      .addCase(getAllCities.rejected, (state, action) => {
        state.citiesLoading = false;
        state.error = action.payload || "Failed to fetch cities";
      });

    builder
      .addCase(updateVehicleStatus.pending, (state, action) => {
        state.error = null;
        state.statusUpdatingId = action.meta.arg.vehicleId;
      })

      .addCase(updateVehicleStatus.fulfilled, (state, action) => {
        state.error = null;
        state.statusUpdatingId = null;
        const updatedVehicle = action.payload;
        const index = state.vehicles.findIndex(
          (vehicle) => vehicle.id === updatedVehicle.id,
        );

        if (index !== -1) {
          state.vehicles[index] = updatedVehicle;
        }
      })
      .addCase(updateVehicleStatus.rejected, (state, action) => {
        state.statusUpdatingId = null;
        state.error = action.payload || "Failed to update vehicle status";
      });
  },
});
export const { clearVehicleManagerDetails } = vehicleManagerSlice.actions;
export default vehicleManagerSlice.reducer;
