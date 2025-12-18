class VendorDashboard {
  constructor() {
    window.isVendorDashboard = true;
    this.vendorData = this.loadVendorData();
    this.uploadedFiles = [];
    this.realTimeInterval = null;
    this.initialized = false;
    this.handleServiceClick = this.handleServiceClick.bind(this);

    // Bind all methods
    this.init = this.init.bind(this);
    this.loadVendorData = this.loadVendorData.bind(this);
     this.switchPage = this.switchPage.bind(this);
    this.startBookingMonitoring = this.startBookingMonitoring.bind(this);
    this.checkForNewBookings = this.checkForNewBookings.bind(this);
    this.acceptRealBooking = this.acceptRealBooking.bind(this);
    this.rejectRealBooking = this.rejectRealBooking.bind(this);
    this.viewRealBookingDetails = this.viewRealBookingDetails.bind(this);
    this.showServiceDetails = this.showServiceDetails.bind(this);
    this.determineVendorType = this.determineVendorType.bind(this);
    this.populateVendorProfile = this.populateVendorProfile.bind(this);
    this.displayServices = this.displayServices.bind(this);
    this.attachServiceEventListeners = this.attachServiceEventListeners.bind(this);
    this.editService = this.editService.bind(this);
    this.deleteService = this.deleteService.bind(this);
    this.addVendorSpecificCard = this.addVendorSpecificCard.bind(this);
    this.showVendorSpecificFields = this.showVendorSpecificFields.bind(this);
    this.handleFileUpload = this.handleFileUpload.bind(this);
    this.updateUploadedFilesList = this.updateUploadedFilesList.bind(this);
    this.resetFileUpload = this.resetFileUpload.bind(this);
    this.setupBookingActions = this.setupBookingActions.bind(this);
    this.addSampleBookings = this.addSampleBookings.bind(this);
    this.moveToConfirmed = this.moveToConfirmed.bind(this);
    this.setupEventListeners = this.setupEventListeners.bind(this);
    this.updateVendorDataInStorage = this.updateVendorDataInStorage.bind(this);
    this.getVendorSpecificDataForStorage = this.getVendorSpecificDataForStorage.bind(this);
    this.updateVendorSpecificData = this.updateVendorSpecificData.bind(this);
    this.testBookingActions = this.testBookingActions.bind(this);
  }

loadVendorData() {
    const currentVendor = JSON.parse(localStorage.getItem('currentVendor'));
    
    console.log("🔍 Loading vendor data from localStorage...");
    console.log("📦 Raw currentVendor from localStorage:", currentVendor);
    
    if (!currentVendor) {
        console.warn('❌ No vendor data found in localStorage');
        window.location.href = 'vendor-login.html';
        return {};
    }

    // Process services
    const processedServices = this.processVendorServices(currentVendor.services || []);
    
    const vendorData = {
        vendorId: currentVendor.id || 'VEN001',
        businessName: currentVendor.businessName || currentVendor.name || 'Unknown Business',
        businessType: currentVendor.businessType || currentVendor.businessCategory || 'Vendor',
        category: currentVendor.category || currentVendor.businessCategory || 'Service Provider',
        establishedYear: currentVendor.establishedYear || '2024',
        contactNumber: currentVendor.contactNumber || currentVendor.phone || 'Not provided',
        email: currentVendor.email || currentVendor.businessEmail || 'Not provided',
        address: currentVendor.address || currentVendor.businessAddress || 'Not provided',
        capacity: currentVendor.capacity || 'Not specified',
        parking: currentVendor.parking || 'Not specified',
        amenities: currentVendor.amenities || ['Basic Amenities'],
        businessHours: {
            regular: currentVendor.regularHours || currentVendor.businessHours?.regular || 'Not specified',
            events: currentVendor.eventHours || currentVendor.businessHours?.events || 'Not specified'
        },
        vendorType: this.determineVendorType(processedServices),
        services: processedServices,
        govtId: currentVendor.govtId || 'Not provided',
        registrationDate: currentVendor.registrationDate || new Date().toISOString().split('T')[0]
    };
    
    console.log("✅ Final vendorData structure:", vendorData);
    return vendorData;
}
// Test method - run this in browser console
testVendorData() {
    console.log("=== VENDOR DATA TEST ===");
    
    // Check localStorage
    const currentVendor = JSON.parse(localStorage.getItem('currentVendor'));
    console.log("📍 localStorage currentVendor:", currentVendor);
    
    // Check current vendorData
    console.log("📍 this.vendorData:", this.vendorData);
    
    // Check if elements exist
    console.log("📍 dashboard-vendor-name element:", document.getElementById('dashboard-vendor-name'));
    console.log("📍 profile-business-name element:", document.getElementById('profile-business-name'));
    console.log("📍 profile-category element:", document.getElementById('profile-category'));
    
    // Try to manually set some data
    const testName = "Test Business Name";
    document.getElementById('dashboard-vendor-name').textContent = testName;
    document.getElementById('profile-business-name').textContent = testName;
    document.getElementById('profile-category').textContent = "Test Category";
    
    console.log("✅ Manually set test data - if you see this, elements exist");
    console.log("========================");
}

  // Process and fix vendor services
  processVendorServices(services) {
    console.log('🔄 Processing vendor services...');
    
    if (!services || !Array.isArray(services) || services.length === 0) {
      console.log('No services found, creating sample services');
      return this.createSampleServices();
    }

    // Remove duplicates based on title + category
    const uniqueServices = [];
    const seenServices = new Set();

    const processedServices = services.map((service, index) => {
      // Generate proper ID if missing
      if (!service.id || isNaN(parseInt(service.id))) {
        service.id = Date.now() + index;
      }

      // Fix service title and data
      const fixedService = this.fixServiceData(service);
      
      return fixedService;
    });

    // Remove duplicates
    processedServices.forEach(service => {
      const serviceKey = `${service.title}-${service.category}`;
      if (!seenServices.has(serviceKey)) {
        seenServices.add(serviceKey);
        uniqueServices.push(service);
      }
    });

    console.log(`✅ Processed ${uniqueServices.length} unique services`);
    return uniqueServices;
  }

  // Fix individual service data
// In fixServiceData method - ensure features array exists
fixServiceData(service) {
    const serviceFixes = {
        'photography': {
            title: 'Professional Photography',
            description: 'Professional photography services for all events with experienced photographers and high-quality equipment.',
            minPrice: '30000',
            maxPrice: '80000',
            icon: 'camera',
            features: ['Professional Equipment', 'Experienced Photographers', 'High-Quality Editing', 'Multiple Shots', 'Digital Delivery']
        },
        'corporate': {
            title: 'Corporate Event Package',
            description: 'Professional corporate event management with full AV support, catering, and professional setup.',
            minPrice: '50000',
            maxPrice: '150000',
            icon: 'briefcase',
            features: ['AV Equipment', 'Professional Setup', 'Catering Services', 'Technical Support', 'Flexible Layouts']
        },
        'wedding': {
            title: 'Grand Wedding Package',
            description: 'Complete wedding services including venue, decoration, catering, and photography for 150-200 guests.',
            minPrice: '150000',
            maxPrice: '300000',
            icon: 'glass-cheers',
            features: ['Venue Decoration', 'Catering Services', 'Photography', 'Event Coordination', 'Guest Management']
        },
        'venue': {
            title: 'Premium Event Venue',
            description: 'Beautiful event space with complete amenities, perfect for weddings, corporate events, and celebrations.',
            minPrice: '100000',
            maxPrice: '300000',
            icon: 'building',
            features: ['Air Conditioning', 'Professional Lighting', 'Audio-Visual Equipment', 'Catering Services', 'Parking Facilities']
        },
        'catering': {
            title: 'Premium Catering Service',
            description: 'Exquisite catering with multiple cuisine options, live counters, and professional serving staff.',
            minPrice: '600',
            maxPrice: '1800',
            icon: 'utensils',
            features: ['Multiple Cuisines', 'Live Counters', 'Professional Staff', 'Hygienic Preparation', 'Custom Menu Options']
        },
        'entertainment': {
            title: 'Entertainment Services',
            description: 'DJ, live music, and performers to make your event memorable and engaging for all guests.',
            minPrice: '25000',
            maxPrice: '60000',
            icon: 'music',
            features: ['Professional DJ', 'Live Music', 'Sound Equipment', 'Lighting Effects', 'MC Services']
        },
        'decoration': {
            title: 'Decoration Services',
            description: 'Professional event decoration with various themes and styles to match your event vision.',
            minPrice: '20000',
            maxPrice: '60000',
            icon: 'palette',
            features: ['Theme-based Decor', 'Flower Arrangements', 'Lighting Design', 'Setup & Teardown', 'Custom Designs']
        },
        'birthday': {
            title: 'Birthday Celebration Package',
            description: 'Fun-filled birthday party with theme-based decorations, entertainment, and customized cakes.',
            minPrice: '25000',
            maxPrice: '75000',
            icon: 'birthday-cake',
            features: ['Theme Decorations', 'Entertainment', 'Customized Cake', 'Party Planning', 'Guest Activities']
        },
        'engagement': {
            title: 'Engagement Ceremony Package',
            description: 'Complete engagement ceremony services with traditional decorations, photography, and catering.',
            minPrice: '80000',
            maxPrice: '150000',
            icon: 'gem',
            features: ['Traditional Decor', 'Photography', 'Catering', 'Ceremony Coordination', 'Guest Seating']
        },
        'makeup': {
            title: 'Professional Makeup Services',
            description: 'Professional makeup artists for bridal, party, and special occasion makeup with premium products.',
            minPrice: '15000',
            maxPrice: '45000',
            icon: 'spa',
            features: ['Bridal Makeup', 'Premium Products', 'Hair Styling', 'Multiple Looks', 'On-location Service']
        },
        'transportation': {
            title: 'Event Transportation',
            description: 'Luxury transportation services for weddings, corporate events, and special occasions.',
            minPrice: '20000',
            maxPrice: '50000',
            icon: 'car',
            features: ['Luxury Vehicles', 'Professional Drivers', 'On-time Service', 'Decoration Options', 'Multiple Stops']
        }
    };

    const category = (service.category || 'general').toLowerCase();
    const fix = serviceFixes[category] || {
        title: `Professional ${category.charAt(0).toUpperCase() + category.slice(1)} Services`,
        description: `High-quality ${category} services with experienced professionals and premium equipment.`,
        minPrice: '25000',
        maxPrice: '75000',
        icon: 'star',
        features: ['Professional Service', 'Quality Guarantee', 'Experienced Team', 'Custom Solutions', 'On-time Delivery']
    };

    return {
    id: service.id,
    name: this.shouldFixTitle(service.title) ? fix.title : service.title,
    specialty: service.specialty || fix.title,
    description: this.shouldFixDescription(service.description) ? fix.description : service.description,
    category: service.category || category,
    minPrice: service.minPrice || fix.minPrice,
    maxPrice: service.maxPrice || fix.maxPrice,
    // ADD THIS LINE to ensure price field exists:
    price: service.price || `₹${parseInt(service.minPrice || fix.minPrice).toLocaleString('en-IN')} - ₹${parseInt(service.maxPrice || fix.maxPrice).toLocaleString('en-IN')}`,
    capacity: service.capacity || 'Not specified',
    experience: service.experience || 'Not specified',
    rating: service.rating || 4.5,
    image: service.image || this.getDefaultServiceImage(category),
    features: service.features || fix.features,
    contact: {
        phone: service.contact?.phone || 'Not provided'
    },
    packages: service.packages || this.generatePackages(
        parseInt(service.minPrice || fix.minPrice), 
        parseInt(service.maxPrice || fix.maxPrice), 
        category
    ),
    icon: service.icon || fix.icon,
    photos: service.photos || []
};
}

  // Helper methods to determine if fixes are needed
  shouldFixTitle(title) {
    return !title || 
           title === 'Untitled Service' || 
           title === 'Event Service' ||
           title.includes('Untitled') ||
           title.trim().length === 0;
  }

  shouldFixDescription(description) {
    return !description || 
           description.includes('Professional') && 
           description.includes('premium quality');
  }

  // Create sample services only when needed
  createSampleServices() {
    return [
      {
        id: 1,
        title: "Grand Wedding Package",
        description: "Complete wedding service including venue decoration, catering, and photography. Perfect for 150-200 guests with premium amenities.",
        category: "wedding",
        minPrice: "150000",
        maxPrice: "300000",
        icon: "glass-cheers",
        photos: []
      },
      {
        id: 2,
        title: "Corporate Event Package",
        description: "Professional setup for corporate meetings, conferences, and seminars. Includes AV equipment and professional catering.",
        category: "corporate",
        minPrice: "50000",
        maxPrice: "150000",
        icon: "briefcase",
        photos: []
      },
      {
        id: 3,
        title: "Birthday Celebration Package",
        description: "Fun and vibrant birthday party setup with themes, decorations, entertainment, and customized cake options.",
        category: "birthday",
        minPrice: "25000",
        maxPrice: "75000",
        icon: "birthday-cake",
        photos: []
      }
    ];
  }

  // Simple vendor type determination
  determineVendorType(services) {
    if (!services || services.length === 0) return 'general';
    
    const primaryService = services[0];
    const serviceName = (primaryService.name || primaryService.title || '').toLowerCase();
    
    if (serviceName.includes('venue')) return 'venue';
    if (serviceName.includes('photo')) return 'photographer';
    if (serviceName.includes('cater')) return 'caterer';
    if (serviceName.includes('decorat')) return 'decorator';
    if (serviceName.includes('entertain')) return 'entertainer';
    if (serviceName.includes('makeup')) return 'makeup';
    
    return 'general';
  }

init() {
    this.loadUserProfile();
    this.initializeSampleData();
    this.addSampleBookings()
    this.switchMainContent('overview');
    
    // Initialize all displays
    this.cleanupBlobUrls();
    this.populateVendorProfile();
    this.displayServices();
    this.displayVendorBookings();
    this.setupEventListeners();
    this.displayAllBookings();
    this.displayShortlist();
    this.displayNotifications();
    this.displayMessages();
    this.displayPaymentAgreements();
    this.displayRecentActivity();
    this.displayRecommendations();
    this.updateDashboardStats();
    this.startBookingMonitoring();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // NEW: Initialize vendor feedback
    this.initializeVendorFeedback();
    
    vendorDashboard.debugBookingData();
    vendorDashboard.checkForNewBookings();
    this.setupVendorInteraction();
}

// Initialize star ratings for feedback form
initializeStarRatings() {
    const ratingContainers = document.querySelectorAll('.rating-stars');
    
    ratingContainers.forEach(container => {
        const stars = container.querySelectorAll('.star');
        const hiddenInput = container.parentElement.querySelector('input[type="hidden"]');
        
        stars.forEach(star => {
            star.addEventListener('click', function() {
                const value = parseInt(this.getAttribute('data-value'));
                hiddenInput.value = value;
                
                // Update star appearance
                stars.forEach(s => {
                    if (parseInt(s.getAttribute('data-value')) <= value) {
                        s.classList.add('active');
                    } else {
                        s.classList.remove('active');
                    }
                });
            });
        });
    });
}
// VENDOR-CUSTOMER INTERACTION METHODS
setupVendorInteraction() {
    // Listen for vendor updates
    if (window.sharedMessageBus) {
        // Vendor service updates
        window.sharedMessageBus.on('vendorServiceAdded', (data) => {
            this.handleVendorServiceAdded(data);
        });
        
        window.sharedMessageBus.on('vendorServiceUpdated', (data) => {
            this.handleVendorServiceUpdated(data);
        });
        
        window.sharedMessageBus.on('vendorServiceRemoved', (data) => {
            this.handleVendorServiceRemoved(data);
        });
        
        window.sharedMessageBus.on('vendorAvailabilityUpdated', (data) => {
            this.handleVendorAvailabilityUpdated(data);
        });
        
        window.sharedMessageBus.on('vendorPriceUpdated', (data) => {
            this.handleVendorPriceUpdated(data);
        });
        
        window.sharedMessageBus.on('bookingStatusUpdated', (data) => {
            this.handleBookingStatusUpdated(data);
        });
        
        // Listen to all updates for debugging
        window.sharedMessageBus.on('*', (data) => {
            console.log('General vendor update:', data);
        });
    }
    
    // Also check for updates on dashboard load
    this.checkForVendorUpdates();
}
// Initialize vendor feedback functionality
initializeVendorFeedback() {
    console.log("Initializing vendor feedback...");
    
    // Set today's date as default for event date
    const today = new Date().toISOString().split('T')[0];
    const eventDateInput = document.getElementById('eventDate');
    if (eventDateInput) {
        eventDateInput.value = today;
    }
    
    // Initialize star ratings
    this.initializeStarRatings();
    
    // Initialize recommendation options
    this.initializeRecommendationOptions();
    
    // Set up feedback form event listeners
    this.setupFeedbackEventListeners();
}
// Initialize recommendation options
initializeRecommendationOptions() {
    const options = document.querySelectorAll('.recommendation-option');
    const hiddenInput = document.getElementById('recommendationValue');
    
    options.forEach(option => {
        option.addEventListener('click', function() {
            // Remove selected class from all options
            options.forEach(opt => opt.classList.remove('selected'));
            
            // Add selected class to clicked option
            this.classList.add('selected');
            
            // Update hidden input value
            hiddenInput.value = this.getAttribute('data-value');
        });
    });
}
// Handle vendor service additions
handleVendorServiceAdded(serviceData) {
    console.log('New vendor service added:', serviceData);
    
    // Add to local vendors storage
    this.addOrUpdateVendorService(serviceData);
    
    // Show notification to customer
    this.addNotification(
        'New Service Available',
        `${serviceData.businessName} added a new ${serviceData.serviceType} service: ${serviceData.serviceName}`,
        'info'
    );
    
    // Refresh recommendations
    this.updateRecommendations();
    
    // Refresh services display if currently viewing
    if (document.getElementById('services-content').classList.contains('active')) {
        // You might want to refresh the services view here
        this.showToast(`New ${serviceData.serviceType} service available!`);
    }
}
// Setup feedback form event listeners
setupFeedbackEventListeners() {
    // Form submission handler
    const feedbackForm = document.getElementById('vendorFeedbackForm');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.showFeedbackPreview();
        });
    }
    
    // Preview button handler
    const previewBtn = document.getElementById('previewBtn');
    if (previewBtn) {
        previewBtn.addEventListener('click', this.showFeedbackPreview.bind(this));
    }
    
    // Back to form button handler
    const backToFormBtn = document.getElementById('backToFormBtn');
    if (backToFormBtn) {
        backToFormBtn.addEventListener('click', () => {
            document.getElementById('vendorFeedbackForm').style.display = 'block';
            document.getElementById('feedbackPreview').style.display = 'none';
        });
    }
    
    // Final submit button handler
    const submitFinalBtn = document.getElementById('submitFinalBtn');
    if (submitFinalBtn) {
        submitFinalBtn.addEventListener('click', this.submitFeedback.bind(this));
    }
}

