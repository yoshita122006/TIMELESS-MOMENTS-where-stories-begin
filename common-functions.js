// common-functions.js

// Generate unique ID function
function generateId() {
    return 'id_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Book Service Function (Universal)
function bookService(service, button) {
    console.log('Booking service:', service);
    
    const booking = {
        id: service.id,
        name: service.name,
        serviceType: getServiceTypeFromPage(),
        specialty: service.specialty || service.type || 'Service',
        price: service.price,
        image: service.image,
        contact: service.contact || { phone: 'Not specified' },
        state: service.state || 'Not specified',
        date: new Date().toISOString().split('T')[0],
        time: '12:00',
        guestCount: service.guestCount || 50,
        bookingDate: new Date().toISOString().split('T')[0],
        status: 'pending',
        vendor: service.name,
        acceptedAt: null
    };
    
    // Save to service-specific bookings
    const serviceType = getServiceTypeFromPage();
    const existingBookings = JSON.parse(localStorage.getItem(`${serviceType}Bookings`)) || [];
    existingBookings.push(booking);
    localStorage.setItem(`${serviceType}Bookings`, JSON.stringify(existingBookings));
    
    // Update UI
    if (button) {
        button.textContent = '✓ Pending';
        button.classList.remove('btn-primary');
        button.classList.add('btn-success');
        button.disabled = true;
    }
    
    showToast(`Booking request sent to ${service.name}! Status: Pending`);
    
    // Auto-confirm after 1 minute
    setTimeout(() => {
        updateBookingStatus(service.id, 'confirmed', serviceType);
    }, 60000);
}

// Add to Shortlist Function (Universal)
function addToShortlist(service) {
    const shortlist = JSON.parse(localStorage.getItem('shortlist')) || [];
    
    // Check if already in shortlist
    const exists = shortlist.some(item => item.id === service.id);
    if (exists) {
        showToast('This item is already in your shortlist!');
        return;
    }
    
    // Add to shortlist
    shortlist.push({
        id: service.id,
        name: service.name,
        type: getServiceTypeFromPage(),
        price: service.price,
        vendor: service.vendor || service.name,
        addedDate: new Date().toISOString().split('T')[0],
        image: service.image,
        rating: service.rating
    });
    
    localStorage.setItem('shortlist', JSON.stringify(shortlist));
    showToast('Added to shortlist successfully!');
}

// Remove from Shortlist
function removeFromShortlist(itemId) {
    const shortlist = JSON.parse(localStorage.getItem('shortlist')) || [];
    const updatedShortlist = shortlist.filter(item => item.id !== itemId);
    localStorage.setItem('shortlist', JSON.stringify(updatedShortlist));
    showToast('Item removed from shortlist');
}

// Update Booking Status
function updateBookingStatus(serviceId, status, serviceType) {
    const bookings = JSON.parse(localStorage.getItem(`${serviceType}Bookings`)) || [];
    const bookingIndex = bookings.findIndex(booking => booking.id === serviceId);
    
    if (bookingIndex !== -1) {
        bookings[bookingIndex].status = status;
        localStorage.setItem(`${serviceType}Bookings`, JSON.stringify(bookings));
        showToast(`Booking ${status} for ${bookings[bookingIndex].name}!`);
    }
}

// Toast Notification
function showToast(message) {
    // Create toast if it doesn't exist
    let toast = document.getElementById('globalToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'globalToast';
        toast.className = 'global-toast';
        document.body.appendChild(toast);
        
        // Add toast styles
        const style = document.createElement('style');
        style.textContent = `
            .global-toast {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: #4CAF50;
                color: white;
                padding: 15px 25px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 10000;
                transform: translateY(100px);
                opacity: 0;
                transition: all 0.3s ease;
            }
            .global-toast.show {
                transform: translateY(0);
                opacity: 1;
            }
        `;
        document.head.appendChild(style);
    }
    
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Get Service Type from Current Page
function getServiceTypeFromPage() {
    const path = window.location.pathname;
    if (path.includes('photography')) return 'photography';
    if (path.includes('venue')) return 'venue';
    if (path.includes('catering')) return 'catering';
    if (path.includes('entertainment')) return 'entertainment';
    if (path.includes('decoration')) return 'decoration';
    return 'service';
}

// Initialize service page
function initServicePage() {
    // Add event listeners to all book now buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('book-now-btn')) {
            const card = e.target.closest('.service-card, .vendor-card, .catering-card');
            if (card) {
                const serviceData = getServiceDataFromCard(card);
                bookService(serviceData, e.target);
            }
        }
        
        if (e.target.classList.contains('shortlist-btn')) {
            const card = e.target.closest('.service-card, .vendor-card, .catering-card');
            if (card) {
                const serviceData = getServiceDataFromCard(card);
                addToShortlist(serviceData);
                
                // Update button state
                e.target.textContent = '✓ Shortlisted';
                e.target.classList.add('added');
            }
        }
    });
}

// Extract service data from card element
function getServiceDataFromCard(card) {
    return {
        id: card.dataset.serviceId || generateId(),
        name: card.querySelector('.service-title, .vendor-name, .catering-name')?.textContent || 'Service',
        price: card.querySelector('.service-price, .vendor-price, .catering-price')?.textContent || 'Not specified',
        image: card.querySelector('.service-image, .vendor-image, .catering-image')?.style.backgroundImage.replace('url("', '').replace('")', '') || '',
        rating: card.querySelector('.service-rating, .vendor-rating, .catering-rating')?.textContent || 'Not rated',
        specialty: card.querySelector('.service-specialty, .vendor-specialty, .catering-specialty')?.textContent || 'Service',
        vendor: card.querySelector('.vendor-name')?.textContent || 'Vendor'
    };
}

// Check if service is already booked
function isServiceBooked(serviceId) {
    const serviceType = getServiceTypeFromPage();
    const bookings = JSON.parse(localStorage.getItem(`${serviceType}Bookings`)) || [];
    return bookings.find(booking => booking.id === serviceId && booking.status !== 'cancelled');
}

// Check if service is shortlisted
function isServiceShortlisted(serviceId) {
    const shortlist = JSON.parse(localStorage.getItem('shortlist')) || [];
    return shortlist.some(item => item.id === serviceId);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    if (!window.location.pathname.includes('dashboard')) {
        initServicePage();
    }
});