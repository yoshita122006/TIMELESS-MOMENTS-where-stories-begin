// Enhanced Shared Message Bus for Customer-Vendor-Admin Communication
class DashboardMessageBus {
    constructor() {
        this.lastUpdateTime = 0;
        this.setupStorageListener();
        this.setupPolling();
    }
    
    setupStorageListener() {
        window.addEventListener('storage', (e) => {
            if (e.key === 'last_update') {
                this.checkForNewMessages();
            }
        });
    }
    
    setupPolling() {
        // Check for updates every 3 seconds
        setInterval(() => {
            this.checkForNewMessages();
        }, 3000);
    }
    
    // Send message to specific user type
    sendMessage(type, data, targetUserType, targetUserId = null) {
        const message = {
            id: 'msg_' + Date.now(),
            type: type,
            data: data,
            from: window.isVendorDashboard ? 'vendor' : (window.isAdminDashboard ? 'admin' : 'customer'),
            fromUserId: this.getCurrentUserId(),
            to: targetUserType,
            toUserId: targetUserId,
            timestamp: Date.now(),
            read: false
        };
        
        const messages = JSON.parse(localStorage.getItem('dashboard_messages') || '[]');
        messages.push(message);
        localStorage.setItem('dashboard_messages', JSON.stringify(messages));
        localStorage.setItem('last_update', Date.now().toString());
        
        console.log('Message sent:', message);
        return message;
    }
    
    // Send notification to all users of a type
    sendBroadcastNotification(title, message, targetUserType, notificationType = 'info') {
        const notification = {
            id: 'notif_' + Date.now(),
            title: title,
            message: message,
            type: notificationType,
            targetUserType: targetUserType,
            timestamp: Date.now(),
            read: false
        };
        
        const notifications = JSON.parse(localStorage.getItem('broadcast_notifications') || '[]');
        notifications.push(notification);
        localStorage.setItem('broadcast_notifications', JSON.stringify(notifications));
        localStorage.setItem('last_update', Date.now().toString());
        
        console.log('Broadcast notification sent:', notification);
        return notification;
    }
    
    checkForNewMessages() {
        const messages = JSON.parse(localStorage.getItem('dashboard_messages') || '[]');
        const notifications = JSON.parse(localStorage.getItem('broadcast_notifications') || '[]');
        
        const currentUserId = this.getCurrentUserId();
        const currentUserType = window.isVendorDashboard ? 'vendor' : (window.isAdminDashboard ? 'admin' : 'customer');
        
        // Check for new messages
        const newMessages = messages.filter(msg => 
            msg.timestamp > this.lastUpdateTime && 
            ((msg.to === currentUserType && (!msg.toUserId || msg.toUserId === currentUserId)) ||
             (msg.toUserId === currentUserId))
        );
        
        // Check for new notifications
        const newNotifications = notifications.filter(notif => 
            notif.timestamp > this.lastUpdateTime && 
            (notif.targetUserType === currentUserType || notif.targetUserType === 'all')
        );
        
        newMessages.forEach(msg => this.handleMessage(msg));
        newNotifications.forEach(notif => this.handleNotification(notif));
        
        if (newMessages.length > 0 || newNotifications.length > 0) {
            this.lastUpdateTime = Date.now();
        }
    }
    
    handleMessage(message) {
        console.log('New message received:', message);
        
        // Mark as read
        const messages = JSON.parse(localStorage.getItem('dashboard_messages') || '[]');
        const msgIndex = messages.findIndex(msg => msg.id === message.id);
        if (msgIndex !== -1) {
            messages[msgIndex].read = true;
            localStorage.setItem('dashboard_messages', JSON.stringify(messages));
        }
        
        // Handle based on message type
        switch(message.type) {
            case 'customer_to_vendor_message':
                if (window.vendorDashboard) {
                    window.vendorDashboard.handleCustomerMessage(message);
                }
                break;
                
            case 'vendor_to_customer_message':
                if (window.customerDashboard) {
                    window.customerDashboard.handleVendorMessage(message);
                }
                break;
                
            case 'admin_broadcast':
                this.showNotification(message.data.title, message.data.message);
                break;
                
            case 'booking_status_update':
                if (window.customerDashboard) {
                    window.customerDashboard.handleBookingStatusUpdate(message.data);
                }
                if (window.vendorDashboard) {
                    window.vendorDashboard.handleBookingUpdate(message.data);
                }
                break;
        }
    }
    
    handleNotification(notification) {
        console.log('New notification received:', notification);
        
        // Mark as read
        const notifications = JSON.parse(localStorage.getItem('broadcast_notifications') || '[]');
        const notifIndex = notifications.findIndex(notif => notif.id === notification.id);
        if (notifIndex !== -1) {
            notifications[notifIndex].read = true;
            localStorage.setItem('broadcast_notifications', JSON.stringify(notifications));
        }
        
        this.showNotification(notification.title, notification.message);
        
        // Add to local notifications
        this.addToLocalNotifications(notification);
    }
    
    addToLocalNotifications(notification) {
        const userType = window.isVendorDashboard ? 'vendor' : (window.isAdminDashboard ? 'admin' : 'customer');
        const localNotifications = JSON.parse(localStorage.getItem(`${userType}_notifications`) || '[]');
        
        localNotifications.unshift({
            id: notification.id,
            title: notification.title,
            message: notification.message,
            type: notification.type,
            timestamp: notification.timestamp,
            read: true // Already shown as toast
        });
        
        localStorage.setItem(`${userType}_notifications`, JSON.stringify(localNotifications));
        
        // Update badge counts
        this.updateNotificationBadges();
    }
    
    updateNotificationBadges() {
        const userType = window.isVendorDashboard ? 'vendor' : (window.isAdminDashboard ? 'admin' : 'customer');
        const notifications = JSON.parse(localStorage.getItem(`${userType}_notifications`) || '[]');
        const unreadCount = notifications.filter(n => !n.read).length;
        
        // Update badge in UI
        const badge = document.querySelector(`.${userType}-notification-badge`);
        if (badge) {
            badge.textContent = unreadCount;
            badge.style.display = unreadCount > 0 ? 'inline-block' : 'none';
        }
    }
    
    getCurrentUserId() {
        if (window.isVendorDashboard) {
            const vendor = JSON.parse(localStorage.getItem('currentVendor'));
            return vendor ? vendor.id : null;
        } else if (window.isAdminDashboard) {
            return 'admin';
        } else {
            const user = JSON.parse(localStorage.getItem('currentUser'));
            return user ? user.id : null;
        }
    }
    
    showNotification(title, message) {
        // Create toast notification
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            max-width: 300px;
            animation: slideInRight 0.3s ease;
        `;
        toast.innerHTML = `
            <strong>${title}</strong><br>
            ${message}
            <button style="background: none; border: none; color: white; float: right; cursor: pointer;" onclick="this.parentElement.remove()">×</button>
        `;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 5000);
    }
}

// Initialize global message bus
window.messageBus = new DashboardMessageBus();