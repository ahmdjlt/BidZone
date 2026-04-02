// Dashboard layout - wraps remaining dashboard pages (browse, create-listing, my-bids)
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface-alt">
      <main className="flex-1 overflow-y-auto">
        <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
