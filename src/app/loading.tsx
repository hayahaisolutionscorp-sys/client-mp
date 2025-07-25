export default function Loading() {
    return (
      <div className="flex items-center justify-center h-screen">
        {/* Spinner */}
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
        {/* Loading Text */}
        <span className="ml-4 text-xl font-medium text-gray-700">Loading...</span>
      </div>
    );
  }
  