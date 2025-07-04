'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Home, User, LogOut, Settings, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user?.username?.[0]?.toUpperCase() || 'U';
  };

  const NavLinks = (
    <>
      {isAuthenticated && (
        <Button variant="ghost" asChild>
          <Link href={user?.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'}>
            Dashboard
          </Link>
        </Button>
      )}
      <Button variant="ghost" asChild className="my-3">
        <Link href="/properties">Properties</Link>
      </Button>
      {isAuthenticated && (
        <Button variant="ghost" asChild className="mb-3">
          <Link href="/properties/add">Add Property</Link>
        </Button>
      )}
      <Button variant="ghost" asChild>
        <Link href="/membership">Membership</Link>
      </Button>
    </>
  );

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex justify-between items-center h-16">
          {/* Left: Nav or Hamburger */}
          <div className="flex items-center min-w-[48px]">
            {/* Hamburger for mobile */}
            <div className="sm:hidden">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10 p-0">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="pt-8 w-64">
                  <nav className="flex flex-col space-y-2">
                    {NavLinks}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
            {/* Nav links for desktop */}
            <nav className="hidden sm:flex items-center space-x-4">
              {NavLinks}
            </nav>
          </div>

          {/* Center: Logo */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center">
            <Link href="/" className="flex items-center">
              <Home className="h-8 w-8 text-green-700 mr-2" />
              <h1 className="text-lg font-bold text-gray-900 lg:text-2xl md:text-xl">Eco Real Estate</h1>
            </Link>
          </div>

          {/* Right: Auth/User menu */}
          <div className="flex items-center min-w-[120px] justify-end">
            <nav className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <Button variant="ghost" asChild>
                    <Link href="/profile">Profile</Link>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{getUserInitials()}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {user?.firstName} {user?.lastName}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user?.email}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            Role: {user?.role}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {user?.role === 'ADMIN' && (
                        <DropdownMenuItem asChild>
                          <Link href="/admin/dashboard">
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Admin Panel</span>
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={logout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link href="/auth/login">Sign In</Link>
                  </Button>
                </>
              )}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
