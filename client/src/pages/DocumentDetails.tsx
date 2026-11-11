
import { useParams } from "react-router-dom";

function DocumentDetails() {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <h1 className="text-3xl font-bold">Document Details</h1>
      <p className="mt-3 text-slate-600">
        Document ID: {id}
      </p>
    </div>
  );
}

export default DocumentDetails;
