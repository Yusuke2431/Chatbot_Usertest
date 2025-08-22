/**
 * 共通JavaScript機能
 * 全ページで使用される基本機能を提供
 */

// 共通DOM要素
let commonElements = {};

// ページ管理
const PageManager = {
    currentPage: 'devops',
    pages: {
        'devops': {
            title: 'DevOps分析',
            cssFile: 'css/devops.css',
            jsFile: 'js/devops.js'
        },
        'cycle-time': {
            title: 'サイクルタイム分析',
            cssFile: 'css/cycle-time.css',
            jsFile: 'js/cycle-time.js'
        },
        'team-summary': {
            title: 'チームサマリ',
            cssFile: 'css/team-summary.css',
            jsFile: 'js/team-summary.js'
        },
        'review': {
            title: 'レビュー分析',
            cssFile: 'css/review-analysis.css',
            jsFile: 'js/review-analysis.js'
        }
    },

    // ページ切り替え
    switchPage: function(pageId) {
        if (this.pages[pageId] && pageId !== this.currentPage) {
            this.loadPage(pageId);
            this.updateActiveMenu(pageId);
            this.updatePageTitle(pageId);
            this.currentPage = pageId;
        }
    },

    // ページコンテンツの読み込み
    loadPage: function(pageId) {
        const pageInfo = this.pages[pageId];
        
        // 既存のページ固有CSSを削除
        this.removePageSpecificCSS();
        
        // 新しいページのCSSを読み込み
        this.loadCSS(pageInfo.cssFile);
        
        // ページコンテンツを読み込み
        this.loadPageContent(pageId);
        
        // ページ固有のJavaScriptを読み込み
        this.loadJS(pageInfo.jsFile);
    },

    // ページコンテンツの読み込み
    loadPageContent: function(pageId) {
        // ページIDとファイル名の対応
        const fileNameMap = {
            'review': 'review-analysis',
            'team-summary': 'team-summary'
        };
        const fileName = fileNameMap[pageId] || pageId;
        fetch(`pages/${fileName}.html`)
            .then(response => response.text())
            .then(html => {
                const mainContent = document.querySelector('.main-content');
                if (mainContent) {
                    // ダッシュボードヘッダーは保持し、その後のコンテンツのみ更新
                    const header = mainContent.querySelector('.dashboard-header');
                    mainContent.innerHTML = '';
                    if (header) {
                        mainContent.appendChild(header);
                    }
                    
                    // 新しいコンテンツを追加
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = html;
                    while (tempDiv.firstChild) {
                        mainContent.appendChild(tempDiv.firstChild);
                    }
                }
            })
            .catch(error => {
                console.error(`Error loading page ${pageId}:`, error);
                this.showErrorMessage(`ページの読み込みに失敗しました: ${pageId}`);
            });
    },

    // CSSファイルの動的読み込み
    loadCSS: function(cssFile) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = cssFile;
        link.className = 'page-specific-css';
        document.head.appendChild(link);
    },

    // JavaScriptファイルの動的読み込み
    loadJS: function(jsFile) {
        // 既存のページ固有JSを削除
        this.removePageSpecificJS();
        
        const script = document.createElement('script');
        script.src = jsFile;
        script.className = 'page-specific-js';
        script.onload = () => {
            console.log(`Loaded: ${jsFile}`);
            // ページ固有の初期化関数があれば実行
            if (window.initializePage && typeof window.initializePage === 'function') {
                window.initializePage();
            }
        };
        script.onerror = () => {
            console.warn(`Failed to load: ${jsFile}`);
        };
        document.head.appendChild(script);
    },

    // ページ固有CSSの削除
    removePageSpecificCSS: function() {
        const pageCSS = document.querySelectorAll('.page-specific-css');
        pageCSS.forEach(css => css.remove());
    },

    // ページ固有JSの削除
    removePageSpecificJS: function() {
        const pageJS = document.querySelectorAll('.page-specific-js');
        pageJS.forEach(js => js.remove());
        
        // ページ固有の初期化関数をクリア
        if (window.initializePage) {
            window.initializePage = null;
        }
    },

    // アクティブメニューの更新
    updateActiveMenu: function(pageId) {
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            item.classList.remove('active');
            if (item.id === pageId) {
                item.classList.add('active');
            }
        });
    },

    // ページタイトルの更新
    updatePageTitle: function(pageId) {
        const pageTitle = document.getElementById('page-title');
        if (pageTitle && this.pages[pageId]) {
            pageTitle.textContent = this.pages[pageId].title;
        }
    },

    // エラーメッセージの表示
    showErrorMessage: function(message) {
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.innerHTML = `
                <div style="background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 16px; border-radius: 8px; margin: 20px 0;">
                    <strong>エラー:</strong> ${message}
                </div>
            `;
            mainContent.appendChild(errorDiv);
        }
    }
};

