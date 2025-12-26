// ==========================================
// Part 1: Loading 页面 - 只在首次访问时显示
// ==========================================
document.addEventListener("DOMContentLoaded", function() {
    const loader = document.getElementById("loader");
    const mainContent = document.getElementById("main-content");
    
    // 检查是否已经看过Loading（使用sessionStorage，关闭标签页后重置）
    const hasSeenLoader = sessionStorage.getItem('hasSeenLoader');
    
    if (hasSeenLoader) {
        // 已经看过，直接跳过Loading
        if (loader) loader.style.display = 'none';
        if (mainContent) mainContent.style.opacity = '1';
        return;
    }
    
    // 首次访问，显示Loading动画
    const yearElement = document.getElementById("year-counter");
    const progressBar = document.getElementById("progress-bar");
    const progressText = document.getElementById("loading-percent");
    const statusText = document.getElementById("status-text");

    const keyYears = [1980, 1983, 1998, 2001, 2003, 2006, 2007, 2008, 2010, 2011, 2012, 2013];
    const statusMessages = [
        "正在建立连接...",
        "加载档案数据...",
        "解析时间线...",
        "验证身份信息...",
        "同步记忆碎片...",
        "重建事件序列...",
        "检测到关键事件...",
        "档案调取完成"
    ];

    let currentYearIndex = 0;
    let progress = 0;
    let messageIndex = 0;

    function updateYear() {
        if (currentYearIndex < keyYears.length) {
            const year = keyYears[currentYearIndex];
            if (yearElement) {
                yearElement.textContent = year;
                
                if (year === 2007) {
                    yearElement.classList.add('highlight');
                    if (statusText) {
                        statusText.textContent = "检测到关键事件: 血舌";
                        statusText.classList.add('error');
                    }
                } else {
                    yearElement.classList.remove('highlight');
                    if (statusText) statusText.classList.remove('error');
                }
            }
            currentYearIndex++;
        }
    }

    function updateProgress() {
        progress += Math.random() * 6 + 2;
        if (progress > 100) progress = 100;
        
        if (progressBar) progressBar.style.width = progress + '%';
        if (progressText) progressText.textContent = Math.floor(progress) + '%';
        
        const newMessageIndex = Math.floor(progress / 14);
        if (newMessageIndex !== messageIndex && newMessageIndex < statusMessages.length) {
            messageIndex = newMessageIndex;
            if (statusText && !statusText.classList.contains('error')) {
                statusText.textContent = statusMessages[messageIndex];
            }
        }
    }

    const timer = setInterval(() => {
        updateProgress();
        
        const targetYearIndex = Math.floor(progress / 100 * keyYears.length);
        if (currentYearIndex < targetYearIndex) {
            updateYear();
        }
        
        if (progress >= 100) {
            clearInterval(timer);
            completeLoading();
        }
    }, 80);

    function completeLoading() {
        if (yearElement) {
            yearElement.textContent = "2007";
            yearElement.classList.add('highlight');
        }
        if (statusText) {
            statusText.textContent = "档案调取完成";
            statusText.classList.remove('error');
            statusText.classList.add('success');
        }
        
        // 标记已看过Loading
        sessionStorage.setItem('hasSeenLoader', 'true');
        
        setTimeout(hideLoader, 600);
    }

    function hideLoader() {
        if (loader) {
            loader.style.opacity = "0";
            loader.style.transition = "opacity 0.8s ease";
            
            setTimeout(() => {
                loader.style.display = "none";
                if (mainContent) mainContent.style.opacity = "1";
            }, 800);
        }
    }
});


// ==========================================
// Part 2: 页面导航与滚动
// ==========================================

