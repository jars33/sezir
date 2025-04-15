
import { Spinner } from "@/components/ui/spinner"

export function LoadingIndicator() {
  return (
    <div className="p-4 flex justify-center items-center h-32">
      <Spinner className="h-6 w-6 text-primary" />
      <span className="ml-2">Loading...</span>
    </div>
  )
}
