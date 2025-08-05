import { Button } from "@/components/ui/button";
import { ArrowRight, Code, Users, Zap } from "lucide-react";
import heroCoding from "@/assets/hero-coding.jpg";

const Hero = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with glassmorphic overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroCoding})` }}
      />
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="weave-thread absolute top-1/4 left-0 w-full h-0.5" />
        <div className="weave-thread absolute top-1/2 right-0 w-full h-0.5" style={{ animationDelay: '1s' }} />
        <div className="weave-thread absolute bottom-1/4 left-0 w-full h-0.5" style={{ animationDelay: '2s' }} />
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center max-w-6xl mx-auto px-6">
        <div className="animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="gradient-text">CodeWeave</span>
            <br />
            <span className="text-foreground">Where Code</span>
            <br />
            <span className="gradient-text">Comes to Life</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Experience collaborative coding like never before. Watch as individual contributions 
            seamlessly weave together into extraordinary projects, guided by our AI master weaver.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button variant="neon" size="xl" className="animate-pulse-glow" onClick={() => window.location.href = '/editor'}>
              Start Weaving
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button variant="hero" size="xl">
              Watch Demo
            </Button>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <div className="glass-card text-center group hover:glow-primary transition-all duration-300">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-primary flex items-center justify-center">
                <Code className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Live Collaboration</h3>
              <p className="text-muted-foreground">See every keystroke, every thought, every breakthrough in real-time</p>
            </div>

            <div className="glass-card text-center group hover:glow-secondary transition-all duration-300">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-secondary flex items-center justify-center">
                <Zap className="h-6 w-6 text-secondary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">AI Master Weaver</h3>
              <p className="text-muted-foreground">Your intelligent coding companion that guides and enhances your workflow</p>
            </div>

            <div className="glass-card text-center group hover:glow-primary transition-all duration-300">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-primary flex items-center justify-center">
                <Users className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Seamless Integration</h3>
              <p className="text-muted-foreground">Weave together different coding styles into cohesive, beautiful projects</p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating code snippets */}
      <div className="absolute top-20 left-10 opacity-30 animate-float">
        <div className="code-editor p-2 text-xs">
          <span className="text-primary">const</span>{" "}
          <span className="text-secondary">magic</span> = 
          <span className="text-accent"> () =&gt;</span>
        </div>
      </div>

      <div className="absolute bottom-20 right-10 opacity-30 animate-float" style={{ animationDelay: '1s' }}>
        <div className="code-editor p-2 text-xs">
          <span className="text-accent">weave</span>
          <span className="text-primary">(</span>
          <span className="text-secondary">ideas</span>
          <span className="text-primary">)</span>
        </div>
      </div>
    </div>
  );
};

export default Hero;