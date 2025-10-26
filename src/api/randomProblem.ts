import * as vscode from "vscode";

const LC_PROBLEM_LIST = "https://leetcode.com/api/problems/all/";
const LC_GRAPHQL = "https://leetcode.com/graphql";

export async function getRandomProblemForLanguage(langSlug = "python3") {
  vscode.window.showInformationMessage("🔍 Fetching a random problem...");

  const listResponse = await fetch(LC_PROBLEM_LIST);
  const listData: any = await listResponse.json();
  const freeProblems = listData.stat_status_pairs.filter((p: any) => !p.paid_only);

  const random = freeProblems[Math.floor(Math.random() * freeProblems.length)];
  const titleSlug = random.stat.question__title_slug;

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

  const snippet = question.codeSnippets.find(
    (s: any) => s.langSlug.toLowerCase() === langSlug.toLowerCase()
  );

  return {
    title: question.title,
    difficulty: question.difficulty,
    content: question.content,
    code: snippet ? snippet.code : "# No starter code available.",
  };
}
