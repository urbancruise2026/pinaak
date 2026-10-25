// 'use client';

// import { useState } from 'react';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import * as z from 'zod';
// import { User, Mail, Phone, FileText, Calendar, Users, MapPin, PhoneCall, Building } from 'lucide-react';

// // Define vehicle type
// type Vehicle = {
//   type: string;
//   seater: number;
//   quantity: number;
// };

// // Define validation schema
// const corporateProfileSchema = z.object({
//   // Company Information
//   companyName: z.string().min(1, 'Company name is required'),
//   corporateId: z.string().optional(),
//   gstNumber: z.string().min(1, 'GST number is required'),
//   billingAddress: z.string().min(1, 'Billing address is required'),
//   companyAddress: z.string().min(1, 'Company address is required'),
  
//   // SPOC Information
//   spocName: z.string().min(1, 'SPOC name is required'),
//   spocMobile: z.string()
//     .min(10, 'Mobile number must be at least 10 digits')
//     .max(15, 'Mobile number too long'),
//   spocEmail: z.string()
//     .email('Invalid email address')
//     .min(1, 'Email is required'),
  
//   // Passenger Details
//   passengerTotal: z.number()
//     .min(1, 'At least 1 passenger required')
//     .max(100, 'Maximum 100 passengers allowed'),
  
//   // Vehicle Requirements
//   vehicles: z.array(z.object({
//     type: z.string().min(1, 'Vehicle type required'),
//     seater: z.number().min(1, 'Seater capacity required'),
//     quantity: z.number().min(1, 'Quantity required'),
//   })).min(1, 'At least one vehicle required'),

//   // Trip Details
//   tripType: z.enum(['pickup', 'drop', 'both'], {
//     message: 'Please select trip type',
//   }),
  
//   // Pickup Details
//   pickupAddress: z.string().min(1, 'Pickup address required'),
//   pickupDate: z.string().min(1, 'Pickup date required'),
//   pickupTime: z.string().min(1, 'Pickup time required'),
  
//   // Drop Details
//   dropAddress: z.string().min(1, 'Drop address required'),
//   dropDate: z.string().optional(),
//   dropTime: z.string().optional(),
  
//   // Start & End Details
//   tripStartDate: z.string().min(1, 'Trip start date required'),
//   tripEndDate: z.string().min(1, 'Trip end date required'),
  
//   // Additional Information
//   languagePreference: z.string().optional(),
//   message: z.string().max(500, 'Message too long').optional(),
//   itinerary: z.string().max(1000, 'Itinerary too long').optional(),
// });

// // Define form data type
// type CorporateProfileFormData = z.infer<typeof corporateProfileSchema>;

// export default function CorporateProfileForm() {
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [vehicles, setVehicles] = useState([{ type: '', seater: 0, quantity: 1 }]);

//   const {
//     register,
//     handleSubmit,
//     formState: { errors, isValid },
//     watch,
//     setValue,
//   } = useForm({
//     resolver: zodResolver(corporateProfileSchema),
//     defaultValues: {
//       tripType: 'both',
//       passengerTotal: 1,
//       vehicles: [{ type: '', seater: 0, quantity: 1 }],
//     },
//   });

//   const tripType = watch('tripType');

//   const vehicleTypes = [
//     { value: 'sedan', label: 'Sedan (4 seater)' },
//     { value: 'suv', label: 'SUV (6-7 seater)' },
//     { value: 'tempo_traveller', label: 'Tempo Traveller (12 seater)' },
//     { value: 'minibus', label: 'Mini Bus (20-25 seater)' },
//     { value: 'bus', label: 'Bus (40-50 seater)' },
//     { value: 'luxury_car', label: 'Luxury Car' },
//     { value: 'other', label: 'Other' },
//   ];

//   const seaterOptions = [
//     { value: 4, label: '4 Seater' },
//     { value: 6, label: '6 Seater' },
//     { value: 7, label: '7 Seater' },
//     { value: 12, label: '12 Seater' },
//     { value: 20, label: '20 Seater' },
//     { value: 25, label: '25 Seater' },
//     { value: 40, label: '40 Seater' },
//     { value: 50, label: '50 Seater' },
//   ];

