// Mock Data
const mockData = {
    categories: [
        {
            id: 1,
            name: "Photography",
            description: "Capture your special moments with professional photographers.",
            icon: "fa-camera",
            color: "photography",
            vendors: 125
        },
        {
            id: 2,
            name: "Catering",
            description: "Delicious food and beverage services for your events.",
            icon: "fa-utensils",
            color: "catering",
            vendors: 89
        },
        {
            id: 3,
            name: "Decoration",
            description: "Transform your venue with stunning decorations.",
            icon: "fa-palette",
            color: "decoration",
            vendors: 76
        },
        {
            id: 4,
            name: "Venue",
            description: "Find the perfect location for your special event.",
            icon: "fa-map-marker-alt",
            color: "venue",
            vendors: 54
        }
    ],
    vendors: [
        {
            id: 1,
            name: "Capture Moments",
            category: "Photography",
            rating: 4.9,
            reviews: 127,
            price: 800,
            description: "Specializing in wedding and corporate event photography with 10+ years of experience.",
            location: "New York, NY",
            featured: true,
            portfolio: ["photo1.jpg", "photo2.jpg", "photo3.jpg"]
        },
        {
            id: 2,
            name: "Tasty Bites",
            category: "Catering",
            rating: 4.8,
            reviews: 89,
            price: 1200,
            description: "Gourmet catering services with customizable menus for all types of events.",
            location: "Los Angeles, CA",
            featured: true,
            portfolio: ["food1.jpg", "food2.jpg", "food3.jpg"]
        },
        {
            id: 3,
            name: "Elegant Decor",
            category: "Decoration",
            rating: 4.7,
            reviews: 64,
            price: 1500,
            description: "Creating magical atmospheres with custom decorations and floral arrangements.",
            location: "Chicago, IL",
            featured: true,
            portfolio: ["decor1.jpg", "decor2.jpg", "decor3.jpg"]
        }
    ],
    testimonials: [
        {
            id: 1,
            name: "Sarah Johnson",
            event: "Wedding",
            text: "EventPro made planning our wedding so much easier! Found the perfect photographer and caterer through the platform.",
            rating: 5
        },
        {
            id: 2,
            name: "Michael Chen",
            event: "Corporate Event",
            text: "The vendor comparison feature saved us hours of research. Highly recommend for corporate event planning!",
            rating: 5
        },
        {
            id: 3,
            name: "Emily Rodriguez",
            event: "Birthday Party",
            text: "Beautiful interface and great selection of vendors. The decoration services we found were exceptional.",
            rating: 4
        }
    ]
};

// DOM Elements
const landingPage = document.getElementById('landingPage');
const dashboard = document.getElementById('dashboard');
const authModal = document.getElementById('authModal');
const vendorModal = document.getElementById('vendorModal');
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const closeModal = document.querySelector('.close-modal');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadCategories();
    loadVendors();
    loadTestimonials();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Auth buttons
    loginBtn.addEventListener('click', () => openAuthModal('login'));
    signupBtn.addEventListener('click', () => openAuthModal('signup'));
    
    // Close modal
    closeModal.addEventListener('click', closeAuthModal);
    
    // Close modal when clicking outside
    authModal.addEventListener('click', (e) => {
        if (e.target === authModal) closeAuthModal();
    });
    
    vendorModal.addEventListener('click', (e) => {
        if (e.target === vendorModal) closeVendorModal();
    });
}

// Load categories
function loadCategories() {
    const categoriesGrid = document.getElementById('categoriesGrid');
    categoriesGrid.innerHTML = '';
    
    mockData.categories.forEach(category => {
        const categoryCard = document.createElement('div');
        categoryCard.className = 'category-card';
        categoryCard.innerHTML = `
            <div class="category-icon ${category.color}">
                <i class="fas ${category.icon}"></i>
            </div>
            <div class="category-content">
                <h3>${category.name}</h3>
                <p>${category.description}</p>
                <a href="#" class="category-link">
                    Explore <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        `;
        categoriesGrid.appendChild(categoryCard);
    });
}