function switchTab(mode) {
    const landingMenu = document.getElementById("landing-menu");
    const storyView = document.getElementById("story-view");
    const profilesView = document.getElementById("profiles-view");
    const galleryView = document.getElementById("gallery-view");
    const messagesView = document.getElementById("messages-view");
    const body = document.body;

    // 隐藏首页
    if (landingMenu) {
        landingMenu.style.opacity = "0";
        landingMenu.style.pointerEvents = "none";
        landingMenu.style.position = "absolute";
    }

    // 隐藏所有视图
    if (storyView) storyView.classList.remove("active");
    if (profilesView) profilesView.classList.remove("active");
    if (galleryView) galleryView.classList.remove("active");
    if (messagesView) messagesView.classList.remove("active");
    
    body.className = "";

    setTimeout(() => {
        if (mode === 'story') {
            if (storyView) storyView.classList.add("active");
            body.classList.add("mode-story");
        } 
        else if (mode === 'profiles') {
            if (profilesView) profilesView.classList.add("active");
            body.classList.add("mode-profiles");
        } 
        else if (mode === 'gallery') {
            if (galleryView) galleryView.classList.add("active");
            body.classList.add("mode-gallery");
            generateGallery();
        }
        else if (mode === 'messages') {
            if (messagesView) messagesView.classList.add("active");
            body.classList.add("mode-messages");
            loadMessages();
        }
        
        // 滚动到顶部
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 300);
}

function backToHome() {
    const landingMenu = document.getElementById("landing-menu");
    const storyView = document.getElementById("story-view");
    const profilesView = document.getElementById("profiles-view");
    const galleryView = document.getElementById("gallery-view");
    const messagesView = document.getElementById("messages-view");
    const body = document.body;

    // 显示首页
    if (landingMenu) {
        landingMenu.style.opacity = "1";
        landingMenu.style.pointerEvents = "auto";
        landingMenu.style.position = "relative";
    }

    // 隐藏所有视图
    if (storyView) storyView.classList.remove("active");
    if (profilesView) profilesView.classList.remove("active");
    if (galleryView) galleryView.classList.remove("active");
    if (messagesView) messagesView.classList.remove("active");
    
    body.className = "";
    
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 滚动监听 - 在首页下滑时切换到时间线
let scrollThreshold = 100;
let lastScrollY = 0;
let scrollTimeout;

window.addEventListener('scroll', function() {
    const landingMenu = document.getElementById("landing-menu");
    const storyView = document.getElementById("story-view");
    
    // 只在首页时检测滚动
    if (landingMenu && landingMenu.style.opacity !== "0" && !storyView.classList.contains('active')) {
        const currentScrollY = window.scrollY;
        
        // 向下滚动超过阈值，切换到时间线
        if (currentScrollY > scrollThreshold && currentScrollY > lastScrollY) {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                switchTab('story');
            }, 100);
        }
        
        lastScrollY = currentScrollY;
    }
});


// ==========================================
// Part 3: 页面跳转和图片查看
// ==========================================

function goToPage(url) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    window.location.href = url;
}

// 当前查看的图片索引（用于画廊导航）
let currentImageIndex = 0;
let galleryImageList = [];

function openImageModal(imgSrc) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    const modal = document.getElementById("modal");
    const modalImg = document.getElementById("modal-img");
    
    if (modal && modalImg) {
        modalImg.src = imgSrc;
        modal.classList.add("active");
        document.body.style.overflow = "hidden";
        
        // 更新当前索引
        currentImageIndex = galleryImageList.findIndex(img => img.src === imgSrc);
    }
}

function closeModal() {
    const modal = document.getElementById("modal");
    if (modal) {
        modal.classList.remove("active");
        document.body.style.overflow = "";
    }
}

// 上一张图片
function prevImage() {
    if (galleryImageList.length === 0) return;
    currentImageIndex = (currentImageIndex - 1 + galleryImageList.length) % galleryImageList.length;
    const modalImg = document.getElementById("modal-img");
    if (modalImg) {
        modalImg.src = galleryImageList[currentImageIndex].src;
    }
}

// 下一张图片
function nextImage() {
    if (galleryImageList.length === 0) return;
    currentImageIndex = (currentImageIndex + 1) % galleryImageList.length;
    const modalImg = document.getElementById("modal-img");
    if (modalImg) {
        modalImg.src = galleryImageList[currentImageIndex].src;
    }
}