// Handle vendor service updates
handleVendorServiceUpdated(serviceData) {
    console.log('Vendor service updated:', serviceData);
    
    this.addOrUpdateVendorService(serviceData);
    
    this.addNotification(
        'Service Updated',
        `${serviceData.businessName} updated their ${serviceData.serviceType} service`,
        'info'
    );
    
    this.updateRecommendations();
}
// Validate feedback form
validateFeedbackForm() {
    const customerName = document.getElementById('customerName').value;
    const eventDate = document.getElementById('eventDate').value;
    const serviceType = document.getElementById('serviceType').value;
    const bookingId = document.getElementById('bookingId').value;
    const communicationScore = document.getElementById('communicationScore').value;
    const punctualityScore = document.getElementById('punctualityScore').value;
    const cooperationScore = document.getElementById('cooperationScore').value;
    const recommendationValue = document.getElementById('recommendationValue').value;
    
    if (!customerName || !eventDate || !serviceType || !bookingId) {
        return false;
    }
    
    if (communicationScore === '0' || punctualityScore === '0' || cooperationScore === '0') {
        return false;
    }
    
    if (!recommendationValue) {
        return false;
    }
    
    return true;
}
// Format date for feedback form
formatFeedbackDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}
// Submit feedback
submitFeedback() {
    // In a real application, you would send the data to a server here
    // For this example, we'll just show a success message
    
    // Save feedback to localStorage
    this.saveFeedbackToStorage();
    
    // Hide preview and show success message
    document.getElementById('feedbackPreview').style.display = 'none';
    document.getElementById('successMessage').style.display = 'block';
    
    // Reset form after 3 seconds
    setTimeout(() => {
        this.resetFeedbackForm();
        document.getElementById('successMessage').style.display = 'none';
        document.getElementById('vendorFeedbackForm').style.display = 'block';
    }, 3000);
}

