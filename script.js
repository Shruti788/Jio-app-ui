// Global Variables
let currentUser = null;
let selectedPlan = null;
let rechargeHistory = [];
let savedPlans = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
    initializeApp();
    initializeSpeedMeter();
    initializePlanTabs();
    initializeFAQ();
    initializeModals();
    initializeChat();
    initializeRecharge();
    initializeDashboard();
    loadUserData();
});

// Initialize App
function initializeApp() {
    // Check if user is logged in
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        updateUIForLoggedInUser();
    }

    // Mobile menu toggle
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }
}

// 5G Speed Meter Animation
function initializeSpeedMeter() {
    const canvas = document.getElementById('speedCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 120;
    let speed = 0;
    let targetSpeed = 0;
    let animationId;

    function drawSpeedMeter() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Background arc
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0.75 * Math.PI, 2.25 * Math.PI);
        ctx.lineWidth = 20;
        ctx.strokeStyle = '#e0e0e0';
        ctx.stroke();

        // Speed arc
        const speedAngle = 0.75 * Math.PI + (speed / 1000) * 1.5 * Math.PI;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0.75 * Math.PI, speedAngle);
        ctx.lineWidth = 20;

        // Gradient
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop(0, '#0a2885');
        gradient.addColorStop(1, '#00a8ff');
        ctx.strokeStyle = gradient;
        ctx.stroke();

        // Animate speed
        if (speed < targetSpeed) {
            speed += 5;
            document.getElementById('speedValue').textContent = Math.floor(speed);
        } else if (speed > targetSpeed) {
            speed -= 5;
            document.getElementById('speedValue').textContent = Math.floor(speed);
        }

        animationId = requestAnimationFrame(drawSpeedMeter);
    }

    // Start animation
    drawSpeedMeter();

    // Random speed changes
    setInterval(() => {
        targetSpeed = Math.random() * 800 + 200; // 200-1000 Mbps
    }, 3000);

    // Stop animation when not visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                cancelAnimationFrame(animationId);
            } else {
                drawSpeedMeter();
            }
        });
    });

    observer.observe(canvas);
}

// Plan Tabs
function initializePlanTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.plan-tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');

            // Remove active class from all
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked
            button.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

// FAQ Accordion
function initializeFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');

        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Close all FAQs
            faqItems.forEach(faq => faq.classList.remove('active'));

            // Open clicked FAQ if it wasn't active
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

// Modal System
function initializeModals() {
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');
    const otpModal = document.getElementById('otpModal');
    const paymentModal = document.getElementById('paymentModal');
    const closeBtns = document.querySelectorAll('.close');

    // Open modals
    if (loginBtn) {
        loginBtn.addEventListener('click', () => openModal(loginModal));
    }

    if (signupBtn) {
        signupBtn.addEventListener('click', () => openModal(signupModal));
    }

    // Close modals
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            closeAllModals();
        });
    });

    // Close on outside click
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeAllModals();
        }
    });

    // Switch between login and signup
    const switchToSignup = document.getElementById('switchToSignup');
    const switchToLogin = document.getElementById('switchToLogin');

    if (switchToSignup) {
        switchToSignup.addEventListener('click', (e) => {
            e.preventDefault();
            closeAllModals();
            openModal(signupModal);
        });
    }

    if (switchToLogin) {
        switchToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            closeAllModals();
            openModal(loginModal);
        });
    }

    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Signup form
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }

    // OTP form
    const otpForm = document.getElementById('otpForm');
    if (otpForm) {
        otpForm.addEventListener('submit', handleOTPVerification);
    }

    // OTP input navigation
    const otpInputs = document.querySelectorAll('.otp-input');
    otpInputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            if (e.target.value.length === 1 && index < otpInputs.length - 1) {
                otpInputs[index + 1].focus();
            }
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !e.target.value && index > 0) {
                otpInputs[index - 1].focus();
            }
        });
    });

    // Resend OTP
    const resendOTP = document.getElementById('resendOTP');
    if (resendOTP) {
        resendOTP.addEventListener('click', () => {
            showNotification('OTP sent successfully!', 'success');
        });
    }

    // Payment methods
    const paymentBtns = document.querySelectorAll('.payment-btn');
    paymentBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const method = btn.getAttribute('data-method');
            handlePayment(method);
        });
    });
}