// Load vendors
function loadVendors() {
    const vendorsGrid = document.getElementById('vendorsGrid');
    vendorsGrid.innerHTML = '';
    
    mockData.vendors.forEach(vendor => {
        const vendorCard = document.createElement('div');
        vendorCard.className = 'vendor-card';
        vendorCard.innerHTML = `
            <div class="vendor-header" style="background: linear-gradient(135deg, var(--primary) 0%, #8b5cf6 100%);">
                <div class="vendor-rating">
                    <i class="fas fa-star"></i> ${vendor.rating}
                </div>
            </div>
            <div class="vendor-body">
                <div class="vendor-info">
                    <div class="vendor-avatar">
                        <i class="fas fa-${vendor.category.toLowerCase() === 'photography' ? 'camera' : 
                                          vendor.category.toLowerCase() === 'catering' ? 'utensils' : 
                                          vendor.category.toLowerCase() === 'decoration' ? 'palette' : 'map-marker-alt'}"></i>
                    </div>
                    <div class="vendor-details">
                        <h3>${vendor.name}</h3>
                        <p>${vendor.category} • ${vendor.location}</p>
                    </div>
                </div>
                <p class="vendor-description">${vendor.description}</p>
                <div class="vendor-footer">
                    <div class="vendor-price">$${vendor.price}+</div>
                    <button class="btn btn-primary view-vendor" data-id="${vendor.id}">
                        View Details
                    </button>
                </div>
            </div>
        `;
        vendorsGrid.appendChild(vendorCard);
    });
    
    // Add event listeners to vendor buttons
    document.querySelectorAll('.view-vendor').forEach(button => {
        button.addEventListener('click', function() {
            const vendorId = parseInt(this.getAttribute('data-id'));
            openVendorModal(vendorId);
        });
    });
}

// Load testimonials
function loadTestimonials() {
    const testimonialsGrid = document.getElementById('testimonialsGrid');
    testimonialsGrid.innerHTML = '';
    
    mockData.testimonials.forEach(testimonial => {
        const testimonialCard = document.createElement('div');
        testimonialCard.className = 'testimonial-card';
        testimonialCard.innerHTML = `
            <p class="testimonial-text">"${testimonial.text}"</p>
            <div class="testimonial-author">
                <div class="author-avatar"></div>
                <div class="author-info">
                    <h4>${testimonial.name}</h4>
                    <p>${testimonial.event}</p>
                </div>
            </div>
        `;
        testimonialsGrid.appendChild(testimonialCard);
    });
}

