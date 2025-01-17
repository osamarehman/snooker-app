import Image from "next/image"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="container p-6 md:p-0 relative min-h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900 h-screen">
          <div className="relative lg:relative h-full w-full">
             {/* <Image
            src="/images/auth-bg.jpg" // You'll need to add this image
            alt="Authentication background"
            fill
            className="object-cover opacity-50"
            priority
          /> */}
            <video 
              autoPlay 
              loop 
              muted 
              playsInline
              className="h-full w-full object-cover opacity-50"
            >
              <source src="https://cdn.prod.website-files.com/66e9f80928808e4ea290d935/66fdc5cc68088f08feab66a2_Snooker%20stock%20video%20%282%29%20%281%29-transcode.webm" type="video/webm" />
              <source src="https://cdn.prod.website-files.com/66e9f80928808e4ea290d935/66fdc5cc68088f08feab66a2_Snooker%20stock%20video%20%282%29%20%281%29-transcode.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
        <div className="relative z-20 flex items-center text-lg font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-6 w-6"
          >
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
          </svg>
          Snooker Club Management
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;Efficiently manage your snooker club with our comprehensive solution.&rdquo;
            </p>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          {children}
        </div>
      </div>
    </div>
  )
} 