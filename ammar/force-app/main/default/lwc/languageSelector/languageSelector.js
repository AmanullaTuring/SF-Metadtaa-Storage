import { LightningElement, track } from 'lwc';
import getUserPreferredLanguage from '@salesforce/apex/LanguageDetectionService.getUserPreferredLanguage';
import fetchTemplate from '@salesforce/apex/LanguageDetectionService.fetchTemplate';

export default class LanguageSelector extends LightningElement {
    @track selectedLanguage = '';
    @track notificationTemplate = '';
    @track languageOptions = [
        { label: 'English', value: 'en' },
        { label: 'Spanish', value: 'es' },
        { label: 'French', value: 'fr' }
    ];

    connectedCallback() {
        this.detectUserLanguage();
    }

    // Detect user's preferred language
    detectUserLanguage() {
        getUserPreferredLanguage()
            .then((result) => {
                this.selectedLanguage = result;
                this.loadTemplate();
            })
            .catch((error) => {
                console.error('Error detecting user language', error);
            });
    }

    // Fetch template for the selected language
    loadTemplate() {
        fetchTemplate({ languageCode: this.selectedLanguage })
            .then((result) => {
                this.notificationTemplate = result;
            })
            .catch((error) => {
                console.error('Error fetching notification template', error);
            });
    }

    // Handle manual language selection
    handleLanguageChange(event) {
        this.selectedLanguage = event.target.value;
        this.loadTemplate();
    }
}