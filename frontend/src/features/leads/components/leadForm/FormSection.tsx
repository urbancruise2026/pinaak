import React from "react";

const THEMES = {
  blue: { box: "bg-blue-50", title: "text-blue-800", badge: "bg-blue-600" },
  green: { box: "bg-green-50", title: "text-green-800", badge: "bg-green-600" },
  purple: {
    box: "bg-purple-50",
    title: "text-purple-800",
    badge: "bg-purple-600",
  },
};

interface FormSectionProps {
  step: number;
  title: string;
  theme: keyof typeof THEMES;
  action?: React.ReactNode;
  children: React.ReactNode;
}

const FormSection: React.FC<FormSectionProps> = ({
  step,
  title,
  theme,
  action,
  children,
}) => {
  const t = THEMES[theme];
  return (
    <section className={`border rounded-xl p-6 shadow-sm ${t.box}`}>
      <header className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-3 border-b">
        <h3 className={`flex items-center text-xl font-semibold ${t.title}`}>
          <span className={`${t.badge} text-white px-3 py-1 rounded-md mr-2`}>
            {step}
          </span>
          {title}
        </h3>
        {action}
      </header>
      {children}
    </section>
  );
};

export default FormSection;