/**
 * Royal TopUp Hub - Complete System Script
 * সম্পূর্ণ কার্যকর জাভাস্ক্রিপ্ট সিস্টেম
 */

// ============================================
// ১. গ্লোবাল ভেরিয়েবল এবং স্টেট ম্যানেজমেন্ট
// ============================================
let userState = {
    isLoggedIn: false,
    userName: 'Gamer',
    userEmail: 'user@email.com',
    walletBalance: 1500,
    userId: null
};

let appState = {
    currentPage: 'login',
    isAdminLoggedIn: false,
    selectedPaymentMethod: null,
    selectedAddMoneyMethod: null
};

let orders = [
    { id: 'ORD001', type: 'Diamonds', amount: '500', status: 'completed', date: '2024-01-15' },
    { id: 'ORD002', type: 'Weekly Pass', amount: '৳99', status: 'pending', date: '2024-01-14' }
];

// ============================================
// ২. পেজ লোডিং এবং ইনিশিয়ালাইজেশন
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('System Loaded Successfully');
    initializeSystem();
    setupCursor();
    setupParticles();
    
    // লোডিং স্ক্রিন লুকান
    setTimeout(() => {
        const loader = document.getElementById('pageLoader');
        if (loader) {
            loader.classList.add('hide');
            setTimeout(() => {
                loader.style.display = 'none';
            }, 600);
        }
        // লগইন পেজ দেখান
        showLoginPage();
    }, 2000);
});

function initializeSystem() {
    // এডমিন প্যানেল লুকান
    const adminPage = document.getElementById('admin-page');
    if (adminPage) adminPage.style.display = 'none';
    
    // লগইন পেজ দেখান
    const loginPage = document.getElementById('login-page');
    if (loginPage) loginPage.style.display = 'flex';
    
    // মেইন সাইট লুকান
    const mainSite = document.getElementById('main-site');
    if (mainSite) mainSite.style.display = 'none';
    
    updateWalletDisplay();
}

// ============================================
// ৩. কাস্টম কার্সর এবং ইন্টারঅ্যাকশন
// ============================================
function setupCursor() {
    const cursorDot = document.getElementById('cursor-dot');
    const cursorRing = document.getElementById('cursor-ring');
    const mouseGlow = document.getElementById('mouse-glow');
    
    if (!cursorDot || !cursorRing) return;
    
    document.addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;
        
        if (cursorDot) {
            cursorDot.style.left = clientX + 'px';
            cursorDot.style.top = clientY + 'px';
        }
        if (cursorRing) {
            cursorRing.style.left = clientX + 'px';
            cursorRing.style.top = clientY + 'px';
        }
        if (mouseGlow) {
            mouseGlow.style.left = clientX + 'px';
            mouseGlow.style.top = clientY + 'px';
        }
    });
}

