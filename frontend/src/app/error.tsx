"use client";

import { useEffect } from "react";
import ErrorScreen from "@/components/common/ErrorScreen";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorScreen
      code="ERROR"
      title="Something went wrong"
      message={error.message}
      digest={error.digest}
      onRetry={reset}
    />
  );
}