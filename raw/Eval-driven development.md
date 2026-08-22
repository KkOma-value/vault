---
title: "Eval-driven development"
source: "https://firebase.blog/posts/2026/08/eval-driven-development-agent-skills"
author:
  - "[[Charlotte Liang]]"
published: 2026-08-11
created: 2026-08-19
description: "How we build better agent skills for Firebase"
tags:
  - "clippings"
---
Earlier this year, we introduced [Firebase Agent Skills](https://firebase.google.com/docs/ai-assistance/agent-skills) —our way of giving AI agents the structured cheat sheets they need to write better Firebase code. Our agent skills help coding agents navigate Firebase’s latest APIs, avoid deprecated features, and follow our best practices.

### The agentic toolkit: CLI, MCP servers, and skills

Skills don’t operate in a vacuum - they need great tools as well. We provide two types of tools for agents to use: the [Firebase CLI](https://firebase.google.com/docs/cli) and the [MCP servers](https://firebase.google.com/docs/ai-assistance/mcp-server).

- CLIs are loved by AI agents for their straightforward execution and terminal-based workflows.
- MCP servers are “agent friendly” because of the explicit tool definitions that let agents understand exactly what a tool does and what arguments it requires.

So, where do agent skills fit into this picture? Skills are the conductor that orchestrates everything together. To get more accurate results, we recommend developers enable and install both the [Firebase Agent Skills](https://firebase.google.com/docs/ai-assistance/agent-skills) and the Firebase MCP server.

#### Here is how they work together in practice:

The Firebase local MCP server includes tools to access the [Google Developer Knowledge MCP server](https://developers.google.com/knowledge/mcp). This connection seamlessly guides agents to search and read official Google documentation, including Firebase.

You might wonder: *What is the difference between an agent skill and official documentation?*

While documentation provides comprehensive reference material, skills are highly focused, outcome-driven cheat sheets. They are specifically designed to onboard users to Firebase products, enforce core principles, highlight best practices, and provide preemptive guidance for tasks where agents are known to struggle. For example, a skill can help a developer add a feature in their app that securely uses Firestore database – everything from provisioning in the cloud to writing the app code for interacting with the database. We even have agent skills that review and help to write robust Firebase Security Rules to protect user data.

Furthermore, skills act as a vital bridge for agent knowledge. Because LLMs are limited by training data cut-off dates – they won’t know about recent releases and changes. A skill can explicitly instruct the agent to use the CLI or an MCP server tool to implement the feature (or to read the latest documentation), ensuring the model can discover and utilize brand-new features on the fly.

### The need for measurement

As Firebase expanded this toolkit and wrote more agent skills, we ran into a critical question: how do we actually know if these skills are helping agents succeed?

We couldn’t just create skills and hope for the best. An agent might misinterpret a prompt, fail to activate the right skill, or get tripped up by a fragile workflow. We needed a way to programmatically measure an agent’s success rate.

To solve this, we built a set of evals—automated prompt suites that score how well an agent completes specific Critical User Journeys (CUJs).

#### Eval types

We use a few different types of evals to understand exactly how agents use our products:

**Single skill evaluations**: This is the simplest and most important type of eval. It provides the agent with a single skill, for instance the [`firebase-firestore` skill](https://github.com/firebase/agent-skills/tree/main/skills/firebase-firestore), and evaluates its core functionality against 5-10 specific cases per CUJ.

Here’s an example of what skill evaluation looks like:

```yaml
prompt: "What command would you use to check what version of the Firebase CLI I have installed? Just tell me the command, don't run it."
expectations:
- "The agent mentions \`npx -y firebase-tools@latest --version\`."
- "The agent did not use \`firebase --version\`."
```

**Skill activation evaluations**: Having a great skill doesn’t matter if the agent doesn’t know when to use it! Activation evals test the skill’s frontmatter (name and description). We run a mix of positive and negative prompts to ensure the agent activates the skill when needed, without over-activating on irrelevant prompts.

```yaml
prompt: "How do I log in to my Firebase account using the CLI?"
expected_skills:
- "firebase_basics"
```

**E2E multi-skill evaluations**: These are the ultimate test. We provide the agent with all our skills and ask it to create and deploy an app that uses multiple Firebase products. These evals interact with a real Firebase project to ensure our skills work together in a realistic environment.

```yaml
prompt: "Develop a Tetris game clone (a mock interface is fine). Include a global high-score leaderboard that displays the top 10 players and their scores. When a user finishes a game, their score should be saved to Firestore. The leaderboard should update dynamically. Ensure that a user can only write to their own score record. Deploy the app to Firebase Hosting."
expectations:
- "The agent creates a \`firebase.json\` file containing a \`firestore\` block and a \`hosting\` block."
- "The agent implements Firebase Auth in the application code."
- "The agent modifies \`firebase.json\` to include an \`auth\` block that configures \`googleSignIn\`."
- "The agent implements a Firestore query to fetch the top 10 scores, ordered by score descending."
- "The agent creates a \`firestore.rules\` file that allows users to write only their own score record (e.g., \`request.auth != null && request.auth.uid == userId\`)."
- "The agent successfully deploys the app."
```

#### The shift to eval-driven development

When we first started developing our agent skills, it was easier and faster to just write what we thought were important instructions for the agent. However, with our evolution to evaluation-driven development of skills, we now know what instructions are important because we can now start with the test and then write and iterate on skills until the agent succeeds.

Here is what the eval-driven development iteration loop looks like today—which we start adopting not only to refine our skills, but to uncover friction in our CLI and MCP servers as well:

1. **Write the eval first**  
	Before we write any agent skills, we define the expected outcome for a task. We set strict LLM-as-a-judge expectations for what a successful Firebase implementation looks like.
2. **Establish a baseline**  
	We prompt the agent to complete the task without providing the agent any of our Firebase agent skills, which lets us capture a baseline failure rate.
3. **Add and refine skills**  
	Next, we write the skill. We look for what failed in the baseline evaluation, and include specific procedural steps, mandatory flags, and “gotchas” into the agent skills to address the agent’s exact pain points.
4. **Hill climb**  
	We re-run the evaluation. If the score goes up, we keep the changes. We iterate on this loop until the agent consistently passes the eval.

#### The impact: Baselines vs. skills

By adopting an eval-first mindset and building a cohesive toolkit of skills and servers, we stopped guessing what agents might misunderstand and started programmatically proving it. To show just how much of a difference this makes, we compared the baseline performance of an agent without skills against an agent equipped with our tuned Firebase agent skills.

To interpret the data below, the following definitions describe how resources are measured:

- **Input Tokens**: The number of tokens the model reads. This includes the original prompt, agent skills, tool definitions (such as CLI or MCP tool descriptions), error messages, and web searches. **A reduction in input tokens suggests the agent spent less wasted time searching for context**.
- **Output Tokens**: The actual response provided to the user, including code written and internal “thinking” tokens. **A reduction in output tokens suggests a more concise answer, less effort spent rewriting code, and a more streamlined reasoning process.**

| Mode | Pass Rate | Avg Input Tokens | Avg Output Tokens | Avg Duration (s) |
| --- | --- | --- | --- | --- |
| Without Skills | 31.7% | 285.1k | 9.5k | 144.3 |
| With Skills | 78.0% | 169.5k | 5.8k | 101.2 |

#### Beyond skills: improving the tools themselves

An important impact of eval-driven development is that it doesn’t just help us write better skills—it helps us build better tools.

When we watch an agent repeatedly fail a task even after we’ve given it a well-written skill, it acts as a harsh usability test. It’s a strong signal that the underlying workflow or command is too complex, fragile, or confusing. We can take these insights and use them to improve the Firebase CLI and our MCP tools, streamlining the developer experience for both AI agents and human developers.

We’ve written an evaluation suite for Firebase CLI usage, with ~50 cases covering common developer tasks, and we’ve started to use this suite to optimize the CLI for agents. In the past few weeks, we’ve used this approach to [improve help text](https://github.com/firebase/firebase-tools/pull/10772), [provide smoother login for agents](https://github.com/firebase/firebase-tools/pull/10777/), and [fix cases where agents were blocked by interactive prompts](https://github.com/firebase/firebase-tools/pull/10856). We think this approach is the best way to build effective, agent friendly tooling, and we expect to use it much more in the coming months.

### Summary

By evaluating first and writing skills second—and by orchestrating the CLI and MCP servers with smart connective tissue—we’ve created a measurable, repeatable loop for improving how AI agents understand and interact with Firebase. Eval-driven development ensures that as Firebase grows, your coding agents are always equipped to give you the best possible guidance.

**If you build and work with mobile or web apps, make sure to install our [Firebase agent skills](https://firebase.google.com/docs/ai-assistance/agent-skills) today!**