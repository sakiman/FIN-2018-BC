# FIN 政府標單或法人採購標案用印前檢核作業

![](https://img.shields.io/badge/Project-FIN--2018--BC-orange) ![](https://img.shields.io/badge/CSS-2891C8?logo=css3) ![](https://img.shields.io/badge/HTML-555?logo=htmlacademy) ![](https://img.shields.io/badge/JavaScript-555?logo=javascript) ![](https://img.shields.io/badge/Bootstrap-555?logo=reactbootstrap) ![](https://img.shields.io/badge/Font%20Awesome-purple?logo=fontawesome) ![](https://img.shields.io/badge/JSON-555?logo=json) ![](https://img.shields.io/badge/Mermaid-555?logo=mermaid) ![](https://img.shields.io/badge/Shields.io-555?logo=shieldsdotio) ![](https://img.shields.io/badge/Markdown-555?logo=markdown)

## 1. 專案結構和功能
- 這是一個用於政府標單或法人採購標案的印鑑用印前申請檢核表的網頁應用程式
- 使用純前端技術架構（HTML + CSS + JavaScript）
- 資料儲存在 [FIN-208-BC.json](https://github.com/sakiman/FIN-2018-BC/blob/main/docs/FIN-208-BC.json) 檔案中

## 2. index.html 分析
- 基本的 HTML5 結構
- 使用 Bootstrap 4.5.2 框架
- 引入 Font Awesome 圖示庫
- 使用 flatpickr 日期選擇器元件
- 主要包含一個樹狀視圖容器和一個新增按鈕

## 3. script.js 分析
- 實現樹狀結構的渲染和互動邏輯
- 主要功能包括：
  - 從 JSON 檔案載入資料
  - 動態建立簽核項目（createSignItem）
  - 處理樹狀結構的展開/摺疊
  - 處理簽核狀態的變更
  - 實現日期選擇和文字輸入功能
- 包含使用者互動邏輯，如選擇 Y/N/NA 後自動填充簽核者和日期

## 4. styles.css 分析
- 定義整體版面配置和樣式
- 實現樹狀結構的視覺效果
- 包含回應式設計元素
- 定義不同層級節點的樣式
- 包含動畫和轉場效果

## 5. FIN-208-BC.json 分析
- 定義檢核表的資料結構
- 使用多層巢狀結構表示檢查項目
- 每個節點包含以下屬性：
  - level：層級
  - title：標題
  - showflexstrings：是否顯示文字輸入
  - showflexdates：是否顯示日期選擇
  - signchildren：簽核子項
  - children：子檢查項

## 6. 主要特點
- 多層級樹狀結構展示
- 支援 Y/N/NA 選擇
- 自動記錄簽核者和時間
- 支援文字輸入和日期選擇
- 父子項聯動（父項未選擇時子項停用）
- 回應式設計

## 7. 可能的改進空間
- 可以新增資料持久化功能
- 可以新增匯出/列印功能
- 可以增加使用者認證機制
- 可以新增表單驗證
- 可以最佳化行動裝置體驗

## 8. Resource

- [Markdown](https://markdown.tw/)
- [Mermaid](https://mermaid.js.org/)
- [Shields.io](https://shields.io/)
- [Simple-icons badge slug](https://github.com/simple-icons/simple-icons/blob/master/slugs.md)
- [JSON Edior Online](https://jsoneditoronline.org/images/logo.png)
