"use client";

import React, { useState } from "react";
import { useForm } from "@refinedev/react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useGetIdentity, useUpdate } from "@refinedev/core";
import * as z from "zod";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";



// -----------------------------

export const AccountProfileDialog = ({ open, onOpenChange }: any) => {
  const { data: user } = useGetIdentity();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>账户信息</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col space-y-3 text-muted-foreground text-sm">
          <div>
            名称: <span className=" text-primary">{user?.name}</span>
          </div>
          <div>
            账号: <span className=" text-primary">{user?.username}</span>
          </div>
          <div>
            角色: {user?.roles?.map((item: string) => <span className=" text-primary" key={item}>{item}</span>)}
          </div>
          {
            user?.extraPermissions && user?.extraPermissions.length > 0 &&
            <div>
              附加权限: {user?.extraPermissions?.map((item: string) => <span className=" text-primary" key={item}>{item}</span>)}
            </div>
          }
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