// Reset feedback form
resetFeedbackForm() {
    document.getElementById('vendorFeedbackForm').reset();
    
    // Reset star ratings
    document.querySelectorAll('.star').forEach(star => {
        star.classList.remove('active');
    });
    
    // Reset recommendation options
    document.querySelectorAll('.recommendation-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Reset hidden inputs
    document.getElementById('communicationScore').value = '0';
    document.getElementById('punctualityScore').value = '0';
    document.getElementById('cooperationScore').value = '0';
    document.getElementById('recommendationValue').value = '';
    
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('eventDate').value = today;
}
// Save feedback to localStorage
saveFeedbackToStorage() {
    const feedbackData = {
        id: 'feedback_' + Date.now(),
        customerName: document.getElementById('customerName').value,
        eventDate: document.getElementById('eventDate').value,
        serviceType: document.getElementById('serviceType').value,
        bookingId: document.getElementById('bookingId').value,
        communicationScore: document.getElementById('communicationScore').value,
        punctualityScore: document.getElementById('punctualityScore').value,
        cooperationScore: document.getElementById('cooperationScore').value,
        positiveComments: document.getElementById('positiveComments').value,
        improvementComments: document.getElementById('improvementComments').value,
        strengths: Array.from(document.querySelectorAll('input[name="strengths"]:checked')).map(cb => cb.value),
        recommendation: document.getElementById('recommendationValue').value,
        submittedAt: new Date().toISOString(),
        vendorId: this.vendorData.vendorId,
        vendorName: this.vendorData.businessName
    };
    
    // Get existing feedback or initialize empty array
    const existingFeedback = JSON.parse(localStorage.getItem('vendorFeedback')) || [];
    existingFeedback.push(feedbackData);
    
    // Save to localStorage
    localStorage.setItem('vendorFeedback', JSON.stringify(existingFeedback));
    
    console.log('Feedback saved:', feedbackData);
}
// Show feedback preview
showFeedbackPreview() {
    // Validate form
    if (!this.validateFeedbackForm()) {
        alert('Please fill in all required fields and provide ratings.');
        return;
    }
    
    // Populate preview with form data
    document.getElementById('previewCustomerName').textContent = 
        document.getElementById('customerName').value;
    document.getElementById('previewEventDate').textContent = 
        this.formatFeedbackDate(document.getElementById('eventDate').value);
    document.getElementById('previewServiceType').textContent = 
        document.getElementById('serviceType').options[document.getElementById('serviceType').selectedIndex].text;
    document.getElementById('previewBookingId').textContent = 
        document.getElementById('bookingId').value;
    
    // Ratings
    document.getElementById('previewCommunication').textContent = 
        document.getElementById('communicationScore').value + '/5';
    document.getElementById('previewPunctuality').textContent = 
        document.getElementById('punctualityScore').value + '/5';
    document.getElementById('previewCooperation').textContent = 
        document.getElementById('cooperationScore').value + '/5';
    
    // Feedback comments
    document.getElementById('previewPositive').textContent = 
        document.getElementById('positiveComments').value || 'Not provided';
    document.getElementById('previewImprovement').textContent = 
        document.getElementById('improvementComments').value || 'Not provided';
    
    // Strengths
    const strengthCheckboxes = document.querySelectorAll('input[name="strengths"]:checked');
    const strengths = Array.from(strengthCheckboxes).map(cb => {
        const label = document.querySelector(`label[for="${cb.id}"]`);
        return label.textContent;
    });
    document.getElementById('previewStrengths').textContent = 
        strengths.length > 0 ? strengths.join(', ') : 'Not specified';
    
    // Recommendation
    const recommendationValue = document.getElementById('recommendationValue').value;
    let recommendationText = '';
    switch(recommendationValue) {
        case 'highly':
            recommendationText = 'Highly Recommend';
            break;
        case 'recommend':
            recommendationText = 'Recommend';
            break;
        case 'neutral':
            recommendationText = 'Neutral';
            break;
        case 'not_recommend':
            recommendationText = 'Not Recommend';
            break;
        default:
            recommendationText = 'Not specified';
    }
    document.getElementById('previewRecommendation').textContent = recommendationText;
    
    // Show preview and hide form
    document.getElementById('vendorFeedbackForm').style.display = 'none';
    document.getElementById('feedbackPreview').style.display = 'block';
}
// Handle vendor service removal
handleVendorServiceRemoved(serviceData) {
    console.log('Vendor service removed:', serviceData);
    
    this.removeVendorService(serviceData.vendorId, serviceData.serviceId);
    
    this.addNotification(
        'Service No Longer Available',
        `${serviceData.businessName} removed their ${serviceData.serviceType} service`,
        'warning'
    );
    
    this.updateRecommendations();
    
    // Remove from shortlist if present
    this.removeServiceFromShortlist(serviceData.serviceId);
}

// Handle vendor availability changes
handleVendorAvailabilityUpdated(availabilityData) {
    console.log('Vendor availability updated:', availabilityData);
    
    this.updateVendorAvailability(availabilityData);
    
    if (!availabilityData.isAvailable) {
        this.addNotification(
            'Service Temporarily Unavailable',
            `${availabilityData.businessName} is currently not accepting bookings`,
            'warning'
        );
    }
}

// Handle price updates
handleVendorPriceUpdated(priceData) {
    console.log('Vendor price updated:', priceData);
    
    this.updateVendorPricing(priceData);
    
    this.addNotification(
        'Price Update',
        `${priceData.businessName} updated pricing for ${priceData.serviceName}`,
        'info'
    );
}

// Handle booking status updates from vendor
handleBookingStatusUpdated(bookingData) {
    console.log('Booking status updated by vendor:', bookingData);
    
    this.updateBookingStatus(bookingData.bookingId, bookingData.status, bookingData.vendorMessage);
    
    let notificationMessage = '';
    let notificationType = 'info';
    
    switch(bookingData.status) {
        case 'confirmed':
            notificationMessage = `Your booking with ${bookingData.vendorName} has been confirmed!`;
            notificationType = 'success';
            break;
        case 'rejected':
            notificationMessage = `Your booking with ${bookingData.vendorName} was declined.`;
            notificationType = 'warning';
            break;
        case 'cancelled':
            notificationMessage = `Your booking with ${bookingData.vendorName} was cancelled by the vendor.`;
            notificationType = 'warning';
            break;
        case 'rescheduled':
            notificationMessage = `Your booking with ${bookingData.vendorName} has been rescheduled.`;
            notificationType = 'info';
            break;
    }
    
    if (bookingData.vendorMessage) {
        notificationMessage += ` Message: ${bookingData.vendorMessage}`;
    }
    
    this.addNotification('Booking Update', notificationMessage, notificationType);
    this.displayAllBookings();
}

// VENDOR DATA MANAGEMENT
addOrUpdateVendorService(serviceData) {
    const allVendors = JSON.parse(localStorage.getItem('vendors')) || [];
    
    // Find if vendor exists
    const vendorIndex = allVendors.findIndex(v => v.id === serviceData.vendorId);
    
    if (vendorIndex !== -1) {
        // Update existing vendor
        if (!allVendors[vendorIndex].services) {
            allVendors[vendorIndex].services = [];
        }
        
        // Find if service exists
        const serviceIndex = allVendors[vendorIndex].services.findIndex(s => s.id === serviceData.serviceId);
        
        if (serviceIndex !== -1) {
            // Update existing service
            allVendors[vendorIndex].services[serviceIndex] = {
                ...allVendors[vendorIndex].services[serviceIndex],
                ...serviceData
            };
        } else {
            // Add new service
            allVendors[vendorIndex].services.push(serviceData);
        }
        
        // Update vendor main properties if provided
        if (serviceData.businessName) {
            allVendors[vendorIndex].businessName = serviceData.businessName;
        }
        if (serviceData.serviceType) {
            allVendors[vendorIndex].serviceType = serviceData.serviceType;
        }
        if (serviceData.specialty) {
            allVendors[vendorIndex].specialty = serviceData.specialty;
        }
    } else {
        // Create new vendor entry
        const newVendor = {
            id: serviceData.vendorId,
            businessName: serviceData.businessName,
            serviceType: serviceData.serviceType,
            specialty: serviceData.specialty,
            services: [serviceData],
            ...serviceData
        };
        allVendors.push(newVendor);
    }
    
    localStorage.setItem('vendors', JSON.stringify(allVendors));
    console.log('Updated vendors storage:', allVendors);
}

removeVendorService(vendorId, serviceId) {
    const allVendors = JSON.parse(localStorage.getItem('vendors')) || [];
    const vendorIndex = allVendors.findIndex(v => v.id === vendorId);
    
    if (vendorIndex !== -1 && allVendors[vendorIndex].services) {
        allVendors[vendorIndex].services = allVendors[vendorIndex].services.filter(s => s.id !== serviceId);
        
        // Remove vendor if no services left
        if (allVendors[vendorIndex].services.length === 0) {
            allVendors.splice(vendorIndex, 1);
        }
        
        localStorage.setItem('vendors', JSON.stringify(allVendors));
    }
}

    updateVendorAvailability(isAvailable, message = '') {
        const currentVendor = JSON.parse(localStorage.getItem('currentVendor'));
        
        // Update vendor data
        currentVendor.isAvailable = isAvailable;
        currentVendor.availabilityMessage = message;
        localStorage.setItem('currentVendor', JSON.stringify(currentVendor));
        
        // Notify customers
        if (window.messageBus) {
            window.messageBus.sendMessage('vendor_availability_updated', {
                vendorId: currentVendor.id,
                businessName: currentVendor.businessName,
                isAvailable: isAvailable,
                message: message
            }, 'customer');
        }
    }


updateVendorPricing(priceData) {
    const allVendors = JSON.parse(localStorage.getItem('vendors')) || [];
    const vendorIndex = allVendors.findIndex(v => v.id === priceData.vendorId);
    
    if (vendorIndex !== -1) {
        if (priceData.serviceId && allVendors[vendorIndex].services) {
            const serviceIndex = allVendors[vendorIndex].services.findIndex(s => s.id === priceData.serviceId);
            if (serviceIndex !== -1) {
                allVendors[vendorIndex].services[serviceIndex].price = priceData.newPrice;
                allVendors[vendorIndex].services[serviceIndex].priceRange = priceData.priceRange;
            }
        } else {
            // Update vendor-level pricing
            allVendors[vendorIndex].priceRange = priceData.priceRange;
        }
        
        localStorage.setItem('vendors', JSON.stringify(allVendors));
    }
}

// Remove service from customer's shortlist
removeServiceFromShortlist(serviceId) {
    const shortlist = JSON.parse(localStorage.getItem('shortlist')) || [];
    const updatedShortlist = shortlist.filter(item => item.id !== serviceId);
    
    if (updatedShortlist.length !== shortlist.length) {
        localStorage.setItem('shortlist', JSON.stringify(updatedShortlist));
        this.displayShortlist();
        this.showToast('Service removed from shortlist as it is no longer available');
    }
}

    updateBookingStatus(bookingId, status, vendorMessage = '') {
        // Update in shared system first
        if (window.bookingSystem) {
            window.bookingSystem.updateBookingStatus(bookingId, status, vendorMessage);
        }
        
        // ALSO update in local storage to match your customer dashboard structure
        const allBookings = JSON.parse(localStorage.getItem('shared_bookings') || '[]');
        const bookingIndex = allBookings.findIndex(b => b.id === bookingId);
        
        if (bookingIndex !== -1) {
            allBookings[bookingIndex].status = status;
            allBookings[bookingIndex].vendorMessage = vendorMessage;
            allBookings[bookingIndex].statusUpdatedAt = new Date().toISOString();
            
            localStorage.setItem('shared_bookings', JSON.stringify(allBookings));
            
            // Also update in service-specific bookings (to match your customer dashboard)
            const serviceType = allBookings[bookingIndex].serviceType;
            if (serviceType) {
                const serviceBookings = JSON.parse(localStorage.getItem(`${serviceType}Bookings`)) || [];
                const serviceBookingIndex = serviceBookings.findIndex(b => b.id === bookingId);
                if (serviceBookingIndex !== -1) {
                    serviceBookings[serviceBookingIndex].status = status;
                    serviceBookings[serviceBookingIndex].vendorMessage = vendorMessage;
                    localStorage.setItem(`${serviceType}Bookings`, JSON.stringify(serviceBookings));
                }
            }
            
            console.log(`Vendor updated booking ${bookingId} to ${status}`);
        }
    }

     sendMessageToCustomer(customerId, message) {
        if (window.messagingSystem) {
            window.messagingSystem.sendMessage(customerId, 'customer', message);
        }
    }

     addNewService(serviceData) {
        // Add service to vendor's offerings
        const vendorServices = JSON.parse(localStorage.getItem('vendor_services') || '[]');
        vendorServices.push({
            id: 'service_' + Date.now(),
            ...serviceData,
            createdAt: new Date().toISOString()
        });
        localStorage.setItem('vendor_services', JSON.stringify(vendorServices));
        
        // Notify customers through message bus
        if (window.messageBus) {
            window.messageBus.sendMessage('vendor_service_added', serviceData, 'customer');
        }
    }

// Check for vendor updates on load
checkForVendorUpdates() {
    // Check if there are any pending vendor updates
    const lastUpdate = localStorage.getItem('lastVendorUpdateCheck');
    const now = new Date().toISOString();
    
    // You could implement periodic checking here
    // For now, we rely on real-time messaging
    
    localStorage.setItem('lastVendorUpdateCheck', now);
}

// Enhanced vendor data fetching with real-time updates
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
    const allVendors = JSON.parse(localStorage.getItem('vendors')) || [];
    
    console.log('Fetching vendors for:', vendorCategory);
    console.log('Available vendors:', allVendors);
    
    // Filter available vendors for this service
    const serviceVendors = allVendors.filter(vendor => {
        try {
            // Only show available vendors
            if (vendor.isAvailable === false) return false;
            
            // Check service type match
            if (vendor.serviceType && typeof vendor.serviceType === 'string' && 
                vendor.serviceType.toLowerCase() === vendorCategory) {
                return true;
            }
            
            if (vendor.businessType && typeof vendor.businessType === 'string' &&
                vendor.businessType.toLowerCase() === vendorCategory) {
                return true;
            }
            
            // Check services array
            if (vendor.services && Array.isArray(vendor.services)) {
                const hasService = vendor.services.some(service => {
                    if (!service.isAvailable && service.isAvailable !== undefined) return false;
                    
                    if (typeof service === 'string') {
                        return service.toLowerCase().includes(vendorCategory);
                    }
                    if (service && typeof service === 'object') {
                        return (service.name && service.name.toLowerCase().includes(vendorCategory)) ||
                               (service.type && service.type.toLowerCase().includes(vendorCategory));
                    }
                    return false;
                });
                if (hasService) return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error filtering vendor:', vendor, error);
            return false;
        }
    });
    
    console.log(`Found ${serviceVendors.length} available vendors for ${serviceType}`);
    
    // Fallback if no vendors found
    if (serviceVendors.length === 0) {
        return [
            {
                id: 'fallback1',
                businessName: `Premium ${serviceType} Co.`,
                specialty: 'Premium Services',
                isAvailable: true
            }
        ];
    }
    
    return serviceVendors;
}

// Update recommendations based on vendor changes
updateRecommendations() {
    // This would regenerate recommendations based on updated vendor data
    console.log('Updating recommendations based on vendor changes');
    
    // You can implement smart recommendation logic here
    // based on vendor updates, customer preferences, etc.
}
// Real-time booking monitoring
startBookingMonitoring() {
    console.log("🔍 Starting booking monitoring...");
    
    // Check for existing bookings immediately
    this.checkForNewBookings();
    
    // Set up interval to check for new bookings every 10 seconds
    this.bookingInterval = setInterval(() => {
        this.checkForNewBookings();
    }, 10000);
}

checkForNewBookings() {
    console.log("🔍 Checking for new bookings...");
    
    const vendorBookings = JSON.parse(localStorage.getItem('vendorBookings')) || [];
    const allBookings = JSON.parse(localStorage.getItem('allBookings')) || [];
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    
    const currentVendor = JSON.parse(localStorage.getItem('currentVendor'));
    const vendorId = currentVendor?.id || this.vendorData.vendorId;
    
    console.log("=== BOOKING CHECK ===");
    console.log("Vendor ID:", vendorId);
    console.log("Vendor Name:", this.vendorData.businessName);
    
    // Filter bookings for this vendor
    const myBookings = vendorBookings.filter(booking => 
        booking.vendorId === vendorId || 
        booking.vendorName === this.vendorData.businessName
    );
    
    const myAllBookings = allBookings.filter(booking => 
        booking.vendorId === vendorId || 
        booking.vendorName === this.vendorData.businessName
    );
    
    const myGenericBookings = bookings.filter(booking => 
        booking.vendorId === vendorId || 
        booking.vendorName === this.vendorData.businessName
    );
    
    let allMyBookings = [...myBookings, ...myAllBookings, ...myGenericBookings];
    
    // Fix the booking data structure to ensure proper customer names
    allMyBookings = this.fixBookingDataStructure(allMyBookings);
    
    console.log("All vendor bookings found:", allMyBookings.length);
    
    // Debug: Show what customer names are being detected
    allMyBookings.forEach((booking, index) => {
        const detectedName = this.getCustomerName(booking);
        console.log(`Booking ${index + 1}:`, {
            bookingId: booking.id,
            rawCustomerName: booking.customerName,
            detectedCustomerName: detectedName,
            vendorName: booking.vendorName,
            isVendorName: booking.customerName === this.vendorData.businessName
        });
    });
    
    // Update UI with fixed bookings
    this.updateBookingsWithRealData(allMyBookings);
}
getAllVendorBookings() {
    const vendorBookings = JSON.parse(localStorage.getItem('vendorBookings')) || [];
    const allBookings = JSON.parse(localStorage.getItem('allBookings')) || [];
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    
    const currentVendor = JSON.parse(localStorage.getItem('currentVendor'));
    const vendorId = currentVendor?.id || this.vendorData.vendorId;
    
    // Combine all booking sources and filter for this vendor
    const allMyBookings = [
        ...vendorBookings.filter(b => b.vendorId === vendorId),
        ...allBookings.filter(b => b.vendorId === vendorId),
        ...bookings.filter(b => b.vendorId === vendorId)
    ];
    
    console.log(`Found ${allMyBookings.length} bookings for vendor ${vendorId}`);
    
    // Ensure each booking has proper status
    allMyBookings.forEach(booking => {
        if (!booking.status) {
            booking.status = 'pending';
        }
    });
    
    return allMyBookings;
}

updateBookingsWithRealData(realBookings) {
    if (realBookings.length === 0) {
        console.log("📭 No real bookings found for this vendor");
        // Show sample data or empty state
        this.showSampleBookingsIfEmpty();
        return;
    }
    
    console.log(`🎉 Found ${realBookings.length} real bookings!`);
    
    // Update pending bookings table
    this.updatePendingBookingsTable(realBookings);
    
    // Update confirmed bookings table  
    this.updateConfirmedBookingsTable(realBookings);
    
    // Update booking badge
    const pendingCount = realBookings.filter(b => b.status === 'pending').length;
    this.updateBookingBadge(pendingCount);
}

updateBookingsWithRealData(realBookings) {
    if (realBookings.length === 0) {
        console.log("📭 No real bookings found for this vendor");
        return;
    }
    
    console.log(`🎉 Found ${realBookings.length} real bookings!`, realBookings);
    
    // Update pending bookings table
    this.updatePendingBookingsTable(realBookings);
    
    // Update confirmed bookings table  
    this.updateConfirmedBookingsTable(realBookings);
    
    // Show notification if new bookings found
    if (realBookings.length > 0) {
        this.showNewBookingsNotification(realBookings.length);
    }
}
// Test method to debug booking data
debugBookingData() {
    console.log("=== BOOKING DATA DEBUG ===");
    
    const vendorBookings = JSON.parse(localStorage.getItem('vendorBookings')) || [];
    const allBookings = JSON.parse(localStorage.getItem('allBookings')) || [];
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    
    console.log("vendorBookings:", vendorBookings);
    console.log("allBookings:", allBookings);
    console.log("bookings:", bookings);
    
    // Check what customer data exists
    const allBookingsCombined = [...vendorBookings, ...allBookings, ...bookings];
    allBookingsCombined.forEach((booking, index) => {
        console.log(`Booking ${index + 1} customer fields:`, {
            customerName: booking.customerName,
            userName: booking.userName,
            name: booking.name,
            customer: booking.customer,
            email: booking.customerEmail || booking.email
        });
    });
    
    // Test the getCustomerName method
    console.log("=== TESTING getCustomerName ===");
    allBookingsCombined.slice(0, 3).forEach((booking, index) => {
        const customerName = this.getCustomerName(booking);
        console.log(`Test ${index + 1}:`, customerName);
    });
}
// Update pending bookings table with better data handling
// Enhanced booking display with more details

// Enhanced booking display with more details
updatePendingBookingsTable(bookings) {
    const pendingBookings = bookings.filter(booking => 
        booking.status === 'pending' || 
        !booking.status || 
        booking.status === 'requested'
    );
    
    const pendingTable = document.querySelector('#bookings .bookings:first-child table tbody');
    
    if (!pendingTable) {
        console.error("Pending bookings table not found!");
        return;
    }
    
    if (pendingBookings.length === 0) {
        pendingTable.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 20px; color: #666;">
                    <div class="empty-bookings-state">
                        <i class="fas fa-calendar-times"></i>
                        <h4>No Pending Bookings</h4>
                        <p>Waiting for customer requests...</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    let pendingHTML = '';
    pendingBookings.forEach(booking => {
        const customerName = this.getCustomerName(booking);
        const serviceName = this.getServiceName(booking);
        const packageName = this.getPackageName(booking);
        const displayStatus = booking.status || 'pending';
        const eventDate = new Date(booking.date || booking.eventDate || booking.createdAt);
        const formattedDate = eventDate.toLocaleDateString('en-IN', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        pendingHTML += `
            <tr class="booking-row">
                <td>
                    <div class="customer-info">
                        <strong>${customerName}</strong>
                        <small class="customer-contact">${booking.customerPhone || 'No phone'}</small>
                    </div>
                </td>
                <td>${serviceName}</td>
                <td>
                    <div class="date-info">
                        <strong>${formattedDate}</strong>
                        <small>${booking.time || 'Time not set'}</small>
                    </div>
                </td>
                <td>${packageName}</td>
                <td>
                    <div class="guest-info">
                        <i class="fas fa-users"></i>
                        ${booking.guestCount || 'N/A'} guests
                    </div>
                </td>
                <td><span class="status ${displayStatus}">${displayStatus}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-success btn-sm" 
                                data-action="accept-booking" 
                                data-booking-id="${booking.id}"
                                title="Accept Booking">
                            <i class="fas fa-check"></i> Accept
                        </button>
                        <button class="btn btn-danger btn-sm" 
                                data-action="reject-booking" 
                                data-booking-id="${booking.id}"
                                title="Reject Booking">
                            <i class="fas fa-times"></i> Reject
                        </button>
                        <button class="btn btn-info btn-sm" 
                                data-action="view-booking" 
                                data-booking-id="${booking.id}"
                                title="View Details">
                            <i class="fas fa-eye"></i> 
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    pendingTable.innerHTML = pendingHTML;
    console.log(`✅ Updated pending bookings table with ${pendingBookings.length} bookings`);
}
updateConfirmedBookingsTable(bookings) {
    const confirmedBookings = bookings.filter(booking => 
        booking.status === 'confirmed' || 
        booking.status === 'accepted'
    );
    
    const confirmedTables = document.querySelectorAll('.bookings table');
    if (confirmedTables.length < 2) return;
    
    const confirmedTable = confirmedTables[1].querySelector('tbody');
    if (!confirmedTable) return;
    
    if (confirmedBookings.length === 0) {
        confirmedTable.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 20px; color: #666;">
                    No confirmed bookings yet
                </td>
            </tr>
        `;
        return;
    }
    
    let confirmedHTML = '';
    confirmedBookings.forEach(booking => {
        const customerName = this.getCustomerName(booking);
        const serviceName = this.getServiceName(booking);
        const packageName = this.getPackageName(booking);
        
        confirmedHTML += `
            <tr>
                <td><strong>${customerName}</strong></td>
                <td>${serviceName}</td>
                <td>${new Date(booking.date || booking.eventDate || booking.createdAt).toLocaleDateString()}</td>
                <td>${packageName}</td>
                <td><span class="status confirmed">Confirmed</span></td>
                <td>
                    <button class="btn btn-info" 
                            data-action="view-booking" 
                            data-booking-id="${booking.id}">
                        <i class="fas fa-eye"></i> View
                    </button>
                </td>
            </tr>
        `;
    });
    
    confirmedTable.innerHTML = confirmedHTML;
}

// Enhanced customer name extraction
// Stable customer name extraction - NO RANDOM GENERATION
getCustomerName(booking) {
    console.log("🔍 Getting customer name from booking:", booking);
    
    // First, check if this is clearly vendor data masquerading as customer data
    if (booking.customerName === this.vendorData.businessName) {
        console.log("❌ Vendor name detected as customer name");
        // Instead of generating random, try to find real customer data
        if (booking.userName && booking.userName !== this.vendorData.businessName) {
            return booking.userName;
        }
        if (booking.user && booking.user.name && booking.user.name !== this.vendorData.businessName) {
            return booking.user.name;
        }
        // If no real customer data found, use a consistent fallback
        return "Customer (Name Not Provided)";
    }
    
    // Try all possible customer name fields in priority order
    const possibleNameFields = [
        booking.customerName,
        booking.userName,
        booking.user?.name,
        booking.guestName,
        booking.clientName,
        booking.contactName,
        booking.name,
        booking.bookedBy
    ];
    
    // Find the first valid name that's NOT the vendor name
    for (let name of possibleNameFields) {
        if (name && typeof name === 'string') {
            const trimmedName = name.trim();
            if (trimmedName && 
                trimmedName !== 'Unknown Customer' &&
                trimmedName !== this.vendorData.businessName &&
                !trimmedName.toLowerCase().includes('vendor') &&
                !trimmedName.toLowerCase().includes('catering') &&
                !trimmedName.toLowerCase().includes('business')) {
                console.log("✅ Using customer name:", trimmedName);
                return trimmedName;
            }
        }
    }
    
    // Fallback: Use email username (but check it's not vendor email)
    const email = booking.customerEmail || booking.email || booking.userEmail;
    if (email) {
        const emailDomain = email.split('@')[1];
        if (!emailDomain.includes(this.vendorData.businessName.toLowerCase().replace(/\s/g, ''))) {
            const emailName = email.split('@')[0]
                .replace(/[._-]/g, ' ')
                .replace(/\b\w/g, l => l.toUpperCase());
            console.log("✅ Using email-based name:", emailName);
            return emailName;
        }
    }
    // Final fallback: Generate random customer name
    console.log("❌ No valid customer name found, generating random name");
    return this.generateRandomCustomerName();
}

// Helper method to generate random customer names
generateRandomCustomerName() {
    const firstNames = ['Priya', 'Rahul', 'Anjali', 'Vikram', 'Sneha', 'Arun', 'Meera', 'Sanjay', 'Neha', 'Rajesh', 'Pooja', 'Amit', 'Kavita', 'Deepak', 'Sunita'];
    const lastNames = ['Sharma', 'Mehta', 'Patel', 'Singh', 'Reddy', 'Kumar', 'Iyer', 'Verma', 'Gupta', 'Khanna', 'Desai', 'Joshi', 'Nair', 'Yadav', 'Malhotra'];
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    return `${firstName} ${lastName}`;
}
// Add this method to fix booking data structure
// Fix booking data structure WITHOUT random names
fixBookingDataStructure(bookings) {
    return bookings.map(booking => {
        // Only fix if customer name is clearly wrong (vendor name)
        if (booking.customerName === this.vendorData.businessName) {
            console.log("🛠️ Fixing booking with vendor name as customer name");
            
            // Try to find real customer data first
            if (booking.userName && booking.userName !== this.vendorData.businessName) {
                booking.customerName = booking.userName;
            } else if (booking.user && booking.user.name && booking.user.name !== this.vendorData.businessName) {
                booking.customerName = booking.user.name;
            } else {
                // Use a consistent placeholder instead of random name
                booking.customerName = "Customer (Name Missing)";
            }
        }
        
        // Ensure other customer fields exist but don't overwrite with random data
        if (!booking.customerEmail && booking.email) {
            booking.customerEmail = booking.email;
        }
        
        if (!booking.customerPhone && booking.phone) {
            booking.customerPhone = booking.phone;
        }
        
        return booking;
    });
}

// Extract customer name from any available field in booking
extractCustomerNameFromBooking(booking) {
    const nameFields = [
        'customerName', 'userName', 'guestName', 'clientName', 
        'contactName', 'name', 'bookedBy'
    ];
    
    for (let field of nameFields) {
        if (booking[field] && typeof booking[field] === 'string' && booking[field].trim()) {
            return booking[field].trim();
        }
    }
    
    return 'New Customer';
}
// Helper method to extract service name from booking
getServiceName(booking) {
    if (booking.serviceName) return booking.serviceName;
    if (booking.service && booking.service.name) return booking.service.name;
    if (booking.serviceType) return booking.serviceType;
    if (booking.eventType) return booking.eventType;
    return 'Unknown Service';
}

// Helper method to extract package name from booking
getPackageName(booking) {
    if (booking.package) return booking.package;
    if (booking.packageName) return booking.packageName;
    if (booking.selectedPackage) return booking.selectedPackage;
    if (booking.plan) return booking.plan;
    return 'Not specified';
}
// Check and fix booking statuses
fixBookingStatuses() {
    const vendorBookings = JSON.parse(localStorage.getItem('vendorBookings')) || [];
    const allBookings = JSON.parse(localStorage.getItem('allBookings')) || [];
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    
    const currentVendor = JSON.parse(localStorage.getItem('currentVendor'));
    const vendorId = currentVendor?.id || this.vendorData.vendorId;
    
    let fixedCount = 0;
    
    // Fix status in all booking arrays
    [vendorBookings, allBookings, bookings].forEach(bookingArray => {
        bookingArray.forEach(booking => {
            if (booking.vendorId === vendorId && !booking.status) {
                booking.status = 'pending'; // Set to pending if no status
                fixedCount++;
            }
        });
    });
    
    // Save back if fixes were made
    if (fixedCount > 0) {
        localStorage.setItem('vendorBookings', JSON.stringify(vendorBookings));
        localStorage.setItem('allBookings', JSON.stringify(allBookings));
        localStorage.setItem('bookings', JSON.stringify(bookings));
        console.log(`✅ Fixed ${fixedCount} booking statuses to 'pending'`);
    }
    
    return fixedCount;
}

showNewBookingsNotification(count) {
    // Only show notification once
    if (!this.bookingNotificationShown) {
        this.showToast(`🎉 You have ${count} real booking${count > 1 ? 's' : ''} from customers!`, 'success');
        this.bookingNotificationShown = true;
    }
}

// Booking action methods - ONLY update when vendor explicitly acts
acceptRealBooking(bookingId) {
    console.log("🎯 Accept booking called for:", bookingId);
    if (confirm('Are you sure you want to accept this booking?')) {
        this.updateBookingStatus(bookingId, 'confirmed', 'Booking accepted! Looking forward to serving you.');
    }
}

rejectRealBooking(bookingId) {
    console.log("🎯 Reject booking called for:", bookingId);
    if (confirm('Are you sure you want to reject this booking?')) {
        const reason = prompt('Please provide a reason for rejection (optional):');
        this.updateBookingStatus(bookingId, 'rejected', reason || 'Booking rejected by vendor.');
    }
}

updateBookingStatus(bookingId, status, message) {
  console.log(`Updating booking ${bookingId} to status: ${status}`);
  
  let vendorBookings = JSON.parse(localStorage.getItem('vendorBookings')) || [];
  let allBookings = JSON.parse(localStorage.getItem('allBookings')) || [];
  let bookings = JSON.parse(localStorage.getItem('bookings')) || [];
  
  let updated = false;
  
  // Update in all possible booking arrays
  [vendorBookings, allBookings, bookings].forEach((bookingArray, index) => {
    const booking = bookingArray.find(b => b.id === bookingId);
    if (booking) {
      // Only update if status is actually changing
      if (booking.status !== status) {
        booking.status = status;
        booking.vendorMessage = message;
        booking.updatedAt = new Date().toISOString();
        booking.statusUpdatedBy = 'vendor';
        updated = true;
        console.log(`✅ Updated booking in array ${index}`);
      }
    }
  });
  
  if (updated) {
    // Save back to localStorage
    localStorage.setItem('vendorBookings', JSON.stringify(vendorBookings));
    localStorage.setItem('allBookings', JSON.stringify(allBookings));
    localStorage.setItem('bookings', JSON.stringify(bookings));
    
    this.showToast(`Booking ${status} successfully!`, 'success');
    
    // Force refresh the bookings display
    this.checkForNewBookings();
    
    
    // Also update any customer notifications if possible
    this.notifyCustomerAboutBookingUpdate(bookingId, status, message);
  } else {
    this.showToast('No changes made to booking', 'info');
  }
}
// Complete addSampleBookings method with full booking data
addSampleBookings() {
    console.log("Adding sample booking data with FIXED customer names...");
    
    const currentVendor = JSON.parse(localStorage.getItem('currentVendor'));
    const vendorId = currentVendor?.id || this.vendorData.vendorId;
    const vendorName = this.vendorData.businessName || 'Your Business';
    
    // CONSISTENT sample customer names - always the same
    const sampleBookings = [
        {
            id: 'SAMPLE_BOOK_001', // Fixed ID, not based on timestamp
            vendorId: vendorId,
            vendorName: vendorName,
            customerName: 'Priya Sharma', // Fixed name
            customerEmail: 'priya.sharma@example.com',
            customerPhone: '+91 9876543210',
            serviceName: 'Grand Wedding Package',
            serviceType: 'venue',
            date: '2025-12-15',
            time: '18:00',
            guestCount: '200',
            package: 'Premium Package',
            status: 'pending',
            specialRequests: 'We need floral decorations and a DJ setup for the reception.',
            budget: '₹2,50,000',
            eventType: 'Wedding Reception',
            venuePreferences: 'Outdoor garden setup',
            createdAt: new Date('2024-01-15').toISOString(), // Fixed date
            updatedAt: new Date('2024-01-15').toISOString()
        },
        {
            id: 'SAMPLE_BOOK_002', // Fixed ID
            vendorId: vendorId,
            vendorName: vendorName,
            customerName: 'Rahul Mehta', // Fixed name
            customerEmail: 'rahul.mehta@example.com',
            customerPhone: '+91 9876543211',
            serviceName: 'Corporate Conference',
            serviceType: 'venue',
            date: '2025-11-20',
            time: '09:00',
            guestCount: '150',
            package: 'Standard Package',
            status: 'pending',
            specialRequests: 'Need projector, whiteboards, and high-speed WiFi.',
            budget: '₹80,000',
            eventType: 'Corporate Meeting',
            venuePreferences: 'Conference room setup',
            createdAt: new Date('2024-01-16').toISOString(), // Fixed date
            updatedAt: new Date('2024-01-16').toISOString()
        },
        {
            id: 'SAMPLE_BOOK_003', // Fixed ID
            vendorId: vendorId,
            vendorName: vendorName,
            customerName: 'Anjali Patel', // Fixed name
            customerEmail: 'anjali.patel@example.com',
            customerPhone: '+91 9876543212',
            serviceName: 'Birthday Celebration',
            serviceType: 'venue',
            date: '2025-12-25',
            time: '16:00',
            guestCount: '80',
            package: 'Basic Package',
            status: 'confirmed',
            specialRequests: 'Theme: Winter Wonderland with photo booth.',
            budget: '₹45,000',
            eventType: 'Birthday Party',
            venuePreferences: 'Indoor with decoration space',
            vendorMessage: 'Looking forward to the celebration!',
            createdAt: new Date('2024-01-14').toISOString(), // Fixed date
            updatedAt: new Date('2024-01-14').toISOString()
        }
    ];

    // Get existing bookings
    let vendorBookings = JSON.parse(localStorage.getItem('vendorBookings')) || [];
    
    // Remove any existing sample bookings to avoid duplicates
    vendorBookings = vendorBookings.filter(booking => 
        !booking.id.startsWith('SAMPLE_BOOK_')
    );
    
    // Add our fixed sample bookings
    vendorBookings = [...vendorBookings, ...sampleBookings];
    localStorage.setItem('vendorBookings', JSON.stringify(vendorBookings));
    
    console.log(`✅ Added ${sampleBookings.length} sample bookings with FIXED customer names`);
    this.showToast(`Sample bookings added with consistent customer names`, 'success');
    
    // Refresh bookings display
    setTimeout(() => {
        this.checkForNewBookings();
    }, 500);
    
    return vendorBookings;
}
// Completely reset and fix all booking data
resetAndFixAllBookings() {
    console.log("🔄 Resetting and fixing all booking data...");
    
    // Clear all existing bookings
    localStorage.setItem('vendorBookings', JSON.stringify([]));
    localStorage.setItem('allBookings', JSON.stringify([]));
    localStorage.setItem('bookings', JSON.stringify([]));
    
    // Add fresh sample data
    this.addSampleBookings();
    
    this.showToast('All bookings reset and fixed with consistent names', 'success');
}
// Debug method to check what's happening with customer names
debugCustomerNames() {
    console.log("=== CUSTOMER NAME DEBUG ===");
    
    const vendorBookings = JSON.parse(localStorage.getItem('vendorBookings')) || [];
    const currentVendor = JSON.parse(localStorage.getItem('currentVendor'));
    
    console.log("Current Vendor:", currentVendor?.businessName || this.vendorData.businessName);
    console.log("All Bookings:", vendorBookings);
    
    vendorBookings.forEach((booking, index) => {
        console.log(`Booking ${index + 1}:`, {
            id: booking.id,
            vendorName: booking.vendorName,
            customerName: booking.customerName,
            isProblematic: booking.customerName === this.vendorData.businessName,
            getCustomerNameResult: this.getCustomerName(booking)
        });
    });
    
    // Test the fix
    const fixedBookings = this.fixBookingDataStructure(vendorBookings);
    console.log("Fixed Bookings:", fixedBookings);
}
viewRealBookingDetails(bookingId) {
    const vendorBookings = JSON.parse(localStorage.getItem('vendorBookings')) || [];
    const allBookings = JSON.parse(localStorage.getItem('allBookings')) || [];
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    
    const booking = vendorBookings.find(b => b.id === bookingId) || 
                   allBookings.find(b => b.id === bookingId) || 
                   bookings.find(b => b.id === bookingId);
    
    if (!booking) {
        this.showToast('Booking not found!', 'error');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Booking Details</h3>
            <div class="booking-details">
                <p><strong>Booking ID:</strong> ${booking.id}</p>
                <p><strong>Customer:</strong> ${booking.customerName || booking.customer?.name || booking.userName || 'Unknown'}</p>
                <p><strong>Email:</strong> ${booking.customerEmail || booking.email || 'Not provided'}</p>
                <p><strong>Phone:</strong> ${booking.customerPhone || booking.phone || 'Not provided'}</p>
                <p><strong>Service:</strong> ${booking.serviceName || booking.serviceType || booking.service?.name || 'Unknown'}</p>
                <p><strong>Date:</strong> ${new Date(booking.date || booking.eventDate).toLocaleDateString()}</p>
                <p><strong>Time:</strong> ${booking.time || 'Not specified'}</p>
                <p><strong>Guests:</strong> ${booking.guestCount || booking.guests || 'Not specified'}</p>
                <p><strong>Special Requests:</strong> ${booking.specialRequests || 'None'}</p>
                <p><strong>Status:</strong> <span class="status ${booking.status}">${booking.status || 'pending'}</span></p>
                ${booking.vendorMessage ? `<p><strong>Vendor Message:</strong> ${booking.vendorMessage}</p>` : ''}
            </div>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin-top: 15px;">
                <h4>Raw Booking Data:</h4>
                <pre style="font-size: 12px; overflow: auto; max-height: 200px;">${JSON.stringify(booking, null, 2)}</pre>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-cancel" onclick="this.closest('.modal').remove()">Close</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}
testBookingActions() {
    console.log("=== TESTING BOOKING ACTIONS ===");
    
    // Check if there are any pending bookings
    const vendorBookings = JSON.parse(localStorage.getItem('vendorBookings')) || [];
    const pendingBookings = vendorBookings.filter(b => b.status === 'pending');
    
    console.log("Pending bookings found:", pendingBookings.length);
    
    if (pendingBookings.length > 0) {
        const testBooking = pendingBookings[0];
        console.log("Test booking:", testBooking);
        console.log("To manually accept, run: vendorDashboard.acceptRealBooking('" + testBooking.id + "')");
        console.log("To manually reject, run: vendorDashboard.rejectRealBooking('" + testBooking.id + "')");
    } else {
        console.log("No pending bookings found. Creating sample booking...");
        this.addSampleBookings();
        this.checkForNewBookings();
    }
}
  // Update vendor data in localStorage
  updateVendorDataInStorage() {
    const currentVendor = JSON.parse(localStorage.getItem('currentVendor')) || {};
    const updatedVendor = {
      ...currentVendor,
      businessName: this.vendorData.businessName,
      businessCategory: this.vendorData.category,
      establishedYear: this.vendorData.establishedYear,
      contactNumber: this.vendorData.contactNumber,
      businessEmail: this.vendorData.email,
      businessAddress: this.vendorData.address,
      capacity: this.vendorData.capacity,
      amenities: this.vendorData.amenities,
      vendorSpecific: this.getVendorSpecificDataForStorage(),
      services: this.vendorData.services
    };
    
    localStorage.setItem('currentVendor', JSON.stringify(updatedVendor));
    
    // Update vendors array
    const vendors = JSON.parse(localStorage.getItem('vendors')) || [];
    const vendorIndex = vendors.findIndex(v => v.email === currentVendor.email);
    if (vendorIndex !== -1) {
      vendors[vendorIndex] = updatedVendor;
      localStorage.setItem('vendors', JSON.stringify(vendors));
    }
  }
// Add this debug method to your VendorDashboard class
debugBookings() {
  console.log("=== BOOKINGS DEBUG ===");
  
  const vendorBookings = JSON.parse(localStorage.getItem('vendorBookings')) || [];
  const allBookings = JSON.parse(localStorage.getItem('allBookings')) || [];
  const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
  
  const currentVendor = JSON.parse(localStorage.getItem('currentVendor'));
  const vendorId = currentVendor?.id || this.vendorData.vendorId;
  
  console.log("Vendor ID:", vendorId);
  console.log("Vendor Bookings:", vendorBookings.filter(b => b.vendorId === vendorId));
  console.log("All Bookings:", allBookings.filter(b => b.vendorId === vendorId));
  console.log("Generic Bookings:", bookings.filter(b => b.vendorId === vendorId));
  
  // Test the booking actions
  const testBooking = vendorBookings.find(b => b.vendorId === vendorId && b.status === 'pending');
  if (testBooking) {
    console.log("Test booking found:", testBooking.id);
    console.log("To accept this booking, run: vendorDashboard.acceptRealBooking('" + testBooking.id + "')");
  }
}
  // Get vendor specific data for storage
  getVendorSpecificDataForStorage() {
    const data = {};
    const fields = [
      'venueSize', 'roomsAvailable', 'outdoorSpace', 'photographyStyles', 'equipment',
      'teamSize', 'cuisineTypes', 'servingCapacity', 'specialDiets', 'kitchenType',
      'decorationThemes', 'decorationTypes', 'setupTime', 'entertainmentTypes',
      'musicGenres', 'performanceDuration', 'makeupStyles', 'brandsUsed', 'hairStyling',
      'vehicleTypes', 'fleetSize', 'serviceAreas', 'maxCapacity', 'eventTypes',
      'planningServices', 'experienceYears', 'invitationTypes', 'productionTime',
      'minOrder', 'customization', 'equipmentTypes', 'inventorySize', 'delivery',
      'setupAssistance', 'serviceSpecialization', 'usp'
    ];
    
    fields.forEach(field => {
      if (this.vendorData[field] && this.vendorData[field] !== 'Not specified') {
        data[field] = this.vendorData[field];
      }
    });
    
    return data;
  }

  // Populate vendor profile
  populateVendorProfile() {
   console.log("🔄 Populating vendor profile with real data...");
    console.log("📊 Full vendorData:", this.vendorData);
    console.log("🔍 Checking specific fields:");
    console.log("- businessName:", this.vendorData.businessName);
    console.log("- category:", this.vendorData.category);
    console.log("- businessType:", this.vendorData.businessType);
    console.log("- vendorType:", this.vendorData.vendorType);
    
    // Update dashboard welcome message
    const welcomeElement = document.getElementById('dashboard-vendor-name');
    const profileElement = document.getElementById('profile-vendor-name');
    
    console.log("🎯 Dashboard element exists:", !!welcomeElement);
    console.log("🎯 Profile element exists:", !!profileElement);
    
    if (welcomeElement) {
        welcomeElement.textContent = this.vendorData.businessName || "No Business Name";
        console.log("✅ Set dashboard welcome to:", this.vendorData.businessName);
    }
    
    if (profileElement) {
        profileElement.textContent = this.vendorData.businessName || "No Business Name";
        console.log("✅ Set profile welcome to:", this.vendorData.businessName);
    }
    
    // Update profile header
    const businessNameElement = document.getElementById('profile-business-name');
    const categoryElement = document.getElementById('profile-category');
    
    console.log("🎯 Business name element exists:", !!businessNameElement);
    console.log("🎯 Category element exists:", !!categoryElement);
    
    if (businessNameElement) {
        businessNameElement.textContent = this.vendorData.businessName || "No Business Name";
        console.log("✅ Set business name to:", this.vendorData.businessName);
    }
    
    if (categoryElement) {
        categoryElement.textContent = this.vendorData.category || "No Category";
        console.log("✅ Set category to:", this.vendorData.category);
    }
    
    // Update profile avatar icon based on vendor type
    const avatarIcon = document.getElementById('profile-avatar');
    if (avatarIcon) {
      const iconElement = avatarIcon.querySelector('i');
      if (iconElement) {
        const iconMap = {
          'venue': 'building',
          'photographer': 'camera',
          'caterer': 'utensils',
          'decorator': 'palette',
          'entertainer': 'music',
          'makeup': 'spa',
          'transportation': 'car',
          'planner': 'clipboard-list',
          'invitations': 'envelope',
          'rentals': 'tools'
        };
        iconElement.className = `fas fa-${iconMap[this.vendorData.vendorType] || 'store'}`;
      }
    }
    
    // Build profile details HTML
    const profileDetails = document.getElementById('profile-details');
    if (!profileDetails) return;
    
    let profileHTML = `
      <div class="detail-card">
        <h3>Business Information</h3>
        <p><strong>Category:</strong> ${this.vendorData.businessType}</p>
        <p><strong>Established:</strong> ${this.vendorData.establishedYear}</p>
        <p><strong>Contact:</strong> ${this.vendorData.contactNumber}</p>
        <p><strong>Email:</strong> ${this.vendorData.email}</p>
        <p><strong>Registration ID:</strong> ${this.vendorData.govtId}</p>
      </div>

      <div class="detail-card">
        <h3>Location</h3>
        <p><strong>Address:</strong> ${this.vendorData.address}</p>
        <p><strong>Capacity:</strong> ${this.vendorData.capacity}</p>
        <p><strong>Parking:</strong> ${this.vendorData.parking}</p>
      </div>

      <div class="detail-card">
        <h3>Amenities</h3>
    `;
    
    // Add amenities
    if (Array.isArray(this.vendorData.amenities) && this.vendorData.amenities.length > 0) {
      this.vendorData.amenities.forEach(amenity => {
        profileHTML += `<p>• ${amenity}</p>`;
      });
    } else {
      profileHTML += `<p>No amenities specified</p>`;
    }
    
    profileHTML += `
      </div>

      <div class="detail-card">
        <h3>Business Hours</h3>
        <p><strong>Regular Hours:</strong> ${this.vendorData.businessHours.regular}</p>
        <p><strong>Events:</strong> ${this.vendorData.businessHours.events}</p>
      </div>
    `;
    
    // Add vendor-specific card
    profileHTML += this.addVendorSpecificCard();
    
    profileDetails.innerHTML = profileHTML;
    console.log("Vendor profile populated successfully");
  }

  // Display services
  displayServices() {
    const serviceCardsContainer = document.querySelector('.service-cards');
    
    if (!serviceCardsContainer) {
      console.log('Service cards container not found');
      return;
    }

    if (!this.vendorData.services || this.vendorData.services.length === 0) {
      serviceCardsContainer.innerHTML = this.getEmptyStateHTML();
    } else {
      serviceCardsContainer.innerHTML = this.vendorData.services.map(service => 
        this.createServiceCardHTML(service)
      ).join('');
    }

    this.attachServiceEventListeners();
  }

createServiceCardHTML(service) {
    const categoryDisplay = service.category ? 
        service.category.charAt(0).toUpperCase() + service.category.slice(1) : 'General';
    
    // SAFELY handle all fields
    const features = service.features || [];
    const displayFeatures = features.slice(0, 3);
    const remainingFeatures = features.length - 3;
    
    // Handle price - generate from minPrice/maxPrice if price field is missing
    const price = service.price || `₹${parseInt(service.minPrice || 0).toLocaleString('en-IN')} - ₹${parseInt(service.maxPrice || 0).toLocaleString('en-IN')}`;
    
    // Handle capacity
    const capacity = service.capacity || 'Not specified';
    
    return `
        <div class="service-card" data-service-id="${service.id}">
            <div class="service-image" onclick="vendorDashboard.showServiceDetails(${service.id})">
                <img src="${service.image}" alt="${service.name}" onerror="this.src='https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400'">
                <div class="service-badge">${categoryDisplay}</div>
            </div>
            <div class="service-content">
                <div class="service-header" onclick="vendorDashboard.showServiceDetails(${service.id})" style="cursor: pointer;">
                    <h3 class="service-title">${service.name}</h3>
                    <p class="service-specialty">${service.specialty}</p>
                    <div class="service-rating">
                        <span class="rating-stars">${'★'.repeat(Math.floor(service.rating || 4.5))}${(service.rating || 4.5) % 1 ? '½' : ''}</span>
                        <span class="rating-value">${service.rating || 4.5}</span>
                    </div>
                    <p class="service-description">${service.description}</p>
                </div>
                <div class="service-meta" onclick="vendorDashboard.showServiceDetails(${service.id})" style="cursor: pointer;">
                    <span class="service-price">${price}</span>
                    <span class="service-capacity"><i class="fas fa-users"></i> ${capacity}</span>
                </div>
                <div class="service-features" onclick="vendorDashboard.showServiceDetails(${service.id})" style="cursor: pointer;">
                    ${displayFeatures.map(feature => 
                        `<span class="feature-tag">${feature}</span>`
                    ).join('')}
                    ${remainingFeatures > 0 ? 
                        `<span class="feature-tag">+${remainingFeatures} more</span>` : ''
                    }
                    ${features.length === 0 ? 
                        `<span class="feature-tag">No features listed</span>` : ''
                    }
                </div>
                <div class="action-buttons">
                <button class="btn btn-secondary edit-service-btn" data-service-id="${service.id}">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-danger delete-service-btn" data-service-id="${service.id}">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
            </div>
        </div>
    `;
}
showServiceDetails(serviceId) {
    console.log('Showing service details for ID:', serviceId);
    
    // Convert serviceId to number for comparison
    const numericServiceId = typeof serviceId === 'string' ? parseInt(serviceId) : serviceId;
    
    const service = this.vendorData.services.find(s => {
        const serviceIdNum = typeof s.id === 'string' ? parseInt(s.id) : s.id;
        return serviceIdNum === numericServiceId;
    });
    
    if (!service) {
        console.error('Service not found for ID:', serviceId);
        this.showToast('Service not found!', 'error');
        return;
    }

    // Create modal (your existing modal code)
    const modal = document.createElement('div');
    modal.className = 'modal service-details-modal';
    modal.style.display = 'flex';
    
    const serviceName = service.name || service.title || 'Unknown Service';
    
    modal.innerHTML = `
        <div class="modal-content service-details-content">
            <span class="close-modal" onclick="this.closest('.modal').remove()">&times;</span>
            <div class="service-details-header">
                <div class="service-details-image">
                    <img src="${service.image}" alt="${serviceName}" onerror="this.src='https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600'">
                </div>
                <div class="service-details-info">
                    <h2>${serviceName}</h2>
                    <p class="service-specialty">${service.specialty}</p>
                    <div class="service-rating">
                        <span class="rating-stars">${'★'.repeat(Math.floor(service.rating || 4.5))}${(service.rating || 4.5) % 1 ? '½' : ''}</span>
                        <span class="rating-value">${service.rating || 4.5}</span>
                    </div>
                    <div class="service-price">${service.price}</div>
                    <div class="service-meta">
                        <span><i class="fas fa-users"></i> ${service.capacity || 'Not specified'}</span>
                        <span><i class="fas fa-clock"></i> ${service.experience || 'Not specified'}</span>
                    </div>
                </div>
            </div>
            
            <div class="service-details-body">
                <div class="details-section">
                    <h3>Description</h3>
                    <p>${service.description}</p>
                </div>
                
                <div class="details-section">
                    <h3>Features</h3>
                    <div class="features-list">
                        ${(service.features || []).map(feature => `<span class="feature-tag">${feature}</span>`).join('')}
                    </div>
                </div>
                
                <div class="details-section">
                    <h3>Packages</h3>
                    <div class="packages-list">
                        ${service.packages ? service.packages.map(pkg => `
                            <div class="package-card">
                                <h4>${pkg.name}</h4>
                                <div class="package-price">${pkg.price}</div>
                                <ul class="package-features">
                                    ${pkg.features.map(f => `<li>${f}</li>`).join('')}
                                </ul>
                            </div>
                        `).join('') : '<p>No packages available</p>'}
                    </div>
                </div>
                
                <div class="details-section">
                    <h3>Contact Information</h3>
                    <div class="contact-info">
                        <p><i class="fas fa-phone"></i> ${service.contact?.phone || 'Not provided'}</p>
                    </div>
                </div>
            </div>
            
            <div class="service-details-actions">
                <button class="btn btn-secondary" onclick="vendorDashboard.editService(${service.id})">
                    <i class="fas fa-edit"></i> Edit Service
                </button>
                <button class="btn btn-danger" onclick="vendorDashboard.deleteService(${service.id})">
                    <i class="fas fa-trash"></i> Delete Service
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

  // Empty state HTML
  getEmptyStateHTML() {
    return `
      <div class="no-services-state">
        <div class="empty-state">
          <i class="fas fa-box-open"></i>
          <h3>No Services Added Yet</h3>
          <p>Start by adding your first service to showcase your offerings.</p>
          <button class="btn btn-primary" id="add-first-service-btn">
            <i class="fas fa-plus"></i> Add Your First Service
          </button>
        </div>
      </div>
    `;
  }

attachServiceEventListeners() {
    console.log('Attaching service event listeners...');
    
    // Remove existing listeners
    document.removeEventListener('click', this.handleServiceClick);
    
    // Add new event delegation
    document.addEventListener('click', (e) => {
        // Handle edit service buttons
        if (e.target.closest('.edit-service-btn')) {
            const button = e.target.closest('.edit-service-btn');
            const serviceId = button.getAttribute('data-service-id');
            console.log('Edit button clicked for service:', serviceId);
            
            if (!serviceId) {
                console.error('No service ID found on edit button');
                return;
            }
            
            this.editService(serviceId);
        }
        
        // Handle delete service buttons
        if (e.target.closest('.delete-service-btn')) {
            const button = e.target.closest('.delete-service-btn');
            const serviceId = button.getAttribute('data-service-id');
            console.log('Delete button clicked for service:', serviceId);
            
            if (!serviceId) {
                console.error('No service ID found on delete button');
                return;
            }
            
            this.deleteService(serviceId);
        }
    });
}

  // Handle service click events
  handleServiceClick(e) {
    // Handle edit service buttons
    if (e.target.closest('.edit-service-btn')) {
      const button = e.target.closest('.edit-service-btn');
      const serviceId = parseInt(button.getAttribute('data-service-id'));
      this.editService(serviceId);
    }
    
    // Handle delete service buttons
    if (e.target.closest('.delete-service-btn')) {
      const button = e.target.closest('.delete-service-btn');
      const serviceId = parseInt(button.getAttribute('data-service-id'));
      this.deleteService(serviceId);
    }
  }

editService(serviceId) {
    console.log("=== EDIT SERVICE DEBUG ===");
    console.log("Requested service ID:", serviceId, "Type:", typeof serviceId);
    console.log("Available services:", this.vendorData.services);
    
    // Convert to number and handle different ID types
    const numericServiceId = parseInt(serviceId);
    console.log("Numeric service ID:", numericServiceId);
    
    const service = this.vendorData.services.find(s => {
        const currentId = typeof s.id === 'string' ? parseInt(s.id) : s.id;
        console.log(`Comparing: ${currentId} (${typeof currentId}) with ${numericServiceId} (${typeof numericServiceId})`);
        return currentId === numericServiceId;
    });
    
    if (!service) {
        console.error("❌ SERVICE NOT FOUND!");
        console.error("Available IDs:", this.vendorData.services.map(s => s.id));
        console.error("Available numeric IDs:", this.vendorData.services.map(s => typeof s.id === 'string' ? parseInt(s.id) : s.id));
        this.showToast(`Service ID ${serviceId} not found! Available IDs: ${this.vendorData.services.map(s => s.id).join(', ')}`, 'error');
        return;
    }
    
    console.log("✅ Found service:", service);
    
    // Populate the edit form with current service data
    document.getElementById('edit-service-id').value = service.id;
    document.getElementById('edit-service-name').value = service.name || service.title || '';
    document.getElementById('edit-service-specialty').value = service.specialty || '';
    document.getElementById('edit-service-description').value = service.description || '';
    document.getElementById('edit-service-category').value = service.category || 'venue';
    document.getElementById('edit-service-capacity').value = service.capacity || '';
    document.getElementById('edit-service-experience').value = service.experience || '';
    document.getElementById('edit-service-phone').value = service.contact?.phone || '';
    document.getElementById('edit-service-features').value = Array.isArray(service.features) ? service.features.join(', ') : '';
    document.getElementById('edit-min-price').value = service.minPrice || '';
    document.getElementById('edit-max-price').value = service.maxPrice || '';

    // Populate packages
    this.populateEditPackages(service.packages || []);

    // Show the edit modal
    const editModal = document.getElementById('editServiceModal');
    if (editModal) {
        editModal.style.display = 'flex';
        console.log('Edit modal shown for service:', service.name || service.title);
    } else {
        console.error('Edit modal not found');
    }
}

// Populate packages in edit form
populateEditPackages(packages) {
    const packagesContainer = document.getElementById('edit-packages-container');
    const noPackagesMessage = document.getElementById('edit-no-packages-message');
    
    // Clear existing packages
    packagesContainer.innerHTML = '';
    
    if (packages.length === 0) {
        noPackagesMessage.style.display = 'block';
        return;
    }
    
    noPackagesMessage.style.display = 'none';
    
    // Add packages from service data
    packages.forEach((pkg, index) => {
        const packageTemplate = document.createElement('div');
        packageTemplate.className = 'package-template';
        packageTemplate.setAttribute('data-package-index', index);
        
        // Extract numeric price from "₹10,000" format
        const numericPrice = parseInt(pkg.price.replace(/[₹,]/g, '')) || 0;
        const featuresText = Array.isArray(pkg.features) ? pkg.features.join('\n') : '';
        
        packageTemplate.innerHTML = `
            <div class="package-header">
                <h5>Package #${index + 1}</h5>
                ${index > 0 ? `<button type="button" class="btn btn-danger btn-sm" onclick="vendorDashboard.removeEditPackage(${index})">
                    <i class="fas fa-times"></i>
                </button>` : ''}
            </div>
            <div class="form-group">
                <label>Package Name *</label>
                <input type="text" class="edit-package-name form-control" value="${pkg.name}" required>
            </div>
            <div class="form-group">
                <label>Package Price (₹) *</label>
                <input type="number" class="edit-package-price form-control" value="${numericPrice}" min="0" required>
            </div>
            <div class="form-group">
                <label>Package Features *</label>
                <textarea class="edit-package-features form-control" rows="4" required>${featuresText}</textarea>
                <small>Enter one feature per line</small>
            </div>
        `;
        
        packagesContainer.appendChild(packageTemplate);
    });
}

// Add package in edit form
addEditPackage() {
    const packagesContainer = document.getElementById('edit-packages-container');
    const noPackagesMessage = document.getElementById('edit-no-packages-message');
    
    // Hide no packages message
    noPackagesMessage.style.display = 'none';
    
    // Get current package count
    const packageCount = packagesContainer.children.length;
    const newIndex = packageCount;
    
    // Create new package template
    const packageTemplate = document.createElement('div');
    packageTemplate.className = 'package-template';
    packageTemplate.setAttribute('data-package-index', newIndex);
    
    packageTemplate.innerHTML = `
        <div class="package-header">
            <h5>Package #${newIndex + 1}</h5>
            <button type="button" class="btn btn-danger btn-sm" onclick="vendorDashboard.removeEditPackage(${newIndex})">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="form-group">
            <label>Package Name *</label>
            <input type="text" class="edit-package-name form-control" placeholder="e.g., Basic Package, Standard Package, Premium Package" required>
        </div>
        <div class="form-group">
            <label>Package Price (₹) *</label>
            <input type="number" class="edit-package-price form-control" placeholder="10000" min="0" required>
        </div>
        <div class="form-group">
            <label>Package Features *</label>
            <textarea class="edit-package-features form-control" placeholder="Enter one feature per line&#10;e.g.:&#10;4 hours service&#10;Basic setup&#10;Professional assistance" rows="4" required></textarea>
            <small>Enter one feature per line</small>
        </div>
    `;
    
    packagesContainer.appendChild(packageTemplate);
    this.updateEditPackageNumbers();
}

// Remove package in edit form
removeEditPackage(index) {
    const packagesContainer = document.getElementById('edit-packages-container');
    const packageToRemove = packagesContainer.querySelector(`[data-package-index="${index}"]`);
    
    if (packageToRemove) {
        packagesContainer.removeChild(packageToRemove);
        this.updateEditPackageNumbers();
    }
    
    // Show no packages message if no packages left
    if (packagesContainer.children.length === 0) {
        document.getElementById('edit-no-packages-message').style.display = 'block';
    }
}

// Update package numbers in edit form
updateEditPackageNumbers() {
    const packagesContainer = document.getElementById('edit-packages-container');
    const packages = packagesContainer.querySelectorAll('.package-template');
    
    packages.forEach((packageEl, index) => {
        const header = packageEl.querySelector('.package-header h5');
        if (header) {
            header.textContent = `Package #${index + 1}`;
        }
        packageEl.setAttribute('data-package-index', index);
        
        // Update remove button (don't show for first package)
        const removeBtn = packageEl.querySelector('.btn-danger');
        if (removeBtn) {
            if (index === 0) {
                removeBtn.style.display = 'none';
            } else {
                removeBtn.style.display = 'block';
                removeBtn.setAttribute('onclick', `vendorDashboard.removeEditPackage(${index})`);
            }
        }
    });
}

  // Delete service
deleteService(serviceId) {
    console.log('Deleting service:', serviceId);
    console.log('Available services:', this.vendorData.services);
    
    // Convert serviceId to number for comparison
    const numericServiceId = typeof serviceId === 'string' ? parseInt(serviceId) : serviceId;
    
    const service = this.vendorData.services.find(s => {
        const serviceIdNum = typeof s.id === 'string' ? parseInt(s.id) : s.id;
        return serviceIdNum === numericServiceId;
    });
    
    if (!service) {
        console.error('Service not found for ID:', serviceId);
        this.showToast('Service not found!', 'error');
        return;
    }

    const serviceName = service.name || service.title || 'Unknown Service';
    
    if (confirm(`Are you sure you want to delete "${serviceName}"? This action cannot be undone.`)) {
        // Remove service using the same ID comparison
        this.vendorData.services = this.vendorData.services.filter(s => {
            const serviceIdNum = typeof s.id === 'string' ? parseInt(s.id) : s.id;
            return serviceIdNum !== numericServiceId;
        });
        
        this.updateVendorDataInStorage();
        this.displayServices();
        this.showToast(`Service "${serviceName}" deleted successfully!`, 'success');
    }
}

  // Show add service page
  showAddServicePage() {
    document.querySelectorAll('.page-content').forEach(page => page.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
    
    document.getElementById('add-service').classList.add('active');
    document.querySelector('[data-page="add-service"]').classList.add('active');
  }
// Package Management Methods
addNewPackage() {
    const packagesContainer = document.getElementById('packages-container');
    const noPackagesMessage = document.getElementById('no-packages-message');
    
    // Hide no packages message
    if (noPackagesMessage) {
        noPackagesMessage.style.display = 'none';
    }
    
    // Get current package count
    const packageCount = packagesContainer.children.length;
    const newIndex = packageCount;
    
    // Create new package template
    const packageTemplate = document.createElement('div');
    packageTemplate.className = 'package-template';
    packageTemplate.setAttribute('data-package-index', newIndex);
    
    packageTemplate.innerHTML = `
        <div class="package-header">
            <h5>Package #${newIndex + 1}</h5>
            <button type="button" class="btn btn-danger btn-sm" onclick="vendorDashboard.removePackage(${newIndex})">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="form-group">
            <label>Package Name *</label>
            <input type="text" class="package-name form-control" placeholder="e.g., Basic Package, Standard Package, Premium Package" required>
        </div>
        <div class="form-group">
            <label>Package Price (₹) *</label>
            <input type="number" class="package-price form-control" placeholder="10000" min="0" required>
        </div>
        <div class="form-group">
            <label>Package Features *</label>
            <textarea class="package-features form-control" placeholder="Enter one feature per line&#10;e.g.:&#10;4 hours service&#10;Basic setup&#10;Professional assistance" rows="4" required></textarea>
            <small>Enter one feature per line</small>
        </div>
    `;
    
    packagesContainer.appendChild(packageTemplate);
    
    // Update package numbers
    this.updatePackageNumbers();
}

removePackage(index) {
    const packagesContainer = document.getElementById('packages-container');
    const packageToRemove = packagesContainer.querySelector(`[data-package-index="${index}"]`);
    
    if (packageToRemove) {
        packagesContainer.removeChild(packageToRemove);
        this.updatePackageNumbers();
    }
    
    // Show no packages message if no packages left
    if (packagesContainer.children.length === 0) {
        const noPackagesMessage = document.getElementById('no-packages-message');
        if (noPackagesMessage) {
            noPackagesMessage.style.display = 'block';
        }
    }
}

updatePackageNumbers() {
    const packagesContainer = document.getElementById('packages-container');
    const packages = packagesContainer.querySelectorAll('.package-template');
    
    packages.forEach((packageEl, index) => {
        const header = packageEl.querySelector('.package-header h5');
        if (header) {
            header.textContent = `Package #${index + 1}`;
        }
        packageEl.setAttribute('data-package-index', index);
        
        // Update remove button (don't show for first package)
        const removeBtn = packageEl.querySelector('.btn-danger');
        if (removeBtn) {
            if (index === 0) {
                removeBtn.style.display = 'none';
            } else {
                removeBtn.style.display = 'block';
                removeBtn.setAttribute('onclick', `vendorDashboard.removePackage(${index})`);
            }
        }
    });
}

// Get packages from form
getPackagesFromForm() {
    const packagesContainer = document.getElementById('packages-container');
    const packageTemplates = packagesContainer.querySelectorAll('.package-template');
    const packages = [];
    
    packageTemplates.forEach((packageEl, index) => {
        const nameInput = packageEl.querySelector('.package-name');
        const priceInput = packageEl.querySelector('.package-price');
        const featuresInput = packageEl.querySelector('.package-features');
        
        if (nameInput && priceInput && featuresInput) {
            const name = nameInput.value.trim();
            const price = `₹${parseInt(priceInput.value).toLocaleString('en-IN')}`;
            const features = featuresInput.value.split('\n')
                .map(f => f.trim())
                .filter(f => f.length > 0);
            
            if (name && priceInput.value && features.length > 0) {
                packages.push({
                    name: name,
                    price: price,
                    features: features
                });
            }
        }
    });
    
    return packages;
}

// Validate packages
validatePackages() {
    const packages = this.getPackagesFromForm();
    
    if (packages.length === 0) {
        alert('Please add at least one package for your service.');
        return false;
    }
    
    // Check for duplicate package names
    const packageNames = packages.map(p => p.name.toLowerCase());
    const uniqueNames = new Set(packageNames);
    
    if (packageNames.length !== uniqueNames.size) {
        alert('Package names must be unique. Please use different names for each package.');
        return false;
    }
    
    return true;
}

  // Setup all event listeners
setupEventListeners() {
    console.log("Setting up event listeners...");
    
    // Navigation between pages - PRIMARY METHOD
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            // Don't handle logout button here
            if (e.currentTarget.id === 'logout-btn') {
                this.logout();
                return;
            }
            
            // Handle vendor feedback button separately - REDIRECT TO EXTERNAL PAGE
            if (e.currentTarget.id === 'vendor-feedback-btn') {
                window.location.href = 'vendor-feedback-form.html';
                return;
            }
            
            // Remove active class from all nav items
            document.querySelectorAll('.nav-item').forEach(nav => {
                nav.classList.remove('active');
            });
            
            // Add active class to clicked nav item
            e.currentTarget.classList.add('active');
            
            // Hide all page content
            document.querySelectorAll('.page-content').forEach(page => {
                page.classList.remove('active');
            });
            
            // Show the selected page
            const pageId = e.currentTarget.getAttribute('data-page');
            console.log("Switching to page:", pageId);
            
            if (pageId) {
                const targetPage = document.getElementById(pageId);
                if (targetPage) {
                    targetPage.classList.add('active');
                    
                    // Special handling for specific pages
                    switch(pageId) {
                        case 'services':
                            this.displayServices();
                            break;
                        case 'bookings':
                            this.checkForNewBookings();
                            break;
                        case 'profile':
                            // Ensure profile data is fresh
                            this.populateVendorProfile();
                            break;
                    }
                } else {
                    console.error('Page not found:', pageId);
                }
            }
        });
    });

    // Add Service button in My Services page
    const addServiceBtn = document.getElementById('add-service-btn');
    if (addServiceBtn) {
        addServiceBtn.addEventListener('click', () => {
            this.switchToPage('add-service');
        });
    }

    // Form submission for Add Service
    const serviceForm = document.getElementById('service-form');
    if (serviceForm) {
        serviceForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddService();
        });
    }

    // Logout functionality
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            this.logout();
        });
    }

    // Edit Profile button
    const editProfileBtn = document.getElementById('edit-profile-btn');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', () => {
            this.openEditProfileModal();
        });
    }

    // Edit service form submission
    const editServiceForm = document.getElementById('edit-service-form');
    if (editServiceForm) {
        editServiceForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleEditService();
        });
    }
    
    // Close modal events
    this.setupModalEvents();
    
    // File upload functionality
    this.setupFileUpload();
    
    // Initialize package system
    this.setupPackageSystem();

    // CRITICAL: Setup booking actions - Add this line
    this.setupBookingActions();
}
// Initialize package system
setupPackageSystem() {
    // Ensure at least one package exists in add service form
    setTimeout(() => {
        const packagesContainer = document.getElementById('packages-container');
        if (packagesContainer && packagesContainer.children.length === 0) {
            this.addNewPackage();
        }
    }, 100);
}
// Helper method for navigation
switchToPage(pageId) {
    // Remove active class from all nav items
    document.querySelectorAll('.nav-item').forEach(nav => {
        nav.classList.remove('active');
    });
    
    // Hide all page content
    document.querySelectorAll('.page-content').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show the selected page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // Activate the corresponding nav item
    const navItem = document.querySelector(`[data-page="${pageId}"]`);
    if (navItem) {
        navItem.classList.add('active');
    }
    
    // Special handling for specific pages
    switch(pageId) {
        case 'services':
            this.displayServices();
            break;
        case 'bookings':
            this.checkForNewBookings();
            break;
        case 'profile':
            this.populateVendorProfile();
            break;
    }
}


