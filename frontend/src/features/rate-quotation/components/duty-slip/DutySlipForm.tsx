"use client";

import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  Building2,
  Check,
  RotateCcw,
  ScrollText,
  Send,
  User,
} from "lucide-react";
import { THEME, createInitialForm } from "./constants";
import {
  buildMessage,
  buildPayload,
  buildSummary,
  calculate,
  validate,
} from "./utils";
import { VendorSection } from "./sections/VendorSection";
import { TripDetailsSection } from "./sections/TripDetailsSection";
import { VehicleSection } from "./sections/VehicleSection";
import { CustomerSection } from "./sections/CustomerSection";
import { PaymentSection } from "./sections/PaymentSection";
import { TermsSection } from "./sections/TermsSection";
import { InstructionsSection } from "./sections/InstructionsSection";
import { SummaryPanel } from "../booking-assignment/components/SummaryPanel";
import type { FormState, SectionProps, SetField, TripType } from "./types";

const TABS: Array<{ key: TripType; label: string; icon: React.ElementType }> = [
  { key: "personal", label: "Personal", icon: User },
  { key: "corporate", label: "Corporate", icon: Building2 },
];

const DutySlipForm = ({ onClose }: { onClose?: () => void }) => {
  const [tripType, setTripType] = useState<TripType>("personal");
  const [form, setForm] = useState<FormState>(createInitialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const theme = THEME[tripType];
  const isPersonal = tripType === "personal";

  const set: SetField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => {
      if (!e[key as string]) return e;
      const next = { ...e };
      delete next[key as string];
      return next;
    });
  };

  const calc = useMemo(() => calculate(form, isPersonal), [form, isPersonal]);
  const message = useMemo(
    () => buildMessage(form, tripType, calc),
    [form, tripType, calc],
  );
  const summary = useMemo(
    () => buildSummary(form, tripType, calc),
    [form, tripType, calc],
  );

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const found = validate(form, isPersonal, calc);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setTimeout(
        () =>
          document
            .querySelector("[data-error='true']")
            ?.scrollIntoView({ behavior: "smooth", block: "center" }),
        0,
      );
      return;
    }

    const payload = buildPayload(form, tripType, calc, message);
    // TODO(backend): await dispatch(createDutySlip(payload)).unwrap();
    console.log("Duty Slip payload:", payload);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const reset = () => {
    setForm(createInitialForm());
    setErrors({});
    setSubmitted(false);
  };

  const sectionProps: SectionProps = {
    form,
    set,
    errors,
    isPersonal,
    theme,
    calc,
  };

  return (
    <div className={`min-h-screen ${theme.pageBg}`}>
      {/* HEADER */}
      <div className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                title="Back"
                aria-label="Back"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <span
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${theme.iconBg}`}
            >
              <ScrollText className="h-6 w-6" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 className="text-2xl font-semibold leading-tight text-slate-900">
                Duty Slip
                <span className={`ml-2 text-base font-medium ${theme.text}`}>
                  {theme.label}
                </span>
              </h2>
              <p className="text-sm text-slate-500">
                Send trip, customer and payment details to the vendor
              </p>
            </div>
          </div>

          <div
            role="tablist"
            aria-label="Trip category"
            className="inline-flex shrink-0 rounded-xl border border-slate-200 bg-slate-50 p-1"
          >
            {TABS.map(({ key, label, icon: Icon }) => {
              const active = tripType === key;
              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTripType(key)}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-6 py-2.5 text-base font-semibold transition-colors sm:flex-none ${
                    active
                      ? `${THEME[key].soft} shadow-sm ${THEME[key].text}`
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1500px] px-5 py-5">
        {submitted && (
          <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-base text-green-800">
            <Check className="h-5 w-5" aria-hidden="true" />
            Duty slip created (payload logged to console).
            <button
              type="button"
              onClick={reset}
              className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-green-200 bg-white px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-100"
            >
              <RotateCcw className="h-4 w-4" /> New duty slip
            </button>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          noValidate
          className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_480px]"
        >
          <div className="flex min-w-0 flex-col gap-5">
            <VendorSection {...sectionProps} />
            <TripDetailsSection {...sectionProps} />
            <VehicleSection {...sectionProps} />
            <CustomerSection {...sectionProps} />
            <PaymentSection {...sectionProps} />
            <TermsSection {...sectionProps} />
            <InstructionsSection {...sectionProps} />

            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={reset}
                className="inline-flex h-12 items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-base font-medium text-slate-600 shadow-sm hover:border-slate-400"
              >
                <RotateCcw className="h-5 w-5" /> Reset
              </button>
              <button
                type="submit"
                className={`inline-flex h-12 items-center gap-2 rounded-xl px-7 text-base font-semibold text-white shadow-md transition-colors ${theme.btn}`}
              >
                <Send className="h-5 w-5" /> Create duty slip
              </button>
            </div>
          </div>

          <aside className="min-w-0 xl:sticky xl:top-4">
            <SummaryPanel summary={summary} message={message} theme={theme} />
          </aside>
        </form>
      </div>
    </div>
  );
};

export default DutySlipForm;
