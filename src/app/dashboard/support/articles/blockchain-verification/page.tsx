import type { Metadata } from "next";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { SupportArticle } from "@/components/support/support-article";

export const metadata: Metadata = {
  title: "Blockchain Verification Guide | SyntheticRights",
  description: "Learn how our blockchain verification system secures and proves ownership of your synthetic media",
};

export default function BlockchainVerificationArticlePage() {
  return (
    <DashboardLayout>
      <SupportArticle
        title="Understanding Blockchain Verification for Synthetic Media"
        category="Technical Guide"
        tags={["Blockchain", "Verification", "Registration", "Security"]}
        lastUpdated="April 15, 2025"
        breadcrumbs={[
          { title: "Documentation", path: "/dashboard/support/documentation" },
          { title: "Technical Guides", path: "/dashboard/support/documentation/technical" },
          { title: "Blockchain Verification", path: "/dashboard/support/articles/blockchain-verification" }
        ]}
        relatedArticles={[
          {
            id: "rights-registration",
            title: "How to Register Your Synthetic Media Rights",
            path: "/dashboard/support/articles/rights-registration"
          },
          {
            id: "cert-verification",
            title: "Verifying Certificate Authenticity",
            path: "/dashboard/support/articles/certificate-verification"
          },
          {
            id: "metadata-hash",
            title: "Understanding Metadata Hash Generation",
            path: "/dashboard/support/articles/metadata-hash"
          }
        ]}
        nextArticle={{
          title: "Providing Proof of Ownership in Disputes",
          path: "/dashboard/support/articles/ownership-proof"
        }}
        prevArticle={{
          title: "Rights Registration Process Explained",
          path: "/dashboard/support/articles/registration-process"
        }}
        content={
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mt-2 text-violet-700">Introduction to Blockchain Verification</h2>
            <p>
              Blockchain verification is the cornerstone of our rights management system for synthetic media.
              This technology provides an immutable, timestamped record of your media's creation and ownership
              that can be independently verified without relying solely on our platform.
            </p>

            <h3 className="text-lg font-semibold mt-6 text-violet-600">How Blockchain Verification Works</h3>
            <p>
              When you register your synthetic media with SyntheticRights, our system performs the following steps:
            </p>
            <ol className="list-decimal pl-6 space-y-3 my-4">
              <li><strong>Media Fingerprinting:</strong> We create a unique digital fingerprint of your media by analyzing its content, style characteristics, and metadata.</li>
              <li><strong>Hash Generation:</strong> This fingerprint is transformed into a cryptographic hash - a fixed-length string that uniquely identifies your content.</li>
              <li><strong>Blockchain Registration:</strong> The hash is recorded on our distributed blockchain network along with ownership information and a timestamp.</li>
              <li><strong>Certificate Generation:</strong> A verification certificate is created that includes all relevant details and blockchain transaction information.</li>
            </ol>

            <div className="bg-violet-50 border border-violet-100 rounded-md p-4 my-6">
              <h4 className="text-sm font-semibold text-violet-700 mb-2">Important Security Note</h4>
              <p className="text-sm text-violet-800">
                We never store your actual media files on the blockchain - only the cryptographic hash. This ensures your content remains private while still providing verifiable proof of ownership.
              </p>
            </div>

            <h3 className="text-lg font-semibold mt-6 text-violet-600">Blockchain Network Architecture</h3>
            <p>
              SyntheticRights uses a hybrid blockchain approach that combines the benefits of both public and private blockchain technologies:
            </p>
            <ul className="list-disc pl-6 space-y-3 my-4">
              <li><strong>Public Layer:</strong> We utilize Ethereum for public verification, providing transparency and public trust.</li>
              <li><strong>Private Layer:</strong> Our proprietary sidechain handles high-volume transactions efficiently at lower cost.</li>
              <li><strong>Cross-Chain Verification:</strong> Regular anchoring of our sidechain to Ethereum ensures security while maintaining privacy.</li>
            </ul>

            <h3 className="text-lg font-semibold mt-6 text-violet-600">Verification Process</h3>
            <p>
              To verify a piece of synthetic media:
            </p>
            <ol className="list-decimal pl-6 space-y-3 my-4">
              <li>Access the verification section from your dashboard or use our public verification tool.</li>
              <li>Upload the media file or provide its hash if you're verifying without revealing the content.</li>
              <li>Our system will compute the fingerprint and check it against blockchain records.</li>
              <li>The verification results will show ownership information, registration date, and blockchain transaction details.</li>
            </ol>

            <div className="bg-muted/50 border rounded-md p-4 my-6">
              <h4 className="text-sm font-semibold mb-2">Technical Specifications</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Hash Algorithm:</p>
                  <p className="text-muted-foreground">SHA-256</p>
                </div>
                <div>
                  <p className="font-medium">Blockchain Protocol:</p>
                  <p className="text-muted-foreground">Ethereum + Proprietary Sidechain</p>
                </div>
                <div>
                  <p className="font-medium">Smart Contract:</p>
                  <p className="text-muted-foreground">ERC-721 Compatible</p>
                </div>
                <div>
                  <p className="font-medium">Verification Time:</p>
                  <p className="text-muted-foreground">1-3 minutes average</p>
                </div>
              </div>
            </div>

            <h3 className="text-lg font-semibold mt-6 text-violet-600">Benefits of Blockchain Verification</h3>
            <ul className="list-disc pl-6 space-y-3 my-4">
              <li><strong>Immutable Records:</strong> Once registered, the timestamp and ownership information cannot be altered.</li>
              <li><strong>Independent Verification:</strong> Proof exists outside our platform and can be verified by third parties.</li>
              <li><strong>Tamper-Proof:</strong> The cryptographic nature of blockchain makes it virtually impossible to forge registrations.</li>
              <li><strong>Legal Standing:</strong> Blockchain records are increasingly recognized in legal contexts as evidence of ownership.</li>
              <li><strong>Automated Verification:</strong> Our detection system can automatically verify ownership claims against blockchain records.</li>
            </ul>

            <h3 className="text-lg font-semibold mt-6 text-violet-600">Certificate Formats</h3>
            <p>
              SyntheticRights provides verification certificates in multiple formats:
            </p>
            <ul className="list-disc pl-6 space-y-3 my-4">
              <li><strong>Digital Certificate:</strong> An interactive web-based certificate with live verification capabilities.</li>
              <li><strong>PDF Document:</strong> A downloadable certificate for offline storage and sharing.</li>
              <li><strong>JSON Data:</strong> Machine-readable format for integration with other systems.</li>
              <li><strong>Blockchain Explorer Link:</strong> Direct link to the transaction on blockchain explorers.</li>
            </ul>

            <h3 className="text-lg font-semibold mt-6 text-violet-600">Frequently Asked Questions</h3>

            <div className="space-y-4 mt-4">
              <div>
                <h4 className="font-medium">What happens if I update my media after registration?</h4>
                <p className="text-muted-foreground mt-1">
                  Any change to your media will result in a different hash. We recommend registering each version separately or using our version tracking system that maintains relationships between different versions of the same work.
                </p>
              </div>

              <div>
                <h4 className="font-medium">Can I transfer ownership of my registered media?</h4>
                <p className="text-muted-foreground mt-1">
                  Yes, ownership transfers are recorded on the blockchain with a new transaction that references the original registration, creating a verifiable chain of ownership.
                </p>
              </div>

              <div>
                <h4 className="font-medium">How secure is the blockchain verification?</h4>
                <p className="text-muted-foreground mt-1">
                  Extremely secure. The distributed nature of blockchain, combined with advanced cryptography, makes it practically impossible to forge or tamper with records once they're established.
                </p>
              </div>

              <div>
                <h4 className="font-medium">What if someone registers my content before I do?</h4>
                <p className="text-muted-foreground mt-1">
                  Early registration is important, but our dispute resolution process also considers external evidence of creation and ownership. We can flag fraudulent registrations and resolve ownership conflicts.
                </p>
              </div>
            </div>

            <div className="bg-green-50 border border-green-100 rounded-md p-4 my-6">
              <h4 className="text-sm font-semibold text-green-700 mb-2">Pro Tip</h4>
              <p className="text-sm text-green-800">
                Register your work as early as possible in your creative process. Even works-in-progress can be registered to establish an early timestamp for your creative concept.
              </p>
            </div>
          </div>
        }
      />
    </DashboardLayout>
  );
}
