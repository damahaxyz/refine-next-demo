import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthLayout } from "../auth-layout";
import { SignUpForm } from "./sign-up-form";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export const Register = () => {
  return <AuthLayout>
    <Card className='gap-4'>
      <CardHeader>
        <CardTitle className='text-lg tracking-tight'>
          Create an account
        </CardTitle>
        <CardDescription>
          Enter your email and password to create an account. <br />
          Already have an account?{' '}
          <Link
            href='/sign-in'
            className='hover:text-primary underline underline-offset-4'
          >
            Sign In
          </Link>
        </CardDescription>
      </CardHeader>

      <CardContent>
        <SignUpForm />
      </CardContent>

      <Separator />

      <CardFooter>
        <div className={cn("w-full", "text-center text-sm")}>
          <span className={cn("text-sm", "text-muted-foreground")}>
            Have an account?{" "}
          </span>
          <Link
            href="/login"
            className={cn(
              "text-gray-600",
              "dark:text-gray-400",
              "font-semibold",
              "underline"
            )}
          >
            Sign in
          </Link>
        </div>
      </CardFooter>
    </Card>
  </AuthLayout>
};
