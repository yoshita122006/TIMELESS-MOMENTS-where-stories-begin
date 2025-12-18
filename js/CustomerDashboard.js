class CustomerDashboard {
    constructor() {
        window.isVendorDashboard = false; // Add this line
        this.init();
    }

    init() {
    document.addEventListener('DOMContentLoaded', () => {
        this.loadUserProfile();
        this.initializeSampleData();
        this.switchMainContent('overview');
        
        // Initialize all displays
        this.displayAllBookings();
        this.displayShortlist();
        this.displayNotifications();
        this.displayMessages();
        this.displayPaymentAgreements();
        this.displayRecentActivity();
        this.displayRecommendations();
        this.updateDashboardStats();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // NEW: Setup vendor interaction with your message bus
        this.setupVendorInteraction();
                this.setupMessageHandling();
        
        // Load initial data
        this.displayNotifications();
        this.displayMessages();
        this.updateNotificationBadge();
    });
}
    // INTEGRATION WITH YOUR EXISTING MESSAGE BUS
setupVendorInteraction() {
    // Use your existing message bus
    if (window.messageBus) {
        // Listen for booking status updates from vendors
        window.messageBus.handleMessage = (message) => {
            this.handleIncomingMessage(message);
        };
        
        // Also setup polling to catch messages
        this.setupMessagePolling();
    }
    
    // Initialize vendor data sync
    this.syncVendorData();
}

// Handle incoming messages from your message bus
handleIncomingMessage(message) {
    console.log('Customer Dashboard received message:', message);
    
    switch(message.type) {
        case 'booking_status_update':
            this.handleBookingStatusUpdate(message.data);
            break;
            
        case 'new_message':
            this.handleNewMessage(message.data);
            break;
            
        case 'vendor_service_update':
            this.handleVendorServiceUpdate(message.data);
            break;
            
        case 'vendor_availability_update':
            this.handleVendorAvailabilityUpdate(message.data);
            break;
    }
}

// Setup polling for messages (complementary to your storage listener)
setupMessagePolling() {
    setInterval(() => {
        if (window.messageBus) {
            window.messageBus.checkForNewMessages();
        }
    }, 3000);
}

// Handle booking status updates from vendors
handleBookingStatusUpdate(bookingData) {
    console.log('Booking status updated by vendor:', bookingData);
    
    // Update booking in unified system
    this.updateUnifiedBooking(bookingData);
    
    // Show notification
    let notificationTitle = 'Booking Status Updated';
    let notificationMessage = '';
    let notificationType = 'info';
    
    switch(bookingData.status) {
        case 'confirmed':
            notificationMessage = `🎉 Your booking with ${bookingData.vendorName} has been confirmed!`;
            notificationType = 'success';
            break;
        case 'rejected':
            notificationMessage = `❌ Your booking with ${bookingData.vendorName} was declined.`;
            notificationType = 'warning';
            if (bookingData.vendorNotes) {
                notificationMessage += ` Reason: ${bookingData.vendorNotes}`;
            }
            break;
        case 'cancelled':
            notificationMessage = `⚠️ Your booking with ${bookingData.vendorName} was cancelled by the vendor.`;
            notificationType = 'warning';
            break;
        case 'completed':
            notificationMessage = `✅ Your booking with ${bookingData.vendorName} has been completed.`;
            notificationType = 'success';
            break;
    }
    
    this.addNotification(notificationTitle, notificationMessage, notificationType);
    
    // Refresh bookings display
    setTimeout(() => {
        this.displayAllBookings();
    }, 500);
}

// Handle new messages from vendors
handleNewMessage(messageData) {
    console.log('New message from vendor:', messageData);
    
    // Add to messages list
    const existingMessages = JSON.parse(localStorage.getItem('vendorMessages')) || [];
    existingMessages.unshift({
        id: messageData.id,
        vendor: messageData.fromUserName,
        vendorId: messageData.fromUserId,
        type: 'received',
        message: messageData.message,
        timestamp: messageData.timestamp,
        read: false
    });
    
    localStorage.setItem('vendorMessages', JSON.stringify(existingMessages));
    
    // Show notification
    this.addNotification(
        'New Message',
        `💬 New message from ${messageData.fromUserName}`,
        'info'
    );
    
    // Refresh messages if currently viewing
    if (document.getElementById('messages-content').classList.contains('active')) {
        this.displayMessages();
    }
}

// Handle vendor service updates
handleVendorServiceUpdate(serviceData) {
    console.log('Vendor service updated:', serviceData);
    
    this.updateVendorInLocalStorage(serviceData);
    
    this.addNotification(
        'Service Updated',
        `🔄 ${serviceData.businessName} updated their ${serviceData.serviceType} services`,
        'info'
    );
    
    // Refresh recommendations
    this.updateRecommendations();
}

// Handle vendor availability updates
handleVendorAvailabilityUpdate(availabilityData) {
    console.log('Vendor availability updated:', availabilityData);
    
    this.updateVendorAvailabilityInLocalStorage(availabilityData);
    
    if (!availabilityData.isAvailable) {
        this.addNotification(
            'Service Unavailable',
            `⏸️ ${availabilityData.businessName} is temporarily not accepting bookings`,
            'warning'
        );
    } else {
        this.addNotification(
            'Service Available',
            `✅ ${availabilityData.businessName} is now accepting bookings`,
            'success'
        );
    }
}

// DATA SYNC METHODS
syncVendorData() {
    // Sync vendor data on dashboard load
    this.syncVendorsFromSharedStorage();
    this.syncBookingsFromSharedStorage();
}

syncVendorsFromSharedStorage() {
    // Get vendors from shared storage (you might want to add this to your message bus)
    const sharedVendors = JSON.parse(localStorage.getItem('shared_vendors')) || [];
    const localVendors = JSON.parse(localStorage.getItem('vendors')) || [];
    
    // Merge and update local vendors
    const updatedVendors = this.mergeVendorData(localVendors, sharedVendors);
    localStorage.setItem('vendors', JSON.stringify(updatedVendors));
    
    console.log('Synced vendors from shared storage:', updatedVendors.length);
}

syncBookingsFromSharedStorage() {
    // Use your unified booking system
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && window.bookingSystem) {
        const sharedBookings = window.bookingSystem.getCustomerBookings(currentUser.id);
        
        // Update local bookings display
        setTimeout(() => {
            this.displayAllBookings();
        }, 1000);
    }
}

// UPDATED: Get vendors for service using shared data
getVendorsForService(serviceType) {
    const serviceMapping = {
        'Venue': 'venue',
        'Photography': 'photography', 
        'Catering': 'catering',
        'Entertainment': 'entertainment',
        'Decoration': 'decoration',
        'Makeup': 'makeup'
    };
    
    const vendorCategory = serviceMapping[serviceType] || serviceType.toLowerCase();
    
    // Try to get from shared vendors first, then fallback to local
    const sharedVendors = JSON.parse(localStorage.getItem('shared_vendors')) || [];
    const localVendors = JSON.parse(localStorage.getItem('vendors')) || [];
    
    const allVendors = sharedVendors.length > 0 ? sharedVendors : localVendors;
    
    console.log('Fetching vendors for:', vendorCategory);
    console.log('Available vendors:', allVendors);
    
    // Filter available vendors for this service
    const serviceVendors = allVendors.filter(vendor => {
        try {
            // Skip unavailable vendors
            if (vendor.isAvailable === false) return false;
            
            // Check various vendor properties for service match
            if (vendor.serviceType && typeof vendor.serviceType === 'string' && 
                vendor.serviceType.toLowerCase().includes(vendorCategory)) {
                return true;
            }
            
            if (vendor.businessType && typeof vendor.businessType === 'string' &&
                vendor.businessType.toLowerCase().includes(vendorCategory)) {
                return true;
            }
            
            if (vendor.category && typeof vendor.category === 'string' &&
                vendor.category.toLowerCase().includes(vendorCategory)) {
                return true;
            }
            
            // Check services array
            if (vendor.services && Array.isArray(vendor.services)) {
                const hasService = vendor.services.some(service => {
                    // Handle both string and object services
                    if (typeof service === 'string') {
                        return service.toLowerCase().includes(vendorCategory);
                    }
                    if (service && typeof service === 'object') {
                        const serviceName = service.name || service.serviceName || service.title || '';
                        const serviceType = service.type || service.serviceType || '';
                        return serviceName.toLowerCase().includes(vendorCategory) || 
                               serviceType.toLowerCase().includes(vendorCategory);
                    }
                    return false;
                });
                if (hasService) return true;
            }
            
            // Check business name as fallback
            if (vendor.businessName && typeof vendor.businessName === 'string' &&
                vendor.businessName.toLowerCase().includes(vendorCategory)) {
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error filtering vendor:', vendor, error);
            return false;
        }
    });
    
    console.log(`Found ${serviceVendors.length} vendors for ${serviceType}`);
    
    // Fallback if no vendors found
    if (serviceVendors.length === 0) {
        return [
            {
                id: 'fallback1',
                businessName: `Premium ${serviceType} Co.`,
                specialty: 'Premium Services',
                isAvailable: true,
                serviceType: vendorCategory
            }
        ];
    }
    
    return serviceVendors;
}

// UPDATED: Handle service booking form submission
handleServiceBookingFormSubmit(e, serviceType, modal) {
    e.preventDefault();
    
    const vendor = document.getElementById('serviceVendor').value;
    const eventDate = document.getElementById('serviceEventDate').value;
    const eventTime = document.getElementById('serviceEventTime').value;
    const guestCount = document.getElementById('serviceGuestCount').value;
    const specialRequests = document.getElementById('serviceSpecialRequests').value;
    
    // Get current user data
    const userData = JSON.parse(localStorage.getItem('userData')) || {};
    
    const booking = {
        id: this.generateId(),
        name: `${serviceType} Service - ${vendor}`,
        serviceType: serviceType.toLowerCase(),
        vendor: vendor,
        date: eventDate,
        time: eventTime,
        guestCount: guestCount,
        specialRequests: specialRequests,
        status: 'pending',
        bookingDate: new Date().toISOString().split('T')[0],
        price: 'To be confirmed',
        // Add user information for real bookings
        customerName: userData.fullName,
        customerEmail: userData.email,
        customerPhone: userData.phone,
        customerAddress: userData.address
    };
    
    // Save to multiple locations to ensure it's found by auto-accept
    
    // 1. Save to service-specific bookings
    const existingServiceBookings = JSON.parse(localStorage.getItem(`${serviceType.toLowerCase()}Bookings`)) || [];
    existingServiceBookings.push(booking);
    localStorage.setItem(`${serviceType.toLowerCase()}Bookings`, JSON.stringify(existingServiceBookings));
    
    // 2. Save to main bookings (primary location)
    this.addToDashboardBookings(booking);
    
    // 3. Save to vendor bookings storage
    const vendorBookings = JSON.parse(localStorage.getItem('vendorBookings')) || [];
    vendorBookings.push(booking);
    localStorage.setItem('vendorBookings', JSON.stringify(vendorBookings));
    
    this.showToast(`Booking submitted for ${vendor}! Status: Pending`);
    modal.remove();
    
    // Auto-accept after 20 seconds
    setTimeout(() => {
        this.autoAcceptServiceBooking(booking.id, serviceType.toLowerCase());
    }, 20000);
}

// UPDATED: Get all bookings (combine unified and local)
getAllBookings() {
    const allBookings = [];
    
    // Get from main bookings storage
    const mainBookings = JSON.parse(localStorage.getItem('bookings')) || [];
    allBookings.push(...mainBookings);
    
    // Get from service-specific bookings
    const serviceTypes = ['catering', 'photography', 'venue', 'makeup', 'decoration', 'entertainment'];
    
    serviceTypes.forEach(serviceType => {
        const serviceBookings = JSON.parse(localStorage.getItem(`${serviceType}Bookings`)) || [];
        serviceBookings.forEach(booking => {
            // Ensure serviceType is set
            if (!booking.serviceType) {
                booking.serviceType = serviceType;
            }
            // Only add if not already in allBookings
            if (!allBookings.some(b => b.id === booking.id && b.serviceType === booking.serviceType)) {
                allBookings.push(booking);
            }
        });
    });
    
    console.log('Found bookings:', allBookings);
    return allBookings;
}

// SIMPLIFIED CANCEL METHOD - REUSES FIND METHOD
cancelBookingFromDashboard(bookingId, serviceType) {
    console.log('🔄 CANCEL CALLED:', bookingId, 'Service Type:', serviceType);
    
    if (!confirm('Are you sure you want to cancel this booking?')) {
        return;
    }

    // Use your existing find method to locate the booking
    const booking = this.findBookingEverywhere(bookingId, serviceType);
    
    if (booking) {
        console.log('✅ Found booking to cancel:', booking);
        
        // Now search for it in storage to update it
        const storageKeys = [
            'bookings', 'vendorBookings',
            'cateringBookings', 'photographyBookings', 'venueBookings',
            'makeupBookings', 'decorationBookings', 'entertainmentBookings'
        ];
        
        let updated = false;
        
        storageKeys.forEach(key => {
            try {
                const data = JSON.parse(localStorage.getItem(key)) || [];
                const bookingIndex = data.findIndex(b => {
                    if (!b || !b.id) return false;
                    return b.id === booking.id; // Match by the found booking's ID
                });
                
                if (bookingIndex !== -1) {
                    // Update the booking
                    data[bookingIndex].status = 'cancelled';
                    data[bookingIndex].cancelledDate = new Date().toISOString().split('T')[0];
                    data[bookingIndex].cancelledBy = 'customer';
                    
                    // Save back
                    localStorage.setItem(key, JSON.stringify(data));
                    updated = true;
                    console.log(`✅ CANCELLED in ${key}`);
                }
            } catch (error) {
                console.error(`❌ Error with ${key}:`, error);
            }
        });
        
        if (updated) {
            this.showToast('✅ Booking cancelled successfully!');
            
            // Refresh displays
            setTimeout(() => {
                this.displayAllBookings();
                this.updateDashboardStats();
            }, 500);
            
            this.addNotification(
                'Booking Cancelled', 
                `Your booking for ${booking.name} has been cancelled.`,
                'warning'
            );
        } else {
            this.showToast('❌ Could not update booking in storage!');
        }
        
    } else {
        console.log('❌ Booking not found for cancellation');
        this.showToast('❌ Booking not found!');
    }
}
// ADD THIS METHOD TO YOUR CustomerDashboard CLASS
logout() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear any session data if needed
        localStorage.removeItem('currentUser');
        sessionStorage.clear();
        
        // Redirect to login page
        window.location.href = 'customer-login.html';
    }
}
// ADD THIS HELPER METHOD
showDebugInfo(bookingId) {
    console.log('🐛 DEBUG INFO FOR BOOKING:', bookingId);
    console.log('📍 Current URL:', window.location.href);
    
    const storageKeys = [
        'bookings', 'vendorBookings',
        'cateringBookings', 'photographyBookings', 'venueBookings',
        'makeupBookings', 'decorationBookings', 'entertainmentBookings'
    ];
    
    console.log('📋 STORAGE CONTENTS:');
    storageKeys.forEach(key => {
        const data = JSON.parse(localStorage.getItem(key)) || [];
        console.log(`${key} (${data.length} items):`, data);
    });
}