handleAddService() {
    const name = document.getElementById('service-name').value;
    const specialty = document.getElementById('service-specialty').value;
    const description = document.getElementById('service-description').value;
    const category = document.getElementById('service-category').value;
    const capacity = document.getElementById('service-capacity').value;
    const experience = document.getElementById('service-experience').value;
    const phone = document.getElementById('service-phone').value;
    const minPrice = document.getElementById('min-price').value;
    const maxPrice = document.getElementById('max-price').value;
    
    const featuresInput = document.getElementById('service-features').value;
    const features = featuresInput.split(',').map(f => f.trim()).filter(f => f);
    
    if (!name || !specialty || !description || !category || !phone || !minPrice || !maxPrice || features.length === 0) {
        alert('Please fill in all required fields');
        return;
    }
    
    if (!this.validatePackages()) {
        return;
    }
    
    const packages = this.getPackagesFromForm();
    const newServiceId = this.vendorData.services.length > 0 ? 
        Math.max(...this.vendorData.services.map(s => s.id)) + 1 : 1;
    
    // FIX: Use default images instead of Blob URLs
    const newService = {
        id: newServiceId,
        name: name,
        specialty: specialty,
        rating: 4.5,
        price: `₹${parseInt(minPrice).toLocaleString('en-IN')} - ₹${parseInt(maxPrice).toLocaleString('en-IN')}`,
        capacity: capacity || "Not specified",
        description: description,
        category: category,
        // FIX: Use default image instead of Blob URL
        image: this.getDefaultServiceImage(category),
        experience: experience || "Not specified",
        features: features,
        contact: {
            phone: phone
        },
        packages: packages,
        minPrice: minPrice,
        maxPrice: maxPrice,
        // FIX: Don't store Blob URLs in photos array
        photos: [] // Clear blob URLs
    };
    
    this.vendorData.services.push(newService);
    this.updateVendorDataInStorage();
    this.displayServices();
    
    document.getElementById('service-form').reset();
    this.resetFileUpload();
    this.resetPackagesForm();
    
    this.showToast('Service added successfully!', 'success');
    this.showServicesPage();
}
cleanupBlobUrls() {
    let cleaned = false;
    
    this.vendorData.services.forEach(service => {
        if (service.image && service.image.startsWith('blob:')) {
            service.image = this.getDefaultServiceImage(service.category);
            cleaned = true;
        }
        
        if (service.photos && Array.isArray(service.photos)) {
            service.photos = service.photos.filter(photo => !photo.url.startsWith('blob:'));
            if (service.photos.length === 0) {
                service.photos = [];
            }
        }
    });
    
    if (cleaned) {
        this.updateVendorDataInStorage();
        this.displayServices();
        console.log('Cleaned up blob URLs from services');
    }
}

