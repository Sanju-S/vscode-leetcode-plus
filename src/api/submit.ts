import * as vscode from "vscode";

export async function submitSolution(
  context: vscode.ExtensionContext,
  questionId: string,
  questionSlug: string,
  langSlug: string,
  code: string
) {
  const session = await context.secrets.get("leetcode_session");
  const csrftoken = await context.secrets.get("leetcode_csrftoken");

  if (!session || !csrftoken) {
    vscode.window.showErrorMessage("⚠️ Please set your LeetCode session first.");
    return;
  }

  try {
    const submitUrl = `https://leetcode.com/problems/${questionSlug}/submit/`;

    const submitResponse = await fetch(submitUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Referer": `https://leetcode.com/problems/${questionSlug}/`,
        "Origin": "https://leetcode.com",
        "Cookie": `LEETCODE_SESSION=${session}; csrftoken=${csrftoken}`,
        "x-csrftoken": csrftoken,
      },
      body: JSON.stringify({
        question_id: questionId, // ✅ Added
        lang: langSlug,
        typed_code: code,
      }),
    });

    const text = await submitResponse.text();
    let submitData: any;

    try {
      submitData = JSON.parse(text);
    } catch {
      vscode.window.showErrorMessage("❌ LeetCode returned non-JSON response.");
      console.log("Raw Response:", text);
      return;
    }

    if (!submitData.submission_id) {
      vscode.window.showErrorMessage("❌ Failed to submit. See console for details.");
      console.log("Submit Response:", submitData);
      return;
    }

    vscode.window.showInformationMessage(`🚀 Submitted! ID: ${submitData.submission_id}`);

    // Poll for result
    const checkUrl = `https://leetcode.com/submissions/detail/${submitData.submission_id}/check/`;
    let result: any = null;

    for (let i = 0; i < 15; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      const checkResponse = await fetch(checkUrl, {
        headers: {
          "Referer": "https://leetcode.com",
          "Cookie": `LEETCODE_SESSION=${session}; csrftoken=${csrftoken}`,
          "x-csrftoken": csrftoken,
        },
      });

      const json: any = await checkResponse.json();
      if (json.state !== "PENDING" && json.state !== "STARTED") {
        result = json;
        break;
      }
    }

    if (!result) {
      vscode.window.showWarningMessage("⚠️ Submission timed out.");
      return;
    }

    vscode.window.showInformationMessage(
      `💡 ${result.status_msg} | Runtime: ${result.status_runtime || "?"}, Memory: ${result.status_memory || "?"}`
    );
  } catch (err: any) {
    vscode.window.showErrorMessage(`❌ Submission failed: ${err.message}`);
    console.error(err);
  }
}
