# ID 生成策略說明文檔

![](https://img.shields.io/badge/Project-FIN--2018--BC-orange)
![](https://img.shields.io/badge/CSS-2891C8?logo=css3)
![](https://img.shields.io/badge/HTML-555?logo=htmlacademy)
![](https://img.shields.io/badge/JavaScript-555?logo=javascript)
![](https://img.shields.io/badge/Bootstrap-555?logo=reactbootstrap)
![](https://img.shields.io/badge/Font%20Awesome-purple?logo=fontawesome)
![](https://img.shields.io/badge/JSON-555?logo=json)
![](https://img.shields.io/badge/Flatpickr-777)
![](https://img.shields.io/badge/Prism--JSON--Highlight-2891C8)

## 目的
### 使得將來實現數據回寫 JSON 時會更加容易和可靠
- ID 基於數據結構生成，所以相同的節點每次渲染都會得到相同的 ID
- ID 更有意義，包含了節點的層級和位置信息
- 即使 JSON 內容變化，只要節點的基本特徵（層級、ID、索引）保持不變，ID 就會保持一致
- 便於調試和追蹤特定元素
- 可保存成完整的標案 JSON 文檔

## 節點路徑生成函數 (getNodePath)

```javascript
const getNodePath = (node) => {
    let path = [];
    if (node.signlevel) path.push(`L${node.signlevel}`);
    if (node.level) path.push(`N${node.level}`);
    if (typeof node.index !== 'undefined') path.push(`I${node.index}`);
    return path.join('-');
};
```

### 路徑組成
- `L`: signlevel 的前綴，表示簽核層級
- `N`: level 的前綴，表示節點層級
- `I`: index 的前綴，表示節點索引

例如：`L1-N2-I0` 表示：
- 簽核層級 (signlevel) 為 1
- 節點層級 (level) 為 2
- 節點索引 (index) 為 0

## Dataset 屬性使用

### dataset.nodePath
為了方便追蹤和回寫數據，我們在 DOM 元素上使用 `dataset.nodePath` 保存節點路徑：

```javascript
element.dataset.nodePath = nodeId;
```

這樣可以直接從 DOM 元素獲取節點路徑 (追蹤每個簽核項目的完整路徑)，例如：
```javascript
const nodePath = element.dataset.nodePath;  // 例如：'L1-N2-I0'
```

## 已添加唯一 ID 的元件

### ID 格式說明
所有元素的 ID 都基於 nodeId 生成，格式為：`[元素類型]-[nodeId]`
例如，對於 nodeId = "L1-N2-I0"：
- 文字輸入框：`flex-L1-N2-I0` : `(flex-[層級]-[ID]-[索引])`
- 下拉選單：`select-L1-N2-I0` : `(select-[層級]-[ID]-[索引])`
- 簽核者欄位：`signer-L1-N2-I0` : `(signer-[層級]-[ID]-[索引])`
- 日期欄位：`date-L1-N2-I0` : `(date-[層級]-[ID]-[索引])`

### ID 格式規範

為了確保 ID 的一致性和可追蹤性，我們應該遵循以下規則：

1. 簽核層級格式：
   - 初審：使用 `L1`
   - 複審：使用 `L1-2`（不要使用 `LN1-2`）
   - 未來如有三審：使用 `L1-3`（依此類推）

2. ID 組成順序：
   ```
   [元素類型]-L[簽核層級]-N[節點層級]-I[索引]
   ```
   
3. 範例說明：
   - 初審下拉選單：`select-L1-N5-I0`
   - 複審下拉選單：`select-L1-2-N5-I0`
   - ❌ 錯誤格式：`select-LN1-2-N5-I0`（不要使用）

4. 優點：
   - 保持格式一致性
   - 便於程式解析
   - 確保資料回寫準確性
   - 減少維護成本

### 實際案例："實驗室名稱" 和 "有效日期"

#### 1. "有效日期" 節點
位於 JSON 中的 "有效日期" 節點：
- 層級：level = "5"
- 初審層級：signlevel = "1"
- 複審層級：signlevel = "1-2"
- 索引位置：為第一個子節點，index = 0

其相關元素的 ID：
初審相關：
- 文字輸入框：`flex-L1-N5-I0`
- 下拉選單：`select-L1-N5-I0`
- 簽核者欄位：`signer-L1-N5-I0`
- 日期欄位：`date-L1-N5-I0`

複審相關：
- 下拉選單：`select-L1-2-N5-I0`
- 簽核者欄位：`signer-L1-2-N5-I0`
- 日期欄位：`date-L1-2-N5-I0`

JSON 中的簽核資訊：
```json
{
  "title": "有效日期",
  "signchildren": [
    {
      "show": "Y",
      "signlevel": "1",
      "Y/N/NA": "Y",
      "signer": "王小明",
      "signdate": "2024-12-19",
      "signchildren": [
        {
          "show": "Y",
          "signlevel": "1-2",
          "Y/N/NA": "Y",
          "signer": "李大華",
          "signdate": "2024-12-19",
          "signchildren": []
        }
      ]
    }
  ]
}
```

#### 2. "實驗室名稱" 節點
位於 JSON 中的 "實驗室名稱" 節點：
- 層級：level = "5"
- 初審層級：signlevel = "1"
- 複審層級：signlevel = "1-2"
- 索引位置：為第二個子節點，index = 1

其相關元素的 ID：
初審相關：
- 文字輸入框：`flex-L1-N5-I1`
- 下拉選單：`select-L1-N5-I1`
- 簽核者欄位：`signer-L1-N5-I1`
- 日期欄位：`date-L1-N5-I1`

複審相關：
- 下拉選單：`select-L1-2-N5-I1`
- 簽核者欄位：`signer-L1-2-N5-I1`
- 日期欄位：`date-L1-2-N5-I1`

JSON 中的簽核資訊：
```json
{
  "title": "實驗室名稱",
  "signchildren": [
    {
      "show": "Y",
      "signlevel": "1",
      "Y/N/NA": "Y",
      "signer": "王小明",
      "signdate": "2024-12-19",
      "signchildren": [
        {
          "show": "Y",
          "signlevel": "1-2",
          "Y/N/NA": "Y",
          "signer": "李大華",
          "signdate": "2024-12-19",
          "signchildren": []
        }
      ]
    }
  ]
}
```

### 使用這些 ID 的示例：
```javascript
// 有效日期相關操作
// 初審
const validDateInput = document.getElementById('flex-L1-N5-I0').value;
const validDateApprovalStatus = document.getElementById('select-L1-N5-I0').value;
const validDateApprover = document.getElementById('signer-L1-N5-I0').textContent;
const validDateApprovalDate = document.getElementById('date-L1-N5-I0').textContent;

// 複審
const validDateSecondApprovalStatus = document.getElementById('select-L1-2-N5-I0').value;
const validDateSecondApprover = document.getElementById('signer-L1-2-N5-I0').textContent;
const validDateSecondApprovalDate = document.getElementById('date-L1-2-N5-I0').textContent;

// 實驗室名稱相關操作
// 初審
const labNameInput = document.getElementById('flex-L1-N5-I1').value;
const labApprovalStatus = document.getElementById('select-L1-N5-I1').value;
const labApprover = document.getElementById('signer-L1-N5-I1').textContent;
const labApprovalDate = document.getElementById('date-L1-N5-I1').textContent;

// 複審
const labSecondApprovalStatus = document.getElementById('select-L1-2-N5-I1').value;
const labSecondApprover = document.getElementById('signer-L1-2-N5-I1').textContent;
const labSecondApprovalDate = document.getElementById('date-L1-2-N5-I1').textContent;

// 批量獲取所有審核狀態（包括初審和複審）
const allApprovalStatuses = [
    'L1-N5-I0', 'L1-2-N5-I0',  // 有效日期的初審和複審
    'L1-N5-I1', 'L1-2-N5-I1'   // 實驗室名稱的初審和複審
].map(nodeId => document.getElementById(`select-${nodeId}`).value);

// 設置簽核者和簽核日期
function setApprovalInfo(nodeId, signer, date) {
    document.getElementById(`signer-${nodeId}`).textContent = signer;
    document.getElementById(`date-${nodeId}`).textContent = date;
}

// 示例：設置有效日期的初審簽核資訊
setApprovalInfo('L1-N5-I0', '王小明', '2024-12-19');
// 示例：設置有效日期的複審簽核資訊
setApprovalInfo('L1-2-N5-I0', '李大華', '2024-12-19');
```

### 元件清單及其 ID 設置

1. 簽核項目容器
   ```javascript
   signItem.dataset.nodePath = nodeId;
   ```

2. 文字輸入框
   ```javascript
   flexInput.id = `flex-${nodeId}`;
   flexInput.dataset.nodePath = nodeId;
   ```

3. 下拉選單
   ```javascript
   select.id = `select-${nodeId}`;
   select.dataset.nodePath = nodeId;
   ```

4. 簽核者欄位
   ```javascript
   signerSpan.id = `signer-${nodeId}`;
   signerSpan.dataset.nodePath = nodeId;
   ```

5. 日期欄位
   ```javascript
   dateSpan.id = `date-${nodeId}`;
   dateSpan.dataset.nodePath = nodeId;
   ```

### ID 查找示例
```javascript
// 查找特定節點的文字輸入框
const flexInput = document.getElementById('flex-L1-N2-I0');

// 查找特定節點的下拉選單
const select = document.getElementById('select-L1-N2-I0');

// 查找特定節點的簽核者欄位
const signer = document.getElementById('signer-L1-N2-I0');

// 查找特定節點的日期欄位
const date = document.getElementById('date-L1-N2-I0');
```

## JSON 回寫功能的優勢

1. 精確定位節點
   - 可以通過 nodePath 快速找到對應的 DOM 元素：
     ```javascript
     const elements = document.querySelectorAll('[data-node-path="L1-N2-I0"]');
     ```

2. 數據追蹤
   - 每個簽核項目都有完整的路徑信息
   - 可以輕鬆追蹤數據的變化和來源
     ```javascript
     const nodePath = element.dataset.nodePath;  // 例如：'L1-N2-I0'
     ```

3. 數據回寫
   - 可以根據 nodePath 準確定位到 JSON 中對應的節點
   - 支持複雜的多層級節點結構
   - 便於實現數據的雙向綁定
     ```javascript
     function updateJSON(nodePath, data) {
         // 根據 nodePath 找到對應的 JSON 節點
         // 更新節點數據
         // 保存更新後的 JSON
     }
     ```

4. 維護性
   - ID 結構清晰，便於調試和維護
   - 支持 JSON 內容的動態變化
   - 確保數據一致性

## 使用示例

### 查找特定節點的元素
```javascript
// 查找特定路徑的所有相關元素
const elements = document.querySelectorAll('[data-node-path="L1-N2-I0"]');

// 查找特定類型的元素
const selectElement = document.querySelector('select[data-node-path="L1-N2-I0"]');
const signerElement = document.querySelector('span[id^="signer-"][data-node-path="L1-N2-I0"]');
```

### 數據回寫
```javascript
function updateJSON(nodePath, data) {
    // 根據 nodePath 找到對應的 JSON 節點
    const node = findNodeByPath(jsonData, nodePath);
    
    // 更新節點數據
    Object.assign(node, data);
    
    // 保存更新後的 JSON
    saveJSON(jsonData);
}
```
