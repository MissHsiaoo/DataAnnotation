export interface MemoryCategory {
  id: string;
  name: string;
  shortcut?: string;
  color: string;
  textColor: string;
  keyPrefix: string;
}

export interface MemoryConfig {
  memoryCategories: MemoryCategory[];
  defaultCategory: MemoryCategory;
}

const memoryConfig: MemoryConfig = {
  memoryCategories: [
    {
      id: "identity",
      name: "Identity",
      shortcut: "1",
      color: "rgba(255, 182, 193, 0.3)",
      textColor: "rgb(219, 39, 119)",
      keyPrefix: "Identity"
    },
    {
      id: "activity",
      name: "Activity",
      shortcut: "2",
      color: "rgba(254, 240, 138, 0.3)",
      textColor: "rgb(202, 138, 4)",
      keyPrefix: "Activity"
    },
    {
      id: "preferences",
      name: "Preferences",
      shortcut: "3",
      color: "rgba(191, 219, 254, 0.3)",
      textColor: "rgb(37, 99, 235)",
      keyPrefix: "Preferences"
    },
    {
      id: "belongings",
      name: "Belongings",
      shortcut: "4",
      color: "rgba(187, 247, 208, 0.3)",
      textColor: "rgb(22, 163, 74)",
      keyPrefix: "Belongings"
    },
    {
      id: "relationships",
      name: "Relationships",
      shortcut: "5",
      color: "rgba(254, 215, 170, 0.3)",
      textColor: "rgb(234, 88, 12)",
      keyPrefix: "Relationships"
    },
    {
      id: "unmapping",
      name: "Unmapping",
      shortcut: "6",
      color: "rgba(203, 213, 225, 0.35)",
      textColor: "rgb(71, 85, 105)",
      keyPrefix: "Unmapping"
    }
  ],
  defaultCategory: {
    id: "uncategorized",
    name: "Uncategorized",
    color: "rgba(196, 181, 253, 0.3)",
    textColor: "rgb(109, 40, 217)",
    keyPrefix: "Memory"
  }
};

export default memoryConfig;
