import { LightningElement } from 'lwc';

export default class notificationBanner extends LightningElement {
    content = '';  // Holds the updated content

    // Handles the event and updates the UI
    handleContentChange(event) {
        this.content = event.detail.content;  // Update content
        console.log("Updated content:", this.content);
    }

    // Listens for 'docchange' event on component mount
    connectedCallback() {
        this.addEventListener('docchange', this.handleContentChange);
    }

    // UI Feedback Styling for Success
    get successStyle() {
        return this.content ? 'background-color: green; color: white; padding: 10px;' : '';
    }
}