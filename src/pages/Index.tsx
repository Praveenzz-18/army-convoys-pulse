import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Truck, Route, Map, Clock, Users, BarChart3, Bell, ChevronRight, Zap, Target, Globe } from 'lucide-react';

const BACKGROUND_IMAGES = [
  '/hero-1.jpg',
  '/hero-2.jpg'
];
const Index = () => {
  const [currentBg, setCurrentBg] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const features = [{
    icon: Route,
    title: 'Convoy Planning',
    description: 'AI-powered route optimization and mission planning'
  }, {
    icon: Map,
    title: 'Real-Time Tracking',
    description: 'Live GPS tracking of all convoy movements'
  }, {
    icon: Truck,
    title: 'Fleet Management',
    description: 'Complete vehicle lifecycle management'
  }, {
    icon: Bell,
    title: 'Smart Alerts',
    description: 'Instant notifications for delays and checkpoints'
  }, {
    icon: BarChart3,
    title: 'Analytics',
    description: 'Comprehensive reports and insights'
  }, {
    icon: Users,
    title: 'Personnel Tracking',
    description: 'Monitor deployed personnel and assignments'
  }];
  return <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Images Slideshow */}
      <div className="absolute inset-0 z-0">
        {BACKGROUND_IMAGES.map((img, index) => (
          <div
            key={img}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentBg ? 'opacity-30' : 'opacity-0'
            }`}
            style={{
              backgroundImage: `url(${img})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        ))}
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px]" />
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 z-[1]">
        <div className="absolute inset-0" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2322c55e' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }} />
      </div>

      {/* Indian Flag Stripe */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />

      {/* Header */}
      <header className="relative z-10 border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              {/* Indian Flag Badge */}
              <div className="absolute -top-1 -right-1 text-xs">🇮🇳</div>
            </div>
            <div>
              <h1 className="font-bold text-lg">Army Logistics Services</h1>
              <p className="text-xs text-muted-foreground">AI-Based Transport & Road Space Management</p>
            </div>
          </div>
          <Link to="/login">
            <Button variant="hero">Login / Register</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          {/* Indian Army Emblem Placeholder */}
          <div className="mb-8 relative inline-block">
            <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20 animate-float">
              <Shield className="w-12 h-12 text-primary" />
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
              <Badge className="bg-secondary text-secondary-foreground">🇮🇳 Indian Army</Badge>
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-slide-up">
            Smart Army Logistics
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-slide-up">
            Intelligent convoy planning and real-time tracking system for the Indian Army. 
            Optimize fleet efficiency, reduce delays, and improve operational readiness.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-10">
            {[{
            value: '24/7',
            label: 'Real-Time Tracking',
            icon: Clock
          }, {
            value: 'AI',
            label: 'Route Optimization',
            icon: Zap
          }, {
            value: '100%',
            label: 'Convoy Coordination',
            icon: Target
          }].map((stat, index) => <Card key={index} className="glass-card animate-fade-in" style={{
            animationDelay: `${index * 0.1}s`
          }}>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>)}
          </div>

          <Link to="/login">
            <Button variant="hero" size="xl" className="gap-2 animate-pulse-glow">
              Get Started <ChevronRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="relative z-10 py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <Card className="glass-card border-primary/20">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="outline" className="bg-secondary/20 text-secondary border-secondary/30">
                  CR(S)2
                </Badge>
                <h2 className="text-2xl font-bold">Problem Statement</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                The Indian Army manages massive daily vehicle movements for troops, equipment, and supplies, 
                yet current planning often results in inefficient fleet use, route conflicts, and convoy delays 
                due to overlapping military and civil traffic.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Comprehensive Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage military logistics operations efficiently
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => <Card key={index} className="glass-card hover:border-primary/40 transition-all duration-300 animate-fade-in cursor-pointer group" style={{
            animationDelay: `${index * 0.1}s`
          }}>
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 px-4 bg-gradient-to-b from-transparent to-muted/30">
        <div className="container mx-auto max-w-2xl text-center">
          <Globe className="w-16 h-16 text-primary mx-auto mb-6 animate-float" />
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Logistics?</h2>
          <p className="text-muted-foreground mb-8">
            Join the next generation of military logistics management. 
            Secure, efficient, and intelligent.
          </p>
          <Link to="/login">
            <Button variant="hero" size="lg">
              Access Command Center
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 py-8 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-primary" />
              <span className="font-semibold">Army Logistics Services</span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              © 2025 Army Logistics Services. All rights reserved. | 
              Developed by <span className="text-primary font-semibold">​techTitans</span>
            </p>
            <div className="flex items-center gap-2 text-2xl">
              🇮🇳
            </div>
          </div>
        </div>
      </footer>
    </div>;
};
export default Index;