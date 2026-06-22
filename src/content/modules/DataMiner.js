/**
 * Nera Neural Data Miner
 * Extracts deep context from various Facebook post types
 */
export const NeraDataMiner = {
    extract(post, mode = 'POST') {
        if (mode === 'GROUP_CHAT_BADGE') {
            return this._extractGroupChat(post);
        }

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

    _extractGroupChat(post) {
        // Lấy tên nhóm/người từ aria-label của badge
        const ariaLabel = post.getAttribute('aria-label') || '';
        const match = ariaLabel.match(/Mở đoạn chat với (.*)/i);
        const groupName = match ? match[1].trim() : "Unknown Chat";
        
        // Context cơ bản, messages sẽ được trích xuất kỹ hơn nếu chat box đang mở
        let contentContext = `Group Chat / Direct Message with ${groupName}`;
        
        return {
            mode: 'GROUP_CHAT_BADGE',
            type: 'CHAT',
            modality: 'TEXT',
            author: groupName,
            content: contentContext,
            metrics: { reactions: "0", comments: "0" },
            groupName: groupName,
            mediaDescription: null,
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

        // 1. Standard Comet Message Container
        const messageEl = post.querySelector('div[data-ad-comet-preview="message"]') ||
                          post.querySelector('div[data-ad-preview="message"]') ||
                          post.querySelector('div[dir="auto"]');
        
        // 2. Status with Background (Text-over-Background)
        const backgroundPost = post.querySelector('div[style*="background-image"] div[dir="auto"]') ||
                               post.querySelector('div[style*="background-image"] span[dir="auto"]');
        
        let text = (backgroundPost?.innerText || messageEl?.innerText || "").trim();

        // 3. Brute force text extraction for status cards (if still empty)
        if (!text) {
          const largeText = post.querySelector('div[style*="font-size"]');
          if (largeText) text = largeText.innerText;
        }

        if (type === 'SHARED') {
            const sharedMsg = post.querySelector('div[aria-labelledby*="shared_"] div[dir="auto"]')?.innerText;
            if (sharedMsg) text = `[Context]: ${text} \n [Shared Content]: ${sharedMsg}`;
        }

        return text || (modality !== 'TEXT' ? `Visual Post (${modality})` : "Scanning failed: Metadata inaccessible.");
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

    /**
     * Trích xuất lịch sử hội thoại từ Messenger E2EE
     * Dùng kết hợp với NeraMessengerInfiltrator
     * @param {number} limit - Giới hạn số tin nhắn cần lấy
     * @returns {Array<{sender: string, text: string, isMe: boolean, timestamp: string}>}
     */
    extractMessengerChat(limit = 15) {
        const messages = [];
        const articles = document.querySelectorAll('div[role="article"]');

        articles.forEach((article) => {
            try {
                const label = article.getAttribute('aria-label') || '';
                // Format: "Lúc HH:MM [ngày], Bạn: <text>" hoặc "Lúc HH:MM, <Name>: <text>"
                const match = label.match(/Lúc ([^,]+),\s*(.+?):\s*(.+)/s);
                if (!match) return;

                const [, timestamp, senderRaw, textFromLabel] = match;
                const isMe = senderRaw.trim() === 'Bạn';
                const sender = isMe ? 'me' : senderRaw.trim();

                // Ưu tiên text từ DOM (đầy đủ hơn aria-label bị cắt)
                const textEl = article.querySelector('div[dir="auto"]');
                const text = textEl ? textEl.innerText.trim() : textFromLabel.trim();

                // Bỏ qua tin nhắn hệ thống (mã hóa đầu cuối, v.v.)
                const isSystemMsg = article.closest('[data-scope="messages_table"]') === null
                    && !article.querySelector('div[dir="auto"]');
                if (isSystemMsg) return;

                if (text) {
                    messages.push({ sender, text, isMe, timestamp: timestamp.trim() });
                }
            } catch (_) {
                // Bỏ qua các node lỗi
            }
        });

        return messages.slice(-limit);
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
