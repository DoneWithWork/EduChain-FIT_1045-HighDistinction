"use client";

import { courseSchema } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";

import { X } from "lucide-react";
import {
  useActionState,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";

import { NewCourseAction } from "@/app/actions/newCourse";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { useRouter } from "next/navigation";

const defaultState = {
  success: false,
};
export default function NewCourseForm() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [state, dispatch] = useActionState(NewCourseAction, defaultState);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const form = useForm<z.infer<typeof courseSchema>>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      courseName: "",
      courseDescription: "",
      courseImageUrl: undefined,
      studentEmails: [],
    },
  });

  function onSubmit(data: z.infer<typeof courseSchema>) {
    console.log("Submitted:", data);
    startTransition(async () => {
      dispatch(data);
    });
  }
  useEffect(() => {
    if (state.success) {
      router.push("/dashboard/issuer");
    }
  }, [state, router]);
  function handleReset() {
    // Reset form to default state
    form.reset({
      courseName: "",
      courseDescription: "",
      courseImageUrl: undefined,
      studentEmails: [],
    });

    // Explicitly clear file input (browser limitation)
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <Card className="w-full sm:max-w-xl">
      <CardHeader>
        <CardTitle>New Course</CardTitle>
        <CardDescription>
          Create a new course to issue certificates to your students.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form id="form-rhf-demo" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            {/* Course Title */}
            <Controller
              name="courseName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-demo-title">
                    Course Title
                  </FieldLabel>
                  <Input
                    {...field}
                    id="form-rhf-demo-title"
                    aria-invalid={fieldState.invalid}
                    placeholder="Introduction to Computer Science"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Course Description */}
            <Controller
              name="courseDescription"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-demo-description">
                    Course Description
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupTextarea
                      {...field}
                      id="form-rhf-demo-description"
                      placeholder="A brief description of the course"
                      rows={6}
                      className="min-h-24 resize-none"
                      aria-invalid={fieldState.invalid}
                    />
                    <InputGroupAddon align="block-end">
                      <InputGroupText className="tabular-nums">
                        {field.value.length}/500 characters
                      </InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Certificate Image */}
            <Controller
              name="courseImageUrl"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-demo-image">
                    Certificate Image
                  </FieldLabel>
                  <Input
                    type="file"
                    id="form-rhf-demo-image"
                    aria-invalid={fieldState.invalid}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      field.onChange(file);
                    }}
                    accept="image/*"
                    ref={(el) => {
                      field.ref(el);
                      fileInputRef.current = el;
                    }}
                  />
                  <FieldDescription>
                    Images are uploaded to IPFS via Pinata upon form submission.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Student Emails Field */}
            <Controller
              name="studentEmails"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Student Emails</FieldLabel>
                  <FieldDescription>
                    Add multiple student emails separated by commas or Enter.
                  </FieldDescription>
                  <EmailTokensInput
                    value={field.value}
                    onChange={(emails) => field.onChange(emails)}
                  />
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>

      <CardFooter>
        <Field orientation="horizontal">
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            onClick={handleReset}
          >
            Reset
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="cursor-pointer"
            form="form-rhf-demo"
          >
            {isPending ? "Creating..." : "Create Course"}
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
}
function EmailTokensInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (emails: string[]) => void;
}) {
  const [inputValue, setInputValue] = useState("");

  function addEmail(email: string) {
    const trimmed = email.trim();
    if (!trimmed) return;
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    if (isValid && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addEmail(inputValue);
      setInputValue("");
    } else if (e.key === "Backspace" && inputValue === "") {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-input px-3 py-2 focus-within:ring-2 focus-within:ring-ring">
      {value.map((email) => (
        <Badge
          key={email}
          variant="secondary"
          className="flex items-center gap-1"
        >
          {email}
          <button
            type="button"
            onClick={() => onChange(value.filter((e) => e !== email))}
          >
            <X size={14} className="cursor-pointer" />
          </button>
        </Badge>
      ))}
      <Input
        className="border-none shadow-none focus-visible:ring-0 flex-1 min-w-[120px]"
        placeholder="Add email..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}
