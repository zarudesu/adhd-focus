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
  ListChecks,
  Settings,
  Sun,
  Timer,
  LogOut,
  Trophy,
  Zap,
  Ghost,
  Sparkles,
} from "lucide-react";
import { BeatLogo } from "@/components/brand/BeatLogo";

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
import { useGamificationEvents } from "@/components/gamification/GamificationProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Map nav codes to URLs and icons
const NAV_CONFIG: Record<string, { url: string; icon: typeof Sun; group: 'tasks' | 'tools' }> = {
  nav_inbox: { url: "/dashboard/inbox", icon: Inbox, group: 'tasks' },
  nav_process: { url: "/dashboard/inbox/process", icon: Sparkles, group: 'tasks' },
  nav_today: { url: "/dashboard", icon: Sun, group: 'tasks' },
  nav_scheduled: { url: "/dashboard/scheduled", icon: Calendar, group: 'tasks' },
  nav_projects: { url: "/dashboard/projects", icon: Folder, group: 'tasks' },
  nav_completed: { url: "/dashboard/completed", icon: CheckCircle2, group: 'tasks' },
  nav_checklist: { url: "/dashboard/checklist", icon: ListChecks, group: 'tasks' },
  nav_quick_actions: { url: "/dashboard/quick-actions", icon: Zap, group: 'tools' },
  nav_focus: { url: "/dashboard/focus", icon: Timer, group: 'tools' },
  nav_achievements: { url: "/dashboard/achievements", icon: Trophy, group: 'tools' },
  nav_creatures: { url: "/dashboard/creatures", icon: Ghost, group: 'tools' },
  nav_stats: { url: "/dashboard/stats", icon: ChartBar, group: 'tools' },
};

interface AppSidebarProps {
  user?: {
    email?: string;
    name?: string;
    avatar_url?: string;
  };
}

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname();
  const { navFeatures, featuresLoading: loading } = useGamificationEvents();

  const isActive = (url: string) => {
    if (url === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(url);
  };

  // Separate nav features by group
  const taskItems = navFeatures
    .filter(f => NAV_CONFIG[f.code]?.group === 'tasks')
    .sort((a, b) => {
      // Sort by predefined order
      const order = ['nav_inbox', 'nav_process', 'nav_today', 'nav_scheduled', 'nav_projects', 'nav_completed', 'nav_checklist'];
      return order.indexOf(a.code) - order.indexOf(b.code);
    });

  const toolItems = navFeatures
    .filter(f => NAV_CONFIG[f.code]?.group === 'tools')
    .sort((a, b) => {
      const order = ['nav_quick_actions', 'nav_focus', 'nav_achievements', 'nav_creatures', 'nav_stats'];
      return order.indexOf(a.code) - order.indexOf(b.code);
    });

  const renderNavItem = (feature: typeof navFeatures[0]) => {
    const config = NAV_CONFIG[feature.code];
    if (!config) return null;

    // Hide locked features completely - they appear as a surprise when unlocked!
    if (!feature.isUnlocked) {
      return null;
    }

    const IconComponent = config.icon;

    return (
      <SidebarMenuItem key={feature.code}>
        <SidebarMenuButton asChild isActive={isActive(config.url)}>
          <Link href={config.url}>
            <IconComponent className="h-4 w-4" />
            <span>{feature.name}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  // Show minimal UI while loading
  if (loading) {
    return (
      <Sidebar>
        <SidebarHeader className="p-4">
          <Link href="/dashboard/hub" className="flex items-center gap-2">
            <BeatLogo size="sm" />
            <span className="font-semibold">beatyour8</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive>
                    <Link href="/dashboard/inbox">
                      <Inbox className="h-4 w-4" />
                      <span>Inbox</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/dashboard/hub" className="flex items-center gap-2">
          <BeatLogo size="sm" />
          <span className="font-semibold">beatyour8</span>
        </Link>
      </SidebarHeader>

      <LevelProgress />
      <SidebarSeparator />

      <SidebarContent>
        {taskItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Tasks</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {taskItems.map((item) => renderNavItem(item))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {toolItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Tools</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {toolItems.map((item) => renderNavItem(item))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
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