// HELPER METHODS
updateUnifiedBooking(bookingData) {
    // Update local storage with unified booking data
    const localBookings = JSON.parse(localStorage.getItem('bookings')) || [];
    const bookingIndex = localBookings.findIndex(b => b.id === bookingData.id);
    
    if (bookingIndex !== -1) {
        localBookings[bookingIndex] = { ...localBookings[bookingIndex], ...bookingData };
    } else {
        localBookings.push(bookingData);
    }
    
    localStorage.setItem('bookings', JSON.stringify(localBookings));
}

updateVendorInLocalStorage(vendorData) {
    const localVendors = JSON.parse(localStorage.getItem('vendors')) || [];
    const vendorIndex = localVendors.findIndex(v => v.id === vendorData.id);
    
    if (vendorIndex !== -1) {
        localVendors[vendorIndex] = { ...localVendors[vendorIndex], ...vendorData };
    } else {
        localVendors.push(vendorData);
    }
    
    localStorage.setItem('vendors', JSON.stringify(localVendors));
}

updateVendorAvailabilityInLocalStorage(availabilityData) {
    const localVendors = JSON.parse(localStorage.getItem('vendors')) || [];
    const vendorIndex = localVendors.findIndex(v => v.id === availabilityData.vendorId);
    
    if (vendorIndex !== -1) {
        localVendors[vendorIndex].isAvailable = availabilityData.isAvailable;
        localVendors[vendorIndex].availabilityMessage = availabilityData.message;
        localStorage.setItem('vendors', JSON.stringify(localVendors));
    }
}

mergeVendorData(localVendors, sharedVendors) {
    // Simple merge - prefer shared vendors data
    const merged = [...localVendors];
    
    sharedVendors.forEach(sharedVendor => {
        const existingIndex = merged.findIndex(v => v.id === sharedVendor.id);
        if (existingIndex !== -1) {
            merged[existingIndex] = { ...merged[existingIndex], ...sharedVendor };
        } else {
            merged.push(sharedVendor);
        }
    });
    
    return merged;
}

addToLocalBookings(booking) {
    const localBookings = JSON.parse(localStorage.getItem('bookings')) || [];
    localBookings.push(booking);
    localStorage.setItem('bookings', JSON.stringify(localBookings));
}

updateLocalBookingStatus(bookingId, status) {
    const localBookings = JSON.parse(localStorage.getItem('bookings')) || [];
    const bookingIndex = localBookings.findIndex(b => b.id === bookingId);
    if (bookingIndex !== -1) {
        localBookings[bookingIndex].status = status;
        localStorage.setItem('bookings', JSON.stringify(localBookings));
    }
}

cancelLocalBooking(bookingId, serviceType) {
    // Your existing local cancellation logic
    const localBookings = JSON.parse(localStorage.getItem('bookings')) || [];
    const bookingIndex = localBookings.findIndex(b => b.id === bookingId);
    
    if (bookingIndex !== -1) {
        localBookings[bookingIndex].status = 'cancelled';
        localStorage.setItem('bookings', JSON.stringify(localBookings));
        this.showToast('Booking cancelled successfully!');
        this.displayAllBookings();
    }
}
     checkUserAuthentication() {
        const currentUser = localStorage.getItem('currentUser');
        if (!currentUser) {
            // Redirect to login if no user is logged in
            window.location.href = 'customer-login.html';
            return;
        }
    }
    // UPDATED: Load real user profile from registration data
    loadRealUserProfile() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        if (!currentUser) {
            console.warn('No user data found in localStorage');
            return;
        }

        // Update user information throughout the dashboard
        this.updateUserInterface(currentUser);
    }

    // NEW: Update all UI elements with real user data
    updateUserInterface(user) {
        // Get user initials for avatars
        const initials = this.getUserInitials(user.fullName);
        
        // Update header and welcome messages
        const welcomeNameElement = document.getElementById('welcomeUserName');
        if (welcomeNameElement) {
            welcomeNameElement.textContent = user.fullName.split(' ')[0]; // First name only
        }

        // Update profile section
        this.updateProfileSection(user, initials);
        
        // Update header profile
        this.updateHeaderProfile(initials);
    }

    // NEW: Update profile section with real data
    updateProfileSection(user, initials) {
        // Profile card
        const userInitialsElement = document.getElementById('userInitials');
        const userNameElement = document.getElementById('userName');
        const userEmailElement = document.getElementById('userEmail');
        const memberSinceElement = document.getElementById('memberSince');
        
        if (userInitialsElement) userInitialsElement.textContent = initials;
        if (userNameElement) userNameElement.textContent = user.fullName;
        if (userEmailElement) userEmailElement.textContent = user.email;
        if (memberSinceElement) memberSinceElement.textContent = new Date().getFullYear();

        // Profile details
        const profileFullNameElement = document.getElementById('profileFullName');
        const profileEmailElement = document.getElementById('profileEmail');
        const profilePhoneElement = document.getElementById('profilePhone');
        const profileLocationElement = document.getElementById('profileLocation');
        
        if (profileFullNameElement) profileFullNameElement.textContent = user.fullName;
        if (profileEmailElement) profileEmailElement.textContent = user.email;
        if (profilePhoneElement) profilePhoneElement.textContent = user.phone || 'Not provided';
        if (profileLocationElement) profileLocationElement.textContent = user.address || 'Not provided';
        
        // Set default values for preference fields
        const profileEventTypeElement = document.getElementById('profileEventType');
        const profileNotificationsElement = document.getElementById('profileNotifications');
        
        if (profileEventTypeElement) profileEventTypeElement.textContent = user.preferredEventType || 'All Types';
        if (profileNotificationsElement) profileNotificationsElement.textContent = user.notificationPrefs || 'Email & SMS';
    }

    // NEW: Update header profile with real data
    updateHeaderProfile(initials) {
        const headerAvatar = document.querySelector('.header-profile .profile-avatar-small');
        if (headerAvatar) {
            headerAvatar.textContent = initials;
        }
    }

    // NEW: Get user initials from full name
    getUserInitials(fullName) {
        return fullName.split(' ')
            .map(name => name[0])
            .join('')
            .toUpperCase()
            .substring(0, 2); // Max 2 initials
    }

    setupEventListeners() {
        // Booking form
        const bookingForm = document.getElementById('bookingForm');
        if (bookingForm) {
            bookingForm.addEventListener('submit', (e) => this.handleBookingFormSubmit(e));
        }

        // Profile form
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => this.handleProfileFormSubmit(e));
        }

        // Modal close events
        window.onclick = (event) => {
            const modal = document.getElementById('bookingModal');
            const profileModal = document.getElementById('editProfileModal');
            
            if (event.target === modal) {
                this.closeBookingModal();
            }
            
            if (event.target === profileModal) {
                this.closeEditProfileModal();
            }
        };
    }
