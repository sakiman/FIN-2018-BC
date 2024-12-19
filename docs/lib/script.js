// 格式化金額的函數
function formatAmount(value) {
    if (!value) return '';
    
    try {
        // 移除所有非數字和小數點的字符
        value = value.replace(/[^\d.]/g, '');
        
        // 分割整數和小數部分
        let [intPart, decPart] = value.split('.');
        
        // 處理整數部分（添加千分位）
        if (intPart.length > 3) {
            intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }
        
        // 如果有小數部分，限制為兩位
        if (decPart) {
            decPart = decPart.slice(0, 2);
            return `${intPart}.${decPart}`;
        }
        
        return intPart;
    } catch (error) {
        console.error('Error formatting amount:', error);
        return value; // 發生錯誤時返回原始值
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('./FIN-208-BC.json');
        const data = await response.json();
        const treeView = document.getElementById('treeView');
        renderTree(data, treeView);

        // 添加展開/收合按鈕的事件監聽器
        document.getElementById('expandAllButton').addEventListener('click', toggleAllNodes);

        // 添加按鈕點擊事件處理
        document.getElementById('addButton').addEventListener('click', async function () {
            try {
                async function createDateFolders() {
                    try {
                        const now = new Date();
                        const year = now.getFullYear();
                        const month = String(now.getMonth() + 1).padStart(2, '0');

                        // 只顯示訊息，因為在靜態網頁中無法創建實際的資料夾
                        alert(`在實際環境中會創建以下資料夾：\n${year}/${year}-${month}`);

                        // 如果需要，您可以將資料夾資訊儲存在 localStorage 中
                        const folders = JSON.parse(localStorage.getItem('createdFolders') || '[]');
                        folders.push(`${year}/${year}-${month}`);
                        localStorage.setItem('createdFolders', JSON.stringify(folders));

                    } catch (error) {
                        console.error('Error:', error);
                        alert('操作失敗：' + error.message);
                    }
                }
                await createDateFolders();
            } catch (error) {
                alert('錯誤：無法連接到服務器');
                console.error('Error:', error);
            }
        });

        // 主題切換按鈕
        const themeButton = document.getElementById('themeButton');
        const body = document.body;
        const moonIcon = themeButton.querySelector('.fa-moon');
        const sunIcon = themeButton.querySelector('.fa-sun');
        const buttonText = themeButton.querySelector('span');

        // 檢查主題設置，默認為深色模式
        const currentTheme = localStorage.getItem('theme');
        if (currentTheme === 'light') {
            body.classList.remove('dark-theme');
            moonIcon.style.display = 'none';
            sunIcon.style.display = 'inline-block';
            buttonText.textContent = 'Sunshine';
        } else {
            // 默認深色模式
            body.classList.add('dark-theme');
            moonIcon.style.display = 'inline-block';
            sunIcon.style.display = 'none';
            buttonText.textContent = 'Moon';
        }

        // 主題切換事件
        themeButton.addEventListener('click', () => {
            body.classList.toggle('dark-theme');
            const isDark = body.classList.contains('dark-theme');
            
            // 更新圖標顯示
            moonIcon.style.display = isDark ? 'inline-block' : 'none';
            sunIcon.style.display = isDark ? 'none' : 'inline-block';
            buttonText.textContent = isDark ? 'Moon' : 'Sunshine';
            
            // 保存主題設置
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        });

        // 添加金額輸入驗證和格式化
        const amountInput = document.getElementById('amountInput');
        
        // 只允許數字和小數點
        amountInput.addEventListener('keypress', (e) => {
            // 只允許數字、小數點和控制鍵
            if (!/[\d.]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete') {
                e.preventDefault();
            }
            
            // 限制只能有一個小數點
            if (e.key === '.' && e.target.value.includes('.')) {
                e.preventDefault();
            }
        });

        // 失去焦點時格式化
        amountInput.addEventListener('blur', (e) => {
            try {
                const value = e.target.value.trim();
                if (!value) return;
                
                const formattedValue = formatAmount(value);
                if (formattedValue) {
                    e.target.value = formattedValue;
                }
            } catch (err) {
                console.error('Format error:', err);
                // 發生錯誤時保留原始值
                e.target.value = e.target.value.trim();
            }
        });

        // 獲得焦點時移除格式化
        amountInput.addEventListener('focus', (e) => {
            try {
                const value = e.target.value.replace(/,/g, '');
                e.target.value = value;
            } catch (err) {
                console.error('Unformat error:', err);
                // 發生錯誤時保留原始值
                e.target.value = e.target.value.trim();
            }
        });

        // 預設展開到 level 2
        expandToLevel(2);

        // 設置今日日期
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        document.getElementById('applyDate').value = `${year}-${month}-${day}`;
    } catch (error) {
        console.error('Error loading JSON:', error);
    }
});

function getCurrentDateTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function createSignItem(signChild, parentSelect = null) {
    const signItem = document.createElement('div');
    signItem.className = `sign-item sign-level-${signChild.signlevel || '1'}`;

    // 只有當 show 為 "Y" 時才顯示簽核欄位
    if (signChild.show === "Y") {
        // 建立下拉選單
        const selectField = document.createElement('div');
        selectField.className = 'sign-field';

        // 如果有 flexstrings 且為 "Y"，添加文字輸入框
        if (signChild.flexstrings === "Y") {
            const flexInput = document.createElement('input');
            flexInput.type = 'text';
            flexInput.className = 'flex-input';
            flexInput.placeholder = '請輸入文字...';
            selectField.appendChild(flexInput);
        }

        const selectLabel = document.createElement('label');
        // 根據 signlevel 設定不同的標籤文字
        selectLabel.textContent = signChild.signlevel === "1" ? "初審:" :
            signChild.signlevel === "1-2" ? "複審:" :
                "Y/N/NA:";

        const select = document.createElement('select');
        select.className = 'custom-select';
        select.style.width = '80px';  // 設置固定寬度
        // 如果有父層級且父層級為空白，則禁用此下拉選單
        if (parentSelect && parentSelect.value === '') {
            select.disabled = true;
        }

        ['', 'Y', 'N', 'NA'].forEach(option => {
            const opt = document.createElement('option');
            opt.value = option;
            opt.textContent = option || '　';
            if (option === (signChild['Y/N/NA'] || '')) {
                opt.selected = true;
            }
            select.appendChild(opt);
        });

        selectField.appendChild(selectLabel);
        selectField.appendChild(select);
        signItem.appendChild(selectField);

        // 建立簽核者和日期欄位
        const signerField = document.createElement('div');
        signerField.className = 'sign-field' + (select.value === '' ? ' hidden-field' : '');

        const signerLabel = document.createElement('label');
        signerLabel.textContent = '簽核者:';
        const signerValue = document.createElement('span');
        signerValue.textContent = select.value ? 'Sankalp' : '';

        signerField.appendChild(signerLabel);
        signerField.appendChild(signerValue);
        signItem.appendChild(signerField);

        const dateField = document.createElement('div');
        dateField.className = 'sign-field' + (select.value === '' ? ' hidden-field' : '');

        const dateLabel = document.createElement('label');
        dateLabel.textContent = '簽核日期:';
        const dateValue = document.createElement('span');
        dateValue.textContent = select.value ? getCurrentDateTime() : '';

        dateField.appendChild(dateLabel);
        dateField.appendChild(dateValue);
        signItem.appendChild(dateField);

        // 遞迴處理子層級的 signchildren
        let childrenContainer = null;
        if (signChild.signchildren && signChild.signchildren.length > 0) {
            childrenContainer = document.createElement('div');
            childrenContainer.className = 'signchildren-nested';

            signChild.signchildren.forEach(childSign => {
                if (childSign.show === "Y") {
                    const childItem = createSignItem(childSign, select);
                    childrenContainer.appendChild(childItem);
                }
            });

            if (childrenContainer.children.length > 0) {
                signItem.appendChild(childrenContainer);
            }
        }

        // 處理下拉選單變更事件
        select.addEventListener('change', () => {
            if (select.value === '') {
                signerField.classList.add('hidden-field');
                dateField.classList.add('hidden-field');
                signerValue.textContent = '';
                dateValue.textContent = '';

                // 清空並禁用所有子層級
                if (childrenContainer) {
                    childrenContainer.querySelectorAll('select').forEach(childSelect => {
                        childSelect.value = '';
                        childSelect.disabled = true;
                        const childSignItem = childSelect.closest('.sign-item');
                        childSignItem.classList.add('disabled');

                        // 觸發子層級的 change 事件，以清空其簽核資訊
                        const event = new Event('change');
                        childSelect.dispatchEvent(event);
                    });
                }
            } else {
                signerField.classList.remove('hidden-field');
                dateField.classList.remove('hidden-field');
                signerValue.textContent = 'Sankalp';
                dateValue.textContent = getCurrentDateTime();

                // 啟用所有子層級
                if (childrenContainer) {
                    childrenContainer.querySelectorAll('select').forEach(childSelect => {
                        childSelect.disabled = false;
                        const childSignItem = childSelect.closest('.sign-item');
                        childSignItem.classList.remove('disabled');
                    });
                }
            }
        });

        // 如果父層級為空白，初始化時就禁用並清空
        if (parentSelect && parentSelect.value === '') {
            select.value = '';
            select.disabled = true;
            signItem.classList.add('disabled');
            const event = new Event('change');
            select.dispatchEvent(event);
        }
    }

    return signItem;
}

