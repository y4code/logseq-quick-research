// ==UserScript==
// @name         Logseq Web Clipper
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Clip web content to Logseq with hierarchical structure
// @author       y4code
// @match        *://*/*
// @grant        GM_addStyle
// @grant        GM_notification
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(function () {
    'use strict';

    const LOGSEQ_API_URL = 'http://127.0.0.1:12315/api';
    let AUTH_TOKEN = GM_getValue('logseq_token');
    let pageTree, currentNode;
    const nodeStack = [];

    if (!AUTH_TOKEN) {
        AUTH_TOKEN = prompt('Please enter your Logseq token:');
        if (AUTH_TOKEN) {
            GM_setValue('logseq_token', AUTH_TOKEN);
        } else {
            alert('Logseq token is required to use this script.');
            return;
        }
    }

    const container = document.createElement('div');
    container.id = 'logseq-clipper-container';
    document.body.appendChild(container);
    GM_addStyle(`
      #logseq-clipper-container {
        position: fixed;
        top: 100px;
        right: 0px;
        padding: 2px;
        background: #f9fafb;
        color: #111827;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 9999;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        font-size: 14px;
        max-width: 250px;
      }
      #logseq-page-selection, #logseq-custom-page-input {
        margin: 4px;
        padding: 8px;
        width: calc(100% - 16px); // Adjust for padding
        box-sizing: border-box;
      }
      #logseq-custom-page-input {
        display: none;
      }
    `);

    const statusBar = document.createElement('div');
    statusBar.id = 'logseq-clipper-status';
    container.appendChild(statusBar);
    updateStatusBar(); // Initial update

    const pageSelection = document.createElement('select');
    pageSelection.id = 'logseq-page-selection';
    pageSelection.innerHTML = `
        <option value="Journal">Journal</option>
        <option value="Custom">Custom Page</option>
    `;
    container.appendChild(pageSelection);

    const customPageInput = document.createElement('input');
    customPageInput.id = 'logseq-custom-page-input';
    customPageInput.type = 'text';
    customPageInput.placeholder = 'Enter custom page name';
    container.appendChild(customPageInput);

    pageSelection.addEventListener('change', async function () {
        const selection = pageSelection.value;
        // console.log('Page selection changed to:', selection);
        if (selection === 'Custom') {
            customPageInput.style.display = 'block';
            customPageInput.focus();
        } else {
            customPageInput.style.display = 'none';
            const today = formatDate(new Date());
            // console.log('Today\'s date:', today);
            const pageUUID = await getPageUUID(today);
            if (pageUUID) {
                // console.log('Page UUID for today:', pageUUID);
                await getPageBlocksTree(pageUUID, today);
            } else {
                notify('无法获取页面 UUID');
            }
        }
    });

    customPageInput.addEventListener('blur', async function () {
        const customPageName = customPageInput.value.trim();
        // console.log('Custom page name input:', customPageName);
        if (customPageName) {
            const pageUUID = await getPageUUID(customPageName);
            if (pageUUID) {
                // console.log('Page UUID for custom page:', pageUUID);
                await getPageBlocksTree(pageUUID, customPageName);
            } else {
                notify('无法获取页面 UUID');
            }
        }
    });

    async function getPageUUID(pageName) {
        try {
            // console.log('Getting page UUID for:', pageName);
            const response = await fetch(LOGSEQ_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${AUTH_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    method: "logseq.Editor.getPage",
                    args: [pageName]
                })
            });

            const data = await response.json();
            // console.log('Response data for page UUID:', data);
            return data?.uuid || null;
        } catch (error) {
            console.error('Error getting page UUID:', error);
            notify('获取页面 UUID 时发生错误');
            return null;
        }
    }

    async function getPageBlocksTree(pageUUID, pageName) {
        try {
            // console.log('Getting page blocks tree for UUID:', pageUUID);
            const response = await fetch(LOGSEQ_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${AUTH_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    method: "logseq.Editor.getPageBlocksTree",
                    args: [pageUUID]
                })
            });
            const blocks = await response.json();
            // console.log('Response data for page blocks tree:', blocks);
            pageTree = {
                uuid: pageUUID,
                content: pageName,
                children: blocks
            };
            currentNode = pageTree;
            updateStatusBar();
        } catch (error) {
            console.error('Error getting page blocks tree:', error);
            notify('获取页面块树时发生错误');
        }
    }

    function updateStatusBar() {
        if (currentNode && currentNode.content) {
            statusBar.textContent = `当前层级: ${currentNode.content}`;
        } else {
            statusBar.textContent = `当前层级: 正在加载...`;
        }
        // console.log('Status bar updated:', statusBar.textContent);
    }

    function notify(message) {
        // console.log('Notification:', message);
        GM_notification(message, 'Logseq Web Clipper');
    }

    async function insertBlock(content) {
        if (!currentNode.uuid) {
            notify('无法插入块，未找到父级 UUID');
            return;
        }

        try {
            // console.log('Inserting block with content:', content);
            const response = await fetch(LOGSEQ_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${AUTH_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    method: "logseq.Editor.insertBlock",
                    args: [currentNode.uuid, content, false]
                })
            });

            const data = await response.json();
            // console.log('Response data for insert block:', data);
            if (data?.uuid) {
                let newNode = { uuid: data.uuid, content: content, children: [] };
                currentNode.children.push(newNode);
                notify('内容已添加到 Logseq');
            } else {
                notify('插入块失败');
            }
        } catch (error) {
            console.error('Error inserting block:', error);
            notify('插入块时发生错误');
        }
    }

    document.addEventListener('keydown', async function (e) {
        if (e.metaKey && e.shiftKey) {
            const key = e.key.toLowerCase();
            // console.log('Key pressed:', key);

            switch (key) {
                case 'e':
                    const selectedText = window.getSelection().toString();
                    // console.log('Selected text:', selectedText);
                    await insertBlock(selectedText);
                    break;
                case 'arrowleft':
                    if (nodeStack.length > 0) {
                        currentNode = nodeStack.pop();
                        updateStatusBar();
                    }
                    break;
                case 'arrowright':
                    if (currentNode.children && currentNode.children.length > 0) {
                        nodeStack.push(currentNode);
                        currentNode = currentNode.children[0];
                        updateStatusBar();
                    }
                    break;
                case 'arrowup':
                    if (nodeStack.length > 0) {
                        let parent = nodeStack[nodeStack.length - 1];
                        let foundIndex = parent.children.findIndex(child => child.uuid === currentNode.uuid);
                        if (foundIndex > 0) {
                            currentNode = parent.children[foundIndex - 1];
                            updateStatusBar();
                        }
                    }
                    break;
                case 'arrowdown':
                    if (nodeStack.length > 0) {
                        let parent = nodeStack[nodeStack.length - 1];
                        let foundIndex = parent.children.findIndex(child => child.uuid === currentNode.uuid);
                        if (foundIndex >= 0 && foundIndex < parent.children.length - 1) {
                            currentNode = parent.children[foundIndex + 1];
                            updateStatusBar();
                        }
                    }
                    break;
            }
        }
    });

    async function initialize() {
        const today = formatDate(new Date());
        // console.log('Initializing script with today\'s date:', today);
        const pageUUID = await getPageUUID(today);
        if (pageUUID) {
            // console.log('Page UUID on initialize:', pageUUID);
            await getPageBlocksTree(pageUUID, today);
            notify(`已切换到 Journal: ${today}`);
        } else {
            notify('无法获取页面 UUID');
        }
    }

    function formatDate(date) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        let formattedDate = date.toLocaleDateString('en-US', options);

        // 提取日、月和年
        const [month, day, year] = formattedDate.replace(',', '').split(' ');

        // 判断并处理日后缀
        let daySuffix;
        if (day.endsWith('1') && day !== '11') {
            daySuffix = 'st';
        } else if (day.endsWith('2') && day !== '12') {
            daySuffix = 'nd';
        } else if (day.endsWith('3') && day !== '13') {
            daySuffix = 'rd';
        } else {
            daySuffix = 'th';
        }

        return `${month} ${day}${daySuffix}, ${year}`;
    }

    initialize(); // Start the script by initializing

})();
