import ErrorClient from "./ErrorClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication Error | Talas",
  description: "There was a problem signing you in.",
};

export default function ErrorPage() {
  return <ErrorClient />;
}
