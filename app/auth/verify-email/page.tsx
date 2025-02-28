export default function VerifyEmailPage() {
  return (
    <div className="container flex h-[auto] w-[auto] flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Check your email
          </h1>
          <p className="text-sm text-muted-foreground">
            We&apos;ve sent you a verification link. Please check your email to verify your account.
          </p>
        </div>
      </div>
    </div>
  )
} 