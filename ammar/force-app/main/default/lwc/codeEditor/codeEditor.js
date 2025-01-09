import { LightningElement } from 'lwc';

export default class CodeEditor extends LightningElement {
    content = '';  // Holds the document content
    errorMessage = '';  // Holds error messages for UI feedback

    // Validate event data
    validateEventData(content) {
        if (!content || content.trim() === '') {
            this.errorMessage = 'Content cannot be empty!';
            console.error(this.errorMessage);
            return false;  // Reject empty or invalid content
        }
        if (content.length > 1000) {
            this.errorMessage = 'Content is too long!';
            console.error(this.errorMessage);
            return false;  // Reject too long content
        }
        this.errorMessage = '';  // Clear previous error
        return true;
    }

    // Handles change in the textarea
    handleChange(event) {
        this.content = event.target.value;
    }

    // Dispatch the event after validating the content
    handleUpdate() {
        if (this.validateEventData(this.content)) {
            const event = new CustomEvent('docchange', {
                detail: { content: this.content },
                bubbles: true,  // Event will propagate upward
                composed: true  // Event can cross shadow DOM boundaries
            });
            this.dispatchEvent(event);  // Dispatch validated event
            console.log("Event dispatched with content:", this.content);
        }
    }

    // UI Feedback for Error Message
    get errorStyle() {
        return this.errorMessage ? 'color: red; font-size: 14px; margin-top: 10px;' : '';
    }
}