// export const departmentData = {
//   'Digital Marketing': {
//     designations: ['Head Marketing', 'Team Leader', 'Executive'],
//     roles: ['SEO', 'SMO', 'GD/VE', 'ADV', 'Field Marketing']
//   },
//   'Finance': {
//     designations: ['Finance Head', 'Team Leader', 'Senior Accountant', 'Junior Accountant'],
//     roles: ['Accounting', 'Statutory', 'Finance', 'Funding']
//   },
//   'HR': {
//     designations: ['HR Head', 'Regional Head', 'HR Manager', 'HR Executive'],
//     roles: ['Admin','Recruitment', 'HR Ops']
//   },
//   'IT': {
//     designations: ['IT Head', 'Team Leader', 'Team Member'],
//     roles: ['Website', 'Web App', 'Mobile App', 'Intern']
//   },
//   'Sales': {
//     designations: ['BDM', 'City Manager', 'Team Leader', 'Team Member'],
//     roles: ['Pre Sales', 'Corporate Sales','Tele Sales',  'Field Sales','Sales',]
//   },
//   'Veh Logistics': {
//     designations: ['Logistic Head', 'Team Leader','Executive Ops'],
//     roles: ['Vendor Management', 'Logistics Ops','Veh Design']
//   },
// }
// // Get designations for a department
// export const getDesignationsByDepartment = (department) => {
//   if (!department) return [];
//   return departmentData[department]?.designations || [];
// };

// // Get roles for a department
// export const getRolesByDepartment = (department) => {
//   if (!department) return [];
//   return departmentData[department]?.roles || [];
// };

// // Get all departments
// export const getAllDepartments = () => {
//   return Object.keys(departmentData);
// };