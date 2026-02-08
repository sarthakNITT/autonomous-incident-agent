export default function SignUpPage() {
  const hasClerkKeys =
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes("your_");

  if (!hasClerkKeys) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">
            Sign Up Unavailable
          </h1>
          <p className="mt-2 text-muted-foreground">
            Clerk authentication is not configured.
          </p>
        </div>
      </div>
    );
  }

  const { SignUp } = require("@clerk/nextjs");

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <SignUp />
    </div>
  );
}
