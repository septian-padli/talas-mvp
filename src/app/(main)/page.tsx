import Sidebar from "@/components/Sidebar";

export default function Home() {
  return (
    <main className="bg-olive-950 min-h-screen text-white flex flex-row">
      {/* sidebar */}
      <Sidebar />

      {/* content */}
      <div className="bg-olive-950 flex-1 p-8">content</div>
    </main>
  );
}
