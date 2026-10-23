# CTX Feed 自动填写 Chrome 插件

在 Chrome 打开 `chrome://extensions`，打开开发者模式，点击“加载已解压的扩展程序”，选择本目录。

进入 WordPress → CTX Feed 编辑页面，点击插件，在“域名前缀 / 品牌”输入框填写所需前缀，再点击“自动填写并选择”。输入内容会原样填入 Manufacturer 品牌栏，不会自动更改大小写。

规则：Manufacturer → Text / 品牌；GTIN → Attribute / `_global_unique_id`；Color → Attribute / Color；Size → Attribute / Size；Gender → Text / unisex；Age Group → Text / adult。上述六行输出类型均选 Default。只修改这六行，不自动保存或生成 Feed。

插件仅在点击时访问当前标签页，不向外部发送数据。品牌及域名前缀保存在本机扩展存储。未找到字段或选项时逐项报告；可能已修改其他项目，请核对后保存。

兼容性：根据截图识别标准表格行及原生下拉框，尚未在你的真实网站验证。若 CTX Feed 版本使用不同结构、异步渲染或自定义下拉框，需要根据页面 DOM 调整。截图无法提供准确的 HTML 结构。
