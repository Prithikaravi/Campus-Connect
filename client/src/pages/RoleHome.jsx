import { useAuth } from "../context/AuthContext";
import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";

// Placeholder page for Faculty (/faculty), Club (/club) and Admin (/admin) dashboards.
// Teammates can replace this later with the real dashboards.
export default function RoleHome({ title, message }) {
  const { user } = useAuth();
  return (
    <div>
      <PageHeader title={title} subtitle={`Signed in as ${user?.name || user?.email}`} />
      <EmptyState icon="shield" title={`${title} coming soon`} message={message} />
    </div>
  );
}