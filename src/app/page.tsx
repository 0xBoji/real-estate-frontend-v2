import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/Header";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-150 to-gray-200">
      <Header />

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Find Your Dream Home
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Discover the perfect property with our comprehensive real estate platform.
            From luxury homes to affordable apartments, we have it all.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-3">
              Browse Properties
            </Button>
            <Link href="/auth/register">
              <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                See Membership
              </Button>
            </Link>
          </div>

          {/* Quick Login Section */}
          <div className="mt-12 p-6 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              Quick Access
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/auth/login" className="flex-1">
                <Button variant="outline" className="w-full">
                  Login
                </Button>
              </Link>
              <Link href="/auth/register" className="flex-1">
                <Button className="w-full">
                  Register
                </Button>
              </Link>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 mb-2">Demo Accounts:</p>
              <div className="text-xs text-gray-500 space-y-1">
                <p><strong>Admin:</strong> admin / admin123</p>
                <p><strong>User:</strong> testuser2 / password123</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose Us?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🔍 <span>Smart Search</span>
                </CardTitle>
                <CardDescription>
                  Advanced filters to find exactly what you're looking for
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Use our intelligent search system with location, price, and amenity filters
                  to discover properties that match your exact requirements.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🤖 <span>AI Assistant</span>
                </CardTitle>
                <CardDescription>
                  Get personalized recommendations from our AI chatbot
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Our AI-powered chatbot provides instant answers to your questions
                  and helps you find the perfect property based on your preferences.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📱 <span>Modern Platform</span>
                </CardTitle>
                <CardDescription>
                  Built with the latest technology for the best experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Experience our cutting-edge platform built with Next.js, TypeScript,
                  and Tailwind CSS for lightning-fast performance.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gradient-to-br from-gray-150 to-gray-200">
        <div className=" max-w-7xl mx-auto sm:px-6 lg:px-8 text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/properties" className="text-lg px-8 py-3 transition-colors duration-200 hover:text-green-600">
              Properties
            </Link>
            <span className="hidden sm:inline text-gray-400">|</span>
            <Link href="/membership" className="text-lg px-8 py-3 transition-colors duration-200 hover:text-green-600">
              Membership
            </Link>
            <span className="hidden sm:inline text-gray-400">|</span>
            <Link href="/" className="text-lg px-8 py-3 transition-colors duration-200 hover:text-green-600">
              Terms of Service
            </Link>
            <span className="hidden sm:inline text-gray-400">|</span>
            <Link href="/" className="text-lg px-8 py-3 transition-colors duration-200 hover:text-green-600">
              Privacy Policy
            </Link>
          </div>

          <p className="mt-10 text-gray-500">
            © 2025 Eco Estate
          </p>
        </div>
      </footer>
    </div>
  );
}
