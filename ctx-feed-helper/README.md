# CTX Feed 左侧排列 v1.4.0

删除旧版，解压新版，在 chrome://extensions 开启开发者模式，加载直接包含 manifest.json 的文件夹。刷新 CTX 编辑页面，再点击插件“排列左侧六项”。

本版按用户新要求，仅修改唯一 MPN 行下面紧接的六行左侧字段：Manufacturer、GTIN、Color、Size of the item、Gender、Age Group。打开下拉框，通过搜索框查找并点击目标。不会新增行，不操作右侧 Source、Value、Output，不填写 File name，不保存表单。

原有六行的左侧字段将被替换；右侧由 CTX 自身随左侧选择发生的联动变化不在插件控制范围内，请检查后手动保存。其他位置已有同名字段会提示，不删除。找不到 MPN、行数不足或选择失败会停止，已完成的修改保留。

已在 Chromium 模拟页面测试；尚未在用户实际网站验证。仅在点击时访问当前标签页，无外部数据发送。

## 第二步：六项全部切换 Text

左侧选择逻辑 fill.js 保持 v1.3 原样。新增独立 text.js 及第二步按钮：验证唯一 MPN 下方六项顺序，然后只将这六行 Source 切换为 Text，不写入 Value、不操作 Output、不保存。已处于 Text 时跳过以保留已有文本。切换模式可能触发 CTX 自身清空原 Attribute 值，请检查页面后手动保存。
