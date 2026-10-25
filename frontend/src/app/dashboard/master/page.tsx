import { redirect } from "next/navigation";

export default function MasterIndex() {
  redirect("/dashboard/master/customer-table");
}