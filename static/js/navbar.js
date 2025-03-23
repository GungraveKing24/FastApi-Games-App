// Dark mode toggle
const themeToggle = document.getElementById('theme-toggle');
const moonIcon = document.querySelector('.moon-icon');
const sunIcon = document.querySelector('.sun-icon');

// Check for saved theme preference or use system preference
const savedTheme = localStorage.getItem('theme') || 'system';

// Apply the saved theme or system preference
if (savedTheme === 'dark' || (savedTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
    moonIcon.classList.add('hidden');
    sunIcon.classList.remove('hidden');
}

themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    
    if (isDark) {
        moonIcon.classList.add('hidden');
        sunIcon.classList.remove('hidden');
        localStorage.setItem('theme', 'dark');
    } else {
        moonIcon.classList.remove('hidden');
        sunIcon.classList.add('hidden');
        localStorage.setItem('theme', 'light');
    }
});

// Mobile menu toggle
const mobileMenuButton = document.getElementById('mobile-menu-button');
const sidebar = document.getElementById('sidebar');
const menuIcon = document.querySelector('.menu-icon');
const closeIcon = document.querySelector('.close-icon');

mobileMenuButton.addEventListener('click', () => {
    const isOpen = sidebar.classList.toggle('-translate-x-full');
    
    if (!isOpen) {
        menuIcon.classList.add('hidden');
        closeIcon.classList.remove('hidden');
    } else {
        menuIcon.classList.remove('hidden');
        closeIcon.classList.add('hidden');
    }
});

// Tabs functionality
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const tabId = button.getAttribute('data-tab');
        
        // Hide all tab contents
        tabContents.forEach(content => {
        content.classList.add('hidden');
        });
        
        // Remove active class from all tab buttons
        tabButtons.forEach(btn => {
        btn.classList.remove('border-primary', 'text-primary');
        btn.classList.add('border-transparent', 'hover:text-primary', 'hover:border-primary');
        });
        
        // Show the selected tab content
        document.getElementById(tabId).classList.remove('hidden');
        
        // Add active class to the clicked tab button
        button.classList.add('border-primary', 'text-primary');
        button.classList.remove('border-transparent', 'hover:text-primary', 'hover:border-primary');
    });
});