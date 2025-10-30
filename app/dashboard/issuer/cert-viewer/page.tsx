"use client";
import CertViewer from "@/ui/CertViewer";
import { Suspense } from "react";

export default function CertViewerPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CertViewer />
    </Suspense>
  );
}
