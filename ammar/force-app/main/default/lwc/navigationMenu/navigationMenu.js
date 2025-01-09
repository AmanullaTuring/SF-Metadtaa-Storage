import { LightningElement, track, wire } from 'lwc';
import fetchSpecials from '@salesforce/apex/SpecialsController.getSpecials';

export default class NavigationMenu extends LightningElement {
    @track isMenuOpen = false; // Tracks menu visibility for mobile
    @track menuItems = []; // Stores the menu items with active and special states
    specials = []; // Stores today's specials fetched from the backend
    activePath = ''; // Tracks the currently active path

    // Initial menu items
    originalMenuItems = [
        {
            label: 'Appetizers',
            path: '/appetizers',
            children: [
                { label: 'Spring Rolls', path: '/appetizers/spring-rolls' },
                { label: 'Garlic Bread', path: '/appetizers/garlic-bread' }
            ]
        },
        {
            label: 'Main Course',
            path: '/main-course',
            children: [
                { label: 'Steak', path: '/main-course/steak' },
                { label: 'Grilled Chicken', path: '/main-course/chicken' }
            ]
        },
        {
            label: 'Desserts',
            path: '/desserts',
            children: [
                { label: 'Ice Cream', path: '/desserts/ice-cream' },
                { label: 'Cheesecake', path: '/desserts/cheesecake' }
            ]
        }
    ];

    // Fetch specials using Apex
    @wire(fetchSpecials)
    wiredSpecials({ error, data }) {
        if (data) {
            this.specials = data;
            this.updateMenuItems();
        } else if (error) {
            console.error('Error fetching specials:', error);
        }
    }

    connectedCallback() {
        this.updateMenuItems();
    }

    // Toggle menu state for mobile
    handleToggleMenu() {
        this.isMenuOpen = !this.isMenuOpen;
    }

    // Handle menu click and set the active state
    handleMenuClick(event) {
        const path = event.target.dataset.path;
        this.activePath = path;
        this.updateMenuItems();
    }

    // Updates the menu items with active and special states
    updateMenuItems() {
        this.menuItems = this.originalMenuItems.map((item) => {
            const isActive = this.activePath === item.path || this.activePath.startsWith(item.path);
            const children = item.children.map((child) => ({
                ...child,
                isActive: this.activePath === child.path,
                isSpecial: this.specials.includes(child.path),
                cssClass: this.computeCssClass(this.activePath === child.path, this.specials.includes(child.path))
            }));

            const hasSpecialInChildren = children.some((child) => child.isSpecial);

            return {
                ...item,
                isActive,
                hasSpecialInChildren,
                cssClass: this.computeCssClass(isActive, hasSpecialInChildren),
                children
            };
        });
    }

    // Compute CSS class for menu items
    computeCssClass(isActive, isSpecial) {
        let classes = '';
        if (isActive) classes += 'active ';
        if (isSpecial) classes += 'special';
        return classes.trim();
    }

    // Computes the class for the main menu
    get menuClass() {
        return this.isMenuOpen ? 'menu open' : 'menu';
    }
}