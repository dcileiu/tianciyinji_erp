// StatusBadge 组件支持的状态类型
export type StatusType =
  | "active"
  | "inactive"
  | "disabled"
  | "enabled"
  | "success"
  | "error"
  | "warning"
  | "pending"
  | "in-process"
  | "done"
  | "failed"
  | "paused"
  | "running"
  | "loading";

// 状态类型的中文映射
export const StatusLabels: Record<StatusType, string> = {
  active: "启用",
  inactive: "禁用",
  disabled: "禁用",
  enabled: "启用",
  success: "成功",
  error: "错误",
  warning: "警告",
  pending: "等待中",
  "in-process": "进行中",
  done: "已完成",
  failed: "失败",
  paused: "已暂停",
  running: "运行中",
  loading: "加载中",
};

// 状态颜色主题
export const StatusColors: Record<StatusType, string> = {
  active: "green",
  inactive: "red",
  disabled: "gray",
  enabled: "green",
  success: "green",
  error: "red",
  warning: "yellow",
  pending: "gray",
  "in-process": "orange",
  done: "green",
  failed: "red",
  paused: "blue",
  running: "emerald",
  loading: "purple",
};