// Open auth modal
function openAuthModal(type) {
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    if (type === 'login') {
        modalTitle.textContent = 'Login';
        modalBody.innerHTML = `
            <div class="auth-tabs">
                <button class="auth-tab active" data-type="user">Event Organizer</button>
                <button class="auth-tab" data-type="vendor">Service Provider</button>
            </div>
            <form id="loginForm">
                <div class="form-group">
                    <label for="loginEmail">Email</label>
                    <input type="email" id="loginEmail" required>
                </div>
                <div class="form-group">
                    <label for="loginPassword">Password</label>
                    <input type="password" id="loginPassword" required>
                </div>
                <button type="submit" class="btn btn-primary" style="width: 100%;">Login</button>
                <div class="form-footer">
                    <p>Don't have an account? <a href="#" id="switchToSignup">Sign up</a></p>
                </div>
            </form>
        `;
    } else {
        modalTitle.textContent = 'Sign Up';
        modalBody.innerHTML = `
            <div class="user-type-selector">
                <div class="user-type active" data-type="user">
                    <i class="fas fa-user"></i>
                    <h3>Event Organizer</h3>
                    <p>Planning an event</p>
                </div>
                <div class="user-type" data-type="vendor">
                    <i class="fas fa-briefcase"></i>
                    <h3>Service Provider</h3>
                    <p>Offering services</p>
                </div>
            </div>
            <form id="signupForm">
                <div class="form-row">
                    <div class="form-group">
                        <label for="signupFirstName">First Name</label>
                        <input type="text" id="signupFirstName" required>
                    </div>
                    <div class="form-group">
                        <label for="signupLastName">Last Name</label>
                        <input type="text" id="signupLastName" required>
                    </div>
                </div>
                <div class="form-group">
                    <label for="signupEmail">Email</label>
                    <input type="email" id="signupEmail" required>
                </div>
                <div class="form-group">
                    <label for="signupPassword">Password</label>
                    <input type="password" id="signupPassword" required>
                </div>
                <div class="form-group">
                    <label for="signupCity">City</label>
                    <input type="text" id="signupCity" required>
                </div>
                <button type="submit" class="btn btn-primary" style="width: 100%;">Create Account</button>
                <div class="form-footer">
                    <p>Already have an account? <a href="#" id="switchToLogin">Login</a></p>
                </div>
            </form>
        `;
    }
    
    authModal.style.display = 'flex';
    
    // Add event listeners for form switching
    document.getElementById('switchToSignup')?.addEventListener('click', (e) => {
        e.preventDefault();
        openAuthModal('signup');
    });
    
    document.getElementById('switchToLogin')?.addEventListener('click', (e) => {
        e.preventDefault();
        openAuthModal('login');
    });
    
    // Add event listeners for user type selection
    document.querySelectorAll('.user-type').forEach(type => {
        type.addEventListener('click', function() {
            document.querySelectorAll('.user-type').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Add event listeners for auth tabs
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Form submission
    document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
    document.getElementById('signupForm')?.addEventListener('submit', handleSignup);
}

// Close auth modal
function closeAuthModal() {
    authModal.style.display = 'none';
}

// Open vendor modal
function openVendorModal(vendorId) {
    const vendor = mockData.vendors.find(v => v.id === vendorId);
    if (!vendor) return;
    
    const vendorModalContent = document.querySelector('.vendor-modal');
    vendorModalContent.innerHTML = `
        <div class="vendor-modal-header">
            <div class="vendor-rating">
                <i class="fas fa-star"></i> ${vendor.rating} (${vendor.reviews} reviews)
            </div>
        </div>
        <div class="vendor-modal-body">
            <div class="vendor-modal-info">
                <div class="vendor-modal-avatar">
                    <i class="fas fa-${vendor.category.toLowerCase() === 'photography' ? 'camera' : 
                                      vendor.category.toLowerCase() === 'catering' ? 'utensils' : 
                                      vendor.category.toLowerCase() === 'decoration' ? 'palette' : 'map-marker-alt'}"></i>
                </div>
                <div class="vendor-modal-details">
                    <h2>${vendor.name}</h2>
                    <p>${vendor.category} • ${vendor.location}</p>
                    <div class="vendor-modal-rating">
                        ${'<i class="fas fa-star"></i>'.repeat(Math.floor(vendor.rating))}
                        ${vendor.rating % 1 !== 0 ? '<i class="fas fa-star-half-alt"></i>' : ''}
                        <span>${vendor.rating} (${vendor.reviews} reviews)</span>
                    </div>
                </div>
            </div>
            
            <div class="vendor-modal-content">
                <div>
                    <h3>About</h3>
                    <p>${vendor.description}</p>
                    
                    <h3 style="margin-top: 20px;">Portfolio</h3>
                    <div class="vendor-modal-gallery">
                        ${Array(6).fill().map((_, i) => 
                            `<div class="gallery-item" style="background: linear-gradient(135deg, #${Math.floor(Math.random()*16777215).toString(16)} 0%, #${Math.floor(Math.random()*16777215).toString(16)} 100%);"></div>`
                        ).join('')}
                    </div>
                </div>
                
                <div class="vendor-modal-actions">
                    <div class="price">$${vendor.price}</div>
                    <div class="availability">
                        <p>Availability</p>
                        <span class="availability-status">Available</span>
                    </div>
                    <button class="btn btn-primary" style="width: 100%; margin-bottom: 10px;">
                        <i class="fas fa-heart"></i> Add to Shortlist
                    </button>
                    <button class="btn btn-outline" style="width: 100%;">
                        Contact Vendor
                    </button>
                </div>
            </div>
        </div>
    `;
    
    vendorModal.style.display = 'flex';
}

// Close vendor modal
function closeVendorModal() {
    vendorModal.style.display = 'none';
}

// Handle login
function handleLogin(e) {
    e.preventDefault();
    // In a real app, this would make an API call
    const userType = document.querySelector('.auth-tab.active')?.getAttribute('data-type') || 'user';
    simulateLogin(userType);
}

// Handle signup
function handleSignup(e) {
    e.preventDefault();
    // In a real app, this would make an API call
    const userType = document.querySelector('.user-type.active')?.getAttribute('data-type') || 'user';
    simulateSignup(userType);
}

// Simulate login
function simulateLogin(userType) {
    // Show loading state
    const submitBtn = document.querySelector('#loginForm button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Logging in...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        closeAuthModal();
        showDashboard(userType);
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }, 1500);
}

// Simulate signup
function simulateSignup(userType) {
    // Show loading state
    const submitBtn = document.querySelector('#signupForm button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Creating account...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        closeAuthModal();
        showDashboard(userType);
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }, 1500);
}

// Show dashboard
function showDashboard(userType) {
    landingPage.style.display = 'none';
    dashboard.style.display = 'block';
    
    // Load the appropriate dashboard
    if (userType === 'user') {
        loadUserDashboard();
    } else {
        loadVendorDashboard();
    }
}

// Load user dashboard
function loadUserDashboard() {
    dashboard.innerHTML = `
        <div class="dashboard-header">
            <div class="container dashboard-container">
                <div class="logo">
                    <i class="fas fa-calendar-alt"></i>
                    <span>EventPro</span>
                </div>
                <div class="dashboard-nav">
                    <a href="#" class="active" data-section="overview">Overview</a>
                    <a href="#" data-section="search">Find Vendors</a>
                    <a href="#" data-section="shortlist">Shortlist</a>
                    <a href="#" data-section="bookings">Bookings</a>
                    <a href="#" data-section="profile">Profile</a>
                </div>
                <button class="btn btn-outline" id="logoutBtn">Logout</button>
            </div>
        </div>
        
        <div class="dashboard-content">
            <div class="container">
                <div class="dashboard-section active" id="overview">
                    <div class="dashboard-welcome">
                        <h2>Welcome back, Sarah!</h2>
                        <p>Ready to plan your next amazing event?</p>
                    </div>
                    
                    <div class="analytics-grid">
                        <div class="analytics-card">
                            <i class="fas fa-heart"></i>
                            <h3>5</h3>
                            <p>Vendors Shortlisted</p>
                        </div>
                        <div class="analytics-card">
                            <i class="fas fa-calendar-check"></i>
                            <h3>2</h3>
                            <p>Upcoming Events</p>
                        </div>
                        <div class="analytics-card">
                            <i class="fas fa-star"></i>
                            <h3>4.8</h3>
                            <p>Average Rating</p>
                        </div>
                        <div class="analytics-card">
                            <i class="fas fa-dollar-sign"></i>
                            <h3>$3,200</h3>
                            <p>Total Spent</p>
                        </div>
                    </div>
                    
                    <h3 style="margin-bottom: 20px;">Recent Activity</h3>
                    <div class="shortlist-items">
                        <div class="shortlist-item">
                            <div class="shortlist-info">
                                <h4>Capture Moments</h4>
                                <p>Photography • Added 2 days ago</p>
                            </div>
                            <div class="shortlist-actions">
                                <button class="btn-remove"><i class="fas fa-times"></i></button>
                                <button class="btn-compare"><i class="fas fa-balance-scale"></i></button>
                            </div>
                        </div>
                        <div class="shortlist-item">
                            <div class="shortlist-info">
                                <h4>Tasty Bites</h4>
                                <p>Catering • Added 1 week ago</p>
                            </div>
                            <div class="shortlist-actions">
                                <button class="btn-remove"><i class="fas fa-times"></i></button>
                                <button class="btn-compare"><i class="fas fa-balance-scale"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="dashboard-section" id="search">
                    <div class="filters">
                        <div class="filter-group">
                            <h3>Category</h3>
                            <div class="filter-options">
                                <button class="filter-option active">All</button>
                                <button class="filter-option">Photography</button>
                                <button class="filter-option">Catering</button>
                                <button class="filter-option">Decoration</button>
                                <button class="filter-option">Venue</button>
                            </div>
                        </div>
                        
                        <div class="filter-group">
                            <h3>Location</h3>
                            <div class="filter-options">
                                <button class="filter-option active">Any</button>
                                <button class="filter-option">New York</button>
                                <button class="filter-option">Los Angeles</button>
                                <button class="filter-option">Chicago</button>
                                <button class="filter-option">Miami</button>
                            </div>
                        </div>
                        
                        <div class="filter-group">
                            <h3>Budget Range</h3>
                            <input type="range" class="range-slider" min="0" max="5000" value="2500">
                            <div class="range-values">
                                <span>$0</span>
                                <span>$2500</span>
                                <span>$5000+</span>
                            </div>
                        </div>
                        
                        <div class="filter-group">
                            <h3>Rating</h3>
                            <div class="filter-options">
                                <button class="filter-option active">Any</button>
                                <button class="filter-option">4.5+</button>
                                <button class="filter-option">4.0+</button>
                                <button class="filter-option">3.5+</button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="vendors-grid">
                        ${mockData.vendors.map(vendor => `
                            <div class="vendor-card">
                                <div class="vendor-header" style="background: linear-gradient(135deg, var(--primary) 0%, #8b5cf6 100%);">
                                    <div class="vendor-rating">
                                        <i class="fas fa-star"></i> ${vendor.rating}
                                    </div>
                                </div>
                                <div class="vendor-body">
                                    <div class="vendor-info">
                                        <div class="vendor-avatar">
                                            <i class="fas fa-${vendor.category.toLowerCase() === 'photography' ? 'camera' : 
                                                              vendor.category.toLowerCase() === 'catering' ? 'utensils' : 
                                                              vendor.category.toLowerCase() === 'decoration' ? 'palette' : 'map-marker-alt'}"></i>
                                        </div>
                                        <div class="vendor-details">
                                            <h3>${vendor.name}</h3>
                                            <p>${vendor.category} • ${vendor.location}</p>
                                        </div>
                                    </div>
                                    <p class="vendor-description">${vendor.description}</p>
                                    <div class="vendor-footer">
                                        <div class="vendor-price">$${vendor.price}+</div>
                                        <button class="btn btn-primary view-vendor" data-id="${vendor.id}">
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="dashboard-section" id="shortlist">
                    <h2>My Shortlist</h2>
                    <p style="margin-bottom: 30px; color: var(--gray);">Vendors you've saved for comparison</p>
                    
                    <div class="shortlist-items">
                        <div class="shortlist-item">
                            <div class="shortlist-info">
                                <h4>Capture Moments</h4>
                                <p>Photography • $800+ • 4.9★</p>
                            </div>
                            <div class="shortlist-actions">
                                <button class="btn-remove"><i class="fas fa-times"></i></button>
                                <button class="btn-compare"><i class="fas fa-balance-scale"></i></button>
                            </div>
                        </div>
                        <div class="shortlist-item">
                            <div class="shortlist-info">
                                <h4>Tasty Bites</h4>
                                <p>Catering • $1200+ • 4.8★</p>
                            </div>
                            <div class="shortlist-actions">
                                <button class="btn-remove"><i class="fas fa-times"></i></button>
                                <button class="btn-compare"><i class="fas fa-balance-scale"></i></button>
                            </div>
                        </div>
                        <div class="shortlist-item">
                            <div class="shortlist-info">
                                <h4>Elegant Decor</h4>
                                <p>Decoration • $1500+ • 4.7★</p>
                            </div>
                            <div class="shortlist-actions">
                                <button class="btn-remove"><i class="fas fa-times"></i></button>
                                <button class="btn-compare"><i class="fas fa-balance-scale"></i></button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="comparison-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Vendor</th>
                                    <th>Price</th>
                                    <th>Rating</th>
                                    <th>Location</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Capture Moments</td>
                                    <td>$800+</td>
                                    <td>4.9★</td>
                                    <td>New York, NY</td>
                                    <td><button class="btn btn-primary">Select</button></td>
                                </tr>
                                <tr>
                                    <td>Tasty Bites</td>
                                    <td>$1200+</td>
                                    <td>4.8★</td>
                                    <td>Los Angeles, CA</td>
                                    <td><button class="btn btn-primary">Select</button></td>
                                </tr>
                                <tr>
                                    <td>Elegant Decor</td>
                                    <td>$1500+</td>
                                    <td>4.7★</td>
                                    <td>Chicago, IL</td>
                                    <td><button class="btn btn-primary">Select</button></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div class="dashboard-section" id="bookings">
                    <h2>Booking History</h2>
                    <p style="margin-bottom: 30px; color: var(--gray);">Your past and upcoming event bookings</p>
                    
                    <div class="shortlist-items">
                        <div class="shortlist-item">
                            <div class="shortlist-info">
                                <h4>Sarah & Mike's Wedding</h4>
                                <p>June 15, 2023 • Photography, Catering, Decoration</p>
                            </div>
                            <div class="shortlist-actions">
                                <span class="availability-status">Completed</span>
                            </div>
                        </div>
                        <div class="shortlist-item">
                            <div class="shortlist-info">
                                <h4>Corporate Annual Gala</h4>
                                <p>December 5, 2023 • Venue, Catering, Entertainment</p>
                            </div>
                            <div class="shortlist-actions">
                                <span class="availability-status" style="background: #fef3c7; color: #d97706;">Upcoming</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="dashboard-section" id="profile">
                    <div class="vendor-form">
                        <h2>Profile Settings</h2>
                        <form>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="profileFirstName">First Name</label>
                                    <input type="text" id="profileFirstName" value="Sarah">
                                </div>
                                <div class="form-group">
                                    <label for="profileLastName">Last Name</label>
                                    <input type="text" id="profileLastName" value="Johnson">
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="profileEmail">Email</label>
                                <input type="email" id="profileEmail" value="sarah.johnson@example.com">
                            </div>
                            <div class="form-group">
                                <label for="profilePhone">Phone</label>
                                <input type="tel" id="profilePhone" value="+1 (555) 123-4567">
                            </div>
                            <div class="form-group">
                                <label for="profileCity">City</label>
                                <input type="text" id="profileCity" value="New York">
                            </div>
                            <button type="submit" class="btn btn-primary">Update Profile</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add dashboard navigation
    document.querySelectorAll('.dashboard-nav a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            
            // Update active nav
            document.querySelectorAll('.dashboard-nav a').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Show section
            document.querySelectorAll('.dashboard-section').forEach(s => s.classList.remove('active'));
            document.getElementById(section).classList.add('active');
        });
    });
    
    // Add logout functionality
    document.getElementById('logoutBtn').addEventListener('click', function() {
        dashboard.style.display = 'none';
        landingPage.style.display = 'block';
    });
    
    // Add vendor view functionality
    document.querySelectorAll('.view-vendor').forEach(button => {
        button.addEventListener('click', function() {
            const vendorId = parseInt(this.getAttribute('data-id'));
            openVendorModal(vendorId);
        });
    });
}

