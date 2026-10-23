# CTX Feed 自动填写 v1.2.0

Chrome 打开 chrome://extensions，开启开发者模式，加载本目录（必须直接包含 manifest.json）。更新时删除旧版，解压新版并重新加载。

在 CTX Feed 编辑页点击插件，输入域名前缀/品牌。此内容会原样写入 File name 和 Manufacturer。GTIN 选 Attribute / _global_unique_id；Color 选 Attribute / Color；Size 选 Attribute / Size；Gender 填 Text / unisex；Age Group 填 Text / adult。输出选择 Default。缺少字段时尝试通过 Add attribute 新增。不自动保存或生成 Feed。

支持原生 select 以及带 ARIA combobox/option 标识的自定义下拉框。已用 Chromium 模拟页面验证原生下拉框、自定义弹出下拉框、新增缺失字段及重复运行；尚未访问用户真实 WordPress 页面验证。不同版本可能使用其他结构，失败时逐项显示提示，部分字段可能已修改，请核对后保存。

仅在点击按钮时操作当前标签页，不发送站点数据到外部。输入内容保存在本机扩展存储中。

1.2：支持通过 Search or type a value 搜索框筛选选项，等待延迟结果，兼容无 ARIA 角色的选项，并检查点击后的选中标签。
