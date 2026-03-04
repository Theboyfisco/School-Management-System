import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const role = user.user_metadata?.role || "admin";
  const id = user.id;

  switch (role.toLowerCase()) {
    case "admin":
      redirect("/admin");
    case "teacher":
      redirect(`/list/teachers/${id}`);
    case "student":
      redirect(`/list/students/${id}`);
    case "parent":
      redirect(`/list/parents/${id}`);
    default:
      redirect("/");
  }
}
