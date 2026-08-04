"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Menu,
  PanelLeftClose,
  User,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { AdminNotifications } from "./admin-notifications";

export function AdminHeader({
  user,
  theme,
  onThemeToggle,
  onSidebarToggle,
  sidebarCollapsed,
  onLogout,
  className,
}) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [showSearch, setShowSearch] = React.useState(false);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex h-[3.25rem] items-center justify-between gap-3 border-b px-3 md:px-4 admin-header-premium",
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-2 md:gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onSidebarToggle}
          className="hidden h-8 w-8 md:flex"
        >
          <PanelLeftClose
            className={cn(
              "h-4 w-4 transition-transform",
              sidebarCollapsed && "rotate-180"
            )}
          />
          <span className="sr-only">Toggle sidebar</span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onSidebarToggle}
          className="h-8 w-8 md:hidden"
        >
          <Menu className="h-4 w-4" />
          <span className="sr-only">Toggle menu</span>
        </Button>

        <Link href="/admin/dashboard" className="flex items-center gap-2 md:hidden">
          <img
            src="/images/admin/logo.svg"
            alt="My Property Fact"
            className="h-7 w-auto object-contain"
          />
        </Link>

        <Link href="/admin/dashboard" className="admin-header-logo-wrap">
          <img src="/images/admin/logo.svg" alt="My Property Fact" />
        </Link>

        <Badge
          variant="outline"
          className="admin-header-version hidden text-[10px] font-semibold sm:inline-flex"
        >
          Admin
        </Badge>

        <div className="relative hidden admin-header-search md:flex">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search modules…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 w-[200px] border-0 bg-transparent pl-8 text-sm shadow-none focus-visible:ring-0 lg:w-[280px]"
          />
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowSearch(!showSearch)}
          className="h-8 w-8 md:hidden"
        >
          <Search className="h-4 w-4" />
          <span className="sr-only">Search</span>
        </Button>

        <AdminNotifications />

        <Separator orientation="vertical" className="mx-1 hidden h-5 sm:block" />

        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 gap-2 px-1.5 md:px-2">
              <Avatar className="h-7 w-7">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                  {user?.name?.charAt(0) || "A"}
                </AvatarFallback>
              </Avatar>
              <div className="hidden flex-col items-start text-left md:flex">
                <span className="max-w-[120px] truncate text-xs font-semibold leading-tight">
                  {user?.name || "Admin User"}
                </span>
                <span className="text-[10px] text-muted-foreground leading-tight">
                  {user?.role || "Admin"}
                </span>
              </div>
              <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground md:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52" sideOffset={8} collisionPadding={12}>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-0.5">
                <p className="text-sm font-medium leading-none">
                  {user?.name || "Admin User"}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.role || "Admin"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onLogout}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {showSearch && (
        <div className="absolute inset-x-0 top-full border-b bg-white p-3 md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full pl-9"
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  );
}

export default AdminHeader;
