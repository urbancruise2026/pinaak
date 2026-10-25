"use client";

import {
  Truck,
  Users,
  IndianRupee,
  Wrench,
  Fuel,
  Bell,
  Car,
  ClipboardList,
  ArrowUpRight,
  CircleDollarSign,
} from "lucide-react";

export default function VendorDashboard() {
  const cards = [
    {
      title: "Total Vehicles",
      value: "28",
      icon: Truck,
      color: "bg-blue-600",
    },
    {
      title: "Drivers",
      value: "34",
      icon: Users,
      color: "bg-emerald-600",
    },
    {
      title: "Active Trips",
      value: "18",
      icon: Car,
      color: "bg-orange-500",
    },
    {
      title: "Revenue",
      value: "₹2.45 L",
      icon: IndianRupee,
      color: "bg-violet-600",
    },
    {
      title: "Maintenance",
      value: "5",
      icon: Wrench,
      color: "bg-red-500",
    },
    {
      title: "Fuel Cost",
      value: "₹54K",
      icon: Fuel,
      color: "bg-cyan-600",
    },
    {
      title: "Notifications",
      value: "7",
      icon: Bell,
      color: "bg-pink-600",
    },
    {
      title: "Pending Docs",
      value: "4",
      icon: ClipboardList,
      color: "bg-amber-500",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Vendor Dashboard
          </h1>

          <p className="text-slate-500 mt-1">
            Welcome back! Here's today's overview.
          </p>
        </div>
      </div>

      {/* Summary Cards */}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, index) => {
          const Icon = card.icon;

          return (
            <div
              key={index}
              className="rounded-xl bg-white p-5 shadow hover:shadow-lg transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{card.title}</p>

                  <h2 className="mt-2 text-3xl font-bold text-slate-800">
                    {card.value}
                  </h2>
                </div>

                <div
                  className={`${card.color} h-14 w-14 rounded-xl flex items-center justify-center`}
                >
                  <Icon className="text-white" size={28} />
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2 text-emerald-600">
                <ArrowUpRight size={18} />

                <span className="text-sm font-medium">
                  +12% from last month
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue & Vehicle Overview */}

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Revenue */}

        <div className="rounded-xl bg-white p-6 shadow lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">
              Monthly Revenue
            </h2>

            <CircleDollarSign className="text-green-600" />
          </div>

          <div className="mt-8 flex h-64 items-end justify-between gap-3">
            {[45, 60, 40, 85, 70, 90, 55, 95, 65, 80, 75, 100].map(
              (height, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className="w-8 rounded-t bg-orange-500"
                    style={{ height: `${height * 2}px` }}
                  />

                  <span className="mt-2 text-xs text-slate-500">
                    {
                      [
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec",
                      ][index]
                    }
                  </span>
                </div>
              ),
            )}
          </div>
        </div>

        {/* Vehicle Status */}

        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="text-xl font-bold text-slate-800 mb-6">
            Vehicle Status
          </h2>

          {[
            {
              label: "Running",
              value: 18,
              color: "bg-emerald-500",
            },
            {
              label: "Available",
              value: 7,
              color: "bg-blue-500",
            },
            {
              label: "Maintenance",
              value: 3,
              color: "bg-red-500",
            },
          ].map((item, i) => (
            <div key={i} className="mb-5">
              <div className="flex justify-between text-sm mb-2">
                <span>{item.label}</span>

                <span className="font-semibold">{item.value}</span>
              </div>

              <div className="h-3 rounded-full bg-slate-200">
                <div
                  className={`${item.color} h-3 rounded-full`}
                  style={{
                    width: `${item.value * 5}%`,
                  }}
                />
              </div>
            </div>
          ))}

          <div className="mt-8 rounded-lg bg-orange-50 p-4">
            <p className="text-sm text-slate-600">
              🚚 <b>28 Vehicles</b> registered in your fleet.
            </p>

            <p className="mt-2 text-sm text-slate-600">
              👨 <b>34 Drivers</b> currently available.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
