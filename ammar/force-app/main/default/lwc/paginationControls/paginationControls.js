import { LightningElement, api } from 'lwc';

export default class PaginationControls extends LightningElement {
    @api currentPage = 1;
    @api pageSize = 10;
    @api totalRecords = 0;

    get totalPages() {
        return Math.ceil(this.totalRecords / this.pageSize);
    }

    handleFirst() {
        this.dispatchPageChangeEvent(1);
    }

    handlePrevious() {
        if (this.currentPage > 1) {
            this.dispatchPageChangeEvent(this.currentPage - 1);
        }
    }

    handleNext() {
        if (this.currentPage < this.totalPages) {
            this.dispatchPageChangeEvent(this.currentPage + 1);
        }
    }

    handleLast() {
        this.dispatchPageChangeEvent(this.totalPages);
    }

    dispatchPageChangeEvent(pageNumber) {
        const pageChangeEvent = new CustomEvent('pagechange', { detail: { pageNumber } });
        this.dispatchEvent(pageChangeEvent);
    }
}