function openModal(modal) {
    if (modal) {
        modal.classList.add('show');
    }
}

function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => modal.classList.remove('show'));
}

// Login Handler
function handleLogin(e) {
    e.preventDefault();
    const mobileInput = e.target.querySelector('input[type="tel"]');
    const mobile = mobileInput.value;

    if (mobile.length !== 10) {
        showNotification('Please enter a valid 10-digit mobile number', 'error');
        return;
    }

    // Store mobile for OTP verification
    sessionStorage.setItem('loginMobile', mobile);

    // Show OTP modal
    closeAllModals();
    document.getElementById('otpMobile').textContent = mobile;
    openModal(document.getElementById('otpModal'));

    showNotification('OTP sent to ' + mobile, 'success');
}

// Signup Handler
function handleSignup(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = e.target.querySelector('input[type="text"]').value;
    const mobile = e.target.querySelector('input[type="tel"]').value;
    const email = e.target.querySelector('input[type="email"]').value;

    if (mobile.length !== 10) {
        showNotification('Please enter a valid 10-digit mobile number', 'error');
        return;
    }

    // Store signup data
    sessionStorage.setItem('signupData', JSON.stringify({ name, mobile, email }));
    sessionStorage.setItem('loginMobile', mobile);

    // Show OTP modal
    closeAllModals();
    document.getElementById('otpMobile').textContent = mobile;
    openModal(document.getElementById('otpModal'));

    showNotification('OTP sent to ' + mobile, 'success');
}

// OTP Verification
function handleOTPVerification(e) {
    e.preventDefault();
    const otpInputs = document.querySelectorAll('.otp-input');
    let otp = '';
    otpInputs.forEach(input => otp += input.value);

    if (otp.length !== 6) {
        showNotification('Please enter complete OTP', 'error');
        return;
    }

    // Simulate OTP verification (in real app, this would be API call)
    const mobile = sessionStorage.getItem('loginMobile');
    const signupData = sessionStorage.getItem('signupData');

    let userData;
    if (signupData) {
        userData = JSON.parse(signupData);
    } else {
        // Load existing user or create new
        userData = {
            name: 'Jio User',
            mobile: mobile,
            email: 'user@jio.com'
        };
    }

    // Save user data
    currentUser = userData;
    localStorage.setItem('currentUser', JSON.stringify(userData));

    // Clear session storage
    sessionStorage.removeItem('loginMobile');
    sessionStorage.removeItem('signupData');

    // Clear OTP inputs
    otpInputs.forEach(input => input.value = '');

    closeAllModals();
    updateUIForLoggedInUser();
    showNotification('Login successful!', 'success');
}

// Update UI for logged in user
function updateUIForLoggedInUser() {
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');

    if (loginBtn && signupBtn && currentUser) {
        loginBtn.textContent = 'Dashboard';
        signupBtn.style.display = 'none';

        loginBtn.onclick = () => {
            document.querySelector('.hero').style.display = 'none';
            document.querySelector('.speed-section').style.display = 'none';
            document.querySelector('.plans-section').style.display = 'none';
            document.querySelector('.sim-section').style.display = 'none';
            document.querySelector('.offers-section').style.display = 'none';
            document.querySelector('.faq-section').style.display = 'none';
            document.getElementById('dashboard').style.display = 'grid';

            // Update dashboard data
            document.getElementById('userName').textContent = currentUser.name;
            document.getElementById('userNumber').textContent = currentUser.mobile;
        };
    }
}

// Recharge System
function initializeRecharge() {
    const rechargeForm = document.getElementById('rechargeForm');
    if (rechargeForm) {
        rechargeForm.addEventListener('submit', handleRechargeSubmit);
    }

    const rechargeBtns = document.querySelectorAll('.recharge-btn');
    rechargeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const planAmount = btn.getAttribute('data-plan');
            selectedPlan = planAmount;

            if (!currentUser) {
                showNotification('Please login to recharge', 'error');
                openModal(document.getElementById('loginModal'));
                return;
            }

            showPaymentModal();
        });
    });
}

