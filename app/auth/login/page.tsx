import { LoginForm } from "@/components/auth/LoginForm"

export default function LoginPage() {
  return (
    <>
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and password to sign in to your account
        </p>
      </div>
      <LoginForm />
    </>
  )
} 