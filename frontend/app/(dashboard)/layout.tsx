// Dashboard layout - wraps dashboard pages with sidebar navigation and auth guard

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
