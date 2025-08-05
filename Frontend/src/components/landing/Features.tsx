import { Brain, GitBranch, MessageSquare, Sparkles, Terminal, Users2 } from "lucide-react";
import weavingPattern from "@/assets/weaving-pattern.jpg";
import aiAssistant from "@/assets/ai-assistant.jpg";

const Features = () => {
  const features = [
    {
      icon: Users2,
      title: "Real-time Collaboration",
      description: "Watch cursors dance across the screen as your team weaves code together in perfect harmony.",
      image: weavingPattern,
      gradient: "gradient-primary"
    },
    {
      icon: Brain,
      title: "AI Master Weaver",
      description: "Our intelligent assistant doesn't just suggest—it understands your patterns and helps you create better code.",
      image: aiAssistant,
      gradient: "gradient-secondary"
    },
    {
      icon: GitBranch,
      title: "Smart Code Weaving",
      description: "Automatically merge different coding styles and approaches into cohesive, maintainable projects.",
      image: weavingPattern,
      gradient: "gradient-primary"
    },
    {
      icon: Terminal,
      title: "Integrated Environment",
      description: "Everything you need in one place—editor, terminal, file explorer, and collaborative tools.",
      image: weavingPattern,
      gradient: "gradient-secondary"
    },
    {
      icon: MessageSquare,
      title: "Contextual Communication",
      description: "Discuss code changes directly inline with smart threading that follows your logic flow.",
      image: aiAssistant,
      gradient: "gradient-primary"
    },
    {
      icon: Sparkles,
      title: "Pattern Recognition",
      description: "Learn from your team's best practices and automatically suggest improvements across projects.",
      image: weavingPattern,
      gradient: "gradient-secondary"
    }
  ];

  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="gradient-text">Features that</span>
            <br />
            <span className="text-foreground">Transform Development</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Every feature is designed to enhance collaboration and creativity, 
            turning individual expertise into collective brilliance.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group relative overflow-hidden rounded-2xl glass-card hover:glow-primary transition-all duration-500"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Background image with overlay */}
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-20 group-hover:opacity-30 transition-opacity duration-500"
                style={{ backgroundImage: `url(${feature.image})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-background/80 to-background/60" />
              
              {/* Content */}
              <div className="relative z-10 p-8">
                <div className={`w-16 h-16 rounded-2xl bg-${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-8 w-8 text-primary-foreground" />
                </div>
                
                <h3 className="text-2xl font-bold mb-4 group-hover:gradient-text transition-all duration-300">
                  {feature.title}
                </h3>
                
                <p className="text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors duration-300">
                  {feature.description}
                </p>

                {/* Weaving animation line */}
                <div className="weave-thread absolute bottom-0 left-0 w-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;