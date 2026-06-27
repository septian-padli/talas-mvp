import Sidebar from "@/components/Sidebar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="bg-olive-950 min-h-screen text-white flex flex-row items-start">
      {/* sidebar */}
      <Sidebar />

      {/* content */}
      <div className="bg-olive-950 flex-1 p-8 flex flex-col items-center justify-start gap-6 max-w-4xl mx-auto w-full min-w-0">
        {children}
      </div>
    </main>
  );
}
