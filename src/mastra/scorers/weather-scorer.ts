import { z } from "zod";
import { createToolCallAccuracyScorerCode } from "@mastra/evals/scorers/code";
import { createCompletenessScorer } from "@mastra/evals/scorers/code";
import { createScorer } from "@mastra/core/scores";

export const toolCallAppropriatenessScorer = createToolCallAccuracyScorerCode({
  expectedTool: "weatherTool",
  strictMode: false,
});

export const completenessScorer = createCompletenessScorer();

// Custom LLM-judged scorer: evaluates if non-English locations are translated appropriately
// Note: Temporarily simplified to avoid DeepSeek API json_schema compatibility issues
// This is a basic rule-based scorer. For full LLM evaluation, consider using a model that supports json_schema
export const translationScorer = createScorer({
  name: "Translation Quality",
  description:
    "Checks that non-English location names are translated and used correctly",
  type: "agent",
})
  .preprocess(({ run }) => {
    const userText = (run.input?.inputMessages?.[0]?.content as string) || "";
    const assistantText = (run.output?.[0]?.content as string) || "";
    return { userText, assistantText };
  })
  .generateScore(({ results }) => {
    const { userText, assistantText } = results.preprocessStepResult as { userText: string; assistantText: string };
    
    // Simple rule-based check: if no non-English characters detected, return full score
    const hasNonEnglishChars = /[^\x00-\x7F]/.test(userText);
    if (!hasNonEnglishChars) {
      return 1; // Not applicable, full credit
    }

    // Basic check: if assistant response contains the same non-English characters, 
    // it might not have been translated (simplified check)
    // In a real scenario, this would require more sophisticated language detection
    const assistantHasSameChars = /[^\x00-\x7F]/.test(assistantText);
    
    // If assistant response doesn't have non-English chars, assume translation was attempted
    // This is a simplified heuristic - for accurate evaluation, use LLM with proper json_object support
    if (!assistantHasSameChars) {
      return 0.8; // Likely translated
    }
    
    return 0.3; // May not be translated properly
  })
  .generateReason(({ results, score }) => {
    const { userText, assistantText } = results.preprocessStepResult as { userText: string; assistantText: string };
    const hasNonEnglishChars = /[^\x00-\x7F]/.test(userText);
    
    if (!hasNonEnglishChars) {
      return `Translation scoring: No non-English characters detected. Score=${score}`;
    }
    
    return `Translation scoring: Non-English characters detected. Score=${score} (simplified rule-based evaluation)`;
  });

export const scorers = {
  toolCallAppropriatenessScorer,
  completenessScorer,
  translationScorer,
};
