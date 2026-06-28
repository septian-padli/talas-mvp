"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "@tanstack/react-form"
import { toast } from "sonner"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import Image from "next/image";
import { LOGO } from "@/lib/logo-const";
import Link from "next/link";
import { signIn } from "next-auth/react";

const formSchema = z.object({
    email: z
        .string()
        .min(1, "Email must not be empty.")
        .email("Please enter a valid email address."),
    password: z
        .string()
        .min(6, "Password must be at least 6 characters."),
})

export default function LoginClient() {
    const [dbStatus, setDbStatus] = useState<"checking" | "connected" | "disconnected">("checking");

    useEffect(() => {
        let isMounted = true;
        const checkDb = async () => {
            try {
                const res = await fetch("/api/health");
                const data = await res.json();
                if (isMounted) {
                    if (data.success && data.status === "connected") {
                        setDbStatus("connected");
                    } else {
                        setDbStatus("disconnected");
                    }
                }
            } catch (error) {
                if (isMounted) setDbStatus("disconnected");
            }
        };
        checkDb();
        return () => {
            isMounted = false;
        };
    }, []);

    const form = useForm({
        defaultValues: {
            email: "",
            password: "",
        },
        validators: {
            onSubmit: formSchema,
        },
        onSubmit: async ({ value }) => {
            toast("Form submitted successfully", {
                description: `Logged in as: ${value.email}`,
                position: "bottom-right",
            })
        },
    })

    const handleGoogleLogin = () => {
        signIn("google", { callbackUrl: "/" });
    }

    return (
        <div
            className="relative flex min-h-screen w-full items-center justify-center p-4 bg-cover bg-center overflow-hidden"
            style={{ backgroundImage: "url('/background.webp')" }}
        >
            {/* Backdrop overlay for text legibility */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] " />

            <Card className="w-full sm:max-w-md relative z-10 bg-olive-950/90 border-olive-900/50 backdrop-blur-md text-white shadow-2xl">
                <CardHeader className="text-center pb-4">
                    <div className="mb-4 flex justify-center">
                        <Image src={"/logo/webp/talas-logo-design-talas-horizontal-color-white.webp"} alt="Talas Logo" width={200} height={60} style={{ width: "auto", height: "auto" }} />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight text-white">
                        Join Talas and Showcase Your Creations
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* <form
                        id="login-form"
                        onSubmit={(e) => {
                            e.preventDefault()
                            form.handleSubmit()
                        }}
                    >
                        <FieldGroup className="gap-4">
                            <form.Field name="email">
                                {(field) => {
                                    const isInvalid =
                                        field.state.meta.isTouched && !field.state.meta.isValid
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name} className="text-white text-sm font-medium">
                                                Email
                                            </FieldLabel>
                                            <Input
                                                id={field.name}
                                                name={field.name}
                                                type="email"
                                                value={field.state.value}
                                                onBlur={field.handleBlur}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                aria-invalid={isInvalid}
                                                placeholder="nama@email.com"
                                                autoComplete="email"
                                                className="bg-olive-900/50 border-olive-800 text-white placeholder:text-olive-400 focus-visible:ring-primary focus-visible:border-primary"
                                            />
                                            {isInvalid && (
                                                <FieldError errors={field.state.meta.errors} className="text-red-400 text-xs mt-1" />
                                            )}
                                        </Field>
                                    )
                                }}
                            </form.Field>
                            <form.Field name="password">
                                {(field) => {
                                    const isInvalid =
                                        field.state.meta.isTouched && !field.state.meta.isValid
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name} className="text-white text-sm font-medium">
                                                Password
                                            </FieldLabel>
                                            <Input
                                                id={field.name}
                                                name={field.name}
                                                type="password"
                                                value={field.state.value}
                                                onBlur={field.handleBlur}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                aria-invalid={isInvalid}
                                                placeholder="••••••••"
                                                autoComplete="current-password"
                                                className="bg-olive-900/50 border-olive-800 text-white placeholder:text-olive-400 focus-visible:ring-primary focus-visible:border-primary"
                                            />
                                            {isInvalid && (
                                                <FieldError errors={field.state.meta.errors} className="text-red-400 text-xs mt-1" />
                                            )}
                                        </Field>
                                    )
                                }}
                            </form.Field>

                            <Button type="submit" className="w-full mt-4 bg-primary hover:bg-primary/95 text-white py-2 rounded-md font-medium transition-colors">
                                Login
                            </Button>
                        </FieldGroup>
                    </form>


                    <div className="relative flex py-2 items-center">
                        <div className="grow border-t border-olive-800"></div>
                        <span className="shrink mx-4 text-olive-400 text-xs uppercase tracking-wider">atau</span>
                        <div className="grow border-t border-olive-800"></div>
                    </div> */}

                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleGoogleLogin}
                        className="w-full bg-white hover:bg-neutral-100 text-neutral-800 border-neutral-200 py-2 rounded-md font-medium flex items-center justify-center transition-colors"
                    >
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22-.03-.63z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.62 2.81c.87-2.6 3.3-4.49 6.16-4.49z"
                            />
                        </svg>
                        Login with Google
                    </Button>
                    <div className="flex items-center justify-center gap-2 mt-4 text-xs text-olive-400">
                        <span>Database Status:</span>
                        {dbStatus === "checking" && (
                            <span className="flex items-center gap-1.5 text-neutral-400">
                                <span className="h-2 w-2 rounded-full bg-neutral-500 animate-pulse" />
                                checking...
                            </span>
                        )}
                        {dbStatus === "connected" && (
                            <span className="flex items-center gap-1.5 text-emerald-400">
                                <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                                online
                            </span>
                        )}
                        {dbStatus === "disconnected" && (
                            <span className="flex items-center gap-1.5 text-rose-400">
                                <span className="h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)] animate-ping" />
                                offline
                            </span>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
