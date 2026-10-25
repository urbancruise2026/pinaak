// import React, { useState } from "react";
// import {
//   User,
//   Mail,
//   Phone,
//   MapPin,
//   Building,
//   FileText,
//   Truck,
//   Calendar,
//   Palette,
//   Users,
//   Fuel,
//   Car,
//   Star,
//   GraduationCap,
//   MessageSquare,
//   DollarSign,
//   AlertCircle,
//   CheckCircle2,
//   Plus,
// } from "lucide-react";
// import {
//   departmentData,
//   getDesignationsByDepartment,
//   getRolesByDepartment,
//   getAllDepartments,
// } from "../../../constants/departmentData";

// interface EmployeeFormData {
//   personalInfo: {
//     employeeId: string;
//     firstName: string;
//     middleName: string;
//     lastName: string;
//     employeeShortName: string;
//     dateOfBirth: string;
//     gender: string;
//     maritalStatus: string;
//     nationality: string;
//     bloodGroup: string;
//   };
//   contactInfo: {
//     personalEmail: string;
//     officialEmail: string;
//     mobile: string;
//     alternateMobile: string;
//     emergencyContact: string;
//     emergencyContactRelation: string;
//   };
//   addressInfo: {
//     permanentAddress: string;
//     currentAddress: string;
//     city: string;
//     state: string;
//     pincode: string;
//     country: string;
//   };
//   employmentInfo: {
//     department: string;
//     designation: string;
//     role: string;
//     employeeType: string;
//     joiningDate: string;
//     confirmationDate: string;
//     workLocation: string;
//     reportingManager: string;
//     hrManager: string;
//     employmentStatus: string;
//   };
//   officialInfo: {
//     workShift: string;
//     workTimings: string;
//     weeklyOff: string;
//     leavePolicy: string;
//     probationPeriod: string;
//     noticePeriod: string;
//     ctc: string;
//     basicSalary: string;
//     pfNumber: string;
//     esicNumber: string;
//     uanNumber: string;
//   };
//   bankInfo: {
//     bankName: string;
//     accountNumber: string;
//     accountHolderName: string;
//     ifscCode: string;
//     branchName: string;
//     accountType: string;
//   };
//   educationInfo: Array<{
//     id: number;
//     qualification: string;
//     institution: string;
//     university: string;
//     yearOfPassing: string;
//     percentage: string;
//   }>;
//   experienceInfo: Array<{
//     id: number;
//     company: string;
//     designation: string;
//     fromDate: string;
//     toDate: string;
//     duration: string;
//     reasonForLeaving: string;
//   }>;
//   documents: {
//     aadharCard: File | null;
//     panCard: File | null;
//     passportPhoto: File | null;
//     resume: File | null;
//     experienceLetters: File | null;
//     educationalCertificates: File | null;
//     relievingLetter: File | null;
//   };
//   familyInfo: Array<{
//     id: number;
//     name: string;
//     relation: string;
//     dateOfBirth: string;
//     contact: string;
//     occupation: string;
//   }>;
// }

// const genderOptions = ["Male", "Female", "Other"];
// const maritalStatusOptions = ["Single", "Married", "Divorced", "Widowed"];
// const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
// const employeeTypes = ["Intern", "Contract", "Probation", "Permanent"];
// const employmentStatusOptions = [
//   "Active",
//   "On Notice",
//   "Terminated",
//   "Resigned",
//   "Absconding",
// ];
// const departments = getAllDepartments();
// const workShifts = ["General", "Morning", "Evening", "Night", "Rotational"];
// const accountTypes = ["Savings", "Current", "Salary"];

// const EmployeeForm: React.FC = () => {
//   const [availableDesignations, setAvailableDesignations] = useState<string[]>(
//     [],
//   );
//   const [availableRoles, setAvailableRoles] = useState<string[]>([]);

