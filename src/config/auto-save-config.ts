/**
 * Auto-Save Configuration / 自动保存配置
 * 
 * Controls local storage auto-save behavior for annotation data.
 * 控制标注数据的本地存储自动保存行为。
 */

export interface AutoSaveConfig {
  /**
   * Enable/disable auto-save to localStorage
   * 启用/禁用自动保存到本地存储
   */
  enabled: boolean;

  /**
   * localStorage key prefix
   * 本地存储键前缀
   */
  storageKeyPrefix: string;

  /**
   * Auto-restore modifications when loading the same file
   * 加载相同文件时自动恢复修改
   */
  autoRestore: boolean;

  /**
   * Show auto-save timestamp indicator
   * 显示自动保存时间戳指示器
   */
  showSaveIndicator: boolean;

  /**
   * Debounce delay for auto-save (in milliseconds)
   * 自动保存的防抖延迟（毫秒）
   * 
   * Set to 0 for immediate save, or higher value to reduce storage writes
   * 设置为0表示立即保存，更高的值可减少存储写入次数
   */
  debounceDelay: number;

  /**
   * Maximum number of backup files to keep in localStorage
   * 本地存储中保留的最大备份文件数
   * 
   * When exceeded, oldest backups are deleted
   * 超过此数量时，最旧的备份将被删除
   */
  maxBackupFiles: number;

  /**
   * Automatically clear localStorage backup after successful download
   * 成功下载后自动清除本地存储备份
   */
  clearAfterDownload: boolean;

  /**
   * Show confirmation dialog before restoring from localStorage
   * 从本地存储恢复前显示确认对话框
   */
  confirmBeforeRestore: boolean;

  /**
   * Storage quota warning threshold (in bytes)
   * 存储配额警告阈值（字节）
   * 
   * Show warning when localStorage usage exceeds this value
   * 当本地存储使用超过此值时显示警告
   */
  quotaWarningThreshold: number;

  /**
   * Include metadata in backup (userId, fileName, timestamp, etc.)
   * 备份中包含元数据（用户ID、文件名、时间戳等）
   */
  includeMetadata: boolean;

  /**
   * Enable compression for localStorage data
   * 启用本地存储数据压缩
   * 
   * Note: Requires additional processing, may impact performance
   * 注意：需要额外处理，可能影响性能
   */
  enableCompression: false; // Currently not implemented
}

/**
 * Default auto-save configuration
 * 默认自动保存配置
 */
export const defaultAutoSaveConfig: AutoSaveConfig = {
  enabled: true,
  storageKeyPrefix: 'intent-memory-annotations',
  autoRestore: true,
  showSaveIndicator: true,
  debounceDelay: 0, // Save immediately
  maxBackupFiles: 10,
  clearAfterDownload: false, // Keep backup even after download for safety
  confirmBeforeRestore: true,
  quotaWarningThreshold: 4 * 1024 * 1024, // 4MB (localStorage usually has 5-10MB limit)
  includeMetadata: true,
  enableCompression: false
};

/**
 * Custom configuration presets
 * 自定义配置预设
 */
export const autoSavePresets = {
  /**
   * Maximum safety: Frequent saves, always confirm restore
   * 最大安全：频繁保存，始终确认恢复
   */
  maxSafety: {
    ...defaultAutoSaveConfig,
    debounceDelay: 0,
    confirmBeforeRestore: true,
    clearAfterDownload: false
  },

  /**
   * Performance optimized: Reduced save frequency
   * 性能优化：减少保存频率
   */
  performance: {
    ...defaultAutoSaveConfig,
    debounceDelay: 2000, // 2 second delay
    showSaveIndicator: false
  },

  /**
   * Minimal storage: Fewer backups, auto-clear after download
   * 最小存储：更少备份，下载后自动清除
   */
  minimalStorage: {
    ...defaultAutoSaveConfig,
    maxBackupFiles: 3,
    clearAfterDownload: true,
    includeMetadata: false
  },

  /**
   * Disabled: No auto-save functionality
   * 禁用：无自动保存功能
   */
  disabled: {
    ...defaultAutoSaveConfig,
    enabled: false,
    autoRestore: false,
    showSaveIndicator: false
  }
};

