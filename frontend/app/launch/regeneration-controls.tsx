"use client"

import { RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface RegenerationControlsProps {
  onRegenerateDetails: () => Promise<void>
  onRegenerateImage: () => Promise<void>
  isRegeneratingDetails: boolean
  isRegeneratingImage: boolean
}

export function RegenerationControls({
  onRegenerateDetails,
  onRegenerateImage,
  isRegeneratingDetails,
  isRegeneratingImage,
}: RegenerationControlsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <Button variant="outline" className="flex-1" onClick={onRegenerateDetails} disabled={isRegeneratingDetails}>
        {isRegeneratingDetails ? (
          <div className="flex items-center gap-2">
            <RefreshCcw className="h-4 w-4 animate-spin" />
            Regenerating Details...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <RefreshCcw className="h-4 w-4" />
            Regenerate Token Details
          </div>
        )}
      </Button>
      <Button variant="outline" className="flex-1" onClick={onRegenerateImage} disabled={isRegeneratingImage}>
        {isRegeneratingImage ? (
          <div className="flex items-center gap-2">
            <RefreshCcw className="h-4 w-4 animate-spin" />
            Regenerating Image...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <RefreshCcw className="h-4 w-4" />
            Regenerate Token Image
          </div>
        )}
      </Button>
    </div>
  )
}

