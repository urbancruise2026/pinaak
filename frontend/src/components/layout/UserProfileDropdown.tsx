"use client";

import React from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";

interface UserProfileDropdownProps {
  openMenu: string | null;
  setOpenMenu: React.Dispatch<React.SetStateAction<string | null>>;

  userAvatar: string;
  userAliasName?: string | null;
  userEmail?: string | null;

  rawUser?: {
    shortName?: string | null;
  } | null;

  userData?: {
    shortName?: string | null;
  } | null;

  adminRole?: string | null;
  userDepartment?: string | null;
  userSubDepartment?: string | null;

  userRegionNames?: string[] | string | null;
  userZoneNames?: string[] | null;
  userCityNames?: string[] | null;

  handleLogout: () => void;
}

const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({
  openMenu,
  setOpenMenu,

  userAvatar,
  userAliasName,
  userEmail,

  rawUser,
  userData,

  adminRole,
  userDepartment,
  userSubDepartment,

  userRegionNames,
  userZoneNames,
  userCityNames,

  handleLogout,
}) => {
  const displayName = userAliasName || rawUser?.shortName || userData?.shortName || "-";

  const regionValue = Array.isArray(userRegionNames) ? userRegionNames.join(", ") : userRegionNames;

  const zoneValue = userZoneNames?.length ? userZoneNames.join(", ") : "-";

  const cityValue = userCityNames?.length ? userCityNames.join(", ") : "-";

  const profileDetails = [
    ["Role", adminRole],
    ["Department", userDepartment],
    ["Sub Dept", userSubDepartment],
    ["Region", regionValue],
    ["Zone", zoneValue],
    ["City", cityValue],
  ];

  return (
    <div className="relative">
      {/* User Profile Button */}
      <button
        onClick={() => setOpenMenu((prev) => (prev === "user" ? null : "user"))}
        className={`flex items-center gap-2 rounded-full bg-white px-2 py-1 text-xs font-semibold text-gray-700 shadow-sm border-2 transition-all duration-200 hover:shadow-md hover:scale-[1.02] ${
          openMenu === "user" ? "border-orange-500 shadow-md" : "border-orange-300 hover:border-orange-500"
        }`}
      >
        <Image
          src={userAvatar}
          alt="User"
          width={28}
          height={28}
          className="object-cover border-2 border-orange-500 rounded-full flex-shrink-0"
        />

        <div className="text-left hidden lg:block">
          <p className="text-sm font-semibold text-gray-900">{displayName}</p>

          <p className="text-[11px] uppercase text-gray-500">{adminRole || "-"}</p>
        </div>

        <ChevronDown
          size={14}
          className={`ml-1 transition-transform duration-200 flex-shrink-0 ${openMenu === "user" ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {openMenu === "user" && (
        <div className="absolute right-0 z-50 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          {/* User Header */}
          <div className="p-4 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900">{displayName}</p>

            <p className="text-xs text-gray-500 truncate">{userEmail || "-"}</p>

            <div className="flex flex-wrap gap-1.5 mt-2">
              {userDepartment && (
                <span className="text-[11px] px-2 py-[2px] bg-blue-100 text-blue-700 rounded-full">
                  {userDepartment}
                </span>
              )}

              {userSubDepartment && (
                <span className="text-[11px] px-2 py-[2px] bg-purple-100 text-purple-700 rounded-full">
                  {userSubDepartment}
                </span>
              )}

              {adminRole && (
                <span className="text-[11px] px-2 py-[2px] bg-green-100 text-green-700 rounded-full">{adminRole}</span>
              )}
            </div>
          </div>

          {/* User Details */}
          <div className="px-4 py-3 space-y-2 text-sm">
            {profileDetails.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-3">
                <span className="text-gray-500">{label}</span>

                <span className="text-gray-800 font-medium text-right">{value || "-"}</span>
              </div>
            ))}
          </div>

          {/* Logout */}
          <button
            onClick={() => {
              handleLogout();
              setOpenMenu(null);
            }}
            className="w-full px-4 py-2.5 md:py-2 text-sm text-left text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-all hover:pl-6 flex items-center gap-2"
          >
            <span className="w-1 h-1 rounded-full bg-orange-300" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown;