document.addEventListener('click', function(e) {
    const modal = document.getElementById("modal");
    if (e.target === modal) {
        closeModal();
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
    // 左右箭头切换图片
    if (e.key === 'ArrowLeft') {
        prevImage();
    }
    if (e.key === 'ArrowRight') {
        nextImage();
    }
});


// ==========================================
// Part 4: 画廊生成 - 增强版（瀑布流+分区）
// ==========================================

// 画廊图片配置 - 精选图片（核心档案）
const featuredImages = [
    { src: "hero.jpg", alt: "主视觉", desc: "囚城与雀", category: "scene" },
    { src: "profile_gc.jpg", alt: "高城档案照", desc: "FILE NO. 8008-C", category: "character" },
    { src: "profile_gq.jpg", alt: "高雀档案照", desc: "FILE NO. 8308-Q", category: "character" },
];

// 画廊图片配置 - 可以自由添加更多图片
const galleryImages = [
    // 核心图片
    { src: "img1.jpg", alt: "童年影像", category: "scene" },
    { src: "img2.jpg", alt: "青春岁月", category: "scene" },
    { src: "img_xueshe.jpg", alt: "血舌", category: "scene" },
];

// 自动添加 g1.jpg ~ g50.jpg（可根据实际图片数量调整上限）
for (let i = 1; i <= 50; i++) {
    galleryImages.push({ 
        src: `g${i}.jpg`, 
        alt: `画廊图片 ${i}`,
        category: i <= 5 ? "character" : (i <= 15 ? "scene" : "costume")
    });
}

// 额外的服装图片（可以继续添加）
const costumeImages = [
    { src: "costume_gq_uniform.jpg", alt: "高雀-常服", category: "costume" },
    { src: "costume_gq_dress.jpg", alt: "高雀-便装", category: "costume" },
    { src: "costume_gq_performance.jpg", alt: "高雀-演出服", category: "costume" },
    { src: "costume_gc_uniform.jpg", alt: "高城-军装", category: "costume" },
    { src: "costume_gc_casual.jpg", alt: "高城-便装", category: "costume" },
];

// 合并所有图片
galleryImages.push(...costumeImages);

let galleryGenerated = false;
let currentFilter = 'all';

function generateGallery() {
    const featuredContainer = document.getElementById("featured-gallery");
    const container = document.getElementById("dynamic-gallery");
    if (!container) return;
    
    // 更新全局图片列表（包含精选）
    galleryImageList = [...featuredImages, ...galleryImages];
    
    // 生成精选区
    if (featuredContainer) {
        let featuredHtml = "";
        featuredImages.forEach((img, index) => {
            featuredHtml += `
                <div class="featured-item category-${img.category}" data-category="${img.category}" onclick="openGalleryImage('${img.src}', ${index})">
                    <img src="${img.src}" alt="${img.alt}" loading="lazy" 
                         onerror="this.parentElement.style.display='none'">
                    <div class="featured-overlay">
                        <div class="featured-title">${img.alt}</div>
                        <div class="featured-desc">${img.desc || ''}</div>
                    </div>
                </div>
            `;
        });
        featuredContainer.innerHTML = featuredHtml;
    }
    
    // 生成主画廊区（瀑布流）
    let html = "";
    galleryImages.forEach((img, index) => {
        const categoryClass = img.category ? `category-${img.category}` : '';
        const realIndex = featuredImages.length + index;
        html += `
            <div class="gallery-item ${categoryClass}" data-category="${img.category || 'other'}" onclick="openGalleryImage('${img.src}', ${realIndex})">
                <img src="${img.src}" alt="${img.alt}" loading="lazy" 
                     onerror="this.parentElement.style.display='none'">
                <div class="gallery-item-overlay">
                    <span class="gallery-item-title">${img.alt}</span>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    galleryGenerated = true;
    
    // 初始化筛选按钮
    initGalleryFilters();
}

function openGalleryImage(src, index) {
    if (event) event.stopPropagation();
    currentImageIndex = index;
    openImageModal(src);
}

// 画廊筛选功能
function initGalleryFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.dataset.filter;
            currentFilter = filter;
            
            // 更新按钮状态
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // 筛选图片
            filterGalleryItems(filter);
        });
    });
}

function filterGalleryItems(filter) {
    const items = document.querySelectorAll('.gallery-item');
    items.forEach(item => {
        if (filter === 'all' || item.dataset.category === filter) {
            item.style.display = 'block';
            item.style.animation = 'fadeIn 0.3s ease';
        } else {
            item.style.display = 'none';
        }
    });
}

document.addEventListener("DOMContentLoaded", function() {
    setTimeout(generateGallery, 100);
});


// ==========================================
// Part 5: 时间轴卡片 hover 优化 - 防止闪烁
// ==========================================

document.addEventListener("DOMContentLoaded", function() {
    setTimeout(() => {
        const storyNodes = document.querySelectorAll('.story-node');
        
        storyNodes.forEach(node => {
            let hoverTimeout;
            let isHovering = false;
            
            // 鼠标进入节点区域
            node.addEventListener('mouseenter', function() {
                isHovering = true;
                clearTimeout(hoverTimeout);
                this.classList.add('hover-active');
            });
            
            // 鼠标离开节点区域
            node.addEventListener('mouseleave', function() {
                isHovering = false;
                const self = this;
                
                // 延迟移除hover状态，给用户时间移动到卡片
                hoverTimeout = setTimeout(() => {
                    if (!isHovering) {
                        self.classList.remove('hover-active');
                    }
                }, 300);
            });
            
            // 卡片本身的hover
            const card = node.querySelector('.node-card');
            if (card) {
                card.addEventListener('mouseenter', function() {
                    isHovering = true;
                    clearTimeout(hoverTimeout);
                    node.classList.add('hover-active');
                });
                
                card.addEventListener('mouseleave', function() {
                    isHovering = false;
                    hoverTimeout = setTimeout(() => {
                        if (!isHovering) {
                            node.classList.remove('hover-active');
                        }
                    }, 200);
                });
            }
        });
    }, 500);
});


// ==========================================
// Part 6: 滚动动画
// ==========================================

document.addEventListener("DOMContentLoaded", function() {
    setTimeout(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: "0px 0px -50px 0px"
        });

        document.querySelectorAll('.year-marker, .story-node').forEach(el => {
            el.classList.add('animate-on-scroll');
            observer.observe(el);
        });
    }, 500);
});

// 动画样式
const animationStyle = document.createElement('style');
animationStyle.textContent = `
    .animate-on-scroll {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    .animate-on-scroll.visible {
        opacity: 1;
        transform: translateY(0);
    }
    @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
    }
`;
document.head.appendChild(animationStyle);


// ==========================================
// Part 7: 触摸设备支持
// ==========================================

const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

if (isTouchDevice) {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            document.querySelectorAll('.story-node').forEach(node => {
                node.addEventListener('click', function(e) {
                    if (e.target.closest('.node-card')) return;
                    
                    const isActive = this.classList.contains('hover-active');
                    
                    document.querySelectorAll('.story-node').forEach(n => {
                        n.classList.remove('hover-active');
                    });
                    
                    if (!isActive) {
                        this.classList.add('hover-active');
                    }
                });
            });
            
            document.addEventListener('click', function(e) {
                if (!e.target.closest('.story-node')) {
                    document.querySelectorAll('.story-node').forEach(n => {
                        n.classList.remove('hover-active');
                    });
                }
            });
        }, 500);
    });
    
    const touchStyle = document.createElement('style');
    touchStyle.textContent = `
        .story-node.hover-active .node-card {
            opacity: 1 !important;
            visibility: visible !important;
            pointer-events: auto !important;
        }
    `;
    document.head.appendChild(touchStyle);
}


// ==========================================
// Part 8: 键盘导航支持（已移至Part 12统一处理）
// ==========================================


// ==========================================
// Part 9: 服装/物品浮窗功能（用于档案页面）
// ==========================================

// 服装数据配置
const costumeData = {
    gq: {
        uniform: {
            title: "常服",
            description: "标准07式军装，佩戴上尉军衔。高雀在特种连服役期间的日常着装，简洁利落，衬托出她的飒爽英姿。",
            images: ["costume_gq_uniform_1.jpg", "costume_gq_uniform_2.jpg", "costume_gq_uniform_3.jpg"]
        },
        dress: {
            title: "便装",
            description: "偏爱简约风格，黑色与深蓝居多。退役后更偏爱带有一点叛逆感的穿搭——夸张的耳环、蓝色眼影。",
            images: ["costume_gq_dress_1.jpg", "costume_gq_dress_2.jpg"]
        },
        performance: {
            title: "演出服",
            description: "文工团时期的舞台服装。红色与金色交织，华丽却透着一丝不甘。",
            images: ["costume_gq_performance_1.jpg", "costume_gq_performance_2.jpg"]
        }
    },
    gc: {
        uniform: {
            title: "军装",
            description: "从上尉到中校，军装见证了他的成长。永远笔挺、一丝不苟，如同他的性格。",
            images: ["costume_gc_uniform_1.jpg", "costume_gc_uniform_2.jpg", "costume_gc_uniform_3.jpg"]
        },
        casual: {
            title: "便装",
            description: "难得的休闲时刻。简单的T恤和牛仔裤，却藏不住军人的气质。",
            images: ["costume_gc_casual_1.jpg", "costume_gc_casual_2.jpg"]
        },
        formal: {
            title: "正装",
            description: "出席正式场合的西装。政治联姻后，这样的场合多了起来。",
            images: ["costume_gc_formal_1.jpg"]
        }
    }
};

// 打开服装浮窗
function openCostumeModal(character, type) {
    const data = costumeData[character]?.[type];
    if (!data) return;
    
    const modal = document.getElementById('costume-modal');
    if (!modal) return;
    
    // 填充内容
    modal.querySelector('.costume-title').textContent = data.title;
    modal.querySelector('.costume-desc').textContent = data.description;
    
    // 生成图片画廊
    const gallery = modal.querySelector('.costume-gallery');
    gallery.innerHTML = data.images.map(img => `
        <div class="costume-img-item" onclick="openImageModal('${img}')">
            <img src="${img}" alt="${data.title}" onerror="this.parentElement.style.display='none'">
        </div>
    `).join('');
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// 关闭服装浮窗
function closeCostumeModal() {
    const modal = document.getElementById('costume-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}


// ==========================================
// Part 10: 时间线一键展开功能
// ==========================================

let isRevealAll = false;

function toggleRevealAll() {
    const btn = document.querySelector('.reveal-all-btn');
    const wrapper = document.querySelector('.timeline-wrapper');
    const btnText = btn?.querySelector('.btn-text');
    
    isRevealAll = !isRevealAll;
    
    if (isRevealAll) {
        // 展开所有卡片
        wrapper?.classList.add('reveal-all');
        btn?.classList.add('active');
        if (btnText) btnText.textContent = '收起所有故事';
        
        // 移除所有 hover-active 状态
        document.querySelectorAll('.story-node').forEach(node => {
            node.classList.remove('hover-active');
        });
    } else {
        // 收起所有卡片
        wrapper?.classList.remove('reveal-all');
        btn?.classList.remove('active');
        if (btnText) btnText.textContent = '一键展开故事';
    }
}


// ==========================================
// Part 11: 战地留言板功能
// ==========================================

// 留言数据存储key
const MESSAGES_STORAGE_KEY = 'gaocheng_gaoqi_messages';

// 获取存储的留言
function getStoredMessages() {
    try {
        const stored = localStorage.getItem(MESSAGES_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error('读取留言失败:', e);
        return [];
    }
}

// 保存留言到本地存储
function saveMessages(messages) {
    try {
        localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
        console.error('保存留言失败:', e);
    }
}

// 加载并显示留言
function loadMessages() {
    const messages = getStoredMessages();
    const container = document.getElementById('messages-list');
    if (!container) return;
    
    // 保留预设留言（前3条）
    const presetMessages = container.querySelectorAll('.message-item.preset');
    
    // 清除非预设留言
    const userMessages = container.querySelectorAll('.message-item:not(.preset)');
    userMessages.forEach(msg => msg.remove());
    
    // 渲染用户留言
    messages.forEach(msg => {
        const messageHtml = createMessageHTML(msg);
        container.insertAdjacentHTML('beforeend', messageHtml);
    });
    
    // 更新留言计数
    updateMessageCount();
}

// 创建留言HTML
function createMessageHTML(msg) {
    const avatarChar = msg.sender ? msg.sender.charAt(0) : '匿';
    const isGC = msg.sender && (msg.sender.includes('城') || msg.sender.toLowerCase().includes('gc'));
    
    return `
        <div class="message-item user-message">
            <div class="message-avatar ${isGC ? 'gc' : ''}">${avatarChar}</div>
            <div class="message-body">
                <div class="message-meta">
                    <span class="sender-name">${escapeHtml(msg.sender || '匿名访客')}</span>
                    <span class="message-time">${msg.time}</span>
                </div>
                <div class="message-text">${escapeHtml(msg.content)}</div>
                <div class="message-tag">📍 档案馆留言</div>
            </div>
        </div>
    `;
}

// HTML转义防止XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 提交留言
function submitMessage() {
    const senderInput = document.getElementById('sender-name');
    const contentInput = document.getElementById('message-content');
    
    const sender = senderInput?.value.trim() || '匿名访客';
    const content = contentInput?.value.trim();
    
    if (!content) {
        alert('请输入留言内容');
        contentInput?.focus();
        return;
    }
    
    if (content.length > 500) {
        alert('留言内容不能超过500字');
        return;
    }
    
    // 创建新留言
    const newMessage = {
        id: Date.now(),
        sender: sender,
        content: content,
        time: formatDate(new Date())
    };
    
    // 获取现有留言并添加新留言
    const messages = getStoredMessages();
    messages.push(newMessage);
    saveMessages(messages);
    
    // 添加到页面
    const container = document.getElementById('messages-list');
    if (container) {
        const messageHtml = createMessageHTML(newMessage);
        container.insertAdjacentHTML('beforeend', messageHtml);
        
        // 滚动到新留言
        const newMsg = container.lastElementChild;
        newMsg?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    // 清空输入框
    if (senderInput) senderInput.value = '';
    if (contentInput) contentInput.value = '';
    updateCharCount();
    
    // 更新计数
    updateMessageCount();
    
    // 成功提示
    showToast('留言发送成功！');
}

// 格式化日期
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    return `${year}.${month}.${day} ${hour}:${minute}`;
}

// 更新留言计数
function updateMessageCount() {
    const messages = getStoredMessages();
    const countElement = document.getElementById('total-messages');
    if (countElement) {
        const totalCount = messages.length + 3; // 加上3条预设留言
        countElement.innerHTML = `已收录 <strong>${totalCount}</strong> 条留言`;
    }
}

// 更新字符计数
function updateCharCount() {
    const contentInput = document.getElementById('message-content');
    const countDisplay = document.getElementById('char-current');
    if (contentInput && countDisplay) {
        countDisplay.textContent = contentInput.value.length;
    }
}

// 显示提示消息
function showToast(message) {
    // 创建toast元素
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--blood-red, #8a0303);
        color: #fff;
        padding: 12px 25px;
        border-radius: 4px;
        font-size: 0.9rem;
        z-index: 10000;
        animation: toastIn 0.3s ease, toastOut 0.3s ease 2s forwards;
    `;
    
    document.body.appendChild(toast);
    
    // 3秒后移除
    setTimeout(() => {
        toast.remove();
    }, 2500);
}

// 添加toast动画样式
const toastStyle = document.createElement('style');
toastStyle.textContent = `
    @keyframes toastIn {
        from { opacity: 0; transform: translateX(-50%) translateY(20px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
    @keyframes toastOut {
        from { opacity: 1; transform: translateX(-50%) translateY(0); }
        to { opacity: 0; transform: translateX(-50%) translateY(-20px); }
    }
`;
document.head.appendChild(toastStyle);

// 初始化留言区事件监听
document.addEventListener('DOMContentLoaded', function() {
    // 字符计数监听
    const contentInput = document.getElementById('message-content');
    if (contentInput) {
        contentInput.addEventListener('input', updateCharCount);
    }
    
    // 初始化留言计数
    updateMessageCount();
});


// ==========================================
// Part 12: 键盘快捷键更新
// ==========================================

// 更新键盘导航，添加留言区快捷键
document.addEventListener('keydown', function(e) {
    // 如果正在输入框中，不响应快捷键
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
    }
    
    // 按 Home 键回到首页
    if (e.key === 'Home') {
        backToHome();
    }
    
    // 按数字键快速切换
    if (e.key === '1') switchTab('story');
    if (e.key === '2') switchTab('profiles');
    if (e.key === '3') switchTab('gallery');
    if (e.key === '4') switchTab('messages');
    
    // 按 R 键在时间线页面切换展开/收起
    if (e.key === 'r' || e.key === 'R') {
        const storyView = document.getElementById('story-view');
        if (storyView && storyView.classList.contains('active')) {
            toggleRevealAll();
        }
    }
});