// ============================================
// ৪. পার্টিকেল অ্যানিমেশন
// ============================================
function setupParticles() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    let particles = [];
    
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.5;
            this.opacity = Math.random() * 0.5;
        }
        
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            
            if (this.x > canvas.width) this.x = 0;
            if (this.x < 0) this.x = canvas.width;
            if (this.y > canvas.height) this.y = 0;
            if (this.y < 0) this.y = canvas.height;
        }
        
        draw() {
            ctx.fillStyle = `rgba(180, 79, 255, ${this.opacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    for (let i = 0; i < 50; i++) {
        particles.push(new Particle());
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

// ============================================
// ৫. লগইন এবং রেজিস্ট্রেশন সিস্টেম
// ============================================
function showLoginPage() {
    const loginPage = document.getElementById('login-page');
    if (loginPage) loginPage.style.display = 'flex';
}

function showRegister() {
    const loginForm = document.getElementById('login-form-wrap');
    const registerForm = document.getElementById('register-form-wrap');
    
    if (loginForm) loginForm.style.display = 'none';
    if (registerForm) registerForm.style.display = 'block';
}

function showLogin() {
    const loginForm = document.getElementById('login-form-wrap');
    const registerForm = document.getElementById('register-form-wrap');
    
    if (loginForm) loginForm.style.display = 'block';
    if (registerForm) registerForm.style.display = 'none';
}

function doLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPass').value;
    
    if (!email || !password) {
        showToast('দয়া করে সব ফিল্ড পূরণ করুন', 'error');
        return;
    }
    
    // সিমুলেট লগইন
    userState.isLoggedIn = true;
    userState.userEmail = email;
    userState.userName = email.split('@')[0];
    userState.walletBalance = 1500 + Math.floor(Math.random() * 5000);
    
    showToast('লগইন সফল! 🎉', 'success');
    
    setTimeout(() => {
        goHome();
    }, 1000);
}

function doRegister() {
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPass').value;
    
    if (!name || !email || !password) {
        showToast('সব ফিল্ড পূরণ করুন', 'error');
        return;
    }
    
    userState.isLoggedIn = true;
    userState.userName = name;
    userState.userEmail = email;
    userState.walletBalance = 1000;
    
    showToast('অ্যাকাউন্ট তৈরি হয়েছে! 🚀', 'success');
    
    setTimeout(() => {
        goHome();
    }, 1000);
}

function googleLogin() {
    userState.isLoggedIn = true;
    userState.userName = 'Google User';
    userState.userEmail = 'user@gmail.com';
    userState.walletBalance = 2000;
    
    showToast('Google এ লগইন সফল! ✨', 'success');
    
    setTimeout(() => {
        goHome();
    }, 1000);
}

function doLogout() {
    userState.isLoggedIn = false;
    closePanel();
    showToast('আপনি লগআউট হয়েছেন', 'info');
    
    setTimeout(() => {
        location.reload();
    }, 1000);
}

// ============================================
// ৬. পেজ নেভিগেশন
// ============================================
function goHome() {
    if (!userState.isLoggedIn) {
        showToast('প্রথমে লগইন করুন', 'error');
        return;
    }
    
    const loginPage = document.getElementById('login-page');
    const mainSite = document.getElementById('main-site');
    const adminPage = document.getElementById('admin-page');
    
    if (loginPage) loginPage.style.display = 'none';
    if (mainSite) mainSite.style.display = 'block';
    if (adminPage) adminPage.style.display = 'none';
    
    appState.currentPage = 'home';
    showPage('home-page');
    closePanel();
    updateWalletDisplay();
}

function openPage(pageId) {
    if (!userState.isLoggedIn) {
        showToast('প্রথমে লগইন করুন', 'error');
        return;
    }
    
    closePanel();
    
    // সব পেজ লুকান
    const pages = document.querySelectorAll('[id$="-page"]');
    pages.forEach(page => {
        if (page.id !== 'login-page' && page.id !== 'admin-page') {
            page.style.display = 'none';
        }
    });
    
    // টার্গেট পেজ দেখান
    const targetPage = document.getElementById(pageId + '-page');
    if (targetPage) {
        targetPage.style.display = 'block';
    }
}

function showPage(pageId) {
    const pages = document.querySelectorAll('.page, [id$="-page"]');
    pages.forEach(page => {
        if (page.id === 'login-page' || page.id === 'admin-page' || page.id === 'main-site') {
            return;
        }
        page.style.display = 'none';
    });
    
    const targetPage = document.getElementById(pageId);
    if (targetPage && targetPage.id !== 'login-page' && targetPage.id !== 'admin-page') {
        targetPage.style.display = 'block';
    }
}

// ============================================
// ৭. প্রোডাক্ট এবং রিচার্জ সিস্টেম
// ============================================
function openRecharge(type) {
    if (!userState.isLoggedIn) {
        showToast('প্রথমে লগইন করুন', 'error');
        return;
    }
    
    closePanel();
    openPage('recharge');
    
    // রিচার্জ টাইপ সেট করুন
    const rechargeTitle = document.querySelector('#recharge-page h2');
    let title = 'রিচার্জ করুন';
    
    if (type === 'uid') title = 'ডায়মন্ড টপ আপ';
    if (type === 'weekly') title = 'সাপ্তাহিক পাস';
    if (type === 'evo') title = 'ইভো গান পাস';
    if (type === 'levelup') title = 'লেভেল আপ পাস';
    
    if (rechargeTitle) rechargeTitle.textContent = title;
    
    showToast(`${title} নির্বাচিত হয়েছে`, 'info');
}

// ============================================
// ৮. পেমেন্ট সিস্টেম
// ============================================
function selectPaymentMethod(method, element) {
    appState.selectedPaymentMethod = method;
    
    // সক্রিয় বোতাম হাইলাইট করুন
    const buttons = document.querySelectorAll('.pm-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    if (element) element.classList.add('active');
    
    // পেমেন্ট ডেটা দেখান
    const paymentSection = document.getElementById('paymentDataSection');
    if (paymentSection) paymentSection.style.display = 'block';
}

function selectAddMoneyMethod(method, element) {
    appState.selectedAddMoneyMethod = method;
    
    // সক্রিয় বোতাম হাইলাইট করুন
    const buttons = document.querySelectorAll('.ipm-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    if (element) element.classList.add('active');
    
    // পেমেন্ট সেকশন দেখান
    const paySection = document.getElementById('addMoneyPaySection');
    if (paySection) paySection.style.display = 'block';
}

function copyNumber() {
    const receiverNum = document.getElementById('receiverNum').textContent;
    if (receiverNum) {
        navigator.clipboard.writeText(receiverNum);
        showToast('নম্বর কপি করা হয়েছে! ✓', 'success');
    }
}

function copyAMNumber() {
    const amReceiverNum = document.getElementById('amReceiverNum').textContent;
    if (amReceiverNum) {
        navigator.clipboard.writeText(amReceiverNum);
        showToast('নম্বর কপি করা হয়েছে! ✓', 'success');
    }
}

function submitTopup() {
    const uid = document.getElementById('ffUidInput').value;
    const amount = document.getElementById('amountInput').value;
    const method = appState.selectedPaymentMethod;
    
    if (!uid || !amount || !method) {
        showToast('সব তথ্য পূরণ করুন', 'error');
        return;
    }
    
    const orderId = 'ORD' + Math.floor(Math.random() * 100000);
    orders.push({
        id: orderId,
        type: `Recharge (${amount})`,
        amount: '৳' + amount,
        status: 'pending',
        date: new Date().toLocaleDateString('bn-BD')
    });
    
    showSuccessModal('অর্ডার তৈরি হয়েছে!', `অর্ডার ID: ${orderId}`);
    
    // ফর্ম রিসেট
    document.getElementById('ffUidInput').value = '';
    document.getElementById('amountInput').value = '';
}

function submitPayment() {
    const amount = document.getElementById('payAmountInput').value;
    const txnId = document.getElementById('txnIdInput').value;
    
    if (!amount || !txnId) {
        showToast('সব তথ্য পূরণ করুন', 'error');
        return;
    }
    
    showSuccessModal('পেমেন্ট সফল!', 'আপনার রিচার্জ শীঘ্রই সম্পন্ন হবে');
    
    // ওয়ালেট আপডেট করুন
    userState.walletBalance += parseInt(amount);
    updateWalletDisplay();
}

function submitAddMoney() {
    const amount = document.getElementById('addMoneyAmt').value;
    const txnId = document.getElementById('amTxnId').value;
    
    if (!amount || !txnId) {
        showToast('সব তথ্য পূরণ করুন', 'error');
        return;
    }
    
    // ওয়ালেট ব্যালেন্স বাড়ান
    userState.walletBalance += parseInt(amount);
    
    showSuccessModal('টাকা যোগ হয়েছে!', `৳${amount} আপনার ওয়ালেটে যুক্ত হয়েছে`);
    
    // ফর্ম রিসেট
    document.getElementById('addMoneyAmt').value = '';
    document.getElementById('amTxnId').value = '';
    
    updateWalletDisplay();
}

// ============================================
// ৯. প্রোফাইল এবং অ্যাকাউন্ট ম্যানেজমেন্ট
// ============================================
function openProfile(tab) {
    if (!userState.isLoggedIn) {
        showToast('প্রথমে লগইন করুন', 'error');
        return;
    }
    
    const profilePanel = document.getElementById('profilePanel');
    if (profilePanel) {
        profilePanel.style.display = 'flex';
        
        // প্যানেল আপডেট করুন
        const panelUserName = document.getElementById('panelUserName');
        const panelUserEmail = document.getElementById('panelUserEmail');
        
        if (panelUserName) panelUserName.textContent = userState.userName;
        if (panelUserEmail) panelUserEmail.textContent = userState.userEmail;
        
        updateWalletDisplay();
    }
    
    if (tab === 'orders') {
        openPage('orders');
        loadOrders();
    } else if (tab === 'wallet') {
        openPage('addmoney');
    } else if (tab === 'account') {
        showToast('অ্যাকাউন্ট সেটিংস শীঘ্রই আসছে', 'info');
    }
}

function profileNav(page) {
    if (page === 'account') {
        showToast('অ্যাকাউন্ট সেটিংস শীঘ্রই আসছে', 'info');
    } else if (page === 'support') {
        showToast('সাপোর্ট: support@royaltopuphub.com', 'info');
    } else {
        openProfile(page);
    }
}

function loadOrders() {
    const ordersList = document.getElementById('ordersList');
    if (!ordersList) return;
    
    ordersList.innerHTML = '';
    
    orders.forEach(order => {
        const li = document.createElement('li');
        const statusClass = order.status === 'completed' ? 'status-done' : 'status-pending';
        const statusText = order.status === 'completed' ? '✅ সম্পন্ন' : '⏳ অপেক্ষমাণ';
        
        li.innerHTML = `
            <div class="order-item">
                <div class="order-info">
                    <div class="order-id">${order.id}</div>
                    <div class="order-type">${order.type}</div>
                    <div class="order-date">${order.date}</div>
                </div>
                <div class="order-amount">${order.amount}</div>
                <div class="order-status ${statusClass}">${statusText}</div>
            </div>
        `;
        
        ordersList.appendChild(li);
    });
}

// ============================================
// ১০. অ্যাডমিন প্যানেল সিস্টেম
// ============================================
function showAdminLogin() {
    const modal = document.getElementById('adminLoginModal');
    if (modal) modal.style.display = 'flex';
}

function doAdminLogin() {
    const username = document.getElementById('adminUser').value;
    const password = document.getElementById('adminPass').value;
    
    // ডেমো ক্রেডেনশিয়াল
    if (username === 'admin' && password === 'admin123') {
        appState.isAdminLoggedIn = true;
        closeModal('adminLoginModal');
        
        const loginPage = document.getElementById('login-page');
        const mainSite = document.getElementById('main-site');
        const adminPage = document.getElementById('admin-page');
        
        if (loginPage) loginPage.style.display = 'none';
        if (mainSite) mainSite.style.display = 'none';
        if (adminPage) adminPage.style.display = 'block';
        
        showToast('অ্যাডমিন প্যানেলে স্বাগতম! 🛡️', 'success');
        adminTab('dashboard');
    } else {
        showToast('ভুল ইউজারনেম বা পাসওয়ার্ড', 'error');
    }
}

function exitAdmin() {
    appState.isAdminLoggedIn = false;
    const adminPage = document.getElementById('admin-page');
    if (adminPage) adminPage.style.display = 'none';
    
    showToast('অ্যাডমিন প্যানেল বন্ধ করা হয়েছে', 'info');
    showLoginPage();
}

function adminTab(tab, element) {
    // সক্রিয় ট্যাব হাইলাইট করুন
    const navItems = document.querySelectorAll('.admin-nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    
    if (element) element.classList.add('active');
    
    // কন্টেন্ট লোড করুন
    const adminMain = document.getElementById('adminMain');
    if (!adminMain) return;
    
    let content = '';
    
    if (tab === 'dashboard') {
        content = `
            <div class="admin-dashboard">
                <h2>📊 ড্যাশবোর্ড</h2>
                <div class="admin-stats">
                    <div class="stat-card">
                        <div class="stat-icon">💰</div>
                        <div class="stat-content">
                            <div class="stat-label">মোট রাজস্ব</div>
                            <div class="stat-value">৳${(Math.random() * 500000).toFixed(0)}</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">👥</div>
                        <div class="stat-content">
                            <div class="stat-label">মোট ইউজার</div>
                            <div class="stat-value">${Math.floor(Math.random() * 10000)}</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">📦</div>
                        <div class="stat-content">
                            <div class="stat-label">মোট অর্ডার</div>
                            <div class="stat-value">${Math.floor(Math.random() * 50000)}</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">⭐</div>
                        <div class="stat-content">
                            <div class="stat-label">গড় রেটিং</div>
                            <div class="stat-value">4.${Math.floor(Math.random() * 10)}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else if (tab === 'orders') {
        content = '<h2>📦 অর্ডার ম্যানেজমেন্ট</h2><p style="color: var(--text-muted); margin-top: 20px;">সব অর্ডার এখানে দেখা যাবে</p>';
    } else if (tab === 'users') {
        content = '<h2>👥 ইউজার ম্যানেজমেন্ট</h2><p style="color: var(--text-muted); margin-top: 20px;">সব ইউজার এখানে দেখা যাবে</p>';
    } else if (tab === 'packages') {
        content = '<h2>💎 প্যাকেজ ম্যানেজমেন্ট</h2><p style="color: var(--text-muted); margin-top: 20px;">সব প্যাকেজ এখানে সম্পাদনা করা যাবে</p>';
    } else if (tab === 'banners') {
        content = '<h2>🖼️ ব্যানার ম্যানেজমেন্ট</h2><p style="color: var(--text-muted); margin-top: 20px;">সব ব্যানার এখানে সম্পাদনা করা যাবে</p>';
    } else if (tab === 'payments') {
        content = '<h2>💳 পেমেন্ট ম্যানেজমেন্ট</h2><p style="color: var(--text-muted); margin-top: 20px;">পেমেন্ট মেথড কনফিগার করুন</p>';
    } else if (tab === 'settings') {
        content = '<h2>⚙️ সেটিংস</h2><p style="color: var(--text-muted); margin-top: 20px;">সিস্টেম সেটিংস এখানে পরিচালনা করুন</p>';
    }
    
    adminMain.innerHTML = content;
}

