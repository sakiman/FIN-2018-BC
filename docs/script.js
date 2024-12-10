document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('./FIN-208-BC.json');
        const data = await response.json();
        const treeView = document.getElementById('treeView');
        renderTree(data, treeView);

        // 添加展開/收合按鈕的事件監聽器
        document.getElementById('expandAllButton').addEventListener('click', toggleAllNodes);
        
        // 預設展開到 level 2
        expandToLevel(2);
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

function createApprovalButtons() {
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'approval-buttons';

    // 初審主管審核按鈕
    const managerButton = document.createElement('button');
    managerButton.className = 'approval-button manager';
    managerButton.innerHTML = '<i class="fas fa-check"></i> 初審主管審核';
    managerButton.onclick = function(e) {
        e.stopPropagation();
        if (!this.classList.contains('approved')) {
            this.classList.add('approved');
            this.innerHTML = '<i class="fas fa-check-double"></i> 初審主管已審核';
        }
    };

    // BU Head 審核按鈕
    const headButton = document.createElement('button');
    headButton.className = 'approval-button head';
    headButton.innerHTML = '<i class="fas fa-check"></i> BU Head 審核';
    headButton.onclick = function(e) {
        e.stopPropagation();
        if (!this.classList.contains('approved')) {
            this.classList.add('approved');
            this.innerHTML = '<i class="fas fa-check-double"></i> BU Head 已審核';
        }
    };

    buttonContainer.appendChild(managerButton);
    buttonContainer.appendChild(headButton);
    return buttonContainer;
}

function renderTree(node, parentElement, level = 0) {
    const treeItem = document.createElement('div');
    treeItem.className = `tree-item level-${level}`;

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
    if (level === 2) {
        const approvalButtons = createApprovalButtons();
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
    const isExpanding = expandAllButton.innerHTML.includes('Expand');
    
    if (isExpanding) {
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
        expandAllButton.innerHTML = '<i class="fas fa-compress-arrows-alt"></i> Collapse All';
    } else {
        // 回到預設狀態（展開到 level 2）
        expandToLevel(2);
        expandAllButton.innerHTML = '<i class="fas fa-expand-arrows-alt"></i> Expand All';
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
    const allTreeItems = document.querySelectorAll('.tree-item');
    allTreeItems.forEach(item => {
        const currentLevel = parseInt(item.className.match(/level-(\d+)/)[1]);
        const toggleBtn = item.querySelector('.toggle-btn');
        const nodeContent = item.querySelector('.node-content');
        
        if (toggleBtn && nodeContent) {
            const icon = toggleBtn.querySelector('i');
            if (currentLevel < level) {
                icon.className = 'fas fa-minus';
                nodeContent.classList.remove('hidden');
            } else {
                icon.className = 'fas fa-plus';
                nodeContent.classList.add('hidden');
            }
        }
    });
}

// 初始化容器
const container = document.createElement('div');
container.className = 'tree-container';

document.body.appendChild(container);

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
        createDateFolders();
    } catch (error) {
        alert('錯誤：無法連接到服務器');
        console.error('Error:', error);
    }
});
