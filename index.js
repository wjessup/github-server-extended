/**
 * Extended GitHub MCP Server
 * 
 * This server extends the standard GitHub MCP Server with additional
 * tools for working with pull request review comments.
 */

const { startServer } = require('@modelcontextprotocol/server-github');
const {
  getPullRequestComment,
  replyToPullRequestComment,
  resolvePullRequestReviewThread,
  findReviewThreadIdForComment
} = require('./pr-comment-tools');

// The additional tools we're adding to the server
const additionalTools = {
  // Get a specific PR review comment
  get_pull_request_comment: async (params) => {
    const { comment_id } = params;
    
    if (!comment_id) {
      throw new Error("Missing required parameter: comment_id");
    }
    
    return await getPullRequestComment({ comment_id });
  },
  
  // Reply to a specific PR review comment
  reply_to_pull_request_comment: async (params) => {
    const { owner, repo, pull_number, comment_id, body } = params;
    
    if (!owner) throw new Error("Missing required parameter: owner");
    if (!repo) throw new Error("Missing required parameter: repo");
    if (!pull_number) throw new Error("Missing required parameter: pull_number");
    if (!comment_id) throw new Error("Missing required parameter: comment_id");
    if (!body) throw new Error("Missing required parameter: body");
    
    return await replyToPullRequestComment({
      owner,
      repo,
      pull_number,
      comment_id,
      body
    });
  },
  
  // Resolve a PR review thread
  resolve_pull_request_review_thread: async (params) => {
    const { owner, repo, pull_number, thread_id, comment_id } = params;
    
    // If thread_id is provided, use it directly
    if (thread_id) {
      return await resolvePullRequestReviewThread({ thread_id });
    }
    
    // If comment_id is provided, first find the thread_id
    if (comment_id) {
      if (!owner) throw new Error("Missing required parameter: owner");
      if (!repo) throw new Error("Missing required parameter: repo");
      if (!pull_number) throw new Error("Missing required parameter: pull_number");
      
      const threadInfo = await findReviewThreadIdForComment({
        owner,
        repo,
        pull_number,
        comment_id
      });
      
      return await resolvePullRequestReviewThread({
        thread_id: threadInfo.thread_id
      });
    }
    
    throw new Error("Either thread_id or comment_id must be provided");
  }
};

// Start the MCP server with our additional tools
const server = startServer({
  additionalTools
});

// Log that the server is running
console.log('Extended GitHub MCP Server is running');

// Export the server for potential programmatic use
module.exports = server;