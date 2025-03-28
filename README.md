# GitHub MCP Server Extended

Extended GitHub MCP Server with additional tools for pull request review comment functionality.

## New Pull Request Review Comment Tools

In addition to the standard GitHub MCP Server tools, this extended version includes three new tools for working with pull request review comments:

### 1. `get_pull_request_comment`
   - Get detailed information about a specific pull request review comment
   - Inputs:
     - `comment_id` (number): The ID of the pull request review comment to fetch
   - Returns: Detailed information about the specified pull request review comment

### 2. `reply_to_pull_request_comment`
   - Add a reply to a specific pull request review comment
   - Inputs:
     - `owner` (string): Repository owner (username or organization)
     - `repo` (string): Repository name
     - `pull_number` (number): Pull request number
     - `comment_id` (number): The ID of the comment to reply to
     - `body` (string): The text content of the reply
   - Returns: Details of the created reply comment

### 3. `resolve_pull_request_review_thread`
   - Mark a pull request review thread as resolved
   - Inputs:
     - `owner` (string): Repository owner (username or organization)
     - `repo` (string): Repository name
     - `pull_number` (number): Pull request number
     - `thread_id` (string): The GraphQL node ID of the review thread to resolve
   - Returns: Success status and a confirmation message

## Usage Notes

### Finding a Thread ID for Resolution

The `thread_id` parameter required for the `resolve_pull_request_review_thread` tool is a GraphQL node ID that is not directly available through the REST API. To obtain this ID, you'll need to:

1. Fetch the pull request review threads using GraphQL
2. Identify the thread that contains the comment you want to resolve
3. Extract the thread ID from the GraphQL response

For example, using a GraphQL query like this:

```graphql
{
  repository(owner: "OWNER", name: "REPO") {
    pullRequest(number: PULL_NUMBER) {
      reviewThreads(first: 100) {
        nodes {
          id
          comments(first: 10) {
            nodes {
              id
              databaseId
              body
            }
          }
        }
      }
    }
  }
}
```

You can then search through the returned threads to find the one containing the comment with your target `comment_id` and extract the thread's `id` value.

## Implementation Details

The `get_pull_request_comment` and `reply_to_pull_request_comment` tools use the GitHub REST API, while the `resolve_pull_request_review_thread` tool uses the GitHub GraphQL API.

This extended server requires the same GitHub Personal Access Token permissions as the standard GitHub MCP Server, with the token having the `repo` scope for private repositories or `public_repo` scope for public repositories.