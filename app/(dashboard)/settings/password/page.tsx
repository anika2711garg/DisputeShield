import { requireSession } from "@/lib/auth/session";
import { PageHeader } from "@/components/ui/page-header";
import { PasswordForm } from "@/components/settings/password-form";

export default async function PasswordPage() {
  const user = await requireSession();
  return (
    <div className="space-y-6">
      <PageHeader
        title="Password"
        description={user.mustChangePassword ? "Finish the invite by replacing the temporary password." : "Change the password for this signed-in account."}
      />
      <PasswordForm forced={user.mustChangePassword} />
    </div>
  );
}
