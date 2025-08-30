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
} from 'lucide-vue-next'

// 导出所有图标
export {
    Activity,
    // 状态
    AlertCircle,
    AlertTriangle, ArrowDown, ArrowLeft,
    ArrowRight,
    ArrowUp,
    // 数据和分析
    BarChart,
    BarChart2,
    BarChart3, Bell,
    BellRing, Bookmark, Briefcase,
    // 组织
    Building,
    Building2, Calculator, Calendar,
    CalendarDays, Check, CheckCircle, ChevronDown, ChevronLeft,
    ChevronRight, ChevronUp, Clipboard,
    // 时间
    Clock,
    // 系统
    Cog, Compass, Copy, CreditCard, Crown, Database,
    // 财务
    DollarSign, Download, Edit, Eye,
    EyeOff, Factory, File,
    Files, FileText, Flag, Folder,
    FolderOpen, Globe, Heart, HelpCircle,
    // 基础图标
    Home,
    // 媒体
    Image, Info, Key, Laptop, LineChart, Link, Lock,
    // 通讯
    Mail, Map,
    // 导航
    MapPin, Maximize, Menu, MessageCircle, MessageSquare, Minimize, Monitor,
    // 箭头和方向
    MoreHorizontal,
    MoreVertical, Music, Navigation, Package,
    Package2, Phone, PieChart, Plus, Printer,
    QrCode, Receipt, RefreshCw,
    RotateCcw, Save, Scan, Search, Settings,
    Settings2, Share, Shield,
    ShieldCheck,
    ShieldX, ShoppingBag,
    // 业务功能
    ShoppingCart, Signal, Sliders, Smartphone,
    // 其他常用
    Star, Store, Tag,
    Tags, Timer, Trash2, TrendingDown, TrendingUp, Truck, Unlock, Upload,
    // 用户和团队
    User, UserCheck, UserMinus, UserPlus, Users, UserX, Video, Wallet, Warehouse,
    // 网络
    Wifi,
    WifiOff, Wrench, X, XCircle, Zap
}

// 创建图标映射表，便于动态获取图标
export const iconMap = {
  // 基础图标
  Home: Home,
  Menu: Menu,
  Settings: Settings,
  Settings2: Settings2,
  Search: Search,
  Plus: Plus,
  Edit: Edit,
  Trash2: Trash2,
  Save: Save,
  X: X,
  Check: Check,
  ChevronDown: ChevronDown,
  ChevronUp: ChevronUp,
  ChevronLeft: ChevronLeft,
  ChevronRight: ChevronRight,
  ArrowLeft: ArrowLeft,
  ArrowRight: ArrowRight,
  ArrowUp: ArrowUp,
  ArrowDown: ArrowDown,

  // 用户和团队
  User: User,
  Users: Users,
  UserPlus: UserPlus,
  UserMinus: UserMinus,
  UserCheck: UserCheck,
  UserX: UserX,
  Shield: Shield,
  ShieldCheck: ShieldCheck,
  ShieldX: ShieldX,
  Crown: Crown,

  // 业务功能
  ShoppingCart: ShoppingCart,
  ShoppingBag: ShoppingBag,
  Package: Package,
  Package2: Package2,
  Truck: Truck,
  Warehouse: Warehouse,
  Factory: Factory,
  Store: Store,

  // 财务
  DollarSign: DollarSign,
  CreditCard: CreditCard,
  Wallet: Wallet,
  Receipt: Receipt,
  Calculator: Calculator,
  TrendingUp: TrendingUp,
  TrendingDown: TrendingDown,
  PieChart: PieChart,

  // 数据和分析
  BarChart: BarChart,
  BarChart2: BarChart2,
  BarChart3: BarChart3,
  LineChart: LineChart,
  Database: Database,
  FileText: FileText,
  File: File,
  Files: Files,
  Folder: Folder,
  FolderOpen: FolderOpen,

  // 系统
  Cog: Cog,
  Sliders: Sliders,
  Wrench: Wrench,
  Key: Key,
  Lock: Lock,
  Unlock: Unlock,
  Eye: Eye,
  EyeOff: EyeOff,

  // 通讯
  Mail: Mail,
  Phone: Phone,
  MessageSquare: MessageSquare,
  MessageCircle: MessageCircle,
  Bell: Bell,
  BellRing: BellRing,

  // 导航
  MapPin: MapPin,
  Map: Map,
  Navigation: Navigation,
  Compass: Compass,
  Globe: Globe,

  // 媒体
  Image: Image,
  Video: Video,
  Music: Music,
  Download: Download,
  Upload: Upload,
  Link: Link,

  // 状态
  AlertCircle: AlertCircle,
  AlertTriangle: AlertTriangle,
  Info: Info,
  CheckCircle: CheckCircle,
  XCircle: XCircle,
  HelpCircle: HelpCircle,

  // 时间
  Clock: Clock,
  Calendar: Calendar,
  CalendarDays: CalendarDays,
  Timer: Timer,

  // 组织
  Building: Building,
  Building2: Building2,
  Briefcase: Briefcase,
  Flag: Flag,
  Tag: Tag,
  Tags: Tags,

  // 网络
  Wifi: Wifi,
  WifiOff: WifiOff,
  Signal: Signal,
  Smartphone: Smartphone,
  Monitor: Monitor,
  Laptop: Laptop,

  // 其他常用
  Star: Star,
  Heart: Heart,
  Bookmark: Bookmark,
  Share: Share,
  Copy: Copy,
  Clipboard: Clipboard,
  Printer: Printer,
  QrCode: QrCode,
  Scan: Scan,
  Zap: Zap,

  // 箭头和方向
  MoreHorizontal: MoreHorizontal,
  MoreVertical: MoreVertical,
  Maximize: Maximize,
  Minimize: Minimize,
  RefreshCw: RefreshCw,
  RotateCcw: RotateCcw,
  Activity: Activity,
} as const

// 导出图标名称数组，便于选择器使用
export const iconNames = Object.keys(iconMap) as Array<keyof typeof iconMap>

// 工具函数：根据名称获取图标组件
export function getIconByName(name: string | null | undefined) {
  if (!name) return HelpCircle

  // 确保名称是字符串且存在
  const iconName = String(name).trim()
  if (!iconName) return HelpCircle

  // 从映射表中获取图标组件
  const IconComponent = iconMap[iconName as keyof typeof iconMap]

  // 如果找不到图标，返回 HelpCircle
  return IconComponent || HelpCircle
}

// 默认导出
export default {
  iconMap,
  iconNames,
  getIconByName
}
