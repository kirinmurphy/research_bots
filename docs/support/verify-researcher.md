# Verify the researcher in Studio

Checks that the researcher's identity shapes its answers. Save the results in the [smoke-test record](../smoke-tests/knowledge-researcher-studio.md).

1. Run `npm run dev` and open the Knowledge Researcher in Studio.
2. Submit this prompt in a new thread:

   ```text
   A video claims that Mastra workflows replace the need for a job queue. Assess this claim.
   ```

3. Record the date, Mastra version, model string, a response excerpt, and the trace ID from **Traces**.
4. Change one rule in `AGENT.md`, restart `npm run dev`, submit the same prompt in a new thread, and record how the response changed.

Use a configured provider key and model; these steps make real model calls. Restore the original rule and restart Studio after the comparison if the edit was only for this check.

Passing means the changed rule is reflected in the second response and both runs have trace evidence. A response difference alone does not prove the rule caused it: model answers can vary. The [record](../smoke-tests/knowledge-researcher-studio.md) distinguishes completed checks from checks still waiting for a live run.

[Back to the README](../../README.md)
