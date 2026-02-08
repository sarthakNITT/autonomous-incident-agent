export default function DashboardPage() {
  const hasClerkKeys =
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes("your_");

  if (!hasClerkKeys) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">
            Dashboard Unavailable
          </h1>
          <p className="mt-2 text-muted-foreground">
            Clerk authentication is not configured.
          </p>
        </div>
      </div>
    );
  }

  const { SignedIn, UserButton } = require("@clerk/nextjs");

  return (
    <SignedIn>
      <div className="min-h-screen bg-background p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <UserButton />
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-muted-foreground">
              Welcome to the Autonomous Incident Agent dashboard.
            </p>
          </div>
        </div>
      </div>
    </SignedIn>
  );
}