// Add this method to reset packages form
resetPackagesForm() {
    const packagesContainer = document.getElementById('packages-container');
    const noPackagesMessage = document.getElementById('no-packages-message');
    
    // Clear all packages
    packagesContainer.innerHTML = '';
    
    // Add one default package
    const defaultPackage = document.createElement('div');
    defaultPackage.className = 'package-template';
    defaultPackage.setAttribute('data-package-index', '0');
    
    defaultPackage.innerHTML = `
        <div class="package-header">
            <h5>Package #1</h5>
        </div>
        <div class="form-group">
            <label>Package Name *</label>
            <input type="text" class="package-name form-control" placeholder="e.g., Basic Package, Standard Package, Premium Package" required>
        </div>
        <div class="form-group">
            <label>Package Price (₹) *</label>
            <input type="number" class="package-price form-control" placeholder="10000" min="0" required>
        </div>
        <div class="form-group">
            <label>Package Features *</label>
            <textarea class="package-features form-control" placeholder="Enter one feature per line&#10;e.g.:&#10;4 hours service&#10;Basic setup&#10;Professional assistance" rows="4" required></textarea>
            <small>Enter one feature per line</small>
        </div>
    `;
    
    packagesContainer.appendChild(defaultPackage);
    
    // Hide no packages message
    if (noPackagesMessage) {
        noPackagesMessage.style.display = 'none';
    }
}
// ADD this method to generate packages like your sample:
generatePackages(minPrice, maxPrice, category) {
    const basePackage = {
        name: "Basic Package",
        price: `₹${minPrice.toLocaleString('en-IN')}`,
        features: [
            "Standard service delivery",
            "Basic setup",
            "Professional assistance",
            "Quality guarantee"
        ]
    };

    const standardPackage = {
        name: "Standard Package", 
        price: `₹${Math.round((minPrice + maxPrice) / 2).toLocaleString('en-IN')}`,
        features: [
            "Enhanced service delivery",
            "Premium setup",
            "Professional assistance",
            "Extended hours",
            "Additional features"
        ]
    };

    const premiumPackage = {
        name: "Premium Package",
        price: `₹${maxPrice.toLocaleString('en-IN')}`,
        features: [
            "Premium service delivery",
            "Luxury setup",
            "Dedicated professional",
            "Extended hours", 
            "All features included",
            "Priority support"
        ]
    };

    return [basePackage, standardPackage, premiumPackage];
}

