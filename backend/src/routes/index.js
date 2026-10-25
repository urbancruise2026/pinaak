import userRouter from "../module/user/user.route.js";
import leadRouter from "../module/Leads/lead.route.js";
import countryRoutes from "../module/countrycode/country.route.js";
import vehicaleCodeRouter from "../module/vehiclemaster/vehiclemaster.route.js";
import travelcityRouter from "../module/travelCitys/travelCity.route.js";
import reportsRouter from "../module/Reports/report.route.js";
import firebaseRoutes from "../module/Leads/firebase.route.js";
import annualReportRoutes from "../module/AnnualReport/annualReport.route.js";
import hoursReportRoutes from "../module/HoursReport/hoursreport.route.js";
import stateRouter from "../module/State/state.route.js";
import AssignRoutes from "../module/Assign/assign.route.js";
import NewCustomerRouter from "../module/NewCustomer/newCustomer.route.js";
import vendorRouter from "../module/Vendors/vendor.route.js";
import driverRouter from "../module/Driver/driver.route.js";
import websiteGacRoutes from "../module/Website/website.route.js";
import dsrRouter from "../module/DSR/dsr.route.js";
import downloadRoute from "../module/Download/download.route.js";
import rateRoute from "../module/Rate/rate.route.js";
import ruleRouter from "../module/Rules/rules.route.js";
import vehiclemanagerRouter from "../module/vehicleManager/vehicleManager.route.js";
import followupRouter from "../module/leadFollowups/lead_followups.route.js";
import zonecity from "../module/RegionZoneCity/zone.route.js"

const allRoutes = (app) => {
  app.use("/api/v1/user", userRouter);
  app.use("/api/v1/lead", leadRouter);
  app.use("/api/v1/country", countryRoutes);
  app.use("/api/v1/vehicle", vehicaleCodeRouter);
  app.use("/api/v1/travelcity", travelcityRouter);
  app.use("/api/v1/reports", reportsRouter);
  app.use("/api/v1/firebase", firebaseRoutes);
  app.use("/api/v1/annualreport", annualReportRoutes);
  app.use("/api/v1/hoursreport", hoursReportRoutes);
  app.use("/api/v1/state", stateRouter);
  app.use("/api/v1/state", stateRouter);
  app.use("/api/v1/assign", AssignRoutes);
  app.use("/api/v1/newcustomer", NewCustomerRouter);
  app.use("/api/v1/vendor", vendorRouter);
  app.use("/api/v1/driver", driverRouter);
  app.use("/api/v1/website-gac", websiteGacRoutes);
  app.use("/api/v1/dsr", dsrRouter);
  app.use("/api/v1/download", downloadRoute);
  app.use("/api/v1/rate", rateRoute);
  app.use("/api/v1/rule", ruleRouter);
  app.use("/api/v1/vehiclemanager", vehiclemanagerRouter);

  app.use("/api/v1/followup", followupRouter);
  app.use("/api/v1/zones",zonecity)
};

export default allRoutes;
