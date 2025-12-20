"use client";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useForgotPassword, useLink } from "@refinedev/core";
import z from "zod";
import { useForm } from "@refinedev/react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem } from "@/components/ui/form";
import Link from "next/link";

const formSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
})
type ForgotPasswordFormData = z.infer<typeof formSchema>;

export const ForgotPasswordForm = () => {



  const { mutate: forgotPassword } = useForgotPassword();

  const {
    refineCore: { formLoading },
    ...form
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleForgotPassword = async (data: ForgotPasswordFormData) => {
    forgotPassword({
      email: data.email,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleForgotPassword)} className={cn("space-y-4")}>
        <FormField name="email" control={form.control} render={({ field }) => (
          <FormItem>
            <Label htmlFor="email">Email</Label>
            <Input
              placeholder="Enter your email address"
              {...field}
            />
          </FormItem>
        )} />

        <Button type="submit" disabled={formLoading} className={cn("w-full")}>
          {formLoading ? "Sending..." : "Continue"}
        </Button>

      </form>

      <div className={cn("mt-8")}>
        <Link
          href="/login"
          className={cn(
            "inline-flex",
            "items-center",
            "gap-2",
            "text-sm",
            "text-muted-foreground",
            "hover:text-foreground",
            "transition-colors"
          )}
        >
          <ArrowLeft className={cn("w-4", "h-4")} />
          <span>Back</span>
        </Link>
      </div>
    </Form>
  );
};

ForgotPasswordForm.displayName = "ForgotPasswordForm";
