import { Sparkles, Brain, Globe, Award, Rocket } from "lucide-react";
import logo from "../../assets/3546325734eebbae935ba64a28db9c350a382fdd.png";

export function WelcomeScreen() {
  return (
    <div className="flex items-center justify-center h-full overflow-y-auto overflow-x-hidden">
      <div className="max-w-4xl text-center w-full p-3 sm:p-4 lg:p-6 my-auto min-h-0">
        {/* Hero Section */}
        <div className="mb-6 sm:mb-8 lg:mb-10">
          <div className="inline-flex items-center justify-center mb-4 sm:mb-6 relative">
            <img 
              src={logo} 
              alt="Runner Code AI" 
              className="w-20 h-20 sm:w-28 sm:h-28 lg:w-36 lg:h-36 relative z-10 drop-shadow-2xl" 
            />
          </div>
          
          {/* Title & Version Badge */}
          <div className="mb-3 sm:mb-4">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black mb-2 sm:mb-3 px-2 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
              Runner Code AI
            </h1>
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-gradient-to-r from-primary/30 via-primary/20 to-primary/30 border-2 border-primary/40">
              <Award className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
              <span className="text-[10px] sm:text-xs font-black text-primary tracking-wider">2026 EDITION</span>
              <Award className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/20 border border-primary/30 mb-3 sm:mb-4">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
            <span className="text-xs sm:text-sm font-bold text-primary">Universal AI • Elite in Programming</span>
          </div>
          
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground px-3 sm:px-4 max-w-3xl mx-auto leading-relaxed mb-3 sm:mb-4">
            <span className="font-bold text-foreground">Your Complete AI Assistant</span>
            <br />
            <span className="text-xs sm:text-sm mt-2 block text-muted-foreground/80">
              Advanced Intelligence • Multi-Modal Interaction • Professional Solutions
            </span>
          </p>

          {/* Official Website */}
          <a 
            href="https://runner-code.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-card/80 border border-border/50 hover:border-primary/50 hover:bg-card transition-all text-xs sm:text-sm text-muted-foreground hover:text-primary group"
          >
            <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:text-primary transition-colors" />
            <span className="font-medium">runner-code.com</span>
          </a>
        </div>

        {/* AI Technology */}
        <div className="mb-6 sm:mb-8 px-2 sm:px-3">
          <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-primary/10 border-2 border-primary/30">
            <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
              <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              <h3 className="text-base sm:text-lg font-black text-foreground text-center">
                Runner Code AI Model
              </h3>
              <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            
            <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-3">
              {["Neural Architecture", "Multi-Modal Processing", "Context Intelligence", "Real-Time Learning"].map((tech, idx) => (
                <span key={idx} className="px-2 sm:px-2.5 py-1 rounded-lg bg-card border border-primary/20 text-[9px] sm:text-[10px] font-bold text-primary">
                  {tech}
                </span>
              ))}
            </div>
            
            <p className="text-[10px] sm:text-xs text-muted-foreground text-center leading-relaxed">
              Advanced AI for everything • Exceptionally powerful in programming
            </p>
          </div>
        </div>

        {/* Use Cases */}
        <div className="px-2 sm:px-3">
          <h3 className="text-sm sm:text-base font-bold text-foreground mb-2.5 sm:mb-3">✨ What Can I Help With?</h3>
          <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center max-w-3xl mx-auto">
            {[
              "Programming & Development",
              "Content Writing & Editing",
              "Data Analysis & Research",
              "Problem Solving & Strategy",
              "Learning & Tutoring",
              "Creative Ideas & Brainstorming",
              "Code Review & Debugging",
              "Documentation & Planning"
            ].map((query, idx) => (
              <div 
                key={idx}
                className="px-2 sm:px-2.5 lg:px-3 py-1 sm:py-1.5 rounded-lg bg-card/80 border border-border/50 text-[9px] sm:text-[10px] lg:text-xs text-muted-foreground font-medium"
              >
                {query}
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-5 sm:mt-6 lg:mt-8 mb-3 sm:mb-4 px-2 sm:px-3">
          <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border-2 border-primary/30 shadow-lg">
            <div className="flex items-center justify-center gap-2 mb-2 sm:mb-3">
              <Rocket className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <p className="text-sm sm:text-base lg:text-lg text-foreground font-black">
                Ready to Start?
              </p>
              <Rocket className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <p className="text-[10px] sm:text-xs text-primary font-semibold text-center">
              ↓ Type your message below ↓
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 sm:mt-6 mb-3 sm:mb-4 px-2 sm:px-3 text-center border-t border-border/30 pt-3 sm:pt-4">
          <p className="text-[9px] sm:text-[10px] text-muted-foreground/60">
            © 2026 Runner Code AI • All Rights Reserved
          </p>
        </div>
      </div>
    </div>
  );
}