<template>
  <div :class="badgeClasses">
    <component :is="statusConfig.icon" :class="iconClasses" />
    <span v-if="showLabel" :class="textClasses">{{ currentLabel }}</span>
  </div>
</template>

<script setup lang="ts">
import {
  AlertCircle,
  Ban,
  CheckCircle,
  CircleX,
  Clock,
  Loader2,
  Pause,
  Play,
  XCircle,
} from 'lucide-vue-next';

export type StatusType =
  | 'active'
  | 'inactive'
  | 'success'
  | 'error'
  | 'warning'
  | 'pending'
  | 'in-process'
  | 'done'
  | 'failed'
  | 'paused'
  | 'running'
  | 'loading';

interface StatusConfig {
  defaultLabel: string;
  icon: any;
  colorClass: string;
  borderClass: string;
  textClass: string;
  iconClass: string;
}

interface Props {
  status: StatusType;
  customLabel?: string;
  showLabel?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showLabel: true,
});

const statusConfigs: Record<StatusType, StatusConfig> = {
  // 项目常用状态
  active: {
    defaultLabel: '启用',
    icon: CheckCircle,
    colorClass: 'border-gray-200 bg-transparent',
    borderClass: 'border-gray-200',
    textClass: 'text-foreground',
    iconClass: 'text-green-500',
  },
  inactive: {
    defaultLabel: '禁用',
    icon: Ban,
    colorClass: 'border-gray-200 bg-transparent',
    borderClass: 'border-gray-200',
    textClass: 'text-foreground',
    iconClass: 'text-red-500',
  },
  success: {
    defaultLabel: '成功',
    icon: CheckCircle,
    colorClass: 'border-gray-200 bg-transparent',
    borderClass: 'border-gray-200',
    textClass: 'text-foreground',
    iconClass: 'text-green-500',
  },
  error: {
    defaultLabel: '错误',
    icon: CircleX,
    colorClass: 'border-gray-200 bg-transparent',
    borderClass: 'border-gray-200',
    textClass: 'text-foreground',
    iconClass: 'text-red-500',
  },
  warning: {
    defaultLabel: '警告',
    icon: AlertCircle,
    colorClass: 'border-gray-200 bg-transparent',
    borderClass: 'border-gray-200',
    textClass: 'text-foreground',
    iconClass: 'text-yellow-500',
  },
  pending: {
    defaultLabel: '等待中',
    icon: Clock,
    colorClass: 'border-gray-200 bg-transparent',
    borderClass: 'border-gray-200',
    textClass: 'text-foreground',
    iconClass: 'text-gray-500',
  },
  // 兼容旧状态类型
  'in-process': {
    defaultLabel: '进行中',
    icon: Clock,
    colorClass: 'border-gray-200 bg-transparent',
    borderClass: 'border-gray-200',
    textClass: 'text-foreground',
    iconClass: 'text-orange-500',
  },
  done: {
    defaultLabel: '已完成',
    icon: CheckCircle,
    colorClass: 'border-gray-200 bg-transparent',
    borderClass: 'border-gray-200',
    textClass: 'text-foreground',
    iconClass: 'text-green-500',
  },
  failed: {
    defaultLabel: '失败',
    icon: CircleX,
    colorClass: 'border-gray-200 bg-transparent',
    borderClass: 'border-gray-200',
    textClass: 'text-foreground',
    iconClass: 'text-red-500',
  },
  paused: {
    defaultLabel: '已暂停',
    icon: Pause,
    colorClass: 'border-gray-200 bg-transparent',
    borderClass: 'border-gray-200',
    textClass: 'text-foreground',
    iconClass: 'text-blue-500',
  },
  running: {
    defaultLabel: '运行中',
    icon: Play,
    colorClass: 'border-gray-200 bg-transparent',
    borderClass: 'border-gray-200',
    textClass: 'text-foreground',
    iconClass: 'text-emerald-500',
  },
  loading: {
    defaultLabel: '加载中',
    icon: Loader2,
    colorClass: 'border-gray-200 bg-transparent',
    borderClass: 'border-gray-200',
    textClass: 'text-foreground',
    iconClass: 'text-purple-500 animate-spin',
  },
};

const statusConfig = computed(() => statusConfigs[props.status]);
const currentLabel = computed(
  () => props.customLabel || statusConfig.value.defaultLabel
);

const sizeClasses = 'px-1.5 py-1 text-[10px] gap-1.5 flex items-center leading-none';
const iconSizes = 'w-[11px] h-[11px]';

const badgeClasses = computed(() =>
  [
    'inline-flex items-center rounded-md border border-border bg-transparent font-medium transition-all',
    sizeClasses,
  ].join(' ')
);

const iconClasses = computed(() =>
  [iconSizes, statusConfig.value.iconClass].join(' ')
);

const textClasses = computed(() => statusConfig.value.textClass);
</script> 