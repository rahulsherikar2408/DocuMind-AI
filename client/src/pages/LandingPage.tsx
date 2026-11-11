import {
  ArrowRight,
  FileText,
  BrainCircuit,
  MessageSquareText,
  ShieldCheck,
  Zap,
  Upload,
  Search,
  Sparkles,
  Menu,
} from "lucide-react";

import { Link } from "react-router-dom";

const features = [
  {
    icon: Upload,
    title: "Easy Document Upload",
    description:
      "Upload your PDF documents and let DocuMind process and understand theri contents.",
  },
  {
    icon: BrainCircuit,
    title: "AI-Powered Understanding",
    description:
      "Ask questions in natural language and receive intelligent answers from your documents.",
  },
  {
    icon: Search,
    title: "Smart Semantic Search",
    description:
      "Find relevant information using meaning-based search instead of simple keyword matching.",
  },
  {
    icon: FileText,
    title: "Source References",
    description:
      "Every answer includes relevant document references and page numbers.",
  },
  {
    icon: MessageSquareText,
    title: "Interactive Conversations",
    description:
      "Continue asking follow-up questions while maintaining your conversation history.",
  },
  {
    icon: ShieldCheck,
    title: "Private Documents",
    description:
      "Access your own documents securely with user-specific authentication and authorization.",
  },
];

function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="rounded-xl bg-indigo-600 p-2 text-white">
              <BrainCircuit size={23} />
            </div>
            <span className="text-xl font-bold tracking-tight">
              DocuMind<span className="text-indigo-600x"> AI</span>
            </span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text text-slate-600 hover:text-indigo-600"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text text-slate-600 hover:text-indigo-600"
            >
              How it works
            </a>
            <a
              href="#about"
              className="text text-slate-600 hover:text-indigo-600"
            >
              About
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="hidden text font font-medium text-slate-700 hover:text-indigo-600 sm:block"
            >
              Sign in
            </Link>

            <Link
              to="/dashboard"
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text font-semibold text-white transition hover:bg-indigo-700"
            >
              Get Started
            </Link>

            <button className="md:hidden" aria-label="Open menu">
              <Menu size={24} />
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-white">
        <div className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-6 py-24 lg:grid-cols-2 lg:py-32">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-4 py-2 text-sm font-medium text-indigo-700 shadow-sm">
              <Sparkles size={16} />
              Your documents, now intelligent
            </div>

            <h1 className="max-w-xl text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
              Your Documents.
              <span className="block text-indigo-600">Your AI Assistant.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Stop searching through endless pages. Upload your documents, ask
              questions, and get instant AI-powered answers with accurate source
              references.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-7 py-4 font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-1 hover:bg-indigo-700"
              >
                Get Started Free
                <ArrowRight size={19} />
              </Link>

              <a
                href="#how-it-works"
                className="rounded-xl border border-slate-200 bg-white px-7 py-4 font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Learn More
              </a>
            </div>

            <div className="mt-8 flex items-center gap-3 text-sm text-slate-500">
              <ShieldCheck size={19} className="text-green-600" />
              Secure document access
            </div>
          </div>

          {/* Product Preview */}
          <div className="relative">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl shadow-indigo-100 sm:p-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-indigo-100 p-2 text-indigo-600">
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="text font-semibold">Project Report.pdf</p>
                    <p className="text-sm text-slate-500">24 pages</p>
                  </div>
                </div>

                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                  Processed
                </span>
              </div>

              <div className="mt-6 space-y-4">
                <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-indigo-600 p-4 text-sm text-white">
                  What are the main objectives of this project?
                </div>

                <div className="max-w-[95%] rounded-2xl rounded-tl-sm bg-slate-100 p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                    <Sparkles size={16} />
                    DocuMind AI
                  </div>

                  <p className="text-sm leading-6 text-slate-700">
                    Based on your document, the main objectives include:
                  </p>

                  <ul className="mt-3 space-y-2 text-sm text-slate-700">
                    <li>• Improve operational efficiency.</li>
                    <li>• Automate manual processes.</li>
                    <li>• Enhance data management.</li>
                  </ul>

                  <div className="mt-4 border-t border-slate-200 pt-3">
                    <p className="text-xs font-semibold text-slate-500">
                      SOURCE REFERENCES
                    </p>
                    <p className="mt-2 text-xs text-indigo-600">
                      Project Report.pdf · Pages 4, 7 and 12
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3">
                <span className="flex-1 text-sm text-slate-400">
                  Ask anything about your document...
                </span>
                <div className="rounded-lg bg-indigo-600 p-2 text-white">
                  <ArrowRight size={17} />
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 -left-6 -z-10 h-32 rounded-full bg-purple-200 blur-2xl" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text font-semibold uppercase tracking-widest text-indigo-600">
            Features
          </span>

          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to understand your documents
          </h2>

          <p className="mt-5 leading-7 text-slate-600">
            A smarter way to interact with your documents using artificial
            intelligence.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-2xl border border-slate-200 p-7 transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/50"
              >
                <div className="inline-flex rounded-xl bg-indigo-50 p-3 text-indigo-600">
                  <Icon size={25} />
                </div>

                <h3 className="mt-5 text-lg font-semibold">{feature.title}</h3>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-slate-50 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <span className="text font-semibold uppercase tracking-widest text-indigo-600">
              Workflow
            </span>

            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
              Three simple steps
            </h2>
          </div>

          <div className="mt-16 grid gap-10 md:grid-cols-3">
            {[
              {
                number: "01",
                title: "Upload Documents",
                description:
                  "Upload your PDF files securely to your personal workspace.",
                icon: Upload,
              },
              {
                number: "02",
                title: "Ask Questions",
                description:
                  "Ask questions naturally and let AI understand your documents.",
                icon: MessageSquareText,
              },
              {
                number: "03",
                title: "Get Answers",
                description:
                  "Receive relevant answers with document page references.",
                icon: Zap,
              },
            ].map((step) => {
              const Icon = step.icon;

              return (
                <div key={step.number} className="text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
                    <Icon size={27} />
                  </div>

                  <p className="mt-6 text-sm font-bold tracking-widest text-indigo-600">
                    STEP {step.number}
                  </p>

                  <h3 className="mt-3 text-xl font-semibold">{step.title}</h3>

                  <p className="mx-auto mt-3 max-w-xs text-sm leading-7 text-slate-600">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="about" className="px-6 py-24">
        <div className="mx-auto max-w-5xl rounded-3xl bg-indigo-600 px-8 py-16 text-center text-white shadow-xl shadow-indigo-200 sm:px-16">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Make your documents work smarter.
          </h2>

          <p className="mx-auto mt-5 max-w-xl leading-7 text-indigo-100">
            Experience a better way to read, search and understand your
            documents with AI.
          </p>

          <Link
            to="/dashboard"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-4 font-semibold text-indigo-700 transition hover:bg-indigo-50"
          >
            Get Started
            <ArrowRight size={19} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <Link to="/" className="font-bold">
            DocuMind<span className="text-indigo-600"> AI</span>
          </Link>

          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} DocuMind AI. All rights reserved.
          </p>

          <p className="text-sm text-slate-500">Powered by AI.</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
