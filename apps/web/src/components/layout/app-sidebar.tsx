"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Calendar,
  ChartBar,
  CheckCircle2,
  Folder,
  Inbox,
  Settings,
  Sun,
  Timer,
  LogOut,
  Trophy,
  Zap,
  Ghost,
  Lock,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { LevelProgress } from "@/components/gamification/LevelProgress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFeatures } from "@/hooks/useFeatures";
import { FEATURE_CODES, type FeatureCode } from "@/db/schema";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavItem {
  title: string;
  url: string;
  icon: typeof Sun;
  featureCode: FeatureCode | null;
  unlockLevel: number;
}

const mainNavItems: NavItem[] = [
  {
    title: "Today",
    url: "/dashboard",
    icon: Sun,
    featureCode: FEATURE_CODES.TODAY,
    unlockLevel: 0,
  },
  {
    title: "Inbox",
    url: "/dashboard/inbox",
    icon: Inbox,
    featureCode: FEATURE_CODES.INBOX,
    unlockLevel: 0,
  },
  {
    title: "Scheduled",
    url: "/dashboard/scheduled",
    icon: Calendar,
    featureCode: FEATURE_CODES.SCHEDULED,
    unlockLevel: 6,
  },
  {
    title: "Projects",
    url: "/dashboard/projects",
    icon: Folder,
    featureCode: FEATURE_CODES.PROJECTS,
    unlockLevel: 5,
  },
  {
    title: "Completed",
    url: "/dashboard/completed",
    icon: CheckCircle2,
    featureCode: null,
    unlockLevel: 3,
  },
];

const toolsNavItems: NavItem[] = [
  {
    title: "Quick Actions",
    url: "/dashboard/quick-actions",
    icon: Zap,
    featureCode: FEATURE_CODES.QUICK_ACTIONS,
    unlockLevel: 8,
  },
  {
    title: "Focus Mode",
    url: "/dashboard/focus",
    icon: Timer,
    featureCode: FEATURE_CODES.FOCUS_MODE,
    unlockLevel: 10,
  },
  {
    title: "Achievements",
    url: "/dashboard/achievements",
    icon: Trophy,
    featureCode: null,
    unlockLevel: 0,
  },
  {
    title: "Creatures",
    url: "/dashboard/creatures",
    icon: Ghost,
    featureCode: null,
    unlockLevel: 5,
  },
  {
    title: "Statistics",
    url: "/dashboard/stats",
    icon: ChartBar,
    featureCode: FEATURE_CODES.STATS,
    unlockLevel: 12,
  },
];

interface AppSidebarProps {
  user?: {
    email?: string;
    name?: string;
    avatar_url?: string;
  };
}

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname();
  const { isUnlocked, unlockedFeatures, loading } = useFeatures();

  const isActive = (url: string) => {
    if (url === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(url);
  };

  // Check if a nav item is unlocked
  const isItemUnlocked = (item: NavItem): boolean => {
    // While loading, only show basic items (level 0)
    if (loading) {
      return item.unlockLevel === 0;
    }

    // If item has a feature code, check if it's unlocked
    if (item.featureCode) {
      return isUnlocked(item.featureCode);
    }

    // For items without feature code, check level-based unlock
    // Count unlocked features as proxy for level progression
    const effectiveLevel = Math.floor(unlockedFeatures.size / 2);
    return effectiveLevel >= item.unlockLevel || item.unlockLevel === 0;
  };

  const renderNavItem = (item: NavItem) => {
    const unlocked = isItemUnlocked(item);

    if (!unlocked) {
      return (
        <SidebarMenuItem key={item.title}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <SidebarMenuButton
                  className="opacity-40 cursor-not-allowed"
                  disabled
                >
                  <Lock className="h-4 w-4" />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Unlocks at level {item.unlockLevel}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </SidebarMenuItem>
      );
    }

    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton asChild isActive={isActive(item.url)}>
          <Link href={item.url}>
            <item.icon className="h-4 w-4" />
            <span>{item.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Timer className="h-4 w-4" />
          </div>
          <span className="font-semibold">ADHD Focus</span>
        </Link>
      </SidebarHeader>

      <LevelProgress />
      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Tasks</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => renderNavItem(item))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolsNavItems.map((item) => renderNavItem(item))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={user?.avatar_url} />
                    <AvatarFallback>
                      {user?.name?.[0] || user?.email?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate">
                    {user?.name || user?.email || "User"}
                  </span>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
