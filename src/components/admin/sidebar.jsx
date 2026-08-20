"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useNavLoading } from "@/components/admin/navigation-loading";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@radix-ui/react-collapsible";
import {
  LayoutDashboard,
  ClipboardCheck,
  Users,
  UserCog,
  Globe,
  Settings2,
  Building2,
  FolderOpen,
  TrendingUp,
  Layers,
  Star,
  MapPin,
  Mail,
  PenSquare,
  LogOut,
  ChevronDown,
  Plus,
  Home,
  Image,
  Database,
  ClipboardList,
  ChevronRight,
  Search,
  CircleHelp,
} from "lucide-react";

const navItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin/dashboard",
    exact: true,
  },
  {
    id: "listing-faqs",
    label: "Listing Page FAQs",
    icon: CircleHelp,
    href: "/admin/dashboard/manage-listing-faqs",
    permission: "MANAGE_LISTING_FAQS",
  },
  {
    id: "property-approvals",
    label: "Property Approvals",
    icon: ClipboardCheck,
    href: "/admin/dashboard/property-approvals",
    permission: "MANAGE_PROPERTY_APPROVALS",
  },
  {
    id: "manage-users",
    label: "Manage Users",
    icon: Users,
    href: "/admin/dashboard/manage-users",
    superAdminOnly: true,
  },
  {
    id: "manage-portal-users",
    label: "Manage Portal Users",
    icon: Users,
    href: "/admin/dashboard/manage-portal-users",
    superAdminOnly: true,
  },
  {
    id: "pending-permissions",
    label: "Pending Permissions",
    icon: UserCog,
    href: "/admin/dashboard/pending-permissions",
    superAdminOnly: true,
  },
  {
    id: "mpf-traffic",
    label: "Traffic & Logs",
    icon: TrendingUp,
    href: "/admin/dashboard/super-tracking",
    superAdminOnly: true,
  },
  {
    id: "search-reports",
    label: "Search Reports",
    icon: Search,
    href: "/admin/dashboard/search-reports",
    superAdminOnly: true,
  },
  {
    id: "activity-log",
    label: "Activity Log",
    icon: ClipboardList,
    href: "/admin/dashboard/activity-log",
    superAdminOnly: true,
  },
  {
    id: "data-backup",
    label: "Data Backup",
    icon: Database,
    href: "/admin/dashboard/data-backup",
    superAdminOnly: true,
  },
];

const navGroups = [
  {
    id: "website",
    label: "Website",
    icon: Globe,
    permission: "MANAGE_WEBSITE",
    children: [
      {
        id: "home-page",
        label: "Home Page",
        icon: Home,
        children: [
          { id: "banners", label: "Banners", href: "/admin/dashboard/manage-home-banners", icon: Image },
          { id: "testimonials", label: "Testimonials", href: "/admin/dashboard/manage-testimonials", icon: Star },
        ],
      },
    ],
  },
  {
    id: "options",
    label: "Options",
    icon: Settings2,
    permission: "MANAGE_OPTIONS",
    children: [
      { id: "countries", label: "Countries", href: "/admin/dashboard/manage-countries" },
      { id: "states", label: "States", href: "/admin/dashboard/manage-states" },
      { id: "cities", label: "Cities", href: "/admin/dashboard/manage-cities" },
      { id: "localities", label: "Localities", href: "/admin/dashboard/manage-localities" },
      { id: "project-types", label: "Project Types", href: "/admin/dashboard/project-types" },
      { id: "project-status", label: "Project Status", href: "/admin/dashboard/manage-project-status" },
      { id: "builders", label: "Builders", href: "/admin/dashboard/builder" },
      { id: "budget", label: "Budget Options", href: "/admin/dashboard/budget-options" },
      { id: "careers", label: "Career Applications", href: "/admin/dashboard/manage-career-applications" },
    ],
  },
  {
    id: "management",
    label: "Management",
    icon: Building2,
    permission: "MANAGE_PROJECTS",
    children: [
      { id: "proj-amenities", label: "Project Amenities", href: "/admin/dashboard/project-amenity" },
      { id: "proj-banners", label: "Banners", href: "/admin/dashboard/manage-banners" },
      { id: "floor-plans", label: "Floor Plans", href: "/admin/dashboard/manage-floor-plans" },
      { id: "gallery", label: "Gallery", href: "/admin/dashboard/manage-gallery" },
      { id: "faqs", label: "Project FAQs", href: "/admin/dashboard/manage-faqs" },
      { id: "proj-about", label: "About", href: "/admin/dashboard/manage-project-about" },
      { id: "walkthrough", label: "Walkthrough", href: "/admin/dashboard/manage-project-walkthrough" },
      { id: "loc-benefits", label: "Location Benefits", href: "/admin/dashboard/location-benifits" },
    ],
  },
  {
    id: "insights",
    label: "Insights",
    icon: TrendingUp,
    permission: "MANAGE_INSIGHTS",
    children: [
      { id: "price-data", label: "City Price Data", href: "/admin/dashboard/city-price-data" },
      { id: "score-eval", label: "Score Evaluation", href: "/admin/dashboard/manage-score-evalution" },
      { id: "insight-headers", label: "Headers", href: "/admin/dashboard/manage-insight-headers" },
      { id: "insight-category", label: "Categories", href: "/admin/dashboard/insight-category" },
      { id: "top-devs", label: "Top Developers", href: "/admin/dashboard/top-developers" },
    ],
  },
  {
    id: "blogs",
    label: "Blog Management",
    icon: PenSquare,
    permission: "MANAGE_BLOGS",
    children: [
      { id: "manage-blogs", label: "Manage Blogs", href: "/admin/dashboard/manage-blogs" },
      { id: "blog-cats", label: "Categories", href: "/admin/dashboard/manage-categories" },
    ],
  },
];

