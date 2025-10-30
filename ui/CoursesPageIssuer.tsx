"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { use } from "react";

type Course = {
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  courseName: string;
  courseDescription: string;
  issuerId: number;
  courseImageUrl: string;
  studentEmails: string;
};

export default function IssuerCoursePage({
  courses,
}: {
  courses: Promise<Course[]>;
}) {
  const allCourses = use(courses);
  return (
    <div className="grid gap-8 sm:grid-cols-1 lg:grid-cols-3">
      {allCourses.map((course) => (
        <motion.div
          key={course.id}
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <Link
            href={`/dashboard/issuer/courses/${course.id}`}
            className="group relative block rounded-2xl overflow-hidden border border-white/10 bg-linear-to-br from-[#16161a] max-h-80 max-w-[400px] h-full w-full to-[#1e1e27] hover:border-cyan-400/40 transition-all duration-300"
          >
            <div className="relative overflow-hidden">
              <Image
                src={course.courseImageUrl}
                alt={course.courseName}
                width={400}
                height={200}
                className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>

            <div className="p-5 space-y-2">
              <p className="font-semibold text-xl tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                {course.courseName}
              </p>
              <p className="text-sm text-gray-400">
                {new Date(course.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div
              className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition duration-500"
              style={{
                boxShadow:
                  "inset 0 0 30px rgba(56,189,248,0.1), 0 0 20px rgba(56,189,248,0.2)",
              }}
            />
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
