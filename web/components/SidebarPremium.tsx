'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Home, 
  Brain, 
  Heart, 
  MessageSquare, 
  Settings, 
  Users, 
  Shield, 
  Zap, 
  Activity, 
  Database, 
  GitBranch, 
  Clock, 
  Calendar, 
  FileText, 
  Search, 
  Bookmark, 
  Star, 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  LineChart, 
  Cpu, 
  MemoryStick, 
  HardDrive, 
  Wifi, 
  WifiOff, 
  Battery, 
  BatteryCharging, 
  Volume2, 
  VolumeX, 
  Bell, 
  BellOff, 
  Moon, 
  Sun, 
  Monitor, 
  Smartphone, 
  Tablet, 
  Globe, 
  Lock, 
  Unlock, 
  User, 
  Bot, 
  ChevronDown, 
  ChevronRight, 
  ChevronLeft, 
  Plus, 
  Minus, 
  X, 
  Check, 
  AlertCircle, 
  Info, 
  HelpCircle, 
  Command, 
  ZapOff, 
  Power, 
  PowerOff, 
  RefreshCw, 
  Download, 
  Upload, 
  Share, 
  Link, 
  ExternalLink, 
  Eye, 
  EyeOff, 
  Edit, 
  Trash2, 
  Copy, 
  Move, 
  RotateCcw, 
  Save, 
  Folder, 
  FolderOpen, 
  File, 
  FilePlus, 
  FileMinus, 
  FileText, 
  FileImage, 
  FileVideo, 
  FileAudio, 
  FileCode, 
  FileArchive, 
  FileSpreadsheet, 
  FilePresentation, 
  FileQuestion, 
  FileWarning, 
  FileCheck, 
  FileX, 
  FilePlus2, 
  FileMinus2, 
  FileSearch, 
  FileFilter, 
  FileSort, 
  FileGrid, 
  FileList, 
  FileStack, 
  FileDuplicate, 
  FileSymlink, 
  FileBroken, 
  FileLock, 
  FileUnlock, 
  FileSignature, 
  FileKey, 
  FileCertificate, 
  FileKey2, 
  FileLock2, 
  FileUnlock2, 
  FileWarning2, 
  FileError, 
  FileQuestion2, 
  FileCheck2, 
  FileX2, 
  FilePlus3, 
  FileMinus3, 
  FileSearch2, 
  FileFilter2, 
  FileSort2, 
  FileGrid2, 
  FileList2, 
  FileStack2, 
  FileDuplicate2, 
  FileSymlink2, 
  FileBroken2, 
  FileLock2, 
  FileUnlock2, 
  FileSignature2, 
  FileKey2, 
  FileCertificate2, 
  FileKey3, 
  FileLock3, 
  FileUnlock3, 
  FileWarning3, 
  FileError2, 
  FileQuestion3, 
  FileCheck3, 
  FileX3, 
  FilePlus4, 
  FileMinus4, 
  FileSearch3, 
  FileFilter3, 
  FileSort3, 
  FileGrid3, 
  FileList3, 
  FileStack3, 
  FileDuplicate3, 
  FileSymlink3, 
  FileBroken3, 
  FileLock3, 
  FileUnlock3, 
  FileSignature3, 
  FileKey3, 
  FileCertificate3, 
  FileKey4, 
  FileLock4, 
  FileUnlock4, 
  FileWarning4, 
  FileError3, 
  FileQuestion4, 
  FileCheck4, 
  FileX4, 
  FilePlus5, 
  FileMinus5, 
  FileSearch4, 
  FileFilter4, 
  FileSort4, 
  FileGrid4, 
  FileList4, 
  FileStack4, 
  FileDuplicate4, 
  FileSymlink4, 
  FileBroken4, 
  FileLock4, 
  FileUnlock4, 
  FileSignature4, 
  FileKey4, 
  FileCertificate4, 
  FileKey5, 
  FileLock5, 
  FileUnlock5, 
  FileWarning5, 
  FileError4, 
  FileQuestion5, 
  FileCheck5, 
  FileX5
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  systemStatus: {
    ghostInterface: boolean;
    cliInterface: boolean;
    activeVeto: boolean;
    foundryEval: boolean;
    memoryHygiene: boolean;
    voiceCommands: boolean;
    undoWindow: boolean;
    brainForge: boolean;
  };
  performanceScore: number;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  href: string;
  badge?: string | number;
  children?: NavItem[];
  isActive?: boolean;
  isDisabled?: boolean;
  isPro?: boolean;
  isNew?: boolean;
  isBeta?: boolean;
}