function createApprovalButtons(node) {  
    // 初審退回按鈕的狀態和備註管理
    const returnButtonStates = {
        firstReview: {
            isReturned: false,
            memo: ''
        },
        buHead: {
            isReturned: false,
            memo: ''
        }
    };

    // 處理退回按鈕點擊
    function handleReturnClick(type, button, approvalButton) {
        const state = returnButtonStates[type];
        
        Swal.fire({
            title: '退回原因',
            input: 'textarea',
            inputPlaceholder: '意見/或變更描述 (Description of the Comments/ Changes)',
            inputValue: state.memo,
            showCancelButton: true,
            confirmButtonText: '確認',
            cancelButtonText: '取消',
            inputAttributes: {
                style: 'height: 120px'
            },
            customClass: {
                popup: 'return-memo-popup'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                state.memo = result.value;
                state.isReturned = true;
                button.innerHTML = type === 'firstReview' ? 
                    '<i class="fas fa-undo"></i> 已退回' : 
                    '<i class="fas fa-undo"></i> BU Head 已退回';
                button.classList.add('returned');
                
                // 還原審核按鈕狀態
                if (approvalButton) {
                    approvalButton.classList.remove('approved');
                    approvalButton.innerHTML = type === 'firstReview' ? 
                        '<i class="fas fa-check"></i> 初審主管審核' : 
                        '<i class="fas fa-check"></i> BU Head 審核';
                }
            }
        });
    }

    // 初審主管審核按鈕
    const managerButton = document.createElement('button');
    managerButton.className = 'approval-button manager';
    managerButton.innerHTML = '<i class="fas fa-check"></i> 初審主管審核';

    // 初審退回按鈕
    const managerReturnButton = document.createElement('button');
    managerReturnButton.className = 'approval-button return';
    managerReturnButton.innerHTML = '<i class="fas fa-undo"></i> 初審退回';
    managerReturnButton.setAttribute('data-type', 'firstReview');
    managerReturnButton.onclick = function (e) {
        e.stopPropagation();
        handleReturnClick('firstReview', this, managerButton);
    };

    managerButton.onclick = function (e) {
        e.stopPropagation();
        if (!this.classList.contains('approved')) {
            this.classList.add('approved');
            this.innerHTML = '<i class="fas fa-check-double"></i> 初審主管已審核';
            
            // 禁用初審退回按鈕
            const returnButton = this.parentElement.querySelector('[data-type="firstReview"]');
            returnButton.disabled = true;
            returnButton.classList.add('disabled');
        }
    };

    // BU Head 審核按鈕
    const headButton = document.createElement('button');
    headButton.className = 'approval-button head';
    headButton.innerHTML = '<i class="fas fa-check"></i> BU Head 審核';

    // BU Head 退回按鈕
    const headReturnButton = document.createElement('button');
    headReturnButton.className = 'approval-button return';
    headReturnButton.innerHTML = '<i class="fas fa-undo"></i> BU Head 退回';
    headReturnButton.setAttribute('data-type', 'buHead');
    headReturnButton.onclick = function (e) {
        e.stopPropagation();
        handleReturnClick('buHead', this, headButton);
    };

    headButton.onclick = function (e) {
        e.stopPropagation();
        if (!this.classList.contains('approved')) {
            this.classList.add('approved');
            this.innerHTML = '<i class="fas fa-check-double"></i> BU Head 已審核';
            
            // 禁用 BU Head 退回按鈕
            const returnButton = this.parentElement.querySelector('[data-type="buHead"]');
            returnButton.disabled = true;
            returnButton.classList.add('disabled');
        }
    };

    // 建立併/展按鈕（只在 level 2 顯示）
    const toggleButton = document.createElement('button');
    toggleButton.className = 'approval-button toggle-expand';
    toggleButton.innerHTML = '<i class="fas fa-compress-alt"></i> 併';
    toggleButton.onclick = function(e) {
        e.stopPropagation();
        const treeItem = this.closest('.tree-item');
        const isCompressed = this.querySelector('i').classList.contains('fa-compress-alt');
        
        if (isCompressed) {
            // 展開所有節點
            const allNodeContents = treeItem.querySelectorAll('.node-content');
            allNodeContents.forEach(content => {
                content.classList.remove('hidden');
            });
            const allToggleBtns = treeItem.querySelectorAll('.toggle-btn i');
            allToggleBtns.forEach(btn => {
                btn.className = 'fas fa-minus';
            });
            // 更新按鈕狀態
            this.innerHTML = '<i class="fas fa-expand-alt"></i> 展';
        } else {
            // 收合所有節點
            const allNodeContents = treeItem.querySelectorAll('.node-content');
            allNodeContents.forEach(content => {
                content.classList.add('hidden');
            });
            const allToggleBtns = treeItem.querySelectorAll('.toggle-btn i');
            allToggleBtns.forEach(btn => {
                btn.className = 'fas fa-plus';
            });
            // 更新按鈕狀態
            this.innerHTML = '<i class="fas fa-compress-alt"></i> 併';
        }
    };

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'approval-buttons';
    buttonContainer.appendChild(managerButton);
    buttonContainer.appendChild(managerReturnButton);
    buttonContainer.appendChild(headButton);
    buttonContainer.appendChild(headReturnButton);
    
    // 只在 level 2 添加併/展按鈕
    if (node && node.level === "2") {  
        buttonContainer.appendChild(toggleButton);
    }

    return buttonContainer;
}

