import React, { useState } from "react";
import { Check, ClipboardCopy } from "lucide-react";
import type { Theme } from "../types";

interface Props {
  summary: Array<[string, string]>;
  message: string;
  theme: Theme;
}

/** Right-hand preview: a summary table, or the WhatsApp message text */
export const SummaryPanel = ({ summary, message, theme }: Props) => {
  const [view, setView] = useState<"summary" | "message">("summary");
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked */
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header
        className={`flex flex-wrap items-center gap-2 border-b px-4 py-3 ${theme.header} ${theme.border}`}
      >
        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1">
          {(
            [
              ["summary", "Summary"],
              ["message", "WhatsApp message"],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setView(k)}
              className={`rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                view === k
                  ? `${theme.soft} ${theme.text}`
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={copy}
          className="ml-auto inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-600 shadow-sm hover:border-slate-300"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-green-600" /> Copied
            </>
          ) : (
            <>
              <ClipboardCopy className="h-4 w-4" /> Copy message
            </>
          )}
        </button>
      </header>

      <div className="max-h-[75vh] overflow-auto">
        {view === "summary" ? (
          <table className="w-full border-collapse text-[15px]">
            <tbody className="divide-y divide-slate-100">
              {summary.map(([k, v]) => (
                <tr key={k} className="align-top">
                  <th
                    scope="row"
                    className="w-36 bg-slate-50 px-4 py-2.5 text-left text-sm font-semibold text-slate-600"
                  >
                    {k}
                  </th>
                  <td className="whitespace-pre-line break-words px-4 py-2.5 text-slate-800">
                    {v}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <pre className="whitespace-pre-wrap break-words p-5 font-sans text-[15px] leading-relaxed text-slate-700">
            {message}
          </pre>
        )}
      </div>
    </div>
  );
};