export function Sidebar({ collapsed, systemStatus, performanceScore }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('dark');

  // Enhanced navigation items with better organization
  const navigationItems: NavItem[] = useMemo(() => [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      href: '/',
      isActive: pathname === '/',
    },
    {
      id: 'conversation',
      label: 'Conversation',
      icon: MessageSquare,
      href: '/conversation',
      isActive: pathname === '/conversation',
      badge: '3',
    },
    {
      id: 'limbic',
      label: 'Limbic System',
      icon: Brain,
      href: '/limbic',
      isActive: pathname === '/limbic',
      children: [
        {
          id: 'limbic-state',
          label: 'State Monitor',
          icon: Activity,
          href: '/limbic/state',
          isActive: pathname === '/limbic/state',
        },
        {
          id: 'limbic-history',
          label: 'History',
          icon: Clock,
          href: '/limbic/history',
          isActive: pathname === '/limbic/history',
        },
        {
          id: 'limbic-patterns',
          label: 'Patterns',
          icon: TrendingUp,
          href: '/limbic/patterns',
          isActive: pathname === '/limbic/patterns',
        },
      ],
    },
    {
      id: 'heritage',
      label: 'Heritage',
      icon: Heart,
      href: '/heritage',
      isActive: pathname === '/heritage',
      children: [
        {
          id: 'heritage-dna',
          label: 'DNA Browser',
          icon: Database,
          href: '/heritage/dna',
          isActive: pathname === '/heritage/dna',
        },
        {
          id: 'heritage-evolution',
          label: 'Evolution',
          icon: GitBranch,
          href: '/heritage/evolution',
          isActive: pathname === '/heritage/evolution',
        },
        {
          id: 'heritage-memories',
          label: 'Memories',
          icon: Bookmark,
          href: '/heritage/memories',
          isActive: pathname === '/heritage/memories',
        },
      ],
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: FileText,
      href: '/projects',
      isActive: pathname === '/projects',
      children: [
        {
          id: 'projects-active',
          label: 'Active',
          icon: Activity,
          href: '/projects/active',
          isActive: pathname === '/projects/active',
        },
        {
          id: 'projects-completed',
          label: 'Completed',
          icon: Check,
          href: '/projects/completed',
          isActive: pathname === '/projects/completed',
        },
        {
          id: 'projects-archived',
          label: 'Archived',
          icon: Archive,
          href: '/projects/archived',
          isActive: pathname === '/projects/archived',
        },
      ],
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      href: '/analytics',
      isActive: pathname === '/analytics',
      children: [
        {
          id: 'analytics-performance',
          label: 'Performance',
          icon: LineChart,
          href: '/analytics/performance',
          isActive: pathname === '/analytics/performance',
        },
        {
          id: 'analytics-usage',
          label: 'Usage',
          icon: PieChart,
          href: '/analytics/usage',
          isActive: pathname === '/analytics/usage',
        },
        {
          id: 'analytics-system',
          label: 'System',
          icon: Cpu,
          href: '/analytics/system',
          isActive: pathname === '/analytics/system',
        },
      ],
    },
    {
      id: 'systems',
      label: 'Systems',
      icon: Shield,
      href: '/systems',
      isActive: pathname === '/systems',
      children: [
        {
          id: 'systems-ghost',
          label: 'Ghost Interface',
          icon: Monitor,
          href: '/systems/ghost',
          isActive: pathname === '/systems/ghost',
          badge: systemStatus.ghostInterface ? '✓' : '✗',
        },
        {
          id: 'systems-cli',
          label: 'CLI Interface',
          icon: Command,
          href: '/systems/cli',
          isActive: pathname === '/systems/cli',
          badge: systemStatus.cliInterface ? '✓' : '✗',
        },
        {
          id: 'systems-veto',
          label: 'Active Veto',
          icon: Users,
          href: '/systems/veto',
          isActive: pathname === '/systems/veto',
          badge: systemStatus.activeVeto ? '✓' : '✗',
        },
        {
          id: 'systems-foundry',
          label: 'Foundry',
          icon: Zap,
          href: '/systems/foundry',
          isActive: pathname === '/systems/foundry',
          badge: systemStatus.foundryEval ? '✓' : '✗',
        },
        {
          id: 'systems-memory',
          label: 'Memory Hygiene',
          icon: Database,
          href: '/systems/memory',
          isActive: pathname === '/systems/memory',
          badge: systemStatus.memoryHygiene ? '✓' : '✗',
        },
        {
          id: 'systems-voice',
          label: 'Voice Commands',
          icon: Volume2,
          href: '/systems/voice',
          isActive: pathname === '/systems/voice',
          badge: systemStatus.voiceCommands ? '✓' : '✗',
        },
        {
          id: 'systems-undo',
          label: 'Undo Window',
          icon: RotateCcw,
          href: '/systems/undo',
          isActive: pathname === '/systems/undo',
          badge: systemStatus.undoWindow ? '✓' : '✗',
        },
        {
          id: 'systems-brainforge',
          label: 'Brain Forge',
          icon: Brain,
          href: '/systems/brainforge',
          isActive: pathname === '/systems/brainforge',
          badge: systemStatus.brainForge ? '✓' : '✗',
        },
      ],
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      href: '/settings',
      isActive: pathname === '/settings',
      children: [
        {
          id: 'settings-profile',
          label: 'Profile',
          icon: User,
          href: '/settings/profile',
          isActive: pathname === '/settings/profile',
        },
        {
          id: 'settings-preferences',
          label: 'Preferences',
          icon: Star,
          href: '/settings/preferences',
          isActive: pathname === '/settings/preferences',
        },
        {
          id: 'settings-security',
          label: 'Security',
          icon: Lock,
          href: '/settings/security',
          isActive: pathname === '/settings/security',
        },
        {
          id: 'settings-advanced',
          label: 'Advanced',
          icon: Cpu,
          href: '/settings/advanced',
          isActive: pathname === '/settings/advanced',
        },
      ],
    },
  ], [pathname, systemStatus]);

  // Filter navigation items based on search
  const filteredItems = useMemo(() => {
    if (!searchQuery) return navigationItems;
    
    const filterItems = (items: NavItem[]): NavItem[] => {
      return items.filter(item => {
        const matchesSearch = item.label.toLowerCase().includes(searchQuery.toLowerCase());
        const hasMatchingChildren = item.children?.some(child => 
          child.label.toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        if (matchesSearch || hasMatchingChildren) {
          return {
            ...item,
            children: hasMatchingChildren ? filterItems(item.children || []) : item.children,
          };
        }
        return false;
      }).filter(Boolean) as NavItem[];
    };
    
    return filterItems(navigationItems);
  }, [searchQuery, navigationItems]);

  // Toggle expanded items
  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  // Handle navigation
  const handleNavigation = (href: string) => {
    router.push(href);
  };

  // Calculate system health
  const systemHealth = useMemo(() => {
    const activeSystems = Object.values(systemStatus).filter(Boolean).length;
    const totalSystems = Object.keys(systemStatus).length;
    return (activeSystems / totalSystems) * 100;
  }, [systemStatus]);

  return (
    <div className={`h-full bg-gradient-to-b from-slate-900 to-slate-800 border-r border-purple-500/20 flex flex-col transition-all duration-300 ${collapsed ? 'w-20' : 'w-80'}`}>
      {/* Header */}
      <div className="p-4 border-b border-purple-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.div
              className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Brain className="w-6 h-6 text-white" />
            </motion.div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div>
                    <h1 className="text-lg font-bold text-white">Sallie</h1>
                    <p className="text-xs text-purple-300">Studio</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700/70 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSearch(!showSearch)}
              >
                <Search className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
        
        {/* Search Bar */}
        <AnimatePresence>
          {showSearch && !collapsed && (
            <motion.div
              className="mt-3"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-purple-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filteredItems.map((item) => (
          <div key={item.id}>
            <motion.button
              className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                item.isActive
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-slate-700/50 text-gray-300 hover:bg-slate-700/70'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (item.children) {
                  toggleExpanded(item.id);
                } else {
                  handleNavigation(item.href);
                }
              }}
            >
              <div className="flex items-center space-x-3">
                <item.icon className="w-5 h-5" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <div className="flex items-center space-x-2">
                {item.badge && (
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    item.isActive
                      ? 'bg-white/20 text-white'
                      : typeof item.badge === 'string'
                      ? item.badge === '✓' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      : 'bg-purple-500/20 text-purple-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {item.children && !collapsed && (
                  <motion.div
                    animate={{ rotate: expandedItems.has(item.id) ? 90 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </motion.div>
                )}
              </div>
            </motion.button>
            
            {/* Sub-items */}
            <AnimatePresence>
              {item.children && expandedItems.has(item.id) && !collapsed && (
                <motion.div
                  className="ml-8 mt-2 space-y-1"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {item.children.map((child) => (
                    <motion.button
                      key={child.id}
                      className={`w-full flex items-center justify-between p-2 rounded-lg transition-all ${
                        child.isActive
                          ? 'bg-purple-600/50 text-white'
                          : 'bg-slate-700/30 text-gray-400 hover:bg-slate-700/50'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleNavigation(child.href)}
                    >
                      <div className="flex items-center space-x-3">
                        <child.icon className="w-4 h-4" />
                        <span className="text-sm">{child.label}</span>
                      </div>
                      {child.badge && (
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          typeof child.badge === 'string'
                          ? child.badge === '✓' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          : 'bg-purple-500/20 text-purple-400'
                        }`}>
                          {child.badge}
                        </span>
                      )}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-purple-500/20">
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* System Health */}
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-300">System Health</span>
                  <span className={`text-sm font-bold ${
                    systemHealth >= 90 ? 'text-green-400' :
                    systemHealth >= 70 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {systemHealth.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-slate-600/50 rounded-full h-2">
                  <motion.div
                    className={`h-full rounded-full ${
                      systemHealth >= 90 ? 'bg-green-400' :
                      systemHealth >= 70 ? 'bg-yellow-400' :
                      'bg-red-400'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${systemHealth}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>

              {/* Performance Score */}
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-300">Performance</span>
                  <span className={`text-sm font-bold ${
                    performanceScore >= 90 ? 'text-green-400' :
                    performanceScore >= 70 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {performanceScore.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-slate-600/50 rounded-full h-2">
                  <motion.div
                    className={`h-full rounded-full ${
                      performanceScore >= 90 ? 'bg-green-400' :
                      performanceScore >= 70 ? 'bg-yellow-400' :
                      'bg-red-400'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${performanceScore}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <motion.button
                    className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700/70 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setNotifications(!notifications)}
                  >
                    {notifications ? (
                      <Bell className="w-4 h-4" />
                    ) : (
                      <BellOff className="w-4 h-4" />
                    )}
                  </motion.button>
                  
                  <motion.button
                    className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700/70 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSoundEnabled(!soundEnabled)}
                  >
                    {soundEnabled ? (
                      <Volume2 className="w-4 h-4" />
                    ) : (
                      <VolumeX className="w-4 h-4" />
                    )}
                  </motion.button>
                  
                  <motion.button
                    className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700/70 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  >
                    {theme === 'dark' ? (
                      <Moon className="w-4 h-4" />
                    ) : (
                      <Sun className="w-4 h-4" />
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
