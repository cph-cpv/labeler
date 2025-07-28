import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/samples/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  // Since we've moved to inline editing in the samples table,
  // redirect individual sample routes back to the main samples page
  return <Navigate to="/samples" />;
}
