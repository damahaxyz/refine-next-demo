"use client";
import { useState } from "react";

import { CircleHelp, LogIn } from "lucide-react";

import { InputPassword } from "@/components/input-password";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useLogin } from "@refinedev/core";
import { IconGithub } from "@/assets/brand-icons/icon-github";
import { IconGmail } from "@/assets/brand-icons/icon-gmail";
import z from "zod";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "@refinedev/react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const formSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});
type LoginFormData = z.infer<typeof formSchema>;

export const SignInForm = () => {
  const [rememberMe, setRememberMe] = useState(false);



  const {
    refineCore: { onFinish, formLoading },
    ...form
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  const { mutate: login } = useLogin();

  const handleSignIn = async (data: LoginFormData) => {

    login({
      username: data.username,
      password: data.password,
    });
  };

  const handleSignInWithGoogle = () => {
    login({
      providerName: "google",
    });
  };

  const handleSignInWithGitHub = () => {
    login({
      providerName: "github",
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSignIn)} className="space-y-4">
        <FormField control={form.control} name="username" render={({ field }) => (
          <FormItem>
            <FormLabel>User Name</FormLabel>
            <FormControl>
              <Input
                placeholder="Enter your userName"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="password" render={({ field }) => (
          <FormItem>
            <FormLabel>Password</FormLabel>
            <FormControl>
              <InputPassword
                placeholder="Enter your password"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />


        <div
          className={cn(
            "flex items-center justify-between",
            "flex-wrap",
            "gap-2",
            "mt-4"
          )}
        >
          <div className={cn("flex items-center", "space-x-2")}>
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) =>
                setRememberMe(checked === "indeterminate" ? false : checked)
              }
            />
            <Label htmlFor="remember">Remember me</Label>
          </div>
          <Link
            href="/forgot-password"
            className={cn(
              "text-sm",
              "flex",
              "items-center",
              "gap-2",
              "text-primary hover:underline",
              "text-gray-600",
              "dark:text-gray-400"
            )}
          >
            <span>Forgot password</span>
            <CircleHelp className={cn("w-4", "h-4")} />
          </Link>
        </div>

        <Button type="submit" size="lg" className={cn("w-full", "mt-6")} disabled={formLoading}>
          <LogIn />{formLoading ? " Signing in..." : " Sign in"}
        </Button>

        <div className={cn("flex", "items-center", "gap-4", "mt-4")}>
          <Separator className={cn("flex-1")} />
          <span className={cn("text-sm", "text-muted-foreground")}>Or continue with</span>
          <Separator className={cn("flex-1")} />
        </div>

        <div className={cn("flex", "flex-col", "gap-4", "mt-4")}>
          <div className={cn("grid grid-cols-2", "gap-6")}>
            <Button
              variant="outline"
              className={cn("flex", "items-center", "gap-2")}
              onClick={handleSignInWithGoogle}
              type="button"
            >
              <IconGmail className={cn("w-5", "h-5")} />
              <div>Google</div>
            </Button>
            <Button
              variant="outline"
              className={cn("flex", "items-center", "gap-2")}
              onClick={handleSignInWithGitHub}
              type="button"
            >
              <IconGithub className={cn("w-5", "h-5")} />
              <div>GitHub</div>
            </Button>
          </div>
        </div>
      </form>
    </Form>


  );
};

SignInForm.displayName = "SignInForm";
