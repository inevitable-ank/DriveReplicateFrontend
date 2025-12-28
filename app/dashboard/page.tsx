"use client"

import { ProtectedRoute } from "@/components/protected-route"
import DrivePage from "@/components/drive/drive-page"

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DrivePage />
    </ProtectedRoute>
  )
}
