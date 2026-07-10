"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CircleAlert, CheckCircle2, Database, Shield, User, Sparkles, Loader2 } from "lucide-react";

import { trpc } from "@/components/providers/app-providers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Stepper,
  StepperContent,
  StepperIndicator,
  StepperItem,
  StepperList,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/ui/stepper";

type StepId = "database" | "admin" | "seed" | "finalize";

interface StepDef {
  id: StepId;
  label: string;
  icon: typeof Database;
}

const ALL_STEPS: StepDef[] = [
  { id: "database", label: "Database", icon: Database },
  { id: "admin", label: "Admin", icon: User },
  { id: "seed", label: "Permissions", icon: Shield },
  { id: "finalize", label: "Complete", icon: CheckCircle2 },
];

export function InitWizardClient() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [adminUserId, setAdminUserId] = useState<string | null>(null);

  const { data: status, isLoading: statusLoading } = trpc.init.status.useQuery();

  const steps = useMemo(() => {
    if (!status) return ALL_STEPS;
    return ALL_STEPS.filter((s) => {
      if (s.id === "database" && status.tables_exist) return false;
      if (s.id === "admin" && status.has_admin) return false;
      if (s.id === "seed" && status.has_roles) return false;
      return true;
    });
  }, [status]);

  const initialStep = steps[0]?.id ?? "finalize";

  const [step, setStep] = useState<StepId>(initialStep);

  useEffect(() => {
    if (status?.initialized) {
      router.replace("/console");
    }
  }, [status?.initialized, router]);

  const runMigrations = trpc.init.runMigrations.useMutation({
    onSuccess: () => {
      setError(null);
      advance("database");
    },
    onError: (e) => setError(e.message),
  });

  const createAdmin = trpc.init.createAdmin.useMutation({
    onSuccess: (data) => {
      setAdminUserId(data.user_id);
      setError(null);
      advance("admin");
    },
    onError: (e) => setError(e.message),
  });

  const seedRbac = trpc.init.seedRbac.useMutation({
    onSuccess: () => {
      setError(null);
      advance("seed");
    },
    onError: (e) => setError(e.message),
  });

  const ensureStatus = trpc.init.ensureStatus.useMutation({});

  const advance = useCallback(
    (from: StepId) => {
      const currentIdx = steps.findIndex((s) => s.id === from);
      const next = steps[currentIdx + 1];
      if (next) {
        setStep(next.id);
      }
    },
    [steps],
  );

  const [adminForm, setAdminForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [adminFormErrors, setAdminFormErrors] = useState<Record<string, string>>({});

  const validateAdminForm = useCallback(() => {
    const errors: Record<string, string> = {};
    if (!adminForm.name || adminForm.name.length < 2)
      errors.name = "Name must be at least 2 characters";
    if (!adminForm.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminForm.email))
      errors.email = "Valid email is required";
    if (!adminForm.password || adminForm.password.length < 8)
      errors.password = "Password must be at least 8 characters";
    if (adminForm.password !== adminForm.confirmPassword)
      errors.confirmPassword = "Passwords do not match";
    setAdminFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [adminForm]);

  const handleSelectStep = useCallback((_value: string) => {}, []);

  const handleRunMigrations = () => {
    setError(null);
    runMigrations.mutate();
  };

  const handleCreateAdmin = () => {
    if (!validateAdminForm()) return;
    setError(null);
    createAdmin.mutate({
      name: adminForm.name,
      email: adminForm.email,
      password: adminForm.password,
    });
  };

  const handleSeedRbac = () => {
    setError(null);
    seedRbac.mutate();
  };

  const handleFinalize = async () => {
    setError(null);

    try {
      await ensureStatus.mutateAsync({ admin_user_id: adminUserId ?? undefined });
      router.push("/console");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to finalize");
    }
  };

  useEffect(() => {
    if (!status || status.initialized) return;
    if (steps.length === 0 || (status.tables_exist && status.has_admin && status.has_roles)) {
      (async () => {
        try {
          await ensureStatus.mutateAsync({});
        } catch {
          // proceed to console anyway
        }
        router.replace("/console");
      })();
    }
  }, [steps, status, ensureStatus, router]);

  if (statusLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="size-5 animate-spin" />
          <p className="text-muted-foreground text-sm">Checking system status...</p>
        </div>
      </div>
    );
  }

  if (steps.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="mx-auto max-w-md">
          <CardHeader className="text-center">
            <Loader2 className="mx-auto mb-2 size-12 animate-spin text-green-500" />
            <CardTitle>All Set!</CardTitle>
            <CardDescription>Everything is already configured. Redirecting...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const currentStepIndex = steps.findIndex((s) => s.id === step);
  const isLastStep = currentStepIndex === steps.length - 1;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="mx-auto w-full max-w-2xl">
        <CardHeader className="text-center">
          <Sparkles className="mx-auto mb-2 size-10 text-[#c8d152]" />
          <CardTitle className="text-2xl">System Initialization</CardTitle>
          <CardDescription>
            Set up your platform for the first time. Steps already completed are skipped.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <Stepper value={step} onValueChange={handleSelectStep} orientation="horizontal">
            <StepperList className="justify-center">
              {steps.map((s, i) => (
                <StepperItem key={s.id} value={s.id} completed={currentStepIndex > i}>
                  <StepperTrigger className="flex-col gap-2">
                    <StepperIndicator />
                    <StepperTitle className="text-xs capitalize">{s.label}</StepperTitle>
                  </StepperTrigger>
                  {i < steps.length - 1 && <StepperSeparator />}
                </StepperItem>
              ))}
            </StepperList>

            <StepperContent value="database" className="space-y-4 pt-4">
              <div className="space-y-2 text-center">
                <Database className="text-muted-foreground mx-auto size-8" />
                <h3 className="text-lg font-medium">Database Setup</h3>
                <p className="text-muted-foreground text-sm">
                  Run database migrations to create all required tables.
                </p>
              </div>

              {runMigrations.isPending ? (
                <div className="space-y-3">
                  <Progress value={65} className="h-2" />
                  <p className="text-muted-foreground animate-pulse text-center text-sm">
                    Running migrations...
                  </p>
                </div>
              ) : (
                <Button onClick={handleRunMigrations} className="w-full">
                  Run Migrations
                </Button>
              )}

              {runMigrations.isSuccess && (
                <Alert
                  variant="default"
                  className="border-green-500 bg-green-50 dark:bg-green-950/20"
                >
                  <CheckCircle2 className="size-4 text-green-600" />
                  <AlertTitle>Migrations Complete</AlertTitle>
                  <AlertDescription>
                    All database tables have been created successfully.
                  </AlertDescription>
                </Alert>
              )}
            </StepperContent>

            <StepperContent value="admin" className="space-y-4 pt-4">
              <div className="space-y-2 text-center">
                <User className="text-muted-foreground mx-auto size-8" />
                <h3 className="text-lg font-medium">Create Admin Account</h3>
                <p className="text-muted-foreground text-sm">
                  Set up the primary administrator account for the platform.
                </p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Admin Name"
                    value={adminForm.name}
                    onChange={(e) => setAdminForm((f) => ({ ...f, name: e.target.value }))}
                  />
                  {adminFormErrors.name && (
                    <p className="text-destructive text-xs">{adminFormErrors.name}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={adminForm.email}
                    onChange={(e) => setAdminForm((f) => ({ ...f, email: e.target.value }))}
                  />
                  {adminFormErrors.email && (
                    <p className="text-destructive text-xs">{adminFormErrors.email}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="At least 8 characters"
                    value={adminForm.password}
                    onChange={(e) => setAdminForm((f) => ({ ...f, password: e.target.value }))}
                  />
                  {adminFormErrors.password && (
                    <p className="text-destructive text-xs">{adminFormErrors.password}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Repeat password"
                    value={adminForm.confirmPassword}
                    onChange={(e) =>
                      setAdminForm((f) => ({ ...f, confirmPassword: e.target.value }))
                    }
                  />
                  {adminFormErrors.confirmPassword && (
                    <p className="text-destructive text-xs">{adminFormErrors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <Button
                onClick={handleCreateAdmin}
                disabled={createAdmin.isPending}
                className="w-full"
              >
                {createAdmin.isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" /> Creating...
                  </>
                ) : (
                  "Create Admin Account"
                )}
              </Button>
            </StepperContent>

            <StepperContent value="seed" className="space-y-4 pt-4">
              <div className="space-y-2 text-center">
                <Shield className="text-muted-foreground mx-auto size-8" />
                <h3 className="text-lg font-medium">Seed Roles & Permissions</h3>
                <p className="text-muted-foreground text-sm">
                  Configure access control roles and their permissions.
                </p>
              </div>

              {seedRbac.isPending ? (
                <div className="space-y-3">
                  <Progress value={85} className="h-2" />
                  <p className="text-muted-foreground animate-pulse text-center text-sm">
                    Seeding roles and permissions...
                  </p>
                </div>
              ) : (
                <Button onClick={handleSeedRbac} className="w-full">
                  Seed Roles & Permissions
                </Button>
              )}

              {seedRbac.isSuccess && (
                <Alert
                  variant="default"
                  className="border-green-500 bg-green-50 dark:bg-green-950/20"
                >
                  <CheckCircle2 className="size-4 text-green-600" />
                  <AlertTitle>Roles Seeded</AlertTitle>
                  <AlertDescription>
                    All roles and permissions have been configured.
                  </AlertDescription>
                </Alert>
              )}
            </StepperContent>

            <StepperContent value="finalize" className="space-y-4 pt-4">
              <div className="space-y-2 text-center">
                <CheckCircle2 className="mx-auto size-12 text-green-500" />
                <h3 className="text-lg font-medium">Setup Complete!</h3>
                <p className="text-muted-foreground text-sm">
                  Your platform is ready. Click below to save the status and access the admin
                  console.
                </p>
              </div>

              <Button onClick={handleFinalize} disabled={false} className="w-full">
                Complete Setup & Go to Admin Console
              </Button>
            </StepperContent>
          </Stepper>

          {error && (
            <Alert variant="destructive">
              <CircleAlert className="size-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
