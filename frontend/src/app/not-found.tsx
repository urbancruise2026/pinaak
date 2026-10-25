import ErrorScreen from "@/components/common/ErrorScreen";

export default function NotFound() {
  return (
    <ErrorScreen
      code="404"
      title="Page not found"
      message="The page you are looking for does not exist."
    />
  );
}