//   const [formData, setFormData] = useState<EmployeeFormData>({
//     personalInfo: {
//       employeeId: "",
//       firstName: "",
//       middleName: "",
//       lastName: "",
//       employeeShortName: "",
//       dateOfBirth: "",
//       gender: "",
//       maritalStatus: "",
//       nationality: "Indian",
//       bloodGroup: "",
//     },
//     contactInfo: {
//       personalEmail: "",
//       officialEmail: "",
//       mobile: "",
//       alternateMobile: "",
//       emergencyContact: "",
//       emergencyContactRelation: "",
//     },
//     addressInfo: {
//       permanentAddress: "",
//       currentAddress: "",
//       city: "",
//       state: "",
//       pincode: "",
//       country: "India",
//     },
//     employmentInfo: {
//       department: "",
//       designation: "",
//       role: "",
//       employeeType: "",
//       joiningDate: "",
//       confirmationDate: "",
//       workLocation: "",
//       reportingManager: "",
//       hrManager: "",
//       employmentStatus: "Active",
//     },
//     officialInfo: {
//       workShift: "General",
//       workTimings: "9:00 AM - 6:00 PM",
//       weeklyOff: "Sunday",
//       leavePolicy: "Standard",
//       probationPeriod: "6 Months",
//       noticePeriod: "2 Months",
//       ctc: "",
//       basicSalary: "",
//       pfNumber: "",
//       esicNumber: "",
//       uanNumber: "",
//     },
//     bankInfo: {
//       bankName: "",
//       accountNumber: "",
//       accountHolderName: "",
//       ifscCode: "",
//       branchName: "",
//       accountType: "Savings",
//     },
//     educationInfo: [],
//     experienceInfo: [],
//     documents: {
//       aadharCard: null,
//       panCard: null,
//       passportPhoto: null,
//       resume: null,
//       experienceLetters: null,
//       educationalCertificates: null,
//       relievingLetter: null,
//     },
//     familyInfo: [],
//   });

//   const [newEducation, setNewEducation] = useState({
//     qualification: "",
//     institution: "",
//     university: "",
//     yearOfPassing: "",
//     percentage: "",
//   });

//   const [newExperience, setNewExperience] = useState({
//     company: "",
//     designation: "",
//     fromDate: "",
//     toDate: "",
//     duration: "",
//     reasonForLeaving: "",
//   });

//   const [newFamilyMember, setNewFamilyMember] = useState({
//     name: "",
//     relation: "",
//     dateOfBirth: "",
//     contact: "",
//     occupation: "",
//   });

//   const handleInputChange = (
//     e: React.ChangeEvent<
//       HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
//     >,
//   ) => {
//     const { name, value } = e.target;

//     if (name.includes(".")) {
//       const [section, field] = name.split(".");
//       setFormData((prev) => ({
//         ...prev,
//         [section]: {
//           ...prev[section as keyof EmployeeFormData],
//           [field]: value,
//         },
//       }));

//       if (name === "employmentInfo.department") {
//         const designations = getDesignationsByDepartment(value);
//         const roles = getRolesByDepartment(value);
//         setAvailableDesignations(designations);
//         setAvailableRoles(roles);
//         // Reset designation and role when department changes
//         setFormData((prev) => ({
//           ...prev,
//           employmentInfo: {
//             ...prev.employmentInfo,
//             designation: "",
//             role: "",
//           },
//         }));
//       }
//     }
//   };

//   const handleFileChange = (
//     e: React.ChangeEvent<HTMLInputElement>,
//     fieldName: string,
//   ) => {
//     const file = e.target.files?.[0] || null;
//     const [section, field] = fieldName.split(".");

//     setFormData((prev) => ({
//       ...prev,
//       [section]: {
//         ...prev[section as keyof EmployeeFormData],
//         [field]: file,
//       },
//     }));
//   };

//   const handleAddEducation = () => {
//     if (newEducation.qualification && newEducation.institution) {
//       const educationWithId = {
//         ...newEducation,
//         id: Date.now(),
//       };

//       setFormData((prev) => ({
//         ...prev,
//         educationInfo: [...prev.educationInfo, educationWithId],
//       }));

