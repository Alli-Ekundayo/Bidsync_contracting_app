
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Bot, Target, FileText, TrendingUp, CheckCircle, ArrowRight } from "lucide-react";

const Index = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll(".animate-on-scroll");
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  const features = [
    {
      icon: Bot,
      title: "AI-Powered Matching",
      description:
        "Our advanced AI analyzes thousands of opportunities and matches them to your specific capabilities and experience.",
      color: "text-accent",
    },
    {
      icon: Target,
      title: "Smart Opportunity Discovery",
      description:
        "Aggregate opportunities from multiple government sources including SAM.gov, FedBizOpps, and agency-specific platforms.",
      color: "text-green-600",
    },
    {
      icon: FileText,
      title: "Automated Proposal Creation",
      description:
        "Generate winning proposals faster with AI-assisted writing, compliance checking, and template optimization.",
      color: "text-purple-600",
    },
    {
      icon: TrendingUp,
      title: "Market Intelligence",
      description:
        "Get insights on market trends, competitor analysis, and pricing strategies to improve your win rate.",
      color: "text-accent",
    },
  ];

  const stats = [
    { number: "10,000+", label: "Active Opportunities" },
    { number: "500+", label: "Successful Contractors" },
    { number: "85%", label: "Higher Win Rate" },
    { number: "$2.4B", label: "Contract Value Managed" },
  ];

  const benefits = [
    "Save 50% time on proposal preparation",
    "Increase win rate by up to 85%",
    "Access to exclusive government opportunities",
    "AI-powered compliance checking",
    "Real-time market intelligence",
    "Dedicated success manager",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <nav className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-accent" />
              <span className="ml-2 text-xl font-bold text-gray-900">BidSync</span>
            </div>

            <div className="flex items-center space-x-4">
              <Link to="/signin">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/signup">
                <Button className="button-primary">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-on-scroll">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
              Win More Government
              <span className="text-accent block">Contracts with AI</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              BidSync uses artificial intelligence to find, analyze, and help you win government contracting opportunities. Join thousands of successful contractors already using our platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button size="lg" className="text-lg px-8 py-4 button-primary">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>

              <Button size="lg" variant="outline" className="text-lg px-8 py-4">
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 animate-on-scroll">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-accent mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Powered by Advanced AI Technology</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Our platform combines artificial intelligence with deep government contracting expertise to give you a competitive advantage.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="animate-on-scroll hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center mb-4">
                    <div className={`p-3 rounded-lg bg-gray-100`}>
                      <feature.icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <CardTitle className="ml-4 text-xl">{feature.title}</CardTitle>
                  </div>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="animate-on-scroll">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Transform Your Contracting Success</h2>
              <p className="text-lg text-gray-600 mb-8">BidSync isn't just another opportunity aggregator. We provide intelligent insights, automated workflows, and AI-powered assistance to help you win more contracts.</p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="animate-on-scroll">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0">
                <CardHeader>
                  <CardTitle className="text-2xl text-center">Ready to Get Started?</CardTitle>
                  <CardDescription className="text-center text-lg">Join the future of government contracting today</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="space-y-4">
                    <Link to="/signup">
                      <Button size="lg" className="w-full text-lg py-6 button-primary">Start Your Free Trial</Button>
                    </Link>
                    <p className="text-sm text-gray-600">No credit card required • 14-day free trial</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Building2 className="h-8 w-8" />
              <span className="ml-2 text-xl font-bold">BidSync</span>
            </div>
            <p className="text-gray-400">© 2024 BidSync. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