//   const vehiclecat = vehicleTypes;

//   const addVehicle = () => {
//     setVehicles([...vehicles, { type: '', seater: 0, quantity: 1 }]);
//   };

//   const removeVehicle = (index: number) => {
//     if (vehicles.length > 1) {
//       const updatedVehicles = vehicles.filter((_, i) => i !== index);
//       setVehicles(updatedVehicles);
//       setValue('vehicles', updatedVehicles);
//     }
//   };

//   const updateVehicle = (index: number, field: keyof Vehicle, value: string | number) => {
//     const updatedVehicles = vehicles.map((v, i) =>
//       i === index ? { ...v, [field]: value } : v
//     );
//     setVehicles(updatedVehicles);
//     setValue('vehicles', updatedVehicles);
//   };

//   const onSubmit = async (data: CorporateProfileFormData) => {
//     setIsSubmitting(true);
//     try {
//       // Send data to your API
//       const response = await fetch('/api/corporate-profile', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(data),
//       });

//       if (response.ok) {
//         alert('Corporate profile submitted successfully!');
//         // Reset form or redirect
//       } else {
//         throw new Error('Submission failed');
//       }
//     } catch (error) {
//       console.error('Error submitting form:', error);
//       alert('Failed to submit. Please try again.');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//       <div className="p-6 w-[165vh] mx-auto bg-white shadow-xl rounded-lg">
  
      
//       <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
//         {/* Company Information Section */}

//    <div className="mb-8 bg-orange-100 p-4 rounded-xl">
//             <h2 className="text-2xl font-bold text-center text-orange-600">Customer Corporate Management</h2>
//             <p className="text-center text-orange-700 mt-2">
//               <span className="text-red-500">*</span> All fields marked with asterisk are required
//             </p>
//           </div> <div className=" gap-2 bg-sky-50 border border-black/50  px-4  rounded-lg ">
//            <h3 className="text-xl font-semibold text-sky-800  pb-3 border-b mt-4 flex items-center">
//               <span className="bg-sky-600 text-white px-3 py-1 rounded-md mr-2">1</span>
//                 Company Information
//             </h3>
        
       
       
           

//          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">

//             <div>
//               <label className="block  text-md font-extrabold   text-gray-700 ">
//                 Company Name <span className="text-red-500">*</span>
//               </label>
//               <div className="relative group">
//                 <input
//                   type="text"
//                   {...register('companyName')}
//                   className="w-full pl-10 pr-3 py-2 border bg-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholder="Enter company name"
//                 />
//                 <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-600 group-focus-within:animate-pulse" size={20} />
//               </div>
//               {errors.companyName && (
//                 <p className="text-red-500 text-sm mt-1">{errors.companyName.message}</p>
//               )}
//             </div>

//             <div>
//               <label className="block  text-md font-extrabold   text-gray-700 mb-1">
//                 Corporate ID
//               </label>
//               <div className="relative group">
//                 <input
//                   type="text"
//                   {...register('corporateId')}
//                   className="w-full pl-10 pr-3 py-2 border border-gray-300  bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholder="Enter corporate ID"
//                 />
//                 <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-600 group-focus-within:animate-pulse" size={20} />
//               </div>
//             </div>

//             <div>
//               <label className="block  text-md font-extrabold   text-gray-700 mb-1">
//                 GST Number <span className="text-red-500">*</span>
//               </label>
//               <div className="relative group">
//                 <input
//                   type="text"
//                   {...register('gstNumber')}
//                   className="w-full pl-10 pr-3 py-2 border bg-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholder="Enter GST number"
//                 />
//                 <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-600 group-focus-within:animate-pulse" size={20} />
//               </div>
//               {errors.gstNumber && (
//                 <p className="text-red-500 text-sm mt-1">{errors.gstNumber.message}</p>
//               )}
//             </div>

