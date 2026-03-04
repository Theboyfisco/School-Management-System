import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export default async function HomePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const role = user.user_metadata?.role || "admin";
    redirect(`/${role.toLowerCase()}`);
  } else {
    redirect("/login");
  }
}
