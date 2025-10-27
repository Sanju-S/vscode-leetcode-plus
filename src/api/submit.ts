import * as vscode from "vscode";
import { updateResultsPanel, SubmissionResult } from "../ui/resultsPanel";

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
        question_id: questionId,
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

    // After you get submitData.submission_id
    const submissionId = submitData.submission_id;
    const checkUrl = `https://leetcode.com/submissions/detail/${submissionId}/check/`;

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

      const json = await checkResponse.json();
      result = json;

      // Update WebView each poll
      updateResultsPanel(
        {
          status_msg: result.status_msg || result.state || "Waiting...",
          status_runtime: result.status_runtime,
          status_memory: result.status_memory,
          code_output: result.code_output,
          expected_output: result.expected_output,
          std_output: result.std_output,
          input: result.input,
          state: result.state,
        },
        false
      );

      if (result.state !== "PENDING" && result.state !== "STARTED") {break;}
    }

    // Final update
    updateResultsPanel(
      {
        status_msg: result.status_msg,
        status_runtime: result.status_runtime,
        status_memory: result.status_memory,
        code_output: result.code_output,
        expected_output: result.expected_output,
        std_output: result.std_output,
        input: result.input,
        state: result.state,
      },
      true
    );
  } catch (err: any) {
    vscode.window.showErrorMessage(`❌ Submission failed: ${err.message}`);
    console.error(err);
  }
}