//       setNewEducation({
//         qualification: "",
//         institution: "",
//         university: "",
//         yearOfPassing: "",
//         percentage: "",
//       });
//     }
//   };

//   const handleAddExperience = () => {
//     if (newExperience.company && newExperience.designation) {
//       const experienceWithId = {
//         ...newExperience,
//         id: Date.now(),
//       };

//       setFormData((prev) => ({
//         ...prev,
//         experienceInfo: [...prev.experienceInfo, experienceWithId],
//       }));

//       setNewExperience({
//         company: "",
//         designation: "",
//         fromDate: "",
//         toDate: "",
//         duration: "",
//         reasonForLeaving: "",
//       });
//     }
//   };

//   const handleAddFamilyMember = () => {
//     if (newFamilyMember.name && newFamilyMember.relation) {
//       const familyWithId = {
//         ...newFamilyMember,
//         id: Date.now(),
//       };

//       setFormData((prev) => ({
//         ...prev,
//         familyInfo: [...prev.familyInfo, familyWithId],
//       }));

//       setNewFamilyMember({
//         name: "",
//         relation: "",
//         dateOfBirth: "",
//         contact: "",
//         occupation: "",
//       });
//     }
//   };

//   const handleRemoveEducation = (id: number) => {
//     setFormData((prev) => ({
//       ...prev,
//       educationInfo: prev.educationInfo.filter((edu) => edu.id !== id),
//     }));
//   };

//   const handleRemoveExperience = (id: number) => {
//     setFormData((prev) => ({
//       ...prev,
//       experienceInfo: prev.experienceInfo.filter((exp) => exp.id !== id),
//     }));
//   };

//   const handleRemoveFamilyMember = (id: number) => {
//     setFormData((prev) => ({
//       ...prev,
//       familyInfo: prev.familyInfo.filter((member) => member.id !== id),
//     }));
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     // Handle form submission
//   };

//   const renderFileUpload = (label: string, name: string, accept?: string) => (
//     <div className="p-4 border rounded-lg bg-gray-50">
//       <label className="block mb-1 text-sm font-extrabold text-gray-700">
//         {label}
//       </label>
//       <input
//         type="file"
//         onChange={(e) => handleFileChange(e, name)}
//         accept={accept}
//         className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
//       />
//     </div>
//   );

//   return (
//     <div className="p-6 w-[165vh] mx-auto bg-white shadow-xl rounded-lg">
//       <div className="p-4 mb-2 bg-orange-100 rounded-xl h-22">
//         <h2 className="mb-4 text-2xl font-bold text-center text-orange-500">
//           Employee Registration Form
//         </h2>
//         <p className="text-center text-gray-600 ">
//           Complete all sections to register a new employee
//         </p>
//       </div>

//       <form onSubmit={handleSubmit} className="mb-8 space-y-8">
//         {/* Section 1: Personal Information */}
//         <div className="p-6 border rounded-xl bg-purple-50">
//           <h3 className="pb-3 mb-6 text-xl font-semibold text-purple-800 border-b border-purple-200">
//             <span className="px-3 py-1 mr-2 text-white bg-purple-600 rounded-md">
//               1
//             </span>
//             Employee Details
//           </h3>

//           <div className="relative grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
//             <div className="relative group">
//               <label className="block mb-1 text-sm font-extrabold text-gray-700">
//                 Employee ID <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 name="personalInfo.employeeId"
//                 value={formData.personalInfo.employeeId}
//                 onChange={handleInputChange}
//                 className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white focus:border-blue-500"
//                 required
//                 maxLength={10}
//                 placeholder="EMP-001"
//               />
//               <Users
//                 className="absolute text-purple-600 -translate-y-1/2 pointer-events-none left-3 top-11"
//                 size={20}
//               />
//             </div>

//             <div className="relative group">
//               <label className="block mb-1 text-sm font-extrabold text-gray-700">
//                 First Name <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 name="personalInfo.firstName"
//                 value={formData.personalInfo.firstName}
//                 onChange={handleInputChange}
//                 max-length={20}
//                 className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white focus:border-blue-500"
//                 required
//                 placeholder="First Name"
//               />
//               <User
//                 className="absolute text-purple-600 -translate-y-1/2 pointer-events-none left-3 top-11"
//                 size={20}
//               />
//             </div>