const standaloneItems = [
  {
    id: "projects",
    label: "Manage Projects",
    icon: FolderOpen,
    href: "/admin/dashboard/manage-projects",
    permission: "MANAGE_PROJECTS",
  },
  {
    id: "amenities",
    label: "Amenities",
    icon: Layers,
    href: "/admin/dashboard/aminities",
    permission: "MANAGE_AMENITIES",
  },
  {
    id: "features",
    label: "Features",
    icon: Star,
    href: "/admin/dashboard/manage-features",
    permission: "MANAGE_FEATURES",
  },
  {
    id: "nearby",
    label: "Nearby Benefits",
    icon: MapPin,
    href: "/admin/dashboard/manage-location-benefits",
    permission: "MANAGE_NEARBY_BENEFITS",
  },
  {
    id: "enquiries",
    label: "Enquiries",
    icon: Mail,
    href: "/admin/dashboard/enquiries",
    permission: "MANAGE_ENQUIRIES",
  },
];

function NavItem({ item, isActive, onClick, collapsed }) {
  const Icon = item.icon;
  const { startNavigation } = useNavLoading();
  const handleClick = () => {
    startNavigation(item.href);
    onClick?.();
  };

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Link
            href={item.href}
            onClick={handleClick}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200",
              isActive
                ? "admin-nav-active"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <Icon className="h-5 w-5" />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" className="flex items-center gap-4">
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={handleClick}
      className={cn(
            "flex items-center gap-3 rounded-md px-2.5 py-2 text-[13px] font-medium transition-all duration-150",
        isActive
          ? "admin-nav-active"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

function NavGroup({ group, pathname, onLinkClick, collapsed, openGroups, toggleGroup }) {
  const Icon = group.icon;
  const { startNavigation } = useNavLoading();
  const isOpen = openGroups.includes(group.id);
  const hasActiveChild = group.children?.some(child => 
    child.href ? pathname.startsWith(child.href) : child.children?.some(c => pathname.startsWith(c.href))
  );

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <button
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
              hasActiveChild
                ? "bg-primary text-primary-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <Icon className="h-5 w-5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="flex items-center gap-4">
          {group.label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={() => toggleGroup(group.id)}>
      <CollapsibleTrigger asChild>
        <button
          className={cn(
            "flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-[13px] font-medium transition-all",
            hasActiveChild
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          )}
        >
          <Icon className="h-5 w-5 shrink-0" />
          <span className="flex-1 truncate text-left">{group.label}</span>
          <ChevronDown className={cn(
            "h-4 w-4 shrink-0 transition-transform duration-200",
            isOpen && "rotate-180"
          )} />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
        <div className="ml-4 mt-1 space-y-1 border-l border-sidebar-border pl-4">
          {group.children?.map((child) => {
            if (child.children) {
              return (
                <NavGroup
                  key={child.id}
                  group={child}
                  pathname={pathname}
                  onLinkClick={onLinkClick}
                  collapsed={false}
                  openGroups={openGroups}
                  toggleGroup={toggleGroup}
                />
              );
            }
            const isActive = pathname.startsWith(child.href);
            const ChildIcon = child.icon;
            return (
              <Link
                key={child.id}
                href={child.href}
                onClick={() => {
                  startNavigation(child.href);
                  onLinkClick?.();
                }}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-all duration-200",
                  isActive
                    ? "admin-nav-child-active font-medium"
                    : "text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                {ChildIcon && <ChildIcon className="h-4 w-4 shrink-0" />}
                <span className="truncate">{child.label}</span>
              </Link>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function AdminSidebar({ 
  collapsed = false,
  onLinkClick,
  isSuperAdmin = false,
  hasPermission = () => false,
  onLogout,
  theme = "dark"
}) {
  const pathname = usePathname();
  const { startNavigation } = useNavLoading();
  const [openGroups, setOpenGroups] = React.useState([]);

  React.useEffect(() => {
    const newOpenGroups = [];
    navGroups.forEach(group => {
      const hasActive = group.children?.some(child =>
        child.href ? pathname.startsWith(child.href) : child.children?.some(c => pathname.startsWith(c.href))
      );
      if (hasActive) newOpenGroups.push(group.id);
    });
    setOpenGroups(newOpenGroups);
  }, [pathname]);

  const toggleGroup = (id) => {
    setOpenGroups(prev => 
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  const canView = (item) => {
    if (item.superAdminOnly) return isSuperAdmin;
    if (item.permission) return isSuperAdmin || hasPermission(item.permission);
    return true;
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "flex h-screen flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 admin-sidebar-premium",
          collapsed ? "w-16" : "w-[220px]"
        )}
      >
        {/* Logo */}
        <div className={cn(
          "flex h-16 items-center border-b border-sidebar-border px-4 admin-sidebar-brand",
          collapsed && "justify-center px-2"
        )}>
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            {collapsed ? (
              <img
                src="/images/admin/login-register.svg"
                alt="MPF"
                className="h-9 w-9 object-contain admin-sidebar-brand__logo"
              />
            ) : (
              <>
                <img
                  src="/images/admin/login-register.svg"
                  alt="My Property Fact"
                  className="h-10 w-auto object-contain admin-sidebar-brand__logo"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-sidebar-foreground leading-tight admin-sidebar-brand__title">
                    My Property Fact
                  </span>
                  <span className="text-xs text-sidebar-foreground/55">
                    Control Panel
                  </span>
                </div>
              </>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1">
            {/* Main nav items */}
            {navItems.filter(canView).map((item) => (
              <NavItem
                key={item.id}
                item={item}
                isActive={item.exact ? pathname === item.href : pathname.startsWith(item.href)}
                onClick={onLinkClick}
                collapsed={collapsed}
              />
            ))}

            {/* Nav groups */}
            {navGroups.filter(canView).map((group) => (
              <NavGroup
                key={group.id}
                group={group}
                pathname={pathname}
                onLinkClick={onLinkClick}
                collapsed={collapsed}
                openGroups={openGroups}
                toggleGroup={toggleGroup}
              />
            ))}

            {/* Standalone items after groups */}
            {standaloneItems.filter(canView).map((item) => (
              <NavItem
                key={item.id}
                item={item}
                isActive={pathname.startsWith(item.href)}
                onClick={onLinkClick}
                collapsed={collapsed}
              />
            ))}
          </nav>
        </ScrollArea>

        {/* New listing button */}
        {(isSuperAdmin || hasPermission("MANAGE_PROJECTS")) && (
          <div className={cn("px-3 pb-2", collapsed && "px-2")}>
            {collapsed ? (
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link
                    href="/admin/dashboard/projects/add-new-property"
                    onClick={() => {
                      startNavigation("/admin/dashboard/projects/add-new-property");
                      onLinkClick?.();
                    }}
                    className="flex h-10 w-10 items-center justify-center rounded-lg admin-sidebar-cta text-primary-foreground"
                  >
                    <Plus className="h-5 w-5" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">New Listing</TooltipContent>
              </Tooltip>
            ) : (
              <Link
                href="/admin/dashboard/projects/add-new-property"
                onClick={() => {
                  startNavigation("/admin/dashboard/projects/add-new-property");
                  onLinkClick?.();
                }}
                className="flex w-full items-center justify-center gap-2 rounded-lg admin-sidebar-cta px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all"
              >
                <Plus className="h-4 w-4" />
                New Listing
              </Link>
            )}
          </div>
        )}

        <Separator className="bg-sidebar-border" />

        {/* Footer */}
        <div className={cn("p-3", collapsed && "p-2")}>
          {collapsed ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  onClick={onLogout}
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Log Out</TooltipContent>
            </Tooltip>
          ) : (
            <button
              onClick={onLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Log Out</span>
            </button>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}

export default AdminSidebar;
