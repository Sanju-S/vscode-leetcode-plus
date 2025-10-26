import * as vscode from "vscode";
import { SUPPORTED_LANGUAGES } from "../config/languages";

const LC_PROBLEM_LIST = "https://leetcode.com/api/problems/all/";
const LC_GRAPHQL = "https://leetcode.com/graphql";

async function getSubmittableProblem(langSlug = "python3") {
  const listResponse = await fetch("https://leetcode.com/api/problems/all/");
  const listData: any = await listResponse.json();

  // Filter to only free problems
  const freeProblems = listData.stat_status_pairs.filter((p: any) => !p.paid_only);

  // Shuffle list to avoid repeats
  for (let i = 0; i < 10; i++) {
    const random = freeProblems[Math.floor(Math.random() * freeProblems.length)];
    const titleSlug = random.stat.question__title_slug;

    // Check if submit is enabled
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


export async function getRandomProblemForLanguage(lang: string, context: vscode.ExtensionContext) {
  // Step 1: Check for saved preferred language
  let langSlug: any = context.globalState.get("preferredLanguage") as string | undefined;

  // Step 2: If not found, ask the user
  if (!langSlug) {
    const selection = await vscode.window.showQuickPick(
      SUPPORTED_LANGUAGES.map((l) => l.label),
      {
        placeHolder: "Select your preferred programming language",
        ignoreFocusOut: true,
      }
    );

    if (!selection) {
      vscode.window.showWarningMessage("No language selected — cancelling request.");
      return;
    }

    const chosen = SUPPORTED_LANGUAGES.find((l) => l.label === selection);
    if (!chosen) return;

    langSlug = chosen.slug;
    await context.globalState.update("preferredLanguage", langSlug);
    vscode.window.showInformationMessage(`🌐 Language set to ${selection}.`);
  }

  vscode.window.showInformationMessage(`🎯 Fetching a random problem for ${langSlug}...`);

  // Step 3: Fetch a submittable problem
  const titleSlug = await getSubmittableProblem();
  if (!titleSlug) {
    vscode.window.showErrorMessage("❌ Could not find any submittable problems.");
    return;
  }

  // Step 4: Fetch details from GraphQL
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

  // Save the last problem data
  context.globalState.update("lastQuestionSlug", question.titleSlug);
  context.globalState.update("lastQuestionId", question.questionId);
  context.globalState.update("lastQuestionLang", langSlug);

  return {
    title: question.title,
    slug: question.titleSlug,
    id: question.questionId,
    difficulty: question.difficulty,
    content: question.content,
    code: snippet ? snippet.code : "# No starter code available.",
    lang: langSlug,
  };
}