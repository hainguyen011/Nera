/**
 * Nera Neural Data Miner
 * Extracts deep context from various Facebook post types
 */
export const NeraDataMiner = {
    extract(post, mode = 'POST') {
        const type = this.identifyType(post);
        const modality = this.identifyModality(post);
        
        return {
            mode,
            type,
            modality,
            author: this.getAuthor(post, type, mode),
            content: this.getContent(post, type, modality, mode),
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

    getAuthor(post, type, mode = 'POST') {
        if (mode === 'COMMENT') {
            // Priority: Link text > Strong text > aria-label
            const authorLink = post.querySelector('a[role="link"] span') || 
                               post.querySelector('div[dir="auto"] strong') ||
                               post.querySelector('h3 a') ||
                               post.querySelector('a[href*="facebook.com"]');
            
            if (authorLink) return authorLink.innerText.trim();
            
            // Fallback: aria-label extraction
            const article = post.closest('div[role="article"]');
            if (article) {
                const label = article.getAttribute('aria-label') || "";
                const match = label.match(/bình luận của (.*?) vào/i) || label.match(/Comment by (.*?) on/i);
                if (match) return match[1].trim();
            }

            return "Commenter";
        }
        if (type === 'SPONSORED') {
            return post.querySelector('h2 a span')?.innerText || 
                   post.querySelector('strong span')?.innerText || 
                   post.querySelector('a[role="link"]')?.innerText || "Sponsored Brand";
        }
        return post.querySelector('h2 span a')?.innerText || 
               post.querySelector('h3 span a')?.innerText || 
               post.querySelector('h2 a')?.innerText ||
               post.querySelector('h3 a')?.innerText || "Anonymous User";
    },

    getContent(post, type, modality, mode = 'POST') {
        if (mode === 'COMMENT') {
            // Target the actual comment text block, avoiding sub-replies or metadata
            const commentBody = post.querySelector('div[dir="auto"][style*="text-align"]') ||
                                post.querySelector('div[dir="auto"] > span') ||
                                post.querySelector('div[style*="font-size: 13px"]') ||
                                post.querySelector('div[lang]');
            
            if (commentBody) return commentBody.innerText.trim();
            
            // Extreme Fallback: Text content of the post minus metadata
            const clone = post.cloneNode(true);
            const metadata = clone.querySelectorAll('ul, [role="button"], span[style*="font-size: 12px"]');
            metadata.forEach(m => m.remove());
            return clone.innerText.trim().split('\n')[0];
        }

        // 1. Story Message / Ad Rendering Role (Extremely stable for Facebook posts)
        const storyMessageEl = post.querySelector('[data-ad-rendering-role="story_message"]');
        if (storyMessageEl) {
            try {
                const clone = storyMessageEl.cloneNode(true);
                clone.querySelectorAll('[aria-hidden="true"]').forEach(el => el.remove());
                const text = clone.innerText.trim();
                if (text) return text;
            } catch (e) {
                console.error("Nera DataMiner: Story message extraction failed", e);
            }
        }

        // 2. Standard Comet Message Container (FB standard content)
        const messageEl = post.querySelector('div[data-ad-comet-preview="message"]') ||
                          post.querySelector('div[data-ad-preview="message"]');
        if (messageEl) {
            const text = messageEl.innerText.trim();
            if (text) return text;
        }
        
        // 2. Status with Background (Text-over-Background or Solid Background)
        const backgroundPost = post.querySelector('div[style*="background-image"] div[dir="auto"]') ||
                               post.querySelector('div[style*="background-image"] span[dir="auto"]') ||
                               post.querySelector('div[style*="background"] div[dir="auto"]') ||
                               post.querySelector('div[style*="background-color"] div[dir="auto"]');
        if (backgroundPost) {
            const text = backgroundPost.innerText.trim();
            if (text) return text;
        }

        // 3. Brute force text extraction for status cards (Clone & strip headers/footers)
        try {
            const clone = post.cloneNode(true);
            // Remove header elements
            const headers = clone.querySelectorAll('h2, h3, h4, [role="heading"], a[role="link"], [data-ad-rendering-role="profile_name"]');
            headers.forEach(h => h.remove());

            // Remove footer, buttons, and form inputs
            const footers = clone.querySelectorAll('[role="toolbar"], [aria-label*="Bình luận"], [aria-label*="Comment"], [role="button"], form, input, textarea, .nera-control');
            footers.forEach(f => f.remove());

            const text = clone.innerText.trim();
            if (text && text.length > 5) {
                return text;
            }
        } catch (e) {
            console.error("Nera DataMiner: Brute-force extraction failed", e);
        }

        // 4. Ultimate Fallback: First long dir="auto" that is not the author's name
        const author = this.getAuthor(post, type, mode);
        const allDirAuto = Array.from(post.querySelectorAll('div[dir="auto"], span[dir="auto"]'));
        for (const el of allDirAuto) {
            const t = el.innerText.trim();
            if (t && t !== author && !t.includes("Theo dõi") && !t.includes("Follow") && t.length > 10) {
                return t;
            }
        }

        if (type === 'SHARED') {
            const sharedMsg = post.querySelector('div[aria-labelledby*="shared_"] div[dir="auto"]')?.innerText;
            if (sharedMsg) return `[Shared Content]: ${sharedMsg}`;
        }

        return modality !== 'TEXT' ? `Visual Post (${modality})` : "Scanning failed: Metadata inaccessible.";
    },

    getMetrics(post) {
        const reactions = post.querySelector('span[data-ad-comet-preview="reaction_count"]') ||
                          post.querySelector('span.x1e55887'); // FB Comet reactions class
        
        // Find comment count near the comment icon
        const commentCount = post.querySelector('i[style*="background-position: 0px -487px"]')?.parentElement?.querySelector('span')?.innerText || 
                             post.querySelector('div[aria-label*="bình luận"]')?.innerText || "0";

        return {
            reactions: reactions?.innerText || "0",
            comments: commentCount || "0"
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
