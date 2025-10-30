import { db } from "@/db/db";
import { courses } from "@/db/schema";
import { sessionManager } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import React from "react";

export default async function SingleCourse({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch course
  const course = await db.query.courses.findFirst({
    where: eq(courses.id, Number(id)),
  });

  // Auth
  const user = await sessionManager.getUser();
  if (!user) return redirect("/auth");
  if (course?.issuerId !== user.id) return redirect("/dashboard/issuer");
  console.log(course);
  if (!course) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <p className="text-muted-foreground text-lg">Course not found.</p>
      </div>
    );
  }

  // Parse student emails
  let studentEmails: string[] = [];
  try {
    studentEmails = course.studentEmails.split(",");
  } catch {
    studentEmails = [];
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="max-w-3xl mx-auto shadow-lg rounded-2xl">
        <CardHeader className="flex flex-col gap-4">
          {course.courseImageUrl && (
            <div className="relative w-full h-64 overflow-hidden rounded-xl">
              <Image
                src={course.courseImageUrl}
                alt={course.courseName}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div>
            <CardTitle className="text-3xl font-semibold">
              {course.courseName}
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              Created on {new Date(course.createdAt).toLocaleDateString()}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <section>
            <h2 className="text-lg font-medium mb-2">Description</h2>
            <p className="text-muted-foreground">{course.courseDescription}</p>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-2">Students</h2>
            {studentEmails.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {studentEmails.map(
                  (email, index) =>
                    email && (
                      <Badge key={index} variant="outline">
                        {email}
                      </Badge>
                    )
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">No students enrolled yet.</p>
            )}
          </section>

          <section className="text-sm text-muted-foreground">
            <p>Last updated: {new Date(course.updatedAt).toLocaleString()}</p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
