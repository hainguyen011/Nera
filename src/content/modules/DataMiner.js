/**
 * Nera Neural Data Miner
 * Extracts deep context from various Facebook post types
 */
export const NeraDataMiner = {
    extract(post) {
        const type = this.identifyType(post);
        const modality = this.identifyModality(post);
        
        return {
            type,
            modality,
            author: this.getAuthor(post, type),
            content: this.getContent(post, type, modality),
            metrics: this.getMetrics(post),
            groupName: this.getGroupName(post),
            mediaDescription: this.getMediaAlt(post, modality),
            timestamp: new Date().toLocaleTimeString(),
            pageTitle: document.title
        };
    },

    identifyType(post) {
        if (post.querySelector('[data-ad-rendering-role]')) return 'SPONSORED';
        if (post.querySelector('i[class*="x1vjfegm"]')) return 'SHARED'; // Shared icon heuristic
        if (post.querySelector('a[href*="/groups/"]')) return 'GROUP';
        return 'ORGANIC';
    },

    identifyModality(post) {
        if (post.querySelector('video')) return 'VIDEO';
        if (post.querySelector('a[href*="l.facebook.com/l.php"]')) return 'LINK';
        if (post.querySelector('img')) return 'IMAGE';
        return 'TEXT';
    },

    getAuthor(post, type) {
        if (type === 'SPONSORED') {
            return post.querySelector('h2 a span')?.innerText || 
                   post.querySelector('strong span')?.innerText || "Sponsored Brand";
        }
        return post.querySelector('h2 span a')?.innerText || 
               post.querySelector('h3 span a')?.innerText || "Anonymous User";
    },

    getContent(post, type, modality) {
        // Main message container for Facebook Comet
        const messageEl = post.querySelector('div[data-ad-comet-preview="message"]') ||
                          post.querySelector('div[dir="auto"]');
        
        let text = messageEl?.innerText || "";

        if (type === 'SHARED') {
            const sharedMsg = post.querySelector('div[aria-labelledby*="shared_"] div[dir="auto"]')?.innerText;
            if (sharedMsg) text = `[Shared context]: ${text} \n [Original content]: ${sharedMsg}`;
        }

        return text || (modality !== 'TEXT' ? `Media post (${modality})` : "No text content found.");
    },

    getMetrics(post) {
        const reactions = post.querySelector('span[data-ad-comet-preview="reaction_count"]') ||
                          post.querySelector('span.x1e55887'); // FB Comet reactions class
        
        // Find comment count near the comment icon
        const commentCount = post.querySelector('i[style*="background-position: 0px -487px"]')?.parentElement?.querySelector('span')?.innerText || 
                             post.querySelector('div[aria-label*="bình luận"]')?.innerText || "0";

        return {
            reactions: reactions?.innerText || "0",
            comments: commentCount
        };
    },

    getGroupName(post) {
        const groupLink = post.querySelector('a[href*="/groups/"]');
        return groupLink?.innerText || null;
    },

    getMediaAlt(post, modality) {
        if (modality === 'IMAGE') {
            const img = post.querySelector('img');
            return img?.getAttribute('alt') || "No visual description available.";
        }
        if (modality === 'VIDEO') {
            return "Video content detected.";
        }
        return null;
    }
};
