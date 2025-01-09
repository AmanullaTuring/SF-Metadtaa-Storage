import { LightningElement, track } from 'lwc';
import fetchArticles from '@salesforce/apex/ArticleController.fetchArticles';
import likeArticle from '@salesforce/apex/ArticleController.likeArticle';
import addComment from '@salesforce/apex/ArticleController.addComment';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class NewsFeed extends LightningElement {
    @track articles = []; // Full list of articles
    @track filteredArticles = []; // Filtered articles for search
    @track trendingArticles = []; // Top liked articles
    @track isLoading = true; // Loading spinner state
    @track totalLikes = 0; // Total likes across articles
    @track totalComments = 0; // Total comments across articles
    @track showBookmarkedOnly = false; // Whether to show only bookmarked articles

    // Lifecycle method to fetch articles on component load
    connectedCallback() {
        this.loadArticles();
    }

    /**
     * Fetch articles from the server and initialize data.
     */
    loadArticles() {
        this.isLoading = true;
        fetchArticles()
            .then(result => {
                this.articles = result.map(article => ({
                    Id: article.Id,
                    title: article.Name,
                    likes: article.Likes__c || 0,
                    comments: article.Comments__c ? article.Comments__c.split('\n') : [],
                    isBookmarked: false // Initialize bookmarks
                }));
                this.filteredArticles = [...this.articles];
                this.updateTrendingArticles();
                this.updateEngagementSummary();
                this.isLoading = false;
            })
            .catch(() => {
                this.showToast('Error', 'Error fetching articles.', 'error');
                this.isLoading = false;
            });
    }

    /**
     * Handle 'like' event and update the likes count.
     */
    handleLike(event) {
        likeArticle({ articleId: event.detail.articleId })
            .then(() => {
                const updatedArticles = this.articles.map(article => {
                    if (article.Id === event.detail.articleId) article.likes += 1;
                    return article;
                });
                this.articles = updatedArticles;
                this.filteredArticles = [...this.articles];
                this.updateTrendingArticles();
                this.updateEngagementSummary();
            })
            .catch(() => this.showToast('Error', 'Unable to like the article.', 'error'));
    }

    /**
     * Handle 'comment' event and update the comments list.
     */
    handleComment(event) {
        addComment({ articleId: event.detail.articleId, comment: event.detail.comment })
            .then(() => {
                const updatedArticles = this.articles.map(article => {
                    if (article.Id === event.detail.articleId) article.comments.push(event.detail.comment);
                    return article;
                });
                this.articles = updatedArticles;
                this.filteredArticles = [...this.articles];
                this.updateEngagementSummary();
            })
            .catch(() => this.showToast('Error', 'Unable to add comment.', 'error'));
    }

    /**
     * Handle search input and filter articles dynamically.
     */
    handleSearch(event) {
        const searchTerm = event.target.value.toLowerCase();
        this.filteredArticles = this.articles.filter(article =>
            article.title.toLowerCase().includes(searchTerm)
        );
    }

    /**
     * Handle bookmark toggle for articles.
     */
    handleBookmark(event) {
        this.articles = this.articles.map(article => {
            if (article.Id === event.detail.articleId) {
                article.isBookmarked = !article.isBookmarked;
            }
            return article;
        });
        this.filteredArticles = this.showBookmarkedOnly
            ? this.articles.filter(article => article.isBookmarked)
            : [...this.articles];
    }

    /**
     * Handle share event and copy article URL to clipboard.
     */
    handleShare(event) {
        const articleId = event.detail.articleId;
        const url = `${window.location.origin}/article/${articleId}`;
        navigator.clipboard.writeText(url).then(() => {
            this.showToast('Success', 'Article URL copied to clipboard.', 'success');
        });
    }

    /**
     * Toggle display of only bookmarked articles.
     */
    toggleBookmarks() {
        this.showBookmarkedOnly = !this.showBookmarkedOnly;
        this.filteredArticles = this.showBookmarkedOnly
            ? this.articles.filter(article => article.isBookmarked)
            : [...this.articles];
    }

    /**
     * Update the trending articles based on like counts.
     */
    updateTrendingArticles() {
        this.trendingArticles = [...this.articles]
            .sort((a, b) => b.likes - a.likes)
            .slice(0, 3);
    }

    /**
     * Update engagement summary (total likes and comments).
     */
    updateEngagementSummary() {
        this.totalLikes = this.articles.reduce((sum, article) => sum + article.likes, 0);
        this.totalComments = this.articles.reduce((sum, article) => sum + article.comments.length, 0);
    }

    /**
     * Display a toast notification.
     */
    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }
}