//             <div>
//               <label className="block  text-md font-extrabold   text-gray-700 mb-1">
//                 Passenger Total <span className="text-red-500">*</span>
//               </label>
//               <div className="relative group">
//                 <input
//                   type="number"
//                   {...register('passengerTotal', { valueAsNumber: true })}
//                   className="w-full pl-10 pr-3 py-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholder="Total passengers"
//                   min="1"
//                   max="100"
//                 />
//                 <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-600 group-focus-within:animate-pulse" size={20} />
//               </div>
//               {errors.passengerTotal && (
//                 <p className="text-red-500 text-sm mt-1">{errors.passengerTotal.message}</p>
//               )}
//             </div>

//             <div className="md:col-span-2">
//               <label className="block  text-md font-extrabold   text-gray-700 mb-1">
//                 Billing Address <span className="text-red-500">*</span>
//               </label>
//               <div className="relative group">
//                 <input
//                   {...register('billingAddress')}
                  
//                   className="w-full pl-10 pr-3 py-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholder="Enter billing address"
//                 />
//                 <MapPin className="absolute left-3 top-3 text-sky-600 group-focus-within:animate-pulse" size={20} />
//               </div>
//               {errors.billingAddress && (
//                 <p className="text-red-500 text-sm mt-1">{errors.billingAddress.message}</p>
//               )}
//             </div>

//             <div className="md:col-span-2 mb-4">
//               <label className="block  text-md font-extrabold   text-gray-700 mb-1">
//                 Company Address <span className="text-red-500">*</span>
//               </label>
//               <div className="relative group">
//                 <input
//                   {...register('companyAddress')}
//                   className="w-full pl-10 pr-3 py-2 border bg-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholder="Enter company address"
//                 />
//                 <Building className="absolute left-3 top-3 text-sky-600 group-focus-within:animate-pulse" size={20} />
//               </div>
//               {errors.companyAddress && (
//                 <p className="text-red-500 text-sm mt-1">{errors.companyAddress.message}</p>
//               )}
//             </div>
          
//         </div>

//         </div>
      
          
//         <div className="border rounded-xl p-6 bg-blue-50">
//             <h3 className="text-xl font-semibold text-blue-800 mb-6 pb-3 border-b">
//               <span className="bg-blue-600 text-white px-3 py-1 rounded-md mr-2">2</span>
//               SPOC Information (Single Person of Contact)
//             </h3>

//             <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
//               <div>
//                 <label className="block  text-md font-extrabold   text-gray-700 mb-1">
//                   SPOC Name <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative group">
//                   <input
//                     {...register('spocName')}
//                     className="w-full px-3 py-2 pl-10 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     placeholder="Enter SPOC name"
//                     required
//                   />
//                   <User className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 group-focus-within:animate-pulse" size={20} />
//                 </div>
//                 {errors.spocName && (
//                   <p className="text-red-500 text-sm mt-1">{errors.spocName.message}</p>
//                 )}
//               </div>
//               <div>
//                 <label className="block  text-md font-extrabold   text-gray-700 mb-1">
//                   SPOC Email <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative group">
//                   <input
//                     type="email"
//                     {...register('spocEmail')}
//                     className="w-full px-3 py-2 pl-10 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     placeholder="Enter email address"
//                     required
//                   />
//                   <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 group-focus-within:animate-pulse" size={20} />
//                 </div>
//                 {errors.spocEmail && (
//                   <p className="text-red-500 text-sm mt-1">{errors.spocEmail.message}</p>
//                 )}
//               </div>
//               <div>
//                 <label className="block  text-md font-extrabold   text-gray-700 mb-1">
//                   SPOC Phone Number <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative group">
//                   <input
//                     type="tel"
//                     {...register('spocMobile')}
//                     className="w-full px-3 py-2 pl-10 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     placeholder="Enter phone number"
//                     inputMode="numeric"
//                     required
//                   />
//                   <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 group-focus-within:animate-pulse" size={20} />
//                 </div>
//                 {errors.spocMobile && (
//                   <p className="text-red-500 text-sm mt-1">{errors.spocMobile.message}</p>
//                 )}
//               </div>
//             </div>
//             </div>