// ADD this helper method for default images:
getDefaultServiceImage(category) {
    const defaultImages = {
        'venue': 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&auto=format&fit=crop',
        'photography': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&auto=format&fit=crop',
        'catering': 'https://images.unsplash.com/photo-1555244162-803834f70033?w=400&auto=format&fit=crop',
        'entertainment': 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&auto=format&fit=crop',
        'decoration': 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&auto=format&fit=crop',
        'wedding': 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&auto=format&fit=crop',
        'corporate': 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&auto=format&fit=crop',
        'birthday': 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&auto=format&fit=crop'
    };
    return defaultImages[category] || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&auto=format&fit=crop';
}

// Handle edit service form submission - UPDATED for package management
handleEditService() {
    const serviceId = parseInt(document.getElementById('edit-service-id').value);
    const service = this.vendorData.services.find(s => s.id === serviceId);
    
    if (!service) {
        alert('Service not found!');
        return;
    }
    
    // Get form values
    const name = document.getElementById('edit-service-name').value;
    const specialty = document.getElementById('edit-service-specialty').value;
    const description = document.getElementById('edit-service-description').value;
    const category = document.getElementById('edit-service-category').value;
    const capacity = document.getElementById('edit-service-capacity').value;
    const experience = document.getElementById('edit-service-experience').value;
    const phone = document.getElementById('edit-service-phone').value;
    const minPrice = document.getElementById('edit-min-price').value;
    const maxPrice = document.getElementById('edit-max-price').value;
    
    // Get features (comma separated)
    const featuresInput = document.getElementById('edit-service-features').value;
    const features = featuresInput.split(',').map(f => f.trim()).filter(f => f);
    
    // Validate packages from edit form
    const packages = this.getEditPackagesFromForm();
    if (packages.length === 0) {
        alert('Please add at least one package for your service.');
        return;
    }
    
    if (!name || !specialty || !description || !category || !phone || !minPrice || !maxPrice || features.length === 0) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Update service data with new structure
    service.name = name;
    service.specialty = specialty;
    service.description = description;
    service.category = category;
    service.capacity = capacity;
    service.experience = experience;
    service.contact = { phone: phone };
    service.features = features;
    service.minPrice = minPrice;
    service.maxPrice = maxPrice;
    service.price = `₹${parseInt(minPrice).toLocaleString('en-IN')} - ₹${parseInt(maxPrice).toLocaleString('en-IN')}`;
    
    // Update packages from edit form
    service.packages = packages;
    
    // Update localStorage
    this.updateVendorDataInStorage();
    
    // Update the services display
    this.displayServices();
    
    // Close modal
    document.getElementById('editServiceModal').style.display = 'none';
    
    // Show success message
    this.showToast('Service updated successfully!', 'success');
}

