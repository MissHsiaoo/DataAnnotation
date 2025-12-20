# Auto-Save Configuration Guide / 自动保存配置指南

## Overview / 概览

The auto-save system protects your annotation work by automatically saving all changes to browser localStorage. Even if your internet connection fails or the browser crashes, your work is safe and will be restored when you reload the same file.

自动保存系统通过将所有更改自动保存到浏览器本地存储来保护您的标注工作。即使网络连接失败或浏览器崩溃，您的工作也是安全的，并会在重新加载同一文件时恢复。

---

## Configuration File / 配置文件

**Location:** `/config/auto-save-config.ts`

**位置:** `/config/auto-save-config.ts`

---

## Configuration Options / 配置选项

### 1. `enabled` (boolean)
**Default:** `true`

Enable or disable the entire auto-save system.

启用或禁用整个自动保存系统。

```typescript
enabled: true  // Auto-save is active
enabled: false // Auto-save is disabled
```

---

### 2. `storageKeyPrefix` (string)
**Default:** `"intent-memory-annotations"`

Prefix for localStorage keys. Each file's backup is stored with a key like:
`{storageKeyPrefix}-{fileName}`

本地存储键的前缀。每个文件的备份以如下键存储：
`{storageKeyPrefix}-{fileName}`

```typescript
storageKeyPrefix: "intent-memory-annotations"
// Results in: "intent-memory-annotations-data.json"
```

---

### 3. `autoRestore` (boolean)
**Default:** `true`

Automatically restore modifications when loading a file with existing backups.

加载具有现有备份的文件时自动恢复修改。

```typescript
autoRestore: true  // Automatically restore backups
autoRestore: false // Never restore, always start fresh
```

---

### 4. `showSaveIndicator` (boolean)
**Default:** `true`

Display the "Auto-saved locally at HH:MM:SS" indicator in the UI.

在UI中显示"本地自动保存于 HH:MM:SS"指示器。

```typescript
showSaveIndicator: true  // Show save time
showSaveIndicator: false // Hide indicator
```

---

### 5. `debounceDelay` (number, milliseconds)
**Default:** `0`

Delay before saving changes. Set to 0 for immediate save, or higher to reduce storage writes.

保存更改前的延迟。设置为0表示立即保存，设置更高值可减少存储写入次数。

```typescript
debounceDelay: 0     // Save immediately (default)
debounceDelay: 2000  // Wait 2 seconds before saving
```

**Note:** Currently not implemented. Future feature.

**注意:** 当前未实现。未来功能。

---

### 6. `maxBackupFiles` (number)
**Default:** `10`

Maximum number of backup files to keep in localStorage. When exceeded, oldest backups are automatically deleted.

本地存储中保留的最大备份文件数。超过时，最旧的备份将被自动删除。

```typescript
maxBackupFiles: 10  // Keep up to 10 file backups
maxBackupFiles: 3   // Keep only 3 file backups
maxBackupFiles: 0   // Disable automatic cleanup
```

---

### 7. `clearAfterDownload` (boolean)
**Default:** `false`

Automatically clear localStorage backup after successfully downloading the annotated file.

成功下载标注文件后自动清除本地存储备份。

```typescript
clearAfterDownload: false // Keep backup even after download (safer)
clearAfterDownload: true  // Auto-delete backup after download
```

---

### 8. `confirmBeforeRestore` (boolean)
**Default:** `true`

Show confirmation dialog before restoring from localStorage.

从本地存储恢复前显示确认对话框。

```typescript
confirmBeforeRestore: true  // Ask user before restoring
confirmBeforeRestore: false // Restore silently
```

**Note:** Currently not implemented. Future feature.

**注意:** 当前未实现。未来功能。

---

### 9. `quotaWarningThreshold` (number, bytes)
**Default:** `4194304` (4MB)

Show warning when localStorage usage exceeds this value. Most browsers limit localStorage to 5-10MB.

当本地存储使用超过此值时显示警告。大多数浏览器将localStorage限制为5-10MB。

```typescript
quotaWarningThreshold: 4 * 1024 * 1024  // 4MB
quotaWarningThreshold: 8 * 1024 * 1024  // 8MB
```

---

