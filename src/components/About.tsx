const About = () => {
  return (
    <section className="py-24 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-8">
          Simple. Clean. Effective.
        </h2>
        
        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-12 max-w-3xl mx-auto">
          We believe in the power of simplicity. Our approach focuses on what matters most, 
          delivering solutions that are both beautiful and functional. No unnecessary complexity, 
          just pure excellence in everything we create.
        </p>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 bg-primary-foreground rounded-full" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Fast</h3>
            <p className="text-muted-foreground">
              Lightning-fast performance that keeps you ahead of the competition.
            </p>
          </div>
          
          <div className="p-6">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 bg-primary-foreground rounded-full" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Reliable</h3>
            <p className="text-muted-foreground">
              Built with precision and tested thoroughly for consistent results.
            </p>
          </div>
          
          <div className="p-6">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 bg-primary-foreground rounded-full" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Secure</h3>
            <p className="text-muted-foreground">
              Your data and privacy are protected with industry-leading security.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;