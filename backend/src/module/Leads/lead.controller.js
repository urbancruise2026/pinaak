import emitToHierarchy from "../../socket/EmitHelpers/socketEmitHelper.js";
import { getIO } from "../../socket/socket.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { insertMultipleLeadFollowups } from "../leadFollowups/lead_followups.model.js";
import { getCityIdsByZoneIds } from "../Reports/report.service.js";
import {
  getLeads,
  insertLead,
  updateLeadById,
  updateCustomerById,
  updateLeadUnwantedStatus,
  getAllUnwantedLeadsModel,
  createCustomers,
  getLeadById,
  checkCustomerByPhone,
  getAdvisorFollowupDetails,
  getAdvisorFollowupStats,
  insertLeadStatusHistory,
  getRfqTimeByLeadId,
} from "./lead.model.js";

const createLeads = asyncHandler(async (req, res) => {
  const data = req.body;
  const city = data.city || "Unknown";

  if (!data.firstName || !data.customerPhone) {
    throw new ApiError(400, "Name, Phone are required");
  }

  // Step 1: Customer
  const customerResult = await createCustomers({
    firstName: data.firstName,
    middleName: data.middleName,
    lastName: data.lastName,
    customerPhone: data.customerPhone,
    customerEmail: data.customerEmail,
    companyName: data.companyName,
    customerType: data.customerType,
    customerCategoryType: data.customerCategoryType,
    address: data.address,
    date_of_birth: data.date_of_birth,
    anniversary: data.anniversary,
    gender: data.gender,
    state: data.state,
    pincode: data.pincode,
    alternatePhone: data.alternatePhone,
    countryName: data.countryName,
    customerCity: data.customerCity || city,
  });

  if (!customerResult?.customerId) {
    throw new ApiError(400, "Customer could not be created or fetched");
  }

  // Step 2: Lead data prepare
  const leadData = { ...data, city, customer_id: customerResult.customerId };
  delete leadData.customerName;
  delete leadData.customerPhone;
  delete leadData.customerEmail;
  delete leadData.companyName;
  delete leadData.customerType;
  delete leadData.customerCategoryType;
  delete leadData.address;
  delete leadData.date_of_birth;
  delete leadData.anniversary;
  delete leadData.gender;
  delete leadData.state;
  delete leadData.pincode;
  delete leadData.alternatePhone;
  delete leadData.countryName;
  delete leadData.customerCity;

  // Step 3: Lead insert
  const newLead = await insertLead(leadData);
  if (!newLead) throw new ApiError(400, "Lead could not be created");

  // ✅ Step 4: Full lead fetch karo DB se
  const fullLead = await getLeadById(newLead.id);

  // ✅ Step 5: Full data ke saath socket emit

  // Step 6: Response
  return res.status(201).json(
    new ApiResponse(
      201,
      {
        customer: {
          customerId: customerResult.customerId,
          uuid: customerResult.uuid,
          isExisting: customerResult.isExisting,
          message: customerResult.message,
        },
        lead: newLead,
      },
      "Lead created successfully",
    ),
  );

  try {
    const fullLead = await getLeadById(newLead.id);
    const io = getIO();
    emitToHierarchy({
      io,
      eventName: "presalesLeadCreated",
      lead: fullLead ?? newLead,
      userIdKey: "presales_id",
    });
  } catch (err) {
    console.error("⚠️ Socket emit failed:", err.message);
  }
});

export const checkCustomerPhoneController = asyncHandler(async (req, res) => {
  const { customerPhone } = req.body;

  if (!customerPhone) {
    throw new ApiError(400, "Customer phone is required");
  }

  const customer = await checkCustomerByPhone(customerPhone);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        isExisting: !!customer,
        customer,
      },
      customer ? "Customer already exists" : "Customer not found",
    ),
  );
});

