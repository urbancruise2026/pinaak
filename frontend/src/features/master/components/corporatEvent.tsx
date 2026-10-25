  'use client';

  import React, { useState, useEffect } from 'react';
  import { useForm } from 'react-hook-form';
  import { zodResolver } from '@hookform/resolvers/zod';
  import * as z from 'zod';
  import { User, Mail, Phone, FileText, MapPin, Users, Calendar, PhoneCall, Car } from 'lucide-react';
  import { statesCities } from '../../location/data/statesCities';

  const allCities = statesCities.flatMap(state => state.cities);

  // Define vehicle type
  type Vehicle = {
    type: string;
    category: string;
    seater: number;
    quantity: number;
  };

  // Define vehicle category type
  type VehicleCategory = {
    id: number;
    name: string;
  };

  // Define validation schema
  const corporateProfileSchema = z.object({
    // SPOC Information
    city: z.string().min(1, 'City is required'),

    // Company Information
    companyName: z.string().min(1, 'Company name is required'),
    corporateId: z.string().optional(),
    gstNumber: z.string().min(1, 'GST number is required'),
    billingAddress: z.string().min(1, 'Billing address is required'),
    companyAddress: z.string().min(1, 'Company address is required'),
    
    // SPOC Information
    spocName: z.string().min(1, 'SPOC name is required'),
    spocMobile: z.string()
      .min(10, 'Mobile number must be at least 10 digits')
      .max(15, 'Mobile number too long'),
    spocEmail: z.string()
      .email('Invalid email address')
      .min(1, 'Email is required'),
    
    // Passenger Details
    passengerTotal: z.number()
      .min(1, 'At least 1 passenger required')
      .max(100, 'Maximum 100 passengers allowed'),
    
    // Vehicle Requirements
    vehicles: z.array(z.object({
      type: z.string().min(1, 'Vehicle type required'),
      category: z.string().min(1, 'Vehicle category required'),
      seater: z.number().min(1, 'Seater capacity required'),
      quantity: z.number().min(1, 'Quantity required'),
    })).min(1, 'At least one vehicle required'),

    // Trip Details
    tripType: z.enum(['pickup', 'drop', 'both'], {
      message: 'Please select trip type',
    }),
    
    // Pickup Details
    pickupAddress: z.string().min(1, 'Pickup address required'),
    pickupDate: z.string().min(1, 'Pickup date required'),
    pickupTime: z.string().min(1, 'Pickup time required'),
    
    // Drop Details
    dropAddress: z.string().min(1, 'Drop address required'),
    dropDate: z.string().optional(),
    dropTime: z.string().optional(),
    
    // Start & End Details
    tripStartDate: z.string().min(1, 'Trip start date required'),
    tripEndDate: z.string().min(1, 'Trip end date required'),
    
    // Additional Information
    languagePreference: z.string().optional(),
    message: z.string().max(500, 'Message too long').optional(),
    itinerary: z.string().max(1000, 'Itinerary too long').optional(),
  });

  // Define form data type
  type CorporateProfileFormData = z.infer<typeof corporateProfileSchema>;

  // Define vendor form data type
  type VendorFormData = {
    name: string;
    email: string;
    phone: string;
    panNumber: string;
    aadhaarNumber: string;
    address: string;
    passportPhoto: File | null;
  };

  export default function CorporateProfileForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [vehicles, setVehicles] = useState([{ type: '', category: '', seater: 0, quantity: 1 }]);
    const [vehicleCategories, setVehicleCategories] = useState<VehicleCategory[]>([]);

    // Fetch vehicle categories on component mount
    useEffect(() => {
      const fetchVehicleCategories = async () => {
        try {
          const response = await fetch('/api/vehicle-categories');
          if (response.ok) {
            const data = await response.json();
            setVehicleCategories(data);
          } else {
            console.error('Failed to fetch vehicle categories');
          }
        } catch (error) {
          console.error('Error fetching vehicle categories:', error);
        }
      };
      fetchVehicleCategories();
    }, []);

    // Vendor form state
    const [formData, setFormData] = useState<VendorFormData>({
      name: '',
      email: '',
      phone: '',
      panNumber: '',
      aadhaarNumber: '',
      address: '',
      passportPhoto: null,
    });
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const markFieldTouched = (field: string) => {
      setTouched({ ...touched, [field]: true });
    };

    const getInputClass = (field: string, required: boolean) => {
      return `w-full pl-10 pr-3 py-2 border ${
        touched[field] && !formData[field as keyof VendorFormData] && required ? 'border-red-500' : 'border-gray-300'
      } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`;
    };

    const getMaxLength = (field: string) => {
      if (field === 'phone') return 15;
      if (field === 'panNumber') return 10;
      if (field === 'aadhaarNumber') return 12;
      return 50;
    };

    const getTextAreaClass = (field: string, required: boolean) => {
      return `w-full pl-10 pr-3 py-2 border ${
        touched[field] && !formData[field as keyof VendorFormData] && required ? 'border-red-500' : 'border-gray-300'
      } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`;
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, field: string) => {
      if (event.target.files && event.target.files.length > 0) {
        setFormData({ ...formData, [field]: event.target.files[0] });
      }
    };

    const {
      register,
      handleSubmit,
      formState: { errors, isValid },
      watch,
      setValue,
    } = useForm({
      resolver: zodResolver(corporateProfileSchema),
      defaultValues: {
        tripType: 'both',
        passengerTotal: 1,
        vehicles: [{ type: '', category: '', seater: 0, quantity: 1 }],
      },
    });

    const tripType = watch('tripType');

    const vehicleTypes = [
      { value: 'sedan', label: 'Sedan (4 seater)' },
      { value: 'suv', label: 'SUV (6-7 seater)' },
      { value: 'tempo_traveller', label: 'Tempo Traveller (12 seater)' },
      { value: 'minibus', label: 'Mini Bus (20-25 seater)' },
      { value: 'bus', label: 'Bus (40-50 seater)' },
      { value: 'luxury_car', label: 'Luxury Car' },
      { value: 'other', label: 'Other' },
    ];



    const seaterOptions = [
      { value: 4, label: '4 Seater' },
      { value: 6, label: '6 Seater' },
      { value: 7, label: '7 Seater' },
      { value: 12, label: '12 Seater' },
      { value: 20, label: '20 Seater' },
      { value: 25, label: '25 Seater' },
      { value: 40, label: '40 Seater' },
      { value: 50, label: '50 Seater' },
    ];

    const addVehicle = () => {
      setVehicles([...vehicles, { type: '', category: '', seater: 0, quantity: 1 }]);
    };

    const removeVehicle = (index: number) => {
      if (vehicles.length > 1) {
        const updatedVehicles = vehicles.filter((_, i) => i !== index);
        setVehicles(updatedVehicles);
        setValue('vehicles', updatedVehicles);
      }
    };

    const updateVehicle = (index: number, field: keyof Vehicle, value: string | number) => {
      const updatedVehicles = vehicles.map((v, i) =>
        i === index ? { ...v, [field]: value } : v
      );
      setVehicles(updatedVehicles);
      setValue('vehicles', updatedVehicles);
    };

    const onSubmit = async (data: CorporateProfileFormData) => {
      setIsSubmitting(true);
      try {
        // Combine corporate and vendor data
        const submissionData = {
          ...data,
          vendorInfo: formData,
        };

        // Send data to your API
        const response = await fetch('/api/corporate-profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submissionData),
        });

        if (response.ok) {
          alert('Corporate profile submitted successfully!');
          // Reset form or redirect
        } else {
          throw new Error('Submission failed');
        }
      } catch (error) {
        console.error('Error submitting form:', error);
        alert('Failed to submit. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
        <div className="p-6 w-[165vh] mx-auto bg-white shadow-xl rounded-lg">
    
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Company Information Section */}
       
  <div className="mb-8 bg-orange-100 p-4 rounded-xl">
            <h2 className="text-2xl font-bold text-center text-orange-600">Customer Event Management</h2>
            <p className="text-center text-orange-700 mt-2">
              <span className="text-red-500">*</span> All fields marked with asterisk are required
            </p>
          </div> 
          
        <div className="border rounded-xl p-6 bg-blue-50">
            <h3 className="text-xl font-semibold text-blue-800 mb-6 pb-3 border-b">
              <span className="bg-blue-600 text-white px-3 py-1 rounded-md mr-2">1</span>
              SPOC Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block  text-md font-extrabold   text-gray-700 mb-1 ">
                  SPOC Name <span className="text-red-500">*</span>
                </label>
                <div className="relative group ">
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleFieldChange}
                    onBlur={() => markFieldTouched("name")}
                    className="w-full px-3 py-2 border bg-white px-10 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={getMaxLength("name")}
                    placeholder="Enter vendor name"
                    required
                  />
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 group-focus-within:animate-pulse" size={20} />

                </div>
              </div>
              <div>
                <label className="block  text-md font-extrabold   text-gray-700 mb-1">
                  SPOC Email <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleFieldChange}
                    onBlur={() => markFieldTouched("email")}
                  
                    className="w-full px-3 py-2 border bg-white px-10 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={getMaxLength("email")}
                    placeholder="Enter email address"
                    required
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 group-focus-within:animate-pulse" size={20} />
                </div>
              </div>
              <div>
                <label className="block  text-md font-extrabold   text-gray-700 mb-1">
                  SPOC Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative group ">
                  <input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleFieldChange}
                    onBlur={() => markFieldTouched("phone")}
                    className="w-full px-3 py-2 border bg-white px-10 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={getMaxLength("phone")}
                    placeholder="Enter phone number"
                    inputMode="numeric"
                    required
                  />
                  <Car className="absolute left-3 top-1/2 -translate-y-1/2 text-green-800 group-focus-within:animate-pulse" size={20} />
                </div>
              </div>

              <div>
                <label className="block  text-md font-extrabold   text-gray-700 mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <select
                    {...register('city')}
                    className="w-full px-3 py-2 border bg-white px-10 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select City</option>
                    {allCities.map((city, index) => (
                      <option key={index} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 group-focus-within:animate-pulse" size={20} />
                </div>
                {errors.city && (
                  <p className="text-red-500 text-sm mt-1">{errors.city?.message}</p>
                )}
              </div>



              </div>
            </div>
        



  <div className="border rounded-xl p-6 bg-green-50">
            <h3 className="text-xl font-semibold text-green-800 mb-6 pb-3 border-b">
              <span className="bg-green-600 text-white px-3 py-1 rounded-md mr-2">2</span>
                Event Information
            </h3>

            


          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block  text-md font-extrabold   text-gray-700 mb-1">
                  Event Details *
                </label>
                <div className="relative group bg-white">
                  <input
                    type="text"
                    {...register('companyName')}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter event details"
                  />
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-green-800 group-focus-within:animate-pulse" size={20} />
                </div>
                {errors.companyName && (
                  <p className="text-red-500 text-sm mt-1">{errors.companyName?.message}</p>
                )}
              </div>

              <div>
                <label className="block  text-md font-extrabold   text-gray-700 mb-1">
  Event Start Date              </label>
                <div className="relative group">
                  <input
                    type="date"
                    {...register('tripStartDate')}
                    className="w-full px-3 py-2 border bg-white px-10 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter event start date"
                  />
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-green-800 group-focus-within:animate-pulse" size={20} />
                </div>
                {errors.tripStartDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.tripStartDate?.message}</p>
                )}
              </div>
  <div>
                <label className="block  text-md font-extrabold   text-gray-700 mb-1">
  Event End Date              </label>
                <div className="relative group bg-white ">
                  <input
                    type="date"
                    {...register('tripEndDate')}
                    className="w-full px-3 py-2 border bg-white px-10 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter event end date"
                  />
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-green-800 group-focus-within:animate-pulse" size={20} />
                </div>
                {errors.tripEndDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.tripEndDate?.message}</p>
                )}
              </div>
          
              <div>
                <label className="block  text-md font-extrabold   text-gray-700 mb-1">
                  Total Passenger *
                </label>
                <div className="relative group bg-white">
                  <input
                    type="number"
                    {...register('passengerTotal', { valueAsNumber: true })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Total passengers"
                    min="1"
                    max="100"
                  />
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-green-800 group-focus-within:animate-pulse" size={20} />
                </div>
                {errors.passengerTotal && (
                  <p className="text-red-500 text-sm mt-1">{errors.passengerTotal?.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block  text-md font-extrabold   text-gray-700 mb-1">
                  Event Venue Address *
                </label>
                <div className="relative group ">
                  <textarea
                    {...register('billingAddress')}
                    rows={2}
                    className="w-full px-3 py-2 border bg-white px-10 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter event venue address"
                  />
                  <MapPin className="absolute left-3 top-3 text-green-800 group-focus-within:animate-pulse" size={20} />
                </div>
                {errors.billingAddress && (
                  <p className="text-red-500 text-sm mt-1">{errors.billingAddress?.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block  text-md font-extrabold   text-gray-700 mb-1">
                  Address *
                </label>
                <div className="relative group b">
                  <textarea
                    {...register('companyAddress')}
                    rows={2}
                    className="w-full px-3 py-2 border bg-white px-10 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter address"
                  />
                  <MapPin className="absolute left-3 top-3 text-green-800 group-focus-within:animate-pulse" size={20} />
                </div>
                {errors.companyAddress && (
                  <p className="text-red-500 text-sm mt-1">{errors.companyAddress?.message}</p>
                )}
              </div>
            </div>

          </div>



          <div className="border rounded-xl p-6 bg-yellow-50">
            <h3 className="text-xl font-semibold text-yellow-800 mb-6 pb-3 border-b">
              <span className="bg-yellow-600 text-white px-3 py-1 rounded-md mr-2">3</span>
              Vehicle Requirements           </h3>
        <div>

            {vehicles.map((vehicle, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                  <div className="relative group">
                    <label className="block  text-md font-extrabold   text-gray-700 mb-1">
                      Vehicle Type *
                    </label>
                    <select
                      value={vehicle.type}
                      onChange={(e) => updateVehicle(index, 'type', e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border bg-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select vehicle type</option>
                      {vehicleTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                        <Phone className="absolute left-3 top-10 -translate-y-1/3 text-yellow-600 group-focus-within:animate-pulse" size={20} />

                    </div>


                  <div className="relative group">
                    <label className="block  text-md font-extrabold   text-gray-700 mb-1">
                      Vehicle Category *
                    </label>
                    <select
                      value={vehicle.category}
                      onChange={(e) => updateVehicle(index, 'category', e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border bg-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select vehicle category</option>
                      {vehicleCategories.map((category) => (
                        <option key={category.id} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                        <Phone className="absolute left-3 top-10 -translate-y-1/3 text-yellow-600 group-focus-within:animate-pulse" size={20} />

                    </div>

                    <div className="relative group ">
                      <label className="block  text-md font-extrabold   text-gray-700 mb-1">
                        Seater Capacity *
                      </label>
                      <select
                        value={vehicle.seater}
                        onChange={(e) => updateVehicle(index, 'seater', parseInt(e.target.value))}
                        className="w-full pl-10 pr-3 py-2 border bg-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="0">Select seater</option>
                        {seaterOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <Users className="absolute left-3 top-10 -translate-y-1/3 text-yellow-600 group-focus-within:animate-pulse" size={20} />
                    </div>

                    <div className="relative group ">
                      <label className="block  text-md font-extrabold   text-gray-700 mb-1">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        value={vehicle.quantity}
                        onChange={(e) => updateVehicle(index, 'quantity', parseInt(e.target.value))}
                        className="w-full pl-10 pr-3 py-2 border bg-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                        max="10"
                      />
                      <FileText className="absolute left-3 top-10 -translate-y-1/3 text-yellow-600 group-focus-within:animate-pulse" size={20} />
                    </div>
                  </div>

            ))}
            <button
              type="button"
              onClick={addVehicle}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              + Add Another Vehicle
            </button>

            {/* Vehicle Categories List */}
         
              </div>

</div>

          

          {/* Trip Details Section */}
          <div className="border rounded-xl p-6 bg-purple-50">
            <h3 className="text-xl font-semibold text-purple-800 mb-6 pb-3 border-b">
              <span className="bg-purple-600 text-white px-3 py-1 rounded-md mr-2">4</span>
              Trip Details
            </h3>

            {/* Pickup Details */}
            {(tripType === 'pickup' || tripType === 'both') && (
              <div className="mb-6 p-4 border rounded-lg bg-white">
                <h4 className="font-medium text-gray-700 mb-3">Pickup Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block  text-md font-extrabold   text-gray-700 mb-1">
                      Pickup Address *
                    </label>
                    <div className="relative group">
                      <input
                        {...register('pickupAddress')}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter pickup address"
                      />
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-600 group-focus-within:animate-pulse" size={20} />
                    </div>
                    {errors.pickupAddress && (
                      <p className="text-red-500 text-sm mt-1">{errors.pickupAddress.message}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block  text-md font-extrabold   text-gray-700 mb-1">
                        Pickup Date *
                      </label>
                      <div className="relative group">
                        <input
                          type="date"
                          {...register('pickupDate')}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-600 group-focus-within:animate-pulse" size={20} />
                      </div>
                      {errors.pickupDate && (
                        <p className="text-red-500 text-sm mt-1">{errors.pickupDate.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block  text-md font-extrabold   text-gray-700 mb-1">
                        Pickup Time *
                      </label>
                      <div className="relative group">
                        <input
                          type="time"
                          {...register('pickupTime')}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <PhoneCall className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-600 group-focus-within:animate-pulse" size={20} />
                      </div>
                      {errors.pickupTime && (
                        <p className="text-red-500 text-sm mt-1">{errors.pickupTime.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Drop Details */}
            {(tripType === 'drop' || tripType === 'both') && (
              <div className="mb-6 p-4 border rounded-lg bg-white">
                <h4 className="font-medium text-gray-700 mb-3">Drop Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block  text-md font-extrabold   text-gray-700 mb-1">
                      Drop Address *
                    </label>
                    <div className="relative group">
                      <input
                        {...register('dropAddress')}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter drop address"
                      />
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-600 group-focus-within:animate-pulse" size={20} />
                    </div>
                    {errors.dropAddress && (
                      <p className="text-red-500 text-sm mt-1">{errors.dropAddress.message}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block  text-md font-extrabold   text-gray-700 mb-1">
                        Drop Date
                      </label>
                      <div className="relative group">
                        <input
                          type="date"
                          {...register('dropDate')}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-600 group-focus-within:animate-pulse" size={20} />
                      </div>
                    </div>
                    <div>
                      <label className="block  text-md font-extrabold   text-gray-700 mb-1">
                        Drop Time
                      </label>
                      <div className="relative group">
                        <input
                          type="time"
                          {...register('dropTime')}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <PhoneCall className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-600 group-focus-within:animate-pulse" size={20} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

        
          </div>

          

           
          {/* Additional Information */}





<div className="border rounded-xl p-6 bg-orange-50">
            <h3 className="text-xl font-semibold text-orange-800 mb-6 pb-3 border-b">
              <span className="bg-orange-600 text-white px-3 py-1 rounded-md mr-2">5</span>
Additional Information</h3>
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block  text-md font-extrabold   text-gray-700 mb-1">
                  Language Preference
                </label>
                <div className="relative group">
                  <select
                    {...register('languagePreference')}
                    className="w-full px-3 py-2 border bg-white px-10 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select language</option>
                    <option value="english">English</option>
                    <option value="hindi">Hindi</option>
                    <option value="regional">Regional Language</option>
                    <option value="other">Other</option>
                  </select>
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-600 group-focus-within:animate-pulse" size={20} />
                </div>
              </div>

              <div>
                <label className="block  text-md font-extrabold   text-gray-700 mb-1">
                  Special Message (Optional)
                </label>
                <div className="relative group">
                  <textarea
                    {...register('message')}
                    rows={2}
                    className="w-full px-3 py-2 border bg-white px-10 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Any special requirements or messages"
                  />
                  <FileText className="absolute left-3 top-3 text-orange-600 group-focus-within:animate-pulse" size={20} />
                </div>
                {errors.message && (
                  <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
                )}
              </div>

              <div>
                <label className="block  text-md font-extrabold   text-gray-700 mb-1">
                  Itinerary Details (Optional)
                </label>
                <div className="relative group">
                  <textarea
                    {...register('itinerary')}
                    rows={2}
                    className="w-full px-3 py-2 border bg-white px-10 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Detailed itinerary if available"
                  />
                  <FileText className="absolute left-3 top-3 text-orange-600 group-focus-within:animate-pulse" size={20} />
                </div>
                {errors.itinerary && (
                  <p className="text-red-500 text-sm mt-1">{errors.itinerary.message}</p>
                )}
              </div>
            </div>
          </div>
</div>
          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={isSubmitting || !isValid}
              className={`w-full px-6 py-3 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-900 text-white hover:bg-blue-500'
              }`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Corporate Profile'}
            </button>
          </div>
        </form>
      </div>
    );
  }