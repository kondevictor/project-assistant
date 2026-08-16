"use client";

import { SignUp } from "@clerk/nextjs";
import { Building2, UserPlus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const clerkPubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 mb-4 shadow-lg">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create an Account</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Join Project Assistant today</p>
        </div>

        {clerkPubKey ? (
          <SignUp
            appearance={{
              elements: {
                formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5",
                card: "shadow-xl border border-gray-100 dark:border-gray-800 rounded-xl",
                socialButtonsBlockButton: "border border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium",
              },
            }}
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
          />
        ) : (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold">Sign Up Options</h2>
              <p className="text-sm text-gray-500">Sign up instantly using Google</p>
            </div>

            <a href="/api/google/auth" className="w-full block">
              <Button size="lg" className="w-full bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 font-medium shadow-sm py-6 flex items-center justify-center gap-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                Sign up with Google
              </Button>
            </a>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-gray-800 px-2 text-gray-500">Or continue</span></div>
            </div>

            <Link href="/onboarding" className="w-full block">
              <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-6">
                <UserPlus className="w-5 h-5 mr-2" />
                Get Started
              </Button>
            </Link>
          </div>
        )}

        <div className="text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-blue-600 font-medium hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
