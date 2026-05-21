import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";

export const Route = createFileRoute("/configurations")({
  component: () => (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ),
});
