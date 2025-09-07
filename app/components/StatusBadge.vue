<template>
  <div :class="badgeClasses">
    <component :is="statusConfig.icon" :class="iconClasses" />
    <span v-if="showLabel" :class="textClasses">{{ currentLabel }}</span>
  </div>
</template>

<script setup lang="ts">
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Pause, 
  Play, 
  Loader2
} from 'lucide-vue-next';

export type StatusType = 
  | 'in-process' 
  | 'done' 
  | 'failed' 
  | 'pending' 
  | 'paused' 
  | 'running' 
  | 'warning'
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
  size?: 'sm' | 'md' | 'lg';
  customLabel?: string;
  showLabel?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  showLabel: true,
});

const statusConfigs: Record<StatusType, StatusConfig> = {
  'in-process': {
    defaultLabel: 'In Process',
    icon: Clock,
    colorClass: 'border-orange-200 bg-orange-50',
    borderClass: 'border-orange-200',
    textClass: 'text-orange-700',
    iconClass: 'text-orange-500'
  },
  'done': {
    defaultLabel: 'Done',
    icon: CheckCircle,
    colorClass: 'border-green-200 bg-green-50',
    borderClass: 'border-green-200',
    textClass: 'text-green-700',
    iconClass: 'text-green-500'
  },
  'failed': {
    defaultLabel: 'Failed',
    icon: XCircle,
    colorClass: 'border-red-200 bg-red-50',
    borderClass: 'border-red-200',
    textClass: 'text-red-700',
    iconClass: 'text-red-500'
  },
  'pending': {
    defaultLabel: 'Pending',
    icon: AlertCircle,
    colorClass: 'border-gray-200 bg-gray-50',
    borderClass: 'border-gray-200',
    textClass: 'text-gray-700',
    iconClass: 'text-gray-500'
  },
  'paused': {
    defaultLabel: 'Paused',
    icon: Pause,
    colorClass: 'border-blue-200 bg-blue-50',
    borderClass: 'border-blue-200',
    textClass: 'text-blue-700',
    iconClass: 'text-blue-500'
  },
  'running': {
    defaultLabel: 'Running',
    icon: Play,
    colorClass: 'border-emerald-200 bg-emerald-50',
    borderClass: 'border-emerald-200',
    textClass: 'text-emerald-700',
    iconClass: 'text-emerald-500'
  },
  'warning': {
    defaultLabel: 'Warning',
    icon: AlertCircle,
    colorClass: 'border-yellow-200 bg-yellow-50',
    borderClass: 'border-yellow-200',
    textClass: 'text-yellow-700',
    iconClass: 'text-yellow-500'
  },
  'loading': {
    defaultLabel: 'Loading',
    icon: Loader2,
    colorClass: 'border-purple-200 bg-purple-50',
    borderClass: 'border-purple-200',
    textClass: 'text-purple-700',
    iconClass: 'text-purple-500 animate-spin'
  }
};

const statusConfig = computed(() => statusConfigs[props.status]);
const currentLabel = computed(() => props.customLabel || statusConfig.value.defaultLabel);

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-1.5 text-sm gap-1.5',
    lg: 'px-4 py-2 text-base gap-2'
  };
  return sizes[props.size];
});

const iconSizes = computed(() => {
  const sizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };
  return sizes[props.size];
});

const badgeClasses = computed(() => [
  'inline-flex items-center rounded-full border bg-transparent font-medium transition-all',
  sizeClasses.value,
  statusConfig.value.borderClass
].join(' '));

const iconClasses = computed(() => [
  iconSizes.value,
  statusConfig.value.iconClass
].join(' '));

const textClasses = computed(() => statusConfig.value.textClass);
</script> 