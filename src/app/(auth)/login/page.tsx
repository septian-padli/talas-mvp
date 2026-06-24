import LoginClient from "./LoginClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | Talas",
  description: "Login to your Talas account",
};

export default function LoginPage() {
  return <LoginClient />;
}
