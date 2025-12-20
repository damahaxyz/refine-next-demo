"use client";

import { useForm } from "@refinedev/react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Form,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
  FormField,
} from "@/components/ui/form";

import { Button } from "@/components/ui/button";
import { useUpdatePassword } from "@refinedev/core";
import { GlobalDialog } from "@/lib/dialog";
import { InputPassword } from "@components/custom/input-password";

// -----------------------------
// 🔐 Zod 校验规则
// -----------------------------
const schema = z
  .object({
    oldPassword: z.string().min(1, "请输入原密码"),
    newPassword: z.string().min(6, "新密码至少 6 位"),
    confirmPassword: z.string().min(6, "请输入确认密码"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "两次密码不一致",
    path: ["confirmPassword"],
  });
type ChangePasswordFormData = z.infer<typeof schema>;
// -----------------------------

export const ChangePasswordDialog = ({ open, onOpenChange }: any) => {

  const { mutateAsync: updatePassword } = useUpdatePassword();
  // const { mutate: logout } = useLogout();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    refineCoreProps: {
      queryOptions: { enabled: false },
    },
  });

  // -----------------------------
  // 🔧 提交逻辑
  // -----------------------------
  const onSubmit = async (values: ChangePasswordFormData) => {
    let data = await updatePassword(values, {});
    let res: any = data.res;

    if (res.code == 0) {
      await GlobalDialog.success("成功", "修改密码成功！");

    } else {
      await GlobalDialog.error("错误", res.message);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>修改密码</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 pt-2"
          >
            {/* 原密码 */}
            <FormField control={form.control} name="oldPassword" render={({ field }) => (
              <FormItem>
                <FormLabel>原密码</FormLabel>
                <FormControl>
                  <InputPassword
                    placeholder="输入原密码"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* 原密码 */}
            <FormField control={form.control} name="newPassword" render={({ field }) => (
              <FormItem>
                <FormLabel>新密码</FormLabel>
                <FormControl>
                  <InputPassword
                    placeholder="输入新密码"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />



            {/* 确认密码 */}
            <FormField control={form.control} name="confirmPassword" render={({ field }) => (
              <FormItem>
                <FormLabel>原密码</FormLabel>
                <FormControl>
                  <InputPassword
                    placeholder="确认新密码"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                取消
              </Button>

              <Button type="submit">保存</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