//         {/* Vehicle Requirements Section */}
      
//   <div className="border rounded-xl p-6 bg-green-50">
//             <h3 className="text-xl font-semibold text-green-800 mb-6 pb-3 border-b">
//               <span className="bg-green-600 text-white px-3 py-1 rounded-md mr-2">3</span>
//                 Corporate Event Information
//             </h3>

            


//           <div className="grid grid-cols-4 gap-4">
//               <div>
//                                <label className="block  text-md font-extrabold   text-gray-700 mb-1">
//                                  Event Type Name <span className="text-red-500">*</span>
//                                </label>
//                 <div className="relative group bg-white">
//                   <input
//                     type="text"
//                     {...register('companyName')}
//                     className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     placeholder="  Enter Corporate Event "
//                   />
//                   <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-green-800 group-focus-within:animate-pulse" size={20} />
//                 </div>
//                 {errors.companyName && (
//                   <p className="text-red-500 text-sm mt-1">{errors.companyName?.message}</p>
//                 )}
//               </div>

//               <div>
//                 <label className="block  text-md font-extrabold   text-gray-700 mb-1">
//   Event Start Date              </label>
//                 <div className="relative group">
//                   <input
//                     type="date"
//                     {...register('tripStartDate')}
//                     className="w-full px-3 py-2 border bg-white px-10 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     placeholder="Enter event start date"
//                   />
//                   <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-green-800 group-focus-within:animate-pulse" size={20} />
//                 </div>
//                 {errors.tripStartDate && (
//                   <p className="text-red-500 text-sm mt-1">{errors.tripStartDate?.message}</p>
//                 )}
//               </div>
//   <div>
//                 <label className="block  text-md font-extrabold   text-gray-700 mb-1">
//   Event End Date              </label>
//                 <div className="relative group bg-white ">
//                   <input
//                     type="date"
//                     {...register('tripEndDate')}
//                     className="w-full px-3 py-2 border bg-white px-10 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     placeholder="Enter event end date"
//                   />
//                   <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-green-800 group-focus-within:animate-pulse" size={20} />
//                 </div>
//                 {errors.tripEndDate && (
//                   <p className="text-red-500 text-sm mt-1">{errors.tripEndDate?.message}</p>
//                 )}
//               </div>
          
//               <div>
//                 <label className="block  text-md font-extrabold   text-gray-700 mb-1">
//                   Total Passenger <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative group bg-white">
//                   <input
//                     type="number"
//                     {...register('passengerTotal', { valueAsNumber: true })}
//                     className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     placeholder="Total passengers"
//                     min="1"
//                     max="100"
//                   />
//                   <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-green-800 group-focus-within:animate-pulse" size={20} />
//                 </div>
//                 {errors.passengerTotal && (
//                   <p className="text-red-500 text-sm mt-1">{errors.passengerTotal?.message}</p>
//                 )}
//               </div>

// <div>
//   <label className="block  text-md font-extrabold   text-gray-700 mb-1">
//     Event Type Name <span className="text-red-500">*</span>
//   </label>
//                 <div className="relative group bg-white">
//                   <input
//                     type="text"
//                     {...register('companyName')}
//                     className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     placeholder="  Enter Corporate Event "
//                   />
//                   <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-green-800 group-focus-within:animate-pulse" size={20} />
//                 </div>
//                 {errors.companyName && (
//                   <p className="text-red-500 text-sm mt-1">{errors.companyName?.message}</p>
//                 )}
//               </div>

//               <div className="md:col-span-2">
//                 <label className="block  text-md font-extrabold   text-gray-700 mb-1">
//                   Event Venue Address <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative group ">
//                   <textarea
//                     {...register('billingAddress')}
//                     rows={2}
//                     className="w-full px-3 py-2 border bg-white px-10 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     placeholder="Enter event venue address"
//                   />
//                   <MapPin className="absolute left-3 top-3 text-green-800 group-focus-within:animate-pulse" size={20} />
//                 </div>
//                 {errors.billingAddress && (
//                   <p className="text-red-500 text-sm mt-1">{errors.billingAddress?.message}</p>
//                 )}
//               </div>

