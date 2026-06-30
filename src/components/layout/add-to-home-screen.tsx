"use client";

import { useEffect, useState } from "react";
import { Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function AddToHomeScreen({
  variant = "default",
  className,
}: {
  variant?: "default" | "sidebar";
  className?: string;
}) {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHint, setShowIosHint] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
      return;
    }

    const isIos =
      /iphone|ipad|ipod/i.test(navigator.userAgent) &&
      !(window as Window & { MSStream?: unknown }).MSStream;
    const isStandalone = (
      navigator as Navigator & { standalone?: boolean }
    ).standalone;

    if (isIos && !isStandalone) {
      setShowIosHint(true);
    }

    function handleBeforeInstall(event: Event) {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () =>
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  }

  if (installed) return null;

  if (deferredPrompt) {
    return (
      <button
        type="button"
        onClick={handleInstall}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors",
          variant === "sidebar"
            ? "border border-stone-700 px-3 py-2 text-stone-300 hover:bg-stone-900 hover:text-white"
            : "border border-amber-200 bg-amber-50 px-4 py-2.5 text-amber-900 hover:bg-amber-100",
          className
        )}
      >
        <Smartphone className="h-4 w-4 shrink-0" />
        Add to Home Screen
      </button>
    );
  }

  if (showIosHint) {
    return (
      <p
        className={cn(
          "text-xs leading-relaxed",
          variant === "sidebar" ? "px-2 text-stone-500" : "text-center text-stone-500",
          className
        )}
      >
        Install: tap{" "}
        <span className="font-medium text-stone-700">Share</span> then{" "}
        <span className="font-medium text-stone-700">Add to Home Screen</span>
      </p>
    );
  }

  return null;
}
