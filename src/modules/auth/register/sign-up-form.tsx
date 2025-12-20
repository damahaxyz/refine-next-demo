
"use client";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { InputPassword } from "@/components/custom/input-password";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  useNotification,
  useRegister,
} from "@refinedev/core";
import { IconGmail } from "@/assets/brand-icons/icon-gmail";
import { IconGithub } from "@/assets/brand-icons/icon-github";
import z from "zod";
import { useForm } from "@refinedev/react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";


const formSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
});
type SignUpFormData = z.infer<typeof formSchema>;

export const SignUpForm = () => {
  const {
    refineCore: { formLoading },
    ...form
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { open } = useNotification();

  const { mutate: register } = useRegister();

  const handleSignUp = async (data: SignUpFormData) => {
    const { username, email, password, confirmPassword } = data;

    if (password !== confirmPassword) {
      open?.({
        type: "error",
        message: "Passwords don't match",
        description:
          "Please make sure both password fields contain the same value.",
      });

      return;
    }

    register({
      username,
      email,
      password,
    });
  };

  const handleSignUpWithGoogle = () => {
    register({
      providerName: "google",
    });
  };

  const handleSignUpWithGitHub = () => {
    register({
      providerName: "github",
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSignUp)} className="space-y-4">
        <FormField control={form.control} name="username" render={({ field }) => (
          <FormItem>
            <FormLabel>Username</FormLabel>
            <FormControl>
              <Input
                placeholder="Enter your username"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input
                placeholder="Enter your email"
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

        <FormField control={form.control} name="confirmPassword" render={({ field }) => (
          <FormItem>
            <FormLabel>Confirm Password</FormLabel>
            <FormControl>
              <InputPassword
                placeholder="Confirm your password"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />


        <Button
          type="submit"
          size="lg"
          className={cn("w-full", "mt-4")}
          disabled={formLoading}
        >
          {formLoading ? "Creating Account..." : "Create Account"}
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
              onClick={handleSignUpWithGoogle}
              type="button"
            >
              <IconGmail className={cn("w-5", "h-5")} />
              <div>Google</div>
            </Button>
            <Button
              variant="outline"
              className={cn("flex", "items-center", "gap-2")}
              onClick={handleSignUpWithGitHub}
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

SignUpForm.displayName = "SignUpForm";
