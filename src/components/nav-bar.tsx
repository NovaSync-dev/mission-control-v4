'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Settings2,
  Bot,
  MessageSquare,
  FileText,
  Radio,
  Brain,
  Code2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'HOME', icon: LayoutDashboard },
  { href: '/ops', label: 'OPS', icon: Settings2 },
  { href: '/agents', label: 'AGENTS', icon: Bot },
  { href: '/chat', label: 'CHAT', icon: MessageSquare },
  { href: '/content', label: 'CONTENT', icon: FileText },
  { href: '/comms', label: 'COMMS', icon: Radio },
  { href: '/knowledge', label: 'KNOWLEDGE', icon: Brain },
  { href: '/code', label: 'CODE', icon: Code2 },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[oklch(0.08_0.005_260)] backdrop-blur-xl">
      <div className="flex items-center h-12 px-2">
        <Link href="/" className="flex items-center gap-2 px-3 mr-1 shrink-0">
          <div className="w-2 h-2 rounded-full bg-cyan animate-pulse" />
          <span className="text-[11px] font-bold tracking-[0.2em] text-cyan hidden sm:inline">
            MISSION CONTROL
          </span>
        </Link>
        <div className="flex flex-1 items-center">
          {navItems.map((item) => {
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 px-1 py-2 rounded-lg transition-all duration-200 group relative',
                  'text-[clamp(0.45rem,0.75vw,0.6875rem)] font-medium tracking-wider',
                  isActive
                    ? 'text-primary bg-primary/[0.06]'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.03]'
                )}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden md:inline">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-2 right-2 h-[2px] bg-primary rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
        <div className="flex items-center gap-2 px-3 shrink-0">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-status-up animate-pulse" />
            <span className="text-[10px] font-mono text-muted-foreground">AUTO 15S</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
