import { LightningElement, api, track } from 'lwc';

export default class ArticleItem extends LightningElement {
    @api article; // Article data from parent
    @track comment = ''; // Input for new comment

    // Dynamic label for the bookmark button
    get bookmarkLabel() {
        return this.article.isBookmarked ? 'Unbookmark' : 'Bookmark';
    }

    // Update the comment input value
    handleInput(event) {
        this.comment = event.target.value;
    }

    // Dispatch like event to parent
    likeArticle() {
        this.dispatchEvent(new CustomEvent('like', {
            detail: { articleId: this.article.Id }
        }));
    }

    // Dispatch comment event to parent
    addComment() {
        if (this.comment.trim()) {
            this.dispatchEvent(new CustomEvent('comment', {
                detail: { articleId: this.article.Id, comment: this.comment.trim() }
            }));
            this.comment = ''; // Clear the comment input
        }
    }

    // Dispatch bookmark event to parent
    toggleBookmark() {
        this.dispatchEvent(new CustomEvent('bookmark', {
            detail: { articleId: this.article.Id }
        }));
    }

    // Dispatch share event to parent
    shareArticle() {
        this.dispatchEvent(new CustomEvent('share', {
            detail: { articleId: this.article.Id }
        }));
    }
}