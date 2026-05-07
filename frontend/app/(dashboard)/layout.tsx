import RequireAuth from "@/components/auth/RequireAuth";

// Dashboard layout - wraps remaining dashboard pages (browse, create-listing, my-bids)
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth>
      <div className="min-h-screen bg-surface-alt">
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1440px] px-6 py-10 sm:px-10">
            {children}
          </div>
        </main>
      </div>
    </RequireAuth>
  );
}