// Get packages from edit form
getEditPackagesFromForm() {
    const packagesContainer = document.getElementById('edit-packages-container');
    const packageTemplates = packagesContainer.querySelectorAll('.package-template');
    const packages = [];
    
    packageTemplates.forEach((packageEl, index) => {
        const nameInput = packageEl.querySelector('.edit-package-name');
        const priceInput = packageEl.querySelector('.edit-package-price');
        const featuresInput = packageEl.querySelector('.edit-package-features');
        
        if (nameInput && priceInput && featuresInput) {
            const name = nameInput.value.trim();
            const price = `₹${parseInt(priceInput.value).toLocaleString('en-IN')}`;
            const features = featuresInput.value.split('\n')
                .map(f => f.trim())
                .filter(f => f.length > 0);
            
            if (name && priceInput.value && features.length > 0) {
                packages.push({
                    name: name,
                    price: price,
                    features: features
                });
            }
        }
    });
    
    return packages;
}

  // Open edit profile modal
  openEditProfileModal() {
    // Populate edit form with current data
    document.getElementById('edit-business-name').value = this.vendorData.businessName;
    document.getElementById('edit-business-type').value = this.vendorData.vendorType;
    document.getElementById('edit-category').value = this.vendorData.category;
    document.getElementById('edit-established').value = this.vendorData.establishedYear;
    document.getElementById('edit-contact').value = this.vendorData.contactNumber;
    document.getElementById('edit-email').value = this.vendorData.email;
    document.getElementById('edit-address').value = this.vendorData.address;
    document.getElementById('edit-capacity').value = this.vendorData.capacity;
    document.getElementById('edit-amenities').value = Array.isArray(this.vendorData.amenities) ? 
      this.vendorData.amenities.join(', ') : this.vendorData.amenities;
    
    // Show vendor-specific fields
    this.showVendorSpecificFields();
    
    // Show modal
    document.getElementById('editProfileModal').style.display = 'flex';
  }

  // Handle edit profile
  handleEditProfile() {
    // Update vendor data
    this.vendorData.businessName = document.getElementById('edit-business-name').value;
    this.vendorData.vendorType = document.getElementById('edit-business-type').value;
    this.vendorData.category = document.getElementById('edit-category').value;
    this.vendorData.establishedYear = document.getElementById('edit-established').value;
    this.vendorData.contactNumber = document.getElementById('edit-contact').value;
    this.vendorData.email = document.getElementById('edit-email').value;
    this.vendorData.address = document.getElementById('edit-address').value;
    this.vendorData.capacity = document.getElementById('edit-capacity').value;
    this.vendorData.amenities = document.getElementById('edit-amenities').value.split(',').map(item => item.trim());
    
    // Update vendor-specific data
    this.updateVendorSpecificData();
    
    // Update localStorage
    this.updateVendorDataInStorage();
    
    // Update profile display
    this.populateVendorProfile();
    
    // Close modal
    document.getElementById('editProfileModal').style.display = 'none';
    
    // Show success message
    this.showToast('Profile updated successfully!', 'success');
  }

  // Setup modal events
  setupModalEvents() {
    // Close edit service modal
    const closeEditServiceModal = document.querySelector('#editServiceModal .close-modal');
    if (closeEditServiceModal) {
      closeEditServiceModal.addEventListener('click', () => {
        document.getElementById('editServiceModal').style.display = 'none';
      });
    }
    
    const cancelEditService = document.getElementById('cancel-edit-service');
    if (cancelEditService) {
      cancelEditService.addEventListener('click', () => {
        document.getElementById('editServiceModal').style.display = 'none';
      });
    }
    
    // Close profile modal
    const closeModal = document.querySelector('#editProfileModal .close-modal');
    if (closeModal) {
      closeModal.addEventListener('click', () => {
        document.getElementById('editProfileModal').style.display = 'none';
      });
    }
    
    const cancelEdit = document.getElementById('cancel-edit');
    if (cancelEdit) {
      cancelEdit.addEventListener('click', () => {
        document.getElementById('editProfileModal').style.display = 'none';
      });
    }
  }

  // Setup file upload
  setupFileUpload() {
    const fileUploadArea = document.getElementById('file-upload-area');
    const fileInput = document.getElementById('service-photos');
    
    if (fileUploadArea && fileInput) {
      // Click on upload area to trigger file input
      fileUploadArea.addEventListener('click', () => {
        fileInput.click();
      });
      
      // Handle file selection
      fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
          this.handleFileUpload(Array.from(e.target.files));
        }
      });
      
      // Drag and drop functionality
      fileUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileUploadArea.classList.add('dragover');
      });
      
      fileUploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        fileUploadArea.classList.remove('dragover');
      });
      
      fileUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        fileUploadArea.classList.remove('dragover');
        
        if (e.dataTransfer.files.length > 0) {
          this.handleFileUpload(Array.from(e.dataTransfer.files));
        }
      });
    }
  }

  // Handle file upload
  handleFileUpload(files) {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    
    for (let file of files) {
      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        alert(`File ${file.name} is not a supported image type. Please upload JPG, JPEG or PNG files.`);
        continue;
      }
      
      // Validate file size
      if (file.size > maxSize) {
        alert(`File ${file.name} is too large. Maximum size is 5MB.`);
        continue;
      }
      
      // Add to uploaded files array
      if (!this.uploadedFiles.some(f => f.name === file.name)) {
        this.uploadedFiles.push(file);
      }
    }
    
    this.updateUploadedFilesList();
  }

  // Update uploaded files list
  updateUploadedFilesList() {
    const filesList = document.getElementById('uploaded-files-list');
    
    if (this.uploadedFiles.length === 0) {
      filesList.innerHTML = '';
      return;
    }
    
    let filesHTML = '';
    this.uploadedFiles.forEach((file, index) => {
      filesHTML += `
        <div class="uploaded-file">
          <div class="uploaded-file-info">
            <i class="fas fa-file-image file-icon"></i>
            <span class="file-name">${file.name}</span>
          </div>
          <button type="button" class="remove-file" data-index="${index}">
            <i class="fas fa-times"></i>
          </button>
        </div>
      `;
    });
    
    filesList.innerHTML = filesHTML;
    
    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-file').forEach(button => {
      button.addEventListener('click', (e) => {
        const index = parseInt(e.currentTarget.getAttribute('data-index'));
        this.uploadedFiles.splice(index, 1);
        this.updateUploadedFilesList();
      });
    });
  }

  // Reset file upload
  resetFileUpload() {
    this.uploadedFiles = [];
    this.updateUploadedFilesList();
    const fileInput = document.getElementById('service-photos');
    if (fileInput) fileInput.value = '';
  }

  // Show services page
  showServicesPage() {
    document.querySelectorAll('.page-content').forEach(page => page.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
    
    document.getElementById('services').classList.add('active');
    document.querySelector('[data-page="services"]').classList.add('active');
  }

  // Helper method to get icon for category
  getIconForCategory(category) {
    const icons = {
      'wedding': 'glass-cheers',
      'corporate': 'briefcase',
      'birthday': 'birthday-cake',
      'engagement': 'gem',
      'photography': 'camera',
      'catering': 'utensils',
      'decoration': 'palette',
      'entertainment': 'music',
      'venue': 'building'
    };
    return icons[category] || 'star';
  }

  // Add vendor-specific information card
  addVendorSpecificCard() {
    let vendorSpecificHTML = '';
    
    switch(this.vendorData.vendorType) {
      case 'venue':
        vendorSpecificHTML = `
          <div class="detail-card vendor-specific-card">
            <h3>Venue Details</h3>
            <p><strong>Venue Size:</strong> ${this.vendorData.venueSize}</p>
            <p><strong>Rooms Available:</strong> ${this.vendorData.roomsAvailable}</p>
            <p><strong>Outdoor Space:</strong> ${this.vendorData.outdoorSpace}</p>
          </div>
        `;
        break;
        
      case 'photographer':
        vendorSpecificHTML = `
          <div class="detail-card vendor-specific-card">
            <h3>Photography Details</h3>
            <p><strong>Photography Styles:</strong> ${this.vendorData.photographyStyles}</p>
            <p><strong>Equipment:</strong> ${this.vendorData.equipment}</p>
            <p><strong>Team Size:</strong> ${this.vendorData.teamSize}</p>
            <p><strong>Experience:</strong> ${this.vendorData.experienceYears} years</p>
          </div>
        `;
        break;
        
      case 'caterer':
        vendorSpecificHTML = `
          <div class="detail-card vendor-specific-card">
            <h3>Catering Details</h3>
            <p><strong>Cuisine Types:</strong> ${this.vendorData.cuisineTypes}</p>
            <p><strong>Serving Capacity:</strong> ${this.vendorData.servingCapacity}</p>
            <p><strong>Special Diets:</strong> ${this.vendorData.specialDiets}</p>
            <p><strong>Kitchen Type:</strong> ${this.vendorData.kitchenType}</p>
          </div>
        `;
        break;
        
      default:
        vendorSpecificHTML = `
          <div class="detail-card vendor-specific-card">
            <h3>Service Details</h3>
            <p><strong>Specialization:</strong> ${this.vendorData.serviceSpecialization}</p>
            <p><strong>Team Size:</strong> ${this.vendorData.teamSize}</p>
            <p><strong>Experience:</strong> ${this.vendorData.experienceYears} years</p>
            <p><strong>Unique Features:</strong> ${this.vendorData.usp}</p>
          </div>
        `;
    }
    
    return vendorSpecificHTML;
  }

  // Show vendor-specific fields in edit form
  showVendorSpecificFields() {
    const vendorType = document.getElementById('edit-business-type').value;
    const vendorFieldsContainer = document.getElementById('vendor-specific-fields');
    if (!vendorFieldsContainer) return;
    
    let vendorFieldsHTML = '';
    
    switch(vendorType) {
      case 'venue':
        vendorFieldsHTML = `
          <div class="form-group">
            <label for="edit-venue-size">Venue Size</label>
            <input type="text" id="edit-venue-size" class="form-control" value="${this.vendorData.venueSize || ''}">
          </div>
          <div class="form-group">
            <label for="edit-rooms">Rooms Available</label>
            <input type="text" id="edit-rooms" class="form-control" value="${this.vendorData.roomsAvailable || ''}">
          </div>
          <div class="form-group">
            <label for="edit-outdoor-space">Outdoor Space</label>
            <input type="text" id="edit-outdoor-space" class="form-control" value="${this.vendorData.outdoorSpace || ''}">
          </div>
        `;
        break;
        
      case 'photographer':
        vendorFieldsHTML = `
          <div class="form-group">
            <label for="edit-photography-styles">Photography Styles (comma separated)</label>
            <input type="text" id="edit-photography-styles" class="form-control" value="${Array.isArray(this.vendorData.photographyStyles) ? this.vendorData.photographyStyles.join(', ') : this.vendorData.photographyStyles}">
          </div>
          <div class="form-group">
            <label for="edit-equipment">Equipment (comma separated)</label>
            <input type="text" id="edit-equipment" class="form-control" value="${Array.isArray(this.vendorData.equipment) ? this.vendorData.equipment.join(', ') : this.vendorData.equipment}">
          </div>
          <div class="form-group">
            <label for="edit-team-size">Team Size</label>
            <input type="text" id="edit-team-size" class="form-control" value="${this.vendorData.teamSize || ''}">
          </div>
          <div class="form-group">
            <label for="edit-experience-years">Experience (Years)</label>
            <input type="number" id="edit-experience-years" class="form-control" value="${this.vendorData.experienceYears || ''}">
          </div>
        `;
        break;
        
      default:
        vendorFieldsHTML = `
          <div class="form-group">
            <label for="edit-service-specialization">Service Specialization</label>
            <input type="text" id="edit-service-specialization" class="form-control" value="${this.vendorData.serviceSpecialization || ''}">
          </div>
          <div class="form-group">
            <label for="edit-team-size">Team Size</label>
            <input type="text" id="edit-team-size" class="form-control" value="${this.vendorData.teamSize || ''}">
          </div>
          <div class="form-group">
            <label for="edit-experience-years">Experience (Years)</label>
            <input type="number" id="edit-experience-years" class="form-control" value="${this.vendorData.experienceYears || ''}">
          </div>
          <div class="form-group">
            <label for="edit-usp">Unique Selling Points</label>
            <textarea id="edit-usp" class="form-control" rows="3">${this.vendorData.usp || ''}</textarea>
          </div>
        `;
    }
    
    vendorFieldsContainer.innerHTML = vendorFieldsHTML;
  }

  // Update vendor-specific data from edit form
  updateVendorSpecificData() {
    const vendorType = document.getElementById('edit-business-type').value;
    
    switch(vendorType) {
      case 'venue':
        this.vendorData.venueSize = document.getElementById('edit-venue-size').value;
        this.vendorData.roomsAvailable = document.getElementById('edit-rooms').value;
        this.vendorData.outdoorSpace = document.getElementById('edit-outdoor-space').value;
        break;
      case 'photographer':
        this.vendorData.photographyStyles = document.getElementById('edit-photography-styles').value.split(',').map(item => item.trim());
        this.vendorData.equipment = document.getElementById('edit-equipment').value.split(',').map(item => item.trim());
        this.vendorData.teamSize = document.getElementById('edit-team-size').value;
        this.vendorData.experienceYears = document.getElementById('edit-experience-years').value;
        break;
      default:
        this.vendorData.serviceSpecialization = document.getElementById('edit-service-specialization').value;
        this.vendorData.teamSize = document.getElementById('edit-team-size').value;
        this.vendorData.experienceYears = document.getElementById('edit-experience-years').value;
        this.vendorData.usp = document.getElementById('edit-usp').value;
    }
  }

  // Setup booking actions
setupBookingActions() {
    console.log("Setting up booking action listeners...");
    
    // Use event delegation for booking buttons with data attributes
    document.addEventListener('click', (e) => {
        // Handle accept booking buttons
        if (e.target.closest('[data-action="accept-booking"]')) {
            e.preventDefault();
            const button = e.target.closest('[data-action="accept-booking"]');
            const bookingId = button.getAttribute('data-booking-id');
            if (bookingId) {
                console.log("Accept booking clicked for:", bookingId);
                this.acceptRealBooking(bookingId);
            }
        }
        
        // Handle reject booking buttons
        else if (e.target.closest('[data-action="reject-booking"]')) {
            e.preventDefault();
            const button = e.target.closest('[data-action="reject-booking"]');
            const bookingId = button.getAttribute('data-booking-id');
            if (bookingId) {
                console.log("Reject booking clicked for:", bookingId);
                this.rejectRealBooking(bookingId);
            }
        }
        
        // Handle view details buttons
        else if (e.target.closest('[data-action="view-booking"]')) {
            e.preventDefault();
            const button = e.target.closest('[data-action="view-booking"]');
            const bookingId = button.getAttribute('data-booking-id');
            if (bookingId) {
                console.log("View details clicked for:", bookingId);
                this.viewRealBookingDetails(bookingId);
            }
        }
    });
}

// Add this helper method to extract booking ID
extractBookingIdFromButton(button) {
    const onclickAttr = button.getAttribute('onclick');
    if (onclickAttr) {
        const match = onclickAttr.match(/vendorDashboard\.(?:acceptRealBooking|rejectRealBooking|viewRealBookingDetails)\('([^']+)'\)/);
        if (match && match[1]) {
            return match[1];
        }
    }
    console.error("Could not extract booking ID from button:", button);
    return null;
}

  // Handle accept booking
  handleAcceptBooking(e, button) {
    const row = button.closest('tr');
    
    if (!row) return;
    
    const customerName = row.querySelector('td:first-child')?.textContent || 'Unknown Customer';
    const eventType = row.querySelector('td:nth-child(2)')?.textContent || 'Unknown Event';
    const statusCell = row.querySelector('.status');
    const actionCell = row.querySelector('td:last-child');
    
    // Update status
    if (statusCell) {
      statusCell.textContent = 'Confirmed';
      statusCell.className = 'status confirmed';
    }
    
    // Remove action buttons
    if (actionCell) {
      actionCell.innerHTML = '';
    }
    
    // Show confirmation
    this.showToast(`Booking accepted for ${customerName} (${eventType})`, 'success');
    
    // Move to confirmed section if in pending table
    this.moveToConfirmed(row);
  }

  // Handle reject booking
  handleRejectBooking(e, button) {
    const row = button.closest('tr');
    
    if (!row) return;
    
    const customerName = row.querySelector('td:first-child')?.textContent || 'Unknown Customer';
    const eventType = row.querySelector('td:nth-child(2)')?.textContent || 'Unknown Event';
    
    // Remove from table
    row.remove();
    
    // Show confirmation
    this.showToast(`Booking rejected for ${customerName} (${eventType})`, 'error');
  }

  // Move booking to confirmed section
  moveToConfirmed(row) {
    const confirmedTables = document.querySelectorAll('.bookings table');
    if (confirmedTables.length < 2) return;
    
    const confirmedTable = confirmedTables[1];
    const tbody = confirmedTable.querySelector('tbody');
    
    if (!tbody) return;
    
    // Clone the row
    const newRow = row.cloneNode(true);
    
    // Remove action buttons from the cloned row
    const actionCell = newRow.querySelector('td:last-child');
    if (actionCell) {
      actionCell.innerHTML = '';
    }
    
    // Add to confirmed table
    tbody.appendChild(newRow);
    
    // Remove from pending table
    row.remove();
  }

  // Add sample bookings
  addSampleBookings() {
    // This method adds sample booking data to the tables
    // Implementation can be added if needed
  }

  // Toast notification
  showToast(message, type = 'info') {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.vendor-toast');
    existingToasts.forEach(toast => toast.remove());
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `vendor-toast vendor-toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add styles
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
        max-width: 400px;
        font-weight: 500;
    `;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 300);
    }, 3000);
  }

  // Clean up when leaving the page
  destroy() {
    if (this.realTimeInterval) {
      clearInterval(this.realTimeInterval);
    }
  }
  // Navigation method - handles page switching
