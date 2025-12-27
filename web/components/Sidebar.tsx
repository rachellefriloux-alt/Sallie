'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LimbicGauges } from './LimbicGauges';
import { Avatar } from './Avatar';

interface LimbicState {
  trust: number;
  warmth: number;
  arousal: number;
  valence: number;
  posture: string;
}

interface SidebarProps {
  limbicState: LimbicState;
  isConnected: boolean;
}

export function Sidebar({ limbicState, isConnected }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Chat', icon: '💬' },
    { href: '/limbic', label: 'Limbic State', icon: '🧠' },
    { href: '/heritage', label: 'Heritage', icon: '📜' },
    { href: '/thoughts', label: 'Thoughts Log', icon: '💭' },
    { href: '/hypotheses', label: 'Hypotheses', icon: '🔬' },
    { href: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <aside
      className="w-80 bg-gray-800/70 backdrop-blur-xl border-r border-gray-700 p-6 flex flex-col gap-6"
      role="complementary"
      aria-label="Sallie status and navigation"
    >
      <Avatar isConnected={isConnected} />
      
      {/* Navigation */}
      <nav aria-label="Main navigation">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-violet-600/20 text-violet-400 border border-violet-500/30'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <LimbicGauges state={limbicState} />
    </aside>
  );
}