const listLeads = asyncHandler(async (req, res) => {
  const user = req.user;

  const isCityManager = user?.role_name === "City Manager";
  const isTeleSales = user?.subDepartment_name === "Tele-Sales";

  let userCityIds;

  if (isCityManager && isTeleSales) {
    const zoneIds = user?.zone_ids || [];
    userCityIds = await getCityIdsByZoneIds(zoneIds);
  } else {
    userCityIds = user?.city_ids || [];
  }

  // ✅ Sirf "Pre-Sales Executive" role ho tab presalesId pass karo
  const presalesId = user.role_name === "Pre-Sales Executive" ? user.id : null;

  const page = parseInt(req.query.page) || 1;
  const limit = 50;
  const search = req.query.search || "";
  const month = req.query.month || null;
  const year = req.query.year || null;
  const status = req.query.status || "";
  const pickupDateTime = req.query.pickupDateTime?.trim() || null;
  const dropDateTime = req.query.dropDateTime?.trim() || null;
  const liveorexpiry = req.query.liveorexpiry?.trim() || null;
  const ageFilter = req.query.ageFilter?.trim() || null;

  const leadsData = await getLeads(
    page,
    limit,
    userCityIds,
    search,
    presalesId,
    month,
    year,
    status,
    pickupDateTime,
    dropDateTime,
    liveorexpiry,
    ageFilter,
  );

  res
    .status(200)
    .json(new ApiResponse(200, leadsData, "Leads fetched successfully"));
});

const updateLeadUnwantedStatusController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { unwanted_status } = req.body;

  if (!id || !unwanted_status) {
    throw new ApiError(400, "id and status are required");
  }

  if (!["wanted", "unwanted"].includes(unwanted_status)) {
    throw new ApiError(400, "Invalid status value");
  }

  // model call
  const result = await updateLeadUnwantedStatus(id, unwanted_status);

  if (result.affectedRows === 0) {
    throw new ApiError(404, "Lead not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Lead status updated successfully"));
});

export const getAllUnwantedLeadsController = asyncHandler(async (req, res) => {
  const leads = await getAllUnwantedLeadsModel();

  if (!leads || leads.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No unwanted leads found"));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, leads, "All unwanted leads fetched successfully"),
    );
});

