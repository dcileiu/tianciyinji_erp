// StatusBadge 组件支持的状态类型
export type StatusType =
  | "in-process"
  | "done"
  | "failed"
  | "pending"
  | "paused"
  | "running"
  | "warning"
  | "loading";

// 状态类型的中文映射
export const StatusLabels: Record<StatusType, string> = {
  "in-process": "进行中",
  done: "已完成",
  failed: "失败",
  pending: "等待中",
  paused: "已暂停",
  running: "运行中",
  warning: "警告",
  loading: "加载中",
};

// 状态颜色主题
export const StatusColors: Record<StatusType, string> = {
  "in-process": "orange",
  done: "green",
  failed: "red",
  pending: "gray",
  paused: "blue",
  running: "emerald",
  warning: "yellow",
  loading: "purple",
};
