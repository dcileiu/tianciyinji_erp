import {
  Activity,
  // 状态
  AlertCircle,
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  // 数据和分析
  BarChart,
  BarChart2,
  BarChart3,
  Bell,
  BellRing,
  Bookmark,
  Briefcase,
  // 组织
  Building,
  Building2,
  Calculator,
  Calendar,
  CalendarDays,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clipboard,
  // 时间
  Clock,
  // 系统
  Cog,
  Compass,
  Copy,
  CreditCard,
  Crown,
  Database,
  // 财务
  DollarSign,
  Download,
  Edit,
  Eye,
  EyeOff,
  Factory,
  File,
  Files,
  FileText,
  Flag,
  Folder,
  FolderOpen,
  Globe,
  Heart,
  HelpCircle,
  // 基础图标
  Home,
  // 媒体
  Image,
  Info,
  Key,
  Laptop,
  LineChart,
  Link,
  Lock,
  // 通讯
  Mail,
  Map,
  // 导航
  MapPin,
  Maximize,
  Menu,
  MessageCircle,
  MessageSquare,
  Minimize,
  Monitor,
  // 箭头和方向
  MoreHorizontal,
  MoreVertical,
  Music,
  Navigation,
  Package,
  Package2,
  Phone,
  PieChart,
  Plus,
  Printer,
  QrCode,
  Receipt,
  RefreshCw,
  RotateCcw,
  Save,
  Scan,
  Search,
  Settings,
  Settings2,
  Share,
  Shield,
  ShieldCheck,
  ShieldX,
  ShoppingBag,
  // 业务功能
  ShoppingCart,
  Signal,
  Sliders,
  Smartphone,
  // 其他常用
  Star,
  Store,
  Tag,
  Tags,
  Timer,
  Trash2,
  TrendingDown,
  TrendingUp,
  Truck,
  Unlock,
  Upload,
  // 用户和团队
  User,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  UserX,
  Video,
  Wallet,
  Warehouse,
  // 网络
  Wifi,
  WifiOff,
  Wrench,
  X,
  XCircle,
  Zap,
} from 'lucide-vue-next';

export * from 'lucide-vue-next';

// 导出所有图标通过直通 re-export，避免重复导出已导入的符号

// 创建图标映射表，便于动态获取图标
export const iconMap = {
  // 基础图标
  Home,
  Menu,
  Settings,
  Settings2,
  Search,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,

  // 用户和团队
  User,
  Users,
  UserPlus,
  UserMinus,
  UserCheck,
  UserX,
  Shield,
  ShieldCheck,
  ShieldX,
  Crown,

  // 业务功能
  ShoppingCart,
  ShoppingBag,
  Package,
  Package2,
  Truck,
  Warehouse,
  Factory,
  Store,

  // 财务
  DollarSign,
  CreditCard,
  Wallet,
  Receipt,
  Calculator,
  TrendingUp,
  TrendingDown,
  PieChart,

  // 数据和分析
  BarChart,
  BarChart2,
  BarChart3,
  LineChart,
  Database,
  FileText,
  File,
  Files,
  Folder,
  FolderOpen,

  // 系统
  Cog,
  Sliders,
  Wrench,
  Key,
  Lock,
  Unlock,
  Eye,
  EyeOff,

  // 通讯
  Mail,
  Phone,
  MessageSquare,
  MessageCircle,
  Bell,
  BellRing,

  // 导航
  MapPin,
  Map,
  Navigation,
  Compass,
  Globe,

  // 媒体
  Image,
  Video,
  Music,
  Download,
  Upload,
  Link,

  // 状态
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  HelpCircle,

  // 时间
  Clock,
  Calendar,
  CalendarDays,
  Timer,

  // 组织
  Building,
  Building2,
  Briefcase,
  Flag,
  Tag,
  Tags,

  // 网络
  Wifi,
  WifiOff,
  Signal,
  Smartphone,
  Monitor,
  Laptop,

  // 其他常用
  Star,
  Heart,
  Bookmark,
  Share,
  Copy,
  Clipboard,
  Printer,
  QrCode,
  Scan,
  Zap,

  // 箭头和方向
  MoreHorizontal,
  MoreVertical,
  Maximize,
  Minimize,
  RefreshCw,
  RotateCcw,
  Activity,
} as const;

// 导出图标名称数组，便于选择器使用
export const iconNames = Object.keys(iconMap) as Array<keyof typeof iconMap>;

// 工具函数：根据名称获取图标组件
export function getIconByName(name: string | null | undefined) {
  if (!name) {
    return HelpCircle;
  }

  // 确保名称是字符串且存在
  const iconName = String(name).trim();
  if (!iconName) {
    return HelpCircle;
  }

  // 从映射表中获取图标组件
  const IconComponent = iconMap[iconName as keyof typeof iconMap];

  // 如果找不到图标，返回 HelpCircle
  return IconComponent || HelpCircle;
}

// 默认导出
export default {
  iconMap,
  iconNames,
  getIconByName,
};
