import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";

export function TestimonialsSection() {
  return (
    <section className="py-24 bg-muted/50">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Trusted by Creators Worldwide
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Hear from creators who have successfully protected and monetized their digital identity with our platform.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="bg-card/60 backdrop-blur-sm border border-border/50 overflow-hidden">
              <CardContent className="pt-6 relative">
                <Quote className="absolute top-4 right-4 h-8 w-8 text-muted-foreground opacity-20" />

                <blockquote className="mb-6 text-muted-foreground italic relative">
                  "{testimonial.quote}"
                </blockquote>

                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-muted">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold leading-tight">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground leading-tight">{testimonial.title}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Featured Case Study */}
        <div className="mt-16 p-8 md:p-12 border border-border/50 rounded-xl bg-card/60 backdrop-blur-sm">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-violet-500 text-white mb-6">
                <span>Featured Creator</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">How a Major Studio Protected Its IP from AI Replication</h3>
              <p className="text-muted-foreground mb-6">
                After discovering unauthorized AI models trained on their proprietary character designs, this major animation studio implemented our comprehensive rights management system to detect and prevent future infringement.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
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
                  <span>Registered 10,000+ character designs in our secure registry</span>
                </div>
                <div className="flex items-start gap-2">
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
                  <span>Detected 150+ unauthorized AI models using their IP</span>
                </div>
                <div className="flex items-start gap-2">
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
                  <span>Implemented automatic takedown process for violating content</span>
                </div>
                <div className="flex items-start gap-2">
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
                  <span>Established licensing program for authorized AI implementations</span>
                </div>
              </div>
            </div>
            <div className="bg-muted rounded-lg h-72 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <p className="font-semibold">Case Study Image</p>
                <p className="text-sm">(Studio name and details under NDA)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const testimonials = [
  {
    name: "Sarah Johnson",
    title: "Digital Artist & Illustrator",
    quote: "After finding my artwork being used to train AI models without permission, SyntheticRights gave me the tools to protect my style. Now I can track and monetize whenever my artistic fingerprint is used."
  },
  {
    name: "Michael Chen",
    title: "Voice Actor",
    quote: "The voice cloning detection is incredible. I've been able to identify unauthorized use of my voice in multiple AI projects and either shut them down or negotiate proper licensing terms."
  },
  {
    name: "Emily Rodriguez",
    title: "Content Creator",
    quote: "The peace of mind knowing my likeness is protected is invaluable. The dashboard makes it easy to see where my image is being used and the licensing system has opened up new revenue streams."
  },
  {
    name: "David Washington",
    title: "Photographer",
    quote: "I was skeptical at first, but the detection technology is impressive. It's caught dozens of AI-generated photos derived from my portfolio, allowing me to take action quickly."
  },
  {
    name: "Priya Patel",
    title: "Game Designer",
    quote: "Our character designs were being replicated by AI systems. Now we not only protect our IP but have created a licensing program for approved AI implementations that generates revenue."
  },
  {
    name: "Thomas Müller",
    title: "Music Producer",
    quote: "The blockchain-based registration gives me confidence that my musical style is verifiably protected. The analytics showing where and how my sound is being used are invaluable."
  }
];
