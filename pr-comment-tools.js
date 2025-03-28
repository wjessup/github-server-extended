/**
 * Extended GitHub MCP Server tools for pull request review comments
 * 
 * These tools provide functionality to:
 * 1. Get a specific PR review comment
 * 2. Reply to a PR review comment
 * 3. Resolve a PR review thread
 */

const { Octokit } = require('@octokit/rest');
const { graphql } = require('@octokit/graphql');

// Initialize the Octokit client with the GitHub token
const octokit = new Octokit({
  auth: process.env.GITHUB_PERSONAL_ACCESS_TOKEN
});

// Initialize the GraphQL client with the GitHub token
const graphqlWithAuth = graphql.defaults({
  headers: {
    authorization: `token ${process.env.GITHUB_PERSONAL_ACCESS_TOKEN}`
  }
});

/**
 * Tool 1: Get a specific pull request review comment
 */
async function getPullRequestComment(params) {
  const { comment_id } = params;

  try {
    const response = await octokit.pulls.getReviewComment({
      comment_id: comment_id
    });

    return response.data;
  } catch (error) {
    throw new Error(`Failed to get pull request comment: ${error.message}`);
  }
}

/**
 * Tool 2: Reply to a pull request review comment
 */
async function replyToPullRequestComment(params) {
  const { owner, repo, pull_number, comment_id, body } = params;

  try {
    const response = await octokit.pulls.createReplyForReviewComment({
      owner,
      repo,
      pull_number,
      comment_id,
      body
    });

    return response.data;
  } catch (error) {
    throw new Error(`Failed to reply to pull request comment: ${error.message}`);
  }
}

/**
 * Tool 3: Resolve a pull request review thread
 * 
 * Note: This requires the GitHub GraphQL API as this functionality
 * is not available through the REST API.
 */
async function resolvePullRequestReviewThread(params) {
  const { thread_id } = params;

  try {
    const response = await graphqlWithAuth(`
      mutation ResolveReviewThread($input: ResolveReviewThreadInput!) {
        resolveReviewThread(input: $input) {
          thread {
            id
            isResolved
          }
        }
      }
    `, {
      input: {
        threadId: thread_id
      }
    });

    return {
      success: true,
      message: "Review thread resolved successfully",
      thread: response.resolveReviewThread.thread
    };
  } catch (error) {
    throw new Error(`Failed to resolve pull request review thread: ${error.message}`);
  }
}

/**
 * Helper function to find the thread ID for a specific comment
 * 
 * This can be used to find the thread ID needed for the resolve function
 */
async function findReviewThreadIdForComment(params) {
  const { owner, repo, pull_number, comment_id } = params;

  try {
    // First get the comment to ensure it exists and get its database ID
    const comment = await getPullRequestComment({ comment_id });
    
    // Now query for all review threads on this PR and find the one containing this comment
    const response = await graphqlWithAuth(`
      query FindThreadForComment($owner: String!, $repo: String!, $pullNumber: Int!) {
        repository(owner: $owner, name: $repo) {
          pullRequest(number: $pullNumber) {
            reviewThreads(first: 100) {
              nodes {
                id
                comments(first: 10) {
                  nodes {
                    databaseId
                  }
                }
              }
            }
          }
        }
      }
    `, {
      owner,
      repo,
      pullNumber: pull_number
    });

    const threads = response.repository.pullRequest.reviewThreads.nodes;
    const targetThread = threads.find(thread => 
      thread.comments.nodes.some(c => c.databaseId === comment_id)
    );

    if (!targetThread) {
      throw new Error(`Could not find review thread containing comment ID ${comment_id}`);
    }

    return {
      thread_id: targetThread.id,
      message: "Thread ID found successfully"
    };
  } catch (error) {
    throw new Error(`Failed to find review thread ID: ${error.message}`);
  }
}

module.exports = {
  getPullRequestComment,
  replyToPullRequestComment,
  resolvePullRequestReviewThread,
  findReviewThreadIdForComment
};