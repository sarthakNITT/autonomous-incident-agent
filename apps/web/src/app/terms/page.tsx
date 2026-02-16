import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-muted/30 py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-8">
            Terms of Service
          </h1>

          <div className="prose prose-slate dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                Acceptance of Terms
              </h2>
              <p className="text-muted-foreground">
                By accessing and using Autonomous Incident Agent, you accept and
                agree to be bound by the terms and provision of this agreement.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Use License</h2>
              <p className="text-muted-foreground mb-4">
                Permission is granted to use Autonomous Incident Agent for
                monitoring and resolving incidents in your applications, subject
                to the following restrictions:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>You must not use the service for any unlawful purpose</li>
                <li>
                  You must not attempt to compromise the security of the service
                </li>
                <li>
                  You are responsible for maintaining the confidentiality of
                  your API keys
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                Service Availability
              </h2>
              <p className="text-muted-foreground">
                We strive to maintain high availability but do not guarantee
                uninterrupted access to the service. We reserve the right to
                modify or discontinue the service at any time.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                Limitation of Liability
              </h2>
              <p className="text-muted-foreground">
                The service is provided "as is" without warranties of any kind.
                We shall not be liable for any damages arising from the use or
                inability to use the service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                Modifications to Terms
              </h2>
              <p className="text-muted-foreground">
                We reserve the right to revise these terms at any time.
                Continued use of the service after changes constitutes
                acceptance of the new terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                Contact Information
              </h2>
              <p className="text-muted-foreground">
                For questions about these Terms of Service, please contact us
                through our GitHub repository.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
