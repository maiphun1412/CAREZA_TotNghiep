import { redirect } from "next/navigation";

export default function AdminNguoiDungRedirectPage() {
  redirect("/admin/users");
}
