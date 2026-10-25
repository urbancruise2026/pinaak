import React from "react";

interface SubCardProps {
  title: string;
  children: React.ReactNode;
}

const SubCard: React.FC<SubCardProps> = ({ title, children }) => (
  <div className="p-5 mb-6 bg-white border rounded-xl shadow-sm">
    <h4 className="mb-4 font-extrabold text-purple-800 text-md">{title}</h4>
    {children}
  </div>
);

export default SubCard;