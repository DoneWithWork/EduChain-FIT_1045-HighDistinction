"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { CompleteOnboardingAction } from "@/app/actions/onboarding";
import { onboardingSchema } from "@/lib/validation";

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
import { Switch } from "@/components/ui/switch";
import { useActionState } from "react";

export default function NewOnboardingForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [token, setToken] = useState("");

  const [formState, submitForm] = useActionState(CompleteOnboardingAction, {
    error: "",
    success: false,
    role: "",
  });

  const form = useForm<z.infer<typeof onboardingSchema>>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      fullName: "",
      isIssuer: false,
      institutionName: "",
      domain: "",
      verified: false,
    },
    mode: "onChange",
  });

  useEffect(() => {
    setToken("educhain=123");
  }, []);

  // ---------------------
  // Domain Verification
  // ---------------------
  async function handleVerifyDomain() {
    const domain = form.getValues("domain")?.trim();

    if (!domain) return toast.error("Please enter a valid domain.");

    try {
      new URL(`https://${domain}`);
    } catch {
      return toast.error("Please enter a valid domain.");
    }

    const domainRegex = /^(?!-)[A-Za-z0-9-]+(\.[A-Za-z]{2,})+$/;
    if (!domainRegex.test(domain)) {
      return toast.error("Please enter a valid domain (e.g. example.com).");
    }

    setIsVerifying(true);
    try {
      const res = await fetch("/api/dns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(domain),
      });

      const data = await res.json();
      if (!data.verified) {
        setIsVerified(false);
        form.setValue("verified", false, { shouldValidate: true });
        toast.error("Verification failed. Please check your TXT record.");
      } else {
        setIsVerified(true);
        form.setValue("verified", true, { shouldValidate: true });
        toast.success("Domain verified successfully!");
      }
    } finally {
      setIsVerifying(false);
    }
  }

  // ---------------------
  // Form Submission
  // ---------------------
  function onSubmit(data: z.infer<typeof onboardingSchema>) {
    startTransition(() => {
      submitForm(data);
    });
  }
  useEffect(() => {
    if (formState.success) {
      toast.success("User onboarding successful!");
      router.push(`/dashboard/${formState.role}`);
    }
    if (formState.error) {
      toast.error(
        typeof formState.error === "string"
          ? formState.error
          : "User onboarding failed."
      );
    }
  }, [formState, router]);

  // ---------------------
  // Render
  // ---------------------
  return (
    <Card className="w-full sm:max-w-xl">
      <CardHeader>
        <CardTitle>Onboard to EduChain</CardTitle>
        <CardDescription>
          Set up your profile and optionally register as an issuer institution.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form id="onboarding-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            {/* Full Name */}
            <Controller
              name="fullName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Full Name</FieldLabel>
                  <Input {...field} placeholder="Jane Doe" autoComplete="off" />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Issuer Toggle */}
            <Controller
              name="isIssuer"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <div className="flex items-center justify-between">
                    <FieldLabel>Want to be an Issuer?</FieldLabel>
                    <Switch
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        if (!checked) {
                          form.setValue("institutionName", "");
                          form.setValue("domain", "");
                          form.setValue("verified", false);
                          setIsVerified(false);
                        }
                      }}
                    />
                  </div>
                  <FieldDescription>
                    Issuers can create and distribute blockchain-verified
                    certificates.
                  </FieldDescription>
                </Field>
              )}
            />

            {/* Issuer Fields */}
            {form.watch("isIssuer") && (
              <>
                {/* Institution Name */}
                <Controller
                  name="institutionName"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Institution Name</FieldLabel>
                      <Input
                        {...field}
                        placeholder="Monash University Malaysia"
                        autoComplete="off"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                {/* Verification Token */}
                <Field>
                  <FieldLabel>Verification Token</FieldLabel>
                  <FieldDescription>
                    Add this token as a TXT record in your domain DNS.
                  </FieldDescription>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="font-mono text-xs break-all px-3 py-1"
                    >
                      {token}
                    </Badge>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        navigator.clipboard.writeText(token);
                        toast("Token copied to clipboard!");
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </Field>

                {/* Domain + Verify */}
                <Controller
                  name="domain"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Domain</FieldLabel>
                      <div className="flex items-center gap-2">
                        <Input
                          {...field}
                          placeholder="example.edu"
                          autoComplete="off"
                        />
                        <Button
                          type="button"
                          onClick={handleVerifyDomain}
                          disabled={isVerifying || !field.value || isVerified}
                        >
                          {isVerifying
                            ? "Verifying..."
                            : isVerified
                            ? "Verified ✓"
                            : "Verify"}
                        </Button>
                      </div>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </>
            )}
          </FieldGroup>
        </form>
      </CardContent>

      <CardFooter>
        <Field orientation="horizontal">
          <Button
            type="submit"
            form="onboarding-form"
            disabled={isPending || !form.formState.isValid}
          >
            Complete Onboarding
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
}
