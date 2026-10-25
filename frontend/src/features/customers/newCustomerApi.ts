import axiosInstance from "@/lib/axioInstance";

export interface CustomerRecord {
  id?: number;
  uuid?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  customerName?: string;
  customerPhone: string;
  customerEmail?: string;
  companyName?: string;
  customerType?: string;
  customerCategoryType?: string;
  alternatePhone?: string;
  countryName?: string;
  customerCity?: string;
  address?: string;
  date_of_birth?: string;
  anniversary?: string;
  gender?: string;
  state?: string;
  pincode?: string;
  city?: string;
  cityId?: number | null;
  stateId?: number | null;
}

// ─── FIELD MAPPER ─────────────────────────────────
const mapFormToBackend = (
  formData: Partial<CustomerRecord> & {
    phone?: string;
    email?: string;
    dateOfBirth?: string;
  },
): Partial<CustomerRecord> => ({
  firstName: formData.firstName || undefined,
  middleName: formData.middleName || undefined,
  lastName: formData.lastName || undefined,
  customerPhone: formData.customerPhone || (formData as any).phone,
  customerEmail: formData.customerEmail || (formData as any).email || undefined,
  alternatePhone: formData.alternatePhone || undefined,
  date_of_birth:
    formData.date_of_birth || (formData as any).dateOfBirth || undefined,
  anniversary: formData.anniversary || undefined,
  gender: formData.gender || undefined,
  address: formData.address || undefined,
  state: formData.state || undefined,
  city: formData.city || undefined,
  pincode: formData.pincode || undefined,
  stateId: formData.stateId ?? undefined,
  cityId: formData.cityId ?? undefined,
  companyName: formData.companyName || undefined,
  customerType: formData.customerType || undefined,
  customerCategoryType: formData.customerCategoryType || undefined,
  countryName: formData.countryName || undefined,
  customerCity: formData.customerCity || undefined,
});

// ─── FETCH ALL CUSTOMERS ───────────────────────────
export const fetchCustomersAPI = async (): Promise<CustomerRecord[]> => {
  try {
    const response = await axiosInstance.get("/newcustomer");

    if (response.data?.data?.customers) {
      return response.data.data.customers;
    }

    return [];
  } catch (error: any) {
    console.error(
      "Error fetching customers:",
      error.response?.data || error.message,
    );
    throw new Error(
      error.response?.data?.message || "Error fetching customers",
    );
  }
};

// ─── SEARCH CUSTOMERS ──────────────────────────────
export const searchCustomersAPI = async (
  searchTerm: string,
): Promise<CustomerRecord[]> => {
  try {
    const response = await axiosInstance.get("/newcustomer/search", {
      params: { search: searchTerm },
    });

    if (response.data?.data?.customers) return response.data.data.customers;
    if (response.data?.customers) return response.data.customers;
    if (Array.isArray(response.data)) return response.data;

    return [];
  } catch (error: any) {
    console.error(
      "Error searching customers:",
      error.response?.data || error.message,
    );
    throw new Error(
      error.response?.data?.message || "Error searching customers",
    );
  }
};

// ─── CREATE CUSTOMER ───────────────────────────────
export const createCustomerAPI = async (
  formData: Partial<CustomerRecord> & { phone?: string; email?: string },
): Promise<CustomerRecord> => {
  try {
    const payload = mapFormToBackend(formData);

    const response = await axiosInstance.post("/newcustomer", payload);

    return response.data?.data?.customer || response.data.data;
  } catch (error: any) {
    console.error(
      "Error creating customer:",
      error.response?.data || error.message,
    );
    throw new Error(error.response?.data?.message || "Error creating customer");
  }
};

// ─── UPDATE CUSTOMER ───────────────────────────────
export const updateCustomerAPI = async (
  id: number,
  formData: Partial<CustomerRecord> & {
    phone?: string;
    email?: string;
    dateOfBirth?: string;
  },
): Promise<CustomerRecord> => {
  try {
    const payload = mapFormToBackend(formData);

    const response = await axiosInstance.put(`/newcustomer/${id}`, payload);

    if (response.data?.data?.customer) return response.data.data.customer;
    if (response.data?.data) return response.data.data;

    return { ...payload, id, customerPhone: payload.customerPhone! };
  } catch (error: any) {
    console.error(
      "Error updating customer:",
      error.response?.data || error.message,
    );
    throw new Error(error.response?.data?.message || "Error updating customer");
  }
};

// ─── GET CUSTOMER BY ID ─────────────────────────────

export const getCustomerByIdAPI = async (
  id: number,
): Promise<CustomerRecord> => {
  try {
    const response = await axiosInstance.get(`/newcustomer/${id}`);

    return response.data?.data?.customer || response.data?.data;
  } catch (error: any) {
    console.error(
      "Error fetching customer by id:",
      error.response?.data || error.message,
    );

    throw new Error(
      error.response?.data?.message || "Error fetching customer details",
    );
  }
};