// Load vendor dashboard
function loadVendorDashboard() {
    dashboard.innerHTML = `
        <div class="dashboard-header">
            <div class="container dashboard-container">
                <div class="logo">
                    <i class="fas fa-calendar-alt"></i>
                    <span>EventPro</span>
                </div>
                <div class="dashboard-nav">
                    <a href="#" class="active" data-section="overview">Overview</a>
                    <a href="#" data-section="services">My Services</a>
                    <a href="#" data-section="requests">Requests</a>
                    <a href="#" data-section="portfolio">Portfolio</a>
                    <a href="#" data-section="profile">Profile</a>
                </div>
                <button class="btn btn-outline" id="logoutBtn">Logout</button>
            </div>
        </div>
        
        <div class="dashboard-content">
            <div class="container">
                <div class="dashboard-section active" id="overview">
                    <div class="dashboard-welcome">
                        <h2>Welcome back, Capture Moments!</h2>
                        <p>Here's your business performance overview</p>
                    </div>
                    
                    <div class="analytics-grid">
                        <div class="analytics-card">
                            <i class="fas fa-eye"></i>
                            <h3>1,247</h3>
                            <p>Profile Views</p>
                        </div>
                        <div class="analytics-card">
                            <i class="fas fa-envelope"></i>
                            <h3>24</h3>
                            <p>New Inquiries</p>
                        </div>
                        <div class="analytics-card">
                            <i class="fas fa-star"></i>
                            <h3>4.9</h3>
                            <p>Average Rating</p>
                        </div>
                        <div class="analytics-card">
                            <i class="fas fa-calendar-check"></i>
                            <h3>8</h3>
                            <p>Upcoming Events</p>
                        </div>
                    </div>
                    
                    <h3 style="margin-bottom: 20px;">Recent Reviews</h3>
                    <div class="testimonials-grid">
                        <div class="testimonial-card">
                            <p class="testimonial-text">"Amazing photography! Captured our wedding perfectly."</p>
                            <div class="testimonial-author">
                                <div class="author-avatar"></div>
                                <div class="author-info">
                                    <h4>Jennifer Wilson</h4>
                                    <p>Wedding • 2 days ago</p>
                                </div>
                            </div>
                        </div>
                        <div class="testimonial-card">
                            <p class="testimonial-text">"Professional and creative. Highly recommend for corporate events!"</p>
                            <div class="testimonial-author">
                                <div class="author-avatar"></div>
                                <div class="author-info">
                                    <h4>Robert Kim</h4>
                                    <p>Corporate Event • 1 week ago</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="dashboard-section" id="services">
                    <h2>My Services</h2>
                    <p style="margin-bottom: 30px; color: var(--gray);">Manage your service offerings and pricing</p>
                    
                    <div class="vendor-form">
                        <form>
                            <div class="form-group">
                                <label for="serviceCategory">Service Category</label>
                                <select id="serviceCategory">
                                    <option>Photography</option>
                                    <option>Catering</option>
                                    <option>Decoration</option>
                                    <option>Venue</option>
                                    <option>Entertainment</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="serviceDescription">Service Description</label>
                                <textarea id="serviceDescription" rows="4">Specializing in wedding and corporate event photography with 10+ years of experience. We offer custom packages tailored to your needs.</textarea>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="servicePrice">Starting Price ($)</label>
                                    <input type="number" id="servicePrice" value="800">
                                </div>
                                <div class="form-group">
                                    <label for="serviceLocation">Service Location</label>
                                    <input type="text" id="serviceLocation" value="New York, NY">
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label>Availability</label>
                                <div style="display: flex; gap: 15px; margin-top: 10px;">
                                    <label style="display: flex; align-items: center; gap: 5px;">
                                        <input type="radio" name="availability" checked> Available
                                    </label>
                                    <label style="display: flex; align-items: center; gap: 5px;">
                                        <input type="radio" name="availability"> Limited Availability
                                    </label>
                                    <label style="display: flex; align-items: center; gap: 5px;">
                                        <input type="radio" name="availability"> Not Available
                                    </label>
                                </div>
                            </div>
                            
                            <button type="submit" class="btn btn-primary">Update Service</button>
                        </form>
                    </div>
                </div>
                
                <div class="dashboard-section" id="requests">
                    <h2>Customer Requests</h2>
                    <p style="margin-bottom: 30px; color: var(--gray);">Manage incoming booking requests</p>
                    
                    <div class="shortlist-items">
                        <div class="shortlist-item">
                            <div class="shortlist-info">
                                <h4>Maria Gonzalez - Wedding Photography</h4>
                                <p>June 22, 2023 • 8 hours • $1,200 budget</p>
                            </div>
                            <div class="shortlist-actions">
                                <button class="btn btn-primary" style="margin-right: 10px;">Accept</button>
                                <button class="btn btn-outline">Decline</button>
                            </div>
                        </div>
                        <div class="shortlist-item">
                            <div class="shortlist-info">
                                <h4>Tech Solutions Inc. - Corporate Event</h4>
                                <p>August 5, 2023 • 6 hours • $900 budget</p>
                            </div>
                            <div class="shortlist-actions">
                                <button class="btn btn-primary" style="margin-right: 10px;">Accept</button>
                                <button class="btn btn-outline">Decline</button>
                            </div>
                        </div>
                        <div class="shortlist-item">
                            <div class="shortlist-info">
                                <h4>James Wilson - Birthday Party</h4>
                                <p>July 15, 2023 • 4 hours • $600 budget</p>
                            </div>
                            <div class="shortlist-actions">
                                <button class="btn btn-primary" style="margin-right: 10px;">Accept</button>
                                <button class="btn btn-outline">Decline</button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="dashboard-section" id="portfolio">
                    <h2>Portfolio Gallery</h2>
                    <p style="margin-bottom: 30px; color: var(--gray);">Showcase your best work to attract more clients</p>
                    
                    <div class="portfolio-upload">
                        <i class="fas fa-cloud-upload-alt"></i>
                        <h3>Upload New Images</h3>
                        <p>Drag & drop images here or click to browse</p>
                    </div>
                    
                    <div class="vendor-modal-gallery" style="grid-template-columns: repeat(4, 1fr);">
                        ${Array(8).fill().map((_, i) => 
                            `<div class="gallery-item" style="background: linear-gradient(135deg, #${Math.floor(Math.random()*16777215).toString(16)} 0%, #${Math.floor(Math.random()*16777215).toString(16)} 100%);"></div>`
                        ).join('')}
                    </div>
                </div>
                
                <div class="dashboard-section" id="profile">
                    <div class="vendor-form">
                        <h2>Business Profile</h2>
                        <form>
                            <div class="form-group">
                                <label for="businessName">Business Name</label>
                                <input type="text" id="businessName" value="Capture Moments">
                            </div>
                            
                            <div class="form-group">
                                <label for="businessDescription">Business Description</label>
                                <textarea id="businessDescription" rows="4">Professional photography services specializing in weddings, corporate events, and special occasions. With over 10 years of experience, we capture your most precious moments with creativity and precision.</textarea>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="businessEmail">Contact Email</label>
                                    <input type="email" id="businessEmail" value="hello@capturemoments.com">
                                </div>
                                <div class="form-group">
                                    <label for="businessPhone">Phone Number</label>
                                    <input type="tel" id="businessPhone" value="+1 (555) 987-6543">
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="businessWebsite">Website</label>
                                    <input type="url" id="businessWebsite" value="https://capturemoments.com">
                                </div>
                                <div class="form-group">
                                    <label for="businessLocation">Business Location</label>
                                    <input type="text" id="businessLocation" value="New York, NY">
                                </div>
                            </div>
                            
                            <button type="submit" class="btn btn-primary">Update Business Profile</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add dashboard navigation
    document.querySelectorAll('.dashboard-nav a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            
            // Update active nav
            document.querySelectorAll('.dashboard-nav a').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Show section
            document.querySelectorAll('.dashboard-section').forEach(s => s.classList.remove('active'));
            document.getElementById(section).classList.add('active');
        });
    });
    
    // Add logout functionality
    document.getElementById('logoutBtn').addEventListener('click', function() {
        dashboard.style.display = 'none';
        landingPage.style.display = 'block';
    });
}