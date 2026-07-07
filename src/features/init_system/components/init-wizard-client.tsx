"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CircleAlert, CheckCircle2, Database, Shield, User, Sparkles, Loader2 } from "lucide-react";

import { trpc } from "@/components/providers/app-providers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Stepper, StepperContent, StepperIndicator, StepperItem, StepperList, StepperSeparator, StepperTitle, StepperTrigger } from "@/components/ui/stepper";

const STEPS = ["database", "admin", "seed", "complete"] as const;
type Step = (typeof STEPS)[number];

export function InitWizardClient() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("database");
  const [error, setError] = useState<string | null>(null);
  const [adminUserId, setAdminUserId] = useState<string | null>(null);

  const { data: status, isLoading: statusLoading } = trpc.init.status.useQuery();

  const runMutations = trpc.init.runMigrations.useMutation({
    onSuccess: () => { setStep("admin"); setError(null); },
    onError: (e) => { setError(e.message); },
  });

  const createAdmin = trpc.init.createAdmin.useMutation({
    onSuccess: (data) => { setAdminUserId(data.user_id); setStep("seed"); setError(null); },
    onError: (e) => { setError(e.message); },
  });

  const seedRbac = trpc.init.seedRbac.useMutation({
    onSuccess: () => { setStep("complete"); setError(null); },
    onError: (e) => { setError(e.message); },
  });

  const complete = trpc.init.complete.useMutation({
    onSuccess: () => { setError(null); },
    onError: (e) => { setError(e.message); },
  });

  const [adminForm, setAdminForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [adminFormErrors, setAdminFormErrors] = useState<Record<string, string>>({});

  const validateAdminForm = useCallback(() => {
    const errors: Record<string, string> = {};
    if (!adminForm.name || adminForm.name.length < 2) errors.name = "Name must be at least 2 characters";
    if (!adminForm.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminForm.email)) errors.email = "Valid email is required";
    if (!adminForm.password || adminForm.password.length < 8) errors.password = "Password must be at least 8 characters";
    if (adminForm.password !== adminForm.confirmPassword) errors.confirmPassword = "Passwords do not match";
    setAdminFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [adminForm]);

  const handleSelectStep = useCallback((value: string) => {
    if (value === "database") { setStep("database"); return; }
  }, []);

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

  if (status?.initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="mx-auto max-w-md">
          <CardHeader className="text-center">
            <CheckCircle2 className="mx-auto mb-2 size-12 text-green-500" />
            <CardTitle>System Already Initialized</CardTitle>
            <CardDescription>
              The system has already been set up. You can proceed to the admin console.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => router.push("/console")}>Go to Admin Console</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentStepIndex = STEPS.indexOf(step);

  const handleRunMigrations = () => {
    setError(null);
    runMutations.mutate();
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

  const handleComplete = () => {
    if (!adminUserId) return;
    setError(null);
    complete.mutate({ admin_user_id: adminUserId });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="mx-auto w-full max-w-2xl">
        <CardHeader className="text-center">
          <Sparkles className="mx-auto mb-2 size-10 text-[#c8d152]" />
          <CardTitle className="text-2xl">System Initialization</CardTitle>
          <CardDescription>
            Set up your platform for the first time. This wizard will guide you through
            database setup, admin account creation, and role configuration.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <Stepper value={step} onValueChange={handleSelectStep} orientation="horizontal">
            <StepperList className="justify-center">
              {STEPS.map((s, i) => (
                <StepperItem key={s} value={s} completed={currentStepIndex > i}>
                  <StepperTrigger className="flex-col gap-2">
                    <StepperIndicator />
                    <StepperTitle className="text-xs capitalize">{s}</StepperTitle>
                  </StepperTrigger>
                  {i < STEPS.length - 1 && <StepperSeparator />}
                </StepperItem>
              ))}
            </StepperList>

            <StepperContent value="database" className="space-y-4 pt-4">
              <div className="space-y-2 text-center">
                <Database className="mx-auto size-8 text-muted-foreground" />
                <h3 className="text-lg font-medium">Database Setup</h3>
                <p className="text-muted-foreground text-sm">
                  Run database migrations to create all required tables.
                </p>
              </div>

              {runMutations.isPending ? (
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

              {runMutations.isSuccess && (
                <Alert variant="default" className="border-green-500 bg-green-50 dark:bg-green-950/20">
                  <CheckCircle2 className="size-4 text-green-600" />
                  <AlertTitle>Migrations Complete</AlertTitle>
                  <AlertDescription>All database tables have been created successfully.</AlertDescription>
                </Alert>
              )}
            </StepperContent>

            <StepperContent value="admin" className="space-y-4 pt-4">
              <div className="space-y-2 text-center">
                <User className="mx-auto size-8 text-muted-foreground" />
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
                  {adminFormErrors.name && <p className="text-destructive text-xs">{adminFormErrors.name}</p>}
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
                  {adminFormErrors.email && <p className="text-destructive text-xs">{adminFormErrors.email}</p>}
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
                  {adminFormErrors.password && <p className="text-destructive text-xs">{adminFormErrors.password}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Repeat password"
                    value={adminForm.confirmPassword}
                    onChange={(e) => setAdminForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                  />
                  {adminFormErrors.confirmPassword && <p className="text-destructive text-xs">{adminFormErrors.confirmPassword}</p>}
                </div>
              </div>

              <Button
                onClick={handleCreateAdmin}
                disabled={createAdmin.isPending}
                className="w-full"
              >
                {createAdmin.isPending ? (
                  <><Loader2 className="mr-2 size-4 animate-spin" /> Creating...</>
                ) : (
                  "Create Admin Account"
                )}
              </Button>
            </StepperContent>

            <StepperContent value="seed" className="space-y-4 pt-4">
              <div className="space-y-2 text-center">
                <Shield className="mx-auto size-8 text-muted-foreground" />
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
                <Alert variant="default" className="border-green-500 bg-green-50 dark:bg-green-950/20">
                  <CheckCircle2 className="size-4 text-green-600" />
                  <AlertTitle>Roles Seeded</AlertTitle>
                  <AlertDescription>All roles and permissions have been configured.</AlertDescription>
                </Alert>
              )}
            </StepperContent>

            <StepperContent value="complete" className="space-y-4 pt-4">
              <div className="space-y-2 text-center">
                <CheckCircle2 className="mx-auto size-12 text-green-500" />
                <h3 className="text-lg font-medium">Setup Complete!</h3>
                <p className="text-muted-foreground text-sm">
                  Your platform is ready. Click the button below to finish initialization
                  and access the admin console.
                </p>
              </div>

              <Button
                onClick={handleComplete}
                disabled={complete.isPending}
                className="w-full"
              >
                {complete.isPending ? (
                  <><Loader2 className="mr-2 size-4 animate-spin" /> Finalizing...</>
                ) : (
                  "Complete Setup & Go to Admin"
                )}
              </Button>

              {complete.isSuccess && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/console")}
                >
                  Enter Admin Console
                </Button>
              )}
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
