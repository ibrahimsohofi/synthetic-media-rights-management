import {
  Shield,
  FileCheck,
  Database,
  Search,
  BarChart4,
  DollarSign,
  BrainCircuit,
  Fingerprint,
  Copy
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Complete Solution for Creator Rights
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our platform provides all the tools creators need to protect and monetize their digital identity in the age of AI-generated content.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <Card key={feature.title} className="border border-muted bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-violet-100 dark:bg-violet-900/20 flex items-center justify-center text-violet-700 dark:text-violet-300 mb-4">
                  {feature.icon}
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {feature.bulletPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <div className="rounded-full bg-violet-500/10 p-1 mt-0.5">
                        <svg
                          className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      {point}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

const features = [
  {
    icon: <Fingerprint className="h-6 w-6" />,
    title: "Digital Identity Registration",
    description: "Register and protect your unique creative identity with our secure blockchain-based system",
    bulletPoints: [
      "Advanced ML identity fingerprinting",
      "Immutable blockchain registration",
      "Timestamped proof of creation",
      "Multi-factor authentication"
    ]
  },
  {
    icon: <FileCheck className="h-6 w-6" />,
    title: "Smart Licensing Management",
    description: "Create and manage licenses for your digital identity with granular permission controls",
    bulletPoints: [
      "Template and custom license creation",
      "Usage rights management",
      "Smart contract automation",
      "Revocation capabilities"
    ]
  },
  {
    icon: <Search className="h-6 w-6" />,
    title: "AI-Powered Detection",
    description: "Our advanced algorithms identify when your creative identity is used across digital platforms",
    bulletPoints: [
      "Web and social media scanning",
      "Visual similarity detection",
      "Voice pattern recognition",
      "Style and mannerism matching"
    ]
  },
  {
    icon: <DollarSign className="h-6 w-6" />,
    title: "Monetization Tools",
    description: "Multiple revenue streams from licensing your creative identity for various use cases",
    bulletPoints: [
      "Tiered licensing models",
      "Automated royalty collection",
      "Usage-based pricing options",
      "Marketplace integration"
    ]
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Rights Enforcement",
    description: "Automated monitoring and enforcement tools to protect against unauthorized use",
    bulletPoints: [
      "Automated takedown notices",
      "Legal document generation",
      "Case management system",
      "Dispute resolution process"
    ]
  },
  {
    icon: <BrainCircuit className="h-6 w-6" />,
    title: "AI Training Controls",
    description: "Control how AI systems can use your creative work for training and generation",
    bulletPoints: [
      "Opt-in/opt-out for AI training",
      "Watermarking for AI models",
      "Training data verification",
      "Model usage tracking"
    ]
  },
  {
    icon: <Database className="h-6 w-6" />,
    title: "Comprehensive Registry",
    description: "Public and private registries to verify ownership and usage rights",
    bulletPoints: [
      "Global rights database",
      "Public verification portal",
      "API access for platforms",
      "Historical version control"
    ]
  },
  {
    icon: <BarChart4 className="h-6 w-6" />,
    title: "Analytics Dashboard",
    description: "Track usage, violations, and revenue with detailed analytics and reporting",
    bulletPoints: [
      "Real-time usage tracking",
      "Geographic distribution",
      "Revenue analytics",
      "Trend identification"
    ]
  },
  {
    icon: <Copy className="h-6 w-6" />,
    title: "Content Authentication",
    description: "Verify and prove the authenticity of your genuine content",
    bulletPoints: [
      "Digital certificates of authenticity",
      "Verification badges for platforms",
      "Embedded authentication markers",
      "Chain of custody tracking"
    ]
  }
];
