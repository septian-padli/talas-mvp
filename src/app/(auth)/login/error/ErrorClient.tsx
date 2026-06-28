"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { LOGO } from "@/lib/logo-const";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

function ErrorContent() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("error");

  let errorTitle = "Authentication Failed";
  let errorMessage = "An unexpected error occurred during the login process. Please try again.";

  switch (errorCode) {
    case "Configuration":
      errorTitle = "Configuration Error";
      errorMessage = "There is a problem with the server authentication configuration. Please check developer settings.";
      break;
    case "AccessDenied":
      errorTitle = "Access Denied";
      errorMessage = "Access was denied. Your account may not have permission to log in, or the action was cancelled.";
      break;
    case "Verification":
      errorTitle = "Verification Expired";
      errorMessage = "The login verification window has expired or has already been used. Please request a new link.";
      break;
    case "EmailRequired":
      errorTitle = "Email Required";
      errorMessage = "Your Google account did not return a valid email address. Please check your Google account settings.";
      break;
    case "CallbackError":
      errorTitle = "Connection Failed";
      errorMessage = "We could not reach the database server to process your login. Please try again in a few moments.";
      break;
    case "OAuthSignin":
    case "OAuthCallback":
    case "OAuthCreateAccount":
    case "Callback":
      errorTitle = "OAuth Provider Error";
      errorMessage = "We encountered a problem communicating with the Google authentication provider. Please try again.";
      break;
  }

  return (
    <Card className="w-full sm:max-w-md relative z-10 bg-olive-950/90 border-olive-900/50 backdrop-blur-md text-white shadow-2xl">
      <CardHeader className="text-center pb-4">
        <div className="mb-4 flex justify-center">
          <Image src={LOGO.HORIZONTAL.COLOR_WHITE} alt="Talas Logo" width={200} height={60} style={{ width: "auto", height: "auto" }} priority />
        </div>
        <div className="flex justify-center my-3 text-red-500">
          <AlertCircle className="h-16 w-16 animate-bounce" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight text-white mt-2">
          {errorTitle}
        </CardTitle>
        <p className="text-olive-400 text-sm mt-2 px-2">
          {errorMessage}
        </p>
      </CardHeader>
      <CardContent className="text-center text-xs text-olive-500">
        Code: <span className="font-mono bg-olive-900/30 px-2 py-0.5 rounded">{errorCode || "Default"}</span>
      </CardContent>
      <CardFooter className="pt-2">
        <Link href="/login" className="w-full">
          <Button className="w-full bg-primary hover:bg-primary/95 text-white py-2 rounded-md font-medium transition-colors">
            Back to Login
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function ErrorClient() {
  return (
    <div
      className="relative flex min-h-screen w-full items-center justify-center p-4 bg-cover bg-center overflow-hidden"
      style={{ backgroundImage: "url('/background.webp')" }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
      <Suspense fallback={
        <div className="text-white relative z-10">Loading error details...</div>
      }>
        <ErrorContent />
      </Suspense>
    </div>
  );
}