function handleRechargeSubmit(e) {
    e.preventDefault();
    const mobile = document.getElementById('mobileNumber').value;

    if (mobile.length !== 10) {
        showNotification('Please enter a valid 10-digit mobile number', 'error');
        return;
    }

    if (!currentUser) {
        sessionStorage.setItem('rechargeMobile', mobile);
        showNotification('Please login to continue', 'info');
        openModal(document.getElementById('loginModal'));
        return;
    }

    // Show plans section
    document.querySelector('.plans-section').scrollIntoView({ behavior: 'smooth' });
}

function showPaymentModal() {
    const paymentModal = document.getElementById('paymentModal');
    document.getElementById('paymentMobile').textContent = currentUser.mobile;
    document.getElementById('paymentAmount').textContent = '₹' + selectedPlan;
    openModal(paymentModal);
}

// Payment Handler
function handlePayment(method) {
    showNotification('Processing payment via ' + method.toUpperCase() + '...', 'info');

    // Simulate payment processing
    setTimeout(() => {
        closeAllModals();

        // Add to recharge history
        const recharge = {
            date: new Date().toLocaleDateString(),
            plan: '₹' + selectedPlan,
            amount: '₹' + selectedPlan,
            status: 'Success',
            method: method
        };

        rechargeHistory.unshift(recharge);
        localStorage.setItem('rechargeHistory', JSON.stringify(rechargeHistory));

        showNotification('Recharge successful! Your plan is now active.', 'success');

        // Update dashboard if visible
        updateRechargeHistory();
    }, 2000);
}

// Dashboard
function initializeDashboard() {
    const sidebarItems = document.querySelectorAll('.dashboard-sidebar li:not(#logoutBtn)');
    const sections = document.querySelectorAll('.dashboard-section');

    sidebarItems.forEach(item => {
        item.addEventListener('click', () => {
            const sectionName = item.getAttribute('data-section');

            // Remove active from all
            sidebarItems.forEach(i => i.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));

            // Add active to clicked
            item.classList.add('active');
            document.getElementById(sectionName).classList.add('active');
        });
    });

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Profile form
    const profileForm = document.querySelector('.profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
    }
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');

    // Reset UI
    document.getElementById('dashboard').style.display = 'none';
    document.querySelector('.hero').style.display = 'block';
    document.querySelector('.speed-section').style.display = 'block';
    document.querySelector('.plans-section').style.display = 'block';
    document.querySelector('.sim-section').style.display = 'block';
    document.querySelector('.offers-section').style.display = 'block';
    document.querySelector('.faq-section').style.display = 'block';

    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    loginBtn.textContent = 'Login';
    loginBtn.onclick = null;
    signupBtn.style.display = 'block';

    showNotification('Logged out successfully', 'success');
}

function handleProfileUpdate(e) {
    e.preventDefault();
    const name = document.getElementById('profileName').value;
    const email = document.getElementById('profileEmail').value;

    currentUser.name = name;
    currentUser.email = email;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    document.getElementById('userName').textContent = name;
    showNotification('Profile updated successfully', 'success');
}

function loadUserData() {
    if (!currentUser) return;

    // Load recharge history
    const storedHistory = localStorage.getItem('rechargeHistory');
    if (storedHistory) {
        rechargeHistory = JSON.parse(storedHistory);
    }

    // Load saved plans
    const storedPlans = localStorage.getItem('savedPlans');
    if (storedPlans) {
        savedPlans = JSON.parse(storedPlans);
    }

    // Update profile fields
    if (document.getElementById('profileName')) {
        document.getElementById('profileName').value = currentUser.name;
        document.getElementById('profileEmail').value = currentUser.email;
        document.getElementById('profileMobile').value = currentUser.mobile;
    }

    updateRechargeHistory();
}