// ============================================
// ১১. স্লাইডার সিস্টেম
// ============================================
let currentSlide = 0;

function goSlide(index) {
    const dots = document.querySelectorAll('.slider-dots .dot');
    dots.forEach((dot, i) => {
        if (i === index) dot.classList.add('active');
        else dot.classList.remove('active');
    });
    
    const track = document.getElementById('sliderTrack');
    if (track) {
        track.style.transform = `translateX(-${index * 100}%)`;
    }
    
    currentSlide = index;
}

function nextSlide() {
    const slides = document.querySelectorAll('.slide');
    let next = (currentSlide + 1) % slides.length;
    goSlide(next);
}

function prevSlide() {
    const slides = document.querySelectorAll('.slide');
    let prev = (currentSlide - 1 + slides.length) % slides.length;
    goSlide(prev);
}

// অটো স্লাইড
setInterval(() => {
    if (appState.currentPage === 'home') {
        nextSlide();
    }
}, 5000);

// ============================================
// ১२. টোস্ট নোটিফিকেশন
// ============================================
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        padding: 14px 24px;
        background: ${type === 'success' ? 'rgba(0, 255, 136, 0.15)' : type === 'error' ? 'rgba(255, 34, 68, 0.15)' : 'rgba(26, 143, 255, 0.15)'};
        border: 1px solid ${type === 'success' ? 'rgba(0, 255, 136, 0.3)' : type === 'error' ? 'rgba(255, 34, 68, 0.3)' : 'rgba(26, 143, 255, 0.3)'};
        border-radius: 10px;
        color: ${type === 'success' ? '#00ff88' : type === 'error' ? '#ff2244' : '#1a8fff'};
        font-family: 'Exo 2', sans-serif;
        font-size: 13px;
        z-index: 10000;
        animation: toastSlide 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // CSS অ্যানিমেশন যোগ করুন
    const style = document.createElement('style');
    style.textContent = `
        @keyframes toastSlide {
            from { transform: translateX(400px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    if (!document.querySelector('style[data-toast]')) {
        style.setAttribute('data-toast', 'true');
        document.head.appendChild(style);
    }
    
    // অটো রিমুভ
    setTimeout(() => {
        toast.style.animation = 'toastSlide 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============================================
// १३. মডাল এবং প্যানেল ম্যানেজমেন্ট
// ============================================
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

function closePanel() {
    const panel = document.getElementById('profilePanel');
    if (panel) {
        panel.style.display = 'none';
    }
}

function closeProfileOnBg(event) {
    if (event.target.id === 'profilePanel') {
        closePanel();
    }
}

function showSuccessModal(title, message) {
    const successModal = document.getElementById('successModal');
    if (successModal) {
        const titleEl = document.getElementById('successTitle');
        const msgEl = document.getElementById('successMsg');
        
        if (titleEl) titleEl.textContent = title;
        if (msgEl) msgEl.textContent = message;
        
        successModal.style.display = 'flex';
    }
}

// ============================================
// १४. ওয়ালেট এবং ব্যালেন্স ম্যানেজমেন্ট
// ============================================
function updateWalletDisplay() {
    const headerWallet = document.getElementById('headerWalletBal');
    const panelWallet = document.getElementById('panelWalletBal');
    
    const balanceFormatted = `৳${userState.walletBalance.toFixed(2)}`;
    
    if (headerWallet) headerWallet.textContent = balanceFormatted;
    if (panelWallet) panelWallet.textContent = balanceFormatted;
}

function updateWallet(amount) {
    userState.walletBalance = amount;
    updateWalletDisplay();
}

// ============================================
// १५. স্ক্রিপ্ট লোড সম্পূর্ণ
// ============================================
console.log('✅ সব ফিচার সফলভাবে লোড হয়েছে!');