//             <div className="relative group">
//               <label className="block mb-1 text-sm font-extrabold text-gray-700">
//                 Middle Name
//               </label>
//               <input
//                 type="text"
//                 name="personalInfo.middleName"
//                 value={formData.personalInfo.middleName}
//                 onChange={handleInputChange}
//                 max-length={20}
//                 className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white focus:border-blue-500"
//                 placeholder="Middle Name"
//               />
//               <Plus
//                 className="absolute text-purple-600 -translate-y-1/2 pointer-events-none left-3 top-11"
//                 size={20}
//               />
//             </div>

//             <div className="relative group">
//               <label className="block mb-1 text-sm font-extrabold text-gray-700">
//                 Last Name <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 name="personalInfo.lastName"
//                 value={formData.personalInfo.lastName}
//                 onChange={handleInputChange}
//                 max-length={20}
//                 className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white  focus:border-blue-500"
//                 required
//                 placeholder="Last Name"
//               />
//               <User
//                 className="absolute text-purple-600 -translate-y-1/2 pointer-events-none left-3 top-11"
//                 size={20}
//               />
//             </div>
//             <div className="relative group">
//               <label className="block mb-1 text-sm font-extrabold text-gray-700">
//                 Employee Short Name <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 name="personalInfo.employeeShortName"
//                 value={formData.personalInfo.employeeShortName}
//                 onChange={handleInputChange}
//                 max-length={20}
//                 className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white focus:border-blue-500"
//                 required
//                 placeholder="Employee Short Name"
//               />
//               <User
//                 className="absolute text-purple-600 -translate-y-1/2 pointer-events-none left-3 top-11"
//                 size={20}
//               />
//             </div>
//             <div className="relative group">
//               <label className="block mb-1 text-sm font-extrabold text-gray-700">
//                 Department <span className="text-red-500">*</span>
//               </label>
//               <select
//                 name="employmentInfo.department"
//                 value={formData.employmentInfo.department}
//                 onChange={handleInputChange}
//                 className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500  bg-white focus:border-blue-500"
//                 required
//               >
//                 <option value="">Select Department</option>
//                 {departments.map((dept) => (
//                   <option key={dept} value={dept}>
//                     {dept}
//                   </option>
//                 ))}
//               </select>
//               <Building
//                 className="absolute text-purple-600 -translate-y-1/2 pointer-events-none left-3 top-11"
//                 size={18}
//               />
//             </div>

//             <div className="relative group">
//               <label className="block mb-1 text-sm font-extrabold text-gray-700">
//                 Designation <span className="text-red-500">*</span>
//               </label>
//               <select
//                 name="employmentInfo.designation"
//                 value={formData.employmentInfo.designation}
//                 onChange={handleInputChange}
//                 className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white focus:border-blue-500"
//                 required
//               >
//                 <option value="">Select Designation</option>
//                 {availableDesignations.map((desig) => (
//                   <option key={desig} value={desig}>
//                     {desig}
//                   </option>
//                 ))}
//               </select>
//               <FileText
//                 className="absolute text-purple-600 -translate-y-1/2 pointer-events-none left-3 top-11"
//                 size={18}
//               />
//             </div>

//             <div className="relative group">
//               <label className="block mb-1 text-sm font-extrabold text-gray-700">
//                 Role
//               </label>
//               <select
//                 name="employmentInfo.role"
//                 value={formData.employmentInfo.role}
//                 onChange={handleInputChange}
//                 className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white focus:border-blue-500"
//               >
//                 <option value="">Select Role</option>
//                 {availableRoles.map((role) => (
//                   <option key={role} value={role}>
//                     {role}
//                   </option>
//                 ))}
//               </select>
//               <User
//                 className="absolute text-purple-600 -translate-y-1/2 pointer-events-none left-3 top-11"
//                 size={18}
//               />
//             </div>

