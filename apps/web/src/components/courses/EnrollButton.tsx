"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function EnrollButton({
  courseId,
  enrolled,
}: {
  courseId: string;
  enrolled: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function toggle() {
    setLoading(true);
    await fetch(`/api/courses/${courseId}/enroll`, {
      method: enrolled ? "DELETE" : "POST",
    });
    router.refresh();
    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${
        enrolled
          ? "bg-green-500/20 text-green-400 hover:bg-red-500/20 hover:text-red-400"
          : "bg-zinc-700 text-white hover:bg-zinc-600"
      }`}
    >
      {loading ? "…" : enrolled ? "Inscrit ✓" : "S'inscrire"}
    </button>
  );
}