### 10. `includeMetadata` (boolean)
**Default:** `true`

Include metadata (userId, fileName, timestamp, totalSessions) in the backup.

在备份中包含元数据（用户ID、文件名、时间戳、总会话数）。

```typescript
includeMetadata: true  // Save metadata (recommended)
includeMetadata: false // Only save modifications (smaller size)
```

---

### 11. `enableCompression` (boolean)
**Default:** `false`

Enable compression for localStorage data to save space.

启用本地存储数据压缩以节省空间。

```typescript
enableCompression: false // No compression (default)
enableCompression: true  // Compress data (not implemented yet)
```

**Note:** Currently not implemented. Future feature.

**注意:** 当前未实现。未来功能。

---

## Configuration Presets / 配置预设

You can use predefined configuration presets in `/config/auto-save-config.ts`:

您可以使用`/config/auto-save-config.ts`中的预定义配置预设：

### `maxSafety` - Maximum Safety / 最大安全
```typescript
{
  debounceDelay: 0,
  confirmBeforeRestore: true,
  clearAfterDownload: false
}
```
**Use when:** You want maximum data protection.
**适用于:** 需要最大数据保护。

---

### `performance` - Performance Optimized / 性能优化
```typescript
{
  debounceDelay: 2000,
  showSaveIndicator: false
}
```
**Use when:** You're working with very large files and want to reduce storage writes.
**适用于:** 处理非常大的文件并希望减少存储写入。

---

### `minimalStorage` - Minimal Storage / 最小存储
```typescript
{
  maxBackupFiles: 3,
  clearAfterDownload: true,
  includeMetadata: false
}
```
**Use when:** localStorage space is limited.
**适用于:** 本地存储空间有限。

---

### `disabled` - Disabled / 禁用
```typescript
{
  enabled: false,
  autoRestore: false,
  showSaveIndicator: false
}
```
**Use when:** You don't want any auto-save functionality.
**适用于:** 不需要任何自动保存功能。

---

## How to Change Configuration / 如何更改配置

### Method 1: Edit Default Configuration / 方法1：编辑默认配置

Open `/config/auto-save-config.ts` and modify `defaultAutoSaveConfig`:

打开`/config/auto-save-config.ts`并修改`defaultAutoSaveConfig`：

```typescript
export const defaultAutoSaveConfig: AutoSaveConfig = {
  enabled: true,
  storageKeyPrefix: 'my-custom-prefix',
  autoRestore: true,
  showSaveIndicator: true,
  // ... modify other options
};
```

---

### Method 2: Use a Preset / 方法2：使用预设

In `/config/auto-save-config.ts`, replace the default export:

在`/config/auto-save-config.ts`中，替换默认导出：

```typescript
// Change from:
export let currentAutoSaveConfig: AutoSaveConfig = { ...defaultAutoSaveConfig };

// To:
export let currentAutoSaveConfig: AutoSaveConfig = { ...autoSavePresets.minimalStorage };
```

---

### Method 3: Runtime Update (Advanced) / 方法3：运行时更新（高级）

You can programmatically update configuration at runtime:

您可以在运行时以编程方式更新配置：

```typescript
import { updateAutoSaveConfig } from './config/auto-save-config';

// Update specific options
updateAutoSaveConfig({
  maxBackupFiles: 5,
  clearAfterDownload: true
});

// Or apply a preset
import { autoSavePresets } from './config/auto-save-config';
updateAutoSaveConfig(autoSavePresets.performance);
```

---

## Utility Functions / 实用函数

### `getStorageKey(fileName)`
Get the localStorage key for a specific file.

获取特定文件的本地存储键。

```typescript
import { getStorageKey } from './config/auto-save-config';

const key = getStorageKey('data.json');
// Returns: "intent-memory-annotations-data.json"
```

---

### `getAllStorageKeys()`
Get all auto-save keys from localStorage.

从本地存储获取所有自动保存键。

```typescript
import { getAllStorageKeys } from './config/auto-save-config';

const keys = getAllStorageKeys();
// Returns: ["intent-memory-annotations-file1.json", "intent-memory-annotations-file2.json"]
```

---

### `cleanupOldBackups()`
Manually trigger cleanup of old backups.