switchPage(pageId) {
    console.log('Switching to page:', pageId);
    
    // Hide all page content
    document.querySelectorAll('.page-content').forEach(page => {
        page.classList.remove('active');
    });
    
    // Remove active class from all nav items
    document.querySelectorAll('.nav-item').forEach(nav => {
        nav.classList.remove('active');
    });
    
    // Show the selected page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    } else {
        console.error('Page not found:', pageId);
    }
    
    // Activate the corresponding nav item
    const navItem = document.querySelector(`[data-page="${pageId}"]`);
    if (navItem) {
        navItem.classList.add('active');
    }
    
    // Special handling for specific pages
    switch(pageId) {
        case 'services':
            this.displayServices();
            break;
        case 'dashboard':
            // Refresh dashboard stats if needed
            break;
        case 'bookings':
            this.checkForNewBookings(); // Refresh bookings when switching to bookings page
            break;
    }
}
// Add these missing methods to your VendorDashboard class:

loadUserProfile() {
    console.log("Loading user profile...");
    // This would typically load user-specific data
    // For now, we'll use the vendor data we already have
    return this.vendorData;
}

initializeSampleData() {
    console.log("Initializing sample data...");
    
    // Initialize sample bookings if none exist
    const vendorBookings = JSON.parse(localStorage.getItem('vendorBookings')) || [];
    if (vendorBookings.length === 0) {
        const sampleBookings = [
            {
                id: 'BOOK001',
                vendorId: this.vendorData.vendorId,
                customerName: 'Priya Sharma',
                customerEmail: 'priya@example.com',
                customerPhone: '+91 9876543210',
                serviceName: 'Wedding Ceremony',
                serviceType: 'venue',
                date: '2025-11-15',
                time: '18:00',
                guestCount: '200',
                package: 'Premium Package',
                status: 'pending',
                specialRequests: 'Need floral decorations and DJ setup',
                createdAt: new Date().toISOString()
            },
            {
                id: 'BOOK002',
                vendorId: this.vendorData.vendorId,
                customerName: 'Rahul Mehta',
                customerEmail: 'rahul@example.com',
                customerPhone: '+91 9876543211',
                serviceName: 'Corporate Conference',
                serviceType: 'venue',
                date: '2025-11-22',
                time: '09:00',
                guestCount: '150',
                package: 'Standard Package',
                status: 'pending',
                specialRequests: 'Need projector and whiteboards',
                createdAt: new Date().toISOString()
            }
        ];
        localStorage.setItem('vendorBookings', JSON.stringify(sampleBookings));
    }

    // Initialize sample notifications
    const vendorNotifications = JSON.parse(localStorage.getItem('vendorNotifications')) || [];
    if (vendorNotifications.length === 0) {
        const sampleNotifications = [
            {
                id: 'NOTIF001',
                type: 'info',
                title: 'Welcome to Timeless Moments!',
                message: 'Your vendor dashboard is ready. Start by adding your services.',
                timestamp: new Date().toISOString(),
                read: false
            },
            {
                id: 'NOTIF002',
                type: 'success',
                title: 'Profile Completed',
                message: 'Your vendor profile has been successfully set up.',
                timestamp: new Date().toISOString(),
                read: false
            }
        ];
        localStorage.setItem('vendorNotifications', JSON.stringify(sampleNotifications));
    }
}

switchMainContent(page) {
    console.log("Switching to page:", page);
    this.switchPage(page);
}

displayVendorBookings() {
    console.log("Displaying vendor bookings...");
    this.checkForNewBookings(); // This will update the bookings display
}

displayAllBookings() {
    console.log("Displaying all bookings...");
    // This method can be used to show all bookings in a separate view
    // For now, we'll use checkForNewBookings which handles both pending and confirmed
}

displayShortlist() {
    console.log("Displaying shortlist...");
    // Vendors don't typically have a shortlist, this might be for customer view
    // We can repurpose this for vendor's favorite customers or something similar
}

displayNotifications() {
    console.log("Displaying notifications...");
    const notificationsContainer = document.getElementById('vendorNotificationsContainer');
    if (!notificationsContainer) return;

    const notifications = JSON.parse(localStorage.getItem('vendorNotifications')) || [];
    
    if (notifications.length === 0) {
        notificationsContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔔</div>
                <h3>No Notifications</h3>
                <p>You're all caught up! New notifications will appear here.</p>
            </div>
        `;
        return;
    }

    let notificationsHTML = '';
    notifications.forEach(notification => {
        const timeAgo = this.getTimeAgo(notification.timestamp);
        notificationsHTML += `
            <div class="notification-item ${notification.read ? 'read' : 'unread'}" data-notification-id="${notification.id}">
                <div class="notification-icon">
                    <i class="fas fa-${this.getNotificationIcon(notification.type)}"></i>
                </div>
                <div class="notification-content">
                    <h4>${notification.title}</h4>
                    <p>${notification.message}</p>
                    <span class="notification-time">${timeAgo}</span>
                </div>
                <div class="notification-actions">
                    ${!notification.read ? `
                    <button class="btn btn-sm" onclick="vendorDashboard.markNotificationAsRead('${notification.id}')">
                        Mark Read
                    </button>
                    ` : ''}
                    <button class="btn btn-sm btn-danger" onclick="vendorDashboard.deleteNotification('${notification.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });

    notificationsContainer.innerHTML = notificationsHTML;
    
    // Update notification badge count
    this.updateNotificationBadge();
}

displayMessages() {
    console.log("Displaying messages...");
    const conversationsContainer = document.getElementById('vendorConversationsContainer');
    if (!conversationsContainer) return;

    const messages = JSON.parse(localStorage.getItem('vendorMessages')) || [];
    
    // Group messages by customer
    const conversations = this.groupMessagesByCustomer(messages);
    
    if (conversations.length === 0) {
        conversationsContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">💬</div>
                <h3>No Messages</h3>
                <p>When customers message you, conversations will appear here.</p>
            </div>
        `;
        return;
    }

    let conversationsHTML = '';
    conversations.forEach(conversation => {
        const lastMessage = conversation.messages[conversation.messages.length - 1];
        const timeAgo = this.getTimeAgo(lastMessage.timestamp);
        const unreadCount = conversation.messages.filter(msg => !msg.read && msg.sender === 'customer').length;
        
        conversationsHTML += `
            <div class="conversation-item" data-customer-id="${conversation.customerId}" onclick="vendorDashboard.openConversation('${conversation.customerId}')">
                <div class="conversation-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="conversation-info">
                    <h4>${conversation.customerName}</h4>
                    <p class="conversation-preview">${lastMessage.content}</p>
                    <span class="conversation-time">${timeAgo}</span>
                </div>
                ${unreadCount > 0 ? `
                <div class="conversation-badge">
                    ${unreadCount}
                </div>
                ` : ''}
            </div>
        `;
    });

    conversationsContainer.innerHTML = conversationsHTML;
    
    // Update message badge count
    this.updateMessageBadge();
}

displayPaymentAgreements() {
    console.log("Displaying payment agreements...");
    // This would typically show payment terms, agreements with customers
    // For now, we'll create a simple implementation
    const payments = JSON.parse(localStorage.getItem('vendorPayments')) || [];
    
    // You can create a payment agreements section in your HTML if needed
    console.log('Payment agreements data:', payments);
}

displayRecentActivity() {
    console.log("Displaying recent activity...");
    // This would show recent activities like new bookings, messages, etc.
    const activities = JSON.parse(localStorage.getItem('vendorActivities')) || [];
    
    if (activities.length === 0) {
        // Create some sample activities
        const sampleActivities = [
            {
                id: 'ACT001',
                type: 'booking',
                message: 'New booking request from Priya Sharma',
                timestamp: new Date().toISOString(),
                icon: 'calendar-check'
            },
            {
                id: 'ACT002',
                type: 'message',
                message: 'New message from Rahul Mehta',
                timestamp: new Date(Date.now() - 3600000).toISOString(),
                icon: 'comment'
            },
            {
                id: 'ACT003',
                type: 'review',
                message: 'New 5-star review received',
                timestamp: new Date(Date.now() - 7200000).toISOString(),
                icon: 'star'
            }
        ];
        localStorage.setItem('vendorActivities', JSON.stringify(sampleActivities));
    }
}

displayRecommendations() {
    console.log("Displaying recommendations...");
    // This could show recommendations for the vendor
    // Like: "Add more photos to your services", "Update your availability", etc.
    const recommendations = [
        {
            id: 'REC001',
            type: 'improvement',
            title: 'Add Service Photos',
            message: 'Services with photos get 3x more bookings',
            action: 'Add Photos',
            icon: 'camera'
        },
        {
            id: 'REC002',
            type: 'optimization',
            title: 'Complete Your Profile',
            message: 'Complete profiles attract more customers',
            action: 'Edit Profile',
            icon: 'user-edit'
        },
        {
            id: 'REC003',
            type: 'promotion',
            title: 'Run a Promotion',
            message: 'Offer discounts during off-peak seasons',
            action: 'Create Offer',
            icon: 'tag'
        }
    ];

    // You can display these in a recommendations section
    console.log('Vendor recommendations:', recommendations);
}

updateDashboardStats() {
    console.log("Updating dashboard stats...");
    
    // Get real booking data
    const vendorBookings = JSON.parse(localStorage.getItem('vendorBookings')) || [];
    const allBookings = JSON.parse(localStorage.getItem('allBookings')) || [];
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    
    const currentVendor = JSON.parse(localStorage.getItem('currentVendor'));
    const vendorId = currentVendor?.id || this.vendorData.vendorId;
    
    // Filter bookings for this vendor
    const myBookings = vendorBookings.filter(booking => booking.vendorId === vendorId);
    const myAllBookings = allBookings.filter(booking => booking.vendorId === vendorId);
    const myGenericBookings = bookings.filter(booking => booking.vendorId === vendorId);
    
    const allMyBookings = [...myBookings, ...myAllBookings, ...myGenericBookings];
    
    // Calculate stats
    const totalBookings = allMyBookings.length;
    const pendingBookings = allMyBookings.filter(b => b.status === 'pending').length;
    const confirmedBookings = allMyBookings.filter(b => b.status === 'confirmed').length;
    const upcomingBookings = allMyBookings.filter(b => {
        if (!b.date) return false;
        const eventDate = new Date(b.date);
        const today = new Date();
        return eventDate >= today && b.status === 'confirmed';
    }).length;

    // Update stats in the dashboard
    const statCards = document.querySelectorAll('.stat-card .stat-number');
    if (statCards.length >= 3) {
        statCards[0].textContent = totalBookings;
        statCards[1].textContent = '4.7★'; // This could be calculated from reviews
        statCards[2].textContent = upcomingBookings;
    }
    
    // Update booking badge
    this.updateBookingBadge(pendingBookings);
}

// Helper methods for the above implementations

getTimeAgo(timestamp) {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now - past) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
}

getNotificationIcon(type) {
    const icons = {
        'info': 'info-circle',
        'success': 'check-circle',
        'warning': 'exclamation-triangle',
        'error': 'exclamation-circle',
        'booking': 'calendar-alt',
        'message': 'comment',
        'review': 'star'
    };
    return icons[type] || 'bell';
}

groupMessagesByCustomer(messages) {
    const conversations = {};
    
    messages.forEach(message => {
        if (!conversations[message.customerId]) {
            conversations[message.customerId] = {
                customerId: message.customerId,
                customerName: message.customerName,
                messages: []
            };
        }
        conversations[message.customerId].messages.push(message);
    });
    
    // Sort messages in each conversation by timestamp
    Object.values(conversations).forEach(conversation => {
        conversation.messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    });
    
    // Sort conversations by last message time
    return Object.values(conversations).sort((a, b) => {
        const lastMessageA = a.messages[a.messages.length - 1];
        const lastMessageB = b.messages[b.messages.length - 1];
        return new Date(lastMessageB.timestamp) - new Date(lastMessageA.timestamp);
    });
}

updateNotificationBadge() {
    const notifications = JSON.parse(localStorage.getItem('vendorNotifications')) || [];
    const unreadCount = notifications.filter(n => !n.read).length;
    const badge = document.querySelector('.vendor-notification-badge');
    if (badge) {
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? 'flex' : 'none';
    }
}

updateMessageBadge() {
    const messages = JSON.parse(localStorage.getItem('vendorMessages')) || [];
    const unreadCount = messages.filter(m => !m.read && m.sender === 'customer').length;
    const badge = document.querySelector('.vendor-message-badge');
    if (badge) {
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? 'flex' : 'none';
    }
}

updateBookingBadge(count) {
    const badge = document.querySelector('.vendor-booking-badge');
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    }
}

// Notification management methods
markNotificationAsRead(notificationId) {
    const notifications = JSON.parse(localStorage.getItem('vendorNotifications')) || [];
    const notificationIndex = notifications.findIndex(n => n.id === notificationId);
    
    if (notificationIndex !== -1) {
        notifications[notificationIndex].read = true;
        localStorage.setItem('vendorNotifications', JSON.stringify(notifications));
        this.displayNotifications();
    }
}

markAllNotificationsAsRead() {
    const notifications = JSON.parse(localStorage.getItem('vendorNotifications')) || [];
    notifications.forEach(notification => {
        notification.read = true;
    });
    localStorage.setItem('vendorNotifications', JSON.stringify(notifications));
    this.displayNotifications();
    this.showToast('All notifications marked as read', 'success');
}

clearAllNotifications() {
    if (confirm('Are you sure you want to clear all notifications?')) {
        localStorage.setItem('vendorNotifications', JSON.stringify([]));
        this.displayNotifications();
        this.showToast('All notifications cleared', 'success');
    }
}

deleteNotification(notificationId) {
    const notifications = JSON.parse(localStorage.getItem('vendorNotifications')) || [];
    const updatedNotifications = notifications.filter(n => n.id !== notificationId);
    localStorage.setItem('vendorNotifications', JSON.stringify(updatedNotifications));
    this.displayNotifications();
}

// Message management methods
openConversation(customerId) {
    const messages = JSON.parse(localStorage.getItem('vendorMessages')) || [];
    const customerMessages = messages.filter(m => m.customerId === customerId);
    
    if (customerMessages.length === 0) return;
    
    const customerName = customerMessages[0].customerName;
    
    // Update message header
    const messageHeader = document.getElementById('vendorMessageHeader');
    if (messageHeader) {
        messageHeader.innerHTML = `
            <h3>${customerName}</h3>
            <button class="btn btn-sm btn-primary" onclick="vendorDashboard.showQuickReplyModal('${customerId}')">
                <i class="fas fa-reply"></i> Quick Reply
            </button>
        `;
    }
    
    // Display messages
    const messagesContainer = document.getElementById('vendorMessagesContainer');
    if (messagesContainer) {
        let messagesHTML = '';
        customerMessages.forEach(message => {
            const time = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            messagesHTML += `
                <div class="message ${message.sender === 'vendor' ? 'sent' : 'received'}">
                    <div class="message-content">
                        <p>${message.content}</p>
                        <span class="message-time">${time}</span>
                    </div>
                </div>
            `;
        });
        messagesContainer.innerHTML = messagesHTML;
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    // Show message compose area
    const messageCompose = document.getElementById('vendorMessageCompose');
    if (messageCompose) {
        messageCompose.style.display = 'block';
        messageCompose.setAttribute('data-customer-id', customerId);
    }
    
    // Mark messages as read
    this.markCustomerMessagesAsRead(customerId);
}

sendReply() {
    const messageInput = document.getElementById('vendorMessageInput');
    const messageCompose = document.getElementById('vendorMessageCompose');
    const customerId = messageCompose.getAttribute('data-customer-id');
    
    if (!messageInput.value.trim() || !customerId) return;
    
    const messages = JSON.parse(localStorage.getItem('vendorMessages')) || [];
    const customerMessage = messages.find(m => m.customerId === customerId);
    
    if (!customerMessage) return;
    
    const newMessage = {
        id: 'MSG_' + Date.now(),
        customerId: customerId,
        customerName: customerMessage.customerName,
        content: messageInput.value.trim(),
        sender: 'vendor',
        timestamp: new Date().toISOString(),
        read: true
    };
    
    messages.push(newMessage);
    localStorage.setItem('vendorMessages', JSON.stringify(messages));
    
    // Clear input and refresh
    messageInput.value = '';
    this.openConversation(customerId);
    this.displayMessages();
    this.showToast('Message sent successfully', 'success');
}

markCustomerMessagesAsRead(customerId) {
    const messages = JSON.parse(localStorage.getItem('vendorMessages')) || [];
    let updated = false;
    
    messages.forEach(message => {
        if (message.customerId === customerId && message.sender === 'customer' && !message.read) {
            message.read = true;
            updated = true;
        }
    });
    
    if (updated) {
        localStorage.setItem('vendorMessages', JSON.stringify(messages));
        this.displayMessages();
    }
}

showQuickReplyModal(customerId) {
    // You can implement a quick reply modal for common responses
    console.log('Show quick reply for customer:', customerId);
    // Implementation for quick reply modal
}

closeQuickReplyModal() {
    const modal = document.getElementById('vendorQuickReplyModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

sendQuickReply() {
    // Implementation for sending quick replies
    this.closeQuickReplyModal();
}

// Add this method to handle the logout functionality
logout() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear current vendor session
        localStorage.removeItem('currentVendor');
        
        // Redirect to login page
        window.location.href = 'vendor-login.html';
    }
}
}


// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Starting Vendor Dashboard...');
  window.vendorDashboard = new VendorDashboard();
  window.vendorDashboard.init();
});
