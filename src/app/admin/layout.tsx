import AdminNavbar from "@/components/admin/AdminNavbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-900">
      <AdminNavbar />
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
}