function renderTree(node, parentElement, level = 0) {
    const treeItem = document.createElement('div');
    treeItem.className = `tree-item level-${level}`;
    treeItem.setAttribute('data-level', node.level || level.toString());  

    const treeContent = document.createElement('div');
    treeContent.className = 'tree-content';

    // 建立展開/收合按鈕
    const toggleBtn = document.createElement('span');
    toggleBtn.className = 'toggle-btn';
    toggleBtn.innerHTML = '<i class="fas fa-plus"></i>';

    // 建立標題容器
    const titleContainer = document.createElement('div');
    titleContainer.className = 'title-container';

    // 建立標題
    const title = document.createElement('span');
    title.className = 'tree-title';
    title.textContent = node.title;

    // 如果層級是 2，添加審核按鈕
    if (node.level === "2") {  
        const approvalButtons = createApprovalButtons(node);  
        title.appendChild(approvalButtons);
    }

    // 如果有 flexstrings，添加輸入框
    if (node.showflexstrings === "Y") {
        const flexInput = document.createElement('input');
        flexInput.type = 'text';
        flexInput.className = 'flex-input';
        flexInput.placeholder = '請輸入文字...';
        flexInput.value = node.flexstrings || '';
        flexInput.style.marginLeft = '1em';
        // 阻止事件冒泡，防止觸發展開/收合
        flexInput.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        titleContainer.appendChild(flexInput);
    }

    // 如果有 showflexdates，添加日期選擇器
    if (node.showflexdates === "Y") {
        const dateInput = document.createElement('input');
        dateInput.type = 'text';
        dateInput.className = 'date-input';
        dateInput.placeholder = '選擇日期...';
        dateInput.value = node.flexdate || '';
        dateInput.style.marginLeft = '1em';
        // 阻止事件冒泡，防止觸發展開/收合
        dateInput.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        titleContainer.appendChild(dateInput);

        // 初始化 flatpickr
        flatpickr(dateInput, {
            locale: 'zh_tw',
            dateFormat: 'Y-m-d',
            allowInput: true,
            onChange: function (selectedDates, dateStr) {
                node.flexdate = dateStr;
            },
            onOpen: function (selectedDates, dateStr, instance) {
                // 防止事件冒泡
                const calendar = instance.calendarContainer;
                calendar.addEventListener('click', (e) => {
                    e.stopPropagation();
                });
                calendar.addEventListener('mousedown', (e) => {
                    e.stopPropagation();
                });
            }
        });
    }

    titleContainer.insertBefore(title, titleContainer.firstChild);
    treeContent.appendChild(toggleBtn);
    treeContent.appendChild(titleContainer);
    treeItem.appendChild(treeContent);

    // 建立子節點容器
    const nodeContent = document.createElement('div');
    nodeContent.className = 'node-content hidden';
    let hasVisibleChildren = false;

    // 處理 children
    if (node.children && node.children.length > 0) {
        const childrenContainer = document.createElement('div');
        childrenContainer.className = 'children-container';
        node.children.forEach(child => {
            renderTree(child, childrenContainer, parseInt(child.level));
            hasVisibleChildren = true;
        });
        nodeContent.appendChild(childrenContainer);
    }

    // 處理 signchildren
    if (node.signchildren && node.signchildren.length > 0) {
        const signChildrenContainer = document.createElement('div');
        signChildrenContainer.className = 'signchildren-container';

        node.signchildren.forEach(signChild => {
            const signItem = createSignItem(signChild);
            if (signItem.children.length > 0) {
                signChildrenContainer.appendChild(signItem);
                hasVisibleChildren = true;
            }
        });

        if (signChildrenContainer.children.length > 0) {
            nodeContent.appendChild(signChildrenContainer);
        }
    }

    // 只有當有可見內容時才添加展開/收合功能
    if (hasVisibleChildren) {
        treeItem.appendChild(nodeContent);

        // 點擊事件處理
        treeContent.addEventListener('click', () => {
            nodeContent.classList.toggle('hidden');

            // 更新圖示
            toggleBtn.innerHTML = nodeContent.classList.contains('hidden')
                ? '<i class="fas fa-plus"></i>'
                : '<i class="fas fa-minus"></i>';
        });
    } else {
        toggleBtn.style.visibility = 'hidden';
    }

    parentElement.appendChild(treeItem);
}