手动触发旧备份的清理。

```typescript
import { cleanupOldBackups } from './config/auto-save-config';

const deletedCount = cleanupOldBackups();
console.log(`Deleted ${deletedCount} old backups`);
```

---

### `checkStorageQuota()`
Check if localStorage is approaching quota limit.

检查本地存储是否接近配额限制。

```typescript
import { checkStorageQuota } from './config/auto-save-config';

const { isNearLimit, estimatedUsage, warning } = checkStorageQuota();
if (isNearLimit) {
  console.warn(warning);
}
```

---

## Best Practices / 最佳实践

### 1. Keep `enabled: true` / 保持`enabled: true`
Always keep auto-save enabled unless you have a specific reason to disable it. It protects against data loss.

除非有特定原因，否则始终保持自动保存启用。它可以防止数据丢失。

---

### 2. Monitor Storage Usage / 监控存储使用
If you're working with many large files, periodically check localStorage usage and clean up old backups.

如果您正在处理许多大型文件，请定期检查本地存储使用情况并清理旧备份。

---

### 3. Don't Set `clearAfterDownload: true` Unless Necessary / 除非必要，不要设置`clearAfterDownload: true`
Keeping backups even after download provides an extra safety net.

即使在下载后也保留备份可提供额外的安全保障。

---

### 4. Use `maxBackupFiles` to Prevent Storage Overflow / 使用`maxBackupFiles`防止存储溢出
Set a reasonable limit (default 10) to prevent localStorage from filling up.

设置合理限制（默认10）以防止本地存储填满。

---

### 5. Regular Backups to External Storage / 定期备份到外部存储
localStorage is not a permanent storage solution. Always download your final annotated files.

本地存储不是永久存储解决方案。始终下载您的最终标注文件。

---

## Troubleshooting / 故障排除

### Issue: "Failed to auto-save locally. Storage may be full."
**Solution:** 
1. Clear old backups using the "Clear Local Backup" button
2. Reduce `maxBackupFiles` in configuration
3. Enable `clearAfterDownload: true`

**解决方案:**
1. 使用"清除本地备份"按钮清除旧备份
2. 在配置中减少`maxBackupFiles`
3. 启用`clearAfterDownload: true`

---

### Issue: Backups not restoring
**Solution:**
1. Check that `autoRestore: true` is set
2. Verify the file name matches exactly (case-sensitive)
3. Check browser console for errors

**解决方案:**
1. 检查`autoRestore: true`是否已设置
2. 验证文件名完全匹配（区分大小写）
3. 检查浏览器控制台是否有错误

---

### Issue: Storage quota warning
**Solution:**
1. Download and clear old backups
2. Reduce `maxBackupFiles`
3. Disable `includeMetadata` if size is critical

**解决方案:**
1. 下载并清除旧备份
2. 减少`maxBackupFiles`
3. 如果大小至关重要，禁用`includeMetadata`

---

## Technical Details / 技术细节

### Storage Structure / 存储结构

Each backup in localStorage contains:

每个本地存储备份包含：

```json
{
  "modifications": [
    [sessionIndex, modifiedSessionData],
    ...
  ],
  "userId": "unknown_user",
  "timestamp": "2025-12-18T14:32:15.123Z",
  "fileName": "data.json",
  "totalSessions": 100
}
```

### Storage Key Format / 存储键格式

```
{storageKeyPrefix}-{fileName}

Example: "intent-memory-annotations-dataset.json"
```

### Size Estimates / 大小估算

- **Small file (10 sessions):** ~50KB
- **Medium file (100 sessions):** ~500KB
- **Large file (1000 sessions):** ~5MB

**Note:** With metadata and modifications, actual size varies.

**注意:** 包含元数据和修改，实际大小会有所不同。

---

## Future Features / 未来功能

- ✅ Basic auto-save (implemented)
- ✅ Auto-restore (implemented)
- ✅ Quota checking (implemented)
- ⏳ Debounce delay (planned)
- ⏳ Confirm before restore dialog (planned)
- ⏳ Data compression (planned)
- ⏳ Export/import backups (planned)

---

For questions or issues, check the main project README or Guidelines.md.

如有问题或疑问，请查看主项目README或Guidelines.md。
