"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { users } from "@/db/schema";

export default function IssuerAccountCom({
  user,
}: {
  user: typeof users.$inferSelect;
}) {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="shadow-md rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Your Account</span>
            <Badge variant="secondary" className="uppercase">
              {user.role}
            </Badge>
          </CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="space-y-3 mt-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Full Name</span>
            <span>{user.fullName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email</span>
            <span>{user.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Institution</span>
            <span>{user.institutionName || "-"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Address</span>
            <span className="font-mono">
              {user.address.slice(0, 10) + "..."}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Joined</span>
            <span>{new Date(user.createdAt).toDateString()}</span>
          </div>

          <Separator className="my-3" />
        </CardContent>
      </Card>
    </div>
  );
}