/**
 * Get localStorage key for a specific file
 * 获取特定文件的本地存储键
 */
export function getStorageKey(fileName: string, config: AutoSaveConfig = defaultAutoSaveConfig): string {
  return `${config.storageKeyPrefix}-${fileName}`;
}

/**
 * Get all auto-save keys from localStorage
 * 从本地存储获取所有自动保存键
 */
export function getAllStorageKeys(config: AutoSaveConfig = defaultAutoSaveConfig): string[] {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(config.storageKeyPrefix)) {
      keys.push(key);
    }
  }
  return keys;
}

/**
 * Clean up old backups based on maxBackupFiles setting
 * 根据maxBackupFiles设置清理旧备份
 */
export function cleanupOldBackups(config: AutoSaveConfig = defaultAutoSaveConfig): number {
  const allKeys = getAllStorageKeys(config);
  
  if (allKeys.length <= config.maxBackupFiles) {
    return 0; // No cleanup needed
  }

  // Get timestamps for all backups
  const backupsWithTimestamp = allKeys.map(key => {
    try {
      const data = localStorage.getItem(key);
      if (!data) return null;
      const parsed = JSON.parse(data);
      return {
        key,
        timestamp: new Date(parsed.timestamp || 0).getTime()
      };
    } catch {
      return null;
    }
  }).filter(item => item !== null) as { key: string; timestamp: number }[];

  // Sort by timestamp (oldest first)
  backupsWithTimestamp.sort((a, b) => a.timestamp - b.timestamp);

  // Delete oldest backups
  const toDelete = backupsWithTimestamp.length - config.maxBackupFiles;
  let deletedCount = 0;

  for (let i = 0; i < toDelete; i++) {
    try {
      localStorage.removeItem(backupsWithTimestamp[i].key);
      deletedCount++;
    } catch (error) {
      console.error('Failed to delete old backup:', error);
    }
  }

  return deletedCount;
}

/**
 * Check if localStorage usage is approaching quota limit
 * 检查本地存储使用量是否接近配额限制
 */
export function checkStorageQuota(config: AutoSaveConfig = defaultAutoSaveConfig): {
  isNearLimit: boolean;
  estimatedUsage: number;
  warning?: string;
} {
  let estimatedUsage = 0;

  try {
    // Estimate localStorage usage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        if (value) {
          estimatedUsage += key.length + value.length;
        }
      }
    }

    const isNearLimit = estimatedUsage >= config.quotaWarningThreshold;

    return {
      isNearLimit,
      estimatedUsage,
      warning: isNearLimit 
        ? `LocalStorage usage (${(estimatedUsage / 1024 / 1024).toFixed(2)}MB) is approaching limit. Consider clearing old backups.`
        : undefined
    };
  } catch (error) {
    console.error('Failed to check storage quota:', error);
    return {
      isNearLimit: false,
      estimatedUsage: 0
    };
  }
}

/**
 * Export current configuration
 * 导出当前配置
 */
export let currentAutoSaveConfig: AutoSaveConfig = { ...defaultAutoSaveConfig };

/**
 * Update auto-save configuration
 * 更新自动保存配置
 */
export function updateAutoSaveConfig(newConfig: Partial<AutoSaveConfig>): void {
  currentAutoSaveConfig = {
    ...currentAutoSaveConfig,
    ...newConfig
  };
  console.log('Auto-save configuration updated:', currentAutoSaveConfig);
}

/**
 * Reset to default configuration
 * 重置为默认配置
 */
export function resetAutoSaveConfig(): void {
  currentAutoSaveConfig = { ...defaultAutoSaveConfig };
  console.log('Auto-save configuration reset to default');
}
