import { LightningElement, track } from 'lwc';
import getUserTheme from '@salesforce/apex/UserThemePreferenceController.getUserTheme';
import setUserTheme from '@salesforce/apex/UserThemePreferenceController.setUserTheme';

export default class SalesDashboard extends LightningElement {
    @track currentTheme = 'light'; // default until we load from server

    connectedCallback() {
        // Fetch user’s theme from server
        getUserTheme()
            .then(theme => {
                this.currentTheme = theme || 'light';
            })
            .catch(error => {
                console.error('Error fetching user theme:', error);
                this.currentTheme = 'light'; // fallback
            });
    }

    get containerClass() {
        return this.currentTheme === 'dark' ? 'dark-theme' : 'light-theme';
    }

    handleThemeToggle() {
        this.currentTheme = (this.currentTheme === 'light') ? 'dark' : 'light';
        // Save the updated theme to server
        setUserTheme({ theme: this.currentTheme })
            .then(() => {
                console.log('Theme preference saved successfully.');
            })
            .catch(error => {
                console.error('Error saving theme preference:', error);
            });
    }
}