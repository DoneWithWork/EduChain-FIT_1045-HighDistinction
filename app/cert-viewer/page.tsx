import Header from "@/components/Header";
import CertViewer from "@/ui/CertViewer";
import Skeleton from "react-loading-skeleton";

export default function CertViewerPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-[#07163a] via-[#07224a] to-[#042b57] text-slate-100 antialiased">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <Header />
        <div className="mt-12">
          <h1 className="text-4xl font-extrabold mb-6">Certificate Viewer</h1>
          <p className="text-lg text-slate-300">
            Welcome to the Certificate Viewer. Here you can verify and view your
            on-chain certificates issued through EduChain. Simply enter your
            email address below to search for your certificates.
          </p>
        </div>

        <CertViewer />
      </div>
    </div>
  );
}
