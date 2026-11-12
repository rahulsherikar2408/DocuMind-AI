import DashboardLayout from "../components/layout/DashboardLayout";

function ChatHistory() {
  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold text-slate-900">Chat History</h1>

      <p className="mt-3 text-slate-500">
        Your previous AI conversations will appear here.
      </p>
    </DashboardLayout>
  );
}

export default ChatHistory;