// UPDATED: Book Service Modal with Real Vendor Data
bookServiceWithModal(serviceType) {
    console.log('Booking service:', serviceType);
    
    // Get real vendors for this service type
    const vendors = this.getVendorsForService(serviceType);
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content">
            <h3 class="modal-title">Book ${serviceType} Service</h3>
            <form id="serviceBookingForm">
                <div class="form-group">
                    <label for="serviceVendor">Select Vendor</label>
                    <select id="serviceVendor" required>
                        <option value="">Choose a vendor</option>
                        ${vendors.map(vendor => 
                            `<option value="${vendor.id}">${vendor.businessName} - ${vendor.specialty || vendor.serviceType}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label for="serviceEventDate">Event Date</label>
                    <input type="date" id="serviceEventDate" required>
                </div>
                <div class="form-group">
                    <label for="serviceEventTime">Event Time</label>
                    <input type="time" id="serviceEventTime" required>
                </div>
                <div class="form-group">
                    <label for="serviceGuestCount">Number of Guests</label>
                    <input type="number" id="serviceGuestCount" min="1" required>
                </div>
                <div class="form-group">
                    <label for="serviceSpecialRequests">Special Requests</label>
                    <textarea id="serviceSpecialRequests" rows="3" placeholder="Any specific requirements..."></textarea>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-cancel" onclick="customerDashboard.closeCurrentModal(this)">Cancel</button>
                    <button type="submit" class="btn btn-submit">Submit Booking</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const form = modal.querySelector('#serviceBookingForm');
    form.addEventListener('submit', (e) => this.handleServiceBookingFormSubmit(e, serviceType, modal));
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}
// NEW: Get real vendors for specific service type
// FIXED: Get real vendors for specific service type
getVendorsForService(serviceType) {
    // Map service types to vendor categories
    const serviceMapping = {
        'Venue': 'venue',
        'Photography': 'photography', 
        'Catering': 'catering',
        'Entertainment': 'entertainment',
        'Decoration': 'decoration',
        'Makeup': 'makeup'
    };
    
    const vendorCategory = serviceMapping[serviceType] || serviceType.toLowerCase();
    const allVendors = JSON.parse(localStorage.getItem('vendors')) || [];
    
    console.log('All vendors from localStorage:', allVendors);
    console.log('Looking for vendors in category:', vendorCategory);
    
    // Filter vendors by service category with proper error handling
    const serviceVendors = allVendors.filter(vendor => {
        try {
            // Check if vendor provides this service - multiple possible fields
            if (vendor.serviceType && typeof vendor.serviceType === 'string' && 
                vendor.serviceType.toLowerCase() === vendorCategory) {
                return true;
            }
            
            if (vendor.businessType && typeof vendor.businessType === 'string' &&
                vendor.businessType.toLowerCase() === vendorCategory) {
                return true;
            }
            
            if (vendor.category && typeof vendor.category === 'string' &&
                vendor.category.toLowerCase() === vendorCategory) {
                return true;
            }
            
            // Check services array if it exists
            if (vendor.services && Array.isArray(vendor.services)) {
                const hasService = vendor.services.some(service => {
                    if (typeof service === 'string') {
                        return service.toLowerCase().includes(vendorCategory);
                    }
                    // If service is an object, check its name or type property
                    if (service && typeof service === 'object') {
                        return (service.name && service.name.toLowerCase().includes(vendorCategory)) ||
                               (service.type && service.type.toLowerCase().includes(vendorCategory));
                    }
                    return false;
                });
                if (hasService) return true;
            }
            
            // Check vendor name or business name for the service type
            if (vendor.businessName && typeof vendor.businessName === 'string' &&
                vendor.businessName.toLowerCase().includes(vendorCategory)) {
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error filtering vendor:', vendor, error);
            return false;
        }
    });
    
    console.log(`Found ${serviceVendors.length} vendors for ${serviceType}:`, serviceVendors);
    
    // If no vendors found, provide fallback options
    if (serviceVendors.length === 0) {
        console.log('No vendors found, using fallback options');
        return [
            {
                id: 'fallback1',
                businessName: `Premium ${serviceType} Co.`,
                specialty: 'Premium Services'
            },
            {
                id: 'fallback2', 
                businessName: `Elite ${serviceType} Services`,
                specialty: 'Elite Packages'
            }
        ];
    }
    
    return serviceVendors;
}

    closeCurrentModal(button) {
        button.closest('.modal').remove();
    }

    openBookingModal() {
        document.getElementById('bookingModal').style.display = 'flex';
    }

    closeBookingModal() {
        document.getElementById('bookingModal').style.display = 'none';
    }

    openEditProfileModal() {
        const userProfile = JSON.parse(localStorage.getItem('userProfile')) || {
            fullName: 'John Smith',
            email: 'john.smith@example.com',
            phone: '+1 (555) 123-4567',
            location: 'New York, USA',
            eventType: 'Weddings',
            notifications: 'Email & SMS'
        };
        
        document.getElementById('editFullName').value = userProfile.fullName;
        document.getElementById('editEmail').value = userProfile.email;
        document.getElementById('editPhone').value = userProfile.phone;
        document.getElementById('editLocation').value = userProfile.location;
        document.getElementById('editEventType').value = userProfile.eventType;
        
        document.getElementById('editProfileModal').style.display = 'flex';
    }

    closeEditProfileModal() {
        document.getElementById('editProfileModal').style.display = 'none';
    }

// UPDATED: Handle main booking form submission
handleBookingFormSubmit(e) {
    e.preventDefault();
    
    const serviceType = document.getElementById('serviceType').value;
    const eventDate = document.getElementById('eventDate').value;
    const eventTime = document.getElementById('eventTime').value;
    const guestCount = document.getElementById('guestCount').value;
    const specialRequests = document.getElementById('specialRequests').value;
    
    // Get current user data
    const userData = JSON.parse(localStorage.getItem('userData')) || {};
    
    const newBooking = {
        id: this.generateId(),
        name: `${serviceType.charAt(0).toUpperCase() + serviceType.slice(1)} Service`,
        serviceType: serviceType,
        date: eventDate,
        time: eventTime,
        guestCount: guestCount,
        specialRequests: specialRequests,
        status: 'pending',
        bookingDate: new Date().toISOString().split('T')[0],
        price: 'To be confirmed',
        vendor: 'Timeless Moments',
        // Add user information for real bookings
        customerName: userData.fullName,
        customerEmail: userData.email,
        customerPhone: userData.phone,
        customerAddress: userData.address
    };
    
    // Save to multiple locations
    
    // 1. Save to service-specific bookings
    const existingBookings = JSON.parse(localStorage.getItem(`${serviceType}Bookings`)) || [];
    existingBookings.push(newBooking);
    localStorage.setItem(`${serviceType}Bookings`, JSON.stringify(existingBookings));
    
    // 2. Save to main bookings
    this.addToDashboardBookings(newBooking);
    
    // 3. Save to vendor bookings
    const vendorBookings = JSON.parse(localStorage.getItem('vendorBookings')) || [];
    vendorBookings.push(newBooking);
    localStorage.setItem('vendorBookings', JSON.stringify(vendorBookings));
    
    this.showToast('Booking submitted successfully! Status: Pending');
    this.closeBookingModal();
    e.target.reset();
    
    // Auto-accept after 20 seconds
    setTimeout(() => {
        this.autoAcceptBooking(newBooking.id, serviceType);
    }, 20000);
}

handleServiceBookingFormSubmit(e, serviceType, modal) {
    e.preventDefault();
    
    const vendorId = document.getElementById('serviceVendor').value;
    const eventDate = document.getElementById('serviceEventDate').value;
    const eventTime = document.getElementById('serviceEventTime').value;
    const guestCount = document.getElementById('serviceGuestCount').value;
    const specialRequests = document.getElementById('serviceSpecialRequests').value;
    
    // Get vendor details
    const allVendors = JSON.parse(localStorage.getItem('vendors')) || [];
    const selectedVendor = allVendors.find(vendor => vendor.id === vendorId) || {
        businessName: `Premium ${serviceType} Co.`,
        specialty: 'Premium Services'
    };
    
    const booking = {
        id: this.generateId(),
        name: `${serviceType} Service - ${selectedVendor.businessName}`,
        serviceType: serviceType.toLowerCase(),
        vendor: selectedVendor.businessName,
        vendorId: vendorId,
        date: eventDate,
        time: eventTime,
        guestCount: guestCount,
        specialRequests: specialRequests,
        status: 'pending',
        bookingDate: new Date().toISOString().split('T')[0],
        price: 'To be confirmed',
        vendorSpecialty: selectedVendor.specialty || selectedVendor.serviceType
    };
    
    // Save to service-specific bookings
    const existingBookings = JSON.parse(localStorage.getItem(`${serviceType.toLowerCase()}Bookings`)) || [];
    existingBookings.push(booking);
    localStorage.setItem(`${serviceType.toLowerCase()}Bookings`, JSON.stringify(existingBookings));
    
    // Also add to main bookings for dashboard display
    this.addToDashboardBookings(booking);
    
    this.showToast(`Booking submitted for ${selectedVendor.businessName}! Status: Pending`);
    modal.remove();
    
    // Auto-accept after 20 seconds (for demo)
    setTimeout(() => {
        this.autoAcceptServiceBooking(booking.id, serviceType.toLowerCase());
    }, 20000);
    
    // Refresh bookings display if on bookings page
    if (document.getElementById('bookings-content').classList.contains('active')) {
        setTimeout(() => {
            this.displayAllBookings();
        }, 1000);
    }
}
      handleProfileFormSubmit(e) {
        e.preventDefault();
        
        const updatedProfile = {
            fullName: document.getElementById('editFullName').value,
            email: document.getElementById('editEmail').value,
            phone: document.getElementById('editPhone').value,
            address: document.getElementById('editLocation').value,
            preferredEventType: document.getElementById('editEventType').value,
            notificationPrefs: 'Email & SMS',
            memberSince: new Date().getFullYear().toString()
        };

        // Update currentUser in localStorage
        const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
        const updatedUser = { ...currentUser, ...updatedProfile };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));

        // Also update userProfile for backward compatibility
        localStorage.setItem('userProfile', JSON.stringify(updatedProfile));

        // Update all users array if email changed
        if (currentUser.email && currentUser.email !== updatedProfile.email) {
            this.updateUserEmailInAllUsers(currentUser.email, updatedProfile.email, updatedUser);
        }

        // Refresh UI
        this.loadRealUserProfile();
        
        this.closeEditProfileModal();
        this.showToast('Profile updated successfully!');
    }

     updateUserEmailInAllUsers(oldEmail, newEmail, updatedUser) {
        const allUsers = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = allUsers.findIndex(user => user.email === oldEmail);
        
        if (userIndex !== -1) {
            allUsers[userIndex] = { ...allUsers[userIndex], ...updatedUser };
            localStorage.setItem('users', JSON.stringify(allUsers));
        }
    }


    // Navigation and Content Switching
    switchMainContent(contentId) {
        const allSections = document.querySelectorAll('.content-section');
        allSections.forEach(section => {
            section.classList.remove('active');
        });
        
        const targetSection = document.getElementById(`${contentId}-content`);
        if (targetSection) {
            targetSection.classList.add('active');
        }
        
        const allNavItems = document.querySelectorAll('.nav-item');
        allNavItems.forEach(item => {
            item.classList.remove('active');
        });
        
        const clickedNav = document.querySelector(`[onclick="customerDashboard.switchMainContent('${contentId}')"]`);
        if (clickedNav) {
            clickedNav.classList.add('active');
        }
        
        if (contentId === 'overview') {
            document.querySelector('[onclick="customerDashboard.switchMainContent(\'overview\')"]').classList.add('active');
        }
        
        // Refresh data when switching to specific tabs
        const refreshMethods = {
            'bookings': () => this.displayAllBookings(),
            'shortlist': () => this.displayShortlist(),
            'notifications': () => this.displayNotifications(),
            'messages': () => this.displayMessages(),
            'payments': () => this.displayPaymentAgreements(),
            'activity': () => this.displayRecentActivity(),
            'recommendations': () => this.displayRecommendations()
        };
        
        if (refreshMethods[contentId]) {
            refreshMethods[contentId]();
        }
    }

    // Booking Management
    displayAllBookings() {
        const bookingsContainer = document.getElementById('bookingsContainer');
        if (!bookingsContainer) return;
        
        bookingsContainer.innerHTML = '';
        const allBookings = this.getAllBookings();
        allBookings.sort((a, b) => new Date(b.bookingDate || b.date) - new Date(a.bookingDate || a.date));
        this.updateDashboardStats(allBookings);

        if (allBookings.length === 0) {
            bookingsContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📅</div>
                    <h3>No Bookings Yet</h3>
                    <p>You haven't made any bookings yet. Start exploring our services!</p>
                </div>
            `;
            return;
        }

        allBookings.forEach(booking => {
            const bookingItem = this.createBookingItem(booking);
            bookingsContainer.appendChild(bookingItem);
        });
    }

// IMPROVED: Create booking item with better service type detection
createBookingItem(booking) {
    const bookingItem = document.createElement('div');
    bookingItem.className = 'booking-item';
    
    const bookingDate = booking.date ? new Date(booking.date).toLocaleDateString() : 'Date not set';
    let statusClass = 'status-pending';
    if (booking.status === 'confirmed') statusClass = 'status-confirmed';
    if (booking.status === 'cancelled') statusClass = 'status-cancelled';
    
    // Better service type detection
    const serviceType = this.determineServiceType(booking);
    
    bookingItem.innerHTML = `
        <div class="booking-details">
            <div class="booking-name">${booking.name}</div>
            <div class="booking-date">Date: ${bookingDate} | Time: ${booking.time || 'Not specified'} | Guests: ${booking.guestCount || 'Not specified'}</div>
            <div class="booking-vendor">Vendor: ${booking.vendor || booking.name || 'Not specified'}</div>
            <div class="booking-service">Service: ${serviceType}</div>
            ${booking.specialRequests || booking.specialRequirements ? `<div class="booking-requests">Requests: ${(booking.specialRequests || booking.specialRequirements).substring(0, 100)}${(booking.specialRequests || booking.specialRequirements).length > 100 ? '...' : ''}</div>` : ''}
        </div>
        <div class="booking-status ${statusClass}">${(booking.status || 'pending').toUpperCase()}</div>
        <div class="booking-actions">
            ${(booking.status === 'pending' || booking.status === 'confirmed') ? `
            <button class="action-btn btn-danger" onclick="customerDashboard.cancelBookingFromDashboard('${booking.id}', '${serviceType}')">Cancel</button>
            ` : ''}
            <button class="action-btn btn-primary" onclick="customerDashboard.viewBookingDetailsFromDashboard('${booking.id}', '${serviceType}')">View Details</button>
        </div>
    `;
    
    return bookingItem;
}

// NEW: Better service type determination
determineServiceType(booking) {
    // Priority 1: Explicit serviceType
    if (booking.serviceType) return booking.serviceType;
    
    // Priority 2: Check booking name for service indicators
    const name = (booking.name || '').toLowerCase();
    if (name.includes('venue') || name.includes('hall') || name.includes('resort')) return 'venue';
    if (name.includes('catering') || name.includes('food') || name.includes('meal')) return 'catering';
    if (name.includes('photography') || name.includes('photo') || name.includes('camera')) return 'photography';
    if (name.includes('entertainment') || name.includes('dj') || name.includes('music')) return 'entertainment';
    if (name.includes('decoration') || name.includes('decor') || name.includes('floral')) return 'decoration';
    if (name.includes('makeup') || name.includes('beauty') || name.includes('styling')) return 'makeup';
    
    // Priority 3: Check which storage it came from
    const serviceTypes = ['venue', 'catering', 'photography', 'entertainment', 'decoration', 'makeup'];
    for (let type of serviceTypes) {
        const typeBookings = JSON.parse(localStorage.getItem(`${type}Bookings`)) || [];
        if (typeBookings.some(b => b.id === booking.id)) {
            return type;
        }
    }
    
    return 'general';
}

viewBookingDetailsFromDashboard(bookingId, serviceType) {
    console.log('Dashboard: Looking for booking:', bookingId, 'Service type:', serviceType);
    
    let booking = this.findBookingEverywhere(bookingId, serviceType);
    
    if (!booking) {
        this.showToast('Booking details not found! Please check if the booking was properly saved.');
        return;
    }
    
    const eventDate = booking.eventDate ? new Date(booking.eventDate).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }) : (booking.date ? new Date(booking.date).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }) : 'Not specified');
    
    const bookingDate = booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString('en-IN') : 'Not specified';
    
    const modal = document.createElement('div');
    modal.className = 'modal booking-details-modal';
    modal.style.display = 'flex';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="booking-details-header">
                <h3 class="modal-title">
                    📋 Booking Details - ${booking.name}
                    <span class="booking-status status-${booking.status}">${(booking.status || 'pending').toUpperCase()}</span>
                </h3>
                <button class="close-modal-btn" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="booking-details-content">
                <div class="details-grid">
                    <!-- Event Details -->
                    <div class="detail-section">
                        <h4>📅 Event Information</h4>
                        <div class="detail-item">
                            <span class="detail-label">Event Type:</span>
                            <span class="detail-value">${booking.eventType || 'Not specified'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Event Date:</span>
                            <span class="detail-value">${eventDate}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Event Time:</span>
                            <span class="detail-value">${booking.eventTime || booking.time || 'Not specified'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Venue Type:</span>
                            <span class="detail-value">${booking.venueType || 'Not specified'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Venue Address:</span>
                            <span class="detail-value">${booking.eventAddress || booking.venue || 'Not specified'}</span>
                        </div>
                        ${booking.guestCount ? `
                        <div class="detail-item">
                            <span class="detail-label">Number of Guests:</span>
                            <span class="detail-value">${booking.guestCount}</span>
                        </div>
                        ` : ''}
                        ${booking.audienceSize ? `
                        <div class="detail-item">
                            <span class="detail-label">Audience Size:</span>
                            <span class="detail-value">${booking.audienceSize}</span>
                        </div>
                        ` : ''}
                    </div>
                    
                    <!-- Service Specific Details -->
                    <div class="detail-section">
                        <h4>🎪 Service Information</h4>
                        <div class="detail-item">
                            <span class="detail-label">Service:</span>
                            <span class="detail-value">${booking.name}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Service Type:</span>
                            <span class="detail-value">${booking.serviceType || 'General'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Specialty:</span>
                            <span class="detail-value">${booking.specialty || 'Not specified'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Price:</span>
                            <span class="detail-value">${booking.price || 'Not specified'}</span>
                        </div>
                        
                        <!-- Photography Specific -->
                        ${booking.photographyDuration ? `
                        <div class="detail-item">
                            <span class="detail-label">Photography Duration:</span>
                            <span class="detail-value">${booking.photographyDuration} hours</span>
                        </div>
                        ` : ''}
                        ${booking.photographyStyle ? `
                        <div class="detail-item">
                            <span class="detail-label">Photography Style:</span>
                            <span class="detail-value">${booking.photographyStyle}</span>
                        </div>
                        ` : ''}
                        ${booking.numberOfPhotos ? `
                        <div class="detail-item">
                            <span class="detail-label">Expected Photos:</span>
                            <span class="detail-value">${booking.numberOfPhotos}</span>
                        </div>
                        ` : ''}
                        
                        <!-- Catering Specific -->
                        ${booking.cuisineType ? `
                        <div class="detail-item">
                            <span class="detail-label">Cuisine Type:</span>
                            <span class="detail-value">${booking.cuisineType}</span>
                        </div>
                        ` : ''}
                        
                        <!-- Decoration Specific -->
                        ${booking.decorationStyle ? `
                        <div class="detail-item">
                            <span class="detail-label">Decoration Style:</span>
                            <span class="detail-value">${booking.decorationStyle}</span>
                        </div>
                        ` : ''}
                        ${booking.colorScheme ? `
                        <div class="detail-item">
                            <span class="detail-label">Color Scheme:</span>
                            <span class="detail-value">${booking.colorScheme}</span>
                        </div>
                        ` : ''}
                        ${booking.venueSize ? `
                        <div class="detail-item">
                            <span class="detail-label">Venue Size:</span>
                            <span class="detail-value">${booking.venueSize} sq. ft.</span>
                        </div>
                        ` : ''}
                        
                        <!-- Entertainment Specific -->
                        ${booking.performanceDuration ? `
                        <div class="detail-item">
                            <span class="detail-label">Performance Duration:</span>
                            <span class="detail-value">${booking.performanceDuration} hours</span>
                        </div>
                        ` : ''}
                        ${booking.musicPreference ? `
                        <div class="detail-item">
                            <span class="detail-label">Music Preference:</span>
                            <span class="detail-value">${booking.musicPreference}</span>
                        </div>
                        ` : ''}
                        ${booking.performanceStyle ? `
                        <div class="detail-item">
                            <span class="detail-label">Performance Style:</span>
                            <span class="detail-value">${booking.performanceStyle}</span>
                        </div>
                        ` : ''}
                    </div>
                    
                    <!-- Contact Details -->
                    <div class="detail-section">
                        <h4>👤 Your Contact Information</h4>
                        <div class="detail-item">
                            <span class="detail-label">Name:</span>
                            <span class="detail-value">${booking.customerName || 'Not specified'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Email:</span>
                            <span class="detail-value">${booking.customerEmail || 'Not specified'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Phone:</span>
                            <span class="detail-value">${booking.customerPhone || 'Not specified'}</span>
                        </div>
                    </div>
                    
                    <!-- Vendor & Booking Info -->
                    <div class="detail-section">
                        <h4>📞 Vendor & Booking Information</h4>
                        <div class="detail-item">
                            <span class="detail-label">Vendor:</span>
                            <span class="detail-value">${booking.vendor || booking.name}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Vendor Phone:</span>
                            <span class="detail-value">${booking.contact?.phone || 'Not available'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Booking Date:</span>
                            <span class="detail-value">${bookingDate}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Booking Time:</span>
                            <span class="detail-value">${booking.bookingTime || 'Not specified'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Status:</span>
                            <span class="detail-value status-badge status-${booking.status}">${(booking.status || 'pending').charAt(0).toUpperCase() + (booking.status || 'pending').slice(1)}</span>
                        </div>
                        ${booking.acceptedAt ? `
                        <div class="detail-item">
                            <span class="detail-label">Accepted At:</span>
                            <span class="detail-value">${new Date(booking.acceptedAt).toLocaleString('en-IN')}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
                
                <!-- Special Requirements -->
                ${booking.specialRequirements || booking.specialRequests ? `
                <div class="detail-section special-requirements">
                    <h4>📝 Special Requirements & Preferences</h4>
                    <div class="requirements-content">
                        ${booking.specialRequirements || booking.specialRequests}
                    </div>
                </div>
                ` : ''}
                
                <!-- Special Shots (Photography) -->
                ${booking.specialShots ? `
                <div class="detail-section special-shots">
                    <h4>📸 Special Shots Requested</h4>
                    <div class="requirements-content">
                        ${booking.specialShots}
                    </div>
                </div>
                ` : ''}
                
                <!-- Performance Style (Entertainment) -->
                ${booking.performanceStyle ? `
                <div class="detail-section performance-style">
                    <h4>🎭 Performance Style Preferences</h4>
                    <div class="requirements-content">
                        ${booking.performanceStyle}
                    </div>
                </div>
                ` : ''}
                
                <!-- Actions -->
                <div class="booking-actions">
                    ${(booking.status !== 'cancelled' && booking.status !== 'rejected') ? `
                    <button class="btn btn-cancel-booking" onclick="customerDashboard.cancelBookingFromDashboard('${booking.id}', '${serviceType}')">
                        Cancel Booking
                    </button>
                    ` : ''}
                    <button class="btn btn-close-details" onclick="customerDashboard.closeCurrentModal(this)">
                        Close Details
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });

    document.addEventListener('keydown', function closeModalOnEscape(e) {
        if (e.key === 'Escape') {
            modal.remove();
            document.removeEventListener('keydown', closeModalOnEscape);
        }
    });
}



    // Shortlist Management
    displayShortlist() {
        const shortlistContainer = document.getElementById('shortlistContainer');
        if (!shortlistContainer) return;
        
        const shortlist = JSON.parse(localStorage.getItem('shortlist')) || [];
        shortlistContainer.innerHTML = '';
        
        if (shortlist.length === 0) {
            shortlistContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">⭐</div>
                    <h3>No Items in Shortlist</h3>
                    <p>Start adding services you like to your shortlist!</p>
                </div>
            `;
            return;
        }
        
        shortlist.forEach(item => {
            const shortlistItem = document.createElement('div');
            shortlistItem.className = 'shortlist-item';
            shortlistItem.innerHTML = `
                <div class="shortlist-details">
                    <div class="shortlist-name">${item.name}</div>
                    <div class="shortlist-type">${item.type}</div>
                    <div class="shortlist-price">${item.price}</div>
                    ${item.capacity ? `<div class="shortlist-capacity">${item.capacity}</div>` : ''}
                    ${item.specialty ? `<div class="shortlist-specialty">${item.specialty}</div>` : ''}
                    <div class="shortlist-date">Added: ${this.formatDate(item.addedDate)}</div>
                </div>
                <div class="shortlist-actions">
                    <button class="action-btn btn-primary" onclick="customerDashboard.bookFromShortlist('${item.id}')">Book Now</button>
                    <button class="action-btn btn-danger" onclick="customerDashboard.removeFromShortlist('${item.id}')">Remove</button>
                </div>
            `;
            shortlistContainer.appendChild(shortlistItem);
        });
    }

    removeFromShortlist(itemId) {
        if (confirm('Are you sure you want to remove this item from your shortlist?')) {
            const shortlist = JSON.parse(localStorage.getItem('shortlist')) || [];
            const updatedShortlist = shortlist.filter(item => item.id !== itemId);
            localStorage.setItem('shortlist', JSON.stringify(updatedShortlist));
            
            this.displayShortlist();
            this.updateDashboardStats();
            this.showToast('Item removed from shortlist');
            this.addNotification('Shortlist Updated', 'Item removed from your shortlist.', 'info');
        }
    }

    bookFromShortlist(itemId) {
        const shortlist = JSON.parse(localStorage.getItem('shortlist')) || [];
        const item = shortlist.find(item => item.id === itemId);
        
        if (item) {
            const serviceType = item.type.toLowerCase();
            const servicePages = {
                'catering': 'catering-vendors.html',
                'photography': 'photography-vendors.html', 
                'venue': 'venue-vendors.html',
                'entertainment': 'entertainment-vendor.html',
                'decoration': 'decoration-vendors.html',
                'makeup': 'makeup-vendors.html'
            };
            
            const targetPage = servicePages[serviceType];
            if (targetPage) {
                localStorage.setItem('preselectedService', JSON.stringify(item));
                window.location.href = targetPage;
            } else {
                this.showToast('Service page not found for: ' + item.type);
            }
        } else {
            this.showToast('Item not found in shortlist!');
        }
    }

    addToShortlist(itemData) {
        const shortlist = JSON.parse(localStorage.getItem('shortlist')) || [];
        
        const exists = shortlist.some(item => item.id === itemData.id);
        if (exists) {
            this.showToast('This item is already in your shortlist!');
            return;
        }
        
        shortlist.push({
            id: itemData.id,
            name: itemData.name,
            type: itemData.type,
            price: itemData.price,
            addedDate: new Date().toISOString().split('T')[0],
            vendor: itemData.vendor,
            image: itemData.image,
            specialty: itemData.specialty,
            capacity: itemData.capacity
        });
        
        localStorage.setItem('shortlist', JSON.stringify(shortlist));
        this.showToast('Added to shortlist successfully!');
        
        if (window.location.pathname.includes('dashboard')) {
            this.displayShortlist();
            this.updateDashboardStats();
        }
    }

    // Notification Management
    displayNotifications() {
        const notificationsContainer = document.querySelector('.notifications-list');
        if (!notificationsContainer) return;
        
        const notifications = JSON.parse(localStorage.getItem('notifications')) || [];
        
        if (notifications.length === 0) {
            notificationsContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🔔</div>
                    <h3>No Notifications</h3>
                    <p>You're all caught up!</p>
                </div>
            `;
            return;
        }
        
        notificationsContainer.innerHTML = '';
        notifications.forEach(notification => {
            const notificationItem = document.createElement('div');
            notificationItem.className = `notification-item ${notification.read ? '' : 'unread'}`;
            notificationItem.innerHTML = `
                <div class="notification-icon">${notification.icon || '🔔'}</div>
                <div class="notification-content">
                    <p><strong>${notification.title}</strong> ${notification.message}</p>
                    <span class="notification-time">${this.formatTime(notification.timestamp)}</span>
                </div>
                ${!notification.read ? `<button class="notification-action" onclick="customerDashboard.markNotificationAsRead(this)">✓</button>` : ''}
            `;
            notificationsContainer.appendChild(notificationItem);
        });
    }
    // CUSTOMER NOTIFICATION AND MESSAGE HANDLING
setupMessageHandling() {
    // Setup polling for new messages
    setInterval(() => {
        this.checkForNewMessages();
    }, 3000);
    
    // Initialize notification badges
    this.updateNotificationBadges();
}

// Check for new messages and notifications
checkForNewMessages() {
    if (window.messageBus) {
        window.messageBus.checkForNewMessages();
    }
}

// Handle incoming vendor messages
handleVendorMessage(message) {
    console.log('Customer: Handling vendor message:', message);
    
    // Save to customer's messages
    this.addVendorMessageToCustomer(message);
    
    // Add notification
    this.addNotification(
        'New Vendor Message',
        `Message from ${message.data.vendorName}: ${message.data.message.substring(0, 50)}...`,
        'info'
    );
    
    // Refresh messages if currently viewing
    if (document.getElementById('messages-content').classList.contains('active')) {
        this.displayMessages();
    }
}

// Add vendor message to customer's messages
addVendorMessageToCustomer(message) {
    const messages = JSON.parse(localStorage.getItem('vendorMessages')) || [];
    messages.unshift({
        id: message.id,
        vendor: message.data.vendorName,
        vendorId: message.data.vendorId,
        type: 'received',
        message: message.data.message,
        timestamp: new Date(message.timestamp).toISOString(),
        read: false
    });
    
    localStorage.setItem('vendorMessages', JSON.stringify(messages));
}

// Send message to vendor
sendMessageToVendor(vendorId, message) {
    if (window.messageBus) {
        const messageData = {
            message: message,
            customerId: this.getCustomerId(),
            customerName: this.getCustomerName()
        };
        
        window.messageBus.sendMessage('customer_to_vendor_message', messageData, 'vendor', vendorId);
        
        // Also save to local storage
        this.addCustomerMessageToVendor(vendorId, message);
        
        return true;
    }
    return false;
}

// Add customer message to vendor communication
addCustomerMessageToVendor(vendorId, message) {
    const messages = JSON.parse(localStorage.getItem('vendorMessages')) || [];
    messages.unshift({
        id: 'msg_' + Date.now(),
        vendor: this.getVendorNameById(vendorId),
        vendorId: vendorId,
        type: 'sent',
        message: message,
        timestamp: new Date().toISOString(),
        read: true
    });
    
    localStorage.setItem('vendorMessages', JSON.stringify(messages));
}

// Get customer ID and name
getCustomerId() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    return user ? user.id : null;
}

getCustomerName() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    return user ? user.fullName : 'Customer';
}

getVendorNameById(vendorId) {
    const vendors = JSON.parse(localStorage.getItem('vendors')) || [];
    const vendor = vendors.find(v => v.id === vendorId);
    return vendor ? vendor.businessName : 'Vendor';
}

    markNotificationAsRead(button) {
        const notificationItem = button.closest('.notification-item');
        notificationItem.classList.remove('unread');
        button.style.display = 'none';
        this.updateNotificationBadge();
    }

    addNotification(title, message, type = 'info') {
        const notifications = JSON.parse(localStorage.getItem('notifications')) || [];
        const icons = {
            info: '🔔',
            success: '✅',
            warning: '⚠️',
            payment: '💰'
        };
        
        notifications.unshift({
            id: this.generateId(),
            title,
            message,
            type,
            icon: icons[type] || '🔔',
            timestamp: new Date().toISOString(),
            read: false
        });
        
        localStorage.setItem('notifications', JSON.stringify(notifications));
        
        if (document.getElementById('notifications-content').classList.contains('active')) {
            this.displayNotifications();
        }
        
        this.updateNotificationBadge();
    }

    updateNotificationBadge() {
        const unreadCount = document.querySelectorAll('.notification-item.unread').length;
        const badges = document.querySelectorAll('.nav-badge.alert');
        badges.forEach(badge => {
            if (unreadCount > 0) {
                badge.textContent = unreadCount;
                badge.style.display = 'inline-block';
            } else {
                badge.style.display = 'none';
            }
        });
    }

    // Message Management
    displayMessages() {
        const messagesContainer = document.querySelector('.messages-list');
        if (!messagesContainer) return;
        
        const messages = JSON.parse(localStorage.getItem('vendorMessages')) || [];
        
        if (messages.length === 0) {
            messagesContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">💬</div>
                    <h3>No Messages</h3>
                    <p>You don't have any messages from vendors yet.</p>
                </div>
            `;
            return;
        }
        
        messagesContainer.innerHTML = '';
        messages.forEach(message => {
            const messageItem = document.createElement('div');
            messageItem.className = `message-item ${message.read ? '' : 'unread'}`;
            messageItem.innerHTML = `
                <div class="vendor-avatar" style="background: var(--medium-blue)">${this.getVendorIcon(message.vendor)}</div>
                <div class="message-content">
                    <div class="message-header">
                        <h4>${message.vendor}</h4>
                        <span class="message-time">${this.formatTime(message.timestamp)}</span>
                    </div>
                    <p class="message-preview">${message.message}</p>
                    <div class="message-actions">
                        <button class="action-btn btn-primary" onclick="customerDashboard.quickReply('${message.vendor}')">Reply</button>
                        <button class="action-btn btn-secondary" onclick="customerDashboard.viewMessageDetails('${message.id}')">View Details</button>
                    </div>
                </div>
            `;
            messagesContainer.appendChild(messageItem);
        });
    }

    quickReply(vendorName) {
        const message = prompt(`Quick reply to ${vendorName}:`);
        if (message) {
            this.showToast(`Message sent to ${vendorName}`);
            
            const messages = JSON.parse(localStorage.getItem('vendorMessages')) || [];
            messages.unshift({
                id: this.generateId(),
                vendor: vendorName,
                type: 'sent',
                message: message,
                timestamp: new Date().toISOString()
            });
            localStorage.setItem('vendorMessages', JSON.stringify(messages));
            
            if (document.getElementById('messages-content').classList.contains('active')) {
                this.displayMessages();
            }
        }
    }

    viewMessageDetails(messageId) {
        const messages = JSON.parse(localStorage.getItem('vendorMessages')) || [];
        const message = messages.find(m => m.id === messageId);
        
        if (message) {
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.style.display = 'flex';
            modal.innerHTML = `
                <div class="modal-content">
                    <h3 class="modal-title">Message Details</h3>
                    <div class="message-details-full">
                        <p><strong>From:</strong> ${message.vendor}</p>
                        <p><strong>Time:</strong> ${this.formatTime(message.timestamp)}</p>
                        <p><strong>Message:</strong></p>
                        <div class="message-content-full">${message.message}</div>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-cancel" onclick="customerDashboard.closeCurrentModal(this)">Close</button>
                        <button type="button" class="btn btn-submit" onclick="customerDashboard.quickReply('${message.vendor}')">Reply</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            });
        }
    }

    getVendorIcon(vendorName) {
        if (vendorName.includes('Photography')) return '📷';
        if (vendorName.includes('Venue')) return '🎪';
        if (vendorName.includes('Catering')) return '🍽️';
        if (vendorName.includes('Entertainment')) return '🎵';
        if (vendorName.includes('Decoration')) return '🎨';
        return '🏢';
    }

    // Other Display Methods (Payment, Activity, Recommendations)
    displayPaymentAgreements() {
        const paymentContainer = document.querySelector('.payment-categories');
        if (!paymentContainer) return;
        
        const paymentAgreements = JSON.parse(localStorage.getItem('paymentAgreements')) || [];
        
        if (paymentAgreements.length === 0) {
            paymentContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">💰</div>
                    <h3>No Payment Agreements</h3>
                    <p>You don't have any active payment agreements.</p>
                </div>
            `;
            return;
        }
        
        paymentContainer.innerHTML = '';
        paymentAgreements.forEach(agreement => {
            const agreementElement = document.createElement('div');
            agreementElement.className = 'payment-category';
            agreementElement.innerHTML = `
                <h4 class="category-title">${agreement.icon} ${agreement.service}</h4>
                <div class="payment-terms">
                    ${agreement.terms.map(term => `
                        <div class="term-item">
                            <span class="term-label">${term.label}</span>
                            <span class="term-value">${term.percentage} • ${term.amount}</span>
                            <span class="term-status ${term.status}">${term.dueDate}</span>
                        </div>
                    `).join('')}
                </div>
            `;
            paymentContainer.appendChild(agreementElement);
        });
    }

    displayRecentActivity() {
        const activityContainer = document.querySelector('.activity-timeline');
        if (!activityContainer) return;
        
        const activities = JSON.parse(localStorage.getItem('recentActivities')) || [];
        
        if (activities.length === 0) {
            activityContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📝</div>
                    <h3>No Recent Activity</h3>
                    <p>Your recent activities will appear here.</p>
                </div>
            `;
            return;
        }
        
        activityContainer.innerHTML = '';
        activities.forEach(activity => {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            activityItem.innerHTML = `
                <div class="activity-time">${this.formatTime(activity.timestamp)}</div>
                <div class="activity-content">
                    <div class="activity-icon">${activity.icon}</div>
                    <div class="activity-details">
                        <p><strong>${activity.action}</strong> ${activity.details}</p>
                        <span class="activity-meta">${activity.meta}</span>
                    </div>
                </div>
            `;
            activityContainer.appendChild(activityItem);
        });
    }

    displayRecommendations() {
        const recommendationsContainer = document.querySelector('.recommendations-grid');
        if (!recommendationsContainer) return;
        
        const recommendations = JSON.parse(localStorage.getItem('recommendations')) || [];
        
        if (recommendations.length === 0) {
            recommendationsContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">💡</div>
                    <h3>No Recommendations</h3>
                    <p>We'll show personalized recommendations here based on your preferences.</p>
                </div>
            `;
            return;
        }
        
        recommendationsContainer.innerHTML = '';
        recommendations.forEach(rec => {
            const recCard = document.createElement('div');
            recCard.className = 'recommendation-card';
            recCard.innerHTML = `
                <h3 class="recommendation-title">${rec.title}</h3>
                <div class="recommendation-price">${rec.price}</div>
                <div class="recommendation-rating">${rec.rating}</div>
                <p>${rec.description}</p>
                <button class="service-btn" onclick="customerDashboard.addRecommendationToShortlist('${rec.id}')">Add to Shortlist</button>
            `;
            recommendationsContainer.appendChild(recCard);
        });
    }

    addRecommendationToShortlist(recId) {
        const recommendations = JSON.parse(localStorage.getItem('recommendations')) || [];
        const recommendation = recommendations.find(rec => rec.id === recId);
        
        if (recommendation) {
            this.addToShortlist({
                id: recId,
                name: recommendation.title,
                type: recommendation.type || 'Service',
                price: recommendation.price,
                vendor: recommendation.vendor || 'Timeless Moments',
                specialty: recommendation.specialty
            });
        }
    }

    // Auto-accept Functions
// FIXED: Auto-accept booking function for main booking modal
autoAcceptBooking(bookingId, serviceType) {
    console.log('Auto-accepting booking:', bookingId, serviceType);
    
    // Search for the booking in all possible locations
    const booking = this.findBookingEverywhere(bookingId, serviceType);
    
    if (booking && booking.status === 'pending') {
        // Update booking status
        booking.status = 'confirmed';
        
        // Save back to all locations where this booking exists
        this.updateBookingInAllLocations(bookingId, 'confirmed', serviceType);
        
        this.showToast(`Your ${serviceType} booking has been confirmed!`);
        this.addNotification('Booking Confirmed', `Your ${serviceType} booking has been automatically confirmed.`, 'success');
        
        // Refresh displays
        if (document.getElementById('bookings-content').classList.contains('active')) {
            this.displayAllBookings();
        }
        
        this.updateDashboardStats();
    }
}

// FIXED: Auto-accept service booking function for service modal
autoAcceptServiceBooking(bookingId, serviceType) {
    console.log('Auto-accepting service booking:', bookingId, serviceType);
    
    // Search for the booking in all possible locations
    const booking = this.findBookingEverywhere(bookingId, serviceType);
    
    if (booking && booking.status === 'pending') {
        // Update booking status
        booking.status = 'confirmed';
        
        // Save back to all locations where this booking exists
        this.updateBookingInAllLocations(bookingId, 'confirmed', serviceType);
        
        this.showToast(`Your ${serviceType} booking has been confirmed!`);
        this.addNotification('Booking Confirmed', `Your ${serviceType} booking has been automatically confirmed.`, 'success');
        
        // Refresh displays
        if (document.getElementById('bookings-content').classList.contains('active')) {
            this.displayAllBookings();
        }
        
        this.updateDashboardStats();
    }
}

// NEW: Update booking status in all storage locations
updateBookingInAllLocations(bookingId, status, serviceType) {
    console.log('Updating booking status in all locations:', bookingId, status, serviceType);
    
    // 1. Update in main bookings
    const mainBookings = JSON.parse(localStorage.getItem('bookings')) || [];
    const mainIndex = mainBookings.findIndex(b => b.id === bookingId);
    if (mainIndex !== -1) {
        mainBookings[mainIndex].status = status;
        localStorage.setItem('bookings', JSON.stringify(mainBookings));
        console.log('Updated in main bookings');
    }
    
    // 2. Update in service-specific bookings
    if (serviceType) {
        const serviceBookings = JSON.parse(localStorage.getItem(`${serviceType}Bookings`)) || [];
        const serviceIndex = serviceBookings.findIndex(b => b.id === bookingId);
        if (serviceIndex !== -1) {
            serviceBookings[serviceIndex].status = status;
            localStorage.setItem(`${serviceType}Bookings`, JSON.stringify(serviceBookings));
            console.log('Updated in service bookings:', serviceType);
        }
    }
    
    // 3. Update in all service types (comprehensive update)
    const serviceTypes = ['catering', 'photography', 'venue', 'makeup', 'decoration', 'entertainment'];
    serviceTypes.forEach(type => {
        const typeBookings = JSON.parse(localStorage.getItem(`${type}Bookings`)) || [];
        const typeIndex = typeBookings.findIndex(b => b.id === bookingId);
        if (typeIndex !== -1) {
            typeBookings[typeIndex].status = status;
            localStorage.setItem(`${type}Bookings`, JSON.stringify(typeBookings));
            console.log('Updated in service type:', type);
        }
    });
    
    // 4. Update in vendor-specific storage (for real vendor bookings)
    this.updateVendorBookings(bookingId, status);
}

// NEW: Update vendor bookings from service pages
updateVendorBookings(bookingId, status) {
    // Check for vendor bookings in common storage patterns
    const vendorStorageKeys = [
        'vendorBookings',
        'photographyVendorBookings', 
        'venueVendorBookings',
        'cateringVendorBookings',
        'entertainmentVendorBookings',
        'decorationVendorBookings',
        'makeupVendorBookings',
        'currentVendorBookings'
    ];
    
    vendorStorageKeys.forEach(key => {
        const vendorBookings = JSON.parse(localStorage.getItem(key)) || [];
        const vendorIndex = vendorBookings.findIndex(b => b.id === bookingId);
        if (vendorIndex !== -1) {
            vendorBookings[vendorIndex].status = status;
            localStorage.setItem(key, JSON.stringify(vendorBookings));
            console.log('Updated in vendor storage:', key);
        }
    });
}


    // Dashboard Integration
    addToDashboardBookings(booking) {
        const allBookings = JSON.parse(localStorage.getItem('bookings')) || [];
        
        const exists = allBookings.some(b => b.id === booking.id && b.serviceType === booking.serviceType);
        if (exists) return;
        
        allBookings.push(booking);
        localStorage.setItem('bookings', JSON.stringify(allBookings));
    }

    updateDashboardBookingStatus(bookingId, status) {
        const allBookings = JSON.parse(localStorage.getItem('bookings')) || [];
        const bookingIndex = allBookings.findIndex(b => b.id === bookingId);
        
        if (bookingIndex !== -1) {
            allBookings[bookingIndex].status = status;
            localStorage.setItem('bookings', JSON.stringify(allBookings));
        }
        
        const serviceTypes = ['catering', 'entertainment', 'photography', 'venue', 'decoration'];
        serviceTypes.forEach(serviceType => {
            const serviceBookings = JSON.parse(localStorage.getItem(`${serviceType}Bookings`)) || [];
            const serviceBookingIndex = serviceBookings.findIndex(b => b.id === bookingId);
            if (serviceBookingIndex !== -1) {
                serviceBookings[serviceBookingIndex].status = status;
                localStorage.setItem(`${serviceType}Bookings`, JSON.stringify(serviceBookings));
            }
        });
    }

    updateDashboardStats(allBookings = null) {
        if (!allBookings) {
            const cateringBookings = JSON.parse(localStorage.getItem('cateringBookings')) || [];
            const entertainmentBookings = JSON.parse(localStorage.getItem('entertainmentBookings')) || [];
            const photographyBookings = JSON.parse(localStorage.getItem('photographyBookings')) || [];
            const venueBookings = JSON.parse(localStorage.getItem('venueBookings')) || [];
            const decorationBookings = JSON.parse(localStorage.getItem('decorationBookings')) || [];
            
            allBookings = [
                ...cateringBookings, ...entertainmentBookings, 
                ...photographyBookings, ...venueBookings, ...decorationBookings
            ];
        }
        
        const totalBookings = allBookings.length;
        const confirmedBookings = allBookings.filter(booking => booking.status === 'confirmed').length;
        const pendingBookings = allBookings.filter(booking => booking.status === 'pending').length;
        
        const shortlist = JSON.parse(localStorage.getItem('shortlist')) || [];
        const venueShortlist = shortlist.filter(item => item.type === 'Venue').length;
        const serviceShortlist = shortlist.filter(item => item.type !== 'Venue').length;
        
        if (document.getElementById('totalBookings')) {
            document.getElementById('totalBookings').textContent = totalBookings;
        }
        if (document.getElementById('confirmedBookings')) {
            document.getElementById('confirmedBookings').textContent = confirmedBookings;
        }
        if (document.getElementById('pendingBookings')) {
            document.getElementById('pendingBookings').textContent = pendingBookings;
        }
        if (document.getElementById('shortlistItems')) {
            document.getElementById('shortlistItems').textContent = shortlist.length;
        }
        if (document.getElementById('shortlistVenues')) {
            document.getElementById('shortlistVenues').textContent = venueShortlist;
        }
        if (document.getElementById('shortlistServices')) {
            document.getElementById('shortlistServices').textContent = serviceShortlist;
        }
    }

    // Profile Management
     loadUserProfile() {
        // First try to get current logged-in user
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        if (currentUser) {
            // Use real registration data
            this.updateUserInterface(currentUser);
        } else {
            // Fallback to sample data (for backward compatibility)
            const userProfile = JSON.parse(localStorage.getItem('userProfile')) || {
                fullName: 'John Smith',
                email: 'john.smith@example.com',
                phone: '+1 (555) 123-4567',
                location: 'New York, USA',
                eventType: 'Weddings & Corporate',
                memberSince: '2023'
            };
            
            this.updateProfileSection(userProfile, this.getUserInitials(userProfile.fullName));
        }
    }

    // UPDATED: Edit Profile Modal - Save to both currentUser and userProfile
    openEditProfileModal() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {
            fullName: '',
            email: '',
            phone: '',
            address: '',
            govtId: ''
        };
        
        // Pre-fill form with current user data
        document.getElementById('editFullName').value = currentUser.fullName || '';
        document.getElementById('editEmail').value = currentUser.email || '';
        document.getElementById('editPhone').value = currentUser.phone || '';
        document.getElementById('editLocation').value = currentUser.address || '';
        document.getElementById('editEventType').value = currentUser.preferredEventType || 'Weddings';
        
        document.getElementById('editProfileModal').style.display = 'flex';
    }

    // Utility Functions
    getAllBookings() {
    console.log('🔍 Searching for all bookings...');
    const allBookings = [];
    
    // 1. Main bookings storage
    try {
        const mainBookings = JSON.parse(localStorage.getItem('bookings')) || [];
        console.log('📋 Main bookings:', mainBookings);
        allBookings.push(...mainBookings);
    } catch (error) {
        console.error('Error reading main bookings:', error);
    }
    
    // 2. Service-specific bookings
    const serviceTypes = ['catering', 'photography', 'venue', 'makeup', 'decoration', 'entertainment'];
    
    serviceTypes.forEach(serviceType => {
        try {
            const serviceBookings = JSON.parse(localStorage.getItem(`${serviceType}Bookings`)) || [];
            console.log(`🎪 ${serviceType} bookings:`, serviceBookings);
            
            serviceBookings.forEach(booking => {
                if (!booking.serviceType) {
                    booking.serviceType = serviceType;
                }
                if (!allBookings.some(b => b.id === booking.id)) {
                    allBookings.push(booking);
                }
            });
        } catch (error) {
            console.error(`Error reading ${serviceType} bookings:`, error);
        }
    });
    
    // 3. Vendor bookings
    try {
        const vendorBookings = JSON.parse(localStorage.getItem('vendorBookings')) || [];
        console.log('🏢 Vendor bookings:', vendorBookings);
        vendorBookings.forEach(booking => {
            if (!allBookings.some(b => b.id === booking.id)) {
                allBookings.push(booking);
            }
        });
    } catch (error) {
        console.error('Error reading vendor bookings:', error);
    }
    
    console.log('✅ Total bookings found:', allBookings.length);
    return allBookings;
}

findBookingEverywhere(bookingId, serviceType) {
    console.log('🔍 Searching for booking:', bookingId, 'Service type:', serviceType);
    
    // Handle both numeric and string IDs - don't convert to number
    const searchId = bookingId;
    
    // Step 1: Search in specific service type first (most likely location)
    if (serviceType) {
        const serviceBookings = JSON.parse(localStorage.getItem(`${serviceType}Bookings`)) || [];
        console.log(`📍 Searching in ${serviceType}Bookings:`, serviceBookings.length, 'bookings');
        
        // Try exact match first
        let booking = serviceBookings.find(b => b.id === searchId);
        
        // If not found, try numeric conversion for backward compatibility
        if (!booking && !isNaN(searchId)) {
            const numericId = typeof searchId === 'string' ? parseInt(searchId) : searchId;
            booking = serviceBookings.find(b => {
                const bid = typeof b.id === 'string' ? parseInt(b.id) : b.id;
                return bid === numericId;
            });
        }
        
        if (booking) {
            console.log('✅ Found in specific service:', serviceType, booking);
            return booking;
        }
    }
    
    // Step 2: Search in all common booking types
    const commonBookingTypes = [
        'catering', 'decoration', 'entertainment', 'photography', 'venues',
        'venue', 'vendor', 'makeup', 'cateringServices', 'decorationServices', 
        'entertainmentServices', 'photographyServices'
    ];
    
    for (let type of commonBookingTypes) {
        const bookings = JSON.parse(localStorage.getItem(`${type}Bookings`)) || [];
        if (bookings.length > 0) {
            console.log(`🔍 Searching in ${type}Bookings:`, bookings.length, 'bookings');
            
            // Try exact match first
            let booking = bookings.find(b => b.id === searchId);
            
            // If not found, try numeric conversion for backward compatibility
            if (!booking && !isNaN(searchId)) {
                const numericId = typeof searchId === 'string' ? parseInt(searchId) : searchId;
                booking = bookings.find(b => {
                    const bid = typeof b.id === 'string' ? parseInt(b.id) : b.id;
                    return bid === numericId;
                });
            }
            
            if (booking) {
                console.log('✅ Found in:', type, booking);
                return booking;
            }
        }
    }
    
    // Step 3: Search in main consolidated bookings
    const mainBookings = JSON.parse(localStorage.getItem('bookings')) || [];
    console.log('🔍 Searching in main bookings:', mainBookings.length, 'bookings');
    
    // Try exact match first
    let mainBooking = mainBookings.find(b => b.id === searchId);
    
    // If not found, try numeric conversion for backward compatibility
    if (!mainBooking && !isNaN(searchId)) {
        const numericId = typeof searchId === 'string' ? parseInt(searchId) : searchId;
        mainBooking = mainBookings.find(b => {
            const bid = typeof b.id === 'string' ? parseInt(b.id) : b.id;
            return bid === numericId;
        });
    }
    
    if (mainBooking) {
        console.log('✅ Found in main bookings:', mainBooking);
        return mainBooking;
    }
    
    // Step 4: Comprehensive search through all localStorage keys
    console.log('🔍 Comprehensive search in all localStorage keys...');
    const foundKeys = [];
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        // Check if key might contain bookings
        if (key && (
            key.includes('Booking') || 
            key.includes('booking') ||
            key.endsWith('Bookings') ||
            key.includes('catering') ||
            key.includes('decoration') ||
            key.includes('entertainment') ||
            key.includes('photography') ||
            key.includes('venues') ||
            key.includes('vendor') ||
            key.includes('makeup')
        )) {
            try {
                const data = JSON.parse(localStorage.getItem(key));
                
                // Check if it's an array of bookings
                if (Array.isArray(data) && data.length > 0 && data[0].id !== undefined) {
                    console.log(`🔍 Searching in ${key}:`, data.length, 'items');
                    foundKeys.push(key);
                    
                    // Try exact match first
                    let booking = data.find(b => b.id === searchId);
                    
                    // If not found, try numeric conversion for backward compatibility
                    if (!booking && !isNaN(searchId)) {
                        const numericId = typeof searchId === 'string' ? parseInt(searchId) : searchId;
                        booking = data.find(b => {
                            const bid = typeof b.id === 'string' ? parseInt(b.id) : b.id;
                            return bid === numericId;
                        });
                    }
                    
                    if (booking) {
                        console.log('✅ Found in:', key, booking);
                        return booking;
                    }
                }
            } catch (e) {
                // Skip if not JSON or parsing fails
                continue;
            }
        }
    }
    
    // Step 5: Final attempt - search in all arrays in localStorage
    console.log('🔍 Final search in all localStorage arrays...');
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !key.startsWith('debug') && !key.startsWith('test')) {
            try {
                const data = JSON.parse(localStorage.getItem(key));
                if (Array.isArray(data) && data.length > 0) {
                    // Check if first item has booking-like properties
                    const firstItem = data[0];
                    if (firstItem && (firstItem.id !== undefined || firstItem.name !== undefined)) {
                        // Try exact match first
                        let booking = data.find(b => b && b.id === searchId);
                        
                        // If not found, try numeric conversion for backward compatibility
                        if (!booking && !isNaN(searchId)) {
                            const numericId = typeof searchId === 'string' ? parseInt(searchId) : searchId;
                            booking = data.find(b => {
                                if (!b || typeof b !== 'object') return false;
                                const bid = b.id ? (typeof b.id === 'string' ? parseInt(b.id) : b.id) : null;
                                return bid === numericId;
                            });
                        }
                        
                        if (booking) {
                            console.log('✅ Found in unexpected location:', key, booking);
                            return booking;
                        }
                    }
                }
            } catch (e) {
                // Skip non-JSON data
                continue;
            }
        }
    }
    
    // Log all found booking keys for debugging
    if (foundKeys.length > 0) {
        console.log('📋 All booking storage locations found:', foundKeys);
    } else {
        console.log('❌ No booking storage locations found in localStorage');
    }
    
    console.log('❌ Booking not found anywhere for ID:', searchId);
    
    // Debug: Show what bookings are actually available
    this.debugAvailableBookings();
    
    return null;
}

// Add this debug method to your class
debugAvailableBookings() {
    console.log('=== 🗂️ DEBUG: ALL AVAILABLE BOOKINGS ===');
    
    const bookingKeys = [
        'bookings', 'venueBookings', 'venuesBookings', 'cateringBookings',
        'decorationBookings', 'entertainmentBookings', 'photographyBookings',
        'vendorBookings', 'makeupBookings', 'cateringServicesBookings',
        'decorationServicesBookings', 'entertainmentServicesBookings', 
        'photographyServicesBookings'
    ];
    
    let totalBookings = 0;
    
    bookingKeys.forEach(key => {
        const bookings = JSON.parse(localStorage.getItem(key)) || [];
        console.log(`📁 ${key}: ${bookings.length} bookings`);
        
        if (bookings.length > 0) {
            console.log(`   IDs: ${bookings.map(b => `${b.id} (${typeof b.id})`).join(', ')}`);
            console.log(`   Names: ${bookings.map(b => b.name || 'undefined').join(', ')}`);
            totalBookings += bookings.length;
        }
    });
    
    // Check for any other booking-like keys
    console.log('=== 🔍 OTHER POTENTIAL BOOKING STORAGE ===');
    const otherKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
            key.includes('Booking') || 
            key.includes('booking') ||
            key.endsWith('Bookings')
        ) && !bookingKeys.includes(key)) {
            otherKeys.push(key);
        }
    }
    
    if (otherKeys.length > 0) {
        console.log('Other booking storage keys:', otherKeys);
        otherKeys.forEach(key => {
            try {
                const data = JSON.parse(localStorage.getItem(key));
                if (Array.isArray(data)) {
                    console.log(`📁 ${key}: ${data.length} items`);
                    if (data.length > 0 && data[0].id) {
                        console.log(`   IDs: ${data.map(b => `${b.id} (${typeof b.id})`).join(', ')}`);
                    }
                }
            } catch (e) {
                console.log(`📁 ${key}: Not JSON data`);
            }
        });
    }
    
    console.log(`=== 📊 TOTAL BOOKINGS FOUND: ${totalBookings} ===`);
}



 getServiceTypeFromBooking(booking) {
    // If serviceType is explicitly defined, use it
    if (booking.serviceType) return booking.serviceType;
    
    // Try to determine from booking name or other properties
    const name = (booking.name || '').toLowerCase();
    
    if (name.includes('venue') || name.includes('hall') || name.includes('resort')) return 'venue';
    if (name.includes('catering') || name.includes('food') || name.includes('meal')) return 'catering';
    if (name.includes('photography') || name.includes('photo') || name.includes('camera')) return 'photography';
    if (name.includes('entertainment') || name.includes('dj') || name.includes('music') || name.includes('band')) return 'entertainment';
    if (name.includes('decoration') || name.includes('decor') || name.includes('floral')) return 'decoration';
    if (name.includes('makeup') || name.includes('beauty') || name.includes('styling')) return 'makeup';
    
    // Check if it's stored in localStorage for specific service types
    const serviceTypes = ['venue', 'catering', 'photography', 'entertainment', 'decoration', 'makeup'];
    for (let type of serviceTypes) {
        const typeBookings = JSON.parse(localStorage.getItem(`${type}Bookings`)) || [];
        if (typeBookings.some(b => b.id === booking.id)) {
            return type;
        }
    }
    
    return 'general';
}

    findBookingDetails(bookingId) {
    console.log('Searching for booking:', bookingId);
    
    const mainBookings = JSON.parse(localStorage.getItem('bookings')) || [];
    let booking = mainBookings.find(b => b.id === bookingId);
    if (booking) {
        console.log('Found in main bookings');
        return booking;
    }
    
    const serviceTypes = ['catering', 'photography', 'venue', 'makeup', 'decoration', 'entertainment'];
    for (let serviceType of serviceTypes) {
        const serviceBookings = JSON.parse(localStorage.getItem(`${serviceType}Bookings`)) || [];
        booking = serviceBookings.find(b => b.id === bookingId);
        if (booking) {
            console.log('Found in:', serviceType, 'bookings');
            if (!booking.serviceType) {
                booking.serviceType = serviceType;
            }
            return booking;
        }
    }
    
    // Removed the "Booking not found anywhere" console log
    return null;
}

    showToast(message) {
        let toast = document.getElementById('bookingToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'bookingToast';
            toast.className = 'booking-toast';
            document.body.appendChild(toast);
        }
        
        toast.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    formatTime(timestamp) {
        const now = new Date();
        const date = new Date(timestamp);
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minutes ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        if (diffDays < 7) return `${diffDays} days ago`;
        
        return this.formatDate(timestamp);
    }

   initializeSampleData() {
    const hasExistingBookings = localStorage.getItem('bookings') || 
                                   localStorage.getItem('shortlist') || 
                                   localStorage.getItem('notifications');
        
        if (!hasExistingBookings) {
    // Sample shortlist data
    if (!localStorage.getItem('shortlist')) {
        const sampleShortlist = [
            {
                id: 's1',
                name: 'Beachside Resort Venue',
                type: 'Venue',
                price: '₹85,000',
                addedDate: '2024-12-05',
                vendor: 'Coastal Resorts',
                capacity: '200 guests'
            },
            {
                id: 's2',
                name: 'Premium DJ Services',
                type: 'Entertainment',
                price: '₹15,000',
                addedDate: '2024-12-01',
                vendor: 'Sound Masters'
            }
        ];
        localStorage.setItem('shortlist', JSON.stringify(sampleShortlist));
    }
    
    // Sample notifications
    if (!localStorage.getItem('notifications')) {
        const sampleNotifications = [
            {
                id: 'n1',
                title: 'Venue booking confirmed',
                message: 'for December 15, 2024',
                type: 'success',
                icon: '📅',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                read: false
            },
            {
                id: 'n2',
                title: 'Payment reminder:',
                message: '50% advance due for photography',
                type: 'payment',
                icon: '💵',
                timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
                read: false
            },
            {
                id: 'n3',
                title: 'New review:',
                message: 'Catering vendor rated your inquiry',
                type: 'info',
                icon: '⭐',
                timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                read: true
            }
        ];
        localStorage.setItem('notifications', JSON.stringify(sampleNotifications));
    }
    
    // Sample messages
    if (!localStorage.getItem('vendorMessages')) {
        const sampleMessages = [
            {
                id: 'm1',
                vendor: 'Pro Photography Co.',
                type: 'received',
                message: 'Hi! We have some questions about your wedding photography requirements. Are you available for a call tomorrow?',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                read: false
            },
            {
                id: 'm2',
                vendor: 'Grand Venue Hall',
                type: 'received',
                message: 'Your venue inspection is scheduled for tomorrow at 3:00 PM. Please bring your ID proof.',
                timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                read: true
            }
        ];
        localStorage.setItem('vendorMessages', JSON.stringify(sampleMessages));
    }
    
    // Sample payment agreements
    if (!localStorage.getItem('paymentAgreements')) {
        const samplePayments = [
            {
                id: 'p1',
                service: 'Venue',
                icon: '🎪',
                terms: [
                    { label: 'Advance Payment', percentage: '50%', amount: '₹25,000', status: 'paid', dueDate: 'Paid' },
                    { label: 'Final Payment', percentage: '50%', amount: '₹25,000', status: 'pending', dueDate: 'Due Dec 1' }
                ]
            },
            {
                id: 'p2',
                service: 'Photography',
                icon: '📷',
                terms: [
                    { label: 'Booking Fee', percentage: '30%', amount: '₹4,500', status: 'pending', dueDate: 'Due Today' },
                    { label: 'Balance Payment', percentage: '70%', amount: '₹10,500', status: 'upcoming', dueDate: 'Due Dec 10' }
                ]
            }
        ];
        localStorage.setItem('paymentAgreements', JSON.stringify(samplePayments));
    }
    
    // Sample recent activities
    if (!localStorage.getItem('recentActivities')) {
        const sampleActivities = [
            {
                id: 'a1',
                action: 'Booking confirmed',
                details: '- Photography services',
                meta: 'Vendor: Pro Photography Co.',
                icon: '✅',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'a2',
                action: 'Message sent',
                details: 'to decoration vendor',
                meta: 'Regarding floral arrangements',
                icon: '💬',
                timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'a3',
                action: 'Added to shortlist',
                details: '- Premium DJ Services',
                meta: '₹25,000 • 4.8★ rating',
                icon: '⭐',
                timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
            }
        ];
        localStorage.setItem('recentActivities', JSON.stringify(sampleActivities));
    }
    
    // Sample recommendations
    if (!localStorage.getItem('recommendations')) {
        const sampleRecommendations = [
            {
                id: 'r1',
                title: 'Garden Wedding Package',
                price: '₹75,000',
                rating: '★★★★☆ (4.2)',
                description: 'Complete wedding package including venue, decoration, and basic catering for up to 100 guests.',
                type: 'Package',
                vendor: 'Garden Events'
            },
            {
                id: 'r2',
                title: 'Corporate Event Photography',
                price: '₹15,000',
                rating: '★★★★★ (4.8)',
                description: 'Professional photography services for corporate events, conferences, and seminars.',
                type: 'Photography',
                vendor: 'Pro Photography Co.'
            },
            {
                id: 'r3',
                title: 'Luxury Catering Service',
                price: '₹1,200 per plate',
                rating: '★★★★☆ (4.5)',
                description: 'Premium multi-cuisine catering with customizable menu options for all types of events.',
                type: 'Catering',
                vendor: 'Elite Caterers'
            }
        ];
        localStorage.setItem('recommendations', JSON.stringify(sampleRecommendations));
    }
    }
    
    // Sample bookings data
    if (!localStorage.getItem('bookings')) {
        const sampleBookings = [
            {
                id: 'b1',
                name: 'Wedding Photography Package',
                serviceType: 'photography',
                vendor: 'Pro Photography Co.',
                date: '2024-12-15',
                time: '10:00',
                guestCount: '150',
                specialRequests: 'Need outdoor and indoor coverage',
                status: 'confirmed',
                bookingDate: '2024-11-20',
                price: '₹45,000'
            },
            {
                id: 'b2',
                name: 'Reception Venue Booking',
                serviceType: 'venue',
                vendor: 'Grand Venue Hall',
                date: '2024-12-16',
                time: '18:00',
                guestCount: '200',
                specialRequests: 'Stage setup with floral decorations',
                status: 'pending',
                bookingDate: '2024-11-25',
                price: '₹85,000'
            }
        ];
        localStorage.setItem('bookings', JSON.stringify(sampleBookings));
    }
    
    // Sample service-specific bookings
    const serviceTypes = ['catering', 'photography', 'venue', 'entertainment', 'decoration', 'makeup'];
    serviceTypes.forEach(serviceType => {
        if (!localStorage.getItem(`${serviceType}Bookings`)) {
            const sampleServiceBookings = [
                {
                    id: `${serviceType}_1`,
                    name: `${this.capitalizeFirstLetter(serviceType)} Service Package`,
                    serviceType: serviceType,
                    vendor: `Premium ${this.capitalizeFirstLetter(serviceType)} Co.`,
                    date: '2024-12-15',
                    time: serviceType === 'catering' ? '12:00' : '10:00',
                    guestCount: '150',
                    specialRequests: `Standard ${serviceType} package requirements`,
                    status: 'pending',
                    bookingDate: new Date().toISOString().split('T')[0],
                    price: 'To be confirmed'
                }
            ];
            localStorage.setItem(`${serviceType}Bookings`, JSON.stringify(sampleServiceBookings));
        }
    });
}

// Helper method for capitalizing service types
capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}



// Method to handle booking cancellation from service pages
cancelBookingFromService(bookingId, serviceType) {
    this.cancelBooking(bookingId, serviceType);
}

// Method to get booking status for display
getBookingStatus(bookingId) {
    const booking = this.findBookingDetails(bookingId);
    return booking ? booking.status : 'not found';
}

// Method to check if a service is in shortlist
isInShortlist(itemId) {
    const shortlist = JSON.parse(localStorage.getItem('shortlist')) || [];
    return shortlist.some(item => item.id === itemId);
}

// Method to toggle shortlist status
toggleShortlist(itemData) {
    const shortlist = JSON.parse(localStorage.getItem('shortlist')) || [];
    const existingIndex = shortlist.findIndex(item => item.id === itemData.id);
    
    if (existingIndex !== -1) {
        // Remove from shortlist
        shortlist.splice(existingIndex, 1);
        localStorage.setItem('shortlist', JSON.stringify(shortlist));
        this.showToast('Removed from shortlist');
        return false;
    } else {
        // Add to shortlist
        this.addToShortlist(itemData);
        return true;
    }
}

// Method to clear all notifications
clearAllNotifications() {
    if (confirm('Are you sure you want to clear all notifications?')) {
        localStorage.setItem('notifications', JSON.stringify([]));
        this.displayNotifications();
        this.updateNotificationBadge();
        this.showToast('All notifications cleared');
    }
}

// Method to mark all notifications as read
markAllNotificationsAsRead() {
    const notifications = JSON.parse(localStorage.getItem('notifications')) || [];
    notifications.forEach(notification => {
        notification.read = true;
    });
    localStorage.setItem('notifications', JSON.stringify(notifications));
    this.displayNotifications();
    this.updateNotificationBadge();
    this.showToast('All notifications marked as read');
}

// Method to get upcoming bookings
getUpcomingBookings() {
    const allBookings = this.getAllBookings();
    const today = new Date();
    return allBookings.filter(booking => {
        if (!booking.date || booking.status === 'cancelled') return false;
        const bookingDate = new Date(booking.date);
        return bookingDate >= today && booking.status === 'confirmed';
    }).sort((a, b) => new Date(a.date) - new Date(b.date));
}

// Method to get pending actions count
getPendingActionsCount() {
    const allBookings = this.getAllBookings();
    const pendingBookings = allBookings.filter(booking => booking.status === 'pending').length;
    
    const notifications = JSON.parse(localStorage.getItem('notifications')) || [];
    const unreadNotifications = notifications.filter(notification => !notification.read).length;
    
    const messages = JSON.parse(localStorage.getItem('vendorMessages')) || [];
    const unreadMessages = messages.filter(message => !message.read).length;
    
    return pendingBookings + unreadNotifications + unreadMessages;
}

// Method to export booking data
exportBookingsData() {
    const allBookings = this.getAllBookings();
    const dataStr = JSON.stringify(allBookings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `my-bookings-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    this.showToast('Booking data exported successfully');
}

// Method to import booking data
importBookingsData(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importedData = JSON.parse(e.target.result);
            if (Array.isArray(importedData)) {
                const existingBookings = JSON.parse(localStorage.getItem('bookings')) || [];
                const mergedBookings = [...existingBookings, ...importedData];
                localStorage.setItem('bookings', JSON.stringify(mergedBookings));
                
                this.displayAllBookings();
                this.updateDashboardStats();
                this.showToast('Booking data imported successfully');
            } else {
                this.showToast('Invalid file format');
            }
        } catch (error) {
            this.showToast('Error importing data: ' + error.message);
        }
    };
    reader.readAsText(file);
}

// Method to reset dashboard data (for testing)
resetDashboardData() {
    if (confirm('Are you sure you want to reset all dashboard data? This action cannot be undone.')) {
        const keysToRemove = [
            'shortlist', 'notifications', 'vendorMessages', 'paymentAgreements',
            'recentActivities', 'recommendations', 'bookings'
        ];
        
        const serviceTypes = ['catering', 'photography', 'venue', 'entertainment', 'decoration', 'makeup'];
        serviceTypes.forEach(type => {
            keysToRemove.push(`${type}Bookings`);
        });
        
        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
        });
        
        this.initializeSampleData();
        
        // Refresh all displays
        this.displayAllBookings();
        this.displayShortlist();
        this.displayNotifications();
        this.displayMessages();
        this.displayPaymentAgreements();
        this.displayRecentActivity();
        this.displayRecommendations();
        this.updateDashboardStats();
        
        this.showToast('Dashboard data reset successfully');
    }
}

// Method to search across all data
searchDashboard(query) {
    if (!query.trim()) {
        return {
            bookings: [],
            shortlist: [],
            notifications: []
        };
    }
    
    const searchTerm = query.toLowerCase();
    const results = {
        bookings: [],
        shortlist: [],
        notifications: []
    };
    
    // Search bookings
    const allBookings = this.getAllBookings();
    results.bookings = allBookings.filter(booking => 
        booking.name.toLowerCase().includes(searchTerm) ||
        booking.vendor.toLowerCase().includes(searchTerm) ||
        booking.serviceType.toLowerCase().includes(searchTerm) ||
        (booking.specialRequests && booking.specialRequests.toLowerCase().includes(searchTerm))
    );
    
    // Search shortlist
    const shortlist = JSON.parse(localStorage.getItem('shortlist')) || [];
    results.shortlist = shortlist.filter(item =>
        item.name.toLowerCase().includes(searchTerm) ||
        item.type.toLowerCase().includes(searchTerm) ||
        item.vendor.toLowerCase().includes(searchTerm)
    );
    
    // Search notifications
    const notifications = JSON.parse(localStorage.getItem('notifications')) || [];
    results.notifications = notifications.filter(notification =>
        notification.title.toLowerCase().includes(searchTerm) ||
        notification.message.toLowerCase().includes(searchTerm)
    );
    
    return results;
}

// Method to get dashboard analytics
getDashboardAnalytics() {
    const allBookings = this.getAllBookings();
    const shortlist = JSON.parse(localStorage.getItem('shortlist')) || [];
    
    const totalSpent = allBookings
        .filter(booking => booking.status === 'confirmed' && booking.price !== 'To be confirmed')
        .reduce((total, booking) => {
            const price = parseInt(booking.price.replace(/[^0-9]/g, '')) || 0;
            return total + price;
        }, 0);
    
    const serviceTypeCount = {};
    allBookings.forEach(booking => {
        const type = booking.serviceType || 'general';
        serviceTypeCount[type] = (serviceTypeCount[type] || 0) + 1;
    });
    
    const monthlyBookings = {};
    allBookings.forEach(booking => {
        const month = booking.bookingDate ? booking.bookingDate.substring(0, 7) : 'unknown';
        monthlyBookings[month] = (monthlyBookings[month] || 0) + 1;
    });
    
    return {
        totalBookings: allBookings.length,
        confirmedBookings: allBookings.filter(b => b.status === 'confirmed').length,
        pendingBookings: allBookings.filter(b => b.status === 'pending').length,
        cancelledBookings: allBookings.filter(b => b.status === 'cancelled').length,
        totalSpent: totalSpent,
        shortlistCount: shortlist.length,
        serviceTypeDistribution: serviceTypeCount,
        monthlyTrend: monthlyBookings,
        upcomingBookings: this.getUpcomingBookings().length
    };
}
}

// Initialize the dashboard
// Initialize the dashboard when the script loads
document.addEventListener('DOMContentLoaded', function() {
    window.customerDashboard = new CustomerDashboard();
});