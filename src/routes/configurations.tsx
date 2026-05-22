import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/configurations")({
  component: () => <Outlet />,
});
