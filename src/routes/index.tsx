import Header from "@/components/ui/header.tsx";
import { createFileRoute } from "@tanstack/react-router";
import "../App.css";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  return (
    <>
      <Header title="Dashboard" />

      <section>
        <h2 className="font-medium text-xl mb-2">Issues</h2>
        <p className="text-gray-500 text-sm" data-slot="issues">
          Resolve before the data can be used for building models
        </p>
      </section>
    </>
  );
}