//               <div className="md:col-span-2">
//                 <label className="block  text-md font-extrabold   text-gray-700 mb-1">
//                   Address <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative group b">
//                   <textarea
//                     {...register('companyAddress')}
//                     rows={2}
//                     className="w-full px-3 py-2 border bg-white px-10 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     placeholder="Enter address"
//                   />
//                   <MapPin className="absolute left-3 top-3 text-green-800 group-focus-within:animate-pulse" size={20} />
//                 </div>
//                 {errors.companyAddress && (
//                   <p className="text-red-500 text-sm mt-1">{errors.companyAddress?.message}</p>
//                 )}
//               </div>
//             </div>

//           </div>


//           <div className="border rounded-xl p-6 bg-yellow-50">
//             <h3 className="text-xl font-semibold text-yellow-800 mb-6 pb-3 border-b">
//               <span className="bg-yellow-600 text-white px-3 py-1 rounded-md mr-2">4</span>
//               Vehicle Requirements           </h3>
//         <div>
                  
//             {vehicles.map((vehicle, index) => (
//               <div key={`vehicle-${index}`} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
//                   <div className="relative group">
//                     <label className="block  text-md font-extrabold   text-gray-700 mb-1">
//                       Vehicle Type <span className="text-red-500">*</span>
//                     </label>
//                     <select
//                       value={vehicle.type}
//                       onChange={(e) => updateVehicle(index, 'type', e.target.value)}
//                       className="w-full pl-10 pr-3 py-2 border bg-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     >
//                       <option value="">Select vehicle type</option>
//                       {vehicleTypes.map((type) => (
//                         <option key={type.value} value={type.value}>
//                           {type.label}
//                         </option>
//                       ))}
//                     </select>
//                         <Phone className="absolute left-3 top-10 -translate-y-1/3 text-yellow-600 group-focus-within:animate-pulse" size={20} />              
            
//                     </div>

                    
//                   <div className="relative group">
//                     <label className="block  text-md font-extrabold   text-gray-700 mb-1">
//                       Vehicle Category <span className="text-red-500">*</span>
//                     </label>
//                     <select
//                       value={vehicle.type}
//                       onChange={(e) => updateVehicle(index, 'type', e.target.value)}
//                       className="w-full pl-10 pr-3 py-2 border bg-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     >
//                       <option value="">Select vehicle type</option>
//                       {vehiclecat.map((type) => (
//                         <option key={type.value} value={type.value}>
//                           {type.label}
//                         </option>
//                       ))}
//                     </select>
//                         <Phone className="absolute left-3 top-10 -translate-y-1/3 text-yellow-600 group-focus-within:animate-pulse" size={20} />              
            
//                     </div>

//                     <div className="relative group ">
//                       <label className="block  text-md font-extrabold   text-gray-700 mb-1">
//                         Seater Capacity <span className="text-red-500">*</span>
//                       </label>
//                       <select
//                         value={vehicle.seater}
//                         onChange={(e) => updateVehicle(index, 'seater', parseInt(e.target.value))}
//                         className="w-full pl-10 pr-3 py-2 border bg-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                       >
//                         <option value="0">Select seater</option>
//                         {seaterOptions.map((option) => (
//                           <option key={option.value} value={option.value}>
//                             {option.label}
//                           </option>
//                         ))}
//                       </select>
//                       <Users className="absolute left-3 top-10 -translate-y-1/3 text-yellow-600 group-focus-within:animate-pulse" size={20} />
//                     </div>

