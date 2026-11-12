import DashboardLayout from "../components/layout/DashboardLayout";

function Settings() {
  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold text-slate-900">Settings</h1>

      <p className="mt-3 text-slate-500">
        Manage your account and application preferences.
      </p>
    </DashboardLayout>
  );
}

export default Settings;
