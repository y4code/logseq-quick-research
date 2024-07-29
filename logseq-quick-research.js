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

    if (!AUTH_TOKEN) {
        AUTH_TOKEN = prompt('Please enter your Logseq token:');
        if (AUTH_TOKEN) {
            GM_setValue('logseq_token', AUTH_TOKEN);
        } else {
            alert('Logseq token is required to use this script.');
            return;
        }
    }

    let tree = {
        uuid: null,
        content: 'Root',
        children: []
    };

    let currentNode = tree;
    const nodeStack = [];

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
      #logseq-page-selection, #logseq-clipper-status {
        padding: 0px;
        background: #fff;
        color: #111827;
        width: 100%;
      }
      #logseq-page-selection {
        font-size: 14px;
      }
      #logseq-custom-page-input {
        display: none;
        padding: 0px;
        font-size: 14px;

      }
    `);

    const pageSelection = createPageSelection();
    const statusBar = createStatusBar();
    const customPageInput = createCustomPageInput();

    container.appendChild(pageSelection);
    container.appendChild(statusBar);
    container.appendChild(customPageInput);

    function createStatusBar() {
        const bar = document.createElement('div');
        bar.id = 'logseq-clipper-status';
        return bar;
    }

    function createPageSelection() {
        const select = document.createElement('select');
        select.id = 'logseq-page-selection';
        select.innerHTML = `
        <option value="Journal">Journal</option>
        <option value="Custom">Custom Page</option>
      `;
        select.addEventListener('change', onPageSelectionChange);
        return select;
    }

    function createCustomPageInput() {
        const input = document.createElement('input');
        input.id = 'logseq-custom-page-input';
        input.type = 'text';
        input.placeholder = 'page name';
        input.addEventListener('blur', onCustomPageInputBlur);
        return input;
    }

    async function onPageSelectionChange() {
        const selectedPage = pageSelection.value;
        if (selectedPage === 'Custom') {
            customPageInput.style.display = 'block';
            const customPageName = customPageInput.value;
            if (customPageName) {
                await setPageUUID(await getPageUUID(customPageName), customPageName);
                notify(`已切换到自定义页面: ${customPageName}`);
            }
        } else {
            customPageInput.style.display = 'none';
            const today = formatDate(new Date());
            await setPageUUID(await getPageUUID(today), today);
            notify(`已切换到 Journal: ${today}`);
        }
    }

    async function onCustomPageInputBlur() {
        const customPageName = customPageInput.value;
        if (customPageName) {
            await setPageUUID(await getPageUUID(customPageName), customPageName);
            notify(`已切换到自定义页面: ${customPageName}`);
        }
    }

    async function setPageUUID(uuid, content) {
        tree = {
            uuid: uuid,
            content: content,
            children: []
        };
        currentNode = tree;
        nodeStack.length = 0;
        updateStatusBar();
    }

    function formatDate(date) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options).replace(/,/, 'th,');
    }

    function updateStatusBar() {
        statusBar.textContent = `${currentNode.content || '无'}`;
    }

    function notify(message) {
        GM_notification(message, 'Logseq Web Clipper');
    }

    async function insertBlock(content) {
        const blockParentUUID = currentNode.uuid;
        if (!blockParentUUID) {
            notify('无法插入块，未找到父级 UUID');
            return;
        }

        try {
            const response = await fetch(LOGSEQ_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${AUTH_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    method: "logseq.Editor.insertBlock",
                    args: [blockParentUUID, content]
                })
            });

            const data = await response.json();
            if (data?.uuid) {
                const newNode = { uuid: data.uuid, content: content, children: [] };
                currentNode.children.push(newNode);
                updateStatusBar();
                notify('内容已添加到 Logseq');
            } else {
                notify('插入块失败');
            }
        } catch (error) {
            notify('插入块时发生错误');
        }
    }

    async function getPageUUID(pageName) {
        try {
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
            return data?.uuid || null;
        } catch (error) {
            notify('获取页面 UUID 时发生错误');
            return null;
        }
    }

    document.addEventListener('keydown', async function (e) {
        if (e.metaKey && e.shiftKey) {
            const key = e.key.toLowerCase();

            switch (key) {
                case 'e':
                    const selectedText = window.getSelection().toString();
                    await insertBlock(selectedText);
                    break;
                case 'arrowdown':
                    if (currentNode.children.length > 0) {
                        nodeStack.push(currentNode);
                        currentNode = currentNode.children[currentNode.children.length - 1];
                        updateStatusBar();
                        notify('已切换到下一级别');
                    }
                    break;
                case 'arrowup':
                    if (nodeStack.length > 0) {
                        currentNode = nodeStack.pop();
                        updateStatusBar();
                        notify('已切换到上一级别');
                    }
                    break;
            }
        }
    });

    (async () => {
        const today = formatDate(new Date());
        await setPageUUID(await getPageUUID(today), today);
        notify(`已切换到 Journal: ${today}`);
    })();

})();
