import React from "react";
import { Check, Sparkles, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata = {
  title: "Pricing",
  description:
    "LoopNode pricing — start with a 14-day free trial, then choose a plan that fits your sites and scan frequency.",
};

export default function PricingPage() {
  const plans = [
    {
      name: "Starter",
      price: "$19",
      period: "per month",
      description: "For freelancers and solo developers monitoring a handful of sites.",
      features: [
        "Up to 3 websites",
        "Manual audits on demand",
        "Performance, accessibility, SEO & security",
        "Broken link checker (internal)",
        "30-day scan history",
        "Email support",
      ],
      cta: "Start free trial",
      href: "/register",
      popular: false,
    },
    {
      name: "Pro",
      price: "$49",
      period: "per month",
      description: "For growing businesses that need automated monitoring and deeper crawls.",
      features: [
        "Up to 15 websites",
        "Daily automated scans",
        "Full Lighthouse & axe-core audits",
        "Internal + external link crawls",
        "CSP grading & live header checks",
        "90-day score trends",
        "Priority email support",
      ],
      cta: "Start free trial",
      href: "/register",
      popular: true,
    },
    {
      name: "Agency",
      price: "$129",
      period: "per month",
      description: "For agencies and teams managing many client domains.",
      features: [
        "Up to 50 websites",
        "Hourly automated scans",
        "Unlimited broken link crawl depth",
        "All Pro audit features",
        "1-year historical data",
        "Dedicated onboarding",
        "Priority support",
      ],
      cta: "Contact sales",
      href: "/contact",
      popular: false,
    },
  ];

  const faqs = [
    {
      question: "Is there a free trial?",
      answer:
        "Yes. Every new account gets a 14-day free trial with full access to Pro features. No credit card required to start.",
    },
    {
      question: "How long does a scan take?",
      answer:
        "A standard audit completes in 30–90 seconds depending on page complexity. Broken link crawls vary with site size — you can watch progress live and halt anytime.",
    },
    {
      question: "Can I change or cancel my plan?",
      answer:
        "Upgrade, downgrade, or cancel anytime from your account settings. Billing is monthly with no long-term contracts.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept major credit and debit cards. Enterprise invoicing is available on the Agency plan — contact us for details.",
    },
  ];

  return (
    <div className="flex-1 w-full max-w-[88rem] mx-auto px-6 sm:px-8 lg:px-12 py-12 md:py-24">
      <div className="text-center max-w-3xl mx-auto mb-6 space-y-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
          Simple, honest pricing
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed max-w-xl mx-auto">
          LoopNode is a paid product built for teams who take site health seriously. Try everything free for 14 days, then pick the plan that fits.
        </p>
      </div>

      <p className="text-center text-sm text-primary font-medium mb-14">
        14-day free trial · Full Pro access · No credit card required
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-24 max-w-6xl mx-auto">
        {plans.map((plan, idx) => (
          <Card
            key={idx}
            className={`relative flex flex-col h-full rounded-3xl ${
              plan.popular
                ? "border-primary shadow-xl shadow-primary/10 ring-1 ring-primary"
                : "border-border/40"
            }`}
          >
            {plan.popular && (
              <Badge className="absolute -top-3.5 left-1/2 -translate-x-1/2 uppercase tracking-wider shadow-md">
                <Sparkles className="w-3 h-3" />
                Most popular
              </Badge>
            )}

            <CardHeader className="space-y-6 flex-1">
              <div>
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <CardDescription className="mt-2 leading-relaxed min-h-12">
                  {plan.description}
                </CardDescription>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-foreground">{plan.price}</span>
                <span className="text-sm text-muted-foreground">/ {plan.period}</span>
              </div>

              <Separator />
              <ul className="space-y-3">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </CardHeader>

            <CardFooter className="border-t-0 bg-transparent pt-0 pb-8">
              <ButtonLink
                href={plan.href}
                variant={plan.popular ? "default" : "secondary"}
                size="lg"
                className={`w-full ${plan.popular ? "shadow-lg shadow-primary/10" : ""}`}
              >
                {plan.cta}
              </ButtonLink>
            </CardFooter>
          </Card>
        ))}
      </div>

      <section className="max-w-3xl mx-auto border-t border-border/20 pt-16">
        <div className="text-center mb-12 space-y-2">
          <HelpCircle className="w-8 h-8 text-primary mx-auto mb-2" />
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Frequently asked questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <Card key={idx} className="border-border/30">
              <CardHeader>
                <CardTitle className="text-base">{faq.question}</CardTitle>
                <CardDescription className="leading-relaxed">{faq.answer}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
