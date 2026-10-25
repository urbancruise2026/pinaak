import { configureStore } from "@reduxjs/toolkit";
import userReducer from "@/features/user/userSlice";
import leadReducer from "@/features/leads/leadSlice";
import countryReducer from "@/features/location/countrycodeSlice";
import vehicleReducer from "@/features/vehicles/vehicleSlice";
import travelcityReducer from "@/features/location/travelcitySlice";
import stateCityReducer from "@/features/location/stateSlice";
import travelAdvisorReducer from "@/features/user/accessSlice";
import newCustomerReducer from "@/features/customers/newCustomerSlice";
import vendorReducer from "@/features/vendors/vendorSlice";
import driverReducer from "@/features/drivers/driverSlice";
import monthlyReducer from "@/features/reports/monthlyReportSlice";
import websiteGacReducer from "@/features/website/websiteSlice";
import dsrReducer from "@/features/dsr/dsrSlice";
import downloadReducer from "@/features/download/downloadSlice";
import rateReducer from "@/features/rate-quotation/rateSlice";
import ruleReducer from "@/features/rules/rulesSlice";
import navigationReducer from "./navigationSlice";
import vehicleManagerReducer from "@/features/vehicles/vehicleManagerSlice";
import followUpReducer from "@/features/leads/lead_followupsSlice";
import locationReducer from "@/features/location/regionZoneCitySlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    lead: leadReducer,
    country: countryReducer,
    vehicle: vehicleReducer,
    travelcity: travelcityReducer,
    stateCity: stateCityReducer,
    travelAdvisor: travelAdvisorReducer,
    newCustomer: newCustomerReducer,
    vendor: vendorReducer,
    driver: driverReducer,
    report: monthlyReducer,
    websiteGac: websiteGacReducer,
    dsr: dsrReducer,
    download: downloadReducer,
    rate: rateReducer,
    rule: ruleReducer,
    navigation: navigationReducer,
    vehicleManager: vehicleManagerReducer,
    followUp: followUpReducer,
    location: locationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;