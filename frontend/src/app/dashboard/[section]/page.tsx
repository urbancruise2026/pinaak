import SectionClient from "./SectionClient";

export const dynamicParams = false;

export function generateStaticParams() {
  return ["booking-trip", "payment", "feedback"].map((section) => ({ section }));
}

export default function Page() {
  return <SectionClient />;
}