function updateRechargeHistory() {
    const tbody = document.getElementById('historyTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (rechargeHistory.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center">No recharge history</td></tr>';
        return;
    }

    rechargeHistory.forEach(recharge => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${recharge.date}</td>
            <td>${recharge.plan}</td>
            <td>${recharge.amount}</td>
            <td><span class="status-badge success">${recharge.status}</span></td>
        `;
        tbody.appendChild(row);
    });
}

// Live Chat
function initializeChat() {
    const chatButton = document.getElementById('chatButton');
    const chatWidget = document.getElementById('chatWidget');
    const chatClose = document.getElementById('chatClose');
    const chatSend = document.getElementById('chatSend');
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');

    if (chatButton) {
        chatButton.addEventListener('click', () => {
            chatWidget.classList.add('show');
            chatButton.style.display = 'none';
        });
    }

    if (chatClose) {
        chatClose.addEventListener('click', () => {
            chatWidget.classList.remove('show');
            chatButton.style.display = 'block';
        });
    }

    function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;

        // Add user message
        const userMsg = document.createElement('div');
        userMsg.className = 'chat-message user';
        userMsg.innerHTML = `<p>${message}</p>`;
        chatMessages.appendChild(userMsg);

        chatInput.value = '';
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Simulate bot response
        setTimeout(() => {
            const botMsg = document.createElement('div');
            botMsg.className = 'chat-message bot';
            botMsg.innerHTML = `<p>${getBotResponse(message)}</p>`;
            chatMessages.appendChild(botMsg);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 1000);
    }

    if (chatSend) {
        chatSend.addEventListener('click', sendMessage);
    }

    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
}

function getBotResponse(message) {
    const msg = message.toLowerCase();

    if (msg.includes('recharge') || msg.includes('plan')) {
        return 'You can recharge your number by selecting a plan from our Plans section. Would you like me to show you our best plans?';
    } else if (msg.includes('5g')) {
        return 'Jio 5G is available in 1000+ cities with speeds up to 1 Gbps! Check if 5G is available in your area.';
    } else if (msg.includes('help') || msg.includes('support')) {
        return 'I\'m here to help! You can ask about recharge plans, 5G services, account issues, or anything else.';
    } else if (msg.includes('sim')) {
        return 'You can get a new Jio SIM or port your number to Jio. Visit our SIM section for more details.';
    } else {
        return 'Thank you for contacting Jio support. Our team will assist you shortly. You can also call 1800-XXX-XXXX for immediate assistance.';
    }
}

// Notification System
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 10px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        animation: slideInRight 0.3s;
        max-width: 300px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.3);
    `;

    // Set color based on type
    switch (type) {
        case 'success':
            notification.style.background = '#10b981';
            break;
        case 'error':
            notification.style.background = '#ef4444';
            break;
        case 'warning':
            notification.style.background = '#f59e0b';
            break;
        default:
            notification.style.background = '#0a2885';
    }

    notification.textContent = message;
    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// API Integration Simulation (For real implementation)
const API_CONFIG = {
    baseURL: 'https://api.jio.com/v1',
    endpoints: {
        login: '/auth/login',
        signup: '/auth/signup',
        verifyOTP: '/auth/verify-otp',
        recharge: '/recharge',
        plans: '/plans',
        user: '/user',
        payment: '/payment'
    }
};

// Simulated API calls (replace with actual API in production)
async function apiCall(endpoint, method = 'GET', data = null) {
    try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Simulate API response
        return {
            success: true,
            data: data,
            message: 'Operation successful'
        };
    } catch (error) {
        console.error('API Error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Razorpay Integration (Example)
function initializeRazorpay(amount, mobile) {
    // This would be the actual Razorpay integration
    const options = {
        key: 'YOUR_RAZORPAY_KEY', // Replace with actual key
        amount: amount * 100, // Amount in paise
        currency: 'INR',
        name: 'MyJio',
        description: 'Recharge Payment',
        handler: function (response) {
            showNotification('Payment successful!', 'success');
            // Update recharge status
        },
        prefill: {
            contact: mobile
        },
        theme: {
            color: '#0a2885'
        }
    };

    // const razorpay = new Razorpay(options);
    // razorpay.open();
}

// Console welcome message
console.log('%cWelcome to MyJio Clone!', 'color: #0a2885; font-size: 20px; font-weight: bold;');
console.log('%cBuilt with HTML, CSS, and JavaScript', 'color: #00a8ff; font-size: 14px;');
console.log('%cNote: This is a demo version. Payment gateways are simulated.', 'color: #f59e0b; font-size: 12px;');