export interface Tag {
  id: string;
  name: string;
  color: string;
  usageCount: number;
  updated: string;
}

export const COLOR_PALETTE = [
  "#212121", "#424242", "#616161", "#757575", "#9E9E9E", "#BDBDBD", "#E0E0E0", "#F5F5F5",
  "#D32F2F", "#E53935", "#F44336", "#EF5350", "#E57373", "#EF9A9A", "#FFCDD2", "#FFEBEE",
  "#C62828", "#AD1457", "#880E4F", "#E91E63", "#EC407A", "#F48FB1", "#F8BBD0", "#FCE4EC",
  "#6A1B9A", "#7B1FA2", "#8E24AA", "#9C27B0", "#AB47BC", "#CE93D8", "#E1BEE7", "#F3E5F5",
  "#283593", "#1565C0", "#1976D2", "#1E88E5", "#2196F3", "#64B5F6", "#90CAF9", "#BBDEFB",
  "#00695C", "#00897B", "#009688", "#26A69A", "#4DB6AC", "#80CBC4", "#B2DFDB", "#E0F2F1",
  "#1B5E20", "#2E7D32", "#388E3C", "#43A047", "#4CAF50", "#81C784", "#A5D6A7", "#C8E6C9",
  "#E65100", "#EF6C00", "#F57C00", "#FB8C00", "#FFA726", "#FFCC80", "#FFE0B2", "#FFF3E0",
  "#F57F17", "#F9A825", "#FBC02D", "#FFEB3B", "#FFF176", "#FFF59D", "#FFF9C4", "#FFFDE7",
  "#4E342E", "#5D4037", "#6D4C41", "#795548", "#8D6E63", "#A1887F", "#BCAAA4", "#D7CCC8",
];

export const NEEDS_ATTENTION_TAG: Tag = {
  id: "needs-attention",
  name: "Needs Attention",
  color: "#df4397",
  usageCount: 12,
  updated: "Apr 10, 2026 12:00 PM",
};

export const initialTags: Tag[] = [
  NEEDS_ATTENTION_TAG,
  { id: "tag-1", name: "Invoice Management", color: "#2E95BE", usageCount: 1, updated: "Jan 6, 2026 5:00 PM" },
  { id: "tag-2", name: "Expense Reports", color: "#E53935", usageCount: 2, updated: "Jan 6, 2026 4:41 PM" },
  { id: "tag-3", name: "Client Invoices", color: "#F9A825", usageCount: 10, updated: "Dec 16, 2025 2:58 PM" },
  { id: "tag-4", name: "Transaction History", color: "#2E7D32", usageCount: 20, updated: "Dec 1, 2025 12:28 PM" },
  { id: "tag-5", name: "Due Date Reminders", color: "#E53935", usageCount: 4, updated: "Oct 15, 2025 6:30 AM" },
  { id: "tag-6", name: "Invoice Templates", color: "#9C27B0", usageCount: 5, updated: "Oct 15, 2025 5:51 AM" },
  { id: "tag-7", name: "Payment Tracking", color: "#E53935", usageCount: 1, updated: "Oct 15, 2025 4:40 AM" },
  { id: "tag-8", name: "Billing Overview", color: "#00897B", usageCount: 1, updated: "Oct 15, 2025 3:54 AM" },
  { id: "tag-9", name: "Financial Summary", color: "#43A047", usageCount: 1, updated: "Oct 15, 2025 3:47 AM" },
  { id: "tag-10", name: "Payment Methods", color: "#43A047", usageCount: 1, updated: "Oct 10, 2025 10:18 AM" },
];
