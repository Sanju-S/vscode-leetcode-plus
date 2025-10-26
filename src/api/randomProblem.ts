import * as vscode from "vscode";

const LC_PROBLEM_LIST = "https://leetcode.com/api/problems/all/";
const LC_GRAPHQL = "https://leetcode.com/graphql";

/**
 * Fetches a random free LeetCode problem and returns the Python3 starter code.
 */
export async function getRandomProblemForLanguage(langSlug = "python3") {
  vscode.window.showInformationMessage("🔍 Fetching a random problem from LeetCode...");

  // Step 1: Fetch all problems
  const listResponse = await fetch(LC_PROBLEM_LIST);
  const listData: any = await listResponse.json();

  // Filter only free problems
  const freeProblems = listData.stat_status_pairs.filter((p: any) => !p.paid_only);
  const random = freeProblems[Math.floor(Math.random() * freeProblems.length)];
  const titleSlug = random.stat.question__title_slug;

  // Step 2: Fetch full problem detail
  const detailResponse = await fetch(LC_GRAPHQL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        query questionData($titleSlug: String!) {
          question(titleSlug: $titleSlug) {
            questionId
            title
            titleSlug
            difficulty
            content
            codeSnippets {
              lang
              langSlug
              code
            }
          }
        }
      `,
      variables: { titleSlug },
    }),
  });

  const detailData: any = await detailResponse.json();
  const question = detailData.data.question;

  if (!question) {
    vscode.window.showErrorMessage("❌ Failed to load problem details.");
    return;
  }

  // Step 3: Extract starter code for Python3 (or chosen language)
  const snippet = question.codeSnippets.find(
    (s: any) => s.langSlug.toLowerCase() === langSlug.toLowerCase()
  );

  const code = snippet ? snippet.code : "# No starter code available for this language.";

  // Step 4: Show in VS Code editor
  const doc = await vscode.workspace.openTextDocument({
    content: code,
    language: "python",
  });
  await vscode.window.showTextDocument(doc);

  vscode.window.showInformationMessage(
    `🎯 ${question.title} (${question.difficulty}) fetched successfully!`
  );
}
