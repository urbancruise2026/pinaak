import WebsiteViewClient from "./WebsiteViewClient";

export const dynamicParams = false;

export function generateStaticParams() {
  return ["gac", "gaq"].map((view) => ({ view }));
}

export default function Page() {
  return <WebsiteViewClient />;
}
