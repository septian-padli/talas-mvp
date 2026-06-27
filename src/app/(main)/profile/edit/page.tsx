import { Metadata } from "next";
import EditProfileClient from "./EditProfileClient";

export const metadata: Metadata = {
  title: "Edit Profile | Talas",
  description: "Update your Talas profile details, avatar, and social links.",
};

export default function EditProfilePage() {
  return <EditProfileClient />;
}
