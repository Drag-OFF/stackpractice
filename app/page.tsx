"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import { ShoppingBag, Zap, Heart, Star, ArrowRight, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto max-w-6xl px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold">YourStore</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <Badge className="mb-4" variant="secondary">
                <Zap className="w-3 h-3 mr-1" /> New Launch 2025
              </Badge>
              <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Shop Smarter, Live Better
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
                Experience the future of online shopping with our curated collection of premium products, lightning-fast delivery, and unmatched customer service.
              </p>
              <div className="flex gap-4 flex-wrap justify-center lg:justify-start">
                <Link href="/register">
                  <Button size="lg" className="text-lg px-8 shadow-lg">
                    Start Shopping <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="text-lg px-8">
                    Explore Products
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-8 mt-8 justify-center lg:justify-start">
                <div>
                  <div className="text-3xl font-bold">10K+</div>
                  <div className="text-sm text-muted-foreground">Happy Customers</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">500+</div>
                  <div className="text-sm text-muted-foreground">Products</div>
                </div>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground">4.9/5</span>
                </div>
              </div>
            </div>
            <div className="flex-1 relative">
              <div className="w-full aspect-square bg-gradient-to-br from-primary/20 to-purple-600/20 rounded-3xl flex items-center justify-center backdrop-blur-sm border-2 border-primary/20">
                <ShoppingBag className="w-48 h-48 text-primary/40" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Badge className="mb-4">Why Choose Us</Badge>
            <h2 className="text-4xl font-bold mb-4">Everything You Need</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We've built the ultimate shopping experience with features that matter to you
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Zap className="w-10 h-10" />,
                title: "Lightning Fast",
                description: "Same-day delivery available in major cities"
              },
              {
                icon: <CheckCircle2 className="w-10 h-10" />,
                title: "Quality Guaranteed",
                description: "100% authentic products or money back"
              },
              {
                icon: <Heart className="w-10 h-10" />,
                title: "Made with Love",
                description: "Carefully curated selection just for you"
              },
              {
                icon: <Star className="w-10 h-10" />,
                title: "Premium Support",
                description: "24/7 customer service team ready to help"
              },
              {
                icon: <ShoppingBag className="w-10 h-10" />,
                title: "Easy Returns",
                description: "30-day hassle-free return policy"
              },
              {
                icon: <Zap className="w-10 h-10" />,
                title: "Secure Checkout",
                description: "Bank-grade encryption for all transactions"
              }
            ].map((feature, i) => (
              <Card key={i} className="hover:shadow-lg transition-shadow border-2 hover:border-primary/50">
                <CardHeader>
                  <div className="mb-4 text-primary">{feature.icon}</div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="bg-gradient-to-br from-primary to-purple-600 border-0 text-primary-foreground">
            <CardContent className="p-12 text-center">
              <h2 className="text-4xl font-bold mb-4">
                Ready to Transform Your Shopping?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Join thousands of satisfied customers and experience the difference
              </p>
              <Link href="/register">
                <Button size="lg" variant="secondary" className="text-lg px-8 shadow-xl">
                  Create Free Account <ArrowRight className="ml-2" />
                </Button>
              </Link>
              <p className="mt-4 text-sm opacity-75">No credit card required • Cancel anytime</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-secondary/30 backdrop-blur-sm">
        <div className="container mx-auto max-w-6xl px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ShoppingBag className="w-6 h-6 text-primary" />
                <span className="text-lg font-bold">YourStore</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your trusted destination for quality products and excellent service.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Shop</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary">New Arrivals</Link></li>
                <li><Link href="#" className="hover:text-primary">Best Sellers</Link></li>
                <li><Link href="#" className="hover:text-primary">Sale</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Account</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/login" className="hover:text-primary">Login</Link></li>
                <li><Link href="/register" className="hover:text-primary">Register</Link></li>
                <li><Link href="/profile-page" className="hover:text-primary">My Profile</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>support@yourstore.com</li>
                <li>+36 1 234 5678</li>
                <li>Mon-Fri: 9AM-6PM</li>
              </ul>
            </div>
          </div>
          <div className="text-center text-sm text-muted-foreground border-t pt-8">
            © 2025 YourStore. All rights reserved. Made with <Heart className="inline w-4 h-4 text-red-500" /> in Hungary
          </div>
        </div>
      </footer>
    </main>
  );
}
