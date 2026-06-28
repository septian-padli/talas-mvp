import { Metadata } from "next";
import NotificationsClient from "./NotificationsClient";

export const metadata: Metadata = {
  title: "Notifications | Talas",
  description: "Daftar notifikasi aktivitas dan pengumuman di platform Talas.",
};

export default function NotificationsPage() {
  return (
    <div className="w-full min-h-screen bg-olive-950 text-white pb-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <NotificationsClient />
      </div>
    </div>
  );
}
