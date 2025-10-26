import * as vscode from "vscode";

const LC_PROBLEM_LIST = "https://leetcode.com/api/problems/all/";
const LC_GRAPHQL = "https://leetcode.com/graphql";

async function getSubmittableProblem(langSlug = "python3") {
  const listResponse = await fetch("https://leetcode.com/api/problems/all/");
  const listData: any = await listResponse.json();

  // 1️⃣ Filter to only free problems
  const freeProblems = listData.stat_status_pairs.filter((p: any) => !p.paid_only);

  // 2️⃣ Shuffle list to avoid repeats
  for (let i = 0; i < 10; i++) {
    const random = freeProblems[Math.floor(Math.random() * freeProblems.length)];
    const titleSlug = random.stat.question__title_slug;

    // 3️⃣ Check if submit is enabled
    const submitCheck = await fetch(`https://leetcode.com/problems/${titleSlug}/submit/`, {
      method: "OPTIONS",
    });

    if (submitCheck.ok) {
      console.log("Found submittable problem:", titleSlug);
      return titleSlug;
    }
  }

  vscode.window.showWarningMessage("⚠️ Could not find a submittable problem after 10 tries.");
  return null;
}


export async function getRandomProblemForLanguage(langSlug = "python3", context?: vscode.ExtensionContext) {
  vscode.window.showInformationMessage("🔍 Fetching a random problem...");

  // Get a submittable problem slug
  const titleSlug = await getSubmittableProblem(langSlug);
  if (!titleSlug) {
    vscode.window.showErrorMessage("❌ Could not find any submittable problems.");
    return;
  }

  // Fetch full problem details via GraphQL
  const detailResponse = await fetch("https://leetcode.com/graphql", {
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

  const snippet = question.codeSnippets.find(
    (s: any) => s.langSlug.toLowerCase() === langSlug.toLowerCase()
  );

  if (context) {
    context.globalState.update("lastQuestionSlug", question.titleSlug);
    context.globalState.update("lastQuestionLang", langSlug);
  }

  return {
    id: question.questionId,
    title: question.title,
    slug: question.titleSlug,
    difficulty: question.difficulty,
    content: question.content,
    code: snippet ? snippet.code : "# No starter code available.",
  };
}