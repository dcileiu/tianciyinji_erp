export type MasterField = {
  key: string;
  label: string;
  type?: "text" | "number" | "select" | "textarea";
  required?: boolean;
  options?: Array<{ label: string; value: string }>;
  placeholder?: string;
};
