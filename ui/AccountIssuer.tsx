"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { subscription, users } from "@/db/schema";
import { plans } from "@/lib/stripe";

export default function IssuerAccountCom({
  user,
  sub,
  courseCount,
  onCancelSub,
}: {
  user: typeof users.$inferSelect;
  sub: typeof subscription.$inferSelect;
  courseCount: number;
  onCancelSub?: () => void;
}) {
  // pick plan data based on user's subscription
  const currentPlan =
    plans.find((p) => p.plan === (sub?.plan || "free")) || plans[0];

  // define limits from plan
  const maxCourses =
    currentPlan.plan === "free"
      ? 5
      : currentPlan.plan === "pro"
      ? 20
      : Infinity;

  const courseProgress = Math.min(
    (courseCount / (maxCourses === Infinity ? 1 : maxCourses)) * 100,
    100
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
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

          {/* Subscription Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Subscription</h2>
              <Badge variant={sub ? "default" : "outline"}>
                {currentPlan.title.toUpperCase()}
              </Badge>
            </div>

            {sub ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span
                    className={
                      sub.status === "active"
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {sub.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Current Period End
                  </span>
                  <span>
                    {sub.plan === "free"
                      ? "-"
                      : new Date(sub.currentPeriodEnd).toDateString()}
                  </span>
                </div>
                {/* <Button
                  variant="destructive"
                  size="sm"
                  onClick={onCancelSub}
                  className="mt-2"
                >
                  Cancel Subscription
                </Button> */}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                You are currently on a free plan. Upgrade to unlock more
                features and capacity.
              </p>
            )}
          </div>

          <Separator className="my-3" />

          {/* Usage Section */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Usage</h2>

            {/* Courses */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Courses Created</span>
                <span>
                  {courseCount}
                  {maxCourses !== Infinity && ` / ${maxCourses}`}
                </span>
              </div>
              <Progress value={courseProgress} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