//             <div className="relative group">
//               <label className="block mb-1 text-sm font-extrabold text-gray-700">
//                 Employee Type <span className="text-red-500">*</span>
//               </label>
//               <select
//                 name="employmentInfo.employeeType"
//                 value={formData.employmentInfo.employeeType}
//                 onChange={handleInputChange}
//                 className="w-full p-2.5  px-6 text-left border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white focus:border-blue-500"
//                 required
//               >
//                 <option value="">Select Type</option>
//                 {employeeTypes.map((type) => (
//                   <option key={type} value={type}>
//                     {type}
//                   </option>
//                 ))}
//               </select>
//               <GraduationCap
//                 className="absolute text-purple-600 -translate-y-1/2 pointer-events-none left-2 top-11"
//                 size={18}
//               />
//             </div>
//             <div className="relative group">
//               <label className="block mb-1 text-sm font-extrabold text-gray-700">
//                 Work Location <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 name="employmentInfo.workLocation"
//                 value={formData.employmentInfo.workLocation}
//                 onChange={handleInputChange}
//                 className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white focus:border-blue-500"
//                 required
//                 placeholder="Office / City (e.g., Mumbai Office)"
//               />
//               <MapPin
//                 className="absolute text-purple-600 -translate-y-1/2 pointer-events-none left-3 top-11"
//                 size={18}
//               />
//             </div>
//             <div className="relative group">
//               <label className="block mb-1 text-sm font-extrabold text-gray-700">
//                 Joining Date <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="date"
//                 name="employmentInfo.joiningDate"
//                 value={formData.employmentInfo.joiningDate}
//                 onChange={handleInputChange}
//                 className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white focus:border-blue-500"
//                 required
//               />
//               <Calendar
//                 className="absolute text-purple-600 -translate-y-1/2 pointer-events-none left-3 top-11"
//                 size={18}
//               />
//             </div>

//             <div className="relative group">
//               <label className="block mb-1 text-sm font-extrabold text-gray-700">
//                 Relieving Date
//               </label>
//               <input
//                 type="date"
//                 name="employmentInfo.confirmationDate"
//                 value={formData.employmentInfo.confirmationDate}
//                 onChange={handleInputChange}
//                 className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white focus:border-blue-500"
//               />
//               <Calendar
//                 className="absolute text-purple-600 -translate-y-1/2 pointer-events-none left-3 top-11"
//                 size={18}
//               />
//             </div>

//             <div className="relative group">
//               <label className="block mb-1 text-sm font-extrabold text-gray-700">
//                 Reporting Manager <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 name="employmentInfo.reportingManager"
//                 value={formData.employmentInfo.reportingManager}
//                 onChange={handleInputChange}
//                 maxLength={20}
//                 className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white focus:border-blue-500"
//                 placeholder="Reporting Manager Name"
//               />
//               <User
//                 className="absolute text-purple-600 -translate-y-1/2 pointer-events-none left-3 top-11"
//                 size={18}
//               />
//             </div>

//             <div>
//               <label className="block mb-1 text-sm font-extrabold text-gray-700">
//                 Gender <span className="text-red-500">*</span>
//               </label>
//               <select
//                 name="personalInfo.gender"
//                 value={formData.personalInfo.gender}
//                 onChange={handleInputChange}
//                 className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white focus:border-blue-500"
//                 required
//               >
//                 <option value="">Select</option>
//                 {genderOptions.map((gender) => (
//                   <option key={gender} value={gender}>
//                     {gender}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div className="relative">
//               <label className="block mb-1 text-sm font-extrabold text-gray-700">
//                 Work Timings <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 name="officialInfo.workTimings"
//                 value={formData.officialInfo.workTimings}
//                 onChange={handleInputChange}
//                 className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white focus:border-blue-500"
//                 placeholder="e.g., 9:00 AM - 6:00 PM"
//               />
//               <Calendar
//                 className="absolute text-purple-600 -translate-y-1/2 pointer-events-none left-3 top-11"
//                 size={18}
//               />
//             </div>
//           </div>
//         </div>

