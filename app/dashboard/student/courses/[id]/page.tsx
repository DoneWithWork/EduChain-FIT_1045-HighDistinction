import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/db/db";
import { certificates } from "@/db/schema";
import { sessionManager } from "@/lib/auth";
import MintButton from "@/ui/MintButton";
import { eq } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function SingleCert({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch cert
  const cert = await db.query.certificates.findFirst({
    where: eq(certificates.id, Number(id)),
    with: {
      courses: true,
      issuer: {
        columns: {
          fullName: true,
        },
      },
    },
  });
  if (!cert) redirect("/dashboard/student");

  // Auth
  const user = await sessionManager.getUser();
  if (!user) return redirect("/auth");
  if (cert?.studentId !== user.id) return redirect("/dashboard/student");
  if (!cert) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <p className="text-muted-foreground text-lg">Cert not found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="max-w-3xl mx-auto shadow-lg rounded-2xl">
        <CardHeader className="flex flex-col gap-4">
          <div className="relative w-full h-64 overflow-hidden rounded-xl">
            <Image
              src={cert.courses.courseImageUrl}
              alt={cert.courses.courseName}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <CardTitle className="text-3xl font-semibold">
              {cert.courses.courseName}
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              Created on {new Date(cert.createdAt).toLocaleDateString()}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <section>
            <h2 className="text-lg font-medium mb-2">Description</h2>
            <p className="text-muted-foreground">
              {cert.courses.courseDescription}
            </p>
          </section>

          <section className="text-sm text-muted-foreground">
            <p>Last updated: {new Date(cert.updatedAt).toLocaleString()}</p>
          </section>

          <section>
            {cert.certAddress && cert.certAddress.length > 0 ? (
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Certificate Address: </span>
                  <Link
                    href={`https://suiscan.xyz/testnet/tx/${cert.certAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all text-purple-400 underline"
                  >
                    {cert.certAddress}
                  </Link>
                </div>
                <div>
                  <span className="font-medium">Status: </span>
                  {cert.revoked === 1 ? (
                    <Badge variant="destructive">Revoked</Badge>
                  ) : (
                    <Badge variant="default" className="bg-green-300">
                      Active
                    </Badge>
                  )}
                </div>
              </div>
            ) : (
              <MintButton
                certId={cert.id}
                imageUrl={cert.courses.courseImageUrl}
                email={user.email}
                studentName={user.fullName}
                issuerName={cert.issuer?.fullName || "Unknown Issuer"}
              />
            )}
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
