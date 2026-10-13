export const metadata = { title: 'Admin' };

export default function AdminPage() {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-[22px] font-semibold tracking-tight">
        Admin console
      </h1>
      <p className="text-muted-foreground">
        You have admin access. Admin tools will appear here as modules are
        built.
      </p>
    </div>
  );
}
