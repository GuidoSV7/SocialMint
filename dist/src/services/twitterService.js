import mockData from '@/mocks/twitter-mock.json';
async function extractHashtagsAndMentionsFromTweets(data) {
    const results = [];
    try {
        const timeline = mockData.data.user_result.result.timeline_response.timeline;
        const addEntriesInstructions = timeline.instructions.filter((instruction) => instruction.__typename === 'TimelineAddEntries');
        addEntriesInstructions.forEach((instruction) => {
            if (!instruction.entries)
                return;
            instruction.entries.forEach((entry, index) => {
                try {
                    if (entry.content?.__typename === 'TimelineTimelineItem' &&
                        entry.content.content?.__typename === 'TimelineTweet') {
                        const tweetResult = entry.content.content.tweetResult?.result;
                        if (tweetResult?.__typename === 'Tweet' && tweetResult.legacy?.full_text) {
                            const text = tweetResult.legacy.full_text;
                            // Extract hashtags and mentions for this tweet
                            const matches = text.match(/[#@]\w+/g);
                            // Push array for this tweet (empty array if no matches)
                            results.push(matches || []);
                        }
                    }
                }
                catch (entryError) {
                    console.warn(`Error procesando entrada ${index}:`, entryError);
                    // Push empty array for failed tweets
                    results.push([]);
                }
            });
        });
    }
    catch (error) {
        console.error('Error accediendo a los full_text:', error);
    }
    return results;
}
/**
     * Check if the event tags are present in the tweets.
     * @param handler Username of the user to check.
     * @param eventTags An object with the tags of the event.
     */
export async function checkHashtagsAndMentions(handler, eventTags) {
    try {
        // Get all tweets with their hashtags
        const entriesTags = await extractHashtagsAndMentionsFromTweets(mockData);
        // Normalize event tags 
        const normalizedEventTags = eventTags.map(tag => tag.toLowerCase());
        // Check if at least one tweet contains all required tags
        return entriesTags.some(tweetTags => {
            // Normalize tweet tags (remove # and convert to lowercase)
            const normalizedTweetTags = tweetTags.map(tag => tag.toLowerCase());
            // Check if all event tags are present in this tweet
            return normalizedEventTags.every(eventTag => normalizedTweetTags.includes(eventTag));
        });
    }
    catch (error) {
        console.error('Error checking hashtags:', error);
        return false;
    }
}
