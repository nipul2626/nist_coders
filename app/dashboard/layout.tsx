import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { GradientBackground } from "@/components/animations/gradient-background";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <GradientBackground />
      <DashboardSidebar />
      <main className="pl-16 md:pl-64 pt-16 min-h-screen transition-all duration-300">
        <div className="p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
