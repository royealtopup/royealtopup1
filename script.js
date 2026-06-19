/**
 * Eagle Shop System Script
 * এটি সব প্রয়োজনীয় লজিক এক জায়গায় নিয়ে এসেছে।
 */

// ১. পেজ লোডিং ও ইনিশিয়ালাইজেশন
document.addEventListener("DOMContentLoaded", function() {
    console.log("System Loaded Successfully");
    // পেজ লোড হওয়ার পর ডিফল্ট পেজ সেট করা
    showPage('home-page');
});

// ২. পেজ নেভিগেশন কন্ট্রোল
function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.style.display = 'none');
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.style.display = 'block';
    }
}

// ৩. টোস্ট নোটিফিকেশন (সিস্টেম ফিডব্যাক)
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerText = message;
    document.body.appendChild(toast);
    
    // অটো রিমুভ
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// ৪. ইউজার একশন (লগইন, রিচার্জ, অর্ডার)
function handleLogin() {
    // এখানে আপনার লগইন লজিক থাকবে
    showToast("Login Successful!", "success");
}

function processOrder(itemPrice) {
    // এখানে অর্ডার প্রসেসিং লজিক থাকবে
    showToast(`Order placed for ৳${itemPrice}`, "success");
}

// ৫. এডমিন কন্ট্রোল
function toggleAdminPanel(status) {
    const adminPanel = document.getElementById('admin-panel');
    if (adminPanel) {
        adminPanel.style.display = status ? 'block' : 'none';
    }
}

// ৬. ইউজার ডাটা হ্যান্ডলিং
function updateWallet(amount) {
    const walletDisplay = document.getElementById('wallet-balance');
    if (walletDisplay) {
        walletDisplay.innerText = amount;
    }
}