//                     <div className="relative group ">
//                       <label className="block  text-md font-extrabold   text-gray-700 mb-1">
//                         Quantity <span className="text-red-500">*</span>
//                       </label>
//                       <input
//                         type="number"
//                         value={vehicle.quantity}
//                         onChange={(e) => updateVehicle(index, 'quantity', parseInt(e.target.value))}
//                         className="w-full pl-10 pr-3 py-2 border bg-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         min="1"
//                         max="10"
//                       />
//                       <FileText className="absolute left-3 top-10 -translate-y-1/3 text-yellow-600 group-focus-within:animate-pulse" size={20} />
//                     </div>
//                   </div>
            
//             ))}
//             <button
//               type="button"
//               onClick={addVehicle}
//               className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
//             >
//               + Add Another Vehicle
//             </button>
//               </div>

// </div>


//         {/* Trip Details Section */}
//                <div className="border rounded-xl p-6 bg-purple-50">
//             <h3 className="text-xl font-semibold text-purple-800 mb-6 pb-3 border-b">
//               <span className="bg-purple-600 text-white px-3 py-1 rounded-md mr-2">5</span>
//               Trip Details
//             </h3>

//             {/* Pickup Details */}
//             {(tripType === 'pickup' || tripType === 'both') && (
//               <div className="mb-6 p-4 border rounded-lg bg-white">
//                 <h4 className="font-medium text-gray-700 mb-3">Pickup Details</h4>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block  text-md font-extrabold   text-gray-700 mb-1">
//                       Pickup Address <span className="text-red-500">*</span>
//                     </label>
//                     <div className="relative group">
//                       <input
//                         {...register('pickupAddress')}
//                         className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         placeholder="Enter pickup address"
//                       />
//                       <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-600 group-focus-within:animate-pulse" size={20} />
//                     </div>
//                     {errors.pickupAddress && (
//                       <p className="text-red-500 text-sm mt-1">{errors.pickupAddress.message}</p>
//                     )}
//                   </div>
//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <label className="block  text-md font-extrabold   text-gray-700 mb-1">
//                         Pickup Date <span className="text-red-500">*</span>
//                       </label>
//                       <div className="relative group">
//                         <input
//                           type="date"
//                           {...register('pickupDate')}
//                           className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         />
//                         <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-600 group-focus-within:animate-pulse" size={20} />
//                       </div>
//                       {errors.pickupDate && (
//                         <p className="text-red-500 text-sm mt-1">{errors.pickupDate.message}</p>
//                       )}
//                     </div>
//                     <div>
//                       <label className="block  text-md font-extrabold   text-gray-700 mb-1">
//                         Pickup Time <span className="text-red-500">*</span>
//                       </label>
//                       <div className="relative group">
//                         <input
//                           type="time"
//                           {...register('pickupTime')}
//                           className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         />
//                         <PhoneCall className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-600 group-focus-within:animate-pulse" size={20} />
//                       </div>
//                       {errors.pickupTime && (
//                         <p className="text-red-500 text-sm mt-1">{errors.pickupTime.message}</p>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Drop Details */}
//             {(tripType === 'drop' || tripType === 'both') && (
//               <div className="mb-6 p-4 border rounded-lg bg-white">
//                 <h4 className="font-medium text-gray-700 mb-3">Drop Details</h4>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block  text-md font-extrabold   text-gray-700 mb-1">
//                       Drop Address <span className="text-red-500">*</span>
//                     </label>
//                     <div className="relative group">
//                       <input
//                         {...register('dropAddress')}
//                         className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         placeholder="Enter drop address"
//                       />
//                       <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-600 group-focus-within:animate-pulse" size={20} />
//                     </div>
//                     {errors.dropAddress && (
//                       <p className="text-red-500 text-sm mt-1">{errors.dropAddress.message}</p>
//                     )}
//                   </div>
//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <label className="block  text-md font-extrabold   text-gray-700 mb-1">
//                         Drop Date
//                       </label>
//                       <div className="relative group">
//                         <input
//                           type="date"
//                           {...register('dropDate')}
//                           className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         />
//                         <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-600 group-focus-within:animate-pulse" size={20} />
//                       </div>
//                     </div>
//                     <div>
//                       <label className="block  text-md font-extrabold   text-gray-700 mb-1">
//                         Drop Time
//                       </label>
//                       <div className="relative group">
//                         <input
//                           type="time"
//                           {...register('dropTime')}
//                           className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         />
//                         <PhoneCall className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-600 group-focus-within:animate-pulse" size={20} />
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//           {/* Trip Duration */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label className="block  text-md font-extrabold   text-gray-700 mb-1">
//                 Trip Start Date <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="date"
//                 {...register('tripStartDate')}
//                 className="w-full px-3 py-2 border  bg-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//               {errors.tripStartDate && (
//                 <p className="text-red-500 text-sm mt-1">{errors.tripStartDate.message}</p>
//               )}
//             </div>
//             <div>
//               <label className="block  text-md font-extrabold   text-gray-700 mb-1">
//                 Trip End Date <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="date"
//                 {...register('tripEndDate')}
//                 className="w-full px-3 py-2 border bg-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//               {errors.tripEndDate && (
//                 <p className="text-red-500 text-sm mt-1">{errors.tripEndDate.message}</p>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Additional Information */}
//        <div className="border rounded-xl p-6 bg-orange-50">
//                    <h3 className="text-xl font-semibold text-orange-800 mb-6 pb-3 border-b">
//                      <span className="bg-orange-600 text-white px-3 py-1 rounded-md mr-2">6</span>
//        Additional Information</h3>
//                  <div>
//                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                      <div>
//                        <label className="block  text-md font-extrabold   text-gray-700 mb-1">
//                          Language Preference
//                        </label>
//                        <div className="relative group">
//                          <select
//                            {...register('languagePreference')}
//                            className="w-full px-3 py-2 border bg-white px-10 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                          >
//                            <option value="">Select language</option>
//                            <option value="english">English</option>
//                            <option value="hindi">Hindi</option>
//                            <option value="regional">Regional Language</option>
//                            <option value="other">Other</option>
//                          </select>
//                          <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-600 group-focus-within:animate-pulse" size={20} />
//                        </div>
//                      </div>
       
