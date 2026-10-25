"use client";
import  { useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Printer } from "lucide-react";
import Image from "next/image";
import urbancruiselogo from "@/assets/images/urbanlogo.png";

interface QuotationPdfProps {
  data: any;
  onClose: () => void;
}

const show = (value: any, fallback = "—") =>
  value !== undefined && value !== null && String(value).trim() !== ""
    ? String(value)
    : fallback;

const money = (value: any) =>
  `Rs. ${Number(value || 0).toLocaleString("en-IN")}`;

export default function QuotationPdf({ data, onClose }: QuotationPdfProps) {
  const vehicles: any[] = Array.isArray(data?.vehicles) ? data.vehicles : [];

  const formatDate = (value: any) => {
    if (!value) return "—";
    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? String(value)
      : date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "2-digit",
        });
  };

  const quoteDate = formatDate(data?.created_at);
  const validTill = formatDate(data?.validTill || data?.valid_till);

  useEffect(() => {
    const oldOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = oldOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const modal = (
    <>
      <style>{`
        .qp-overlay {
          background: rgba(0, 0, 0, .55);
        }

        .qp-modal {
          width: 100%;
          max-width: 1100px;
          max-height: 95vh;
          background: #fff;
          color: #202020;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .qp-paper {
          width: 100%;
          max-width: none;
          box-sizing: border-box;
          background: #fff;
          color: #202020;
          padding: 16px;
          font-family: Arial, Helvetica, sans-serif;
          font-size: 12px;
          line-height: 1.3;
        }

        .qp-banner {
          display: grid;
          grid-template-columns: 140px minmax(0, 1fr) 190px;
          align-items: stretch;
          background: #08b34c;
          border: 1px solid #bbb;
          border-bottom: 6px solid #ffb900;
          border-radius: 0 0 12px 12px;
          overflow: hidden;
          color: #111;
          min-height: 100px;
        }

        .qp-logo {
          background: #252525;
          border-right: 5px solid #ffb900;
          border-radius: 0 0 34px 0;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 8px;
        }

        .qp-banner-title {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 6px;
        }

        .qp-banner-title h1 {
          margin: 0;
          font-size: clamp(19px, 2.8vw, 29px);
          line-height: 1.15;
          font-weight: 900;
        }

        .qp-banner-title p {
          margin: 0;
          font-size: clamp(22px, 3.3vw, 35px);
          font-weight: 900;
          letter-spacing: .23em;
          line-height: 1.15;
        }

        .qp-meta {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 8px;
          padding: 10px;
          font-weight: 800;
          font-size: 11px;
        }

        .qp-meta-row {
          display: grid;
          grid-template-columns: 75px minmax(0, 1fr);
          gap: 4px;
        }

        .qp-greeting {
          padding: 14px 6px 8px;
          color: #202020;
        }

        .qp-greeting .qp-customer {
          font-size: 15px;
          font-weight: 800;
        }

        .qp-greeting .qp-welcome {
          margin: 8px 0 5px;
          color: #ed4545;
          font-style: italic;
          font-weight: 800;
        }

        .qp-section {
          margin-top: 10px;
          border: 2px solid #39aa42;
          overflow: hidden;
          break-inside: avoid;
          page-break-inside: avoid;
        }

        .qp-section-heading {
          background: #40b044;
          color: #171717;
          padding: 5px;
          text-align: center;
          font-weight: 900;
          font-size: 17px;
          text-transform: uppercase;
        }

        .qp-travel-top {
          display: grid;
          grid-template-columns: 75px 115px minmax(0, 1fr) 100px;
          border-top: 1px solid #39aa42;
        }

        .qp-travel-bottom {
          display: grid;
          grid-template-columns: 75px 145px 100px 55px minmax(0, 1fr);
          border-top: 1px solid #39aa42;
        }

        .qp-cell {
          min-width: 0;
          padding: 6px;
          overflow-wrap: anywhere;
          border-right: 1px solid #39aa42;
        }

        .qp-cell:last-child {
          border-right: 0;
        }

        .qp-label {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-weight: 800;
        }

        .qp-arrow {
          color: #ed8a28;
        }

        .qp-blue {
          color: #009dc2;
          font-weight: 800;
        }

        .qp-red {
          color: #ed5050;
          font-weight: 800;
        }

        .qp-pricing {
          margin-top: 15px;
          border: 2px solid #39aa42;
          overflow: hidden;
          break-inside: avoid;
          page-break-inside: avoid;
        }

        .qp-table {
          width: 100%;
          table-layout: fixed;
          border-collapse: collapse;
          font-size: 11px;
        }

        .qp-table th {
          background: #4a4a4a;
          color: #fff;
          padding: 6px 4px;
          border: 1px solid #bbb;
          text-transform: uppercase;
          text-align: center;
        }

        .qp-table td {
          padding: 6px 5px;
          border: 1px solid rgba(255,255,255,.4);
          overflow-wrap: anywhere;
          vertical-align: middle;
        }

        .qp-table .qp-number { width: 30px; }
        .qp-table .qp-type { width: 27%; }
        .qp-table .qp-quantity { width: 48px; }
        .qp-table .qp-description { width: auto; }
        .qp-table .qp-price { width: 110px; }

        .qp-vehicle {
          background: #f0f0f0;
          color: #202020;
        }

        .qp-vehicle:nth-child(even) {
          background: #fff8d9;
        }

        .qp-vehicle.qp-premium {
          background: #f1c8f5;
        }

        .qp-vehicle.qp-royal {
          background: #e94bed;
          color: #171717;
        }

        .qp-vehicle .qp-price {
          text-align: right;
          font-weight: 900;
          white-space: nowrap;
          color: #c72e46;
        }

        .qp-offer {
          background: #d9f7df;
          color: #202020;
          padding: 6px 10px;
          font-size: 11px;
          border-top: 1px solid #39aa42;
        }

        .qp-panels {
          display: grid;
          grid-template-columns: minmax(220px, .72fr) minmax(0, 1.65fr);
          gap: 10px;
          margin-top: 15px;
          align-items: stretch;
          break-inside: avoid;
          page-break-inside: avoid;
        }

        .qp-notes,
        .qp-charges {
          border: 2px solid #138b30;
          border-radius: 22px;
          overflow: hidden;
          background: #efffee;
          color: #202020;
        }

        .qp-charges {
          border-color: #d7793d;
          background: #fffde0;
        }

        .qp-panel-title {
          text-align: center;
          padding: 6px;
          margin: 0 18px 8px;
          border-radius: 0 0 16px 16px;
          background: #087d20;
          color: white;
          font-size: 16px;
          font-weight: 900;
        }

        .qp-charges .qp-panel-title {
          background: #c97843;
          margin-left: 10%;
          margin-right: 10%;
          font-size: 13px;
        }

        .qp-notes ul {
          list-style: disc;
          padding: 0 10px 12px 25px;
          margin: 0;
        }

        .qp-notes li {
          padding: 2px 0;
          line-height: 1.35;
        }

        .qp-notes li::marker {
          color: #00a6c9;
        }

        .qp-charge-list {
          padding: 2px 12px 12px;
        }

        .qp-charge-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr);
          gap: 8px;
          padding: 4px 0;
          border-bottom: 1px solid #e6dfc4;
          align-items: start;
        }

        .qp-charge-name {
          color: #087d20;
          font-weight: 800;
        }

        .qp-charge-name::before {
          content: "➤ ";
          color: #d7793d;
        }

        .qp-charge-value::before {
          content: "▶ ";
          color: #087d20;
        }

        .qp-footer {
          margin-top: 12px;
          border-top: 1px solid #ddd;
          padding: 9px 5px 2px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          color: #333;
          font-size: 10px;
        }

        .qp-booking {
          background: #ed343b;
          color: white;
          padding: 9px 14px;
          border-radius: 20px;
          font-weight: 900;
          white-space: nowrap;
        }

        @media (max-width: 600px) {
          .qp-paper {
            padding: 8px;
            font-size: 10px;
          }

          .qp-banner {
            grid-template-columns: 78px minmax(0, 1fr) 103px;
            min-height: 76px;
          }

          .qp-logo {
            padding: 4px;
          }

          .qp-banner-title h1 {
            font-size: 13px;
          }

          .qp-banner-title p {
            font-size: 15px;
            letter-spacing: .1em;
          }

          .qp-meta {
            padding: 5px;
            gap: 4px;
            font-size: 9px;
          }

          .qp-meta-row {
            grid-template-columns: 1fr;
            gap: 1px;
          }

          .qp-travel-top {
            grid-template-columns: 58px 78px minmax(0, 1fr) 60px;
          }

          .qp-travel-bottom {
            grid-template-columns: 58px 85px 65px 35px minmax(0, 1fr);
          }

          .qp-cell {
            padding: 4px 3px;
            font-size: 9px;
          }

          .qp-section-heading {
            font-size: 13px;
          }

          .qp-table {
            font-size: 9px;
          }

          .qp-table th,
          .qp-table td {
            padding: 4px 2px;
          }

          .qp-table .qp-type {
            width: 24%;
          }

          .qp-table .qp-quantity {
            width: 33px;
          }

          .qp-table .qp-price {
            width: 76px;
          }

          .qp-panels {
            grid-template-columns: minmax(0, .8fr) minmax(0, 1.3fr);
            gap: 5px;
          }

          .qp-panel-title {
            font-size: 12px;
            margin: 0 7px 6px;
          }

          .qp-charges .qp-panel-title {
            font-size: 10px;
          }

          .qp-notes ul,
          .qp-charge-list {
            padding-left: 16px;
            padding-right: 6px;
            font-size: 9px;
          }

          .qp-charge-row {
            grid-template-columns: 1fr;
            gap: 2px;
          }

          .qp-footer {
            flex-wrap: wrap;
          }
        }

        @page {
          size: A4 portrait;
          margin: 5mm;
        }

        @media print {
          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            overflow: visible !important;
            background: #fff !important;
            print-color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
          }

          body * {
            visibility: hidden !important;
          }

          .qp-overlay,
          .qp-overlay * {
            visibility: visible !important;
          }

          .qp-overlay {
            position: static !important;
            display: block !important;
            inset: auto !important;
            width: 100% !important;
            height: auto !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            background: #fff !important;
          }

          .qp-modal {
            display: block !important;
            position: static !important;
            width: 100% !important;
            max-width: none !important;
            max-height: none !important;
            height: auto !important;
            overflow: visible !important;
            border: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            background: #fff !important;
          }

          .qp-toolbar,
          .qp-bottom-bar {
            display: none !important;
          }

          .qp-scroll {
            display: block !important;
            width: 100% !important;
            height: auto !important;
            max-height: none !important;
            overflow: visible !important;
            background: #fff !important;
          }

          /*
            Chrome print zoom reduces the physical content height,
            helping keep the complete quotation on one A4 page.
            Width is compensated to use the complete printable width.
          */
          .qp-paper {
            display: block !important;
            width: 128.2% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            zoom: .78;
            background: #fff !important;
            color: #202020 !important;
            font-size: 10px !important;
          }

          .qp-banner {
            grid-template-columns: 120px minmax(0, 1fr) 170px !important;
            min-height: 78px !important;
          }

          .qp-banner-title h1 {
            font-size: 23px !important;
          }

          .qp-banner-title p {
            font-size: 29px !important;
          }

          .qp-meta {
            font-size: 10px !important;
            gap: 5px !important;
          }

          .qp-greeting {
            padding: 10px 5px 5px !important;
          }

          .qp-section-heading {
            font-size: 15px !important;
            padding: 4px !important;
          }

          .qp-cell {
            padding: 4px !important;
            font-size: 9px !important;
          }

          .qp-pricing {
            margin-top: 10px !important;
          }

          .qp-table {
            font-size: 9px !important;
          }

          .qp-table th,
          .qp-table td {
            padding: 4px !important;
          }

          .qp-panels {
            grid-template-columns: minmax(0, .8fr) minmax(0, 1.65fr) !important;
            gap: 8px !important;
            margin-top: 10px !important;
          }

          .qp-panel-title {
            font-size: 13px !important;
            padding: 4px !important;
          }

          .qp-charges .qp-panel-title {
            font-size: 11px !important;
          }

          .qp-notes ul,
          .qp-charge-list {
            font-size: 9px !important;
          }

          .qp-charge-row {
            padding: 3px 0 !important;
          }

          .qp-footer {
            margin-top: 8px !important;
            padding: 6px 3px 0 !important;
          }

          .qp-section,
          .qp-pricing,
          .qp-panels,
          .qp-notes,
          .qp-charges {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      <div className="qp-overlay fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5">
        <div className="qp-modal rounded-xl shadow-2xl">
          {/* Modal toolbar */}
          <div className="qp-toolbar flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-5 py-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Rate Quotation
              </h2>
              <p className="text-sm text-gray-500">
                {show(data?.fullName, "Customer")}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-2 rounded-lg border-2 border-green-800 bg-green-700 px-4 py-2 text-sm font-bold text-white hover:bg-green-800"
              >
                <Printer size={16} />
                Print / PDF
              </button>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Scroll container only for screen */}
          <div className="qp-scroll min-h-0 flex-1 overflow-y-auto bg-white">
            <main className="qp-paper">
              {/* HEADER */}
              <header className="qp-banner">
                <div className="qp-logo">
                  <Image
                    src={urbancruiselogo}
                    alt="Urban Cruise Logo"
                    width={125}
                    height={90}
                    priority
                    className="h-auto max-h-[85px] w-full object-contain"
                  />
                </div>

                <div className="qp-banner-title">
                  <h1>VEHICLE RENTAL</h1>
                  <p>PRICING</p>
                </div>

                <div className="qp-meta">
                  <div className="qp-meta-row">
                    <span>Quote No :</span>
                    <span>{show(data?.quote_no || data?.quoteNo)}</span>
                  </div>
                  <div className="qp-meta-row">
                    <span>Date :</span>
                    <span>{quoteDate}</span>
                  </div>
                  <div className="qp-meta-row">
                    <span>Valid till :</span>
                    <span>{validTill}</span>
                  </div>
                </div>
              </header>

              {/* GREETING */}
              <section className="qp-greeting">
                <p className="qp-customer">
                  Dear {show(data?.fullName, "Customer")}
                  {data?.companyName && (
                    <>
                      {" "}
                      <span className="text-pink-600">||</span>{" "}
                      {data.companyName}
                    </>
                  )}
                  {data?.customerCity ? `, ${data.customerCity}` : ""}
                </p>

                <p className="qp-welcome">Greetings from Urban Cruise™!</p>

                <p className="font-bold">
                  With reference to your Enquiry, pls find the Trip details,
                  Vehicle Options &amp; Pricing.
                </p>
              </section>

              {/* ITINERARY */}
              <section className="qp-section">
                <div className="qp-section-heading">YOUR TRAVEL ITINERARY</div>

                <div className="qp-travel-top">
                  <div className="qp-cell qp-label">
                    <span>Travel Detail</span>
                    <span className="qp-arrow">▶</span>
                  </div>

                  <div className="qp-cell text-center">
                    <p className="qp-blue">
                      {show(data?.pickupDate)} {show(data?.pickupTime)}
                    </p>{" "}
                    <p className="qp-blue mt-1">{show(data?.pickupLocation)}</p>
                  </div>

                  <div className="qp-cell font-semibold">
                    {show(data?.routeDetails)}
                  </div>

                  <div className="qp-cell text-center">
                    <p className="qp-red">
                      {show(data?.dropDate)} {show(data?.dropTime)}
                    </p>
                    <p className="qp-red mt-1">{show(data?.dropLocation)}</p>
                  </div>
                </div>

                <div className="qp-travel-bottom">
                  <div className="qp-cell qp-label">
                    <span>Travel Date</span>
                    <span className="qp-arrow">▶</span>
                  </div>

                  <div className="qp-cell text-center">
                    <p className="font-bold">
                      {show(data?.pickupDate)} to {show(data?.dropDate)}
                    </p>
                    <p className="mt-1 font-bold text-green-700">
                      {data?.duration ? `(${data.duration})` : ""}
                    </p>
                  </div>

                  <div className="qp-cell text-center">
                    <p className="font-bold">TRIP TYPE</p>
                    <p className="font-bold text-orange-600">
                      {show(data?.tripType)}
                    </p>
                  </div>

                  <div className="qp-cell text-center">
                    <p className="font-bold">PAX</p>
                    <p className="text-xl font-black text-cyan-600">
                      {show(data?.passangerTotal ?? data?.passengerTotal)}
                    </p>
                  </div>

                  <div className="qp-cell">
                    <span className="font-bold text-red-600">Remarks-</span>{" "}
                    {show(data?.remarks, "")}
                  </div>
                </div>
              </section>

              {/* VEHICLE PRICING */}
              <section className="qp-pricing">
                <div className="qp-section-heading">
                  VEHICLE OPTIONS &amp; PRICING
                </div>

                <table className="qp-table">
                  <thead>
                    <tr>
                      <th className="qp-number">#</th>
                      <th className="qp-type">VEHICLE TYPE</th>
                      <th className="qp-quantity">NO. OF VEH.</th>
                      <th className="qp-description">DESCRIPTION</th>
                      <th className="qp-price">DISCOUNTED PRICE</th>
                    </tr>
                  </thead>

                  <tbody>
                    {vehicles.length ? (
                      vehicles.map((v: any, index: number) => {
                        const category = String(
                          v?.category || "",
                        ).toLowerCase();

                        const rowClass = category.includes("royal")
                          ? "qp-royal"
                          : category.includes("premium")
                            ? "qp-premium"
                            : "";

                        return (
                          <tr
                            key={v?.id ?? index}
                            className={`qp-vehicle ${rowClass}`}
                          >
                            <td>{index + 1}</td>
                            <td className="font-bold">
                              {show(v?.vehicleType || v?.vehicle_type)}
                            </td>
                            <td className="text-center font-bold">
                              {show(
                                v?.quantity ??
                                  v?.noOfVehicles ??
                                  v?.no_of_vehicles,
                                "1",
                              )}
                            </td>
                            <td>
                              <strong>{show(v?.category, "STANDARD")}</strong>
                              {v?.description ? ` - ${v.description}` : ""}
                            </td>
                            <td className="qp-price">
                              {money(
                                v?.discountedPrice ??
                                  v?.discounted_price ??
                                  v?.amount,
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr className="qp-vehicle">
                        <td colSpan={5} className="text-center">
                          No vehicle options available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                <div className="qp-offer">
                  <strong>DIWALI OFFER</strong> Discount of Rs. 2000/- already
                  applied in above price.
                </div>
              </section>

              {/* NOTES & OTHER CHARGES */}
              <section className="qp-panels">
                <div className="qp-notes">
                  <h3 className="qp-panel-title">NOTES</h3>

                  <ul>
                    <li>
                      Above <strong>Pricing includes</strong> Vehicle Cost, Fuel
                      Cost, Driver, Local Tax etc.
                    </li>
                    <li>
                      <strong>KM</strong> will be counted from Pickup Point to
                      Pickup Point.
                    </li>
                    <li>
                      <strong>A/C will be switched OFF</strong> intermittently
                      on Hills.
                    </li>
                    <li>
                      Visit to Local Delhi Places is{" "}
                      <strong className="text-red-600">not included</strong> in
                      cost.
                    </li>
                    <li>
                      <strong>Restricted Places:</strong> Vehicle may not go to
                      some places on Hills due to restrictions by Local Govt. /
                      Difficult Terrain / Narrow Roads.
                    </li>
                  </ul>
                </div>

                <div className="qp-charges">
                  <h3 className="qp-panel-title">
                    OTHER CHARGES{" "}
                    <span className="text-[9px]">(if Applicable)</span>
                  </h3>

                  <div className="qp-charge-list">
                    <div className="qp-charge-row">
                      <div className="qp-charge-name">Toll Charges</div>
                      <div className="qp-charge-value">
                        Already included in the Cost.
                      </div>
                    </div>

                    <div className="qp-charge-row">
                      <div className="qp-charge-name">State Entry Tax</div>
                      <div className="qp-charge-value">
                        <strong>NOT Included.</strong> Client will Pay to
                        Driver.
                      </div>
                    </div>

                    <div className="qp-charge-row">
                      <div className="qp-charge-name">
                        Parking &amp; Police Entry
                      </div>
                      <div className="qp-charge-value">
                        <strong>NOT Included.</strong> Client will Pay to
                        Driver.
                      </div>
                    </div>

                    <div className="qp-charge-row">
                      <div className="qp-charge-name">
                        Extra Charge above 1800 km
                      </div>
                      <div className="qp-charge-value">
                        Rs. 20/km (1–3) | Rs. 26/km (4) | Rs. 40/km (5)
                      </div>
                    </div>

                    <div className="qp-charge-row">
                      <div className="qp-charge-name">Extra Charge (Local)</div>
                      <div className="qp-charge-value">
                        Above N/A | Rs. 20/km | Rs. 150/hr
                      </div>
                    </div>

                    <div className="qp-charge-row">
                      <div className="qp-charge-name">Driver Night Charge</div>
                      <div className="qp-charge-value">
                        <strong>NOT Included.</strong> Client will Pay to
                        Driver.
                      </div>
                    </div>

                    <div className="mt-2 text-[10px]">
                      (Before 6am (1st Day) &amp; after 11pm (Last Day) -{" "}
                      <strong>Rs. 500</strong>)
                      <br />
                      After 1 am - <strong>Rs. 500/Hr.</strong> | After 3 am -
                      Next Day Charge
                    </div>
                  </div>
                </div>
              </section>
            </main>
          </div>

          <div className="qp-bottom-bar flex justify-end border-t border-gray-200 bg-white px-5 py-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-gray-100 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return typeof document !== "undefined"
    ? createPortal(modal, document.body)
    : null;
}
