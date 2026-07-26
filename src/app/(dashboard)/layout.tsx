import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/sidebar";
import { Toaster } from "react-hot-toast";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  const role = (session.user as any).role as string;

  return (
    <div className="flex h-screen bg-zinc-100">
      <Sidebar role={role} />
      <main className="flex-1 overflow-y-auto">
        <Toaster position="bottom-right" />
        {children}
      </main>
    </div>
  );
}