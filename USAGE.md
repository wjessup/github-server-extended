# Usage Examples

This document provides examples of how to use the new pull request review comment tools added in this extended GitHub MCP server.

## 1. Get a Pull Request Comment

To get detailed information about a specific pull request review comment:

```javascript
const comment = await mcp.github.get_pull_request_comment({
  comment_id: 2017175895
});

console.log(`Comment by ${comment.user.login}: ${comment.body}`);
console.log(`Path: ${comment.path}, Position: ${comment.position}`);
```

## 2. Reply to a Pull Request Comment

To reply to an existing pull request review comment:

```javascript
const reply = await mcp.github.reply_to_pull_request_comment({
  owner: "Crystal-Market",
  repo: "crystal-market-mvp",
  pull_number: 2137,
  comment_id: 2017175895,
  body: "Thank you for your feedback! I've addressed this issue."
});

console.log(`Reply created with ID: ${reply.id}`);
```

## 3. Resolve a Pull Request Review Thread

### Using a Known Thread ID

If you already have the GraphQL node ID of the review thread:

```javascript
const result = await mcp.github.resolve_pull_request_review_thread({
  thread_id: "MDEwOlB1bGxSZXF1ZXN0UmV2aWV3VGhyZWFkNTk4MjM5NDQ5"
});

console.log(result.message); // "Review thread resolved successfully"
```

### Using a Comment ID

If you have the ID of a comment in the thread you want to resolve:

```javascript
const result = await mcp.github.resolve_pull_request_review_thread({
  owner: "Crystal-Market",
  repo: "crystal-market-mvp",
  pull_number: 2137,
  comment_id: 2017175895
});

console.log(result.message); // "Review thread resolved successfully"
```

## 4. Finding a Thread ID for a Comment

This is useful when you need to find the thread ID for a specific comment:

```javascript
// This is handled internally by resolve_pull_request_review_thread when you provide a comment_id,
// but you can also use it directly:

const result = await findReviewThreadIdForComment({
  owner: "Crystal-Market",
  repo: "crystal-market-mvp",
  pull_number: 2137,
  comment_id: 2017175895
});

console.log(`Thread ID for comment: ${result.thread_id}`);
```

## Common Workflow Example

A common workflow might involve getting a PR comment, replying to it, and then resolving the thread:

```javascript
// 1. Get the comment details
const comment = await mcp.github.get_pull_request_comment({
  comment_id: 2017175895
});

// 2. Reply to the comment
await mcp.github.reply_to_pull_request_comment({
  owner: comment.url.split('/repos/')[1].split('/pulls/')[0].split('/')[0],
  repo: comment.url.split('/repos/')[1].split('/pulls/')[0].split('/')[1],
  pull_number: parseInt(comment.pull_request_url.split('/pulls/')[1]),
  comment_id: comment.id,
  body: "Thank you for your feedback! I've addressed this issue."
});

// 3. Resolve the thread
await mcp.github.resolve_pull_request_review_thread({
  owner: comment.url.split('/repos/')[1].split('/pulls/')[0].split('/')[0],
  repo: comment.url.split('/repos/')[1].split('/pulls/')[0].split('/')[1],
  pull_number: parseInt(comment.pull_request_url.split('/pulls/')[1]),
  comment_id: comment.id
});

console.log("Comment replied to and resolved!");
```