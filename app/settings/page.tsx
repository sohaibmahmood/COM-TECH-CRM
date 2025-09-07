"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/components/theme-provider";
import { Badge } from "@/components/ui/badge";

const MoonIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
    />
  </svg>
);

const SunIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MonitorIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

const DatabaseIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
);

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="container mx-auto p-6 space-y-6 animate-fade-in">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your CRM preferences and system configuration.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Appearance Settings */}
        <Card className="card-animate">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SunIcon />
              Appearance
            </CardTitle>
            <CardDescription>
              Customize the look and feel of your CRM interface.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label className="text-base font-medium">Theme Preference</Label>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("light")}
                  className="flex items-center gap-2 btn-animate"
                >
                  <SunIcon />
                  Light
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("dark")}
                  className="flex items-center gap-2 btn-animate"
                >
                  <MoonIcon />
                  Dark
                </Button>
                <Button
                  variant={theme === "system" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("system")}
                  className="flex items-center gap-2 btn-animate"
                >
                  <MonitorIcon />
                  System
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Choose your preferred theme. System will automatically match
                your device settings.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card className="card-animate">
          <CardHeader>
            <CardTitle>System Information</CardTitle>
            <CardDescription>
              Current system status and version details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-muted-foreground">
                  Version
                </Label>
                <Badge variant="secondary">v2.1.0</Badge>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-muted-foreground">
                  Last Updated
                </Label>
                <p className="text-sm">September 7, 2025</p>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-muted-foreground">
                  Database Status
                </Label>
                <Badge variant="default" className="bg-green-500">
                  Connected
                </Badge>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-muted-foreground">
                  Storage Used
                </Label>
                <p className="text-sm">2.4 GB / 10 GB</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
