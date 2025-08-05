import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-24 px-6 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="weave-thread absolute top-1/4 left-0 w-full h-1" />
        <div className="weave-thread absolute bottom-1/4 right-0 w-full h-1" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="glass-card p-12 hover:glow-primary transition-all duration-500 animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-gradient-primary flex items-center justify-center animate-pulse-glow">
            <Sparkles className="h-10 w-10 text-primary-foreground" />
          </div>

          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="gradient-text">Ready to Start</span>
            <br />
            <span className="text-foreground">Weaving Magic?</span>
          </h2>

          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Join thousands of developers who are already creating extraordinary 
            projects with CodeWeave. Experience the future of collaborative coding today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button variant="neon" size="xl" className="animate-pulse-glow" onClick={() => window.location.href = '/editor'}>
              Start Your Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button variant="glass" size="xl">
              Schedule Demo
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-6">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTA;