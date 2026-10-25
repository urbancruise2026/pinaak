"use client";

import ErrorScreen from "@/components/common/ErrorScreen";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <ErrorScreen
          code="ERROR"
          title="Application error"
          message={error.message}
          digest={error.digest}
          onRetry={reset}
        />
      </body>
    </html>
  );
}