//         {/* Section 3: Contact Information */}
//         <div className="p-6 border rounded-xl bg-green-50">
//           <h3 className="pb-3 mb-6 text-xl font-semibold text-green-800 border-b border-green-200">
//             <span className="px-3 py-1 mr-2 text-white bg-green-600 rounded-md">
//               3
//             </span>
//             Contact Information
//           </h3>

//           <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//             <div className="relative">
//               <label className="block mb-1 text-sm font-extrabold text-gray-700">
//                 Business Number <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="tel"
//                 name="contactInfo.mobile"
//                 value={formData.contactInfo.mobile}
//                 onChange={handleInputChange}
//                 className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white focus:border-blue-500"
//                 required
//                 placeholder="+91 98765 43210"
//               />
//               <Phone
//                 className="absolute text-green-600 -translate-y-1/2 pointer-events-none left-3 top-11"
//                 size={18}
//               />
//             </div>

//             <div className="relative">
//               <label className="block mb-1 text-sm font-extrabold text-gray-700">
//                 Business Email <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="email"
//                 name="contactInfo.officialEmail"
//                 value={formData.contactInfo.officialEmail}
//                 onChange={handleInputChange}
//                 className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500  bg-white focus:border-blue-500"
//                 required
//                 placeholder="name@company.com"
//               />
//               <Mail
//                 className="absolute text-green-600 -translate-y-1/2 pointer-events-none left-3 top-11"
//                 size={18}
//               />
//             </div>

//             <div className="relative">
//               <label className="block mb-1 text-sm font-extrabold text-gray-700">
//                 Personal Number <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="tel"
//                 name="contactInfo.alternateMobile"
//                 value={formData.contactInfo.alternateMobile}
//                 onChange={handleInputChange}
//                 className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white focus:border-blue-500"
//                 placeholder="Alternate number (optional)"
//               />
//               <Phone
//                 className="absolute text-green-600 -translate-y-1/2 pointer-events-none left-3 top-11"
//                 size={18}
//               />
//             </div>
//             <div className="relative">
//               <label className="block mb-1 text-sm font-extrabold text-gray-700">
//                 Personal Email <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="email"
//                 name="contactInfo.personalEmail"
//                 value={formData.contactInfo.personalEmail}
//                 onChange={handleInputChange}
//                 className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white focus:border-blue-500"
//                 required
//                 placeholder="example@domain.com"
//               />
//               <Mail
//                 className="absolute text-green-600 -translate-y-1/2 pointer-events-none left-3 top-11"
//                 size={18}
//               />
//             </div>
//             {/* 
//             <div>
//               <label className="block mb-1 text-sm font-extrabold text-gray-700">
//                 Emergency Contact *
//               </label>
//               <input
//                 type="tel"
//                 name="contactInfo.emergencyContact"
//                 value={formData.contactInfo.emergencyContact}
//                 onChange={handleInputChange}
//                 className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500  bg-white focus:border-blue-500"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block mb-1 text-sm font-extrabold text-gray-700">
//                 Relationship
//               </label>
//               <input
//                 type="text"
//                 name="contactInfo.emergencyContactRelation"
//                 value={formData.contactInfo.emergencyContactRelation}
//                 onChange={handleInputChange}
//                 className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white focus:border-blue-500"
//                 placeholder="Father, Mother, Spouse"
//               />
//             </div> */}
//           </div>
//         </div>

//         {/* Submit Buttons */}
//         <div className="flex flex-col justify-between gap-4 pt-8 border-t sm:flex-row">
//           <div className="text-sm text-gray-500">
//             <p>* Required fields must be filled</p>
//             <p>All information will be kept confidential</p>
//           </div>

//           <div className="flex gap-4">
//             <button
//               type="submit"
//               className="px-8 py-3 font-extrabold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200"
//             >
//               Submit Registration
//             </button>
//           </div>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default EmployeeForm;
