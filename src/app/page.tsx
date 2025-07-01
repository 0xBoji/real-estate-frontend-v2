import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/Header";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />

      {/* Hero Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
            Find Your Dream Home
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Discover the perfect property with our comprehensive real estate platform.
            From friendly <span className="text-green-600">green</span> homes to luxury affordable apartments, we have it all.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/properties">
              <Button size="lg" className="text-lg px-8 py-3">
                Browse Properties
              </Button>
            </Link>
            <Link href="/membership">
              <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                Membership
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Login Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mt-5 mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-between">
            <img src="/images/house1.jpg" alt="house" className="w-3/5 h-64 object-cover rounded-lg" />
            <div className="w-2/5 text-left ml-10">
              <h2 className="text-lg font-bold text-gray-900 mb-2">
                Various of houses and apartments are awaiting...
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Sign in now to get your dream home.
              </p>
              <div className="flex justify-start">
                <Link href="/auth/register">
                  <Button>
                    Register
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Us */}
      <section
        className="py-20 relative"
        style={{
          backgroundImage: "url('/images/about.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay for better text contrast */}
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
          <h3 className="text-3xl font-bold text-center text-white mb-6">
            Why Choose Us?
          </h3>
          <p className="text-white mx-auto text-center">
            We are dedicated to providing to our customers the most suitable home.
            <br />
            For more ambitious customers, we also provide a membership service.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
            <Card className="transition-colors duration-200 group hover:bg-green-700 hover:border-green-700 hover:text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 group-hover:text-white">
                  🔍 <span>Smart Search</span>
                </CardTitle>
                <CardDescription className="group-hover:text-white">
                  Advanced filters to find exactly what you're looking for
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 group-hover:text-white">
                  Use our intelligent search system with location, price, and amenity filters
                  to discover properties that match your exact requirements.
                </p>
              </CardContent>
            </Card>

            <Card className="transition-colors duration-200 group hover:bg-green-700 hover:border-green-700 hover:text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 group-hover:text-white">
                  🤖 <span>AI Assistant</span>
                </CardTitle>
                <CardDescription className="group-hover:text-white">
                  Get personalized recommendations from our AI chatbot
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 group-hover:text-white">
                  Our AI-powered chatbot provides instant answers to your questions
                  and helps you find the perfect property based on your preferences.
                </p>
              </CardContent>
            </Card>

            <Card className="transition-colors duration-200 group hover:bg-green-700 hover:border-green-700 hover:text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 group-hover:text-white">
                  📱 <span>Modern Platform</span>
                </CardTitle>
                <CardDescription className="group-hover:text-white">
                  Built with the latest technology for the best experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 group-hover:text-white">
                  Experience our cutting-edge platform built with Next.js, TypeScript,
                  and Tailwind CSS for lightning-fast performance.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-gradient-to-br from-gray-150 to-gray-200">
        <div className=" max-w-7xl mx-auto sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold">
            Built with Modern Technology
          </h3>
          <div className="flex flex-wrap justify-center gap-4 my-8">
            <Badge className="text-lg px-4 py-2">Next.js 15</Badge>
            <Badge className="text-lg px-4 py-2">TypeScript</Badge>
            <Badge className="text-lg px-4 py-2">Tailwind CSS</Badge>
            <Badge className="text-lg px-4 py-2">Shadcn/UI</Badge>
            <Badge className="text-lg px-4 py-2">Turbopack</Badge>
          </div>
          <p className=" text-gray-500">
            © 2025 Eco Estate 🏠
          </p>
        </div>


      </footer>
    </div>
  );
}
