import { GoogleSignInButton } from "./google-sign-in-button";

export default function LoginPage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-2xl font-semibold">Cashflow</h1>
      <GoogleSignInButton />
    </main>
  );
}
