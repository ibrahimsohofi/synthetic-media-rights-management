import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { VerifyPageClient } from "./verify-client";

export default function VerifyPage() {
  return (
    <DashboardLayout>
      <VerifyPageClient />
    </DashboardLayout>
  );
}
