export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">You&lsquo;re Offline</h1>
      <p className="text-center mb-4">
        Don&lsquo;t worry! You can still use the app and your changes will sync when you&lsquo;re back online.
      </p>
      <button 
        onClick={() => window.location.reload()} 
        className="bg-primary text-white px-4 py-2 rounded"
      >
        Try Again
      </button>
    </div>
  )
} 