function toggleAllNodes() {
    const expandAllButton = document.getElementById('expandAllButton');
    const isCollapsing = expandAllButton.innerHTML.includes('Collapse');

    if (isCollapsing) {
        // 展開所有項目
        const allToggleButtons = document.querySelectorAll('.toggle-btn');
        allToggleButtons.forEach(btn => {
            const icon = btn.querySelector('i');
            const childrenContainer = btn.closest('.tree-item').querySelector('.node-content');
            if (childrenContainer && icon) {
                icon.className = 'fas fa-minus';
                childrenContainer.classList.remove('hidden');
            }
        });
        // 更新併/展按鈕狀態
        const toggleExpandButtons = document.querySelectorAll('.toggle-expand');
        toggleExpandButtons.forEach(btn => {
            btn.innerHTML = '<i class="fas fa-expand-alt"></i> 展';
        });
        // 更新按鈕文字
        expandAllButton.innerHTML = '<i class="fas fa-expand-arrows-alt"></i> Expand All';
    } else {
        // 回到預設狀態（展開到 level 2）
        expandToLevel(2);
        // 更新按鈕文字
        expandAllButton.innerHTML = '<i class="fas fa-compress-arrows-alt"></i> Collapse All';
    }
}

function expandAllNodes() {
    const allToggleButtons = document.querySelectorAll('.toggle-btn');
    allToggleButtons.forEach(btn => {
        const icon = btn.querySelector('i');
        const childrenContainer = btn.closest('.tree-item').querySelector('.node-content');
        if (childrenContainer && icon) {
            icon.className = 'fas fa-minus';
            childrenContainer.classList.remove('hidden');
        }
    });
}

function expandToLevel(level) {
    const allItems = document.querySelectorAll('.tree-item');
    allItems.forEach(item => {
        const currentLevel = parseInt(item.getAttribute('data-level') || '0');
        const nodeContent = item.querySelector('.node-content');
        const toggleBtn = item.querySelector('.toggle-btn i');
        
        if (nodeContent && toggleBtn) {
            if (currentLevel < level) {
                nodeContent.classList.remove('hidden');
                toggleBtn.className = 'fas fa-minus';
            } else {
                nodeContent.classList.add('hidden');
                toggleBtn.className = 'fas fa-plus';
            }
        }
    });
    
    // 更新併/展按鈕狀態為初始狀態
    const toggleExpandButtons = document.querySelectorAll('.toggle-expand');
    toggleExpandButtons.forEach(btn => {
        btn.innerHTML = '<i class="fas fa-compress-alt"></i> 併';
    });
}
