"use client";

import GetCertViewerAction from "@/app/actions/getCertViewer";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { certificates, courses, users } from "@/db/schema";
import { StarIcon, WorkflowIcon } from "lucide-react";
import Link from "next/link";
import randomColour from "randomcolor";
import {
  useActionState,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";

type CertsWithCourseAndIssuer = typeof certificates.$inferSelect & {
  courses: typeof courses.$inferSelect;
  issuer: typeof users.$inferSelect;
};

function useDebounce<T>(value: T, delay = 600): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function CertViewer() {
  const [state, dispatch] = useActionState(GetCertViewerAction, {
    success: false,
    data: [],
  });
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");

  const debouncedEmail = useDebounce(email, 600);

  useEffect(() => {
    if (debouncedEmail.trim() === "") return;
    startTransition(() => {
      dispatch(debouncedEmail);
    });
  }, [debouncedEmail, dispatch, startTransition]);

  const certs = state.success ? (state.data as CertsWithCourseAndIssuer[]) : [];

  return (
    <div className="space-y-6 px-4 py-8">
      <div className="max-w-md mx-auto">
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter an email address"
          className="border border-blue-300 focus:ring-2 h-12 text-3xl focus:ring-blue-500 transition"
        />
      </div>

      <div className="">
        {isPending ? (
          <p className="text-gray-500 animate-pulse">Loading certificates…</p>
        ) : certs.length === 0 && email.length !== 0 ? (
          <p>No certificates found for this email.</p>
        ) : certs.length === 0 ? (
          <p>Start typing an email to view certificates.</p>
        ) : (
          <TimeLine certs={certs} />
        )}
      </div>
    </div>
  );
}

function TimeLine({ certs }: { certs: CertsWithCourseAndIssuer[] }) {
  const uniqueInstitutions = Array.from(
    new Set(certs.map((c) => c.issuer.institutionName || "Unknown Institution"))
  );

  const institutionColors = useMemo(() => {
    const colors: Record<string, string> = {};
    uniqueInstitutions.forEach((inst) => {
      colors[inst] = randomColour({
        luminosity: "dark",
        hue: "blue",
        seed: inst, // consistent color per institution
      });
    });
    return colors;
  }, [uniqueInstitutions]);

  return (
    <VerticalTimeline>
      {certs.map((cert, index) => {
        return (
          <VerticalTimelineElement
            key={index}
            className="vertical-timeline-element--work"
            contentStyle={{
              background:
                institutionColors[cert.issuer.institutionName!] || "#fff",
              color: "#fff",
            }}
            contentArrowStyle={{
              borderRight: `7px solid ${
                institutionColors[cert.issuer.institutionName!] || "#fff"
              }`,
            }}
            date={new Date(cert.createdAt).toLocaleDateString()}
            iconStyle={{ background: "rgb(33, 150, 243)", color: "#fff" }}
            icon={<WorkflowIcon />}
          >
            <div className="flex flex-row items-center justify-between">
              <h3 className="vertical-timeline-element-title text-xl font-bold">
                {cert.courses.courseName}
              </h3>
              <Badge className="bg-red-500 text-white font-bold text-sm">
                {cert.revoked === 1 ? "Revoked" : "Active"}
              </Badge>
            </div>
            <h4 className="vertical-timeline-element-subtitle">
              Issued by:{" "}
              <span className="font-bold">{cert.issuer.institutionName!}</span>
            </h4>
            <Link
              href={`https://suiscan.xyz/testnet/tx/${cert.certAddress}`}
              className="inline-block mt-3 text-sm underline underline-offset-2 text-blue-200 hover:text-blue-100"
            >
              View on-chain ↗
            </Link>
          </VerticalTimelineElement>
        );
      })}
      <VerticalTimelineElement
        iconStyle={{ background: "rgb(16, 204, 82)", color: "#fff" }}
        icon={<StarIcon />}
      />
    </VerticalTimeline>
  );
}
