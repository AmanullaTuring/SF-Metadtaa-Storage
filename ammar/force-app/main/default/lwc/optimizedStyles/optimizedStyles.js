import { LightningElement } from 'lwc';

export default class OptimizedStyles extends LightningElement {
    renderedCallback() {
        // Ensure the element exists before appending the style
        const container = this.template.querySelector('.optimized-container');
        if (container) {
            const style = document.createElement('style');
            style.textContent = `
                .optimized-container {
                    color: blue;
                    background-color: lightgray;
                    padding: 20px;
                }
            `;
            container.appendChild(style);
        } else {
            console.error('Container element not found');
        }
    }
}