// FAB（Floating Action Button）管理
const FABManager = {
    fab: null,
    chatWindow: null,
    isOpen: false,
    rippleAnimation: null,
    smartTooltip: null,
    animationTimer: null,

    initialize: function() {
        this.fab = document.getElementById('fab');
        this.chatWindow = document.getElementById('chatWindow');
        this.rippleAnimation = document.getElementById('rippleAnimation');
        this.smartTooltip = document.getElementById('smartTooltip');
        this.tooltipClose = document.getElementById('tooltipClose');
        this.animationActive = false;
        
        if (this.fab) {
            this.fab.addEventListener('click', () => this.toggleChat());
            
            // 5秒後に協調アニメーションとツールチップを表示
            this.animationTimer = setTimeout(() => {
                this.showAttentionAnimation();
            }, 5000);
        }

        const chatClose = document.getElementById('chatClose');
        if (chatClose) {
            chatClose.addEventListener('click', () => this.closeChat());
        }
        
        // ツールチップの閉じるボタンのイベントリスナー
        if (this.tooltipClose) {
            this.tooltipClose.addEventListener('click', (e) => {
                e.stopPropagation(); // FABのクリックイベントが発火しないようにする
                this.hideTooltipAndAnimation();
            });
        }

        // Escキーでチャットを閉じる
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeChat();
            }
        });
    },

    toggleChat: function() {
        if (this.isOpen) {
            this.closeChat();
        } else {
            this.openChat();
        }
    },

    openChat: function() {
        if (this.fab && this.chatWindow) {
            this.fab.style.display = 'none';
            this.chatWindow.classList.add('active');
            this.isOpen = true;
            
            // アニメーションタイマーをクリア
            if (this.animationTimer) {
                clearTimeout(this.animationTimer);
            }
            
            // アニメーションを停止
            this.stopAnimation();
            
            // ツールチップを非表示
            if (this.smartTooltip) {
                this.smartTooltip.style.opacity = '';
                this.smartTooltip.style.visibility = '';
            }
            
            // チャット入力にフォーカス
            setTimeout(() => {
                const chatInput = document.getElementById('chatInput');
                if (chatInput) {
                    chatInput.focus();
                }
            }, 100);
        }
    },

    closeChat: function() {
        if (this.fab && this.chatWindow) {
            this.chatWindow.classList.remove('active');
            this.fab.style.display = 'flex';
            this.isOpen = false;
            
            // アニメーションタイマーをクリア
            if (this.animationTimer) {
                clearTimeout(this.animationTimer);
            }
            
            // 閉じた後、30秒後に再びアニメーションを表示
            this.animationTimer = setTimeout(() => {
                this.showAttentionAnimation();
            }, 30000);
        }
    },
    
    // 協調アニメーションとツールチップを表示
    showAttentionAnimation: function() {
        if (this.isOpen) return; // チャットが開いている場合は実行しない
        
        // 波紋アニメーションをクラスで制御（CSSアニメーション）
        if (this.fab) {
            this.fab.classList.add('animate-pulse');
            this.animationActive = true;
        }
        
        if (this.smartTooltip && this.fab) {
            // ツールチップを表示
            this.smartTooltip.style.opacity = '1';
            this.smartTooltip.style.visibility = 'visible';
        }
        
        // 定期的な再表示は不要（ユーザーの指示により削除）
    },
    
    // ツールチップと波紋アニメーションを非表示にする
    hideTooltipAndAnimation: function() {
        // ツールチップを非表示
        if (this.smartTooltip) {
            this.smartTooltip.style.opacity = '0';
            this.smartTooltip.style.visibility = 'hidden';
        }
        
        // アニメーションを停止
        this.stopAnimation();
        
        // アニメーションタイマーをリセットして30秒後に再表示
        if (this.animationTimer) {
            clearTimeout(this.animationTimer);
        }
        
        this.animationTimer = setTimeout(() => {
            this.showAttentionAnimation();
        }, 30000);
    },
    
    // アニメーションを停止する
    stopAnimation: function() {
        if (this.fab && this.animationActive) {
            this.fab.classList.remove('animate-pulse');
            this.animationActive = false;
        }
    },
    
    // アニメーションをリセットする
    resetAnimation: function() {
        this.stopAnimation();
        
        // ツールチップを非表示
        if (this.smartTooltip) {
            this.smartTooltip.style.opacity = '0';
            this.smartTooltip.style.visibility = 'hidden';
        }
    }
};

// ユーティリティ関数
const Utils = {
    // デバウンス関数
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // 数値フォーマット
    formatNumber: function(num, decimals = 1) {
        return num.toLocaleString('ja-JP', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    },

    // 日付フォーマット
    formatDate: function(date, format = 'YYYY/MM/DD') {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        
        return format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day);
    },

    // 要素の表示/非表示
    toggleElement: function(element, show) {
        if (element) {
            element.style.display = show ? 'block' : 'none';
        }
    },

    // 要素にクラスを追加/削除
    toggleClass: function(element, className, add) {
        if (element) {
            if (add) {
                element.classList.add(className);
            } else {
                element.classList.remove(className);
            }
        }
    }
};

// 初期化処理
document.addEventListener('DOMContentLoaded', function() {
    console.log('Common JavaScript initialized');
    
    // DOM要素の取得
    commonElements = {
        fab: document.getElementById('fab'),
        chatWindow: document.getElementById('chatWindow'),
        menuItems: document.querySelectorAll('.menu-item'),
        pageTitle: document.getElementById('page-title')
    };

    // メニューイベントリスナーの設定
    if (commonElements.menuItems) {
        commonElements.menuItems.forEach(item => {
            item.addEventListener('click', function() {
                PageManager.switchPage(this.id);
            });
        });
    }

    // FAB初期化
    FABManager.initialize();

    // 初期ページの読み込み（DevOps分析）
    PageManager.loadPage('devops');
});

// グローバルに公開
window.PageManager = PageManager;
window.FABManager = FABManager;
window.Utils = Utils;