const updateLeadByIdController = asyncHandler(async (req, res) => {
  const { leadId } = req.params;
  const data = req.body;
  if (!leadId) {
    throw new ApiError(400, "Lead ID is required");
  }

  // Step 1: Existing Lead
  const existingLead = await getLeadById(leadId);
  if (!existingLead) {
    throw new ApiError(404, "Lead not found");
  }

  const customerId = existingLead.customer_id;
  const oldStatus = existingLead.status;
  const newStatus = data.status;

  // Step 2: Customer update
  const customerFields = {
    firstName: data.firstName,
    middleName: data.middleName,
    lastName: data.lastName,
    customerPhone: data.customerPhone,
    customerEmail: data.customerEmail,
    companyName: data.companyName,
    customerType: data.customerType,
    customerCategoryType: data.customerCategoryType,
    address: data.address,
    state: data.state,
    alternatePhone: data.alternatePhone,
    countryName: data.countryName,
    customerCity: data.customerCity,
  };

  const customerUpdateData = Object.fromEntries(
    Object.entries(customerFields).filter(([_, v]) => v !== undefined),
  );

  let updatedCustomer = null;

  if (Object.keys(customerUpdateData).length > 0) {
    updatedCustomer = await updateCustomerById(customerId, customerUpdateData);

    if (!updatedCustomer) {
      throw new ApiError(400, "Customer could not be updated");
    }
  }

  // Step 3: Lead data prepare
  const leadData = { ...data };

  delete leadData.firstName;
  delete leadData.middleName;
  delete leadData.lastName;
  delete leadData.customerPhone;
  delete leadData.customerEmail;
  delete leadData.companyName;
  delete leadData.customerType;
  delete leadData.customerCategoryType;
  delete leadData.address;
  delete leadData.date_of_birth;
  delete leadData.anniversary;
  delete leadData.gender;
  delete leadData.state;
  delete leadData.pincode;
  delete leadData.alternatePhone;
  delete leadData.countryName;
  delete leadData.customerCity;
  // ✅ followup-related fields lead table ka part nahi hain, isliye delete karo
  delete leadData.follow_ups; // ✅ fixed
  delete leadData.followup_date;
  delete leadData.followup_remark;

  // Step 4: Lead update
  let updatedLead = null;

  if (Object.keys(leadData).length > 0) {
    updatedLead = await updateLeadById(leadId, leadData);

    if (!updatedLead) {
      throw new ApiError(400, "Lead could not be updated");
    }
  }

  // Step 5: Status History
  if (newStatus && oldStatus && oldStatus !== newStatus) {
    await insertLeadStatusHistory({
      lead_id: Number(leadId),
      old_status: oldStatus,
      new_status: newStatus,
      changed_by: req.user?.id ?? null,
    });
  }

  if (Array.isArray(data.follow_ups) && data.follow_ups.length > 0) {
    try {
      const adviserId = existingLead.advisor_id; // ✅ leads table se lelo

      if (!adviserId) {
        console.warn("⚠️ adviser_id not found on lead, followups skip ho gaye");
      } else {
        const validFollowups = data.follow_ups
          .filter((f) => f.followup_date)
          .map((f) => ({
            leads_id: Number(leadId),
            adviser_id: adviserId,
            followup_date: f.followup_date,
            remark: f.followup_remark || null,
          }));

        if (validFollowups.length > 0) {
          await insertMultipleLeadFollowups(validFollowups);
        }
      }
    } catch (err) {
      console.error("⚠️ Followup creation failed:", err.message);
    }
  }
  // Step 7: Full Lead Fetch
  const fullLead = await getLeadById(updatedLead?.id ?? leadId);

  // Step 8: Socket Emit
  try {
    const io = getIO();

    emitToHierarchy({
      io,
      eventName: "leadUpdated",
      lead: fullLead ?? updatedLead,
      userIdKey: "presales_id",
    });
  } catch (err) {
    console.error("⚠️ Socket emit failed:", err.message);
  }

  // Step 9: Response
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        customer: updatedCustomer,
        lead: updatedLead,
      },
      "Lead and customer updated successfully",
    ),
  );
});

export const getAdvisorFollowupStatsController = asyncHandler(
  async (req, res) => {
    const user = req.user;

    const isCityManager = user?.role_name === "City Manager";

    const isTeleSales = user?.subDepartment_name === "Tele-Sales";

    let cityIds = [];

    if (isCityManager && isTeleSales) {
      const zoneIds = user?.zone_ids || [];

      cityIds = await getCityIdsByZoneIds(zoneIds);
    } else {
      cityIds = user?.city_ids || [];
    }

    const stats = await getAdvisorFollowupStats(cityIds);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          stats,
          "Advisor follow-up stats fetched successfully",
        ),
      );
  },
);

export const getAdvisorFollowupDetailsController = asyncHandler(
  async (req, res) => {
    const { advisorId } = req.params;

    if (!advisorId) {
      throw new ApiError(400, "advisorId is required");
    }

    const followups = await getAdvisorFollowupDetails(advisorId);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          followups,
          "Advisor follow-up messages fetched successfully",
        ),
      );
  },
);

export const getLeadRfqTimeController = asyncHandler(async (req, res) => {
  const { leadId } = req.params;
  if (!leadId) throw new ApiError(400, "leadId is required");

  const rfqTime = await getRfqTimeByLeadId(leadId);

  if (!rfqTime) {
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Lead has not reached RFQ status yet"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, rfqTime, "RFQ time fetched successfully"));
});
export {
  createLeads,
  listLeads,
  updateLeadByIdController,
  updateLeadUnwantedStatusController,
};