//                      <div>
//                        <label className="block  text-md font-extrabold   text-gray-700 mb-1">
//                          Special Message (Optional)
//                        </label>
//                        <div className="relative group">
//                          <textarea
//                            {...register('message')}
//                            rows={2}
//                            className="w-full px-3 py-2 border bg-white px-10 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                            placeholder="Any special requirements or messages"
//                          />
//                          <FileText className="absolute left-3 top-3 text-orange-600 group-focus-within:animate-pulse" size={20} />
//                        </div>
//                        {errors.message && (
//                          <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
//                        )}
//                      </div>
       
//                      <div>
//                        <label className="block  text-md font-extrabold   text-gray-700 mb-1">
//                          Itinerary Details (Optional)
//                        </label>
//                        <div className="relative group">
//                          <textarea
//                            {...register('itinerary')}
//                            rows={2}
//                            className="w-full px-3 py-2 border bg-white px-10 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                            placeholder="Detailed itinerary if available"
//                          />
//                          <FileText className="absolute left-3 top-3 text-orange-600 group-focus-within:animate-pulse" size={20} />
//                        </div>
//                        {errors.itinerary && (
//                          <p className="text-red-500 text-sm mt-1">{errors.itinerary.message}</p>
//                        )}
//                      </div>
//                    </div>
//                  </div>
//        </div>
//                  {/* Submit Button */}
//                  <div className="pt-6">
//                    <button
//                      type="submit"
//                      disabled={isSubmitting || !isValid}
//                      className={`w-full px-6 py-3 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
//                        isSubmitting
//                          ? 'bg-gray-400 cursor-not-allowed'
//                          : 'bg-blue-900 text-white hover:bg-blue-500'
//                      }`}
//                    >
//                      {isSubmitting ? 'Submitting...' : 'Submit Corporate Profile'}
//                    </button>
//                  </div>
//                </form>
//              </div>
//   );
// }