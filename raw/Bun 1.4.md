---
title: "Bun 1.4"
source: "https://bun.com/blog/bun-v1.4"
author:
  - "[[Jarred Sumner]]"
  - "[[Ciro Spaciari]]"
  - "[[Dylan Conway]]"
  - "[[Alistair Smith]]"
  - "[[Sosuke Suzuki]]"
published: 2026-08-20
created: 2026-08-21
description: "Bun 1.4 rewrites Bun in Rust, ships built-in headless browser automation (Bun.WebView), Bun.Image, Bun.markdown, JSON5, JSONL, Terminal and cron APIs, Node.js 26.3.0 compatibility with 1,517 newly passing tests, parallel test and run, Windows ARM64, and an opt-in global virtual store for up to 7× faster installs."
tags:
  - "clippings"
---
Bun is the complete toolkit for building and testing full-stack JavaScript and TypeScript applications. If you're new to Bun, you can learn more from the [Bun 1.0](https://bun.com/blog/bun-v1.0) blog post.

![](https://www.youtube.com/watch?v=i38DgEuaJwM)

curl

```
curl -fsSL https://bun.sh/install | bash
```

Bun 1.4 adds +1,517 tests from the Node.js test suite - our biggest jump in Node.js compatibility since Bun 1.0. Bun v1.4 also fixes over 2,900 issues. It reduces idle CPU usage by 5x, reduces memory usage by up to 35%, and starts 50% faster on Linux. It adds [`Bun.Image`](#bun-image), [`Bun.WebView`](#bun-webview), [`Bun.markdown`](#bun-markdown), [`Bun.cron()`](#bun-cron), [`Bun.Terminal`](#bun-terminal), [`bun run --parallel`](#bun-run-parallel), [`bun test --parallel`](#bun-test-parallel), [`bun audit fix`](#bun-audit-fix), [`bun dedupe`](#bun-dedupe), and [`bun prune`](#bun-prune). And it rewrites Bun from Zig to Rust.

This post covers everything we've shipped since Bun 1.3.0 (with new to Bun v1.4 tagged).

To upgrade:

```
bun upgrade
```

## Node.js compatibility

Bun is designed to be a drop-in replacement for Node.js. We've added +1,517 tests from the Node.js test suite to run on every commit of Bun.

![Chart of Node.js test suite files passing in Bun, from 1,450 at v1.2.0 to 3,743 in v1.4.0](https://bun.com/images/blog/bun-1.4/node-test-suite-progress.png)

Chart of Node.js test suite files passing in Bun, from 1,450 at v1.2.0 to 3,743 in v1.4.0

`node:http`, `node:fs`, `node:cluster`, `node:timers`, `node:zlib`, `node:vm`, and `node:stream` pass 97% of Node's own tests; `node:quic` 99%; `node:events`, `node:trace_events`, and `node:sqlite` 100%.

Node.js v26.3.0 test suite · passing on every commit

+1,517newly passing tests

quic

235 / 237+235

httprewritten

403 / 415+193

fs

349 / 358+133

tls

191 / 224+106

http2rewritten

261 / 280+102

repl

82 / 109+77

stream

254 / 262+61

worker

116 / 157+57

process

160 / 190+45

net

171 / 191+39

https

61 / 65+39

internal

68 / 108+35

cluster

85 / 88+31

trace\_events

30 / 30+30

webcrypto

39 / 50+28

crypto

123 / 135+27

vm

98 / 101+25

webstreams

28 / 38+23

test\_runner

28 / 81+21

module

68 / 93+19

diagnostics\_channel

36 / 69+19

sqlite

18 / 18+18

child\_process

105 / 116+15

inspector

22 / 110+14

Per-module pass counts from Bun’s vendored copy of Node’s `test/parallel` suite, Bun 1.3 → 1.4. The tick marks the 1.3 baseline.

Bun is not 100% compatible with Node.js yet. In practice, much of the existing JavaScript ecosystem just works. You can more closely [track Bun's Node.js test suite progress here](https://bun.com/node-test-suite).

### Playwright v1.4.0

Playwright now runs on Bun: drive a browser with `connectOverCDP()`, run your suite with `playwright test` and a `playwright.config.ts`, open `--ui`, and launch Chromium on Windows.

### Next.js 16 v1.3.2

`bun --bun next build` works on Next.js 16.3 with Turbopack and the React Compiler.

### vitest v1.4.0

vitest runs under Bun, including `--coverage`, with the threads and forks pools.

### OpenTelemetry v1.4.0

OpenTelemetry's http and fs instrumentation export spans, and `shimmer` and `require-in-the-middle` patch bundled code.

### dd-trace v1.4.0

`dd-trace` traces and `@datadog/pprof` profiles continuously; the V8 C++ APIs they link against are implemented.

### Additional Node.js compatibility improvements

Every day, Bun gets closer to 100% Node.js compatibility. More packages now work in Bun without changes:

- **Nuxt**: `nuxt dev` connects HMR and the Nuxt DevTools.
- **testcontainers** and **dockerode**: `container.exec()` works.
- **https-proxy-agent** and **socks-proxy-agent**: `http.request()` tunnels through them.
- **crawlee**: crawls through `proxy-chain`.
- **@grpc/grpc-js** and **ConnectRPC**: servers behind Envoy and clients behind AWS ALB work.
- **amqplib**: connects to RabbitMQ.
- **@aws-sdk/client-s3**: streaming uploads work.
- **TypeORM**: starts with the decorator settings in your `tsconfig.json`.
- **nock**: intercepts `http` and `https` requests.
- **Fastify `inject()`** and **light-my-request**: work.
- **happy-dom**: no longer breaks `console.log`.
- **piscina**: runs.

New Node.js APIs in Bun:

- **`worker_threads`**: `resourceLimits`, `stdout`, `stderr`, and `eval` options.
- **ws**: `'upgrade'` and `'unexpected-response'` events.
- **`socket.upgradeTLS({ isServer: true })`**: server-side STARTTLS.
- **`node:cluster`**: shares listening sockets between workers.
- **`node:repl`**, **`node:trace_events`**, **`node:domain`**: implemented.

## Production

Bun v1.4 uses less memory, less CPU, and starts faster.

Until Bun v1.4, Bun used two memory allocators - JavaScriptCore's libpas allocator and mimalloc. JavaScriptCore in Bun now uses mimalloc (improving memory reclamation), and we've extended mimalloc with features like partial page clearing, a scavenger thread that frees memory while JavaScript idles, and improved lazy zeroing.

### CPU usage

For Claude Code, a large long-running application built on Bun, production CPU usage dropped by 2×: p99 from 24% to 10%, p50 from 5.8% to 2.5%.

![Claude Code production CPU usage before and after Bun 1.4: p99 24% to 10%, p50 5.8% to 2.5%](https://bun.com/images/blog/bun-1.4/tweets/cpu-usage-cc.jpeg)

Claude Code production CPU usage before and after Bun 1.4: p99 24% to 10%, p50 5.8% to 2.5%

For a small "hello world" app, idle CPU usage drops by 5x.

![Idle CPU usage of a hello world server, Bun 1.3 vs Bun 1.4: 5x lower](https://bun.com/images/blog/bun-1.4/tweets/idle-cpu.png)

Idle CPU usage of a hello world server, Bun 1.3 vs Bun 1.4: 5x lower

We did this by optimizing when garbage collector timers request a GC, switching how JavaScriptCore visits Strong roots from a linked list to a linked list of segmented arrays, and reducing the number of `futex` calls, along with the mimalloc changes mentioned earlier.

### Memory usage

Applications using HTTP servers with Bun should see a 13% - 48% memory usage reduction.

Peak memory under load (1,000,000 requests with 64 connections; 100,000 for Next.js and Vite):

| Server | Bun 1.4 | Bun 1.3 | Node.js 26 | Δ vs Bun 1.3 |
| --- | --- | --- | --- | --- |
| fastify | **120 MB** | 233 MB | 156 MB | **−48%** |
| Express | **92 MB** | 169 MB | 145 MB | **−46%** |
| `node:http` | **81 MB** | 135 MB | 107 MB | **−40%** |
| Elysia | **55 MB** | 91 MB | n/a | **−40%** |
| Next.js | **285 MB** | 397 MB | 342 MB | **−28%** |
| `Bun.serve` | **36 MB** | 45 MB | n/a | **−20%** |
| Vite dev server | 233 MB | 268 MB | **214 MB** | **−13%** |

Server-side rendering with Next.js gets a bigger reduction. On a common App Router pattern that grew without bound in 1.3 (`React.cache` + `no-store` fetch in a dynamic route), Bun 1.4 settles at 238 MB over 4,000 pages, under Node's 410 MB.

![Memory over 4,000 Next.js App Router SSR pages: Bun 1.4 settles at 238 MB, Node at 410 MB, Bun 1.3 grows without bound](https://bun.com/images/blog/bun-1.4/tweets/nextjs-ssr-fetch-leak.jpg)

Next.js App Router SSR, 4,000 pages: Bun 1.4 settles at 238 MB, under Node's 410 MB.

### Startup

On Windows, Bun starts 2.5× faster.

| `hello.js` on Windows | Bun 1.4 | Bun 1.3.14 | Node.js 26 |
| --- | --- | --- | --- |
| Startup time | **15.5 ms** | 39.0 ms | 40.1 ms |
| Peak memory | **16.8 MB** | 46.5 MB | 32.5 MB |

On Linux, Bun starts 2× faster and uses less than half the memory.

| `hello.js` on Linux | Bun 1.4 | Bun 1.3 | Node.js 26 |
| --- | --- | --- | --- |
| Startup time | **5.1 ms** | 10.9 ms | 27.2 ms |
| Peak memory | **14.6 MB** | 33.0 MB | 44.5 MB |

### Binary size

On Linux and Windows, Bun gets up to 17% smaller.

|  | Bun 1.4 | Bun 1.3.14 |
| --- | --- | --- |
| Linux x64 | **77.0 MB** | 88.5 MB |
| Linux arm64 | **76.8 MB** | 87.6 MB |
| Windows x64 | **84.8 MB** | 93.9 MB |
| Windows arm64 | **75.1 MB** | 90.2 MB |
| macOS arm64 | 61.2 MB | **60.2 MB** |
| macOS x64 | 66.6 MB | **66.0 MB** |

macOS binaries are about 1 MB larger.

### Observability

The tools you already use work with Bun 1.4.

- **`bun --cpu-prof`** writes a `.cpuprofile`. Open it in Chrome DevTools or VS Code.
- **`bun --heap-prof`** writes a V8-compatible `.heapsnapshot`. Open it in Chrome DevTools.
- **`node:inspector`**: a `Session` can start and stop a CPU profile while the app runs, with `Profiler.start` and `Profiler.stop`. [#25939](https://github.com/oven-sh/bun/pull/25939)
- **Datadog**: `dd-trace` traces requests and `@datadog/pprof` profiles CPU continuously. [#36747](https://github.com/oven-sh/bun/pull/36747)
- **OpenTelemetry**: the `@opentelemetry/instrumentation-http` and `@opentelemetry/instrumentation-fs` packages from npm work with `node:http` and `node:fs` in Bun. The `shimmer` and `require-in-the-middle` packages they depend on can patch bundled code.
- **Async stack traces**: an error from `fs.promises`, `fetch()`, S3, DNS, or crypto points at the `await` in your code, not at native frames.

Some of it is new in Bun.

#### \--cpu-prof-md

`--cpu-prof-md` writes a CPU profile as Markdown, so you can find the hot function from a terminal: the top functions by self time, the call tree, and who calls whom. Read it over SSH, `grep` it, paste it into a bug report, or hand it to an LLM.

```
bun --cpu-prof-md ./app.ts
```

```
# CPU Profile

| Duration | Samples | Interval | Functions |
| -------- | ------- | -------- | --------- |
| 304.9ms  | 279     | 1.0ms    | 6         |

**Top 10:** \`tokenize\` 39.1%, \`escapeHtml\` 25.6%, \`escapeHtml\` 19.3%, \`render\` 15.8%

## Hot Functions (Self Time)

| Self% |    Self | Total% |   Total | Function     | Location    |
| ----: | ------: | -----: | ------: | ------------ | ----------- |
| 39.1% | 119.4ms |  39.1% | 119.4ms | \`tokenize\`   | \`app.ts:14\` |
| 25.6% |  78.1ms |  25.6% |  78.1ms | \`escapeHtml\` | \`app.ts:5\`  |
| 19.3% |  58.9ms |  19.3% |  58.9ms | \`escapeHtml\` | \`app.ts:4\`  |
| 15.8% |  48.3ms |  60.8% | 185.3ms | \`render\`     | \`app.ts:21\` |

## Call Tree (Total Time)

| Total% |   Total | Self% |    Self | Function     | Location    |
| -----: | ------: | ----: | ------: | ------------ | ----------- |
|  60.8% | 185.3ms | 15.8% |  48.3ms | \`render\`     | \`app.ts:21\` |
|  60.8% | 185.3ms |  0.0% |     0us | \`(module)\`   | \`app.ts:30\` |
|  39.1% | 119.4ms | 39.1% | 119.4ms | \`tokenize\`   | \`app.ts:14\` |
|  39.1% | 119.4ms |  0.0% |     0us | \`(module)\`   | \`app.ts:28\` |
|  25.6% |  78.1ms | 25.6% |  78.1ms | \`escapeHtml\` | \`app.ts:5\`  |
|  19.3% |  58.9ms | 19.3% |  58.9ms | \`escapeHtml\` | \`app.ts:4\`  |

## Function Details

### \`tokenize\`

\`app.ts:14\` | Self: 39.1% (119.4ms) | Total: 39.1% (119.4ms) | Samples: 109

**Called by:**

- \`(module)\` (109)

### \`escapeHtml\`

\`app.ts:5\` | Self: 25.6% (78.1ms) | Total: 25.6% (78.1ms) | Samples: 72

**Called by:**

- \`render\` (72)

### \`escapeHtml\`

\`app.ts:4\` | Self: 19.3% (58.9ms) | Total: 19.3% (58.9ms) | Samples: 54

**Called by:**

- \`render\` (54)

### \`render\`

\`app.ts:21\` | Self: 15.8% (48.3ms) | Total: 60.8% (185.3ms) | Samples: 44

**Called by:**

- \`(module)\` (170)

**Calls:**

- \`escapeHtml\` (72)
- \`escapeHtml\` (54)

### \`(module)\`

\`app.ts:28\` | Self: 0.0% (0us) | Total: 39.1% (119.4ms) | Samples: 0
```

`BUN_CPU_PROFILE=1` turns on the CPU profiler for a process you cannot pass flags to, like a worker started by a framework.

#### \--heap-prof-md

`--heap-prof-md` writes a heap profile as Markdown, so you can find what is holding memory from a terminal: total size, the types that retain the most, the largest objects, and the chains that keep them alive.

```
bun --heap-prof-md ./app.ts
```

```
# Bun Heap Profile

Generated by \`bun --heap-prof-md\`. This profile contains complete heap data in markdown format.

**Quick Search Commands:**

\`\`\`bash
grep '| \`Function\`' file.md            # Find all Function objects
grep 'gcroot=1' file.md               # Find all GC roots
grep '| 12345 |' file.md              # Find object #12345 or edges involving it
\`\`\`

---

## Summary

| Metric          |                  Value |
| --------------- | ---------------------: |
| Total Heap Size | 4.2 MB (4507930 bytes) |
| Total Objects   |                 121116 |
| Total Edges     |                 244084 |
| Unique Types    |                     67 |
| GC Roots        |                    427 |

## Top 50 Types by Retained Size

| Rank | Type                         |  Count | Self Size | Retained Size | Largest Instance |
| ---: | ---------------------------- | -----: | --------: | ------------: | ---------------: |
|    1 | \`<root>\`                     |      1 |       0 B |        4.2 MB |           4.2 MB |
|    2 | \`string\`                     | 119883 |    4.1 MB |        4.1 MB |             67 B |
|    3 | \`GlobalObject\`               |      1 |   10.3 KB |       83.1 KB |          83.1 KB |
|    4 | \`Function\`                   |    319 |   10.3 KB |       61.5 KB |          13.9 KB |
|    5 | \`Structure\`                  |    216 |   23.6 KB |       35.7 KB |            944 B |
|    6 | \`FunctionExecutable\`         |     72 |    9.0 KB |       32.0 KB |          13.9 KB |
|    7 | \`ModuleLoader\`               |      1 |      32 B |       20.1 KB |          20.1 KB |
|    8 | \`ModuleRecord\`               |      2 |    3.0 KB |       19.4 KB |          15.3 KB |
|    9 | \`NativeExecutable\`           |    228 |   17.8 KB |       17.8 KB |             80 B |
|   10 | \`JSModuleEnvironment\`        |      2 |     128 B |       16.3 KB |          14.0 KB |
|   11 | \`FunctionCodeBlock\`          |      5 |   12.3 KB |       12.3 KB |           4.1 KB |
|   12 | \`ModuleProgramExecutable\`    |      2 |     224 B |       10.3 KB |           8.7 KB |
|   13 | \`ModuleProgramCodeBlock\`     |      2 |    2.5 KB |       10.1 KB |           8.6 KB |
|   14 | \`UnlinkedFunctionExecutable\` |     69 |    6.4 KB |        6.4 KB |             96 B |
|   15 | \`Array\`                      |     61 |    1.0 KB |        6.1 KB |           5.1 KB |
|   16 | \`console\`                    |      1 |      48 B |        4.4 KB |           4.4 KB |
|   17 | \`String\`                     |      1 |      74 B |        4.3 KB |           4.3 KB |
|   18 | \`Map\`                        |      3 |     105 B |        4.2 KB |           2.6 KB |
|   19 | \`GetterSetter\`               |     29 |     928 B |        3.7 KB |            256 B |
|   20 | \`Iterator\`                   |      2 |      54 B |        3.3 KB |           2.7 KB |
```

#### bun build --metafile-md

`bun build --metafile-md` writes the bundle analysis as Markdown, so you can see why a bundle is big: the largest modules, what each entry point loads, and the chain of imports that pulled each file in.

```
bun build ./src/index.ts --outdir ./dist --metafile-md=./dist/meta.md
```

```
# Bundle Analysis Report

This report helps identify bundle size issues, dependency bloat, and optimization opportunities.

## Table of Contents

- [Quick Summary](#quick-summary)
- [Largest Modules by Output Contribution](#largest-modules-by-output-contribution)
- [Entry Point Analysis](#entry-point-analysis)
- [Dependency Chains](#dependency-chains)
- [Full Module Graph](#full-module-graph)
- [Raw Data for Searching](#raw-data-for-searching)

---

## Quick Summary

| Metric                    | Value              |
| ------------------------- | ------------------ |
| Total output size         | 56.1 KB            |
| Input modules             | 4                  |
| Entry points              | 1                  |
| node_modules contribution | 1 files (55.74 KB) |
| ESM modules               | 4                  |

## Largest Modules by Output Contribution

Modules sorted by bytes contributed to the output bundle. Large modules may indicate bloat.

| Output Bytes | % of Total | Module                                  | Format |
| ------------ | ---------- | --------------------------------------- | ------ |
| 55.74 KB     | 99.4%      | \`node_modules/marked/lib/marked.esm.js\` | esm    |
| 113 bytes    | 0.2%       | \`src/escape.ts\`                         | esm    |
| 76 bytes     | 0.1%       | \`src/render.ts\`                         | esm    |
| 52 bytes     | 0.1%       | \`src/index.ts\`                          | esm    |

## Entry Point Analysis

Each entry point and the total code it loads (including shared chunks).

### Entry: \`src/index.ts\`

**Output file**: \`./index.js\`
**Bundle size**: 56.1 KB
**Exports**: \`main\`

**Bundled modules** (sorted by contribution):

| Bytes     | Module                                  |
| --------- | --------------------------------------- |
| 55.74 KB  | \`node_modules/marked/lib/marked.esm.js\` |
| 113 bytes | \`src/escape.ts\`                         |
| 76 bytes  | \`src/render.ts\`                         |
| 52 bytes  | \`src/index.ts\`                          |

## Dependency Chains

For each module, shows what files import it. Use this to understand why a module is included.

### Most Commonly Imported Modules

Modules imported by many files. Extracting these to shared chunks may help.

| Import Count | Module | Imported By |
| ------------ | ------ | ----------- |

## Full Module Graph

Complete dependency information for each module.

### \`node_modules/marked/lib/marked.esm.js\`

- **Output contribution**: 55.74 KB
- **Format**: esm
- **Imported by** (1 files): \`src/index.ts\`
```

#### process.on("memoryPressure")

When the operating system is running low on memory, it notifies Bun, and Bun emits `"memoryPressure"` on `process`. Use it to free memory before the OS kills your process: clear a cache, close idle connections, stop idle workers. It works on macOS, Linux, and Windows.

```
process.on("memoryPressure", (level) => {
  cache.clear();
  pool.drainIdle();
});
```

- **macOS**: `kqueue` with `EVFILT_MEMORYSTATUS`, the same event libdispatch uses for `DISPATCH_SOURCE_TYPE_MEMORYPRESSURE`. `level` is `"warning"` or `"critical"`.
- **Linux**: a PSI trigger written to `/proc/pressure/memory` (or the cgroup's `memory.pressure`), watched with `epoll` for `EPOLLPRI`. `level` is `"critical"`.
- **Windows**: `CreateMemoryResourceNotification(LowMemoryResourceNotification)`, waited on with `RegisterWaitForSingleObject`. `level` is `"critical"`.

### Streams and bodies

`ReadableStream`, `WritableStream`, and `TransformStream` are now native. They use less memory, run faster, and pass 100% of the Web Platform Tests.

Four pipelines, each moving 64 MB in 4 KB chunks:

- **Download**: `fetch()` → `DecompressionStream("gzip")` → `TextDecoderStream` → `for await`
- **Upload**: `fs.createReadStream()` → `CompressionStream("gzip")` → `fetch()` POST body
- **Transcode**: `fs.createReadStream()` → `TextDecoderStream` → `TextEncoderStream` → `fs.createWriteStream()`
- **Subprocess**: `fetch()` body → `cat` stdin, then `cat` stdout → `for await`

Throughput:

| Pipeline | Bun 1.4 | Bun 1.3 | Node.js 26 | Deno 2.9 |
| --- | --- | --- | --- | --- |
| Download | **1,519 MB/s** | n/a | 204 MB/s | 530 MB/s |
| Upload | **179 MB/s** | n/a | 78 MB/s | 137 MB/s |
| Transcode | **132 MB/s** | 116 MB/s | 52 MB/s | 91 MB/s |
| Subprocess | **751 MB/s** | 505 MB/s | 256 MB/s | 170 MB/s |

Peak memory:

| Pipeline | Bun 1.4 | Bun 1.3 | Node.js 26.7 | Deno 2.9 |
| --- | --- | --- | --- | --- |
| Download | **57 MB** | n/a | 86 MB | 64 MB |
| Upload | 60 MB | n/a | 84 MB | 61 MB |
| Transcode | 62 MB | 92 MB | 72 MB | 57 MB |
| Subprocess | **65 MB** | 207 MB | 106 MB | 114 MB |

All four runtimes run the same script. The file streams use `Readable.toWeb()` and `Writable.toWeb()` from `node:stream`. Bun 1.3 is missing `CompressionStream` and `DecompressionStream`, so those rows are n/a.

Benchmark code: native-pipeline.mjs and serve-body.mjs

```
// End-to-end pipelines between native stream types (fetch body, DecompressionStream, TextDecoderStream,
// file streams via node:stream Readable/Writable.toWeb, child_process pipes). Portable: Bun, Node, Deno.
// Run: <runtime> native-pipeline.mjs --scenario=prep                       (writes the 64 MiB fixture files once)
//      <runtime> native-pipeline.mjs --scenario=download-gunzip-decode --server=http://127.0.0.1:39872
//      <runtime> native-pipeline.mjs --scenario=file-gzip-upload --server=http://127.0.0.1:39872
//      <runtime> native-pipeline.mjs --scenario=file-decode-encode-file
//      <runtime> native-pipeline.mjs --scenario=spawn-passthrough --server=http://127.0.0.1:39872
// Server: \`bun run serve-body.mjs --gzip\`. 64 MiB payloads/files, 4 KiB chunks end to end. Wrap in /usr/bin/time -v for peak RSS.
import fs from "node:fs";
import { Readable, Writable } from "node:stream";
import { spawn } from "node:child_process";

const MB = 1024 * 1024;
const CHUNK = 4096;
const BYTES = 64 * MB;
const argv = globalThis.process?.argv ?? [];
const arg = (k, d) =>
  argv.find((a) => a.startsWith(\`--${k}=\`))?.slice(k.length + 3) ?? d;
const scenario = arg("scenario", "prep");
const server = arg("server");
const dir = arg("dir", "/tmp/native-pipeline");
const JSON_FILE = \`${dir}/json-64mb.txt\`;
const UTF8_FILE = \`${dir}/utf8-64mb.txt\`;
const OUT_FILE = \`${dir}/out-${scenario}.txt\`;

const jsonTemplate = new TextEncoder()
  .encode(
    JSON.stringify({
      messages: Array.from({ length: 700 }, (_, i) => ({
        id: i,
        role: i % 2 ? "assistant" : "user",
        ts: 1700000000 + i,
        body: "the quick brown fox jumps over the lazy dog " + i,
      })),
    }),
  )
  .slice(0, CHUNK);
const utf8Text = (
  "hello world \u{1F30A} stream ✨ café naïve 中文 " + "x".repeat(40)
).repeat(2000);
const utf8Template = new TextEncoder().encode(utf8Text).slice(0, CHUNK);
// Keep the UTF-8 fixture valid at 64 KiB chunk boundaries: cut the template at a char boundary.
const utf8Chunk = (() => {
  let end = utf8Template.byteLength;
  while ((utf8Template[end - 1] & 0xc0) === 0x80) end--;
  if (end < utf8Template.byteLength) end--; // drop the lead byte of the truncated char too
  return utf8Template.slice(0, end);
})();

const countBytes = async (rs) => {
  let n = 0;
  for await (const v of rs)
    n += typeof v === "string" ? v.length : v.byteLength;
  return n;
};

async function prep() {
  fs.mkdirSync(dir, { recursive: true });
  const write = (path, template, varyByte) => {
    if (fs.existsSync(path) && fs.statSync(path).size === BYTES) return;
    const fd = fs.openSync(path, "w");
    let written = 0,
      i = 0;
    const buf = new Uint8Array(template.byteLength);
    while (written < BYTES) {
      buf.set(template);
      if (varyByte) buf[0] = 32 + (i++ & 63);
      fs.writeSync(fd, buf);
      written += buf.byteLength;
    }
    fs.closeSync(fd);
    console.log(\`wrote ${path} (${(written / MB).toFixed(0)} MiB)\`);
  };
  write(JSON_FILE, jsonTemplate, true);
  write(UTF8_FILE, utf8Chunk, false);
}

const scenarios = {
  // fetch(gzip body) -> DecompressionStream -> TextDecoderStream -> for await (count chars). MB/s over decompressed bytes.
  "download-gunzip-decode": async () => {
    const res = await fetch(\`${server}/gzip\`);
    const expected = +res.headers.get("x-uncompressed-length");
    const chars = await countBytes(
      res.body
        .pipeThrough(new DecompressionStream("gzip"))
        .pipeThrough(new TextDecoderStream()),
    );
    if (chars !== expected)
      throw new Error(
        \`decoded ${chars} chars, expected ${expected} (ASCII payload)\`,
      );
    return expected;
  },
  // fs.createReadStream(64 MiB, 4 KiB reads) -> CompressionStream -> fetch POST body; server returns bytes received. MB/s over input bytes.
  "file-gzip-upload": async () => {
    const body = Readable.toWeb(
      fs.createReadStream(JSON_FILE, { highWaterMark: CHUNK }),
    ).pipeThrough(new CompressionStream("gzip"));
    const res = await fetch(\`${server}/upload\`, {
      method: "POST",
      body,
      duplex: "half",
    });
    const received = +(await res.text());
    if (!(received > 0 && received < BYTES))
      throw new Error(\`server received ${received} bytes\`);
    return fs.statSync(JSON_FILE).size;
  },
  // fs.createReadStream(64 MiB utf-8, 4 KiB reads) -> TextDecoderStream -> TextEncoderStream -> fs.createWriteStream. MB/s over file bytes.
  "file-decode-encode-file": async () => {
    await Readable.toWeb(
      fs.createReadStream(UTF8_FILE, { highWaterMark: CHUNK }),
    )
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(new TextEncoderStream())
      .pipeTo(Writable.toWeb(fs.createWriteStream(OUT_FILE)));
    const n = fs.statSync(OUT_FILE).size;
    if (n !== fs.statSync(UTF8_FILE).size) throw new Error(\`wrote ${n} bytes\`);
    fs.unlinkSync(OUT_FILE);
    return n;
  },
  // fetch(64 MiB body in 4 KiB chunks).body -> cat stdin ; cat stdout -> for await. MB/s over body bytes.
  "spawn-passthrough": async () => {
    const child = spawn("cat", [], { stdio: ["pipe", "pipe", "inherit"] });
    const res = await fetch(\`${server}/?bytes=${BYTES}&chunk=${CHUNK}\`);
    const [, n] = await Promise.all([
      res.body.pipeTo(Writable.toWeb(child.stdin)),
      countBytes(Readable.toWeb(child.stdout)),
    ]);
    await new Promise((r) => child.on("close", r));
    if (n !== BYTES) throw new Error(\`got ${n} bytes from cat\`);
    return n;
  },
};

if (scenario === "prep") {
  await prep();
} else {
  const fn = scenarios[scenario];
  if (!fn)
    throw new Error(
      \`unknown --scenario=${scenario}; prep | ${Object.keys(scenarios).join(
        " | ",
      )}\`,
    );
  if (scenario !== "file-decode-encode-file" && !server)
    throw new Error("--server=URL required (bun run serve-body.mjs --gzip)");
  const t0 = performance.now();
  const bytes = await fn();
  const ms = performance.now() - t0;
  console.log(
    \`${scenario.padEnd(26)} ${(bytes / MB / (ms / 1000))
      .toFixed(0)
      .padStart(6)} MB/s  ${ms.toFixed(0).padStart(6)} ms  ${(
      bytes / MB
    ).toFixed(0)} MiB\`,
  );
}
```

```
// Streaming-body server for streams-throughput.mjs --scenario=fetch and native-pipeline.mjs.
// Run: bun run serve-body.mjs [--gzip]   (listens on 127.0.0.1:39872)
//   GET  /?bytes=N&chunk=C   fresh C-byte chunks (default 65536), N bytes total
//   GET  /gzip                64 MiB of JSON-like text gzip-compressed once at startup (--gzip), served in 4 KiB chunks,
//                             no content-encoding header (the client decompresses explicitly)
//   POST /upload     drains the request body, responds with the byte count
const MB = 1024 * 1024;
const CHUNK = 64 * 1024;
const argv = process.argv;
const GZIP_BYTES = 64 * MB;
const GZIP_CHUNK = 4096;

const jsonTemplate = new TextEncoder()
  .encode(
    JSON.stringify({
      messages: Array.from({ length: 700 }, (_, i) => ({
        id: i,
        role: i % 2 ? "assistant" : "user",
        ts: 1700000000 + i,
        body: "the quick brown fox jumps over the lazy dog " + i,
      })),
    }),
  )
  .slice(0, CHUNK);
const jsonSource = (total) => {
  const count = Math.ceil(total / CHUNK);
  let i = 0;
  return new ReadableStream({
    pull(c) {
      if (i < count) {
        const b = new Uint8Array(CHUNK);
        b.set(jsonTemplate);
        b[0] = 32 + (i++ & 63);
        c.enqueue(b);
      } else c.close();
    },
  });
};
let gzipped = null;
if (argv.includes("--gzip")) {
  const t0 = performance.now();
  gzipped = new Uint8Array(
    await new Response(
      jsonSource(GZIP_BYTES).pipeThrough(new CompressionStream("gzip")),
    ).arrayBuffer(),
  );
  console.log(
    \`pre-compressed ${GZIP_BYTES / MB} MiB -> ${(
      gzipped.byteLength / MB
    ).toFixed(1)} MiB gzip in ${(performance.now() - t0).toFixed(0)} ms\`,
  );
}

Bun.serve({
  port: 39872,
  hostname: "127.0.0.1",
  idleTimeout: 255,
  maxRequestBodySize: 8 * 1024 * MB,
  async fetch(req) {
    const url = new URL(req.url);
    if (req.method === "POST" && url.pathname === "/upload") {
      let n = 0;
      for await (const c of req.body) n += c.byteLength;
      return new Response(String(n));
    }
    if (url.pathname === "/gzip") {
      if (!gzipped) return new Response("start with --gzip", { status: 500 });
      let off = 0;
      const body = new ReadableStream({
        pull(c) {
          if (off < gzipped.byteLength) {
            c.enqueue(
              gzipped.slice(
                off,
                Math.min(off + GZIP_CHUNK, gzipped.byteLength),
              ),
            );
            off += GZIP_CHUNK;
          } else c.close();
        },
      });
      return new Response(body, {
        headers: {
          "content-type": "application/gzip",
          "x-uncompressed-length": String(GZIP_BYTES),
        },
      });
    }
    const total = +url.searchParams.get("bytes");
    const chunk = +(url.searchParams.get("chunk") ?? CHUNK);
    const count = Math.ceil(total / chunk);
    let i = 0;
    const body = new ReadableStream({
      pull(c) {
        if (i < count) c.enqueue(new Uint8Array(chunk).fill(i++ & 0xff));
        else c.close();
      },
    });
    return new Response(body, { headers: { "content-length": String(total) } });
  },
});
console.log("listening on http://127.0.0.1:39872");
```

`Response.clone()` and `Request.clone()` no longer copy every chunk into the second branch. The clone shares the body's chunks with the original.

A 64 MB streaming body, `res.clone()`, then read both bodies:

| Runtime | Peak memory | Time |
| --- | --- | --- |
| Bun 1.4 | **220 MB** | **96 ms** |
| Bun 1.3 | 311 MB | 129 ms |
| Node.js 26 | 382 MB | 230 ms |
| Deno 2.9 | 297 MB | 134 ms |

Reading only the clone, and never the original:

| Runtime | Peak memory | Time |
| --- | --- | --- |
| Bun 1.4 | **155 MB** | **63 ms** |
| Bun 1.3 | 243 MB | 98 ms |
| Node.js 26 | 318 MB | 162 ms |
| Deno 2.9 | 233 MB | 104 ms |

The two `arrayBuffer()` results account for 128 MB of the peak in the first table. Bun 1.4 saves one full copy of the body in both cases.

Benchmark code: response-clone.mjs

```
// Response.clone() and ReadableStream.tee() with fresh 64 KiB buffers. Peak RSS (via /usr/bin/time -v) is the point.
// Run: bun run response-clone.mjs --scenario=clone-both --bytes=67108864
//      node response-clone.mjs --scenario=clone-chain --depth=100 --bytes=104857600
//      deno run -A response-clone.mjs --scenario=tee --bytes=2147483648
// clone-both:  res.clone(), then read both bodies concurrently.
// clone-only:  res.clone(), read only the clone; the original is never read.
// clone-chain: clone a streaming Response N times, read only the last clone.
// tee:         split a stream and drain both branches concurrently. MB/s is over the source bytes.
const MB = 1024 * 1024;
const CHUNK = 64 * 1024;
const argv = globalThis.process?.argv ?? [];
const arg = (k, d) =>
  argv.find((a) => a.startsWith(\`--${k}=\`))?.slice(k.length + 3) ?? d;
const scenario = arg("scenario", "clone-chain");
const DEPTH = +arg("depth", 100);
const BYTES = +arg(
  "bytes",
  { "tee": 2048 * MB, "clone-chain": 100 * MB }[scenario] ?? 1024 * MB,
);

const freshSource = (total) => {
  const count = Math.ceil(total / CHUNK);
  let i = 0;
  return new ReadableStream({
    pull(c) {
      if (i < count) c.enqueue(new Uint8Array(CHUNK).fill(i++ & 0xff));
      else c.close();
    },
  });
};
const drain = async (rs) => {
  const r = rs.getReader();
  let n = 0;
  for (;;) {
    const { done, value } = await r.read();
    if (done) return n;
    n += value.byteLength;
  }
};

const scenarios = {
  "clone-both": async () => {
    const res = new Response(freshSource(BYTES));
    const c = res.clone();
    const [a, b] = await Promise.all([res.arrayBuffer(), c.arrayBuffer()]);
    if (a.byteLength !== b.byteLength) throw new Error("clone mismatch");
    return a.byteLength;
  },
  "clone-only": async () => {
    const res = new Response(freshSource(BYTES));
    const c = res.clone();
    return (await c.arrayBuffer()).byteLength;
  },
  "clone-chain": async () => {
    let cur = new Response(freshSource(BYTES));
    const chain = [cur];
    for (let i = 0; i < DEPTH; i++) chain.push((cur = cur.clone()));
    return (await chain.at(-1).arrayBuffer()).byteLength;
  },
  "tee": async () => {
    const [a, b] = freshSource(BYTES).tee();
    const [x, y] = await Promise.all([drain(a), drain(b)]);
    if (x !== y) throw new Error("branch mismatch");
    return x;
  },
};
const fn = scenarios[scenario];
if (!fn)
  throw new Error(
    \`unknown --scenario=${scenario}; clone-both | clone-only | clone-chain | tee\`,
  );

const rss0 = globalThis.process?.memoryUsage?.().rss ?? 0;
const t0 = performance.now();
const got = await fn();
const ms = performance.now() - t0;
if (got !== BYTES)
  throw new Error(\`${scenario}: read ${got} bytes, expected ${BYTES}\`);
const rssDelta = ((globalThis.process?.memoryUsage?.().rss ?? 0) - rss0) / MB;
console.log(
  \`${scenario.padEnd(12)} ${(BYTES / MB / (ms / 1000))
    .toFixed(0)
    .padStart(6)} MB/s  ${ms.toFixed(0).padStart(6)} ms  ${
    BYTES / MB
  } MiB  rss +${rssDelta.toFixed(0)} MB\`,
);
```

`CompressionStream` & `DecompressionStream` are now implemented natively. Bun 1.3 did not have them.

1 GB of JSON text through a gzip stream, 64 KB chunks:

| Stream | Bun 1.4 | Node.js 26 | Deno 2.9 |
| --- | --- | --- | --- |
| CompressionStream | **152 MB/s** | 135 MB/s | 130 MB/s |
| DecompressionStream | **2,291 MB/s** | 491 MB/s | 679 MB/s |

Compression is bound by zlib itself, so the runtimes are close. Decompression is where the native stream path shows.

Benchmark code: compression-stream.mjs

```
// CompressionStream / DecompressionStream throughput on JSON-like text, generated in fresh 64 KiB chunks.
// Run: bun run compression-stream.mjs --scenario=compress --format=gzip --bytes=1073741824
//      node compression-stream.mjs --scenario=decompress --format=deflate
//      deno run -A compression-stream.mjs --scenario=compress
// MB/s is over uncompressed bytes. \`decompress\` compresses the input first (untimed), then times the inflate.
const MB = 1024 * 1024;
const CHUNK = 64 * 1024;
const argv = globalThis.process?.argv ?? [];
const arg = (k, d) =>
  argv.find((a) => a.startsWith(\`--${k}=\`))?.slice(k.length + 3) ?? d;
const scenario = arg("scenario", "compress");
const format = arg("format", "gzip");
const BYTES = +arg("bytes", 1024 * MB);

const template = new TextEncoder()
  .encode(
    JSON.stringify({
      messages: Array.from({ length: 700 }, (_, i) => ({
        id: i,
        role: i % 2 ? "assistant" : "user",
        ts: 1700000000 + i,
        body: "the quick brown fox jumps over the lazy dog " + i,
      })),
    }),
  )
  .slice(0, CHUNK);

const jsonSource = (total) => {
  const count = Math.ceil(total / CHUNK);
  let i = 0;
  return new ReadableStream({
    pull(c) {
      if (i < count) {
        const b = new Uint8Array(CHUNK);
        b.set(template);
        b[0] = 32 + (i++ & 63);
        c.enqueue(b);
      } else c.close();
    },
  });
};
const drain = async (rs) => {
  const r = rs.getReader();
  let n = 0;
  for (;;) {
    const { done, value } = await r.read();
    if (done) return n;
    n += value.byteLength;
  }
};
const collect = async (rs) => {
  const parts = [];
  const r = rs.getReader();
  for (;;) {
    const { done, value } = await r.read();
    if (done) break;
    parts.push(value);
  }
  const out = new Uint8Array(parts.reduce((n, p) => n + p.byteLength, 0));
  let off = 0;
  for (const p of parts) out.set(p, off), (off += p.byteLength);
  return out;
};
const chunked = (buf) =>
  new ReadableStream({
    start(c) {
      for (let i = 0; i < buf.byteLength; i += CHUNK)
        c.enqueue(buf.subarray(i, Math.min(i + CHUNK, buf.byteLength)));
      c.close();
    },
  });

let run;
if (scenario === "compress")
  run = () =>
    drain(jsonSource(BYTES).pipeThrough(new CompressionStream(format)));
else if (scenario === "decompress") {
  const compressed = await collect(
    jsonSource(BYTES).pipeThrough(new CompressionStream(format)),
  );
  run = () =>
    drain(chunked(compressed).pipeThrough(new DecompressionStream(format)));
} else throw new Error(\`unknown --scenario=${scenario}; compress | decompress\`);

const t0 = performance.now();
const got = await run();
const ms = performance.now() - t0;
if (scenario === "decompress" && got !== BYTES)
  throw new Error(\`inflated ${got} bytes, expected ${BYTES}\`);
console.log(
  \`${scenario} (${format})\`.padEnd(22) +
    \` ${(BYTES / MB / (ms / 1000)).toFixed(0).padStart(6)} MB/s  ${ms
      .toFixed(0)
      .padStart(6)} ms  ${BYTES / MB} MiB\`,
);
```

`TextDecoderStream` & `TextEncoderStream` use about half the memory of Bun 1.3.

Peak memory, 1 GB of mixed UTF-8 text, 64 KB chunks:

| Stream | Bun 1.4 | Bun 1.3 | Node.js 26 | Deno 2.9 |
| --- | --- | --- | --- | --- |
| TextEncoderStream | **44 MB** | 110 MB | 182 MB | 52 MB |
| TextDecoderStream | 56 MB | 119 MB | 68 MB | **55 MB** |

Throughput, same run:

| Stream | Bun 1.4 | Bun 1.3 | Node.js 26 | Deno 2.9 |
| --- | --- | --- | --- | --- |
| TextEncoderStream | **1,963 MB/s** | 1,881 MB/s | 75 MB/s | 612 MB/s |
| TextDecoderStream | 1,489 MB/s | 1,507 MB/s | 1,540 MB/s | 1,059 MB/s |

Benchmark code: text-encoder-stream.mjs

```
// TextEncoderStream / TextDecoderStream throughput on mixed multi-byte UTF-8, fresh 64 KiB chunks.
// Run: bun run text-encoder-stream.mjs --scenario=encode --bytes=1073741824
//      node text-encoder-stream.mjs --scenario=decode
//      deno run -A text-encoder-stream.mjs --scenario=encode
// MB/s is over UTF-8 bytes (encoder output / decoder input).
const MB = 1024 * 1024;
const CHUNK = 64 * 1024;
const argv = globalThis.process?.argv ?? [];
const arg = (k, d) =>
  argv.find((a) => a.startsWith(\`--${k}=\`))?.slice(k.length + 3) ?? d;
const scenario = arg("scenario", "encode");
const BYTES = +arg("bytes", 1024 * MB);

const text = (
  "hello world \u{1F30A} stream ✨ café naïve 中文 " + "x".repeat(40)
).repeat(2000);
const utf8Template = new TextEncoder().encode(text).slice(0, CHUNK);
const stringChunk = text.slice(0, CHUNK);
const stringChunkBytes = new TextEncoder().encode(stringChunk).byteLength;

const stringSource = (total) => {
  const count = Math.ceil(total / stringChunkBytes);
  let i = 0;
  return new ReadableStream({
    pull(c) {
      if (i < count)
        c.enqueue(String(i++ & 0xffff).padStart(5, "0") + stringChunk.slice(5));
      else c.close();
    },
  });
};
const bytesSource = (total) => {
  const count = Math.ceil(total / CHUNK);
  let i = 0;
  return new ReadableStream({
    pull(c) {
      if (i < count) {
        const b = new Uint8Array(CHUNK);
        b.set(utf8Template);
        b[0] = 32 + (i++ & 63);
        c.enqueue(b);
      } else c.close();
    },
  });
};
const drain = async (rs) => {
  const r = rs.getReader();
  let n = 0;
  for (;;) {
    const { done, value } = await r.read();
    if (done) return n;
    n += typeof value === "string" ? value.length : value.byteLength;
  }
};

let run, expected;
if (scenario === "encode") {
  const count = Math.ceil(BYTES / stringChunkBytes);
  expected = count * stringChunkBytes;
  run = () => drain(stringSource(BYTES).pipeThrough(new TextEncoderStream()));
} else if (scenario === "decode") {
  expected = null; // output is chars, not bytes
  run = () => drain(bytesSource(BYTES).pipeThrough(new TextDecoderStream()));
} else throw new Error(\`unknown --scenario=${scenario}; encode | decode\`);

const t0 = performance.now();
const got = await run();
const ms = performance.now() - t0;
if (expected !== null && got !== expected)
  throw new Error(\`encoded ${got} bytes, expected ${expected}\`);
const bytes = expected ?? Math.ceil(BYTES / CHUNK) * CHUNK;
console.log(
  \`${scenario.padEnd(22)} ${(bytes / MB / (ms / 1000))
    .toFixed(0)
    .padStart(6)} MB/s  ${ms.toFixed(0).padStart(6)} ms  ${(bytes / MB).toFixed(
    0,
  )} MiB\`,
);
```

All numbers: AMD EPYC 9R14, Linux x64. Bun 1.3.0, Bun 1.4.0, Node.js 26.7.0, Deno 2.9.5. Median of 3 runs, one process per run, peak RSS from `/usr/bin/time -v`.

### Backpressure

`Bun.serve` automatically pauses the `ReadableStream` request & response bodies when the connection can't accept more data, so a slow or stalled client holds at most one buffer's worth of server memory.

```
Bun.serve({
  routes: {
    "/": () => {
      return new Response(
        new ReadableStream({
          // pauses when the socket's send buffer fills
          pull(controller) {
            controller.enqueue(new Uint8Array(65536));
          },
        }),
      );
    },
  },
});
```

`fetch()` does the same on the receiving side. This also works with `TransformStream` like `CompressionStream` & `DecompressionStream`, and `HTMLRewriter.transform`, `child_process`, `Bun.spawn`, `Bun.file(path).stream()`, `Blob.stream()` and more.

backpressure · Bun.serve ReadableStream

Bun 1.4RSS 238 MB

ReadableStream

pull(controller) {

controller.enqueue(…65536)

}

⏸ waiting for socket to drain

→server heap

OOM

pause

→

slow client 🐌

for await (chunk of res.body)

reads every 480ms

The stream’s `pull()` outpaces a slow client 3:1. In Bun 1.3 the server buffered every unsent chunk on the heap until the process ran out of memory; in 1.4 `pull()` pauses when the socket’s send buffer fills and resumes when it drains. Illustrative — each chip is a batch of 64 KB chunks; the ~1 GiB/s figure is from the [#32553](https://github.com/oven-sh/bun/pull/32553) repro.

## We rewrote Bun in Rust

Bun is now written in Rust - and this is the first release (though Claude Code has been using Bun's Rust port for months now, and Prisma launched [Prisma Compute](https://www.prisma.io/blog/bun-rust-rewrite-prisma-compute) on it). We [wrote a blog post](https://bun.com/blog/bun-in-rust) about the Rust rewrite that goes into more detail.

## What's new

This release makes Bun's builtin standard library bigger.

15 dependencies · now built in

0 dependencies left

package.json · dependencies

sharp

puppeteer

marked

node-cron

node-pty

concurrently

npm-run-all

serve-static

json5

fast-xml-parser

tar

string-width

slice-ansi

cli-truncate

wrap-ansi

built into Bun 1.4

✓Bun.Imageimage processing

✓Bun.WebViewheadless browser

✓Bun.markdownmarkdown rendering

✓Bun.cronscheduled jobs

✓Bun.Terminalnative PTY

✓bun run --parallelparallel scripts

✓bun run --parallelparallel scripts

✓Bun.serve routesstatic files

✓Bun.JSON5JSON5 parsing

✓Bun.XMLXML parsing

✓Bun.Archivetarballs

✓Bun.stringWidthterminal columns

✓Bun.sliceAnsiANSI-aware slicing

✓Bun.sliceAnsiANSI-aware truncation

✓Bun.wrapAnsiANSI-aware wrapping

Every one of these ships in the Bun binary — no install step, no native build, no lockfile entry. Each is covered in its own section below.

### Bun.Image v1.3.14

[`Bun.Image`](https://bun.com/docs/runtime/image) is a built-in image library.

```
await Bun.file("photo.jpg")
  .image()
  .resize(1024, 1024, { fit: "inside" })
  .rotate(90)
  .webp({ quality: 85 })
  .write("thumb.webp");

// Stream straight into a Response
return new Response(new Bun.Image(upload).resize(200).jpeg());
```

Decode, resize, rotate, and encode JPEG, PNG, WebP, GIF, and BMP. HEIC, AVIF, and TIFF work on macOS and Windows.

The API looks like sharp, and no native addon is needed. ICC color profiles like Display P3 survive transcoding.

On a 1080p PNG resized to a 400×400 JPEG, it's 1.38× faster than sharp. On JPEG to WebP, 1.19×. [#30032](https://github.com/oven-sh/bun/pull/30032)

Bun.Image · decode → resize → rotate → encode

photo.jpg → thumb.webp

await Bun.file("photo.jpg")

.image()

.resize(1024, 1024, { fit: "inside" })

.rotate(90)

.webp({ quality: 85 })

.write("thumb.webp");

![Sample image (Bun mascot on a cream card) being resized, rotated, and re-encoded by Bun.Image](https://bun.com/images/blog/bun-1.4/image-pipeline-src.svg)

WEBP·124 KB✓ thumb.webp

zero `npm install` · 1.38× faster than sharp on decode→resize→encode · [#30032](https://github.com/oven-sh/bun/pull/30032)

### Bun.WebView v1.3.12v1.4.0

[`Bun.WebView`](https://bun.com/docs/runtime/webview) is headless browser automation built into Bun, without Puppeteer or Playwright.

```
await using view = new Bun.WebView({ width: 800, height: 600 });
await view.navigate("https://bun.sh");
await view.click("a[href='/docs']");
const title = await view.evaluate("document.title");
await Bun.write("page.png", await view.screenshot());
```

Navigate, click, scroll, run JavaScript, and take screenshots. Clicks and scrolls are real user input.

On macOS it uses the system WebKit, with nothing to install. On macOS, Linux, and Windows it can also drive an installed Chrome, Chromium, or Edge. [#39423](https://github.com/oven-sh/bun/pull/39423)

`Bun.WebView` extends `EventTarget`, returns `Blob` screenshots, and exposes a `.cdp(method, params?)` escape hatch for raw Chrome DevTools Protocol commands. See the [docs](https://bun.com/docs/runtime/webview) for advanced usage.

Bun.WebView · headless browser in 5 lines

await using view = new Bun.WebView({ width: 800, height: 600 });

await view.navigate("https://bun.sh");

await view.click("a\[href='/docs'\]");

const title = await view.evaluate("document.title");

await Bun.write("page.png", await view.screenshot());

https://bun.sh/docs

Documentation

title → "Bun — Documentation"

✓ page.png

No Puppeteer, no Playwright, no `npm install` — a real browser (WebKit on macOS, or an installed Chrome/Edge via CDP) driven by five awaits. Clicks arrive as trusted input (`event.isTrusted === true`). Illustrative render — see the [docs](https://bun.com/docs/api/webview).

### Bun.markdown v1.3.8v1.4.0

[`Bun.markdown`](https://bun.com/docs/runtime/markdown) is a Markdown parser built into Bun.

```
const html = Bun.markdown.html("# Hello **world**");
// "<h1>Hello <strong>world</strong></h1>\n"

// ANSI terminal output
const ansi = Bun.markdown.render("# Hello\n\n**bold**", {
  heading: (children) => \`\x1b[1;4m${children}\x1b[0m\n\`,
  paragraph: (children) => children + "\n",
  strong: (children) => \`\x1b[1m${children}\x1b[22m\`,
});

// React
export default function Page() {
  return Bun.markdown.react(readme);
}
```

`Bun.markdown.html()` gives you an HTML string. `Bun.markdown.react()` gives you React elements, and you can swap in your own component for any tag. `Bun.markdown.render()` gives you a callback per element, for things like terminal output.

GFM tables, strikethrough, task lists, and autolinks are supported, `.md` is a bundler loader, and the parser runs in linear time on adversarial input.

The HTML output is not sanitized: raw HTML, event-handler attributes, and `javascript:` hrefs pass through verbatim.

### Bun.cron() v1.3.11v1.4.0

[`Bun.cron()`](https://bun.com/docs/runtime/cron) registers a scheduled job with the operating system: crontab on Linux, launchd on macOS, Task Scheduler on Windows.

Your script exports a `scheduled(controller)` handler, the same shape as Cloudflare Workers Cron Triggers.

Standard 5-field cron syntax works, including named days and `@daily`. [#26999](https://github.com/oven-sh/bun/pull/26999)

```
// Register an OS-level cron job
await Bun.cron("./worker.ts", "30 2 * * MON", "weekly-report");

// Parse a cron expression → next matching UTC Date
const next = Bun.cron.parse("*/15 * * * *");

// worker.ts
export default {
  async scheduled(controller) {
    // controller.cron === "30 2 * * 1"
    // controller.scheduledTime === 1737340200000
    await doWork();
  },
};
```

You can also pass a function instead of a file. Bun runs it on the event loop, with no system cron involved.

Jobs never overlap, and `using` stops the job when it goes out of scope.

```
using job = Bun.cron("*/5 * * * *", async () => {
  await cleanupTempFiles();
});
job.cron; // "*/5 * * * *"
job.unref(); // allow process exit
job.stop(); // cancel (or let \`using\` dispose)
```

`Bun.cron` schedules run in local time by default, with a new `{ tz }` option for explicit timezones; `parse()` rejects `from` timestamps outside the ECMAScript `Date` range. [#35122](https://github.com/oven-sh/bun/pull/35122) [#29282](https://github.com/oven-sh/bun/pull/29282)

### Bun.Terminal v1.3.5v1.4.0

[`Bun.Terminal`](https://bun.com/docs/runtime/child-process#terminal-pty-support) is a built-in pseudo-terminal, so you can drive `bash`, `vim`, or `htop` from JavaScript without node-pty.

Pass `terminal` to `Bun.spawn`, write input, resize, and read the colored output. It works on Linux, macOS, and Windows. [#25415](https://github.com/oven-sh/bun/pull/25415) [#29522](https://github.com/oven-sh/bun/pull/29522)

```
const proc = Bun.spawn(["bash"], {
  terminal: {
    cols: 80,
    rows: 24,
    data(term, data) {
      process.stdout.write(data);
    },
  },
});

proc.terminal.write("echo Hello from PTY!\n");
```

### bun run --parallel v1.3.9v1.4.0

`bun run --parallel` runs multiple `package.json` scripts concurrently with name-prefixed output. Glob-match script names, fan out across every workspace with `--filter`, and keep going past failures with `--no-exit-on-error`. This replaces tools like npm-run-all and concurrently. [#26551](https://github.com/oven-sh/bun/pull/26551)

```
# Run "build" and "test" concurrently
```

```
bun run --parallel build test
```

```
# Glob-matched script names
```

```
bun run --parallel "build:*"
```

```
# Run "build" in every workspace package
```

```
bun run --parallel --filter '*' build
```

```
# Keep going even if one package fails
```

```
bun run --parallel --no-exit-on-error --filter '*' test
```

Each line of output is prefixed with the script name (or `package:script` under `--filter`), and `prebuild` / `postbuild` hooks are grouped with their main script so dependency order is preserved. `--sequential` runs scripts one at a time with the same prefixed output and filtering.

❯bun run --parallel "build:\*"

build:client | $ bun build src/client.ts --outdir=dist/client --minify

build:server | $ bun build src/server.ts --outdir=dist/server --target=bun

build:worker | $ bun build src/worker.ts --outdir=dist/worker --target=bun

build:styles | $ bun run src/build-styles.ts

build:client | Bundled 1 module in 4ms

build:server | Bundled 1 module in 4ms

build:client | client.js 69 B (entry point)

build:worker | Bundled 1 module in 3ms

build:server | server.js 153 B (entry point)

build:client | Done in 25ms

build:worker | worker.js 98 B (entry point)

build:server | Done in 32ms

build:worker | Done in 34ms

build:styles | compiled base.css

build:styles | compiled components.css

build:styles | compiled utilities.css

build:styles | compiled theme.css

build:styles | ✓ 4 stylesheets → dist/styles.css

build:styles | Done in 560ms

### 3x faster bun:ffi v1.4.0

[`bun:ffi`](https://bun.com/docs/runtime/ffi) now runs on FFI built into JavaScriptCore, replacing TinyCC. We added native support for FFI to JavaScriptCore.

|  | Bun 1.3 | Bun 1.4 |  |
| --- | --- | --- | --- |
| no-op call | 2.13 ns | **0.70 ns** | 3.0× |
| `new CString(ptr)` | 92.5 ns | **24.1 ns** | 3.8× |
| opentui layout reads (1,000) |  |  | 2.08× |

The new `buffer_length` argument type passes a TypedArray's length alongside its pointer, so the two can't disagree.

```
import { dlopen } from "bun:ffi";

const { symbols } = dlopen("libhash.so", {
  hash: { args: ["buffer", "buffer_length"], returns: "cstring" },
});

const digest = symbols.hash(data, data);
typeof digest; // "string"
```

`returns: "cstring"` now gives you a plain string. `NULL` gives you `null`.

When a call site gets hot, the JIT compiles it into a direct call to the C function. It already knows the argument types from the signature, so it passes unboxed values in registers and skips the type checks and boxing a normal call would do.

![bun:ffi gets up to 3x faster](https://bun.com/images/blog/bun-1.4/tweets/ffi-3x.jpg)

bun:ffi gets up to 3x faster

### Dev tooling v1.3.2v1.4.0

- **`--cpu-prof`, `--cpu-prof-md`**: A `.cpuprofile` for Chrome DevTools, or the same profile as a Markdown report for pasting into a bug or an LLM; `BUN_CPU_PROFILE=1` for processes you can't pass flags to. [#24112](https://github.com/oven-sh/bun/pull/24112) [#26327](https://github.com/oven-sh/bun/pull/26327)
- **`--heap-prof`, `--heap-prof-md`**: A V8-compatible `.heapsnapshot`, or a Markdown report of the biggest types and objects. [#26326](https://github.com/oven-sh/bun/pull/26326)
- **Async stack traces**: Errors from async native APIs (`fs.promises`, `Bun.file()`, S3, DNS, crypto, `fetch`) point back to the `await` in your code. [#28652](https://github.com/oven-sh/bun/pull/28652)
- **`--no-orphans`**: Bun exits when its parent dies and SIGKILLs every descendant on exit, on Linux, macOS, and Windows. [#29930](https://github.com/oven-sh/bun/pull/29930)
- **`--no-env-file`**: Skip automatic `.env` loading in production and CI (`env = false` in `bunfig.toml`). [#24767](https://github.com/oven-sh/bun/pull/24767)

### HTTP/3 in Bun.serve() (experimental) v1.3.14v1.4.0

[`Bun.serve()`](https://bun.com/docs/runtime/http/server) supports HTTP/3. Set `http3: true` next to `tls`, and Bun listens on UDP on the same port.

HTTP/1.1 keeps working over TCP, and responses advertise HTTP/3 with an `Alt-Svc` header so browsers upgrade on their own.

On a static-route benchmark, HTTP/3 is 2.7× faster than HTTPS/1.1 on the same server.

```
Bun.serve({
  port: 443,
  tls: { ... },
  http3: true,        // also listen on UDP/443 for HTTP/3
  // h1: false,    // optional: serve HTTP/3 only
  fetch(req) {
    return new Response("hi");
  },
});
```

Experimental: zero-round-trip connection resumption is disabled, `server.upgrade()` returns `false` over H3, and `unix:` sockets skip the H3 listener. Don't ship `http3: true` to production yet. [#29768](https://github.com/oven-sh/bun/pull/29768)

### HTTP/2 & HTTP/3 in fetch() (experimental) v1.3.14v1.4.0

`fetch()` now supports HTTP/2 and HTTP/3. Pass `protocol: "http2"` or `protocol: "http3"`.

```
const [a, b, c] = await Promise.all([
  fetch("https://api.example.com/a", { protocol: "http2" }),
  fetch("https://api.example.com/b", { protocol: "http2" }),
  fetch("https://api.example.com/c", { protocol: "http2" }),
]);

const res = await fetch("https://example.com", { protocol: "http3" });
```

Over HTTP/2, concurrent requests to the same origin share one connection. Redirects, decompression, and streaming work the same as they do over HTTP/1.1.

To turn them on everywhere, set `BUN_FEATURE_FLAG_EXPERIMENTAL_HTTP2_CLIENT=1` or pass `--experimental-http3-fetch`. With the HTTP/3 flag, Bun remembers which origins support it and uses it for later requests on its own.

### Serve files & folders v1.4.0

[`Bun.serve()` routes](https://bun.com/docs/runtime/http/routing) can now serve a directory.

Files stream with `sendfile`. `Content-Type`, `ETag`, `Last-Modified`, `304`, and `Range` are handled for you, and `index.html` is served for directories.

This replaces `express.static`, `serve-static`, and `sirv`. [#36156](https://github.com/oven-sh/bun/pull/36156)

```
Bun.serve({
  routes: {
    "/static/*": { dir: "./public" },
  },
});
```

When serving files from disk, paths are normalized before lookup and on Linux files are opened with `openat2` with `O_RESOLVE_BENEATH`, so a symlink inside the directory can't reach above it.

### Range and conditional requests v1.3.13v1.4.0

`Bun.serve` honors `Range` headers for file responses, so video seeking and resumable downloads work. Both static routes and `Bun.file()` bodies return `206 Partial Content`.

Static routes and `Bun.file()` responses also handle conditional requests. `If-None-Match` and `If-Modified-Since` get a `304`, and `If-Match` and `If-Unmodified-Since` get a `412` when the precondition fails.

```
Bun.serve({
  routes: {
    "/video.mp4": new Response(Bun.file("./video.mp4")),
    "/logo.png": new Response(Bun.file("./logo.png")),
  },
});
```

```
curl -H 'Range: bytes=0-1023' localhost:3000/video.mp4
```

```
HTTP/1.1 206 Partial Content
Content-Range: bytes 0-1023/104857600
```

```
curl -H 'If-None-Match: "1a2b3c"' localhost:3000/logo.png
```

```
HTTP/1.1 304 Not Modified
```

### HTML routes sourcemaps disabled in production v1.4.0

In production, `Bun.serve` no longer serves sourcemaps for HTML routes, so your original source stays on your server.

Development mode still serves them. Set `sourcemap` under `[serve.static]` in `bunfig.toml` to pick explicitly. [#36982](https://github.com/oven-sh/bun/pull/36982)

```
[serve.static]
sourcemap = "linked"
```

### fetch() request compression v1.4.0

`fetch()` gains a `compress` option. It compresses the request body before sending and sets the `Content-Encoding` header automatically. It supports `gzip`, `deflate`, `br`, and `zstd`, with an optional compression level. Buffered bodies (string, `ArrayBuffer`, `TypedArray`, `Blob`) are compressed, and `Content-Length` reflects the compressed size. Streaming bodies pass through unchanged. [#32416](https://github.com/oven-sh/bun/pull/32416)

```
await fetch(url, {
  method: "POST",
  body: largeJsonString,
  compress: "gzip", // or true, "deflate", "br", "zstd", { encoding, level }
});
```

### fetch() proxy headers v1.3.4

`fetch()` 's `proxy` option now also accepts an object with `url` and `headers`, letting you send custom headers (like `Proxy-Authorization`) directly to the proxy server, whether the destination is HTTPS or plain HTTP. [#25090](https://github.com/oven-sh/bun/pull/25090)

```
await fetch(url, {
  proxy: {
    url: "http://proxy.example.com:8080",
    headers: { "Proxy-Authorization": "Bearer token" },
  },
});
```

### TLS session resumption v1.4.0

A second cold connection to an origin [resumes at 1 RTT](https://github.com/oven-sh/bun/pull/36598). A 32-entry LRU caches BoringSSL client sessions per origin, so reconnecting after the keep-alive pool evicts skips the full handshake and certificate-chain walk.

### Connection reuse v1.3.10v1.4.0

`fetch()` reuses connections through an HTTPS proxy, and reuses them for requests with custom TLS options like a client certificate or a custom CA. [#28611](https://github.com/oven-sh/bun/pull/28611) [#37715](https://github.com/oven-sh/bun/pull/37715) [#27385](https://github.com/oven-sh/bun/pull/27385)

### Also built in v1.3.3v1.4.0

- **[`Bun.JSON5`](https://bun.com/docs/runtime/json5)**: `Bun.JSON5.parse()` / `stringify()`; import `.json5` files directly. Replaces json5.
- **[`Bun.JSONL`](https://bun.com/docs/runtime/jsonl)**: `parse()` and streaming `parseChunk()` for newline-delimited JSON. Replaces ndjson.
- **[`Bun.JSONC.parse()`](https://bun.com/docs/runtime/file-types)**: JSON with comments and trailing commas, the parser behind `tsconfig.json`. Replaces jsonc-parser.
- **[`Bun.XML`](https://bun.com/docs/runtime/xml)**: SIMD XML parser and serializer; import `.xml` files directly. Replaces fast-xml-parser and xml2js.
- **[`Bun.TOML`](https://bun.com/docs/runtime/toml)**: TOML v1.1.0, 708/708 of `toml-test`; new `stringify()`. Replaces @iarna/toml.
- **[`Bun.Archive`](https://bun.com/docs/runtime/archive)**: Create and extract tarballs off the main thread. Replaces tar.
- **[`Bun.sliceAnsi()`](https://bun.com/docs/runtime/utils), [`Bun.wrapAnsi()`](https://bun.com/docs/runtime/utils), [`Bun.stringWidth()`](https://bun.com/docs/runtime/utils)**: Terminal-column-aware slicing, wrapping, and measurement, ANSI and grapheme aware. Replaces slice-ansi, cli-truncate, wrap-ansi, and string-width.
- **`URLPattern`**: The Web API, 408 WPT passing. Replaces path-to-regexp.
- **`CompressionStream` / `DecompressionStream`**: Web-standard streams for `gzip`, `deflate`, `deflate-raw`, plus `brotli` and `zstd`.
- **`Response.textStream()`**: A `ReadableStream<string>` of the body decoded as UTF-8.
- **`process.on("memoryPressure")`**: The OS's low-memory notification on macOS, Linux, and Windows.
- **ML-DSA and ML-KEM**: NIST post-quantum signatures and key encapsulation in `crypto.subtle` and `node:crypto`.
- **[`Bun.spawn({ cgroup })`](https://bun.com/docs/runtime/child-process#resource-limits-with-cgroups-linux)**: Place a child in a cgroup before it starts, on Linux.
- **[`bun repl`](https://bun.com/docs/runtime/repl)**: Native REPL: highlighting, history, tab completion, `-e` / `-p`.
- **`bun ./README.md`**: Renders Markdown to the terminal, no VM started. Replaces glow.

## bun install

`bun install` is an npm-compatible package manager.

On a T3-stack Next.js app, `bun install` is many times faster than yarn, pnpm, and npm, and uses a fraction of the memory.

That holds for a first install, a fresh checkout, CI with and without a cache, and a no-op reinstall:

One app, six installs

T3-stack Next.js app, 25 direct dependencies, ~220 packages in the lockfile · install time and peak memory

[source ↗](https://github.com/oven-sh/bun/tree/main/bench/install)

| Scenario | bunv1.4 | npmv12.0.2 | pnpmv11.21.0 | yarnv1.22.22 |
| --- | --- | --- | --- | --- |
| First install, ever  no cache · no lockfile · no node\_modules | 1.41s  15× faster  376 MB | 18.1s  503 MB | 13.5s  1.8 GB | 20.5s  498 MB |
| Fresh checkout, warm cache  no lockfile yet · every package already in the cache | 251ms  30× faster  52 MB | 7.61s  798 MB | 2.38s  1.1 GB | 1.83s  204 MB |
| CI without a cache  lockfile committed · every tarball fetched from the registry | 951ms  19× faster  214 MB | 4.92s  455 MB | 11.7s  2.7 GB | 17.6s  323 MB |
| CI with a warm cache  lockfile committed · dependency cache restored · node\_modules rebuilt | 210ms  21× faster  12 MB | 4.45s  698 MB | 1.92s  1.4 GB | 1.76s  205 MB |
| node\_modules there, cache gone  already installed · only the dependency cache was cleared | 12ms  33× faster  12 MB | 384ms  129 MB | 399ms  141 MB | 212ms  107 MB |
| Everything already up to date  the reinstall after nothing changed | 12ms  33× faster  12 MB | 337ms  114 MB | 400ms  141 MB | 211ms  107 MB |

Linux x64, EPYC 9R14 · bench/install in oven-sh/bun · each package manager with its own lockfile and node\_modules, state prepared per scenario before every run, every package manager at defaults · medians of 3, peak memory is the largest of the 3 runs

### Global virtual store: up to 7x faster installs v1.3.14v1.4.0

`bun install --linker=isolated` now uses a shared global virtual store. Packages are extracted once into Bun's cache and symlinked into each project's `node_modules/.bun/` store, instead of being copied into `node_modules` on every install. [#29489](https://github.com/oven-sh/bun/pull/29489)

On a warm isolated install, copying packages into `node_modules` (`clonefileat()` on macOS) was 95% of main-thread time, and macOS runs only one of those calls at a time.

Once a package exists anywhere on the machine, later installs do one `symlink()` per package instead of one `clonefileat()`.

On the common CI path (lockfile present, cache warm, `node_modules` wiped), a 1,400-package install is **7x faster**. The global store is opt-in: it applies when you select the isolated linker, which is not the default for existing projects.

```
# bunfig.toml
[install]
linker = "isolated"
```

### bun pm diff v1.4.0

[`bun pm diff`](https://bun.com/docs/pm/cli/pm#diff) shows you what changed between two versions of a package.

It starts with a summary: which files changed, any new install scripts, and any new imports of `child_process`, `fs`, `net`, or `vm`. Then it shows the diff.

Minified files are un-minified before diffing, and formatting-only changes are skipped, so you see the lines that actually changed. [#39229](https://github.com/oven-sh/bun/pull/39229)

```
bun pm diff react                     # the version in bun.lock → latest
```

```
bun pm diff react@18.2.0 19.0.0       # two published versions
```

```
bun pm diff ./vendored-pkg pkg@2.1.0  # a folder against a published version
```

```
bun pm diff react-dom@18.2.0 18.3.1 '*.min.js'
```

### bun audit fix v1.4.0

[`bun audit fix`](https://bun.com/docs/pm/cli/audit#bun-audit-fix) upgrades vulnerable packages to a safe version and installs.

If a fix needs a new major version, it tells you, and `--latest` lets it do that. `--dry-run` shows what it would change. [#38333](https://github.com/oven-sh/bun/pull/38333)

```
bun audit fix
```

```
fixing:
  ms@0.7.0 → 0.7.1
  lodash@4.17.20 → 4.17.21
    package.json: 4.17.20 → 4.17.21

blocked by a dependent's range:
  minimatch@0.3.0 → 3.0.2
    express@3.21.2 depends on minimatch@0.3.0

Fixed 2 vulnerabilities in 2 packages
1 vulnerability remaining
```

### bun dedupe v1.4.0

[`bun dedupe`](https://bun.com/docs/pm/cli/dedupe) removes duplicate versions of packages from `bun.lock`.

If you have `esbuild@0.15.10` and `esbuild@0.15.11` and one version satisfies both, you end up with one. It never changes `package.json`, and `--check` fails CI if there are duplicates. [#38333](https://github.com/oven-sh/bun/pull/38333)

```
bun dedupe
```

```
bun dedupe v1.4.0 (abc12345)

↳ esbuild 0.15.10 → 0.15.11
↳ react 18.2.0 → 18.3.1

2 duplicate versions removed, 3 packages installed (checked 5 packages) [12.00ms]
```

### bun prune v1.4.0

[`bun prune`](https://bun.com/docs/pm/cli/prune) deletes packages from `node_modules` that aren't in `bun.lock` anymore.

`bun prune --production` also deletes `devDependencies`, so you can build with them and ship without them. [#38333](https://github.com/oven-sh/bun/pull/38333)

```
bun prune --production
```

```
bun prune v1.4.0 (abc12345)

- typescript@5.4.0
- @types/node@20.11.5
2 packages removed (checked 948) [22.00ms]
```

```
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build
RUN bun prune --production
```

### bun pm licenses v1.4.0

`bun pm licenses` lists your dependencies by license.

`--json` gives you machine-readable output, and `--prod` skips `devDependencies`. [#38333](https://github.com/oven-sh/bun/pull/38333)

```
bun pm licenses --prod --json > licenses.json
```

### bun update updates transitive dependencies v1.4.0

`bun update` now updates the dependencies of your dependencies too, not just the ones in your `package.json`.

```
bun update
```

```
bun update zod
```

```
bun update '@types/*' --latest
```

`bun update <name>` updates that package everywhere it appears, and `bun update '@types/*'` takes a pattern. [#38333](https://github.com/oven-sh/bun/pull/38333)

### bun add --filter v1.4.0

`bun add`, `bun remove`, and `bun update` accept `--filter`, so you can add a package to one workspace from the root of your monorepo.

```
bun add zod --filter api
```

```
bun run --filter 'web...' build
```

`--filter 'web...'` means `web` and everything it depends on. `--filter '...web'` means everything that depends on `web`.

### bun add --catalog v1.4.0

`bun add <pkg> --catalog` adds the package to your root catalog and writes `"catalog:"` in the workspace's `package.json`.

```
bun add react --catalog
```

If the package is already in your default catalog, plain `bun add` uses it.

### Nested overrides v1.4.0

You can now override a dependency's dependency without overriding it everywhere. npm's nested form, yarn's `a/b`, and pnpm's `a>b` all work, and an override can be scoped to a version range.

```
{
  "overrides": {
    "express": { "qs": "6.13.0" },
    "lodash@<4.17.21": "4.17.21"
  }
}
```

### Lockfile integrity for GitHub and tarball dependencies v1.3.10

`bun.lock` now records a SHA-512 hash for GitHub and tarball dependencies, the same way it always has for npm packages. Existing lockfiles pick up the hashes on the next install.

```
["pkg@github:user/repo#ref", {}, "resolved-commit"]
["pkg@github:user/repo#ref", {}, "resolved-commit", "sha512-..."]
```

### trustedDependencies only auto-trusts the npm registry v1.3.5

Bun's default trusted-dependencies list applies only to packages from the npm registry.

A `file:`, `link:`, `git:`, or `github:` dependency named esbuild gets no trust from the real esbuild's entry. To run its lifecycle scripts, list it in `trustedDependencies` yourself.

```
{
  "dependencies": {
    "esbuild": "github:some-fork/esbuild#main"
  },
  "trustedDependencies": ["esbuild"]
}
```

Trusted-dependency names, `.npmrc` scope names, and local `file:` paths are compared by their full bytes rather than a hash, and registry credentials stay scoped to their configured host — never sent cross-origin, downgraded to `http://`, or printed in error or verbose output.

### nativeDependencies and ignoreScripts v1.3.2

For packages that ship prebuilt binaries as per-platform `optionalDependencies` (esbuild and @esbuild/darwin-arm64), Bun links the right binary directly instead of running `postinstall`. List them in `nativeDependencies`.

`ignoreScripts` skips a package's lifecycle scripts entirely, even if it is also in [`trustedDependencies`](https://bun.com/docs/pm/lifecycle#trusteddependencies). [#24283](https://github.com/oven-sh/bun/pull/24283)

Configure both in `package.json`, or disable native binary linking with [`BUN_FEATURE_FLAG_DISABLE_NATIVE_DEPENDENCY_LINKER=1`](https://bun.com/docs/pm/cli/install) and script skipping with `BUN_FEATURE_FLAG_DISABLE_IGNORE_SCRIPTS=1`.

```
{
  "nativeDependencies": ["esbuild", "my-custom-package"],
  "ignoreScripts": ["sharp", "another-package"]
}
```

## bun test

`bun test --parallel` runs test files across worker processes. `--shard` splits them across CI machines. `--timings` balances both by how long each file takes. `--changed` runs only the tests your diff touches.

```
bun test --changed=main                                  # only what your branch touches
```

```
bun test --parallel --timings=timings.json --update-timings
```

```
bun test --parallel --shard=1/3 --timings=timings.json   # in CI, per machine
```

### bun test --parallel v1.3.13v1.4.0

`bun test --parallel[=N]` runs test files across N worker processes (defaulting to your CPU count). Files go to whichever worker frees up next. [#29354](https://github.com/oven-sh/bun/pull/29354)

```
bun test --parallel
```

```
bun test --parallel=4 --isolate
```

Coverage and JUnit output are merged across workers. `--bail` stops every worker on the first failure.

`--parallel` implies `--isolate` (below). `--no-isolate` turns that off, so each worker keeps one global and one module registry for every file it runs.

Each worker exposes its 1-indexed slot as `JEST_WORKER_ID` / `BUN_TEST_WORKER_ID`, so Jest setups that key databases or ports off `JEST_WORKER_ID` work unchanged. Preload scripts with top-level `await` complete before any worker starts running tests.

bun test --parallel · files go to whichever worker frees up

bun test

9.4s

bun test --parallel=4

2.4s3.9× faster

✓ done · 9.4s

w1

w2

w3

w4

✓ done · 2.4s · workers idle

Same 24 test files, same durations, one wall-clock. `--parallel=4` hands each file to whichever worker’s queue is shortest — so the 1.8s `sql/postgres.test.ts` outlier ties up one lane while the other three keep going, and all four finish within ~7% of each other. Durations illustrative. [#29354](https://github.com/oven-sh/bun/pull/29354)

### bun test --isolate v1.3.13v1.4.0

`bun test --isolate` runs each test file in a fresh JavaScript global object, in the same process. This is how Jest and Vitest behave by default. It makes "passes alone, fails in the full suite" bugs go away. [#29354](https://github.com/oven-sh/bun/pull/29354)

```
bun test --isolate
```

Between files, Bun:

- creates a new `globalThis`, so properties a file put on `globalThis`, patched built-ins, and module-level state are gone
- clears the ESM and CommonJS module registries, so every file re-evaluates its imports
- closes servers, sockets, file watchers, and subprocesses the file left open, cancels its timers, and restores fake timers
- re-runs `--preload` scripts in the new global

Transpiled source and bytecode are cached at the process level and shared across globals. The second file to import a module skips reading, transpiling, and parsing it. Only the module's top-level code runs again.

Bun 1.4 fixes several stability problems from the first release of `--isolate`:

- Fake timers a file left installed no longer leak into the next file. [#36385](https://github.com/oven-sh/bun/pull/36385)
- Subprocesses started at module scope are killed when the file ends, instead of outliving the run. [#38750](https://github.com/oven-sh/bun/pull/38750)
- `process.chdir()` in one file no longer changes the working directory of the next file. [#36175](https://github.com/oven-sh/bun/pull/36175)
- Servers, sockets, and other handles a file leaked no longer pin its global object in memory. [#31793](https://github.com/oven-sh/bun/pull/31793)
- A `--preload` script with top-level `await` finishes before the first test runs. [#30888](https://github.com/oven-sh/bun/pull/30888)
- Native addons (N-API) work across files, instead of pointing at the previous file's global. [#30216](https://github.com/oven-sh/bun/pull/30216)
- Fixed a crash when garbage collection ran during the swap between two files. [#29573](https://github.com/oven-sh/bun/pull/29573)
- The debugger resolves breakpoints in files loaded under `--isolate`. [#37352](https://github.com/oven-sh/bun/pull/37352)

### bun test --shard v1.3.13v1.4.0

`bun test --shard=M/N` splits your test files across multiple CI runners. Files are sorted deterministically and distributed round-robin so every machine sees the same partition, with 1-based indexing matching Jest, Vitest, and Playwright. Works alongside `--changed` and `--randomize`. An empty shard exits 0 instead of failing. [#29366](https://github.com/oven-sh/bun/pull/29366)

```
# In a matrix of 3 jobs:
```

```
bun test --shard=1/3
```

```
bun test --shard=2/3
```

```
bun test --shard=3/3
```

### bun test --timings v1.4.0

`--timings=<path>` reads per-file durations from a previous run so `--shard` and `--parallel` balance by wall time instead of file count. `--update-timings` records the durations. [#36814](https://github.com/oven-sh/bun/pull/36814)

```
bun test --timings=timings.json --update-timings   # record per-file durations
```

```
bun test --shard=1/3 --timings=timings.json        # cut shards by equal time
```

```
bun test --parallel --timings=timings.json         # workers start slowest first
```

With timings, each shard gets about the same total time instead of the same number of files. Files that share imports stay together, so the module cache stays warm.

`--parallel` starts each worker on its slowest file first. The timings file is written slowest-first, so it doubles as a slow-test report.

![bun test --timings and --parallel --shard using longest-processing-time-first scheduling](https://bun.com/images/blog/bun-1.4/tweets/test-timings.jpg)

\`bun test --timings\` records how long each test file takes; \`bun test --parallel --shard=i/N\` uses timings to split CI shards via longest-processing-time-first scheduling, making large test suites run faster

### bun test --changed v1.3.13v1.4.0

`bun test --changed` runs only the test files affected by your uncommitted changes, or by the diff against a branch or commit with `--changed=main`. The flag is vitest-compatible. [#29262](https://github.com/oven-sh/bun/pull/29262)

```
bun test --changed           # uncommitted (unstaged + staged + untracked)
```

```
bun test --changed=HEAD~1    # diff against a commit / branch / tag
```

```
bun test --changed=main
```

```
bun test --changed --watch   # re-filters on every restart
```

Bun scans every test file's imports, asks git which files changed, and walks the import graph backwards to find the tests that reach them.

tsconfig `paths` aliases like `@/*` work. With `--watch`, editing any source file re-filters on restart.

bun test --changed

1 of 3 · you edit src/lib/utils.ts

→ running 2 of 3 test files

<svg viewBox="0 0 760 290" role="img" aria-label="Import graph: four test files at the top, source files below, edges are imports."><g><line data-e="aT&gt;date" x1="150" y1="40" x2="150" y2="145" stroke-width="1.5" stroke-linecap="round" style="--l:#7c3aed;--d:#a78bfa;stroke-opacity:1;transition:stroke .3s ease-out, stroke-opacity .3s ease-out" stroke="currentColor" stroke-opacity="0.2"></line><line data-e="bT&gt;auth" x1="350" y1="40" x2="350" y2="145" stroke-width="1.5" stroke-linecap="round" style="--l:#7c3aed;--d:#a78bfa;stroke-opacity:1;transition:stroke .3s ease-out, stroke-opacity .3s ease-out" stroke="currentColor" stroke-opacity="0.2"></line><line data-e="cT&gt;cli" x1="610" y1="40" x2="610" y2="145" stroke-width="1.5" stroke-linecap="round" style="--l:rgb(#888);--d:#2a2f3a;stroke-opacity:0.18;transition:stroke .3s ease-out, stroke-opacity .3s ease-out" stroke="currentColor" stroke-opacity="0.2"></line><line data-e="date&gt;utils" x1="150" y1="145" x2="250" y2="250" stroke-width="1.5" stroke-linecap="round" style="--l:#7c3aed;--d:#a78bfa;stroke-opacity:1;transition:stroke .3s ease-out, stroke-opacity .3s ease-out" stroke="currentColor" stroke-opacity="0.2"></line><line data-e="auth&gt;utils" x1="350" y1="145" x2="250" y2="250" stroke-width="1.5" stroke-linecap="round" style="--l:#7c3aed;--d:#a78bfa;stroke-opacity:1;transition:stroke .3s ease-out, stroke-opacity .3s ease-out" stroke="currentColor" stroke-opacity="0.2"></line></g><g><g transform="translate(150,40)"><rect data-n="aT" x="-38.5" y="-11" width="77" height="22" rx="5" stroke-width="1.5" style="--fl:#dcfce7;--fd:#4ade80;--sl:rgb(currentColor);--sd:#4ade80;transition:fill .3s ease-out, stroke .3s ease-out" fill="none" stroke="currentColor"></rect><text text-anchor="middle" dy="-16" font-size="8" style="font-family:monospace" fill="currentColor">TEST</text> <text text-anchor="middle" dy="4" font-size="11" style="--l:#166534;--d:#0b0c10;transition:fill .3s ease-out;font-family:monospace" fill="currentColor">date.test</text></g> <g transform="translate(350,40)"><rect data-n="bT" x="-38.5" y="-11" width="77" height="22" rx="5" stroke-width="1.5" style="--fl:#dcfce7;--fd:#4ade80;--sl:rgb(currentColor);--sd:#4ade80;transition:fill .3s ease-out, stroke .3s ease-out" fill="none" stroke="currentColor"></rect><text text-anchor="middle" dy="-16" font-size="8" style="font-family:monospace" fill="currentColor">TEST</text> <text text-anchor="middle" dy="4" font-size="11" style="--l:#166534;--d:#0b0c10;transition:fill .3s ease-out;font-family:monospace" fill="currentColor">auth.test</text></g> <g transform="translate(610,40)"><rect data-n="cT" x="-35.5" y="-11" width="71" height="22" rx="5" stroke-width="1.5" style="--fl:rgb(#888);--fd:#1a1d24;--sl:rgb(currentColor);--sd:#2a2f3a;transition:fill .3s ease-out, stroke .3s ease-out" fill="none" stroke="currentColor"></rect><text text-anchor="middle" dy="-16" font-size="8" style="font-family:monospace" fill="currentColor">TEST</text> <text text-anchor="middle" dy="4" font-size="11" style="--l:rgb(currentColor);--d:#d1d5db;transition:fill .3s ease-out;font-family:monospace" fill="currentColor">cli.test</text></g> <g transform="translate(150,145)"><rect data-n="date" x="-32" y="-11" width="64" height="22" rx="5" stroke-width="1.5" style="--fl:#ede9fe;--fd:#a78bfa;--sl:#7c3aed;--sd:#a78bfa;transition:fill .3s ease-out, stroke .3s ease-out" fill="none" stroke="currentColor"></rect><text text-anchor="middle" dy="4" font-size="11" style="--l:#5b21b6;--d:#0b0c10;transition:fill .3s ease-out;font-family:monospace" fill="currentColor">date.ts</text></g> <g transform="translate(350,145)"><rect data-n="auth" x="-32" y="-11" width="64" height="22" rx="5" stroke-width="1.5" style="--fl:#ede9fe;--fd:#a78bfa;--sl:#7c3aed;--sd:#a78bfa;transition:fill .3s ease-out, stroke .3s ease-out" fill="none" stroke="currentColor"></rect><text text-anchor="middle" dy="4" font-size="11" style="--l:#5b21b6;--d:#0b0c10;transition:fill .3s ease-out;font-family:monospace" fill="currentColor">auth.ts</text></g> <g transform="translate(610,145)"><rect data-n="cli" x="-29" y="-11" width="58" height="22" rx="5" stroke-width="1.5" style="--fl:rgb(#888);--fd:#1a1d24;--sl:rgb(currentColor);--sd:#2a2f3a;transition:fill .3s ease-out, stroke .3s ease-out" fill="none" stroke="currentColor"></rect><text text-anchor="middle" dy="4" font-size="11" style="--l:rgb(currentColor);--d:#d1d5db;transition:fill .3s ease-out;font-family:monospace" fill="currentColor">cli.ts</text></g> <g transform="translate(250,250)"><rect data-n="utils" x="-35.5" y="-11" width="71" height="22" rx="5" stroke-width="1.5" style="--fl:rgb(currentColor);--fd:#f472b6;--sl:rgb(currentColor);--sd:#f472b6;transition:fill .3s ease-out, stroke .3s ease-out" fill="none" stroke="currentColor"></rect><text text-anchor="middle" dy="4" font-size="11" style="--l:rgb(currentColor);--d:#0b0c10;transition:fill .3s ease-out;font-family:monospace" fill="currentColor">utils.ts</text></g> <g transform="translate(610,250)"><rect data-n="readme" x="-38.5" y="-11" width="77" height="22" rx="5" stroke-width="1.5" style="--fl:rgb(#888);--fd:#1a1d24;--sl:rgb(currentColor);--sd:#2a2f3a;transition:fill .3s ease-out, stroke .3s ease-out" fill="none" stroke="currentColor"></rect><text text-anchor="middle" dy="4" font-size="11" style="--l:rgb(currentColor);--d:#d1d5db;transition:fill .3s ease-out;font-family:monospace" fill="currentColor">README.md</text></g></g></svg>

Same graph, three edits. Bun resolves the import graph once (skipping `node_modules`), then walks it backwards from whatever `git diff` reports.

### bun test --retry v1.3.3v1.4.0

`test()` accepts `{ retry: n }` to re-run a flaky test up to `n` times, and `{ repeats: n }` to run it `n` times and fail if any run fails.

`bun test --retry <N>` sets a default for the whole suite. [#23713](https://github.com/oven-sh/bun/pull/23713) [#26866](https://github.com/oven-sh/bun/pull/26866)

```
test(
  "flaky network call",
  async () => {
    await fetch("https://example.com");
  },
  { retry: 5 },
);

test(
  "stress",
  () => {
    if (Math.random() < 0.1) throw new Error("uh oh!");
  },
  { repeats: 20 },
);
```

### jest.useFakeTimers() v1.3.4v1.4.0

`jest.useFakeTimers()` lets you control `setTimeout`, `setInterval`, and `Date` from your tests.

`@testing-library/react` 's `waitFor` detects the fake timers and advances them instead of waiting in real time. [#23764](https://github.com/oven-sh/bun/pull/23764) [#25915](https://github.com/oven-sh/bun/pull/25915)

```
import { jest, test, expect } from "bun:test";

test("debounce", () => {
  jest.useFakeTimers();
  let called = 0;
  setTimeout(() => called++, 1000);
  jest.advanceTimersByTime(1000);
  expect(called).toBe(1);
  jest.useRealTimers();
});
```

`jest.setSystemTime()` works with `advanceTimersByTime()`, and `Bun.cron` schedules can be driven by the fake clock. [#33623](https://github.com/oven-sh/bun/pull/33623)

## bun build

### Built-in React Compiler v1.4.0

`bun build --react-compiler` (or `reactCompiler: true` in `Bun.build()`) runs React's auto-memoization compiler on your components and hooks with no Babel or SWC in the loop. The compiler runs inside Bun's own parser, so there is no separate parse/print round-trip.

On a large React codebase (~860 components), enabling it adds 71 ms to the build (394 ms → 465 ms), about **20× faster** than the Babel plugin's 9.15 s on the same input. A full `--compile` build finishes in 3.62 s vs 13.04 s (3.6×). [#32504](https://github.com/oven-sh/bun/pull/32504)

```
await Bun.build({
  entrypoints: ["./src/index.tsx"],
  outdir: "./dist",
  reactCompiler: true,
});
```

![bun build --react-compiler is 19x faster than the Babel plugin on a large React codebase](https://bun.com/images/blog/bun-1.4/tweets/react-compiler.jpg)

\`bun build --react-compiler\` runs the React Compiler in Rust. On a large React codebase, it's 19x faster than the Babel plugin

### Barrel import optimization v1.3.10v1.4.0

When you write `import { Button } from "antd"`, Bun skips the hundreds of files behind the names you didn't import.

Packages that declare `"sideEffects": false` get this automatically. For everything else, opt in with `optimizeImports`. [#26892](https://github.com/oven-sh/bun/pull/26892)

```
await Bun.build({
  entrypoints: ["./src/index.tsx"],
  optimizeImports: ["antd", "@mui/material"],
});
```

barrel import optimization · import { Button } from "antd"

Bun 1.4 · optimizeImportsmodules parsed: 4 · 6 ms

<svg viewBox="0 0 760 340" style="aspect-ratio:760/340" aria-hidden="true"><line x1="380" y1="96" x2="172.04370556427023" y2="56.773648798386276" stroke-width="1.25" style="--l:rgb(#888);--d:#3a3d47;stroke-opacity:0.18;pointer-events:none" stroke="currentColor" stroke-opacity="0.2"></line><line x1="380" y1="96" x2="170.6995470171795" y2="68.87340135385477" stroke-width="1.25" style="--l:rgb(#888);--d:#3a3d47;stroke-opacity:0.18;pointer-events:none" stroke="currentColor" stroke-opacity="0.2"></line><line x1="380" y1="96" x2="170.05880303146634" y2="81.03071278558417" stroke-width="1.25" style="--l:rgb(#888);--d:#3a3d47;stroke-opacity:0.18;pointer-events:none" stroke="currentColor" stroke-opacity="0.2"></line><line x1="380" y1="96" x2="170.12362701216762" y2="93.20472494077815" stroke-width="1.25" style="--l:rgb(#888);--d:#3a3d47;stroke-opacity:0.18;pointer-events:none" stroke="currentColor" stroke-opacity="0.2"></line><line x1="380" y1="96" x2="170.89380109959268" y2="105.35452353904078" stroke-width="1.25" style="--l:rgb(#888);--d:#3a3d47;stroke-opacity:0.18;pointer-events:none" stroke="currentColor" stroke-opacity="0.2"></line><line x1="380" y1="96" x2="172.36673690150351" y2="117.43927567662035" stroke-width="1.25" style="--l:rgb(#888);--d:#3a3d47;stroke-opacity:0.18;pointer-events:none" stroke="currentColor" stroke-opacity="0.2"></line><line x1="380" y1="96" x2="174.537484192154" y2="129.4183670571641" stroke-width="1.25" style="--l:rgb(#888);--d:#3a3d47;stroke-opacity:0.18;pointer-events:none" stroke="currentColor" stroke-opacity="0.2"></line><line x1="380" y1="96" x2="177.39874754895166" y2="141.25153848777944" stroke-width="1.25" style="--l:rgb(#888);--d:#3a3d47;stroke-opacity:0.18;pointer-events:none" stroke="currentColor" stroke-opacity="0.2"></line><line x1="380" y1="96" x2="180.94091087083015" y2="152.89902118166762" stroke-width="1.25" style="--l:rgb(currentColor);--d:#4ade80;stroke-opacity:0.9;pointer-events:none" stroke="currentColor" stroke-opacity="0.2"></line><line x1="380" y1="96" x2="185.15206969593152" y2="164.32167041260595" stroke-width="1.25" style="--l:rgb(currentColor);--d:#4ade80;stroke-opacity:0.9;pointer-events:none" stroke="currentColor" stroke-opacity="0.2"></line><line x1="380" y1="96" x2="190.01807120998504" y2="175.48109707209494" stroke-width="1.25" style="--l:rgb(currentColor);--d:#4ade80;stroke-opacity:0.9;pointer-events:none" stroke="currentColor" stroke-opacity="0.2"></line><line x1="380" y1="96" x2="195.52256181092295" y2="186.33979668703367" stroke-width="1.25" style="--l:rgb(currentColor);--d:#4ade80;stroke-opacity:0.9;pointer-events:none" stroke="currentColor" stroke-opacity="0.2"></line><line x1="380" y1="96" x2="201.64704206987886" y2="196.86127546432272" stroke-width="1.25" style="--l:rgb(#888);--d:#3a3d47;stroke-opacity:0.18;pointer-events:none" stroke="currentColor" stroke-opacity="0.2"></line><line x1="380" y1="96" x2="208.37092890385597" y2="207.01017293878536" stroke-width="1.25" style="--l:rgb(#888);--d:#3a3d47;stroke-opacity:0.18;pointer-events:none" stroke="currentColor" stroke-opacity="0.2"></line><line x1="380" y1="96" x2="215.6716247511162" y2="216.75238081221326" stroke-width="1.25" style="--l:rgb(#888);--d:#3a3d47;stroke-opacity:0.18;pointer-events:none" stroke="currentColor" stroke-opacity="0.2"></line><line x1="380" y1="96" x2="223.52459351680673" y2="226.0551575841441" stroke-width="1.25" style="--l:rgb(#888);--d:#3a3d47;stroke-opacity:0.18;pointer-events:none" stroke="currentColor" stroke-opacity="0.2"></line><line x1="380" y1="96" x2="231.9034430335856" y2="234.8872385891201" stroke-width="1.25" style="--l:rgb(#888);--d:#3a3d47;stroke-opacity:0.18;pointer-events:none" stroke="currentColor" stroke-opacity="0.2"></line><line x1="380" y1="96" x2="240.78001376011562" y2="243.21894107061783" stroke-width="1.25" style="--l:rgb(#888);--d:#3a3d47;stroke-opacity:0.18;pointer-events:none" stroke="currentColor" stroke-opacity="0.2"></line><line x1="380" y1="96" x2="250.12447341932727" y2="251.0222639385152" stroke-width="1.25" style="--l:rgb(#888);--d:#3a3d47;stroke-opacity:0.18;pointer-events:none" stroke="currentColor" stroke-opacity="0.2"></line><line x1="380" y1="96" x2="259.9054172583937" y2="258.2709818748343" stroke-width="1.25" style="--l:rgb(#888);--d:#3a3d47;stroke-opacity:0.18;pointer-events:none" stroke="currentColor" stroke-opacity="0.2"></line><line x1="380" y1="96" x2="270.08997359346336" y2="264.9407334714889" stroke-width="1.25" style="--l:rgb(#888);--d:#3a3d47;stroke-opacity:0.18;pointer-events:none" stroke="currentColor" stroke-opacity="0.2"></line><line x1="380" y1="96" x2="280.64391428443844" y2="271.0091031038256" stroke-width="1.25" style="--l:rgb(#888);--d:#3a3d47;stroke-opacity:0.18;pointer-events:none" stroke="currentColor" stroke-opacity="0.2"></line><line x1="380" y1="96" x2="291.5317697685149" y2="276.4556962647979" stroke-width="1.25" style="--l:rgb(#888);--d:#3a3d47;stroke-opacity:0.18;pointer-events:none" stroke="currentColor" stroke-opacity="0.2"></line><line x1="380" y1="96" x2="302.71694826588293" y2="281.26220810659134" stroke-width="1.25" style="--l:rgb(#888);--d:#3a3d47;stroke-opacity:0.18;pointer-events:none" stroke="currentColor" stroke-opacity="0.2"></line><line x1="380" y1="96" x2="314.1618587569602" y2="285.4124849593464" stroke-width="1.25" style="--l:rgb(#888);--d:#3a3d47;stroke-opacity:0.18;pointer-events:none" stroke="currentColor" stroke-opacity="0.2"></line><line x1="380" y1="96" x2="325.8280373178595" y2="288.89257862022646" stroke-width="1.25" style="--l:rgb(#888);--d:#3a3d47;stroke-opacity:0.18;pointer-events:none" stroke="currentColor" stroke-opacity="0.2"></line><line x1="380" y1="96" x2="337.67627638950296" y2="291.69079323037835" stroke-width="1.25" style="--l:rgb(#888);--d:#3a3d47;stroke-opacity:0.18;pointer-events:none" stroke="currentColor" stroke-opacity="0.2"></line><line x1="380" y1="96" x2="349.6667565459365" y2="293.7977245822401" stroke-width="1.25" style="--l:rgb(#888);--d:#3a3d47;stroke-opacity:0.18;pointer-events:none" stroke="currentColor" stroke-opacity="0.2"></line><line x1="380" y1="96" x2="361.75918031900017" y2="295.2062917250943" stroke-width="1.25" style="--l:rgb(#888);--d:#3a3d47;stroke-opacity:0.18;pointer-events:none" stroke="currentColor" stroke-opacity="0.2"></line><line x1="380" y1="96" x2="373.91290762959676" y2="295.9117607626456" stroke-width="1.25" style="--l:rgb(#888);--d:#3a3d47;stroke-opacity:0.18;pointer-events:none" stroke="currentColor" stroke-opacity="0.2"></line><line x1="380" y1="96" x2="386.08709237040324" y2="295.9117607626456" stroke-width="1.25" style="--l:rgb(#888);--d:#3a3d47;stroke-opacity:0.18;pointer-events:none" stroke="currentColor" stroke-opacity="0.2"></line><line x1="380" y1="96" x2="398.24081968099983" y2="295.2062917250943" stroke-width="1.25" style="--l:rgb(#888);--d:#3a3d47;stroke-opacity:0.18;pointer-events:none" stroke="currentColor" stroke-opacity="0.2"></line><line x1="380" y1="96" x2="410.3332434540635" y2="293.7977245822401" stroke-width="1.25" style="--l:rgb(#888);--d:#3a3d47;stroke-opacity:0.18;pointer-events:none" stroke="currentColor" stroke-opacity="0.2"></line><line x1="380" y1="96" x2="422.32372361049704" y2="291.69079323037835" stroke-width="1.25" style="--l:rgb(#888);--d:#3a3d47;stroke-opacity:0.18;pointer-events:none" stroke="currentColor" stroke-opacity="0.2"></line><line x1="380" y1="96" x2="434.1719626821405" y2="288.89257862022646" stroke-width="1.25" style="--l:rgb(#888);--d:#3a3d47;stroke-opacity:0.18;pointer-events:none" stroke="currentColor" stroke-opacity="0.2"></line><line x1="380" y1="96" x2="445.8381412430398" y2="285.4124849593464" stroke-width="1.25" style="--l:rgb(#888);--d:#3a3d47;stroke-opacity:0.18;pointer-events:none" stroke="currentColor" stroke-opacity="0.2"></line><line x1="380" y1="96" x2="457.28305173411707" y2="281.26220810659134" stroke-width="1.25" style="--l:rgb(#888);--d:#3a3d47;stroke-opacity:0.18;pointer-events:none" stroke="currentColor" stroke-opacity="0.2"></line><line x1="380" y1="96" x2="468.4682302314851" y2="276.4556962647979" stroke-width="1.25" style="--l:rgb(#888);--d:#3a3d47;stroke-opacity:0.18;pointer-events:none" stroke="currentColor" stroke-opacity="0.2"></line><line x1="380" y1="96" x2="479.35608571556156" y2="271.0091031038256" stroke-width="1.25" style="--l:rgb(#888);--d:#3a3d47;stroke-opacity:0.18;pointer-events:none" stroke="currentColor" stroke-opacity="0.2"></line><line x1="380" y1="96" x2="489.9100264065366" y2="264.9407334714889" stroke-width="1.25" style="--l:rgb(#888);--d:#3a3d47;stroke-opacity:0.18;pointer-events:none" stroke="currentColor" stroke-opacity="0.2"></line><line x1="380" y1="96" x2="500.09458274160625" y2="258.2709818748343" stroke-width="1.25" style="--l:rgb(#888);--d:#3a3d47;stroke-opacity:0.18;pointer-events:none" stroke="currentColor" stroke-opacity="0.2"></line><line x1="380" y1="96" x2="509.8755265806727" y2="251.0222639385152" stroke-width="1.25" style="--l:rgb(#888);--d:#3a3d47;stroke-opacity:0.18;pointer-events:none" stroke="currentColor" stroke-opacity="0.2"></line><line x1="380" y1="96" x2="519.2199862398844" y2="243.21894107061783" stroke-width="1.25" style="--l:rgb(#888);--d:#3a3d47;stroke-opacity:0.18;pointer-events:none" stroke="currentColor" stroke-opacity="0.2"></line><line x1="380" y1="96" x2="528.0965569664144" y2="234.8872385891201" stroke-width="1.25" style="--l:rgb(#888);--d:#3a3d47;stroke-opacity:0.18;pointer-events:none" stroke="currentColor" stroke-opacity="0.2"></line><line x1="380" y1="96" x2="536.4754064831933" y2="226.0551575841441" stroke-width="1.25" style="--l:rgb(#888);--d:#3a3d47;stroke-opacity:0.18;pointer-events:none" stroke="currentColor" stroke-opacity="0.2"></line><line x1="380" y1="96" x2="544.3283752488837" y2="216.75238081221335" stroke-width="1.25" style="--l:rgb(#888);--d:#3a3d47;stroke-opacity:0.18;pointer-events:none" stroke="currentColor" stroke-opacity="0.2"></line><line x1="380" y1="96" x2="551.6290710961441" y2="207.01017293878533" stroke-width="1.25" style="--l:rgb(#888);--d:#3a3d47;stroke-opacity:0.18;pointer-events:none" stroke="currentColor" stroke-opacity="0.2"></line><line x1="380" y1="96" x2="558.3529579301212" y2="196.86127546432272" stroke-width="1.25" style="--l:rgb(#888);--d:#3a3d47;stroke-opacity:0.18;pointer-events:none" stroke="currentColor" stroke-opacity="0.2"></line><line x1="380" y1="96" x2="564.477438189077" y2="186.33979668703367" stroke-width="1.25" style="--l:rgb(#888);--d:#3a3d47;stroke-opacity:0.18;pointer-events:none" stroke="currentColor" stroke-opacity="0.2"></line><line x1="380" y1="96" x2="569.981928790015" y2="175.48109707209494" stroke-width="1.25" style="--l:rgb(#888);--d:#3a3d47;stroke-opacity:0.18;pointer-events:none" stroke="currentColor" stroke-opacity="0.2"></line><line x1="380" y1="96" x2="574.8479303040685" y2="164.32167041260595" stroke-width="1.25" style="--l:rgb(#888);--d:#3a3d47;stroke-opacity:0.18;pointer-events:none" stroke="currentColor" stroke-opacity="0.2"></line><line x1="380" y1="96" x2="579.0590891291699" y2="152.89902118166754" stroke-width="1.25" style="--l:rgb(#888);--d:#3a3d47;stroke-opacity:0.18;pointer-events:none" stroke="currentColor" stroke-opacity="0.2"></line><line x1="380" y1="96" x2="582.6012524510484" y2="141.25153848777944" stroke-width="1.25" style="--l:rgb(#888);--d:#3a3d47;stroke-opacity:0.18;pointer-events:none" stroke="currentColor" stroke-opacity="0.2"></line><line x1="380" y1="96" x2="585.462515807846" y2="129.4183670571641" stroke-width="1.25" style="--l:rgb(#888);--d:#3a3d47;stroke-opacity:0.18;pointer-events:none" stroke="currentColor" stroke-opacity="0.2"></line><line x1="380" y1="96" x2="587.6332630984965" y2="117.43927567662035" stroke-width="1.25" style="--l:rgb(#888);--d:#3a3d47;stroke-opacity:0.18;pointer-events:none" stroke="currentColor" stroke-opacity="0.2"></line><line x1="380" y1="96" x2="589.1061989004073" y2="105.35452353904078" stroke-width="1.25" style="--l:rgb(#888);--d:#3a3d47;stroke-opacity:0.18;pointer-events:none" stroke="currentColor" stroke-opacity="0.2"></line><line x1="380" y1="96" x2="589.8763729878324" y2="93.20472494077815" stroke-width="1.25" style="--l:rgb(#888);--d:#3a3d47;stroke-opacity:0.18;pointer-events:none" stroke="currentColor" stroke-opacity="0.2"></line><line x1="380" y1="96" x2="589.9411969685336" y2="81.03071278558413" stroke-width="1.25" style="--l:rgb(#888);--d:#3a3d47;stroke-opacity:0.18;pointer-events:none" stroke="currentColor" stroke-opacity="0.2"></line><line x1="380" y1="96" x2="589.3004529828205" y2="68.87340135385477" stroke-width="1.25" style="--l:rgb(#888);--d:#3a3d47;stroke-opacity:0.18;pointer-events:none" stroke="currentColor" stroke-opacity="0.2"></line><line x1="380" y1="96" x2="587.9562944357298" y2="56.773648798386276" stroke-width="1.25" style="--l:rgb(#888);--d:#3a3d47;stroke-opacity:0.18;pointer-events:none" stroke="currentColor" stroke-opacity="0.2"></line><circle cx="172.04370556427023" cy="56.773648798386276" r="4.5" style="--l:rgb(#888);--d:#3a3d47;fill-opacity:0.35" fill="none" stroke="currentColor"><title>Affix</title></circle> <circle cx="170.6995470171795" cy="68.87340135385477" r="4.5" style="--l:rgb(#888);--d:#3a3d47;fill-opacity:0.35" fill="none" stroke="currentColor"><title>Alert</title></circle> <circle cx="170.05880303146634" cy="81.03071278558417" r="4.5" style="--l:rgb(#888);--d:#3a3d47;fill-opacity:0.35" fill="none" stroke="currentColor"><title>Anchor</title></circle> <circle cx="170.12362701216762" cy="93.20472494077815" r="4.5" style="--l:rgb(#888);--d:#3a3d47;fill-opacity:0.35" fill="none" stroke="currentColor"><title>App</title></circle> <circle cx="170.89380109959268" cy="105.35452353904078" r="4.5" style="--l:rgb(#888);--d:#3a3d47;fill-opacity:0.35" fill="none" stroke="currentColor"><title>AutoComplete</title></circle> <circle cx="172.36673690150351" cy="117.43927567662035" r="4.5" style="--l:rgb(#888);--d:#3a3d47;fill-opacity:0.35" fill="none" stroke="currentColor"><title>Avatar</title></circle> <circle cx="174.537484192154" cy="129.4183670571641" r="4.5" style="--l:rgb(#888);--d:#3a3d47;fill-opacity:0.35" fill="none" stroke="currentColor"><title>BackTop</title></circle> <circle cx="177.39874754895166" cy="141.25153848777944" r="4.5" style="--l:rgb(#888);--d:#3a3d47;fill-opacity:0.35" fill="none" stroke="currentColor"><title>Badge</title></circle> <circle cx="180.94091087083015" cy="152.89902118166762" r="4.5" style="--l:rgb(currentColor);--d:#4ade80;fill-opacity:1" fill="none" stroke="currentColor"><title>button/style</title></circle> <circle cx="185.15206969593152" cy="164.32167041260595" r="4.5" style="--l:rgb(currentColor);--d:#4ade80;fill-opacity:1" fill="none" stroke="currentColor"><title>Button</title></circle> <circle cx="190.01807120998504" cy="175.48109707209494" r="4.5" style="--l:rgb(currentColor);--d:#4ade80;fill-opacity:1" fill="none" stroke="currentColor"><title>_util/wave</title></circle> <circle cx="195.52256181092295" cy="186.33979668703367" r="4.5" style="--l:rgb(currentColor);--d:#4ade80;fill-opacity:1" fill="none" stroke="currentColor"><title>config-provider</title></circle> <circle cx="201.64704206987886" cy="196.86127546432272" r="4.5" style="--l:rgb(#888);--d:#3a3d47;fill-opacity:0.35" fill="none" stroke="currentColor"><title>Carousel</title></circle> <circle cx="208.37092890385597" cy="207.01017293878536" r="4.5" style="--l:rgb(#888);--d:#3a3d47;fill-opacity:0.35" fill="none" stroke="currentColor"><title>Cascader</title></circle> <circle cx="215.6716247511162" cy="216.75238081221326" r="4.5" style="--l:rgb(#888);--d:#3a3d47;fill-opacity:0.35" fill="none" stroke="currentColor"><title>Checkbox</title></circle> <circle cx="223.52459351680673" cy="226.0551575841441" r="4.5" style="--l:rgb(#888);--d:#3a3d47;fill-opacity:0.35" fill="none" stroke="currentColor"><title>Col</title></circle> <circle cx="231.9034430335856" cy="234.8872385891201" r="4.5" style="--l:rgb(#888);--d:#3a3d47;fill-opacity:0.35" fill="none" stroke="currentColor"><title>Collapse</title></circle> <circle cx="240.78001376011562" cy="243.21894107061783" r="4.5" style="--l:rgb(#888);--d:#3a3d47;fill-opacity:0.35" fill="none" stroke="currentColor"><title>ColorPicker</title></circle> <circle cx="250.12447341932727" cy="251.0222639385152" r="4.5" style="--l:rgb(#888);--d:#3a3d47;fill-opacity:0.35" fill="none" stroke="currentColor"><title>ConfigProvider</title></circle> <circle cx="259.9054172583937" cy="258.2709818748343" r="4.5" style="--l:rgb(#888);--d:#3a3d47;fill-opacity:0.35" fill="none" stroke="currentColor"><title>DatePicker</title></circle> <circle cx="270.08997359346336" cy="264.9407334714889" r="4.5" style="--l:rgb(#888);--d:#3a3d47;fill-opacity:0.35" fill="none" stroke="currentColor"><title>Descriptions</title></circle> <circle cx="280.64391428443844" cy="271.0091031038256" r="4.5" style="--l:rgb(#888);--d:#3a3d47;fill-opacity:0.35" fill="none" stroke="currentColor"><title>Divider</title></circle> <circle cx="291.5317697685149" cy="276.4556962647979" r="4.5" style="--l:rgb(#888);--d:#3a3d47;fill-opacity:0.35" fill="none" stroke="currentColor"><title>Drawer</title></circle> <circle cx="302.71694826588293" cy="281.26220810659134" r="4.5" style="--l:rgb(#888);--d:#3a3d47;fill-opacity:0.35" fill="none" stroke="currentColor"><title>Dropdown</title></circle> <circle cx="314.1618587569602" cy="285.4124849593464" r="4.5" style="--l:rgb(#888);--d:#3a3d47;fill-opacity:0.35" fill="none" stroke="currentColor"><title>Empty</title></circle> <circle cx="325.8280373178595" cy="288.89257862022646" r="4.5" style="--l:rgb(#888);--d:#3a3d47;fill-opacity:0.35" fill="none" stroke="currentColor"><title>Flex</title></circle> <circle cx="337.67627638950296" cy="291.69079323037835" r="4.5" style="--l:rgb(#888);--d:#3a3d47;fill-opacity:0.35" fill="none" stroke="currentColor"><title>FloatButton</title></circle> <circle cx="349.6667565459365" cy="293.7977245822401" r="4.5" style="--l:rgb(#888);--d:#3a3d47;fill-opacity:0.35" fill="none" stroke="currentColor"><title>Form</title></circle> <circle cx="361.75918031900017" cy="295.2062917250943" r="4.5" style="--l:rgb(#888);--d:#3a3d47;fill-opacity:0.35" fill="none" stroke="currentColor"><title>Grid</title></circle> <circle cx="373.91290762959676" cy="295.9117607626456" r="4.5" style="--l:rgb(#888);--d:#3a3d47;fill-opacity:0.35" fill="none" stroke="currentColor"><title>Image</title></circle> <circle cx="386.08709237040324" cy="295.9117607626456" r="4.5" style="--l:rgb(#888);--d:#3a3d47;fill-opacity:0.35" fill="none" stroke="currentColor"><title>Input</title></circle> <circle cx="398.24081968099983" cy="295.2062917250943" r="4.5" style="--l:rgb(#888);--d:#3a3d47;fill-opacity:0.35" fill="none" stroke="currentColor"><title>InputNumber</title></circle> <circle cx="410.3332434540635" cy="293.7977245822401" r="4.5" style="--l:rgb(#888);--d:#3a3d47;fill-opacity:0.35" fill="none" stroke="currentColor"><title>Layout</title></circle> <circle cx="422.32372361049704" cy="291.69079323037835" r="4.5" style="--l:rgb(#888);--d:#3a3d47;fill-opacity:0.35" fill="none" stroke="currentColor"><title>List</title></circle> <circle cx="434.1719626821405" cy="288.89257862022646" r="4.5" style="--l:rgb(#888);--d:#3a3d47;fill-opacity:0.35" fill="none" stroke="currentColor"><title>Mentions</title></circle> <circle cx="445.8381412430398" cy="285.4124849593464" r="4.5" style="--l:rgb(#888);--d:#3a3d47;fill-opacity:0.35" fill="none" stroke="currentColor"><title>Menu</title></circle> <circle cx="457.28305173411707" cy="281.26220810659134" r="4.5" style="--l:rgb(#888);--d:#3a3d47;fill-opacity:0.35" fill="none" stroke="currentColor"><title>Modal</title></circle> <circle cx="468.4682302314851" cy="276.4556962647979" r="4.5" style="--l:rgb(#888);--d:#3a3d47;fill-opacity:0.35" fill="none" stroke="currentColor"><title>Pagination</title></circle> <circle cx="479.35608571556156" cy="271.0091031038256" r="4.5" style="--l:rgb(#888);--d:#3a3d47;fill-opacity:0.35" fill="none" stroke="currentColor"><title>Popconfirm</title></circle> <circle cx="489.9100264065366" cy="264.9407334714889" r="4.5" style="--l:rgb(#888);--d:#3a3d47;fill-opacity:0.35" fill="none" stroke="currentColor"><title>Popover</title></circle> <circle cx="500.09458274160625" cy="258.2709818748343" r="4.5" style="--l:rgb(#888);--d:#3a3d47;fill-opacity:0.35" fill="none" stroke="currentColor"><title>Progress</title></circle> <circle cx="509.8755265806727" cy="251.0222639385152" r="4.5" style="--l:rgb(#888);--d:#3a3d47;fill-opacity:0.35" fill="none" stroke="currentColor"><title>QRCode</title></circle> <circle cx="519.2199862398844" cy="243.21894107061783" r="4.5" style="--l:rgb(#888);--d:#3a3d47;fill-opacity:0.35" fill="none" stroke="currentColor"><title>Radio</title></circle> <circle cx="528.0965569664144" cy="234.8872385891201" r="4.5" style="--l:rgb(#888);--d:#3a3d47;fill-opacity:0.35" fill="none" stroke="currentColor"><title>Rate</title></circle> <circle cx="536.4754064831933" cy="226.0551575841441" r="4.5" style="--l:rgb(#888);--d:#3a3d47;fill-opacity:0.35" fill="none" stroke="currentColor"><title>Result</title></circle> <circle cx="544.3283752488837" cy="216.75238081221335" r="4.5" style="--l:rgb(#888);--d:#3a3d47;fill-opacity:0.35" fill="none" stroke="currentColor"><title>Row</title></circle> <circle cx="551.6290710961441" cy="207.01017293878533" r="4.5" style="--l:rgb(#888);--d:#3a3d47;fill-opacity:0.35" fill="none" stroke="currentColor"><title>Segmented</title></circle> <circle cx="558.3529579301212" cy="196.86127546432272" r="4.5" style="--l:rgb(#888);--d:#3a3d47;fill-opacity:0.35" fill="none" stroke="currentColor"><title>Select</title></circle> <circle cx="564.477438189077" cy="186.33979668703367" r="4.5" style="--l:rgb(#888);--d:#3a3d47;fill-opacity:0.35" fill="none" stroke="currentColor"><title>Skeleton</title></circle> <circle cx="569.981928790015" cy="175.48109707209494" r="4.5" style="--l:rgb(#888);--d:#3a3d47;fill-opacity:0.35" fill="none" stroke="currentColor"><title>Slider</title></circle> <circle cx="574.8479303040685" cy="164.32167041260595" r="4.5" style="--l:rgb(#888);--d:#3a3d47;fill-opacity:0.35" fill="none" stroke="currentColor"><title>Space</title></circle> <circle cx="579.0590891291699" cy="152.89902118166754" r="4.5" style="--l:rgb(#888);--d:#3a3d47;fill-opacity:0.35" fill="none" stroke="currentColor"><title>Spin</title></circle> <circle cx="582.6012524510484" cy="141.25153848777944" r="4.5" style="--l:rgb(#888);--d:#3a3d47;fill-opacity:0.35" fill="none" stroke="currentColor"><title>Statistic</title></circle> <circle cx="585.462515807846" cy="129.4183670571641" r="4.5" style="--l:rgb(#888);--d:#3a3d47;fill-opacity:0.35" fill="none" stroke="currentColor"><title>Steps</title></circle> <circle cx="587.6332630984965" cy="117.43927567662035" r="4.5" style="--l:rgb(#888);--d:#3a3d47;fill-opacity:0.35" fill="none" stroke="currentColor"><title>Switch</title></circle> <circle cx="589.1061989004073" cy="105.35452353904078" r="4.5" style="--l:rgb(#888);--d:#3a3d47;fill-opacity:0.35" fill="none" stroke="currentColor"><title>Table</title></circle> <circle cx="589.8763729878324" cy="93.20472494077815" r="4.5" style="--l:rgb(#888);--d:#3a3d47;fill-opacity:0.35" fill="none" stroke="currentColor"><title>Tabs</title></circle> <circle cx="589.9411969685336" cy="81.03071278558413" r="4.5" style="--l:rgb(#888);--d:#3a3d47;fill-opacity:0.35" fill="none" stroke="currentColor"><title>Tag</title></circle> <circle cx="589.3004529828205" cy="68.87340135385477" r="4.5" style="--l:rgb(#888);--d:#3a3d47;fill-opacity:0.35" fill="none" stroke="currentColor"><title>Timeline</title></circle> <circle cx="587.9562944357298" cy="56.773648798386276" r="4.5" style="--l:rgb(#888);--d:#3a3d47;fill-opacity:0.35" fill="none" stroke="currentColor"><title>Tooltip</title></circle> <text x="172.94091087083015" y="166.89902118166762" text-anchor="end" font-size="9" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-weight="400" style="pointer-events:none" fill="currentColor">button/style</text> <text x="177.15206969593152" y="178.32167041260595" text-anchor="end" font-size="9" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-weight="600" style="pointer-events:none" fill="currentColor">Button</text> <text x="182.01807120998504" y="189.48109707209494" text-anchor="end" font-size="9" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-weight="400" style="pointer-events:none" fill="currentColor">_util/wave</text> <text x="187.52256181092295" y="200.33979668703367" text-anchor="end" font-size="9" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-weight="400" style="pointer-events:none" fill="currentColor">config-provider</text> <text x="251.9054172583937" y="272.2709818748343" text-anchor="end" font-size="9" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-weight="400" style="pointer-events:none" fill="currentColor">DatePicker</text> <text x="349.6667565459365" y="307.7977245822401" text-anchor="middle" font-size="9" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-weight="400" style="pointer-events:none" fill="currentColor">Form</text> <text x="465.28305173411707" y="295.26220810659134" text-anchor="start" font-size="9" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-weight="400" style="pointer-events:none" fill="currentColor">Modal</text> <text x="566.3529579301212" y="210.86127546432272" text-anchor="start" font-size="9" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-weight="400" style="pointer-events:none" fill="currentColor">Select</text> <text x="597.1061989004073" y="119.35452353904078" text-anchor="start" font-size="9" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-weight="400" style="pointer-events:none" fill="currentColor">Table</text></svg>

import { Button } from "antd"

antd/es/index.js

barrel · 312 re-exports

60 of antd’s ~70 top-level exports shown. Module count and timing measured with Bun.build() on this exact import — [#26892](https://github.com/oven-sh/bun/pull/26892).

### Compile-time feature flags with bun:bundle v1.3.5

`feature("FLAG")` from `bun:bundle` becomes `true` or `false` at build time, and the dead branch is removed.

Set flags with `--feature=FLAG` or `features: [...]` in `Bun.build()`. They work in `bun build`, `bun run`, and `bun test`. [#25462](https://github.com/oven-sh/bun/pull/25462)

```
import { feature } from "bun:bundle";

if (feature("SUPER_SECRET")) {
  console.log("Secret feature enabled!");
}

// bun build --feature=SUPER_SECRET index.ts
```

### In-memory files in Bun.build() v1.3.6

`Bun.build()` accepts a `files` option: a map of paths to strings, `Blob` s, or `TypedArray` s. Use it to bundle entirely from memory or mix virtual modules with real files on disk — virtual paths take precedence. Handy for codegen, or for stubbing a module in tests without touching disk. [#25852](https://github.com/oven-sh/bun/pull/25852)

```
await Bun.build({
  entrypoints: ["/app/index.ts"],
  files: {
    "/app/index.ts": \`import { greet } from "./greet.ts"; console.log(greet("World"));\`,
    "/app/greet.ts": \`export function greet(name: string) { return "Hello, " + name + "!"; }\`,
  },
});
```

### Single-file HTML with --compile --target=browser v1.3.10

`bun build --compile --target=browser` produces one HTML file with every script, stylesheet, and asset inlined.

You can double-click it and open it from `file://`, with no web server. [#27056](https://github.com/oven-sh/bun/pull/27056)

```
bun build ./index.html --compile --target=browser --outdir=dist
```

```
# → dist/index.html (everything inlined, zero external requests)
```

### metafile: true v1.3.6v1.4.0

`Bun.build()` supports `metafile: true`, returning build metadata in esbuild's metafile format: a full map of inputs, outputs, imports, exports, and byte sizes. `result.metafile` works as-is with https://esbuild.github.io/analyze/ and anything else that reads esbuild's format. [#25842](https://github.com/oven-sh/bun/pull/25842)

```
const result = await Bun.build({
  entrypoints: ["./index.js"],
  metafile: true,
});

console.log(result.metafile.inputs);
console.log(result.metafile.outputs);
```

### \--metafile-md v1.3.8v1.4.0

`bun build --metafile-md` writes the module graph as a Markdown report: a quick summary, the largest input files, per-entry-point breakdowns, dependency chains, and a grep-friendly raw section. The report is plain Markdown, so you can paste it into an LLM to ask why a bundle is large. [#26441](https://github.com/oven-sh/bun/pull/26441)

```
bun build entry.js --metafile-md --outdir=dist
```

```
bun build entry.js --metafile-md=analysis.md --outdir=dist
```

```
bun build entry.js --metafile=meta.json --metafile-md=meta.md --outdir=dist
```

### Standard TC39 decorators v1.3.10v1.4.0

You can now use standard [TC39 decorators](https://github.com/tc39/proposal-decorators) in Bun.

```
function logged(value, { kind, name }) {
  if (kind === "method") {
    return function (...args) {
      console.log(\`calling ${name}\`);
      return value.call(this, ...args);
    };
  }
}

class C {
  @logged
  greet() {}
}
```

These are the decorators you get when `experimentalDecorators` is off in `tsconfig.json`. They work on classes, methods, fields, accessors, and private members.

Bun passes the [esbuild decorator test suite](https://github.com/evanw/decorator-tests).

### \--asset v1.4.0

`bun build --compile --asset <path>` embeds a file or a whole directory into the executable, keeping the original filenames.

Use it for a `public/` folder, templates, or a SvelteKit `client/` build. `path.join(import.meta.dir, ...)` finds them the same way it does on disk. [#36302](https://github.com/oven-sh/bun/pull/36302)

`node:fs` now treats `/$bunfs/` as a real directory tree: `existsSync`, `statSync`, `lstatSync`, `accessSync`, `readdirSync`, and `fs.promises.readdir` (including `{ withFileTypes: true }` and `{ recursive: true }`) all work on embedded paths, so static-file servers that enumerate a directory at startup run unmodified inside a compiled binary.

```
bun build ./build/index.js --compile \
```

```
--asset ./build/client --asset ./build/prerendered \
--outfile server
```

```
./server   # every route + static asset served from the binary
```

### Bytecode compilation for ES modules v1.3.9v1.4.0

`--bytecode` now supports ES modules. `--bytecode --format=esm` requires `--compile`, and enables top-level await, `import.meta`, dynamic imports, and code splitting in bytecode-compiled binaries; previously `--bytecode` forced CommonJS output. [#26402](https://github.com/oven-sh/bun/pull/26402)

### Code splitting on 20,000-module graphs is 14× faster v1.4.0

The code-splitting reachability walk is now BFS and O(V+E). A 20,000-module diamond-shaped DAG links in 320 ms, from 4.65 s. The tree-shaking liveness, TLA validation, CSS-order, and part-visitor passes run on explicit stacks. So linear import chains of thousands of modules link without stack growth. [#35310](https://github.com/oven-sh/bun/pull/35310) [#34554](https://github.com/oven-sh/bun/pull/34554)

## Faster

Between Bun 1.3 and 1.4 we bumped our WebKit pin **39 times**, pulling in roughly eight months of upstream JavaScriptCore work; the regex engine, Promises, and most String/Array builtins moved from self-hosted JavaScript to C++, and Bun swapped in zlib-ng and SIMD kernels for its own hot paths.

### new URL() is up to 4.6× faster v1.4.0

Bun's URL parser was rewritten. WebKit's new parser does the parsing. On Bun's side, `href` reuses the input string, the last base URL is cached, and hosts that are already ASCII punycode skip ICU.

| Operation | Bun 1.3 | Bun 1.4 | Node.js 26 |
| --- | --- | --- | --- |
| `new URL("http://localhost:3000/api/users/42")` | 349 ns | **75 ns** | 232 ns |
| `new URL("../x", base)` | 523 ns | **168 ns** | 612 ns |
| `url.href` | 16 ns | **5 ns** | 8 ns |

[#39273](https://github.com/oven-sh/bun/pull/39273) [#39368](https://github.com/oven-sh/bun/pull/39368) [#39468](https://github.com/oven-sh/bun/pull/39468)

### Faster RegExp v1.4.0

The RegExp performance gap between JavaScriptCore and V8 has been fixed.

**`marked.parse()`** gets 138× faster. On an 80 KB Markdown fixture, it runs in ~6 ms, from 912 ms.

**isbot** gets 200× faster. One call on a typical user agent takes 1.07 µs, from 218 µs in Bun 1.3. Node.js 26 takes 1.47 µs.

Benchmark code: isbot-bench.mjs

```
import { isbot } from "isbot"; // isbot@5.2.1

const uas = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  "curl/8.7.1",
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0",
  "Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)",
];

let hits = 0;
for (let i = 0; i < 20_000; i++)
  for (const ua of uas) hits += isbot(ua) ? 1 : 0; // warm up

const N = 200_000;
const t0 = performance.now();
for (let i = 0; i < N; i++) for (const ua of uas) hits += isbot(ua) ? 1 : 0;
const ms = performance.now() - t0;
console.log(\`${((ms * 1e6) / (N * uas.length)).toFixed(0)} ns/call\`, hits);
```

### node:zlib uses zlib-ng v1.3.13v1.4.0

Bun now uses [zlib-ng](https://github.com/zlib-ng/zlib-ng), the same library Node.js 24 and Chromium use, for `node:zlib`, gzipped `fetch()` responses, and everything else that compresses. It picks the fastest code path for your CPU at runtime. [#29433](https://github.com/oven-sh/bun/pull/29433)

Time per call on 1 MB of JSON, default level:

| Encoding | Operation | Bun 1.4 | Bun 1.3 | Node.js 26 | Deno 2.9 |
| --- | --- | --- | --- | --- | --- |
| gzip | `gzipSync` | 9.36 ms | **9.11 ms** | 10.27 ms | 9.76 ms |
| gzip | `gunzipSync` | **1.28 ms** | 1.56 ms | 2.11 ms | 2.06 ms |
| deflate | `inflateSync` | **1.21 ms** | 1.54 ms | 1.95 ms | 2.07 ms |
| brotli | `brotliDecompressSync` | **1.38 ms** | 1.40 ms | 2.11 ms | 2.39 ms |
| zstd | `zstdCompressSync` | **2.09 ms** | 2.18 ms | 2.09 ms | 2.18 ms |
| zstd | `zstdDecompressSync` | 0.81 ms | **0.73 ms** | 1.57 ms | 1.65 ms |

Peak memory, same runs:

| Encoding | Operation | Bun 1.4 | Bun 1.3 | Node.js 26 | Deno 2.9 |
| --- | --- | --- | --- | --- | --- |
| gzip | `gzipSync` | **50 MB** | 74 MB | 75 MB | 69 MB |
| gzip | `gunzipSync` | **62 MB** | 94 MB | 125 MB | 129 MB |
| deflate | `inflateSync` | **63 MB** | 94 MB | 126 MB | 128 MB |
| brotli | `brotliDecompressSync` | **73 MB** | 110 MB | 129 MB | 130 MB |
| zstd | `zstdCompressSync` | **55 MB** | 79 MB | 77 MB | 71 MB |
| zstd | `zstdDecompressSync` | **62 MB** | 95 MB | 128 MB | 136 MB |

Compression speed depends on the input. On JSON, gzip compression is the same speed as Bun 1.3. On repetitive HTML, `gzipSync` on 1 MB takes 3.9 ms instead of 5.75 ms. Decompression is about 20% faster on everything, and peak memory is 25–35 MB lower.

Benchmark code: zlib-bench.mjs

```
// node:zlib benchmark: compress/decompress a JSON-like text buffer, one scenario per process.
// Usage: <runtime> zlib-bench.mjs <gzip|deflate|brotli|zstd> <sync|async> <compress|decompress> [level] [--bytes=N] [--iters=N]
//   e.g. bun zlib-bench.mjs gzip sync compress --bytes=1048576 --iters=50
//        node zlib-bench.mjs brotli async compress
//        deno run -A zlib-bench.mjs zstd sync decompress 3
// --bytes: input size (default 64 MiB). --iters: timed iterations (default 1); with >1, warms up
// 5 iterations and reports the median. Prints one JSON line: {encoding, api, op, level, ms, iters,
// inputBytes, compressedBytes}. Wrap with \`/usr/bin/time -v\` to get peak RSS.
import * as zlib from "node:zlib";

const flags = Object.fromEntries(
  process.argv
    .slice(2)
    .filter((a) => a.startsWith("--"))
    .map((a) => a.slice(2).split("=")),
);
const [encoding, api, op, levelArg] = process.argv
  .slice(2)
  .filter((a) => !a.startsWith("--"));
const level = levelArg === undefined ? undefined : Number(levelArg);
const TARGET = Number(flags.bytes ?? 64 * 1024 * 1024);
const ITERS = Number(flags.iters ?? 1);

// Deterministic JSON-lines text; a few fields vary per record so it is not trivially repetitive.
function makeInput() {
  let seed = 0x9e3779b9;
  const rnd = () => (seed = (seed * 1103515245 + 12345) >>> 0) / 2 ** 32;
  const cities = [
    "Berlin",
    "Tokyo",
    "Austin",
    "Lagos",
    "Lima",
    "Oslo",
    "Pune",
    "Quito",
  ];
  const words = [
    "alpha",
    "bravo",
    "charlie",
    "delta",
    "echo",
    "foxtrot",
    "golf",
    "hotel",
    "india",
    "juliet",
  ];
  const parts = [];
  let size = 0;
  for (let i = 0; size < TARGET; i++) {
    const tags = Array.from(
      { length: 3 },
      () => words[(rnd() * words.length) | 0],
    );
    const rec = {
      id: i,
      uuid: \`${((rnd() * 2 ** 32) >>> 0)
        .toString(16)
        .padStart(8, "0")}-4c1e-8a2b-${i.toString(16).padStart(12, "0")}\`,
      user: \`user_${(rnd() * 50000) | 0}\`,
      email: \`person${(rnd() * 1e6) | 0}@example.com\`,
      city: cities[(rnd() * cities.length) | 0],
      score: Math.round(rnd() * 10000) / 100,
      active: rnd() > 0.5,
      tags,
      ts: 1700000000000 + ((rnd() * 1e9) | 0),
      note:
        "lorem ipsum dolor sit amet, consectetur adipiscing elit " +
        words[i % words.length],
    };
    const line = JSON.stringify(rec) + "\n";
    parts.push(line);
    size += line.length;
  }
  return Buffer.from(parts.join(""), "latin1");
}

const fns = {
  gzip: [zlib.gzipSync, zlib.gzip, zlib.gunzipSync, zlib.gunzip],
  deflate: [zlib.deflateSync, zlib.deflate, zlib.inflateSync, zlib.inflate],
  brotli: [
    zlib.brotliCompressSync,
    zlib.brotliCompress,
    zlib.brotliDecompressSync,
    zlib.brotliDecompress,
  ],
  zstd: [
    zlib.zstdCompressSync,
    zlib.zstdCompress,
    zlib.zstdDecompressSync,
    zlib.zstdDecompress,
  ],
};
const [cSync, cAsync, dSync, dAsync] = fns[encoding];
if (!cSync) {
  console.log(JSON.stringify({ encoding, api, op, error: "unsupported" }));
  process.exit(0);
}

const opts =
  level === undefined
    ? {}
    : encoding === "brotli"
    ? { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: level } }
    : { level };

const input = makeInput();
const compressed = op === "decompress" ? cSync(input, opts) : null;
const [syncFn, asyncFn, data] =
  op === "decompress" ? [dSync, dAsync, compressed] : [cSync, cAsync, input];

const once = () =>
  new Promise((resolve, reject) => {
    const t0 = performance.now();
    if (api === "sync")
      return resolve([syncFn(data, opts), performance.now() - t0]);
    asyncFn(data, opts, (err, out) =>
      err ? reject(err) : resolve([out, performance.now() - t0]),
    );
  });

let out,
  times = [];
if (ITERS > 1) for (let i = 0; i < 5; i++) await once();
for (let i = 0; i < ITERS; i++) {
  const [o, ms] = await once();
  out = o;
  times.push(ms);
}
times.sort((a, b) => a - b);
const ms = times[times.length >> 1];
console.log(
  JSON.stringify({
    encoding,
    api,
    op,
    level: level ?? "default",
    ms: Math.round(ms * 1000) / 1000,
    iters: ITERS,
    inputBytes: input.length,
    compressedBytes: op === "decompress" ? compressed.length : out.length,
  }),
);
```

### Buffer.from(str, "hex") is 8× faster and "base64url" 46× faster v1.4.0

`Buffer.from(str, "hex")` and `Buffer.from(str, "base64url")` decode with SIMD.

Decoding 1 MiB:

| Encoding | Bun 1.4 | Bun 1.3 | Node.js 26 | Deno 2.9 |
| --- | --- | --- | --- | --- |
| `hex` | **128 µs** | 1,035 µs | 743 µs | 3,863 µs |
| `base64url` | **84 µs** | 3,897 µs | 68 µs | 104 µs |

Decoding 128 KiB:

| Encoding | Bun 1.4 | Bun 1.3 | Node.js 26 | Deno 2.9 |
| --- | --- | --- | --- | --- |
| `hex` | **15.1 µs** | 130.6 µs | 102.7 µs | 494.0 µs |
| `base64url` | **11.6 µs** | 486.2 µs | 17.0 µs | 14.4 µs |

Benchmark code: buffer-from-bench.mjs

```
import { Buffer } from "node:buffer";

const sizes = [1024, 128 * 1024, 1024 * 1024];
const raw = (n) => {
  const b = Buffer.alloc(n);
  for (let i = 0; i < n; i++) b[i] = (i * 2654435761) >>> 24;
  return b;
};

for (const enc of ["hex", "base64", "base64url"]) {
  for (const n of sizes) {
    const str = raw(n).toString(enc);
    let sink = 0;
    for (let i = 0; i < 200; i++) sink += Buffer.from(str, enc).length; // warm up
    const iters = n >= 1024 * 1024 ? 300 : n >= 128 * 1024 ? 2000 : 100000;
    const times = [];
    for (let rep = 0; rep < 5; rep++) {
      const t0 = performance.now();
      for (let i = 0; i < iters; i++) sink += Buffer.from(str, enc).length;
      times.push(((performance.now() - t0) * 1000) / iters);
    }
    times.sort((a, b) => a - b);
    console.log(enc, n / 1024, "KiB", times[2].toFixed(2), "µs/op");
  }
}
```

### Source map decoding is 3.1× faster v1.4.0

Source map decoding uses SIMD. `new SourceMap(json)` on a 9.5 MB map takes 12 ms, 3.1× faster than before and 24× faster than Node.js. [#32556](https://github.com/oven-sh/bun/pull/32556)

![new SourceMap(payload) decoding is up to 3x faster](https://bun.com/images/blog/bun-1.4/tweets/sourcemap-decoding.jpg)

\`new SourceMap(payload)\` & sourcemap decoding gets up to 3x faster

### Promises are 1.5–2.4× faster v1.4.0

JavaScriptCore rewrote their Promise implementation to reduce overhead.

Time per operation, 2 million iterations:

| Operation | Bun 1.4 | Bun 1.3 |
| --- | --- | --- |
| `Promise.race` of 4 promises | **142 ns** | 342 ns |
| `Promise.all` of 4 promises | **207 ns** | 316 ns |
| `Promise.allSettled` of 4 promises | **253 ns** | 411 ns |
| `await` a resolved promise | **84 ns** | 143 ns |
| `.then()` chain of 4 | **172 ns** | 332 ns |
| `async` function with no `await` | **37 ns** | 89 ns |

Memory: 1,000,000 pending promises resolved at once.

|  | Bun 1.4 | Bun 1.3 |
| --- | --- | --- |
| Peak memory | **251 MB** | 668 MB |
| Time to settle | **12.5 ms** | 39.0 ms |

Benchmark code: promise-bench.mjs and promise-rss.mjs

```
// Promise microbenchmarks. Prints ns/op per operation as JSON.
// Usage: bun promise-bench.mjs | node promise-bench.mjs | deno run -A promise-bench.mjs
const WARMUP = 1e5;
const ITERS = 2e6;

const p1 = Promise.resolve(1),
  p2 = Promise.resolve(2),
  p3 = Promise.resolve(3),
  p4 = Promise.resolve(4);
const arr = [p1, p2, p3, p4];
async function noAwait(x) {
  return x;
}

const benches = {
  "Promise.race (4 resolved)": () => Promise.race(arr),
  "Promise.all (4 resolved)": () => Promise.all(arr),
  "Promise.allSettled (4 resolved)": () => Promise.allSettled(arr),
  "await resolved promise": async () => {
    await p1;
  },
  ".then() chain of 4": () =>
    p1
      .then((x) => x)
      .then((x) => x)
      .then((x) => x)
      .then((x) => x),
  "async fn, no await": () => noAwait(1),
};

async function time(fn, n) {
  const t0 = performance.now();
  for (let i = 0; i < n; i++) await fn();
  return ((performance.now() - t0) * 1e6) / n;
}

const results = {};
for (const [name, fn] of Object.entries(benches)) {
  await time(fn, WARMUP);
  results[name] = Math.round((await time(fn, ITERS)) * 10) / 10;
}
console.log(JSON.stringify(results));
```

```
// promise-rss.mjs: peak memory of 1,000,000 pending promises resolved at once
const N = 1_000_000;
const resolvers = [];
const promises = Array.from(
  { length: N },
  () => new Promise((r) => resolvers.push(r)),
);
const all = Promise.all(promises);
for (const r of resolvers) r(1);
const t0 = performance.now();
await all;
console.log(
  \`${N} promises settled in ${(performance.now() - t0).toFixed(1)} ms\`,
);
```

## Security

Bun 1.4 includes a lot of security fixes. We recommend everyone update. Most of them change nothing you'd notice. They are listed under [Security hardening](#security-hardening) in the changelog. The handful below tighten a default, in most cases a TLS certificate check. That can turn a connection that worked on 1.3 into a verification error. Advisories will go up on [GitHub](https://github.com/oven-sh/bun/security/advisories) once people have had time to upgrade.

### checkServerIdentity runs before fetch() sends the request v1.4.0

When you pass `tls: { checkServerIdentity }` to `fetch()`, the callback runs after the TLS handshake and before any of the request is written, and again on each redirect hop. If it returns an `Error`, `fetch()` rejects with that error and nothing is sent.

```
await fetch("https://api.example.com/upload", {
  method: "POST",
  body: secretPayload,
  tls: {
    checkServerIdentity(hostname, cert) {
      if (cert.fingerprint256 !== PINNED) return new Error("pin mismatch");
    },
  },
});
// nothing is sent until checkServerIdentity returns undefined
```

If you pin a certificate this way and the URL redirects through a host with a different one, the callback now sees that certificate too, so either accept every hop's certificate there or pass `redirect: "manual"` and follow `Location` yourself.

### tls.connect now uses host as the default servername v1.3.13

[`tls.connect({ host, port })`](https://nodejs.org/api/tls.html#tlsconnectoptions-callback) without a `servername` now uses `host` for both SNI and the certificate identity check. This matches Node.js. Connecting by IP address or to `localhost` now fails with `ERR_TLS_CERT_ALTNAME_INVALID` when the certificate was issued for another name. This applies whether you call `tls.connect()` yourself or a driver like `pg` or `ioredis` does. Pass the certificate's name as `servername`. Or pass `checkServerIdentity: () => undefined` if you deliberately trust the server by its CA alone.

```
tls.connect({
  host: "10.0.0.12",
  port: 5432,
  ca,
  servername: "db.internal",
});
```

### Bun.connect and Bun.listen enforce rejectUnauthorized v1.4.0

[`Bun.connect({ tls })`](https://bun.com/docs/runtime/networking/tcp), `socket.upgradeTLS()`, and `Bun.listen()` with `requestCert: true` now default to `rejectUnauthorized: true`, as `node:tls` and `fetch()` do. The usual case is a `Bun.connect()` to a dev or staging server with a self-signed or private-CA certificate and no `ca`. It does not throw. The `handshake` handler runs with `socket.authorized` set to `false`. Writes return `-1`. The socket closes without delivering data. Pass the CA in `tls`, or pass `rejectUnauthorized: false` (`NODE_TLS_REJECT_UNAUTHORIZED=0` is honored here too).

### RedisClient enforces TLS hostname verification v1.3.14

A `rediss://` `RedisClient` checks the server certificate against the host in the URL, as the Postgres and MySQL clients do, and rejects the first command with `ERR_TLS_CERT_ALTNAME_INVALID` on a mismatch. If you reach Redis by IP or through a port-forward to `localhost`, connect by the name on the certificate instead, or pass `tls: { rejectUnauthorized: false }`.

### HTTP request parsing hardening in Bun.serve v1.3.4

`Bun.serve()` answers `400` and closes the connection for more kinds of malformed `Content-Length` and `Transfer-Encoding` headers and chunked bodies. Browsers, curl, `fetch()` and reverse proxies send none of them. If a hand-written client starts getting `400` responses, look at its framing headers first; Bun does not call your `fetch` handler or log anything for most of these.

### Tarball extraction hardening v1.3.6

Tarball extraction for `github:` and URL dependencies and `bun create` templates skips entries that would land outside the package directory. If one of those is missing a file after the upgrade and you get `Cannot find module` for it, look in its repo for a symlink that points outside the package, and replace it with the real file or a relative link.

## Platforms

### Native FreeBSD builds v1.3.14v1.4.0

Bun now ships official FreeBSD binaries for x86\_64 and aarch64. On FreeBSD 14.3+ the full runtime (`Bun.serve()`, `fetch()`, `node:fs`, `node:os`, `Bun.spawn`) works on a stock install with no extra system packages. This is a native port built against FreeBSD's own kernel APIs, not a Linux compatibility layer. [#29676](https://github.com/oven-sh/bun/pull/29676)

```
curl -fsSL https://bun.sh/install | bash
```

```
uname -sm
```

```
FreeBSD amd64
```

```
bun --version
```

```
1.4.0
```

### Windows on ARM64 v1.3.7v1.4.0

Bun now builds natively for Windows on ARM64. Surface, Snapdragon X, and Ampere-based Windows machines run Bun natively. [#26215](https://github.com/oven-sh/bun/pull/26215)

```
PS> powershell -c "irm bun.sh/install.ps1|iex"
PS> $env:PROCESSOR_ARCHITECTURE
ARM64
PS> bun --version
1.4.0
```

### Experimental Android support v1.4.0

Bun ships experimental Android builds for aarch64 and x64 with every release.

### Linux glibc minimum drops to 2.17 v1.3.13

Bun's minimum glibc requirement on Linux drops from 2.26 to 2.17. Bun now runs on RHEL/CentOS 7, Amazon Linux 1, and ARM64 Linux distributions without needing a separate compatibility build. [#29461](https://github.com/oven-sh/bun/pull/29461)

```
ldd --version
```

```
ldd (GNU libc) 2.17
```

```
bun --version
```

```
1.4.0
```

### Fallback for in-memory files on older Linux kernels v1.3.13

On Linux kernels older than 3.17, like RHEL 7, Bun detects that `memfd_create` is missing once and falls back. The documented minimum kernel is now 3.10. [#29465](https://github.com/oven-sh/bun/pull/29465)

```
BUN_FEATURE_FLAG_DISABLE_MEMFD=1 bun run server.ts
```

### Ready for TypeScript 7

`bun init` and the React templates ship a `tsconfig.json` that works with TypeScript 7, and `@types/bun` resolves cleanly against it. [#28542](https://github.com/oven-sh/bun/pull/28542) [#39341](https://github.com/oven-sh/bun/pull/39341)

```
{
  "compilerOptions": {
    "types": ["bun"]
  }
}
```

### Sub-15 ms timers on Windows v1.4.0

On Windows, `setTimeout(fn, 1)` fires in about 1.4 ms instead of 15.5 ms. Timers no longer round to the 15.6 ms system tick. [#34834](https://github.com/oven-sh/bun/pull/34834)

![Improved timer accuracy on Windows makes Bun.sleep faster](https://bun.com/images/blog/bun-1.4/tweets/windows-timers.jpg)

Improved timer accuracy on Windows makes \`Bun.sleep\` faster

### Bun runs inside an AppContainer v1.4.0

Bun runs inside a Windows [AppContainer](https://learn.microsoft.com/windows/win32/secauthz/appcontainer-isolation), so embedders can sandbox it with a lowbox token.

`bun install`, `bun run`, `Bun.spawn`, `child_process.fork`, and `Bun.Terminal` all work inside the container.

Bun also now works on read-only directories like Program Files and read-only network shares, and no longer fails when an ancestor directory isn't readable.

## Upgrading to 1.4

Most code is unaffected. Five changes are the most likely to need a line in your project:

- **Node.js 26**: `process.versions.modules` is now `147`. Packages that pick a prebuilt native addon by `NODE_MODULE_VERSION` need a build for `147`. `res.writeHeader()` is gone; use `res.writeHead()`. Paused-mode `readable.read()` returns one chunk. [#31991](https://github.com/oven-sh/bun/pull/31991)
- **New monorepos default to the isolated linker**. `bun.lock` records `configVersion: 1`. Existing lockfiles keep the hoisted linker. To opt out, pin `linker = "hoisted"` in `bunfig.toml`. [#24236](https://github.com/oven-sh/bun/pull/24236)
- **Bun invoked as `node`** (`bun --bun`, `bunx --bun`, a `node` symlink) does not load `.env` files. This matches Node. Pass `--env-file` to keep them. [#36610](https://github.com/oven-sh/bun/pull/36610)
- **`Bun.YAML` follows YAML 1.2**: `yes` / `no` / `on` / `off` are strings. `on:` in a GitHub Actions workflow parses as `"on"`. [#25537](https://github.com/oven-sh/bun/pull/25537)
- **`Bun.TOML` and `bunfig.toml` are strict**: unquoted strings, missing newlines between pairs, and integers past `Number.MAX_SAFE_INTEGER` are `SyntaxError` s. [#32953](https://github.com/oven-sh/bun/pull/32953)
Every behavior change in 1.4

### Node.js 26: NODE\_MODULE\_VERSION 147, res.writeHeader() removed, paused read() returns one chunk v1.4.0

Bun now reports [Node.js 26](#node-js-26). Three things change:

- `process.versions.modules` is `147`. Packages that pick a prebuilt native addon by `NODE_MODULE_VERSION` need a build for `147`.
- `res.writeHeader()` in `node:http` is removed. Call `res.writeHead()`.
- In paused mode, `readable.read()` with no size returns one buffered chunk. Before, it returned the whole buffer. (`setEncoding()` keeps the old behavior.) Loop until it returns `null`.

[#31991](https://github.com/oven-sh/bun/pull/31991)

```
res.writeHeader(200, { "Content-Type": "text/plain" });
res.writeHead(200, { "Content-Type": "text/plain" });
```

### x64 builds are now baseline-only v1.4.0

x64 releases now ship only the baseline build. The separate build compiled with `-march=haswell` is gone. The `-baseline` download URLs and npm packages still exist and contain the same binary. Existing install scripts and `bun upgrade` keep working. The `CPU lacks AVX support` startup warning is removed. [#34782](https://github.com/oven-sh/bun/pull/34782)

### Temporal is now defined by default, and toEqual() compares Temporal objects by value v1.4.0

`Temporal` and `Date.prototype.toTemporalInstant` are now defined. Set `BUN_JSC_useTemporal=0` to turn them off. `Bun.deepEquals()`, `toEqual()`, `toStrictEqual()`, and `util.isDeepStrictEqual()` now compare Temporal objects by value. Before, any two instances of the same class were equal. [#32978](https://github.com/oven-sh/bun/pull/32978) [#37024](https://github.com/oven-sh/bun/pull/37024)

```
Bun.deepEquals(
  Temporal.PlainDate.from("2020-01-01"),
  Temporal.PlainDate.from("1999-12-31"),
); // false
```

### bun:ffi: cstring values are plain strings and CString no longer has.ptr v1.4.0

`bun:ffi` is now [engine-native](#bun-ffi-is-engine-native-and-3-faster). This changes four things:

- A `returns: "cstring"` value or a `cstring` callback argument is a plain string. A `NULL` pointer is `null`.
- `new CString(ptr)` returns a string with no `.ptr`, `.byteLength`, or `.arrayBuffer`. Keep the original pointer if you need to free it.
- `napi_env` and `napi_value` argument types throw `TypeError` outside `cc()`.
- `dlopen()` and the other entry points throw `TypeError` when the JIT is disabled.

[#35246](https://github.com/oven-sh/bun/pull/35246)

```
const str = new CString(ptr);
my_library_free(str.ptr);
my_library_free(ptr);
```

### bun build --compile no longer auto-loads tsconfig.json or package.json at runtime v1.3.4

Standalone executables built with `bun build --compile` no longer auto-load `tsconfig.json` or `package.json` from the runtime working directory. Before, a compiled binary could pick up unrelated config files from the directory it ran in. To opt back in, pass `--compile-autoload-tsconfig` / `--compile-autoload-package-json` (or `compile.autoloadTsconfig` / `compile.autoloadPackageJson` in `Bun.build()`). `.env` and `bunfig.toml` still auto-load by default. They keep their existing `--compile-autoload-dotenv` / `--compile-autoload-bunfig` flags. [#25340](https://github.com/oven-sh/bun/pull/25340)

### bun install defaults to the isolated linker for new monorepos v1.3.2

New monorepos (projects with workspaces) now use `linker: "isolated"`. This is a symlinked `node_modules` layout that prevents phantom dependencies. `bun.lock` records a `configVersion`. Existing lockfiles (config version 0) keep the hoisted linker they were created with. Your `node_modules` layout does not change on upgrade. [#24236](https://github.com/oven-sh/bun/pull/24236)

```
# bunfig.toml: pin the old behavior if you need it
[install]
linker = "hoisted"
```

### bun.lock is now lockfileVersion: 2 v1.4.0

New lockfiles use version 2. Version 2 adds two stricter parse-time checks:

- npm packages resolved to a tarball outside your configured registry must carry an integrity hash.
- git dependency entries are validated to block path traversal (no `/`, `\`, or `..`).

Lockfiles written as v0/v1 keep loading without these checks. Existing projects do not break. Run `bun install` to migrate.

```
{
  "lockfileVersion": 1,
  "lockfileVersion": 2,
  "workspaces": { ... },
```

### Bun invoked as node no longer loads.env files v1.4.0

When Bun runs as `node` (under `bun --bun`, `bunx --bun`, or a `node` symlink to Bun), it no longer loads `.env`, `.env.local`, or `.env.{development,production,test}`. This matches Node.js. `bun file.js` still loads them. A `package.json` script that calls `node` under `bun --bun run` now sees those variables as `undefined`. To keep them, pass `--env-file` to `node`. [#36610](https://github.com/oven-sh/bun/pull/36610)

```
"scripts": {
  "check": "node ./check.js"
  "check": "node --env-file=.env ./check.js"
```

### Bun.YAML now parses yes/no/on/off as strings, not booleans v1.3.5

`Bun.YAML` now parses booleans per the YAML 1.2 spec. `yes` / `no` / `on` / `off` / `y` / `Y` are plain strings, not booleans. These are YAML 1.1 legacy values that the 1.2 spec dropped. An `on:` key in a GitHub Actions workflow file now parses as the string `"on"`, not `true`. Only `true` / `True` / `TRUE` and `false` / `False` / `FALSE` resolve to booleans. [#25537](https://github.com/oven-sh/bun/pull/25537)

```
Bun.YAML.parse("on: push");
// { on: "push" }
```

### Bun.TOML.parse() and bunfig.toml are stricter and throw SyntaxError v1.4.0

The rewritten [`Bun.TOML`](#bun-toml) parser throws `SyntaxError` instead of `BuildMessage`. It rejects TOML that the old parser let through:

- unquoted string values
- missing newlines between key/value pairs
- integers outside `Number.MAX_SAFE_INTEGER`

A `bunfig.toml` with an unquoted value now fails at startup with `TOML Parse error: Strings must be quoted`. Quote the value. [#32953](https://github.com/oven-sh/bun/pull/32953)

```
[install]
linker = isolated
linker = "isolated"
```

### .xml imports now return the parsed document instead of the file path v1.4.0

`import` or `require()` of a `.xml` file now returns the same object as [`Bun.XML.parse()`](#bun-xml). This applies at runtime and in `bun build`. Before, it returned the file's path. A file that does not parse throws at runtime and fails the build. To keep getting the path, pass `--loader .xml:file`. [#37048](https://github.com/oven-sh/bun/pull/37048)

### import "." and import ".." now resolve as directories v1.4.0

`"."` and `".."` in `import` and `require()` now resolve to the directory's index file or `package.json` `main`. This matches Node.js. Before, they resolved to a sibling file with the directory's name. So `"."` inside `lib/run.ts` loaded `lib.ts`; it now loads `lib/index.ts`. To keep the sibling, name it. [#36969](https://github.com/oven-sh/bun/pull/36969)

```
import { e } from ".";
import { e } from "../lib";
```

### .css imports at runtime now export {} instead of the file path v1.4.0

At runtime, the default export of a `.css` import is now `{}`. This applies to `import`, `require()`, dynamic `import()`, and Workers. Before, it was the file's absolute path as a string. `bun build` already emitted `{}`. `.module.css` still differs from `bun build`, which emits a class-name map. [#35163](https://github.com/oven-sh/bun/pull/35163)

### "jsx": "react-jsx" in tsconfig.json now emits jsx instead of jsxDEV v1.4.0

With `"jsx": "react-jsx"`, `bun run` and `bun build` now import `jsx` and `jsxs` from `<pkg>/jsx-runtime`. Before, both imported `jsxDEV` from `<pkg>/jsx-dev-runtime` unless `NODE_ENV=production` or `--production` was set. An explicit `NODE_ENV` still wins. To keep the development runtime, set `"jsx": "react-jsxdev"`. [#34422](https://github.com/oven-sh/bun/pull/34422)

```
{
  "compilerOptions": {
    "jsx": "react-jsx"
    "jsx": "react-jsxdev"
  }
}
```

### useDefineForClassFields: false in tsconfig.json is now honored v1.4.0

With `useDefineForClassFields: false`, Bun now does what tsc does:

- Instance field initializers move into the constructor, after parameter-property assignments.
- Plain declaration-only fields are dropped.

Before, the option was ignored. An initializer that reads a parameter property now works instead of throwing. Private and decorated fields keep their declarations. Static fields and classes with a computed non-literal field key are left as they were. To keep the old output, remove the option. [#36664](https://github.com/oven-sh/bun/pull/36664)

### Bun.Socket#setKeepAlive() now treats initialDelay as milliseconds v1.4.0

`setKeepAlive(true, delay)` on a `Bun.Socket` now divides `delay` by 1000 before setting `TCP_KEEPIDLE`, as documented. Before, the raw value was used as seconds, so `4000` meant 4000 seconds. A value under 1000 now divides to `0` and leaves `TCP_KEEPIDLE` unchanged. Code that passed seconds should pass milliseconds. `setKeepAlive(true)` now returns `true` instead of `false`. `net.Socket#setKeepAlive()` still sets the same kernel value as before. [#34269](https://github.com/oven-sh/bun/pull/34269)

```
socket.setKeepAlive(true, 60);
socket.setKeepAlive(true, 60_000);
```

### Bun.mmap({ offset }) now starts the view at offset v1.4.0

`Bun.mmap(path, { offset })` now returns a view whose index 0 is the byte at `offset`. Before, `offset` was rounded down to a page boundary. The view started at that boundary, for reads and for writes through `{ shared: true }`. Remove any `offset % pageSize` adjustment you added to compensate. [#34120](https://github.com/oven-sh/bun/pull/34120)

```
const m = Bun.mmap("data.bin", { offset: 100 });
m[0]; // byte 0 of the file
m[0]; // byte 100 of the file
```

### Bun.cron.parse() and in-process Bun.cron() now use local time v1.4.0

[`Bun.cron.parse()`](#bun-cron) and the in-process `Bun.cron(schedule, handler)` overload now read schedules in the process's local time zone. Before, they used UTC. This matches the OS-registered overload. `"0 9 * * *"` under `TZ=America/Los_Angeles` now means 9:00 Pacific. To keep the old times, pass `{ tz: "UTC" }`. Both accept it as a new final argument. [#35122](https://github.com/oven-sh/bun/pull/35122)

```
Bun.cron("0 9 * * *", handler);
Bun.cron("0 9 * * *", handler, { tz: "UTC" });
```

### Bun.$ now globs only patterns written in the template itself v1.4.0

Glob characters that arrive through `${...}`, a shell variable, command substitution, or quoted text are now literal. Only `*`, `**`, and braces written directly in the template expand. `?`, `[...]`, and a leading `!` are literal everywhere. Before, `` $`echo ${"**/"}*` `` matched recursively. It now fails with `no matches found`. Write the pattern in the template instead. [#31220](https://github.com/oven-sh/bun/pull/31220)

```
await $\`echo ${"**/"}*\`;
await $\`echo **/*\`;
```

### fs.rmdir no longer accepts { recursive: true } v1.4.0

Passing `recursive: true` to `fs.rmdir` now throws `ERR_INVALID_ARG_VALUE`. This matches Node.js, which removed the option after a long deprecation. Use [`fs.rm`](https://nodejs.org/api/fs.html#fspromisesrmpath-options) instead. [#31830](https://github.com/oven-sh/bun/pull/31830)

```
await fs.rmdir("build", { recursive: true });
await fs.rm("build", { recursive: true, force: true });
```

### X509Certificate serial and modulus are now uppercase hex v1.4.0

`X509Certificate#serialNumber`, `.toLegacyObject().modulus`, and `tls.TLSSocket#getPeerCertificate()` now return uppercase hex. This matches Node.js and `openssl x509 -serial`. If you pin certificates against a lowercase serial string, normalize the case first. [#31519](https://github.com/oven-sh/bun/pull/31519)

```
const { serialNumber } = new X509Certificate(pem);
// "3b8e2a..."
// "3B8E2A..."
```

### tls.createServer({ requestCert: true }) now rejects unverified client certificates v1.4.0

A `node:tls` server with `requestCert: true` and no explicit `rejectUnauthorized` now applies the default of `true`. A connection whose client certificate does not verify is destroyed, and the server emits `tlsClientError`. Before, it reached your handler with `authorized: false`. To keep admitting those clients, pass `rejectUnauthorized: false`. [#31322](https://github.com/oven-sh/bun/pull/31322)

```
tls.createServer({
  ca,
  requestCert: true,
  rejectUnauthorized: false,
});
```

### dgram.Socket now throws synchronously on a second bind() and after close() v1.4.0

Two `node:dgram` changes, both matching Node.js:

- `bind()` on a socket that is already bound throws `ERR_SOCKET_ALREADY_BOUND`. Before, it emitted an `error` event.
- `bind()`, `send()`, `address()`, `remoteAddress()`, and `close()` on a closed socket throw `ERR_SOCKET_DGRAM_NOT_RUNNING`. Before, they threw an uncoded `TypeError` (or, for `bind()`, emitted an `error` event).

Code that handled a second `bind()` in an `error` listener needs a `try` / `catch`. [#33037](https://github.com/oven-sh/bun/pull/33037) [#33024](https://github.com/oven-sh/bun/pull/33024)

### dns.lookup() now uses the system resolver on Linux v1.4.0

On Linux, `dns.lookup()`, `dns.promises.lookup()`, and hostname resolution in `net.connect()` now go through `getaddrinfo()`, as in Node.js. Before, they used c-ares. Names that only `systemd-resolved` or a split-DNS VPN knows now resolve. Before, they failed with `getaddrinfo EREFUSED`. `dns.setServers()` no longer affects these calls. `dns.resolve*()` and `Bun.dns.lookup()` still use c-ares. If you need the old behavior for a lookup, pass `{ backend: "c-ares" }` to `Bun.dns.lookup()`. [#37383](https://github.com/oven-sh/bun/pull/37383)

### Exceptions thrown in node:fs, node:dns, and crypto.pbkdf2 callbacks are now uncaughtException v1.4.0

An exception thrown inside a `node:fs`, `node:dns`, or `crypto.pbkdf2()` callback now reaches `process.on("uncaughtException")`, as in Node.js. Before, it surfaced as an `unhandledRejection`. A handler registered there no longer sees it. Move the handler. [#34660](https://github.com/oven-sh/bun/pull/34660)

```
fs.readFile("config.json", () => { throw new Error("bad config"); });
process.on("unhandledRejection", onError);
process.on("uncaughtException", onError);
```

### net.Server and tls.Server no longer auto-resume accepted sockets; tls.Server checks requestCert and rejectUnauthorized literally v1.4.0

- Sockets accepted by `net.Server` or `tls.Server` are no longer resumed automatically. Bytes that arrive before a `'data'` listener is attached are buffered, as in Node.js.
- Only a literal `rejectUnauthorized: false` disables verification. This applies to `tls.connect()` and `tls.Server`. Before, `null` did too.
- `requestCert` must be literally `true`.
- A `tls.Server` no longer reads `NODE_TLS_REJECT_UNAUTHORIZED` for its default.
- `handshakeTimeout` now also emits the socket's `'timeout'` event (after `'tlsClientError'`). It leaves the socket open instead of destroying it.
- An exception thrown in an `onread` callback or `'secureConnection'` listener is now an uncaught exception.

[#32630](https://github.com/oven-sh/bun/pull/32630) [#34598](https://github.com/oven-sh/bun/pull/34598) [#35006](https://github.com/oven-sh/bun/pull/35006)

```
tls.createServer({
  key,
  cert,
  ca,
  requestCert: 1,
  rejectUnauthorized: null,
  requestCert: true,
  rejectUnauthorized: false,
});
```

### fetch() responses and Bun.serve requests now combine duplicate headers with, v1.4.0

Duplicate headers on a `fetch()` response or a `Bun.serve` request are now joined with `, `, per the Fetch spec. Before, only the last value was kept. Common headers were already combined. This change affects the rest, including every custom header. `fetch()` responses also keep empty values now. A header sent with no value reads `""` instead of `null`. `Set-Cookie` still comes back as separate values from `getSetCookie()`. [#31734](https://github.com/oven-sh/bun/pull/31734)

```
// X-Dup: first
// X-Dup: second
res.headers.get("x-dup");
// "second"
// "first, second"
```

### Request#clone() and Response#clone() now throw once the body has been read v1.4.0

`clone()` on a `Request` or `Response` whose body has been read, or whose stream is locked, now throws `TypeError: Body is disturbed or locked` (`ERR_BODY_ALREADY_USED`). This is per the Fetch spec. It includes the request passed to `Bun.serve` route handlers. Before, `clone()` succeeded and the problem showed up later, as an empty body or an error when the clone was read. Call `clone()` before reading the body. [#33129](https://github.com/oven-sh/bun/pull/33129)

```
const text = await req.text();
const copy = req.clone();
const copy = req.clone();
const text = await req.text();
```

### fetch() network errors are now TypeError, and a failed body read sets bodyUsed v1.4.0

`fetch()` and response body reads now reject a network error with a `TypeError`. Before, it was a plain `Error`. `.code` (for example `ECONNRESET`) is still set. After a body read fails, `bodyUsed` is `true`. A second read rejects with `ERR_BODY_ALREADY_USED` instead of the socket error. Issue a new `fetch()` to retry. `fetch(request)` with a request whose stream body was already used now rejects with the same `TypeError` before connecting. [#35855](https://github.com/oven-sh/bun/pull/35855) [#36499](https://github.com/oven-sh/bun/pull/36499)

```
const res = await fetch(url); // connection drops mid-body
await res.text(); // rejects with Error, code "ECONNRESET"
await res.text(); // rejects with TypeError, code "ECONNRESET"
```

### Bun.serve({ inspector }) has been removed v1.3.14

The undocumented `inspector: true` option is now silently ignored. It mounted a `/bun:inspect` debugger WebSocket on your HTTP port. It predated `bun --inspect` and was never in the public types. Use the [`--inspect` flag](https://bun.sh/docs/runtime/debugger) to attach a debugger. [#29613](https://github.com/oven-sh/bun/pull/29613)

```
Bun.serve({ inspector: true, fetch });
Bun.serve({ fetch });
```

```
bun --inspect server.ts
```

### server.publish() and ws.publish() now return 0 or -1 under backpressure v1.4.0

`server.publish()`, `ws.publish()`, `ws.publishText()`, and `ws.publishBinary()` now return:

- `0` if the message was dropped for any subscriber, or the topic had no subscribers
- `-1` if any subscriber has backpressure
- the byte count otherwise

Before, they returned the byte count whenever the topic had a subscriber, even when the data was discarded. Code that compares the return value against the byte count should treat `0` as dropped and `-1` as queued. [#32889](https://github.com/oven-sh/bun/pull/32889)

### server.stop() now closes idle connections and waits for in-flight requests v1.4.0

`server.stop()` now closes idle keep-alive connections immediately. It closes busy ones once their response is sent. It resolves when the last connection has closed. Before, it closed only the listener and resolved while requests were still being served. It now stays pending on a connection that has sent part of a request and stopped. `server.stop(true)` closes such connections. It now works after a graceful `stop()` too. [#35130](https://github.com/oven-sh/bun/pull/35130) [#37074](https://github.com/oven-sh/bun/pull/37074)

### WebSocket (global) no longer accepts an agent option v1.3.6

The non-standard `agent` option on the Web-standard `WebSocket` constructor is removed. Node.js's global `WebSocket` uses an undici `dispatcher`, not an `http.Agent`. The ws package's `WebSocket`, which Bun polyfills natively, now accepts `agent` instead. This matches its documented API. [#25935](https://github.com/oven-sh/bun/pull/25935)

```
const ws = new WebSocket(url, { agent });          // global
import WebSocket from "ws";
const ws = new WebSocket(url, { agent });          // ws module
```

### WebSocket#close(), ping(), and pong() now validate their arguments v1.4.0

`close()` now throws `InvalidAccessError` for a code other than `1000` to `1003`, `1007` to `1014`, or `3000` to `4999`. It throws `SyntaxError` for a reason longer than 123 UTF-8 bytes. Before, an invalid code went out unchecked. With the default code, an over-long reason was silently sent as empty. `ping()` and `pong()` on the `WebSocket` client, `ServerWebSocket`, and the ws package now throw `RangeError` for a payload over 125 bytes. Before, they sent it. Shorten the reason or payload. [#32820](https://github.com/oven-sh/bun/pull/32820) [#35030](https://github.com/oven-sh/bun/pull/35030)

### WebSocket now fails the handshake if a requested subprotocol is not negotiated v1.4.0

`new WebSocket(url, protocols)` now closes with code `1002` when the server's `101` response omits `Sec-WebSocket-Protocol`. This is per RFC 6455 and matches browsers. Before, it opened with `ws.protocol === ""`. Fix the server to echo a protocol, or stop passing `protocols`. Connections that request no subprotocol are unaffected. [#33072](https://github.com/oven-sh/bun/pull/33072)

### WebSocket#close() no longer fires close before it returns v1.4.0

`ws.close()` and `ws.terminate()` on a `WebSocket` client now queue the `close` event, as in Node.js and browsers. When the call returns, `readyState` is `CLOSING` and `onclose` has not run yet. Code that read `CLOSED` on the next line, or relied on `onclose` having run, should await the `close` event instead. [#27259](https://github.com/oven-sh/bun/pull/27259)

```
ws.close();
ws.readyState; // 3, CLOSED
ws.readyState; // 2, CLOSING
```

### jest.resetAllMocks() now drops mock implementations v1.4.0

`jest.resetAllMocks()` and `vi.resetAllMocks()` now reset every mock's implementation as well as its call history. This matches Jest. Before, they behaved like `clearAllMocks()`. After the reset, a `jest.fn(() => 42)` returns `undefined`. A `spyOn()` spy returns `undefined` until `mockRestore()`. If you only want the call history cleared, call `clearAllMocks()`. [#33374](https://github.com/oven-sh/bun/pull/33374)

```
afterEach(() => {
  jest.resetAllMocks();
  jest.clearAllMocks();
});
```

### expect().toContain() now compares with === instead of Object.is v1.4.0

`toContain()` in `bun:test` now compares array and iterable elements with `===` instead of `Object.is`. This matches Jest. `expect([-0]).toContain(0)` passes and `expect([NaN]).toContain(NaN)` fails. `toBe()` still uses `Object.is`. `toContainEqual()` still uses deep equality. [#32950](https://github.com/oven-sh/bun/pull/32950)

```
expect(values).toContain(NaN);
expect([...values].some(Number.isNaN)).toBe(true);
```

### Bun.sql now decodes MySQL DATETIME and TIMESTAMP as UTC v1.4.0

MySQL `DATETIME` and `TIMESTAMP` columns are now decoded as UTC. This matches how `Bun.sql` encodes them, so a `Date` round-trips unchanged. Before, it came back shifted by the machine's UTC offset on any host not running in UTC. Postgres `timestamp` read through `.simple()` is decoded as UTC too. `timestamptz` is unaffected. Remove any offset correction you added. [#31212](https://github.com/oven-sh/bun/pull/31212)

```
await sql\`INSERT INTO t (dt) VALUES (${new Date("2024-06-15T12:00:00Z")})\`;
const [{ dt }] = await sql\`SELECT dt FROM t\`;
dt.toISOString(); // "2024-06-15T16:00:00.000Z" under TZ=America/New_York
dt.toISOString(); // "2024-06-15T12:00:00.000Z"
```

### Bun.sql now parses MariaDB 10.5+ JSON columns instead of returning strings v1.4.0

On MariaDB 10.5 and later, `Bun.sql` now parses `JSON` columns and JSON function results such as `JSON_OBJECT()` and `JSON_EXTRACT()`. Before, it returned the JSON text as a string. A `json` column holding `{"b": 1}` now reads as the object `{ b: 1 }`. Remove the `JSON.parse()`. [#37130](https://github.com/oven-sh/bun/pull/37130)

```
const [row] = await sql\`SELECT a FROM t\`;
const a = JSON.parse(row.a);
const a = row.a; // { b: 1 }
```

### Other behavior changes v1.4.0

- The `bun feedback` command is removed. [#38444](https://github.com/oven-sh/bun/pull/38444)
- `Bun.password.hash()` with argon2 now requires `memoryCost` of at least 8. Hashes made by Bun 1.3 with a lower `memoryCost` still verify. [#39596](https://github.com/oven-sh/bun/pull/39596)
- `bun update` now moves transitive packages. `bun update <name>` errors (exit 1) on a name nothing depends on. Before, it added the package. `--production` / `--prod` on `update` means "only update `dependencies` and `optionalDependencies` ". `-i` updates only the selection. [#38333](https://github.com/oven-sh/bun/pull/38333)
- A project's `bunfig.toml` now overrides any `.npmrc` for the same key. [#38333](https://github.com/oven-sh/bun/pull/38333)
- `bun install <pkg> --filter x` now edits `x`, not the root. `bun add y --filter x` no longer installs a package named `x`. `add` / `remove --filter '*'` no longer includes the root. [#38333](https://github.com/oven-sh/bun/pull/38333)
- A plain `bun add x` in a workspace whose default catalog lists `x` now writes `catalog:`. `audit fix` may rewrite exact pins. `--frozen-lockfile --lockfile-only` writes nothing. Overrides/catalog changes fail frozen installs. [#38333](https://github.com/oven-sh/bun/pull/38333)
- Projects with `catalog:` peers or dead `pkg@range` override rows see one-time lockfile churn after upgrading. Lockfiles that use nested or version-scoped overrides are `lockfileVersion: 3`. Older Bun cannot read version 3. Turborepo and Nx changes to accept it are open upstream. Dependabot needs nothing. [#38333](https://github.com/oven-sh/bun/pull/38333)
- `bun init` now writes typescript `^7`. Before, it wrote `^5`, or nothing in the React templates. A fresh project installs TypeScript 7. [#33265](https://github.com/oven-sh/bun/pull/33265) [#39341](https://github.com/oven-sh/bun/pull/39341)
- `bun init` with a non-TTY stdin (CI, a piped `spawn`) now behaves as `bun init -y`. Before, it opened the template picker. [#35165](https://github.com/oven-sh/bun/pull/35165)
- `bun update -i` with a non-TTY stdin now exits with code `1` and an error. Before, it opened the picker. Use `bun update` or `bun outdated`. [#35165](https://github.com/oven-sh/bun/pull/35165)
- `bun update` with no package names now rewrites the root `catalog` and `catalogs` entries (to the newest version with `--latest`). It leaves `catalog:` references in workspace `package.json` files in place. Before, it replaced them with `^<version>`. With [`--recursive` or `--filter`](#bun-update-recursive-and-filter-update-every-selected-workspace), it rewrites each selected workspace's `package.json`. It touches the root catalog only when the root is selected. [#36304](https://github.com/oven-sh/bun/pull/36304) [#36360](https://github.com/oven-sh/bun/pull/36360) [#36379](https://github.com/oven-sh/bun/pull/36379)
- `bun install` and `bun remove` now drop a package from `bun.lock` when only an optional peer still points at it. A lockfile whose nested optional-peer placement differs from a fresh install may be rewritten once, on the first install after upgrading. [#35681](https://github.com/oven-sh/bun/pull/35681)
- [`trustedDependencies`](#trusteddependencies-only-auto-trusts-the-npm-registry) and `--trust` entries now match the exact package name. Before, they matched a truncated name hash. A package that only collides with an entry's hash no longer runs lifecycle scripts. If you meant to trust it, add the package's exact name. Entries loaded from a legacy `bun.lockb` still match by hash. [#31218](https://github.com/oven-sh/bun/pull/31218)
- `bun install --registry <url>` no longer sends the configured registry's credentials to `<url>` when it is a different host, or when it downgrades from `https://` to `http://`. [#36165](https://github.com/oven-sh/bun/pull/36165)
- `workspace:` ranges are now honored only in the root and workspace `package.json` files. Inside a downloaded package, they fail to resolve like any other unknown range. Before, they created a workspace package. [#37669](https://github.com/oven-sh/bun/pull/37669)
- `Bun.JSONC.parse()` now throws `SyntaxError` on invalid input. Before, it threw a `BuildMessage`. `Bun.JSONC.parse("")` also throws `SyntaxError`. Before, it returned `{}`. [#35066](https://github.com/oven-sh/bun/pull/35066)
- Wildcard `exports` and `imports` targets in `package.json` that do not name an existing file are now retried with each known extension, or with `.ts` in place of `.js`. A subpath such as `@modelcontextprotocol/sdk/server/stdio` now resolves. Before, it failed with `Cannot find module`. [#36299](https://github.com/oven-sh/bun/pull/36299)
- `bun build` now bundles an unresolvable `require()`, `require.resolve()`, or `await import()` inside `catch` as a runtime throw. Before, it failed with `Could not resolve`. [#35659](https://github.com/oven-sh/bun/pull/35659)
- Assigning to an imported binding is no longer a parse error at runtime. The module loads, and the assignment throws `TypeError` when reached. `bun build` still reports it as an error. [#36046](https://github.com/oven-sh/bun/pull/36046)
- `bun build --target browser` now honors a package's `browser` field entry for a Node builtin (`"crypto": false` or a remap). Before, it bundled the polyfill. It also resolves `require()` of a package that has `jsnext:main` but no `module` field to its `main`, as it already did for `module`. [#35447](https://github.com/oven-sh/bun/pull/35447) [#36597](https://github.com/oven-sh/bun/pull/36597)
- A bundled `import * as ns` namespace now enumerates its exports in sorted order. The spec requires this, and unbundled code already did it. Update snapshots that pinned the old order. [#35957](https://github.com/oven-sh/bun/pull/35957)
- `bun build --minify` no longer generates a bare `$` identifier. That identifier shadowed jQuery's `$` when a bundle was loaded as a classic script. [#35668](https://github.com/oven-sh/bun/pull/35668)
- ESM imports of builtin modules (`node:fs`, `node:process`, `node:module`), and `export * from "bun"` or a non-literal `import()` of `"bun"`, no longer evaluate every lazy export at import time. Each export is evaluated when something first binds to it. For `"bun"`, a property that throws when constructed (`Bun.redis` with an invalid `REDIS_URL`) now throws at the binding that uses it. Before, it failed the whole module. [#37525](https://github.com/oven-sh/bun/pull/37525) [#37714](https://github.com/oven-sh/bun/pull/37714) [#37726](https://github.com/oven-sh/bun/pull/37726)
- `bun build --metafile` now sets a bundled import's `path` to the imported file's `inputs` key (`src/b/shared.js`). Before, it was the raw specifier or an absolute path, so `metafile.inputs[path]` never matched. [#34534](https://github.com/oven-sh/bun/pull/34534)
- `Bun.randomUUIDv7()` now throws `RangeError` for a timestamp of `2**48` or more. Before, values up to `2**53 - 1` were truncated to 48 bits. It also throws for a `NaN` timestamp, an invalid `Date`, or a `Date` before 1970. Before, these were encoded as `0`. [#34021](https://github.com/oven-sh/bun/pull/34021)
- `Bun.udpSocket({ connect: { port } })` now throws for a port outside `1` to `65535`. Before, it connected to port `0` and dropped every datagram. [#34029](https://github.com/oven-sh/bun/pull/34029)
- `Bun.YAML.parse()` now throws `SyntaxError` on a NUL byte. Before, it silently stopped there. If you pad a buffer with zeros, pad with newlines instead.
- `Bun.color()` output changed for `"ansi-16"` (a real 16-color escape such as `\x1b[91m`), `"hsl"` and `"lab"` (valid CSS such as `hsl(0, 100%, 50%)`), and near-black `"ansi-256"` colors. A 24-bit number such as `0xff0000` is now opaque. Before, it had alpha `0`. [#33328](https://github.com/oven-sh/bun/pull/33328) [#33046](https://github.com/oven-sh/bun/pull/33046)
- `Bun.Cookie` now serializes `Expires` like `Date#toUTCString()`. Before, the weekday was one day off, the day was unpadded, and the zone was `-0000` instead of `GMT`. Update tests that assert the old string. [#32926](https://github.com/oven-sh/bun/pull/32926)
- `structuredClone()`, `self.postMessage()` inside a worker, and `new Worker(path, { transferList })` now throw `TypeError` for a transfer entry that is not an object, such as `null`. Before, they skipped it. [#32809](https://github.com/oven-sh/bun/pull/32809)
- `bun:ffi` `viewSource()` and `new JSCallback()` now throw on invalid arguments. Before, `viewSource()` returned the error, and `JSCallback` returned an instance whose `ptr` was `undefined`. [#34396](https://github.com/oven-sh/bun/pull/34396)
- `Bun.FileSystemRouter.match()` now returns `null` for a non-empty path string that does not start with `/`. Before, `"Xtop"` matched `/top`. Full URLs are unaffected. [#34028](https://github.com/oven-sh/bun/pull/34028)
- `Bun.Terminal#write()` now returns the full input length, because the whole input is buffered. Before, it returned only the bytes flushed synchronously, and re-sending the rest duplicated input. `drain` now fires on POSIX. [#34289](https://github.com/oven-sh/bun/pull/34289)
- `new Bun.RedisClient(url)` now throws `Invalid database number in Redis URL: "notadb"` when the URL path is not a database index, such as `redis://host/notadb`. Before, it connected to database `0`. [#34039](https://github.com/oven-sh/bun/pull/34039)
- `Bun.spawn()` and `Bun.spawnSync()` now throw `ERR_INVALID_ARG_VALUE` for a NUL byte in `argv0` or `cwd`. Before, `argv0` was silently cut at the NUL.
- `Bun.$` now fails with `ambiguous redirect` when a redirect target such as `> *.txt` expands to more than one word. Before, the words were joined into one path. [#34324](https://github.com/oven-sh/bun/pull/34324)
- Nine [input validation hardening](#input-validation-hardening) rounds tightened input validation and bounds checks across the runtime. Each PR lists the subsystems it touched.
- `Bun.spawn()` and `Bun.spawnSync()` now throw `ERR_OUT_OF_RANGE` for `timeout: NaN` and `ERR_UNKNOWN_SIGNAL` for `killSignal: 0`. Before, `timeout: NaN` meant no timeout, and `killSignal: 0` sent a no-op signal. The child kept running either way. [#35348](https://github.com/oven-sh/bun/pull/35348)
- `Bun.spawn()` and `Bun.spawnSync()` now throw `AbortError` (with `cause` set to `signal.reason`) for a `signal` that is already aborted. No process is created. Before, `Bun.spawn()` started the child and then killed it, and `Bun.spawnSync()` ran it to completion.
- `bun:sqlite` `db.close()` now finalizes every `db.query()` statement, not only the cached ones. `db.prepare()` statements keep working until finalized. `db.close(true)` finalizes those too. Before, it threw `database is locked`. A statement that `close()` finalized throws when used. [#36573](https://github.com/oven-sh/bun/pull/36573) [#36793](https://github.com/oven-sh/bun/pull/36793)
- `bun:sqlite` row objects and `stmt.columnNames` now keep a column aliased `AS ""`. Before, it was dropped, and a trailing one made `.all()` return a number. `columnNames` now throws after `finalize()`. [#34925](https://github.com/oven-sh/bun/pull/34925)
- Two robustness passes changed several edge cases. `Bun.spawn({ stdout: typedArray })` throws instead of aborting. `FileSystemRouter` no longer matches a URL shorter than the route pattern. CSS serialization escapes identifiers consistently. Workers read `process.env` at runtime instead of at transpile time. The PR bodies list the rest.
- `S3Client.list()` entries now expose `checksumAlgorithm`. The misspelled `checksumAlgorithme` still works but is non-enumerable. It no longer appears in `Object.keys()` or `JSON.stringify()` output. [#36502](https://github.com/oven-sh/bun/pull/36502)
- More inputs that were silently accepted now throw:
	- odd-length hex passed to `Bun.CryptoHasher#update()`
		- a primitive `options` argument to `TextDecoder#decode()`
		- invalid arguments to `crypto.createDiffieHellman()` (before, returned as an error object)
		- `NaN` or `undefined` seconds in `RedisClient#expire()` (before, sent `EXPIRE key 0`)
		- fractional or beyond-32-bit ports for `Bun.udpSocket()`, and `cost`, `timeCost`, or `memoryCost` values for `Bun.password` (before, wrapped or truncated into range)
		- `Bun.openInEditor()` with no editor found (before, returned silently)
		- an `fs.write()` `offset` past the end of the buffer when `length` is omitted (before, wrote 0 bytes)
	[#35188](https://github.com/oven-sh/bun/pull/35188) [#35189](https://github.com/oven-sh/bun/pull/35189) [#36508](https://github.com/oven-sh/bun/pull/36508) [#36835](https://github.com/oven-sh/bun/pull/36835) [#36999](https://github.com/oven-sh/bun/pull/36999) [#37210](https://github.com/oven-sh/bun/pull/37210) [#37632](https://github.com/oven-sh/bun/pull/37632)
- `new URL(bad)` now throws Node's `TypeError: Invalid URL` with `code` and `input` set. It rejects an invalid punycode `xn--` host for special schemes. [#34660](https://github.com/oven-sh/bun/pull/34660)
- `assert.deepStrictEqual()` and `util.isDeepStrictEqual()` now compare prototypes, as in Node.js. `Bun.deepEquals()` and `expect()` are unchanged. [#34660](https://github.com/oven-sh/bun/pull/34660)
- `child_process.spawn()` now ignores `options.encoding`, as Node does. `stdout` and `stderr` always emit `Buffer` chunks. Call `child.stdout.setEncoding()` to get strings. [#36050](https://github.com/oven-sh/bun/pull/36050)
- N-API status codes on validation and failure paths now match Node 26. For example, `napi_wrap()` on a non-object returns `napi_invalid_arg`. `napi_reference_ref()` returns `0` once the referent has been collected. `napi_get_buffer_info()` rejects a bare `ArrayBuffer`. Addons that branch on a specific status see Node's values. [#36805](https://github.com/oven-sh/bun/pull/36805) [#36850](https://github.com/oven-sh/bun/pull/36850)
- `fs.open()` now throws `ERR_INVALID_ARG_VALUE` when an object is passed as `flags`. Before, `{}` opened the file read-only. [#34505](https://github.com/oven-sh/bun/pull/34505)
- `fs.rm()` and `fs.rmSync()` now reject `recursive`, `force`, `retryDelay`, or `maxRetries` explicitly set to `undefined`, as Node does. Omit the key instead. [#34505](https://github.com/oven-sh/bun/pull/34505)
- On Windows, `process.binding("uv")` and every `node:fs` error now use libuv's error numbers (`-4058` for `ENOENT`). Before, the binding and some fs calls such as `fs.access()` reported CRT values like `-2`. POSIX is unchanged. [#34505](https://github.com/oven-sh/bun/pull/34505)
- `fs.write()`, `fs.writev()`, and `fs.readv()` now operate at the current file offset when `position` is not a safe integer (`NaN`, `Infinity`, a BigInt), as Node does. `fs.createWriteStream()` no longer overwrites the start of the file after a short write. [#36135](https://github.com/oven-sh/bun/pull/36135)
- `fs.appendFile()` and `fs.appendFileSync()` with `{ flag: "w" }` now truncate the file, as the flag says. Before, they appended. [#36553](https://github.com/oven-sh/bun/pull/36553)
- `fs.watch()` with `recursive: true` on Linux and FreeBSD now emits `'error'` (for example `ENOSPC`, with the subdirectory's `path`) for a subdirectory it cannot watch. It keeps watching the rest. Before, the subdirectory was skipped silently. [#36415](https://github.com/oven-sh/bun/pull/36415)
- `session.remoteSettings` in `node:http2` is now `{}` while the session is connecting or destroyed, as in Node. Before, it was `null`. Reading a setting right after `connect()` now returns `undefined` instead of throwing. `session.localSettings` is `{}` at that point too. Before the peer's ACK, it shows only the defaults plus your `customSettings`. [#34358](https://github.com/oven-sh/bun/pull/34358)
- `node:http2` `stream.end(chunk)` now sets `END_STREAM` on the `DATA` frame carrying `chunk`, as Node does. Before, it sent an empty frame after it. [#34432](https://github.com/oven-sh/bun/pull/34432)
- `node:http2` `pushStream()` now reports invalid headers only through its callback, as Node does. The pushed stream no longer also emits `'error'`. [#36551](https://github.com/oven-sh/bun/pull/36551)
- [`node:test`](#node-test) suites marked `skip` no longer run their callback. Before, the body ran and its tests were registered. `{ skip: true, todo: true }` now counts as a skip, not a todo. [#34444](https://github.com/oven-sh/bun/pull/34444)
- `process.execve()` now throws an error carrying `code`, `syscall`, `errno`, and `path` when the exec fails. This matches Node 26. Before, it printed an error and aborted.
- `process.title` now defaults to `argv[0]` as invoked. Before, it was `"bun"`. [#31831](https://github.com/oven-sh/bun/pull/31831)
- `require()`, `(await import()).default`, and `process.getBuiltinModule()` now return the same object for a natively implemented builtin such as `node:buffer`. `module.builtinModules` no longer lists `bun:wrap`. [#31831](https://github.com/oven-sh/bun/pull/31831)
- `process.reallyExit()` no longer emits `'exit'` before exiting. This matches Node. If you rely on `'exit'` listeners running, call `process.exit()`. [#34997](https://github.com/oven-sh/bun/pull/34997)
- `util.styleText()` now follows the Node 26 API. It returns plain text when the target stream (`process.stdout` by default) is not a TTY. Pass `{ validateStream: false }` to always get escape codes. `util.inspect()` now brackets `ArrayBuffer` internals (`[byteLength]: 4`). `util.format("%s", date)` prints the ISO form. `vm` module namespaces have a `null` prototype. [#34434](https://github.com/oven-sh/bun/pull/34434)
- Warnings are now printed as `(node:PID) [CODE] Name: message`. Adding a `'warning'` listener no longer replaces the default printer (see [`process`](#process)). Silence it with `process.removeAllListeners("warning")` or `--no-warnings`. [#31831](https://github.com/oven-sh/bun/pull/31831) [#37344](https://github.com/oven-sh/bun/pull/37344)
- `crypto.subtle` is now a getter on `Crypto.prototype`. It throws `ERR_INVALID_THIS` when read off anything but a `Crypto`. `subtle.importKey("jwk", ...)` with a non-JWK object now rejects with `DataError`. Before, it threw `TypeError`. An unknown key format is reported as `ERR_INVALID_ARG_VALUE`. [#34838](https://github.com/oven-sh/bun/pull/34838)
- `fetch()` now returns a rejected promise when reading its options throws. Before, it threw synchronously. A synchronous `try` / `catch` around an unawaited call no longer catches it. [#33649](https://github.com/oven-sh/bun/pull/33649)
- `Response.redirect(url)` now parses and re-serializes an absolute `url` before writing `Location`. `http://example.com` becomes `http://example.com/`. A relative `url` is written as-is. A relative `url` containing a code point above U+00FF now throws `TypeError`. [#33126](https://github.com/oven-sh/bun/pull/33126)
- `fetch()` now rejects the body read when a compressed response with neither `Content-Length` nor `Transfer-Encoding` is cut off early. Before, it resolved with partial data. [#34922](https://github.com/oven-sh/bun/pull/34922)
- `fetch()` now errors the response body when its `signal` aborts, even if the whole body has already arrived. Pending and later reads reject with `AbortError` (or the abort reason). Before, they resolved with the buffered bytes. This matches Node.js.
- `fetch()` now parses `Connection`, `Transfer-Encoding`, `Content-Encoding`, and `Upgrade` as token lists. Any `close` token disables connection reuse. `Transfer-Encoding: gzip, chunked` is framed as chunked instead of rejected. `identity` codings are ignored. A connection that carried an HTTP/1.0 response is reused only if the response said `Connection: keep-alive`. [#36777](https://github.com/oven-sh/bun/pull/36777) [#37530](https://github.com/oven-sh/bun/pull/37530)
- `fetch()` now sends Latin-1 request header values byte-for-byte, per the Fetch spec. Before, it UTF-8 encoded them. `café` goes out as `63 61 66 e9`. [#35338](https://github.com/oven-sh/bun/pull/35338)
- `fetch()` with `redirect: "error"` now rejects only on `301`, `302`, `303`, `307`, and `308`, per the Fetch spec. Other `3xx` such as `304` now resolve. Before, they rejected with `UnexpectedRedirect`. [#36539](https://github.com/oven-sh/bun/pull/36539)
- `fetch()` now treats its idle timeout (still 300 seconds by default) as one deadline for receiving the whole response header block. A server that trickles header bytes now times out. Before, each byte reset the timer. [#36145](https://github.com/oven-sh/bun/pull/36145)
- `Bun.serve({ port })` now throws a `RangeError` for non-integer, negative, or out-of-range port values. Before, it silently clamped: `port: 65536` started a server on port 65535, and `port: -1` bound a random port. Numeric strings and `null` / `undefined` still work. [#34957](https://github.com/oven-sh/bun/pull/34957)
- `Bun.serve` now treats a returned `Response` with a status outside `100` to `999`, such as `Response.error()`, like a thrown error. It goes to `error()` and answers `500` by default. Before, it wrote an invalid status line. [#33400](https://github.com/oven-sh/bun/pull/33400)
- `Bun.serve` per-method route objects (`{ GET: handler }`) now answer `HEAD` with the `GET` handler when no `HEAD` key is set. Before, the request fell through to the next route or `404`. [#32822](https://github.com/oven-sh/bun/pull/32822)
- `Bun.serve` WebSocket connections now close with code `1006` and reason `Received an incorrectly masked frame` when a client sends an unmasked frame, per RFC 6455. Before, the frame was parsed as if it were masked. [#32820](https://github.com/oven-sh/bun/pull/32820)
- `Bun.serve` now answers `413` and closes the connection when a single chunk of a chunked request carries more than 16 KiB of chunk extensions. This matches `node:http`. [#34504](https://github.com/oven-sh/bun/pull/34504)
- `Bun.serve` [HTML routes](#sourcemaps-stay-out-of-production) with `development: false` no longer emit `sourceMappingURL` or `debugId` comments. `.map` URLs answer `404`. `[serve.static] sourcemap = "linked"` in `bunfig.toml` restores them. [#36982](https://github.com/oven-sh/bun/pull/36982)
- `Bun.serve({ tls: [...] })` now enforces `requestCert` and `rejectUnauthorized` set on a per- `serverName` entry. Before, they were ignored. Clients of that name without an acceptable certificate are refused. With `http3: true`, they are enforced over QUIC too. [#36174](https://github.com/oven-sh/bun/pull/36174) [#37669](https://github.com/oven-sh/bun/pull/37669)
- `Bun.serve` now answers `400` to a request whose `Transfer-Encoding` names anything besides a single final `chunked` (`gzip, chunked`, `chunked, chunked`). Before, such requests got `200` with the body still encoded. `node:http` still accepts `gzip, chunked` but now rejects `chunked, chunked`. [#35295](https://github.com/oven-sh/bun/pull/35295)
- `server.upgrade()` now returns `false` unless the request has `Upgrade: websocket` and a well-formed `Sec-WebSocket-Key`. It answers `426` when `Sec-WebSocket-Version` is not `13`. Before, any `GET` with a 24-byte key was upgraded. [#35298](https://github.com/oven-sh/bun/pull/35298)
- `ws.subscribe()` and `ws.unsubscribe()` now return `false` on a closed `ServerWebSocket` (and are typed `boolean`). [#35236](https://github.com/oven-sh/bun/pull/35236)
- `ws.send()` and `publish()` of an in-memory `Blob` now send its bytes as a binary frame. Before, they sent the text `[object Blob]`. A `Bun.file()` blob throws; read it first. [#36032](https://github.com/oven-sh/bun/pull/36032)
- `Bun.serve` static and file routes now evaluate `If-Match` and `If-Unmodified-Since` on `GET` and `HEAD`. They answer `412` when the precondition fails. Before, both headers were ignored. [#35169](https://github.com/oven-sh/bun/pull/35169)
- `new WebSocket(url, { proxy })` now throws `SyntaxError` at construction for a proxy scheme other than `http` or `https`. Before, it failed later with `Connection ended`. [#35147](https://github.com/oven-sh/bun/pull/35147)
- `Bun.deepEquals()` now distinguishes boxed BigInts and Symbols with different contents (`Object(1n)` vs `Object(2n)`). In strict mode (`toStrictEqual()`, `assert.deepStrictEqual()`), it also distinguishes a boxed string or typed array that carries extra own properties. Before, all of these compared equal. [#34434](https://github.com/oven-sh/bun/pull/34434)
- `Bun.sql` 's `connectionTimeout` now bounds the whole handshake. Before, it restarted on every packet. A Postgres server that sends a second authentication request now fails the connection with `ERR_POSTGRES_UNEXPECTED_MESSAGE`. [#36308](https://github.com/oven-sh/bun/pull/36308)
- `Bun.sql` now honors `PGSSLMODE` from the environment. A URL `?sslmode=` still wins. `PGSSLMODE=require` against a server without TLS now fails. Before, it connected in plaintext. `?ssl=` and `?ssl-mode=` are accepted as spellings. `tls: { caFile }` enables verification like `ca`. [#36840](https://github.com/oven-sh/bun/pull/36840) [#37669](https://github.com/oven-sh/bun/pull/37669)
- `Bun.sql` now decodes a Postgres `date`, `timestamp`, or `timestamptz` of `infinity` or `-infinity` as the number `Infinity` or `-Infinity`. Before, it was an invalid `Date`. Check for it before calling `Date` methods on the value. [#35121](https://github.com/oven-sh/bun/pull/35121)
- On Linux, Bun no longer sets `prctl(PR_SET_THP_DISABLE)` at startup. That flag was inherited across `execve`. It disabled transparent huge pages in every child process spawned via `Bun.spawn`, `bun run`, or lifecycle scripts. Bun's own allocations now opt out per-mapping via `MADV_NOHUGEPAGE`. Child processes inherit the system THP setting. [#36990](https://github.com/oven-sh/bun/pull/36990)

## Changelog

Everything below is the long tail: smaller features, compatibility fixes, and bug fixes, grouped by area. See the [full changelog](https://github.com/oven-sh/bun/compare/bun-v1.3.0...bun-v1.4.0) for the complete list.

### Runtime

#### ServerWebSocket.subscriptions v1.3.2

A new `subscriptions` getter returns an array of every topic the socket is currently subscribed to. [#24299](https://github.com/oven-sh/bun/pull/24299)

#### bun repl v1.3.10v1.4.0

`bun repl` is now native. It is built directly into the Bun binary instead of lazily downloading a separate npm package on first run. It ships a full TUI:

- syntax highlighting
- the standard terminal line-editing shortcuts (Ctrl-A, Ctrl-E, Ctrl-K)
- persistent history (`~/.bun_repl_history`)
- tab completion
- multi-line input with automatic continuation detection
- the standard `.help` /`.load` /`.save` /`.editor` commands

It supports top-level `await` and the `_` / `_error` special variables. Bare object literals work too: `{ a: 1 }` no longer needs to be wrapped in parens. [#26304](https://github.com/oven-sh/bun/pull/26304)

❯bun repl

Welcome to Bun v1.4.0

Type ".help" for more information.

\> { a: 1 }

{ a: 1 }

\> await fetch("https://bun.sh").then(r => r.status)

200

\> \_

200

`bun repl` now supports `-e <script>` to evaluate and `-p <script>` to evaluate and print, with full REPL semantics. Shell completions for `repl` ship for bash, fish, and zsh, and there's a new [REPL docs page](https://bun.com/docs/runtime/repl). [#27436](https://github.com/oven-sh/bun/pull/27436)

```
bun repl -e 'console.log(1 + 1)'
```

```
2
```

```
bun repl -p '{ a: 1, b: 2 }'
```

```
{ a: 1, b: 2 }
```

```
bun repl -p 'await fetch("https://bun.sh").then(r => r.status)'
```

```
200
```

#### bun./README.md v1.3.12

Bun pretty-prints Markdown files directly to your terminal: headings, tables, task lists, blockquotes, syntax-highlighted code blocks, and clickable hyperlinks, with correct alignment for emoji and Chinese/Japanese/Korean characters. No JavaScript VM is started. [#28833](https://github.com/oven-sh/bun/pull/28833)

```
bun ./README.md
```

```
project
═══════

│ Render Markdown to the terminal with bun ./README.md.

┌───────────────┬──────────────────────────┐
│ Command       │ What it does             │
├───────────────┼──────────────────────────┤
│ bun run build │ parallel build:* scripts │
│ bun profile   │ write a .cpuprofile      │
└───────────────┴──────────────────────────┘

┌─ ts
│ Bun.serve({
│   fetch: () => new Response("hello"),
│ });
└─
  ☒ tables
  ☒ task lists
  ☐ you, running bun ./README.md (https://bun.com)
```

#### Bun.JSON5 v1.3.7v1.4.0

Bun ships a native JSON5 parser. [`Bun.JSON5.parse()`](https://bun.com/docs/runtime/json5) and `Bun.JSON5.stringify()` are built in, and `.json5` files can be imported directly in both the runtime and the bundler with no npm package needed. It passes the official JSON5 test suite. [#26439](https://github.com/oven-sh/bun/pull/26439)

```
import config from "./config.json5";

const data = Bun.JSON5.parse(\`{
  // comments work
  unquoted: 'single quotes',
  trailing: [1, 2, 3,],
}\`);
```

#### Bun.JSONL v1.3.7

[`Bun.JSONL`](https://bun.com/docs/runtime/jsonl) is a built-in newline-delimited JSON parser. It is implemented in C++ on top of JavaScriptCore's optimized JSON parser. `Bun.JSONL.parse()` parses a complete JSONL string or `Uint8Array` into an array. `Bun.JSONL.parseChunk()` parses as many complete values as possible from streaming input. It returns `{ values, read, done, error }`, so you can resume where you left off without losing partial results. It parses ASCII input without an extra copy, skips UTF-8 BOMs automatically, and guards against inputs larger than 4 GB. [#26356](https://github.com/oven-sh/bun/pull/26356)

```
const results = Bun.JSONL.parse('{"a":1}\n{"b":2}\n');
// [{ a: 1 }, { b: 2 }]

const chunk = Bun.JSONL.parseChunk('{"id":1}\n{"id":2}\n{"id":3');
chunk.values; // [{ id: 1 }, { id: 2 }]
chunk.read; // 17
chunk.done; // false
```

#### Bun.JSONC.parse() v1.3.6v1.4.0

[`Bun.JSONC.parse()`](https://bun.com/docs/runtime/file-types) parses JSON with `//` and `/* */` comments and trailing commas. It's the same parser Bun uses internally to read `tsconfig.json`, exposed as a runtime API alongside `Bun.YAML` and `Bun.TOML`. [#22115](https://github.com/oven-sh/bun/pull/22115)

```
const config = Bun.JSONC.parse(\`{
  // This is a comment
  "name": "my-app",
  "dependencies": {
    "react": "^18.0.0", // trailing comma allowed
  },
}\`);
```

#### Bun.XML v1.4.0

[`Bun.XML`](https://bun.com/docs/runtime/xml) is a native XML parser. `Bun.XML.parse()` and `Bun.XML.stringify()` are built in, and `.xml` files can be imported directly in both the runtime and the bundler, alongside `Bun.TOML`, `Bun.YAML`, and `Bun.JSON5`. Parsing is ~5× faster than `fast-xml-parser` and `xml2js` on ~200 KB feeds. [#37048](https://github.com/oven-sh/bun/pull/37048)

```
import feed from "./atom.xml";

Bun.XML.parse(\`<order id="A1"><item>Tea</item><item>Mug</item><paid/></order>\`);
// { order: { "@id": "A1", item: ["Tea", "Mug"], paid: "" } }

Bun.XML.parse(\`<p>Hi <b>you</b></p>\`, { compact: false });
// { name: "p", attributes: {}, children: ["Hi ", { name: "b", ... }] }
```

#### Bun.TOML v1.4.0

[`Bun.TOML`](https://bun.com/docs/runtime/toml) was rewritten for full [TOML v1.1.0](https://toml.io/) conformance and now passes 708/708 cases in the official [toml-test](https://github.com/toml-lang/toml-test) suite.

```
const cfg = Bun.TOML.parse(\`
released = 2026-08-10T12:00:00Z

[package]
name = "app"
\`);
cfg.released; // "2026-08-10T12:00:00Z"

Bun.TOML.stringify({ name: "app", deps: { bun: "1.4.0" } });
// name = "app"
//
// [deps]
// bun = "1.4.0"
```

#### Bun.Archive v1.3.6

[`Bun.Archive`](https://bun.com/docs/runtime/archive) is a new built-in for creating and extracting tarballs without `node-tar` or any other dependency.

```
const archive = Bun.Archive.from({
  "hello.txt": "Hello, World!",
  "data.json": JSON.stringify({ foo: "bar" }),
});

await Bun.Archive.write("archive.tar.gz", archive, "gzip");

// Extract to a directory
await archive.extract("./out");
```

#### CompressionStream and DecompressionStream v1.3.3v1.4.0

Bun 1.3.3 added the Web-standard [`CompressionStream`](https://developer.mozilla.org/docs/Web/API/CompressionStream) and [`DecompressionStream`](https://developer.mozilla.org/docs/Web/API/DecompressionStream) APIs, supporting the spec formats `gzip`, `deflate`, and `deflate-raw` plus `brotli` and `zstd` as Bun-specific extensions.

```
const stream = new Blob([data])
  .stream()
  .pipeThrough(new CompressionStream("gzip"));

const compressed = await new Response(stream).arrayBuffer();
```

#### URLPattern v1.3.4

Bun now implements the [`URLPattern`](https://developer.mozilla.org/docs/Web/API/URLPattern) Web API for declarative URL matching.

```
const pattern = new URLPattern({ pathname: "/users/:id" });

pattern.test("https://example.com/users/123"); // true

const result = pattern.exec("https://example.com/users/123");
console.log(result.pathname.groups.id); // "123"
```

#### ML-DSA and ML-KEM in crypto.subtle v1.4.0

`crypto.subtle` supports the NIST post-quantum algorithms:

- ML-DSA (FIPS 204 signatures) at parameter sets 44/65/87, for `sign` / `verify`.
- ML-KEM (FIPS 203 key encapsulation) at 768/1024, via four new `SubtleCrypto` methods: `encapsulateBits`, `encapsulateKey`, `decapsulateBits`, and `decapsulateKey`.

Keys import and export as `spki`, `pkcs8`, `jwk`, `raw-public`, and `raw-seed`. They survive `structuredClone`. [#34838](https://github.com/oven-sh/bun/pull/34838)

```
const { publicKey, privateKey } = await crypto.subtle.generateKey(
  "ML-KEM-768",
  true,
  ["encapsulateBits", "decapsulateBits"],
);

// Sender: derive a shared secret + ciphertext from the recipient's public key
const { sharedKey, ciphertext } = await crypto.subtle.encapsulateBits(
  { name: "ML-KEM-768" },
  publicKey,
);

// Recipient: recover the same shared secret from the ciphertext
const secret = await crypto.subtle.decapsulateBits(
  { name: "ML-KEM-768" },
  privateKey,
  ciphertext,
);
```

#### ML-DSA and ML-KEM in node:crypto v1.4.0

[`node:crypto`](https://nodejs.org/api/crypto.html) now supports the NIST post-quantum algorithms ML-DSA (FIPS 204 signatures) and ML-KEM (FIPS 203 key encapsulation).

- `generateKeyPair` accepts `ml-dsa-44` / `-65` / `-87` and `ml-kem-768` / `-1024`.
- `sign()` and `verify()` work with ML-DSA keys.
- `createPublicKey` / `createPrivateKey` import PEM, DER, encrypted PKCS#8, and JWK (`kty: "AKP"`).

Seven of Node v26.3.0's upstream `test-crypto-pqc-*` suites now pass byte-for-byte. ML-KEM-512 and SLH-DSA are not yet available, because BoringSSL does not expose them via `EVP_PKEY`. `crypto.encapsulate()` / `decapsulate()` land in a later release. [#34549](https://github.com/oven-sh/bun/pull/34549)

```
import { generateKeyPairSync, sign, verify } from "node:crypto";

const { publicKey, privateKey } = generateKeyPairSync("ml-dsa-65");

const sig = sign(undefined, Buffer.from("hello"), privateKey);
verify(undefined, Buffer.from("hello"), publicKey, sig); // true

publicKey.export({ format: "jwk" });
// { kty: "AKP", alg: "ML-DSA-65", pub: "..." }
```

#### Response.textStream() and Request.textStream() v1.4.0

`Request` and `Response` now implement [`textStream()`](https://fetch.spec.whatwg.org/#dom-body-textstream), returning a `ReadableStream<string>` of the body decoded as UTF-8.

```
const res = await fetch("https://api.example.com/stream");
for await (const chunk of res.textStream()) {
  process.stdout.write(chunk); // chunk is a string
}
```

Multi-byte characters split across chunk boundaries are reassembled, a leading BOM is stripped, and invalid sequences become U+FFFD. Bun decodes each body backing directly rather than piping bytes through a `TextDecoderStream`, so in-memory bodies emit a single string chunk and `fetch()` responses decode inline as bytes arrive.

#### process.on("memoryPressure") v1.4.0

A new `"memoryPressure"` event on `process` fires when the OS signals low available memory, so applications can drop caches or reap idle subprocesses instead of polling. On macOS, Linux, and Windows, Bun subscribes to the operating system's built-in low-memory notification. The listener does not keep the event loop alive. [#32594](https://github.com/oven-sh/bun/pull/32594)

```
process.on("memoryPressure", (level: "warning" | "critical") => {
  cache.clear();
});
```

![process 'memoryPressure' event](https://bun.com/images/blog/bun-1.4/tweets/memory-pressure.jpg)

\`process\` emits a 'memoryPressure' event when the system runs low on memory (thanks @codebytere!)

#### Bun.sliceAnsi() v1.3.11v1.4.0

[`Bun.sliceAnsi()`](https://bun.com/docs/runtime/utils) slices a string by terminal column width while preserving ANSI colors and terminal hyperlinks, without splitting emoji or other multi-codepoint characters. It replaces the `slice-ansi` and `cli-truncate` npm packages, is faster than both, and returns the original string when nothing is cut. [#26963](https://github.com/oven-sh/bun/pull/26963)

```
// slice-ansi replacement
Bun.sliceAnsi("\x1b[31mhello\x1b[39m", 1, 4); // "\x1b[31mell\x1b[39m"

// cli-truncate replacement
Bun.sliceAnsi("unicorn", 0, 4, "…"); // "uni…"
Bun.sliceAnsi("unicorn", -4, undefined, "…"); // "…orn"
```

#### Bun.wrapAnsi() v1.3.7v1.4.0

[`Bun.wrapAnsi()`](https://bun.com/docs/runtime/utils#bun-wrapansi) is a native, drop-in replacement for the `wrap-ansi` npm package. It word-wraps text to a column width with the same ANSI/hyperlink/Unicode handling as above, and is up to 88x faster than the JavaScript version. [#26061](https://github.com/oven-sh/bun/pull/26061)

```
const wrapped = Bun.wrapAnsi("\x1b[31mThe quick brown fox\x1b[39m", 10);
console.log(wrapped);
// \x1b[31mThe quick\x1b[39m
// \x1b[31mbrown fox\x1b[39m
```

#### Bun.stringWidth() v1.3.5v1.4.0

[`Bun.stringWidth()`](https://bun.com/docs/runtime/utils#bun-stringwidth) returns the number of terminal columns a string occupies, accounting for ANSI escape sequences, zero-width Unicode, and multi-codepoint emoji graphemes.

```
Bun.stringWidth("hello"); // 5
Bun.stringWidth("\x1b[31mhello\x1b[0m"); // 5  (ANSI color)
Bun.stringWidth("\x1b[5A"); // 0  (cursor movement)
Bun.stringWidth("👨‍👩‍👧"); // 2  (ZWJ sequence, one grapheme)
Bun.stringWidth("🇺🇸"); // 2  (regional indicator pair)
Bun.stringWidth("\x1b]8;;https://bun.sh\x07Bun\x1b]8;;\x07"); // 3 (terminal hyperlink)
```

It strips every kind of ANSI escape code (color, cursor movement, terminal hyperlinks). It also strips zero-width codepoints such as soft hyphen and combining marks. Emoji measure 2 columns each. That includes flag pairs, skin-tone modifiers, keycaps, and multi-part emoji like 👨👩👧. `util.inspect`, `console.table`, and `readline` use the same implementation. [#25447](https://github.com/oven-sh/bun/pull/25447)

Bun.stringWidth · terminal columns

example 1 of 5 · ascii

Bun.stringWidth("hello")// 5

123456

hello

hello

codepoints

codepoints:**5** ·bytes:**5** ·columns:**5**

the easy case — one byte, one codepoint, one column each

One string, four sizes. `stringWidth` returns the last one — what a terminal actually draws. Same engine backs `Bun.sliceAnsi`, `Bun.wrapAnsi`, `console.table`, and `readline`. [#25447](https://github.com/oven-sh/bun/pull/25447)

`Bun.stringWidth()` is 7–56× faster on Chinese, Japanese, and Korean text.

![Bun.stringWidth() is 7-56x faster on Chinese, Japanese, and Korean characters](https://bun.com/images/blog/bun-1.4/tweets/stringwidth-cjk.jpg)

Bun.stringWidth() 处理中文、日文、韩文字符的速度提升了 7~56 倍 Bun.stringWidth() が中国語・日本語・韓国語の文字で 7〜56 倍高速化されました Bun.stringWidth()가 중국어·일본어·한국어 문자에서 7~56배 빨라졌습니다

#### Bun.spawn({ cgroup }) v1.4.0

On Linux, [`Bun.spawn()`](https://bun.com/docs/runtime/child-process#resource-limits-with-cgroups-linux) and `Bun.spawnSync()` accept a `cgroup` option. It takes the path of an existing cgroup directory, or an open file descriptor for one. The child is placed in the cgroup before it starts running. So limits such as `memory.max` and `pids.max` apply from its first instruction, and anything it forks stays inside. If the child exceeds its memory limit, the kernel kills it. The parent is unaffected. Bun only joins the cgroup. Create and configure it first (`node:fs` is enough), and remove it when you are done.

```
import { mkdirSync, writeFileSync } from "node:fs";

const dir = "/sys/fs/cgroup/build-jobs";
mkdirSync(dir, { recursive: true });
writeFileSync(\`${dir}/memory.max\`, String(2 * 1024 ** 3));

const proc = Bun.spawn({ cmd: ["make", "-j8"], cgroup: dir });
```

On cgroup v2 the child is created inside the cgroup with `clone3(CLONE_INTO_CGROUP)`. Where that is unavailable, Bun writes the child into `cgroup.procs` before `exec`. A missing directory fails the spawn with the errno and the path. A frozen cgroup is refused with `EBUSY`. Otherwise the child would freeze before `exec` and take the calling thread with it. `node:child_process` forwards the option. Other platforms ignore it. [#37466](https://github.com/oven-sh/bun/pull/37466)

#### Async stack traces from native I/O v1.3.12

Errors thrown from async native APIs like `fs.promises`, `Bun.file()`, `Bun.S3Client`, DNS, crypto, and `fetch` now include async stack traces that point back to the `await` in your code. Previously these errors had empty stacks. There was no JavaScript on the call stack when the error was created in native code, so they were effectively impossible to trace. [#28652](https://github.com/oven-sh/bun/pull/28652)

```
ENOENT: no such file or directory, open 'foo.txt'
      at async foo (/path/to/app.js:5:8)
```

The stack is only captured when an error is constructed for rejection, so successful awaits are unaffected.

#### \--cpu-prof v1.3.2

Bun now ships a built-in CPU profiler. Pass `--cpu-prof` to generate a `.cpuprofile` in the Chrome CPU Profiler format. It opens directly in Chrome DevTools or VS Code. `--cpu-prof-md` writes the same profile as a Markdown report: a summary table, top-10 hot functions, self-time and total-time tables, and a call tree. That is useful for pasting into a bug report or feeding to an LLM. `--cpu-prof-name`, `--cpu-prof-dir`, and `--cpu-prof-interval` customize the output path and sampling interval. [#24112](https://github.com/oven-sh/bun/pull/24112) [#26327](https://github.com/oven-sh/bun/pull/26327) [#26620](https://github.com/oven-sh/bun/pull/26620)

```
bun --cpu-prof ./app.ts
```

```
# Writes CPU.20260615.120000.12345.0.001.cpuprofile
```

```
bun --cpu-prof-md ./app.ts
```

![Chrome DevTools Performance panel showing a bun --cpu-prof profile with the Call tree expanded: render > escapeHtml at 42.3% self time, tokenize at 14.9%.](https://bun.com/images/blog/bun-1.4/cpu-prof-devtools.png)

A \`bun --cpu-prof\` profile opened in Chrome DevTools.

The CPU profiler can be enabled with `BUN_CPU_PROFILE=1` (plus optional `BUN_CPU_PROFILE_DIR` / `BUN_CPU_PROFILE_NAME`) for processes you can't easily pass `--cpu-prof` to. [#26313](https://github.com/oven-sh/bun/pull/26313)

#### \--heap-prof v1.3.7

`--heap-prof` generates a V8-compatible `.heapsnapshot` that opens directly in Chrome DevTools, and `--heap-prof-md` emits a grep-friendly Markdown report with total heap size, top types by retained size, and the largest individual objects. `--heap-prof-name` and `--heap-prof-dir` control where the output lands.

```
# V8-compatible heap snapshot (opens in Chrome DevTools)
```

```
bun --heap-prof script.js
```

```
# Markdown heap profile for CLI analysis
```

```
bun --heap-prof-md script.js
```

#### \--no-env-file v1.3.3

A new `--no-env-file` flag (and `env = false` in [`bunfig.toml`](https://bun.com/docs/runtime/bunfig)) disables Bun's automatic [`.env` loading](https://bun.com/docs/runtime/environment-variables#disabling-automatic-env-loading). This is useful in production and CI. There, environment variables are managed externally and stray `.env` files should be ignored. Explicit `--env-file` arguments are still honored. [#24767](https://github.com/oven-sh/bun/pull/24767)

```
bun --no-env-file server.ts
```

```
# bunfig.toml
env = false
```

#### \--no-orphans v1.3.14v1.4.0

A new `--no-orphans` flag (and [`[run] noOrphans = true`](https://bun.com/docs/runtime/bunfig#run-noorphans---dont-leave-orphan-processes-behind) in bunfig, or `BUN_FEATURE_FLAG_NO_ORPHANS=1`) makes Bun exit when its original parent process dies. It also recursively SIGKILLs all descendants on clean exit. So when your terminal dies, your dev servers die with it. It works on Linux and macOS with no extra thread or file descriptor. On Windows it uses a recursive kill-on-close Job Object plus a parent-process wait ([#34768](https://github.com/oven-sh/bun/pull/34768)). It applies to `bun run <script>`, `bunx`, and `--filter`. [#29930](https://github.com/oven-sh/bun/pull/29930)

```
bun --no-orphans run dev
```

![bun --no-orphans terminating lingering child processes on exit](https://bun.com/images/blog/bun-1.4/tweets/no-orphans.jpg)

\`bun --no-orphans \` recursively terminates lingering processes on exit

#### Bun.Transpiler REPL mode v1.3.7

A new `replMode` option transforms code for interactive REPL evaluation: it captures the last expression's value, hoists declarations so they persist across lines, converts `const` to `let` for re-declaration, and auto-detects bare object literals. Pair it with `vm.runInContext` to build a Node.js-compatible REPL on Bun's transpiler. [#26246](https://github.com/oven-sh/bun/pull/26246)

#### Bun.YAML passes 402/402 of yaml-test-suite v1.4.0

`Bun.YAML` now passes 402/402 yaml-test-suite. This fixes spec-compliance bugs in:

- explicit `?` keys
- tab indentation
- `{}` -style mappings
- `&` anchors on empty values
- `---` /`...` appearing mid-line
- the indent and newline-trim modifiers on `|` / `>` strings

`YAML.stringify()` also now correctly quotes number-like strings (`"0e6836"`, `"0123"`), strings ending in `:`, and strings starting with `[`/ `{`. Cyclic anchors and aliases are supported in `parse()`. [#31527](https://github.com/oven-sh/bun/pull/31527) [#37055](https://github.com/oven-sh/bun/pull/37055)

![Bun.YAML.parse supports cyclic anchors and aliases](https://bun.com/images/blog/bun-1.4/tweets/yaml-cyclic-anchors.jpg)

\`Bun.YAML.parse\` supports cyclic anchors & aliases

#### WebSocket proxies and Unix sockets v1.3.6v1.4.0

The `WebSocket` client now supports connecting through HTTP and HTTPS proxies via a new `proxy` option. It supports `ws://` and `wss://` over both HTTP and HTTPS proxies, Basic auth via URL credentials, custom proxy headers, and full TLS configuration for the target connection. It also supports Unix domain sockets via `ws+unix://` and `wss+unix://` URL schemes. These use the same syntax as the npm ws package. [#25614](https://github.com/oven-sh/bun/pull/25614) [#29203](https://github.com/oven-sh/bun/pull/29203)

```
new WebSocket("wss://example.com", { proxy: "http://user:pass@proxy:8080" });

new WebSocket("ws+unix:///tmp/app.sock:/api/stream?x=1");
```

#### WebSocket URL credentials v1.3.7v1.4.0

`new WebSocket("ws://user:pass@host")` now forwards URL-embedded credentials as a Basic `Authorization` header. An explicitly provided `Authorization` header still takes precedence. [#26278](https://github.com/oven-sh/bun/pull/26278)

#### SHA-3 and X25519 in Web Crypto v1.3.13

SHA-3 lands in both Web Crypto and `node:crypto`. `crypto.subtle.digest()` and HMAC `sign` / `verify` now accept `SHA3-256` / `SHA3-384` / `SHA3-512`. `createHash` / `createHmac` add `sha3-224/256/384/512`. `crypto.subtle.deriveBits` now supports X25519 as well, for deriving a shared secret between two key pairs. Small-order peer public keys are rejected, as RFC 7748 requires. [#29323](https://github.com/oven-sh/bun/pull/29323) [#29152](https://github.com/oven-sh/bun/pull/29152)

```
await crypto.subtle.digest("SHA3-256", new TextEncoder().encode("hello"));

const bits = await crypto.subtle.deriveBits(
  { name: "X25519", public: bobPublicKey },
  alicePrivateKey,
  256,
);
```

#### structuredClone preserves object identity v1.4.0

`structuredClone` preserves object identity for `Date`, `RegExp`, `Error` subclasses, `DOMException`, `CryptoKey`, `KeyObject`, `X509Certificate`, `Blob`, and `File`: the same instance referenced twice comes back as one object. [#32796](https://github.com/oven-sh/bun/pull/32796)

#### Bun.CSRF sessionId v1.4.0

`Bun.CSRF.generate()` and `Bun.CSRF.verify()` accept a new `sessionId` option that binds a token to a specific principal via HMAC associated data. Tokens generated for one session won't verify under another, and verification fails closed if `sessionId` is supplied on only one side; tokens without `sessionId` are unchanged. [#31215](https://github.com/oven-sh/bun/pull/31215)

#### Bun.udpSocket() connection-refused errors and truncation flags v1.3.12

On Linux, sending to a dead port now fires the `error` handler with `ECONNREFUSED` instead of silently timing out. The `data` callback also gains a fifth `flags` argument with `{ truncated: boolean }` to detect when a datagram exceeded the receive buffer. [#28827](https://github.com/oven-sh/bun/pull/28827)

#### Grapheme clusters for Indic scripts v1.3.7

We rewrote grapheme cluster segmentation with Indic Conjunct Break support. Devanagari and other Indic conjuncts now segment as single clusters. [#26376](https://github.com/oven-sh/bun/pull/26376)

#### Bun.S3Client v1.3.1v1.4.0

`Bun.S3Client` now supports AWS Requester Pays buckets. Pass `requestPayer: true` on the client or per-operation to send the `x-amz-request-payer` header on every request, including each part of a multipart upload. [#25514](https://github.com/oven-sh/bun/pull/25514)

```
const s3 = new Bun.S3Client({
  bucket: "hl-mainnet-evm-blocks",
  requestPayer: true,
});
const data = await s3.file("0/0/1.rmp.lz4").arrayBuffer();
```

Other S3 fixes:

- `write()` and `writer()` now accept `contentDisposition` and `contentEncoding`.
- `presign()` honors `contentDisposition` and `type`.
- `slice(0, N).stream()` sends the correct `Range` header.
- `queueSize` is respected instead of being silently overridden to 255.
- A memory leak in `list()` has been fixed.

[#25363](https://github.com/oven-sh/bun/pull/25363) [#26149](https://github.com/oven-sh/bun/pull/26149) [#25999](https://github.com/oven-sh/bun/pull/25999) [#27273](https://github.com/oven-sh/bun/pull/27273) [#29813](https://github.com/oven-sh/bun/pull/29813) [#23880](https://github.com/oven-sh/bun/pull/23880)

#### Bun.sql is more reliable v1.3.11v1.4.0

```
const sql = new Bun.SQL({ prepare: false });
await sql\`SELECT 1\`; // now safe behind PgBouncer transaction pooling
```

- **PgBouncer transaction pooling**: with `prepare: false`, Bun now sends each query in a single round-trip instead of two, so PgBouncer can no longer split it across Postgres connections and return the wrong query's results. [#27952](https://github.com/oven-sh/bun/pull/27952)
- **Docker startup windows**: when a pooled connection is accepted then closed before the handshake completes (as happens with Docker while a containerized database is still starting), Bun now retries with exponential backoff until `connectionTimeout` elapses instead of failing every waiting query. [#32028](https://github.com/oven-sh/bun/pull/32028)

#### Named parameters in Bun.sql for SQLite v1.4.0

`sql.unsafe()` and `sql.file()` accept an object of named parameters for `:name`, `$name`, and `@name` placeholders. Previously an object bound nothing, so a `SELECT` returned no rows and no error. Keys keep their prefix (`{ ":id": 1 }`) unless the connection sets `strict: true`. [#37109](https://github.com/oven-sh/bun/pull/37109)

#### SQLite 3.53.0 v1.3.14

`bun:sqlite` 's bundled SQLite is upgraded to **3.53.0**; `db.close(true)` no longer throws "database is locked" after `db.transaction()`; non-UTF-8 `TEXT` values under 64 bytes decode leniently to U+FFFD instead of returning `""`. [#27912](https://github.com/oven-sh/bun/pull/27912)

#### Bun.isStandaloneExecutable v1.4.0

`Bun.isStandaloneExecutable` is a new read-only boolean, `true` inside a `bun build --compile` binary; unlike checking `Bun.embeddedFiles.length > 0`, reading it allocates nothing. [#32583](https://github.com/oven-sh/bun/pull/32583)

#### bun init --react=tanstack v1.3.4

`bun init --react=tanstack` is a new template that scaffolds a TanStack Start project with file-based routing, Vite, and Tailwind, running on Bun. [#24648](https://github.com/oven-sh/bun/pull/24648)

### fetch()

#### fetch() response backpressure v1.4.0

`fetch()` now applies backpressure when streaming a response body. Once a chunk is delivered to JavaScript and nothing has consumed it, the HTTP thread pauses reading from the socket instead of buffering the entire body in memory. Buffered consumers like `.text()`, `.json()`, and `.arrayBuffer()` opt out and still receive the body in one shot. [#29831](https://github.com/oven-sh/bun/pull/29831)

```
const res = await fetch("https://example.com/large.bin");
for await (const chunk of res.body) {
  // The HTTP thread pauses reading while this loop is busy,
  // instead of buffering the whole file in memory.
  await process(chunk);
}
```

#### HTTPS proxies reuse CONNECT tunnels v1.3.12v1.4.0

`fetch()` through an HTTPS proxy now [reuses CONNECT tunnels](https://github.com/oven-sh/bun/pull/28611). The tunneled TLS session is pooled across sequential requests to the same target. Before, every request paid a fresh CONNECT + TLS handshake. The tunnel is also reused when the request passes `tls` options such as `ca`, `cert`, or `key`. Previously every such request opened a new connection to the proxy and redid the `CONNECT` and both TLS handshakes. [#37715](https://github.com/oven-sh/bun/pull/37715)

#### Custom TLS options reuse keep-alive connections v1.3.10

`fetch()` with custom TLS options now [reuses keepalive connections](https://github.com/oven-sh/bun/pull/27385). Identical SSL configs (client certificates, custom CA, mTLS) are interned with reference counting for O(1) pointer-equality matching, with an LRU-bounded context cache.

#### Header name casing is preserved on the wire v1.3.7

`fetch()` preserves header name casing on the wire instead of lowercasing it. Headers are case-insensitive per RFC 7230, but plenty of real-world servers reject `content-type` while accepting `Content-Type`. [#26425](https://github.com/oven-sh/bun/pull/26425)

#### HTTP\_PROXY is re-read at runtime v1.3.12

`process.env.HTTP_PROXY` / `HTTPS_PROXY` / `NO_PROXY` set at runtime now take effect on the next `fetch()` call instead of only being read once at startup. [#28614](https://github.com/oven-sh/bun/pull/28614)

### Test runner

#### onTestFinished() v1.3.2

`bun:test` exports `onTestFinished()`, a Vitest-compatible hook that registers a callback to run after the current test completes, after all `afterEach` hooks. It can only be called inside a test body, so you can clean up resources that were created during the test. [#24038](https://github.com/oven-sh/bun/pull/24038)

```
import { test, onTestFinished } from "bun:test";

test("uses a temp resource", () => {
  const handle = open();
  onTestFinished(() => handle.close());
  // ...
});
```

#### bun test --only-failures v1.3.1

`bun test --only-failures` suppresses output for passing and skipped tests, printing only failures and the final summary. [#23312](https://github.com/oven-sh/bun/pull/23312)

```
bun test --only-failures
```

```
test/example.test.ts:
(fail) failing test
error: expect(received).toBe(expected)

Expected: 3
Received: 2

5 pass
1 skip
1 fail
Ran 7 tests across 1 file.
```

#### bun test --path-ignore-patterns v1.3.11

`bun test --path-ignore-patterns` (and `test.pathIgnorePatterns` in bunfig.toml) excludes test files by glob, so you can skip integration tests, generated fixtures, or whole directories without renaming files. [#28089](https://github.com/oven-sh/bun/pull/28089)

#### bun test --pass-with-no-tests v1.3.1

`bun test --pass-with-no-tests` exits with code 0 when no tests match, matching Jest and Vitest. Useful in monorepos where a shared pattern runs across packages that may not all contain tests. [#23424](https://github.com/oven-sh/bun/pull/23424)

#### bun test --grep v1.3.6

`bun test` now accepts `--grep` as an alias for `-t` / `--test-name-pattern`, matching Mocha and Jest. [#25788](https://github.com/oven-sh/bun/pull/25788)

#### using spy = spyOn(...) v1.3.9

`spyOn()` and `mock()` now implement `Symbol.dispose`, so `using spy = spyOn(obj, "method")` automatically restores the original implementation when the spy goes out of scope. No manual `mockRestore()` or `afterEach` cleanup needed. [#26692](https://github.com/oven-sh/bun/pull/26692)

#### The vi global v1.3.1v1.4.0

The `vi` global (Vitest compatibility alias) is now defined in `bun test`, so files that call `vi.fn()` or `vi.mock()` without importing run unmodified. [#23674](https://github.com/oven-sh/bun/pull/23674)

#### Timeouts on beforeAll / afterAll hooks v1.3.2v1.4.0

`beforeAll`, `beforeEach`, `afterAll`, and `afterEach` now accept a numeric timeout or `{ timeout }` options object as the second argument instead of throwing. [#24039](https://github.com/oven-sh/bun/pull/24039)

### Bundler

#### Execute-only standalone binaries on Linux v1.3.12

Standalone executables on Linux now embed the module graph in a segment the OS loads into memory with the rest of the binary. Before, they opened and read their own executable file at startup. `bun build --compile` binaries start with **zero file I/O** and run with execute-only permissions (`chmod 111`). This matches the existing behavior on macOS and Windows. [#26923](https://github.com/oven-sh/bun/pull/26923)

```
bun build --compile ./app.ts --outfile=app
```

```
chmod 111 ./app
```

```
./app   # works, no read permission needed
```

#### useDefineForClassFields and "jsx": "react-jsx" in tsconfig.json v1.4.0

`useDefineForClassFields: false` is honored. Instance field initializers move into the constructor after parameter-property assignments, as tsc does. And `"jsx": "react-jsx"` selects the production automatic runtime (`jsx` / `jsxs` from `<pkg>/jsx-runtime`). `"react-jsxdev"` selects `jsxDEV`. [#36664](https://github.com/oven-sh/bun/pull/36664) [#34422](https://github.com/oven-sh/bun/pull/34422)

#### Native using and await using for --target=bun v1.3.14v1.4.0

`using` and `await using` declarations are no longer lowered to helper functions when targeting Bun. JavaScriptCore supports explicit resource management natively, so the runtime transpiler, `bun build --target=bun`, and the REPL now emit them as-is. Browser and Node targets continue to lower as before. [#29538](https://github.com/oven-sh/bun/pull/29538)

```
var __using = (stack, value, async) => { /* ... */ };
var __callDispose = (stack, error, hasError) => { /* ... */ };
let __stack = [];
try {
  const x = __using(__stack, { [Symbol.dispose]() {} }, 0);
  console.log("hi");
} catch (_) { var _err = _, _hasErr = 1; }
finally { __callDispose(__stack, _err, _hasErr); }
using x = { [Symbol.dispose]() {} };
console.log("hi");
```

#### emitDecoratorMetadata implies legacy decorators v1.3.11

Setting `emitDecoratorMetadata: true` in `tsconfig.json` now implies legacy decorator semantics even when `experimentalDecorators` is omitted, fixing NestJS, TypeORM, and Angular projects that crashed with `descriptor.value is undefined`.

#### \--compile-executable-path v1.3.6

`bun build --compile` gains `--compile-executable-path` to point at a local Bun binary instead of downloading one when cross-compiling, and using an already-compiled standalone executable as that base no longer panics or produces a corrupt Mach-O binary.

#### reactFastRefresh and allowUnresolved in Bun.build() v1.3.6

`Bun.build()` gains `reactFastRefresh: true` (works on all targets). It also gains `allowUnresolved: string[]`, which controls which dynamic-import glob shapes are permitted at bundle time. Other fixes:

- `define` values starting with `*`, `?`, `(`, or `)` are now correctly auto-quoted.
- Calling `Bun.build()` from inside a macro throws a clear deadlock error instead of hanging.
- Repeated in-process builds no longer panic after ~2000 iterations.

#### browser field remaps for Node builtins v1.4.0

`--target=browser` now applies package.json `"browser"` remaps to Node builtins before falling back to Bun's polyfills. It also applies them to `main` /index resolutions written without an extension. `jszip` bundles at 149 KB instead of 459 KB. The legacy `jsnext:main` field gets the same `module` → `main` fallback. [#36597](https://github.com/oven-sh/bun/pull/36597) [#36620](https://github.com/oven-sh/bun/pull/36620) [#35447](https://github.com/oven-sh/bun/pull/35447)

#### Code splitting on 20,000-module graphs is 14× faster v1.4.0

The code-splitting reachability walk is now BFS and O(V+E), taking a 20,000-module diamond-shaped DAG from 4.65 s to 320 ms. Separately, the tree-shaking liveness, TLA validation, CSS-order, and part-visitor passes moved from recursion to explicit stacks, so linear import chains of thousands of modules no longer stack-overflow.

### Node.js compatibility

#### node:http v1.3.4v1.4.0

The [`node:http`](https://nodejs.org/api/http.html) client has been [rewritten as a direct port of Node's `_http_client.js`](https://github.com/oven-sh/bun/pull/31587). It replaces the previous `fetch()` -based shim. `http.ClientRequest` now runs on `net` / `tls` sockets, Node's own HTTP parser, and an `Agent` socket pool. So keep-alive reuse, `Upgrade` / `CONNECT`, 1xx `'information'` events, and `createConnection` all behave exactly as they do in Node.

```
import http from "node:http";

const agent = new http.Agent({ keepAlive: true, maxSockets: 4 });

const req = http.request({ host: "example.com", agent }, (res) => {
  res.on("data", (chunk) => process.stdout.write(chunk));
});
req.on("information", (info) => console.log("1xx:", info.statusCode));
req.end();
```

Keep-alive agents reuse sockets exactly as in Node: subsequent requests through an `http.Agent` with `keepAlive: true` are **65.9% faster**, with **190% higher** overall throughput. [#24351](https://github.com/oven-sh/bun/pull/24351)

On the server, `headersTimeout`, `requestTimeout`, and `keepAliveTimeout` fire with Node's `connectionsCheckingInterval` sweep and raw `408` reply. Also:

- HTTP/1.1 pipelining is supported with `maxRequestsPerSocket`.
- `closeIdleConnections()` and `closeAllConnections()` count correctly.
- Connection sockets are real `net.Socket` instances with Node's `'connection'` / `'clientError'` / `'close'` lifecycle.
- Per-server `insecureHTTPParser` and `maxHeaderSize` are honored.

```
import http from "node:http";

const server = http.createServer((req, res) => res.end("ok"));
server.headersTimeout = 10_000; // 408 if headers not complete in 10s
server.requestTimeout = 30_000; // 408 if request not complete in 30s
server.keepAliveTimeout = 5_000; // close idle keep-alive sockets after 5s
server.listen(3000);
```

#### node:http2 v1.4.0

[`node:http2`](https://nodejs.org/api/http2.html) has a spec-compliant HTTP/2 parser. Server push works end to end via `pushStream()` and `createPushResponse()`, and Node API parity now covers raw headers, graceful connection shutdown, and `respondWithFD`. **93.2%** of Node v26.3.0's byte-identical test suite passes. [#31584](https://github.com/oven-sh/bun/pull/31584)

```
import http2 from "node:http2";

const server = http2.createSecureServer({ key, cert });
server.on("stream", (stream, headers) => {
  stream.pushStream({ ":path": "/app.css" }, (err, push) => {
    push.respondWithFile("./public/app.css", { "content-type": "text/css" });
  });
  stream.respond({ ":status": 200, "content-type": "text/html" });
  stream.end("<link rel=stylesheet href=/app.css>");
});
```

#### node:net and node:tls v1.4.0

`socket.end()` now half-closes the connection instead of full-closing it. `resetAndDestroy()`, write-after-end errors, and `ECONNRESET` shapes are now correct. `net.Socket#connect()` and `Bun.connect()` accept `localAddress` and `localPort`. These bind outgoing sockets to a specific local interface. TLS gains:

- `'session'` and `'keylog'` events
- structured OpenSSL errors (`err.code` / `err.library` / `err.reason`)
- `SNICallback` / `ALPNCallback`
- PFX support

[#31155](https://github.com/oven-sh/bun/pull/31155)

```
import tls from "node:tls";
import { appendFileSync } from "node:fs";

const socket = tls.connect(443, "example.com", { servername: "example.com" });
socket.on("keylog", (line) => appendFileSync("keys.log", line)); // for Wireshark decryption
socket.on("session", (session) => {
  // Session ticket for TLS resumption
});
```

#### node:worker\_threads v1.4.0

A worker with an unsettled top-level `await` exits with code 13. `process.abort()` inside a worker ends only that worker. [`node:worker_threads`](https://nodejs.org/api/worker_threads.html) gains:

- `postMessageToThread()` and the `'workerMessage'` event
- `markAsUntransferable` / `markAsUncloneable`
- `env: SHARE_ENV`
- captured stdio (`{ stdout: true }`)
- worker introspection (`getHeapStatistics()`, `cpuUsage()`, `startCpuProfile()`)

`MessagePort` 's `close()` callback timing, `'close'` event delivery to both ends of a channel, and `DataCloneError` transfer-list messages now pass Node's own suite. That suite is at **73.9%** overall, up from ~37% in Bun 1.3.

```
import { Worker, SHARE_ENV } from "node:worker_threads";

const w = new Worker("./worker.js", {
  env: SHARE_ENV, // live, write-through process.env
  stdout: true, // captured stdio
});
w.stdout.pipe(process.stdout);

const stats = await w.getHeapStatistics();
```

#### node:fs v1.4.0

`fs.cp` and `cpSync` get Node's full `ERR_FS_CP_*` error semantics, `fs.watch` gains the `ignore` option, and `fs.promises.watch` gains `AbortSignal` support. [`node:fs`](https://nodejs.org/api/fs.html) now passes **97.5%** of Node v26.3.0's fs tests (**99.1%** excluding tests that require `--expose-internals`).

```
import { watch } from "node:fs/promises";

const ac = new AbortController();
for await (const { eventType, filename } of watch("./src", {
  recursive: true,
  ignore: (path) => path.includes("node_modules"),
  signal: ac.signal,
})) {
  console.log(eventType, filename);
}
```

#### node:stream v1.4.0

The experimental `stream/iter` and `zlib/iter` APIs land behind `--experimental-stream-iter`, `readable.read()` returns one buffered chunk at a time (Node 26's semver-major change), and `pipeline()` reports the real failure ahead of any internal `AbortError`. [`node:stream`](https://nodejs.org/api/stream.html) passes **96.9%** of Node v26.3.0's stream tests.

```
// bun --experimental-stream-iter app.js
import { map, filter } from "node:stream/iter";
import { createReadStream } from "node:fs";

const lines = createReadStream("access.log", "utf8");
for await (const hit of filter(
  map(lines, (l) => l.trim()),
  (l) => l.includes("POST"),
)) {
  console.log(hit);
}
```

#### process v1.4.0

Setting `process.env.TZ` now updates existing `Date` instances. `process.env` now behaves like Node's: assigned values are coerced to strings, and `structuredClone(process.env)` works. `--no-warnings`, `--trace-warnings`, `--trace-deprecation`, `--redirect-warnings`, and `--disable-warning` are all wired up. [`process`](https://nodejs.org/api/process.html) jumps from 60.5% to **84.2%** on Node v26.3.0's tests. [#31831](https://github.com/oven-sh/bun/pull/31831)

```
const now = new Date();
process.env.TZ = "America/Los_Angeles";
console.log(now.toString()); // existing Date reflects the new timezone

process.env.PORT = 3000;
console.log(process.env.PORT); // "3000" (coerced to string)
```

#### AsyncLocalStorage v1.4.0

[`AsyncLocalStorage`](https://nodejs.org/api/async_context.html) gains the Node 26 `defaultValue` / `name` constructor options and `AsyncLocalStorage.prototype.withScope()`. `AsyncResource.bind()` now preserves the original function's `.length` and `this`. Coverage of Node's `async_hooks` tests [doubles to **50%**](https://github.com/oven-sh/bun/tree/main/test/js/node/test/parallel). [#31825](https://github.com/oven-sh/bun/pull/31825)

```
import { AsyncLocalStorage } from "node:async_hooks";

const requestId = new AsyncLocalStorage({
  name: "requestId",
  defaultValue: "-",
});

{
  using scope = requestId.withScope(crypto.randomUUID());
  console.log(requestId.getStore()); // the UUID
}
console.log(requestId.getStore()); // "-"
```

#### node:vm v1.4.0

Top-level `await` in a `SourceTextModule` resumes after the `await`, and [`node:vm`](https://nodejs.org/api/vm.html) adds the v26 module-linking API (`linkRequests()`, `instantiate()`, `moduleRequests`, `hasTopLevelAwait()`) and implements `microtaskMode: 'afterEvaluate'`, taking Node v26.3.0's vm suite from 72% to **97%**. [#32018](https://github.com/oven-sh/bun/pull/32018)

```
import vm from "node:vm";

const ctx = vm.createContext({ console }, { microtaskMode: "afterEvaluate" });
const mod = new vm.SourceTextModule(
  \`export const n = await Promise.resolve(42);\`,
  { context: ctx },
);
await mod.linkRequests(() => {});
mod.instantiate();
await mod.evaluate();
console.log(mod.namespace.n); // 42
```

#### node:cluster v1.4.0

[`node:cluster`](https://nodejs.org/api/cluster.html) shares sockets between workers. Bun 1.4 implements round-robin scheduling (the primary accepts connections and hands the file descriptors to workers over IPC), `SCHED_NONE` shared handles, UDP clustering, and `worker.send(msg, socket)` handle passing. [#31829](https://github.com/oven-sh/bun/pull/31829)

```
import cluster from "node:cluster";
import http from "node:http";
import { availableParallelism } from "node:os";

if (cluster.isPrimary) {
  for (let i = 0; i < availableParallelism(); i++) cluster.fork();
} else {
  http
    .createServer((req, res) => res.end(\`hello from ${process.pid}\`))
    .listen(3000);
}
```

#### vitest --coverage v1.4.0

[`node:inspector`](https://nodejs.org/api/inspector.html) now implements the V8 `Profiler` coverage methods, so `vitest --coverage` with the default v8 provider works under Bun. Per-file statement, branch, function, and line percentages, and the uncovered-line report, match Node exactly on the same project. [#32476](https://github.com/oven-sh/bun/pull/32476)

```
bun --bun vitest run --coverage
```

```
% Coverage report from v8
-----------|---------|----------|---------|---------|-------------------
File       | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-----------|---------|----------|---------|---------|-------------------
All files  |   87.43 |    76.19 |   88.88 |   87.43 |
```

#### chrome://inspect v1.4.0

`inspector.open()`, `inspector.url()`, `inspector.close()`, and `inspector.waitForDebugger()` are implemented. Bun starts a WebSocket server that speaks the Chrome DevTools Protocol. It serves the same discovery endpoints as Node and prints Node's `Debugger listening on ws://...` line. So `chrome://inspect` and VS Code's debugger discover and attach to a running Bun process. [#32479](https://github.com/oven-sh/bun/pull/32479)

```
import inspector from "node:inspector";

inspector.open(9229, "127.0.0.1");
console.log(inspector.url()); // ws://127.0.0.1:9229/...
inspector.waitForDebugger(); // blocks until DevTools attaches
```

#### node:test v1.4.0

Subtests work. `t.test()`, `t.describe()`, and top-level `test()` / `describe()` called inside a running test now execute inline instead of throwing `NotImplementedError`. [`node:test`](https://nodejs.org/api/test.html) also gains:

- `t.plan()` and `t.waitFor()`
- `getTestContext()`
- `mock.timers` and `mock.property()`
- runtime `t.skip()` / `t.todo()`
- test tags
- custom assertions via `assert.register()`
- `(t, done) => {}` callback tests

`t.mock` is now a per-test tracker. It resets automatically when the test finishes. **20** of Node v26.3.0's `test_runner` tests now pass, up from 7. [#32631](https://github.com/oven-sh/bun/pull/32631)

```
import { test } from "node:test";

test("parent", async (t) => {
  t.plan(2);
  await t.test("a", () => {});
  await t.test("b", () => {});
});

test("timers", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout", "Date"] });
  let fired = false;
  setTimeout(() => (fired = true), 1000);
  t.mock.timers.tick(1000);
  t.assert.strictEqual(fired, true);
});
```

[`node:test`](https://nodejs.org/api/test.html) gains the programmatic `run()` API. Each file runs in its own child process. The returned `TestsStream` emits Node's event sequence (`test:enqueue` / `dequeue`, `test:pass` / `fail`, per-file and run-level `test:summary`) as both events and objectMode chunks. Node v26's `expectFailure` option lands. A throwing body is the expected outcome. A passing one fails with `failureType: 'expectedFailure'`. Two divergences reachable from plain `bun test` are also fixed. A skipped `describe` no longer runs its callback. `{ skip: true, todo: true }` is treated as a skip. Node v26.3.0's `test_runner` suite goes from 20 to **26 of 81** passing. [#34444](https://github.com/oven-sh/bun/pull/34444)

```
import { run } from "node:test";

const stream = run({ files: ["./a.test.js", "./b.test.js"] });
stream.on("test:fail", ({ name, details }) =>
  console.error(name, details.error.message),
);
```

#### node:quic v1.4.0

[`node:quic`](https://nodejs.org/api/quic.html) is now implemented. It is backed by lsquic, which Bun already vendors for HTTP/3. The full experimental Node v26 API is covered:

- `listen()` and `connect()`
- bidirectional and unidirectional streams
- HTTP/3 and raw-QUIC applications
- datagrams
- 0-RTT session resumption
- path migration
- stateless resets
- per-SNI certificates
- qlog and keylog

All **235** vendored Node v26.3.0 `node:quic` tests pass on a release build. [#32602](https://github.com/oven-sh/bun/pull/32602)

Bun-to-Bun runs at **1.31×** Node-to-Node throughput (64,591 vs 49,239 req/s, one HTTP/3 stream per request at concurrency 50, Linux x64). Node's published binaries compile QUIC out, so running the same code there requires a from-source `--experimental-quic` build.

```
import { listen } from "node:quic";

const endpoint = await listen(
  (session) => {
    session.onstream = (stream) => stream.closed.catch(() => {});
  },
  {
    sni: { "*": { keys: [key], certs: [cert] } },
    onheaders() {
      this.sendHeaders({ ":status": "200" });
      this.writer.endSync();
    },
  },
);
```

#### node:sqlite v1.3.2v1.4.0

[`node:sqlite`](https://nodejs.org/api/sqlite.html) is now implemented. It passes all 18 of Node v26.3.0's `test-sqlite-*` files (319 subtests, 0 failures, 4 skips, on Linux x64). macOS skips more, because Apple's system libsqlite3 omits some features. It is backed by the same bundled SQLite as `bun:sqlite`. Supported:

- `DatabaseSync` and `StatementSync`
- `backup()`
- sessions and changesets
- user-defined scalar, aggregate, and window functions
- the authorizer callback
- `process.versions.sqlite`

[#32498](https://github.com/oven-sh/bun/pull/32498)

```
import { DatabaseSync } from "node:sqlite";

const db = new DatabaseSync(":memory:");
db.exec(\`CREATE TABLE data(key INTEGER PRIMARY KEY, value TEXT) STRICT\`);

const insert = db.prepare("INSERT INTO data (key, value) VALUES (?, ?)");
insert.run(1, "hello");
insert.run(2, "world");

console.log(db.prepare("SELECT * FROM data ORDER BY key").all());
// [ { key: 1, value: 'hello' }, { key: 2, value: 'world' } ]
```

![node:sqlite is fully implemented and passes 100% of Node.js's test suite](https://bun.com/images/blog/bun-1.4/tweets/node-sqlite.jpg)

node:sqlite is fully implemented and passes 100% of Node.js’ test suite

- `vm.Script`, `vm.SourceTextModule`, and `vm.compileFunction` release their results to GC; a GC-root cycle between the script and its fetcher retained every call forever, so after 500 iterations and a GC, retained `Script` objects drop from +500 to +0. [#28493](https://github.com/oven-sh/bun/pull/28493)
- `fs.createReadStream().pipe(serverResponse)` completes when `ServerResponse` is used standalone without an underlying socket; `writableNeedDrain` defaulted to `true`, pausing piped streams, which broke Vite's static file serving and other connect-to-web middleware adapters. [#24137](https://github.com/oven-sh/bun/pull/24137)
- `Module._resolveFilename` forwards `options.paths` to overridden resolvers and honors custom paths when called directly, which `bun --bun next build` on Next.js 16 + React Compiler + Turbopack depends on. [#24325](https://github.com/oven-sh/bun/pull/24325)

#### node:repl v1.4.0

[`node:repl`](https://nodejs.org/api/repl.html) is now a working port of Node v26.3.0's REPL. Before, it was a stub that threw on use. It passes **75.2%** of Node's repl tests. This includes line editing and keybindings, multi-line continuation (unfinished statements get a `| ` prompt instead of a syntax error), top-level `await`, tab completion, and persistent history. A new `--interactive` flag drops you straight into it. For interactive use, prefer [`bun repl`](#bun-repl), which has Bun-specific features like syntax highlighting. `--interactive` and `node:repl` are for tools that programmatically embed Node's REPL. [#31827](https://github.com/oven-sh/bun/pull/31827)

```
bun --interactive
```

```
const res = await fetch("https://bun.sh")
```

```
res.status
```

```
200
```

#### node:trace\_events v1.4.0

[`node:trace_events`](https://nodejs.org/api/tracing.html) is now fully implemented. It passes **100%** of Node v26.3.0's trace tests. Bun supports `--trace-events-enabled`, `--trace-event-categories`, and `--trace-event-file-pattern`. It writes `node_trace.${rotation}.log` in Chrome trace format. It instruments timers, fs, and http with category-gated events that are zero-cost when tracing is off. [#31824](https://github.com/oven-sh/bun/pull/31824)

```
bun --trace-events-enabled --trace-event-categories=node.fs.async,node.http app.js
```

```
ls node_trace.*.log
```

```
node_trace.1.log
```

#### node:domain

[`node:domain`](https://nodejs.org/api/domain.html) is now a real implementation instead of a ~70-line stub. It passes **66.7%** of Node's domain tests. Domains propagate via Bun's `AsyncLocalStorage` machinery. Uncaught exceptions route into the active domain before `'uncaughtException'`. `EventEmitter` integrates with domains the same way it does in Node. [#31828](https://github.com/oven-sh/bun/pull/31828)

```
import domain from "node:domain";

const d = domain.create();
d.on("error", (err) => console.error("caught by domain:", err.message));
d.run(() => {
  setTimeout(() => {
    throw new Error("boom");
  }, 10);
});
```

#### node:buffer v1.4.0

[`node:buffer`](https://nodejs.org/api/buffer.html) now passes **92.9%** (65/70) of Node.js v26.3.0's `test-buffer*.js` suite. `Buffer.indexOf` / `lastIndexOf` / `includes` gain the `end` parameter. `Buffer.concat` / `copy` range validation matches Node. `ERR_INVALID_ARG_TYPE` / `ERR_OUT_OF_RANGE` messages are formatted identically to Node's, including grouped type lists and numeric separators for large values. [#32626](https://github.com/oven-sh/bun/pull/32626)

`Buffer.byteLength()` no longer under-counts unpaired surrogates, so it agrees with `Buffer.from(s).length`, and `lastIndexOf` with `utf16le` encoding no longer matches on odd byte offsets. [#32784](https://github.com/oven-sh/bun/pull/32784)

```
const s = "\ud800a".repeat(17);
Buffer.byteLength(s, "utf8"); // before: 51, after: 68
Buffer.from(s, "utf8").length; // 68 (now matches)
```

#### TextDecoder supports all WHATWG encodings v1.4.0

`TextDecoder` now supports every encoding in the Encoding Standard. Sixteen previously-missing single-byte encodings (`iso-8859-2`, `-5`, `-16`, `koi8-r`, `windows-1251`, and others) are added, all 228 spec labels are recognized, and EUC-JP, Big5, ISO-2022-JP, and BOM handling during streaming decode now match the spec byte-for-byte. [#32837](https://github.com/oven-sh/bun/pull/32837)

```
new TextDecoder("iso-8859-5"); // no longer throws RangeError
new TextDecoder("csisolatin5"); // label alias, also works
```

#### uid and gid for child processes v1.4.0

`Bun.spawn`, `Bun.spawnSync`, and [`node:child_process`](https://nodejs.org/api/child_process.html) now honor the `uid` and `gid` options. They change the child's user and group IDs before exec. Behavior matches Node/libuv: `setgroups` then `setgid` then `setuid` on POSIX, and `ENOTSUP` on Windows. `EPERM` is surfaced synchronously when the caller lacks permission. [#33060](https://github.com/oven-sh/bun/pull/33060)

```
import { spawnSync } from "node:child_process";

// as root:
spawnSync("id", { uid: 65534, gid: 65534 });
// child reports uid=65534 gid=65534, supplementary groups dropped
```

#### NODE\_COMPILE\_CACHE v1.4.0

[`module.enableCompileCache()`](https://nodejs.org/api/module.html#moduleenablecompilecachecachedir) and the `NODE_COMPILE_CACHE` environment variable now persist bytecode to disk between runs. `--cpu-prof` and `--heap-prof` write V8-format profiles with Node's filename convention. `--watch-kill-signal` delivers the configured signal to JS listeners before restarting. The Node 26 [`Assert` class](https://nodejs.org/api/assert.html#class-assertassert) and a native `assert.partialDeepStrictEqual` are implemented. Throws inside `fs` / `dns` / `pbkdf2` callbacks now route to `'uncaughtException'` instead of `'unhandledRejection'`. [`node:url`](https://nodejs.org/api/url.html) reaches **83.0%** on Node's test suite. `new URL(bad)` throws Node's exact `TypeError: Invalid URL` shape. [#34660](https://github.com/oven-sh/bun/pull/34660)

```
NODE_COMPILE_CACHE=~/.cache/bun bun app.js
```

#### Datadog continuous profiling works v1.4.0

`dd-trace` with `profiling: true` and [`@datadog/pprof`](https://www.npmjs.com/package/@datadog/pprof) now load and profile in Bun. `v8::CpuProfiler` is backed by JavaScriptCore's sampling profiler. The nan `ObjectWrap` template pattern (`FunctionTemplate::SetClassName`, `InstanceTemplate`, `PrototypeTemplate`, `Signature`) is implemented. So are the rest of the 89 V8 and Node symbols pprof's prebuild links against. The returned profile correctly attributes wall-clock samples to the hot function with full stack depth. [#36747](https://github.com/oven-sh/bun/pull/36747)

```
import { time } from "@datadog/pprof";

time.start({ intervalMicros: 1000 });
// ... code to profile ...
const profile = await time.stop(); // pprof-format profile
```

#### await worker.terminate() waits for the thread v1.4.0

Worker threads are joined by their parent. `await worker.terminate()` resolves with the exit code only once the thread is gone, and every worker it spawned too. Everything the worker posted before exiting is delivered before `'exit'`. A worker's "may run script" gate closes the moment its stop is requested. So no timer, socket callback, or thread-pool completion dispatches into a worker that is being stopped. Off-thread completions reach their VM through a handle that teardown closes. A late one is refused and released instead of touching freed memory.

```
import { Worker } from "node:worker_threads";

const w = new Worker("./heavy.js");
const code = await w.terminate(); // resolves 1 for a running worker
// the thread and its nested workers are gone
```

This work landed in [#38299](https://github.com/oven-sh/bun/pull/38299), [#38436](https://github.com/oven-sh/bun/pull/38436), [#38457](https://github.com/oven-sh/bun/pull/38457), and [#38660](https://github.com/oven-sh/bun/pull/38660).

The event loop stays fair under a worker that posts faster than its parent can deserialize: message drains take a bounded budget per turn, so a message flood no longer starves timers, I/O, or the worker's own pending stop.

#### Node-API version 10 v1.4.0

Bun now reports Node-API version 10, syncs the public headers from Node 26, and implements the five `NAPI_EXPERIMENTAL` `node_api_*` functions Node 26 added. [#34146](https://github.com/oven-sh/bun/pull/34146) [#36804](https://github.com/oven-sh/bun/pull/36804) [#34147](https://github.com/oven-sh/bun/pull/34147)

#### N-API finalizers run in LIFO order at exit v1.3.13

`napi_wrap` finalizers now run in LIFO order at process exit. This fixes shutdown segfaults in kuzu, duckdb, sqlite3, node-llama-cpp, and @napi-rs/canvas. Two crashes in `napi_create_external_buffer` and UTF-8 property-name handling were fixed. This unblocks napi-rs addons like `impit`. `ThreadSafeFunction` finalizer cleanup no longer crashes or hangs. `napi_delete_reference` is now callable from inside a finalizer. `napi_typeof` correctly reports wrapped callbacks and boxed primitives.

#### tls.setDefaultCACertificates() and secureContext.addCACert() v1.4.0

`node:tls` gains per-context `secureContext.addCACert()` and process-wide `tls.setDefaultCACertificates()`. [#31155](https://github.com/oven-sh/bun/pull/31155)

#### node:http2 diagnostics\_channel, AltSvc, extended CONNECT, and allowHTTP1 v1.4.0

`node:http2` gains `diagnostics_channel` instrumentation, AltSvc and Origin frames, extended CONNECT, and `allowHTTP1` fallback for the compatibility server. [#31584](https://github.com/oven-sh/bun/pull/31584)

#### fs.mkdtempDisposable() and FileHandle#pull()/#writer() v1.4.0

`fs.mkdtempDisposable()` and `FileHandle.prototype.pull()` /`.writer()` are implemented, and `fs.watch` no longer drops events when two files change in the same millisecond. [#31830](https://github.com/oven-sh/bun/pull/31830)

#### node:zlib brotli and zstd dictionaries v1.4.0

`node:zlib` supports brotli and zstd dictionaries, `reset()` is Node-compatible, async `write()` accepts growable `SharedArrayBuffer`, and `zstdCompress` accepts explicit `undefined` / `null` options. Node's zlib suite passes at **96.8%**. [#34427](https://github.com/oven-sh/bun/pull/34427) [#36555](https://github.com/oven-sh/bun/pull/36555) [#36423](https://github.com/oven-sh/bun/pull/36423)

#### node:util: styleText hex colors, getCallSites, tty.WriteStream v1.4.0

`styleText` hex colors, `getCallSites`, regexp highlighting, and `tty.WriteStream` are now implemented. `parseArgs` matches Node's property insertion order and treats `null` boolean flags as absent. `MIMEType` error messages match `ERR_INVALID_MIME_SYNTAX`. `types.isBigIntObject` / `isSymbolObject` / `isBoxedPrimitive` handle modified boxed primitives. [#34434](https://github.com/oven-sh/bun/pull/34434) [#34601](https://github.com/oven-sh/bun/pull/34601) [#33769](https://github.com/oven-sh/bun/pull/33769) [#34611](https://github.com/oven-sh/bun/pull/34611) [#34872](https://github.com/oven-sh/bun/pull/34872)

#### v8.GCProfiler v1.4.0

`node:v8` adds `v8.GCProfiler` (backed by JavaScriptCore's `HeapObserver`) and `v8.isStringOneByteRepresentation()`.

#### ws-compatible 'upgrade' and 'unexpected-response' events v1.4.0

Bun's `WebSocket` client emits `'upgrade'` and `'unexpected-response'` events, matching the ws package. [#36272](https://github.com/oven-sh/bun/pull/36272)

#### dns.promises.getDefaultResultOrder() and getServers() v1.3.12

`node:dns/promises` now exports `getDefaultResultOrder()` and `getServers()`, fixing Vite 8 builds. [#28949](https://github.com/oven-sh/bun/pull/28949)

#### SIGWINCH on Windows v1.3.3

On Windows, `SIGWINCH` now fires on terminal resize (unblocking TUI libraries like opentui and opencode), and `SIGHUP` / `SIGBREAK` fire on console close and Ctrl+Break. [#24704](https://github.com/oven-sh/bun/pull/24704)

#### \--use-system-ca reads Node's Windows certificate stores v1.3.14

`--use-system-ca` on Windows now reads the same certificate stores Node.js does (`ROOT`, `CA`, and `TrustedPeople` across local-machine, current-user, group-policy, and enterprise locations), fixing intranet servers that omit their intermediate chain. [#30408](https://github.com/oven-sh/bun/pull/30408)

### Package manager

#### Lockfile migration v1.4.0

`bun install` 's npm `package-lock.json` migrator now supports lockfileVersion 1 through 4, including bundled and nested dependencies, `optionalPeers`, and `overrides`.

Migrating `pnpm-lock.yaml` v9 lockfiles now supports `patchedDependencies`, snapshot aliases, catalogs, git `path:`, multi-document files, `runtime:` entries, and named registries.

A project's `bunfig.toml` now takes precedence over any `.npmrc` for the same key; `.npmrc` -only settings such as `//host/:_authToken` still attach to registries declared in `bunfig.toml`.

#### bun.lock versioning v1.3.2

`bun.lock` now records a `configVersion` alongside the existing `lockfileVersion`. So future Bun releases can change install defaults for new projects without affecting existing ones. New lockfiles get `configVersion: 1` and default to the isolated linker. Existing lockfiles without the field are treated as `configVersion: 0` and keep the hoisted default. [#24236](https://github.com/oven-sh/bun/pull/24236)

```
{
  "lockfileVersion": 2,
  "configVersion": 1,
  "workspaces": {
```

#### publicHoistPattern and hoistPattern v1.3.1

The isolated linker now reads `publicHoistPattern` and `hoistPattern` from `bunfig.toml` and `.npmrc`. `publicHoistPattern` hoists matching transitive packages (like `@types*` or `*eslint*`) to the root `node_modules` so every workspace can resolve them; `hoistPattern` controls what's hoisted into `node_modules/.bun/node_modules`. [#23567](https://github.com/oven-sh/bun/pull/23567)

```
[install]
publicHoistPattern = ["@types*", "*eslint*"]
hoistPattern = ["*"]
```

#### install.hoist = false v1.4.0

`install.hoist = false` in `bunfig.toml` (or `hoist=false` in `.npmrc`) disables the isolated linker's hidden `node_modules/.bun/node_modules` fallback directory, so packages that `require()` an undeclared dependency fail with `MODULE_NOT_FOUND` instead of resolving through the fallback, matching pnpm's `hoist` setting. [#36972](https://github.com/oven-sh/bun/pull/36972)

#### bun update --recursive and --filter update every selected workspace v1.4.0

`bun update --recursive` and `bun update --filter <pattern>` now update the dependencies of every workspace they select and write each workspace's `package.json`. `--filter` can be repeated, and `--filter '!name'` excludes a workspace. `bun outdated` accepts the same repeated `--filter`. Previously two filters selected nothing. A dependency declared as `catalog:` is left as written. [#36360](https://github.com/oven-sh/bun/pull/36360)

```
bun update --recursive --latest
bun update --filter 'pkg-*' --filter '!pkg-c'
```

#### bun update \<name> updates every copy v1.4.0

`bun update <name>` now re-resolves every copy of `<name>` in the lockfile, including the copies other workspaces and your transitive dependencies depend on. [#36360](https://github.com/oven-sh/bun/pull/36360)

#### Happy Eyeballs for registry connections v1.4.0

`bun install` now correctly interleaves IPv6 and IPv4 addresses per RFC 8305 when connecting to the registry, so a blackholed IPv6 route (Starlink, some corporate networks, misconfigured Docker bridges) costs nothing per manifest fetch. [#36295](https://github.com/oven-sh/bun/pull/36295)

#### Streaming tarball extraction v1.3.13

`bun install` now decompresses and extracts packages while they download, with incremental integrity hashing computed on the fly. [#29404](https://github.com/oven-sh/bun/pull/29404)

#### Peer dependency resolution is up to 8x faster v1.3.13

`bun install --linker=isolated` is **up to 8x faster** on monorepos with heavy peer dependency graphs. The first resolution pass now deduplicates subtrees with the same resolved peer dependencies. Before, it expanded every position in the dependency tree. On one reported monorepo this cut the first-pass node count from millions to ~75K. The `.bun/` store layout is byte-identical. [#29342](https://github.com/oven-sh/bun/pull/29342)

#### bun list v1.3.2

`bun list` is now a shorthand for `bun pm ls`, printing your dependency tree without the extra `pm` subcommand. [#24159](https://github.com/oven-sh/bun/pull/24159)

#### bun publish sends your README v1.3.14

`bun publish` now sends `readme` and `readmeFilename` to the registry, so packages published with Bun show their README on npmjs.com. [#30257](https://github.com/oven-sh/bun/pull/30257)

#### Per-path.npmrc auth tokens v1.3.11v1.4.0

`.npmrc` auth tokens are now matched by host *and* path, so multiple registries on the same host (Azure Artifacts, JFrog) each get their own token instead of last-one-wins. [#26351](https://github.com/oven-sh/bun/pull/26351)

#### bun update updates catalogs v1.4.0

`bun update` now updates `catalog` version definitions in non-interactive mode, and re-resolves catalog references when run from the workspace root. [#36304](https://github.com/oven-sh/bun/pull/36304) [#36379](https://github.com/oven-sh/bun/pull/36379)

#### patchedDependencies cache keyed by full patch hash v1.4.0

`patchedDependencies` cache entries are now keyed by a SHA-1 of the whole patch file. Previously the key was a Wyhash, and only the first 16 KiB of the file was hashed. So two projects sharing an install cache got each other's patched package if their patches collided or were identical for their first 16 KiB. Existing `node_modules` are re-patched once on the next install. [#32749](https://github.com/oven-sh/bun/pull/32749)

#### bun pm ls --trusted v1.4.0

`bun pm ls --trusted` filters the dependency tree to packages allowed to run lifecycle scripts, honoring both `trustedDependencies` in `package.json` and Bun's default trusted list. Combines with `--all`. [#32478](https://github.com/oven-sh/bun/pull/32478)

### Performance

### JavaScriptCore

#### Temporal v1.4.0

[`Temporal`](https://tc39.es/proposal-temporal/docs/), the replacement for `Date`, is now enabled by default.

```
const departure = Temporal.ZonedDateTime.from(
  "2026-08-10T09:00[America/Los_Angeles]",
);
departure.add({ hours: 11, minutes: 5 }).withTimeZone("Asia/Tokyo").toString();
// "2026-08-11T12:05:00+09:00[Asia/Tokyo]"

new Date().toTemporalInstant().toZonedDateTimeISO(Temporal.Now.timeZoneId());
```

#### WebAssembly v1.4.0

- **JSPI (JavaScript Promise Integration)** is implemented and enabled by default (53e97afd3421, [307705](https://bugs.webkit.org/show_bug.cgi?id=307705)): `WebAssembly.Suspending` / `WebAssembly.promising` let Wasm suspend on JS Promises directly.
- **Wasm SIMD now runs in the interpreter** ([300666](https://bugs.webkit.org/show_bug.cgi?id=300666), cec82daed8ab). SIMD instructions no longer require JIT compilation.
- Memory64 support (>4 GB Wasm heaps), the multi-memory proposal, and relaxed SIMD.
- `WebAssembly.compileStreaming` / `instantiateStreaming` accept `compileOptions` (4f51c89e3c77).
- The string size limit is removed (81ff731cd920).

```
const suspending = new WebAssembly.Suspending(async (url) => {
  const res = await fetch(url);
  return res.arrayBuffer();
});

const { instance } = await WebAssembly.instantiate(module, {
  env: { fetch: suspending },
});
await WebAssembly.promising(instance.exports.run)();
```

Per-builtin speedups (String, Array, Map/Set, Object/JSON/Intl) are tabulated in the [changelog](#javascriptcore).

#### ES module loader rewritten in C++

JavaScriptCore's ES module loader has been rewritten ([242740](https://bugs.webkit.org/show_bug.cgi?id=242740), 4a638109b905). The previous implementation was partly written in JavaScript, followed an outdated spec draft, and had long-standing bugs: assertion failures on valid ES modules, incorrect evaluation ordering with top-level `await`, and improperly cached resolution failures.

The new loader is pure C++ following the modern ECMAScript spec. Top-level-await evaluation order and `import()` error propagation now match the spec exactly, which fixes several ESM/CJS interop bugs (`require(ESM)`, dependency graphs with top-level `await`). [#29393](https://github.com/oven-sh/bun/pull/29393)

#### Promises and async functions

JSC moved its Promise implementation from JavaScript builtins to C++, then layered allocation-elimination on top. This directly affects every async path in Bun (`Bun.serve` handlers, `fetch`, database drivers).

**Moved to C++**: `Promise.all` / `allSettled` / `any` / `resolve` / `reject` / `prototype.finally` ([303603](https://bugs.webkit.org/show_bug.cgi?id=303603), [303706](https://bugs.webkit.org/show_bug.cgi?id=303706), [303732](https://bugs.webkit.org/show_bug.cgi?id=303732), [300603](https://bugs.webkit.org/show_bug.cgi?id=300603), [305030](https://bugs.webkit.org/show_bug.cgi?id=305030), [300130](https://bugs.webkit.org/show_bug.cgi?id=300130)) and the MicrotaskQueue code driving AsyncGenerator ([304772](https://bugs.webkit.org/show_bug.cgi?id=304772)).

**Allocation elimination**:

- Skip an internal allocation for the single- `await` case ([314637](https://bugs.webkit.org/show_bug.cgi?id=314637)) and when an initial `then` has a single handler ([314733](https://bugs.webkit.org/show_bug.cgi?id=314733)).
- Inline async function bodies that contain no `await` and optimize the returned promise ([304740](https://bugs.webkit.org/show_bug.cgi?id=304740), [313029](https://bugs.webkit.org/show_bug.cgi?id=313029)).
- Inline allocation for `Promise.resolve(non-thenable)` ([314865](https://bugs.webkit.org/show_bug.cgi?id=314865)).
- Skip the intermediate promise for non-thenable elements in combinators ([315017](https://bugs.webkit.org/show_bug.cgi?id=315017), **race 1.71× / all 1.47×**), and avoid per-element context allocation ([314861](https://bugs.webkit.org/show_bug.cgi?id=314861), [314813](https://bugs.webkit.org/show_bug.cgi?id=314813)).
- Scheduling a promise's `.then` /`.catch` callback no longer allocates a separate microtask object ([314788](https://bugs.webkit.org/show_bug.cgi?id=314788)).
- `promise.catch()` now gets the same JIT optimization as `.then()` (f9d99657ac89, **~1.22×**).
- Queued microtasks take less memory and dispatch faster (2ff26dc8e6cc).
- Remove a redundant instruction from `await` / `yield` bytecode ([311239](https://bugs.webkit.org/show_bug.cgi?id=311239)).
- Skip allocating the `{value, done}` result object on generator resume (0b65fe084bed).
- Shrink each generator object from 64 → 48 bytes in memory (e0704d3127d5).

#### String

| **Operation** | **Commit** | **Speedup** |
| --- | --- | --- |
| `String#indexOf` (1-char) on concatenated strings | 3a21b7550526 | **44.98×** |
| `String#endsWith` constant arg, inlined in the JIT | 901865149859 | **up to 10.5×** |
| `String#includes` in DFG/FTL (constant-folded) | cc5da5a661a3 | **9.76×** |
| 1-char `startsWith` / `endsWith` on concatenated strings | fa83cf53f871 | **9.35× / 8.65×** |
| String `===` equality on Latin-1 strings in the JIT | 2fc620c5697b | **5.85×** |
| `startsWith` in DFG/FTL (constant) | 1f7d7d5a8c23 | **5.76×** |
| `isWellFormed` / `toWellFormed` (SIMD) | e5f7abfaed5d | **5.36× / 5.19×** |
| `String#indexOf` 1-char without rope resolve | 8d918b4794c4 | **3.99×** |
| `startsWith` / `endsWith` 1–16B constant immediate | 67969621f703 | **3.10× / 2.83×** |
| `replace` / `replaceAll` in C++ | 2b37638c2082 | **up to 3.0×** |
| `String#includes` 1-char without rope resolve | dbe0b0a08f9a | **2.73×** |
| UTF-16↔UTF-8 conversion (SIMD) | fda0e1e0c823, 3fbc2eefcf86 | **2–5.5×** (non-ASCII) |
| `repeat` in C++ | 2526a45e199d | **up to 2.1×** |
| `padStart` / `padEnd` in C++ | 62667c9f166e | **up to 2.0×** |
| `String#indexOf` strength reduction | 81e56564a0b0 | **1.81×** |
| `toUpperCase` DFG/FTL intrinsic | 47263c1fcdf7 | **~1.4×** |
| `String#split` in C++ + DFG node | 1a0160315f98 | **~1.21–1.23×** |
| `String#concat` in C++ | fe7e0f57289e |  |
| `String#replace` (string arg) builds ropes | 69162bbdb602 |  |
| `RegExp.prototype[Symbol.match]` in C++ | e922a2cecfac |  |
| `String#matchAll` in C++ | 31e38187aad2 |  |

#### Array

| **Operation** | **Commit** | **Speedup** |
| --- | --- | --- |
| `indexOf` / `includes` string compare, 8 bytes at a time | f9477aedc258 | **5.39× / 5.25×** |
| Resizing arrays with `arr.length = N` | da43fc766f60 | **4.30×** |
| `Array.of` compiled as an array literal in the JIT | 445df9a64416 | **up to 3.2×** |
| `Array.prototype.flat` in C++ | 546d47afe6bf | **2.0–3.2×** |
| `Array.from(arguments)` fast path | 12bbbd4b4f3c | **2.5–2.85×** |
| `lastIndexOf` in the JIT | bc818abb8d4b | **up to 2.57×** |
| `Array.from(map.keys()/values())` | 87d58dfdc60b | **1.3–2.8×** |
| `Array.from(Set)` fast path | ff70a7d00968 | **1.4–2.2×** |
| FTL `indexOf` / `includes` string loop layout | 6846e1b56c4b | **1.68×** |
| `Array.of` in C++ | 8d5b7e4c8f2e | **1.43–1.55×** |
| `Array#sort` on partially-sorted input | cd9b98604840 | **1.34×** |
| Small-array sort inlined in DFG/FTL (≤16 elements) | cab7a45a413c |  |
| Dedicated `Array#concat` DFG/FTL nodes | 94e35cf4d86c |  |
| `unshift` grow-and-shift fast path | dde627a1d427 |  |

#### Map / Set / WeakMap

| **Operation** | **Commit** | **Speedup** |
| --- | --- | --- |
| `[...set]` spread walks the hash table directly | 38411ab91e01 + 4f4154bf1726 | **~6× total** |
| `[...map.keys()]` / `[...map.values()]` | a82152a94870 | **~3.78×** |
| `Set#size` / `Map#size` no longer a function call | 2e2c23521a24 | **2.24× / 2.74×** |
| Cloning large Maps/Sets (`new Map(map)`) | 253bd0c20582 | **2.09× / 1.99×** |
| Map/Set fast iteration (for-of) | 433704897995 | **2.05× / 1.59×** |
| Map/Set iterator `.next()` JIT-inlined | e4a0db79b3fb |  |
| `new WeakMap()` / `new WeakSet()` allocation JIT-inlined | d61d43e680e1, 8317f5c80ed4 |  |
| Map/Set backing storage shrunk to actual usage | f72ea56abf5c | memory |

#### Object, JSON, Intl, and JIT

| **Operation** | **Commit** | **Speedup** |
| --- | --- | --- |
| `Intl.DurationFormat#format` per-unit formatter cache | 7e34b0157828 | **26.5×** |
| Set class-field function names at parse time | b6a9b84dae1f | **9.32×** |
| `Object.defineProperty` | [#31562](https://github.com/oven-sh/bun/pull/31562) | **8.6×** |
| `Object.hasOwn` JIT-inlined | aafd2ae78418 | **4.31×** |
| `JSON.stringify` Int32-array fast path | 2ec81a993d35 | **3.08×** |
| Double `%` for positive integers | 899d00c4aa72 | **2.84×** |
| `Math.hypot` with 4+ args | 60dfa5abdbb3 | **1.6–2.4×** |
| `JSON.parse` short-string value cache | 128591e63775 | **1.50×** |
| `Intl.Segmenter` segment iteration | 31d781e3386c | **1.21×** |
| Cached BigInt remainder (multiplicative inverse) | 559de0581a46 |  |
| Objects stay on JIT fast path up to 128 properties (was 64) | f6414a9cee54 |  |
| Dedicated `Array.isArray` DFG/FTL node | b7c903516b25 |  |
| `for...of` over arrays skips redundant bounds checks | 2d4d8ad1273a |  |
| `===` between objects (reference equality) | 8f52a29461ca |  |
| `Error.isError` in DFG/FTL | 6c34b6a708cd |  |
| Eager AST build for IIFEs (skip syntax-only pass) | 709e4e7e7ec7 | cold start |
| Parser/Lexer memory-layout optimization | 8243c6b69d66 |  |
| `JSON.parse` numbers via fast\_float | 1625d084a7f4 |  |
| `JSON.stringify` 16-bit→8-bit characters | 26ddd2802cf5 |  |
| `Intl.NumberFormat` creation | 367f77ea6640 |  |
| `toLocaleLowerCase` / `UpperCase` root-locale fast path | e14189a28e4c |  |

Plus more JIT compiler work landed across the pin bumps:

- faster comparison chains and SIMD constant loads on ARM64 ([#26161](https://github.com/oven-sh/bun/pull/26161))
- inlined `String#localeCompare` ([#29897](https://github.com/oven-sh/bun/pull/29897))
- faster bit rotation
- faster module-loader star-export resolution
- a workaround for slow Date initialization on recent ICU ([#30096](https://github.com/oven-sh/bun/pull/30096))

### Other runtime fixes

- **`Bun.RedisClient`**: a failed connection closes its socket, `connect()` settles once, and `onclose` runs once. Before, a client that could not connect kept the process alive forever. Fixes [#18895](https://github.com/oven-sh/bun/issues/18895). [#39511](https://github.com/oven-sh/bun/pull/39511) [#39513](https://github.com/oven-sh/bun/pull/39513)
- **`Bun.RedisClient`**: `close()` and `connect()` cancel the pending retry timer, so a closed client no longer keeps the process alive. [#39546](https://github.com/oven-sh/bun/pull/39546)
- **`Bun.RedisClient`**: `idleTimeout` counts from connect and restarts on incoming data. Before, it behaved like `connectionTimeout`. [#38281](https://github.com/oven-sh/bun/pull/38281)
- **`Bun.RedisClient`**: `subscribe()` on a failed client rejects instead of storing the listener and keeping the process alive. [#39547](https://github.com/oven-sh/bun/pull/39547)
- **`Bun.RedisClient`**: `close()` on a `rediss://` client no longer hangs when the TLS shutdown is deferred by a stuck peer. [#39548](https://github.com/oven-sh/bun/pull/39548)
- **`Bun.RedisClient`**: `duplicate()` of a closed client starts with no close history and reconnects. [#39575](https://github.com/oven-sh/bun/pull/39575)
- `process.memoryUsage().heapUsed` now updates after every collection, including `Bun.gc(true)`. Before, it kept the value from the last allocation-driven collection. [#39593](https://github.com/oven-sh/bun/pull/39593)
- `console.write()` inside a `beforeExit` handler no longer loops forever when stdout is a pipe. [#38641](https://github.com/oven-sh/bun/pull/38641)
- Creating a `ShadowRealm` inside a `node:vm` context no longer crashes. [#39529](https://github.com/oven-sh/bun/pull/39529)
- `Bun.file(path).arrayBuffer()` on a file over 4 GiB throws `RangeError` instead of returning a truncated buffer. [#39558](https://github.com/oven-sh/bun/pull/39558)
- A source file of 2 GiB or more reports "File is too large to parse" instead of a garbled syntax error. [#39095](https://github.com/oven-sh/bun/pull/39095)
- ICU, libuv, and BoringSSL allocate through mimalloc. This fixes an ICU "failed to initialize Segments" error on Windows. [#39472](https://github.com/oven-sh/bun/pull/39472)
- `require("ws")` no longer loads `node:http` up front, which saves about 10 ms. [#39435](https://github.com/oven-sh/bun/pull/39435)
- `f64` / `double` arguments preserve `NaN`, `-0.0`, and negative BigInts exactly. [#33122](https://github.com/oven-sh/bun/pull/33122)
- `toBuffer` leaves caller-owned memory alone when no finalizer is provided. [#36521](https://github.com/oven-sh/bun/pull/36521)
- `JSVALUE_TO_INT32` handles double-encoded JSValues. [#34653](https://github.com/oven-sh/bun/pull/34653)
- `viewSource` and `JSCallback` throw validation errors. [#34396](https://github.com/oven-sh/bun/pull/34396)
- TinyCC updated to latest upstream (macOS 15 compatibility, arm64 alignment fixes). [#26210](https://github.com/oven-sh/bun/pull/26210)
- The built-in C compiler respects `C_INCLUDE_PATH` and `LIBRARY_PATH` (so NixOS works). [#26250](https://github.com/oven-sh/bun/pull/26250)
- `dlopen()` works on libraries embedded via `bun build --compile`. [#30720](https://github.com/oven-sh/bun/pull/30720)
- `new CString(ptr)` is constructable. [#25257](https://github.com/oven-sh/bun/pull/25257)
- Pointer values round-tripped through `Number(String(ptr))` no longer become `18446744073709551615` on the C side. [#25045](https://github.com/oven-sh/bun/pull/25045)
- `worker.terminate()` is safe while the worker thread is inside a `JSCallback`.
- `bun:ffi` error messages now include the actual `dlerror()` message from the OS, telling you exactly which library failed to load and why, instead of a generic "Failed to open library". [#23585](https://github.com/oven-sh/bun/pull/23585)
- **`Request.prototype.clone()` and `Response.prototype.clone()`** now throw `TypeError` when the body has already been consumed or is locked, per the Fetch spec. Previously the clone succeeded silently and resolved to an empty body. [#33129](https://github.com/oven-sh/bun/pull/33129)
- **`Response.redirect(url)`** now runs its argument through the WHATWG URL parser before writing the `Location` header, so spaces, non-ASCII characters, default ports, and dot segments are normalized per the Fetch spec. [#33126](https://github.com/oven-sh/bun/pull/33126)
- **`Bun.readableStreamToArrayBuffer`** and the other `readableStreamTo*` helpers now return a rejected promise instead of throwing synchronously when passed an already-errored stream; the same applies to `new Response(erroredStream).arrayBuffer()`. [#33043](https://github.com/oven-sh/bun/pull/33043)
- **`HTMLRewriter.transform()`** now rejects when the upstream response body errors mid-stream instead of resolving with a silently truncated document. [#32927](https://github.com/oven-sh/bun/pull/32927)
- **`structuredClone` on a detached `ArrayBuffer`** now throws a `DataCloneError` `DOMException` instead of a plain `TypeError`, matching the HTML spec and Node.js. [#32799](https://github.com/oven-sh/bun/pull/32799)
- **`structuredClone(Object.prototype)`** now returns `{}` instead of throwing `DataCloneError`, matching Node.js and the HTML spec. [#32983](https://github.com/oven-sh/bun/pull/32983)
- **`FormData` multipart serialization** normalizes lone CR and lone LF to CRLF in field names and string values per the WHATWG spec, so serialized bodies are byte-identical to Node.js and browsers. [#32975](https://github.com/oven-sh/bun/pull/32975)
- **`URLSearchParams` and `FormData`** `.get()`, `.getAll()`, and `.has()` now normalize malformed Unicode in the name argument the same way `.set()` and `.append()` do, so an entry stored under such a name is found by lookup, matching Node.js and browsers. [#33398](https://github.com/oven-sh/bun/pull/33398)
- **`console.table()` and `Bun.inspect.table()`** now invoke each cell's getter and custom-inspect hook exactly once instead of two or three times. [#32924](https://github.com/oven-sh/bun/pull/32924)
- **`socket.setTypeOfService()`** on `Bun.connect` sockets validates its argument, throwing `ERR_INVALID_ARG_TYPE` / `ERR_OUT_OF_RANGE` for non-numeric values.
- **`FormData` multipart boundaries** now exactly match WebKit's `----WebKitFormBoundary…` format, fixing uploads to strict multipart parsers including OpenAI's file upload endpoint. [#29631](https://github.com/oven-sh/bun/pull/29631)
- **`TextDecoder` with `{ stream: true }`** no longer corrupts characters split across chunk boundaries for `shift_jis`, `euc-jp`, `iso-2022-jp`, `gbk`, `gb18030`, `big5`, and `euc-kr`. [#31438](https://github.com/oven-sh/bun/pull/31438)
- **`TextEncoder.encodeInto()`** now returns `{ read: 0, written: 0 }` and leaves the buffer untouched when a 4-byte character (like an emoji) doesn't fit, instead of writing the � replacement character, matching the WHATWG Encoding spec. [#31532](https://github.com/oven-sh/bun/pull/31532)
- **`self.postMessage(msg, [transferable])`** inside a `Worker` now actually transfers `ArrayBuffer` s and `MessagePort` s. Previously the positional-array overload was silently ignored and transferables were cloned instead of moved. [#30068](https://github.com/oven-sh/bun/pull/30068)
- **`new Request()`** now stores and returns the `cache` and `mode` options instead of always reporting `"default"` and `"navigate"`, and preserves them through `.clone()`. [#26099](https://github.com/oven-sh/bun/pull/26099)
- **Sliced `Blob` s** respect their slice bounds when streamed or used as a `Response` body, and advertise the correct `Content-Length`.
- **`Response.clone()` and `Request.clone()`** now tee the body when `.body` was accessed (but not read) before cloning. Previously the original's cached `.body` stream was silently drained to zero bytes, breaking the common `res.clone()` -then- `new Response(res.body, res)` cache-and-forward pattern. [#33779](https://github.com/oven-sh/bun/pull/33779)
- **`new TextDecoder()` and `.decode()`** now throw `TypeError` when passed a primitive as the options argument and accept `null` as the default dictionary, per WebIDL. [#35189](https://github.com/oven-sh/bun/pull/35189)
- **`new File()`** now normalizes the `lastModified` option per WebIDL: `NaN` and unparseable strings become `0`, and `null` is treated as present (yielding `0`) instead of falling through to `Date.now()`. [#33922](https://github.com/oven-sh/bun/pull/33922)
- **`.env` parsing** handles UTF-8 correctly. A leading BOM no longer drops the first variable. Applies to auto-loaded `.env` files, `--env-file`, and `util.parseEnv`. [#34002](https://github.com/oven-sh/bun/pull/34002)
- **`.env` parsing**: Trailing junk after a closing quote no longer swallows the following lines into the value. Applies to auto-loaded `.env` files, `--env-file`, and `util.parseEnv`. [#34003](https://github.com/oven-sh/bun/pull/34003)
- **`.env` parsing**: Multibyte characters whose encoding ends in `0xA0` are no longer corrupted by whitespace trimming. Applies to auto-loaded `.env` files, `--env-file`, and `util.parseEnv`. [#34001](https://github.com/oven-sh/bun/pull/34001)
- **Assigning to an ES module import** is now a runtime `TypeError` when the write is reached, per ECMA-262, instead of a parse-time error that made the module unloadable even when the assignment was in dead code or a `try` / `catch`. `bun build` still errors at bundle time. [#36046](https://github.com/oven-sh/bun/pull/36046)
- **`require.extensions` hooks** registered by an entry point of 4 KiB or more now work on every run. Previously they were ignored from the second run onwards, once the file came from the transpiler cache, and files with unknown extensions imported by that entry point were parsed as TSX instead of resolving to their paths.
- **`require.extensions` hooks** Entry points built with `bun build --target=bun --format=cjs` had the same `require.extensions` bug on every run. [#33371](https://github.com/oven-sh/bun/pull/33371)
- `structuredClone` (and `postMessage`, `Worker`, `MessageChannel`) no longer silently resolves back-references to the wrong value when the graph contains a `BigInt`, `CryptoKey`, or `X509Certificate`. Previously a shared object appearing after a BigInt could come back as the BigInt itself, or deserialization could fail entirely. [#32791](https://github.com/oven-sh/bun/pull/32791)
- `db.close(true)` finalizes all outstanding prepared statements. [#36573](https://github.com/oven-sh/bun/pull/36573) [#36793](https://github.com/oven-sh/bun/pull/36793) [#37045](https://github.com/oven-sh/bun/pull/37045) [#34925](https://github.com/oven-sh/bun/pull/34925) [#34186](https://github.com/oven-sh/bun/pull/34186) [#34962](https://github.com/oven-sh/bun/pull/34962)
- **`Bun.RedisClient`**: `expire()` rejects `NaN` / `undefined` seconds instead of silently sending `EXPIRE key 0`
- **`Bun.RedisClient`**: the RESP line-length cap is raised from 512 KB to 512 MB for large replies
- **`Bun.RedisClient`**: a torn `VerbatimString` / `BlobError` body is no longer treated as a fatal protocol error
- **`Bun.RedisClient`**: invalid database segments in the connection URL are rejected instead of silently ignored
- S3 simple requests handle close-delimited HTTP responses.
- **`Bun.write()`**: no longer over-copies or truncates when passed a caller-owned destination file descriptor. [#36758](https://github.com/oven-sh/bun/pull/36758)
- **`Bun.write()`**: `Bun.write(file, file)` no longer truncates on Linux when the source size is unknown (`splice` / `sendfile` loop to EOF). [#36590](https://github.com/oven-sh/bun/pull/36590)
- **`Bun.YAML`**: input is validated for embedded NUL bytes before parsing.
- **`Bun.randomUUIDv7()`**: an explicit timestamp argument is honored verbatim. [#34321](https://github.com/oven-sh/bun/pull/34321)
- **`Bun.randomUUIDv7()`**: monotonicity is preserved when the 12-bit counter rolls over within a millisecond. [#34022](https://github.com/oven-sh/bun/pull/34022)
- **`Bun.randomUUIDv7()`**: timestamps ≥ 2^48 and `NaN` are rejected instead of silently truncated. [#34021](https://github.com/oven-sh/bun/pull/34021)
- `gzipSync` / `deflateSync` throw a clear invalid-argument error for out-of-range libdeflate compression levels instead of a misleading "Out of memory". [#34117](https://github.com/oven-sh/bun/pull/34117) [#34114](https://github.com/oven-sh/bun/pull/34114)
- **`Bun.mmap()`** returns a view at the requested `offset` instead of the page-aligned offset. [#34120](https://github.com/oven-sh/bun/pull/34120)
- **`Bun.mmap()`**: its `offset` / `size` options are now typed. [#34573](https://github.com/oven-sh/bun/pull/34573)
- **`Bun.udpSocket`**: `connect()` rejects out-of-range ports instead of silently clamping to 0. [#34029](https://github.com/oven-sh/bun/pull/34029)
- **`Bun.udpSocket`**: numeric options are range-checked instead of silently truncated (also applies to `Bun.password`). [#36999](https://github.com/oven-sh/bun/pull/36999)
- **`Bun.FileSystemRouter`**: `match()` returns `null` for paths not starting with `/` instead of matching incorrectly. [#34028](https://github.com/oven-sh/bun/pull/34028)
- **`Bun.FileSystemRouter`**: empty-key query pairs are skipped instead of terminating the query parse early. [#34027](https://github.com/oven-sh/bun/pull/34027)
- **`Bun.color()`** clamps out-of-range object alpha instead of wrapping mod 256. [#34020](https://github.com/oven-sh/bun/pull/34020)
- **`Bun.color()`** lists all accepted format strings in its invalid-format error. [#34314](https://github.com/oven-sh/bun/pull/34314)
- **`Bun.CryptoHasher.update()`** rejects odd-length hex strings instead of silently truncating. [#35188](https://github.com/oven-sh/bun/pull/35188)
- **`Bun.Socket.setKeepAlive()`** honors milliseconds as documented. [#34269](https://github.com/oven-sh/bun/pull/34269)
- **`Bun.Socket.setKeepAlive()`**: `setKeepAlive(true)` returns `true`. [#34269](https://github.com/oven-sh/bun/pull/34269)
- **`Bun.Glob`** preserves a leading `**` as a globstar under `!` negation. [#33759](https://github.com/oven-sh/bun/pull/33759)
- **`Bun.Transpiler`** throws `TypeError` for non-transpilable loaders.
- **`Bun.openInEditor()`** throws when no editor is found instead of silently spawning an empty command. [#37210](https://github.com/oven-sh/bun/pull/37210)
- **`Bun.RedisClient`**: calling `.connect()` after a disconnect properly resets the failed state instead of permanently rejecting every command with `Connection has failed`. [#29927](https://github.com/oven-sh/bun/pull/29927)
- **`Bun.file()`**: `.stat()` and `.delete()` no longer corrupt paths containing non-ASCII UTF-8 characters. [#26646](https://github.com/oven-sh/bun/pull/26646)
- **`Bun.generateHeapSnapshot("v8", "arraybuffer")`** returns the snapshot as a UTF-8 `ArrayBuffer`, which scales to very large heaps.
- Runtime `Bun.plugin()` `onResolve` hooks that return a filesystem path in the default `file` namespace now work. Previously the path came back as `file:/abs/path.js` and failed to load, breaking path aliases and virtual-to-real redirects for dynamic `import()`, computed `require()`, `Bun.resolveSync()`, and `import.meta.resolve()`. [#33409](https://github.com/oven-sh/bun/pull/33409)
- **`Bun.TOML.parse()`** throws on syntax errors like missing array commas instead of silently returning partial data. [#31255](https://github.com/oven-sh/bun/pull/31255)
- **`Bun.TOML.stringify()`** no longer emits redundant headers for pass-through super-tables. [#37009](https://github.com/oven-sh/bun/pull/37009)
- Added a socket syscall fault-injection layer for deterministic fuzzing of `node:net`, `node:tls`, `node:http`, HTTP/2, `fetch`, and WebSocket against partial reads/writes, mid-stream `ECONNRESET` / `EPIPE`, `EAGAIN` storms, and backpressure races, and fixed several bugs it surfaced.
- Crashes in `Worker` and `worker_threads` termination have been fixed.
- A crash in `Bun.FileSystemRouter.match()` has been fixed.
- A rare crash in `console.log` and `Bun.inspect` formatting has been fixed.
- A crash in `structuredClone()` and `postMessage()` serialization has been fixed.
- A crash in proxied `fetch()` requests has been fixed.
- Fixed two GC bugs where an `AbortSignal` could lose its `reason` or its `abort` event listeners.
- `AbortSignal.any()` keeps its source signals correctly rooted for GC.
- `Error` finalization crash is fixed.
- Stream error handling crash is fixed.
- Fixed a top-level await bug where a dynamic `import()` from a module that was itself still awaiting would throw `ReferenceError: Cannot access '...' before initialization` instead of resolving.
- `Worker` termination is safe while `fs.watchFile()` callbacks are pending.
- `fs.readFile(path, "utf8")`, `Buffer.toString("utf8")`, and `StringDecoder` report allocation failure as an `OutOfMemory` error.
- Whole-file reads (the `.env` loader, `bun pm pack`, `Bun.Image`) report allocation failure as `ENOMEM`.
- `Bun.FileSystemRouter.reload()` synchronizes access to the resolver's cached directory-entry map.
- Fixed a segfault running the linux-arm64 build under Termux on Android by issuing `epoll_pwait2` as a raw syscall and gating it off on Android, whose per-app seccomp policy blocks it.
- A crash in auto-install resolution has been fixed.
- `require("./addon.node?v=1")` loads the addon and `import("./addon.node?v=1")` throws the intended `TypeError`; query strings and custom extensions mapped to the napi loader are handled.
- The ini parser treats empty single-quoted values (`key='` or `key=''`) as empty strings, matching npm/ini.
- `console.write.call(primitive)` throws `ERR_INVALID_THIS`.
- Crash reports from baseline x86\_64 builds now symbolicate correctly on bun.report; a dead `cfg(feature)` gate was tagging them with the non-baseline platform and resolving against the wrong debug artifact.
- Batched UDP receive (`recvmsg_x` / `sendmsg_x`) is gated to macOS 15.6+.
- The `bun` npm package's postinstall now tries the musl binary first on musl-based Linux (detected via `process.report`, not just Alpine). [#36283](https://github.com/oven-sh/bun/pull/36283)
- The generated `@oven/bun-linux-*` packages now carry a `libc` field so npm skips downloading the wrong-ABI optional dependency. [#36283](https://github.com/oven-sh/bun/pull/36283)
- `bun --print` with top-level `await` now prints the module's final completion value instead of the first awaited value: `bun -p '(await 1) + 1'` prints `2`, not `1`. [#30208](https://github.com/oven-sh/bun/pull/30208)
- The debugger no longer pegs a CPU core at 100% while paused at a breakpoint; Bun now sleeps instead of spinning in a loop while you step through code. [#29438](https://github.com/oven-sh/bun/pull/29438)
- Breakpoints in files over 50KB now land on the right line when debugging from VS Code's debug terminal. The runtime transpiler cache is disabled whenever the inspector is active via `BUN_INSPECT`, not just `--inspect`. [#28189](https://github.com/oven-sh/bun/pull/28189)
- Loading a native addon known to require V8 C++ APIs Bun doesn't yet support (currently `better-sqlite3`) now throws a clear error linking to the tracking issue and suggesting `bun:sqlite`, instead of a confusing `dlopen` failure. [#24384](https://github.com/oven-sh/bun/pull/24384)
- Running `bun file.css` (or any file type Bun can't execute directly) now prints "Cannot run css files directly" instead of the misleading "File not found". [#26126](https://github.com/oven-sh/bun/pull/26126)
- When the `bun` npm package is installed with `--ignore-scripts` (or via pnpm, which skips postinstall by default), the placeholder binaries now print a clear error explaining how to fix it and exit non-zero, instead of silently doing nothing. [#26259](https://github.com/oven-sh/bun/pull/26259)
- Fixed a `--hot` race where an error thrown during module evaluation could be remapped against the wrong sourcemap if a file-watcher event fired before the error was printed. [#29740](https://github.com/oven-sh/bun/pull/29740)
- `@types/bun` no longer depends on `@types/react`, so projects that don't use React no longer get React's global JSX types pulled in just by installing Bun's types. [#24557](https://github.com/oven-sh/bun/pull/24557)
- `@types/bun` now ships against `@types/node@25`. [#25460](https://github.com/oven-sh/bun/pull/25460)
- The `expect().toContainKey*` matchers fall back to `PropertyKey` when `keyof unknown` resolves to `never`. [#25460](https://github.com/oven-sh/bun/pull/25460)
- Bun's repo now ships a Nix flake, so contributors on NixOS can spin up a fully reproducible dev environment with LLVM 19, CMake, Rust, and Go with no `sudo` required. [#23406](https://github.com/oven-sh/bun/pull/23406)
- Download progress (like `bun upgrade`) now shows human-readable sizes (`23.2MiB/100MiB`) instead of raw byte counts. [#24266](https://github.com/oven-sh/bun/pull/24266)
- CI environment detection now recognizes 40+ providers (auto-generated from the `ci-info` dataset). [#23708](https://github.com/oven-sh/bun/pull/23708)
- CI environment detection respects `CI=true` to force CI mode. [#23708](https://github.com/oven-sh/bun/pull/23708)
- `--no-clear-screen` and `BUN_CONFIG_NO_CLEAR_TERMINAL_ON_RELOAD` are now honored by the dev server when `hmr: true`. [#26184](https://github.com/oven-sh/bun/pull/26184)
- `bun init --minimal` no longer creates Cursor rules or `CLAUDE.md`; it now writes only `package.json` and `tsconfig.json`, as intended. [#26051](https://github.com/oven-sh/bun/pull/26051)
- `bun init --react` templates now name the server entrypoint `index.ts` instead of `index.tsx`. [#23469](https://github.com/oven-sh/bun/pull/23469)
- The react-tailwind template's `build.ts` now type-checks under its own strict `tsconfig.json`. [#26258](https://github.com/oven-sh/bun/pull/26258)
- `bun publish --help` now shows the correct description for `--dry-run`. [#25137](https://github.com/oven-sh/bun/pull/25137)
- The VS Code extension's test explorer now recognizes Bun's newer test functions during static analysis, so code lenses and the sidebar pick them up. [#25256](https://github.com/oven-sh/bun/pull/25256)
- Debugger CLI flags now propagate correctly to single-file executables built with `bun build --compile`. [#25600](https://github.com/oven-sh/bun/pull/25600)
- Error carets for out-of-range `\u{...}` Unicode escapes now point exactly at the backslash instead of two columns to the left. [#31138](https://github.com/oven-sh/bun/pull/31138)
- The dev server's inspector no longer emits duplicate `BunFrontendDevServer.clientNavigated` events on route navigation. [#32081](https://github.com/oven-sh/bun/pull/32081)
- Type-definition fixes in `@types/bun`: added `Server.protocol`, `S3Options.contentEncoding`, the `seed` parameter on `Bun.hash.crc32()`, UDP socket methods, `autoloadTsconfig` / `autoloadPackageJson`, and `BunLockFile.configVersion` documentation.
- `Socket.reload()` correctly requires `{ socket: handler }`
- `Bun.build()` allows `splitting: true` alongside `compile`
- The `Bun.Build` `target` type includes `bun-linux-x64-baseline`, `bun-linux-x64-modern`, and other SIMD variants.
- The FFI type maps no longer trigger `TS2300: Duplicate identifier` under the `tsgo` native preview.. [#25267](https://github.com/oven-sh/bun/pull/25267)

### Other fetch() fixes

- **Cancelling a `fetch()` response reader** (`reader.cancel()` / `res.body.cancel()`) now aborts the underlying request and closes the connection instead of silently draining the remaining body, so servers observe the cancellation.
- **DNS lookup failures** from `fetch()` and `Bun.connect()` now report `ENOTFOUND` with `syscall: "getaddrinfo"` and the hostname instead of a misleading `ConnectionRefused` / `ECONNREFUSED`, so retry wrappers can distinguish "name does not resolve" from "host refused". [#32990](https://github.com/oven-sh/bun/pull/32990)
- **`fetch()` matches `Content-Encoding` case-insensitively** per RFC 9110. Responses sent with `GZIP`, `Gzip`, or the legacy `x-gzip` alias are now decompressed instead of being handed to JavaScript still compressed. [#31521](https://github.com/oven-sh/bun/pull/31521)
- **`fetch()` with an authenticated proxy** now encodes `Proxy-Authorization: Basic` with the standard base64 alphabet (with `=` padding) instead of base64url, fixing rejected credentials on strict proxies. [#31782](https://github.com/oven-sh/bun/pull/31782)
- **`fetch()` with `redirect: "error"`** now only rejects the five WHATWG redirect statuses (301, 302, 303, 307, 308). Previously the whole 3xx range was treated as a redirect, so a `304 Not Modified` response rejected with `UnexpectedRedirect` instead of being returned. [#36539](https://github.com/oven-sh/bun/pull/36539)
- **`fetch(request)` with an already-consumed stream body** now throws `TypeError` before any network I/O, instead of opening a connection, writing the request head, and then failing with `ERR_STREAM_CANNOT_PIPE`. [#36499](https://github.com/oven-sh/bun/pull/36499)
- **`fetch()` with an already-aborted `AbortSignal`** now returns an already-rejected promise synchronously, per the Fetch spec, instead of a pending promise that settled after a round-trip to the HTTP thread.
- **`fetch()` after a bodyless response** (`HEAD`, `204`, `304`, `Content-Length: 0`, or a followed redirect) only returns the connection to the keep-alive pool when the response was framed cleanly.
- **`fetch()` following a bodyless redirect** now reuses the keep-alive connection for the request to the `Location` URL. Since 1.3.14 a `GET` answered with a `302`, or a small `POST` answered with a `303` or `307`, closed the connection and opened a new one. A `3xx` with a body or `Connection: close` still closes it. [#37451](https://github.com/oven-sh/bun/pull/37451)
- **`fetch()` after an HTTP/1.0 response** no longer pools the connection unless the response says `Connection: keep-alive`, per RFC 9112. Previously the next request went out on a socket the server had already closed; idempotent requests were retried, and a `POST` failed with `ECONNRESET`. [#37530](https://github.com/oven-sh/bun/pull/37530)
- Fixed `fetch()` silently hanging against certain hosts (e.g. `api.fortnox.se`). Bun's TLS handshake was sending an optional probe extension that some strict servers reject. [#29782](https://github.com/oven-sh/bun/pull/29782)
- Fixed `fetch()` through an HTTP CONNECT proxy leaking the proxy's `200 Connection established` line into the returned response when it arrived split across TCP reads. [#30385](https://github.com/oven-sh/bun/pull/30385)
- Removed an unintended 1 GiB cap on decompressed `fetch()` response bodies that caused `ZlibError` on gzip/brotli/zstd responses whose decompressed size exceeded 1 GiB. [#32366](https://github.com/oven-sh/bun/pull/32366)
- Fixed `fetch()` decoding only the first member of a multi-member gzip response body and silently dropping the rest. [#33708](https://github.com/oven-sh/bun/pull/33708)
- **`fetch()`**: `response.body.cancel()` on an unread body now aborts the underlying transfer.
- **`fetch()`**: aborting a streaming response frees the buffered body and errors the reader.
- **`fetch()`**: a fully-buffered response that is aborted now errors its body stream instead of resolving stale bytes.
- **`fetch()`**: `new Request(input, { signal: null })` detaches from `input` 's abort signal per spec.
- **`fetch()`**: uploads of a `Bun.file().slice()` now send the correct `Content-Length`. [#36862](https://github.com/oven-sh/bun/pull/36862)
- **`fetch()`**: Latin-1 request header values are isomorphic-encoded on the wire per spec. [#35338](https://github.com/oven-sh/bun/pull/35338)
- **`fetch()`**: sending a request body with `OPTIONS` is allowed. [#34920](https://github.com/oven-sh/bun/pull/34920)
- **`fetch()`**: truncated compressed bodies on close-delimited responses are rejected instead of returning partial data. [#34922](https://github.com/oven-sh/bun/pull/34922)
- **`fetch()`**: redirects are followed as soon as the 3xx headers arrive instead of waiting for the body. [#33613](https://github.com/oven-sh/bun/pull/33613)
- **`fetch()`**: URL schemes are compared case-insensitively for proxies and redirect `Location` headers. [#35144](https://github.com/oven-sh/bun/pull/35144)
- **`fetch()`**: `http_proxy` / `no_proxy` are re-evaluated on each redirect hop. [#33651](https://github.com/oven-sh/bun/pull/33651)
- **`fetch()`**: `Proxy-Authorization` is sent when the proxy URL has an empty username or password. [#36041](https://github.com/oven-sh/bun/pull/36041)
- **`fetch()`** rejects (rather than throwing synchronously) when reading an option throws. [#33647](https://github.com/oven-sh/bun/pull/33647) [#36145](https://github.com/oven-sh/bun/pull/36145) [#36309](https://github.com/oven-sh/bun/pull/36309) [#33710](https://github.com/oven-sh/bun/pull/33710) [#33649](https://github.com/oven-sh/bun/pull/33649)

### Other test runner fixes

- Large `expect()` mismatches print a real diff. The old diff engine gave up after 1 s and printed both values whole; a 456 KB string pair now diffs in 4 ms instead of 74 ms. [#39310](https://github.com/oven-sh/bun/pull/39310)
- Fixed the TypeScript types for `vi.mock` in `bun:test`. It was incorrectly typed as `vi.module`, causing "Property 'mock' does not exist" errors in editors. [#24248](https://github.com/oven-sh/bun/pull/24248)
- The JUnit reporter now emits one `<testcase>` per retry attempt, so CI flaky-test dashboards get per-attempt timing. [#26866](https://github.com/oven-sh/bun/pull/26866)
- `bun test --bail` now flushes the JUnit `--reporter-outfile` on both bail paths (test failure and unhandled rejection), so CI always gets the XML even when bail triggers early. [#26852](https://github.com/oven-sh/bun/pull/26852)
- `toMatchSnapshot()` now works correctly with `--rerun-each` and test retries: the snapshot counter is reset between iterations instead of looking for `<name> 2`, `<name> 3`, etc. [#29375](https://github.com/oven-sh/bun/pull/29375)
- Snapshot-creation errors in CI now include the snapshot name and the received value, so you can find which assertion tried to write a new snapshot. [#23419](https://github.com/oven-sh/bun/pull/23419)
- Object diffs in `expect()` failures and `console.log` no longer silently drop properties with empty-string keys. `{ "": "value" }` previously printed as `{}`. [#27166](https://github.com/oven-sh/bun/pull/27166)
- IDE test integrations now receive `TestReporter.found` / `start` / `end` events even when the debugger attaches after tests were discovered (e.g. with `--inspect` instead of `--inspect-wait`). [#25986](https://github.com/oven-sh/bun/pull/25986)
- `test.each()` / `describe.each()` keep the table array alive until the test is registered.
- `jest.mock()` validates its source origin.
- `expect.extend()` validates that each matcher is an ordinary JavaScript function and throws a `TypeError` otherwise.
- `expect.extend()` handles matcher objects with numeric index keys.
- Custom matchers registered via `expect.extend()` throw `TypeError: not a constructor` when called with `new`.
- Exceptions thrown inside custom asymmetric matchers registered via `expect.extend` now propagate to JavaScript instead of triggering a debug assertion. [#29199](https://github.com/oven-sh/bun/pull/29199)
- `spyOn()` supports indexed property keys.
- `mock.module()` validates that its first argument is a string.
- `mock.module(specifier)` / `vi.mock(specifier)` work without a factory callback when auto-install is triggered.
- `bun test` formats deeply nested objects safely.
- Negated `concurrentTestGlob` patterns like `"!**/sequential-*.test.ts"` now correctly select non-matching files for concurrent execution. [#35315](https://github.com/oven-sh/bun/pull/35315)
- `bun test` no longer parks in the event loop for ~100ms per file when a previous file left a long-running timer pending; in a debug build, a 21-file suite with a leaked `setTimeout` went from 2.5s to 0.6s. [#36453](https://github.com/oven-sh/bun/pull/36453)
- `Bun.deepEquals()` and `expect().toEqual()` now compare `Temporal` objects (`Instant`, `PlainDate`, `ZonedDateTime`, `Duration`, …) by value; previously any two instances of the same class were reported equal. [#37024](https://github.com/oven-sh/bun/pull/37024)
- `--reporter=junit` now emits well-formed XML: control characters in test names are dropped instead of producing invalid entities, `classname` is no longer double-escaped, and `<failure>` elements include the error message. [#34975](https://github.com/oven-sh/bun/pull/34975)
- `--reporter=junit` now emits one `<testcase>` per test with its final outcome after retries, so CI dashboards no longer show a passing suite as failed because of intermediate retry attempts. [#33967](https://github.com/oven-sh/bun/pull/33967)
- Fixed inspector `TestReporter` test IDs colliding between the live and retroactive reporting paths, which caused inspector clients keying state by ID to conflate unrelated tests. [#36522](https://github.com/oven-sh/bun/pull/36522)
- `expect()` failure messages no longer swallow `<...>` spans in Received/Expected values; comparing `'<div class="a">Hello</div>'` against `'<div class="b">Hello</div>'` previously printed both as `"Hello"`. [#34343](https://github.com/oven-sh/bun/pull/34343)
- `toHaveReturned()` and related matchers validate a mock's `.mock.results` array before reading it.
- `spyOn()` supports spying on a function's `prototype` property.
- Formatting a `FormData` value validates its `toJSON` property.
- `test.each()` handles values that throw while being formatted into the test title.
- `toBeArrayOfSize()` and `toHaveBeenCalledTimes()` handle arrays of any length.

### Other bundler fixes

- `Bun.build()` waits only for its own work. A pending `fs.readFile()` on a FIFO no longer blocks an unrelated build. [#38604](https://github.com/oven-sh/bun/pull/38604)
- `--splitting` no longer emits a chunk for an `import()` that is only reachable from dead code, such as an `if (FLAG)` removed by `--define`. [#39591](https://github.com/oven-sh/bun/pull/39591)
- In a `--compile` executable, `require()` of another embedded CommonJS entry point works instead of failing with "Failed to evaluate module". [#38437](https://github.com/oven-sh/bun/pull/38437)
- `Bun.build({ compile: true })` now applies sourcemaps correctly, so stack traces from compiled binaries show your real source paths instead of `/$bunfs/root/app.js`. [#23916](https://github.com/oven-sh/bun/pull/23916)
- Fixed `unicode-range` in `@font-face` being mangled by the CSS parser (`U+0000-00FF` → `U0-0FF`), which caused browsers to drop the font. [#27613](https://github.com/oven-sh/bun/pull/27613)
- Fixed `import.meta.url` in bundles built with `--bytecode`. [#23803](https://github.com/oven-sh/bun/pull/23803)
- Fixed `__toESM` emission when bundling ESM input to CJS output; the default-export wrapper now matches Node.js semantics. [#23803](https://github.com/oven-sh/bun/pull/23803)
- Fixed `bun build --compile` silently producing a no-op executable when 8 or more files were embedded. A chunk-sorting bug was picking an asset wrapper as the entry point instead of your code. [#25859](https://github.com/oven-sh/bun/pull/25859)
- Fixed `bun build --compile` producing an all-zeros binary when the output directory lives on a different filesystem than the temp directory (common in Docker, Gitea runners, and other overlayfs setups). [#26883](https://github.com/oven-sh/bun/pull/26883)
- **Standalone executables** built with `bun build --compile` now apply `BUN_OPTIONS` as `execArgv` instead of leaking it into `process.argv`. [#26346](https://github.com/oven-sh/bun/pull/26346)
- **CSS parser** now accepts class selectors in `::view-transition-old(.foo)`, the `.` null-cell token in `grid-template-areas`, `@page :left` / `@page foo:first` pseudos, and `mask` shorthand `geometry-box` values.
- **CSS parser**: Logical `border-*-*-radius` properties (including with `var()`) are no longer dropped or mismapped.
- **CSS `@layer`**: top-level `@layer` ordering declarations are preserved (fixes Tailwind CSS).
- **CSS `@layer`**: `light-dark()` fallback variables are now injected inside `@layer` blocks.
- **CSS minifier** bounds nested `&` expansion, `light-dark()` evaluation, angle values, and pseudo/at-rule nesting.
- **CSS minifier** merges adjacent rules with identical selectors in linear time.
- **JS minifier** now collapses `(a) => { return x }` into `(a) => x`.
- **JS minifier**: a batch of invalid-output edge cases are fixed: `xinstanceof y` token fusion at start-of-file, dangling `{ ...a, x: }` from simplified spreads, `Promise.resolve().then(() => )` from unused dynamic imports, empty `else {}` blocks, and numeric property keys that overflow to `Infinity`.
- **Tree-shaking** correctly handles `sideEffects: false` barrels that re-export namespace imports (`import * as ns; export { ns }`), object literals keyed by inlined enum members, and `export *` across package boundaries, fixing `undefined` exports from packages like `@tanstack/react-query`. [#27524](https://github.com/oven-sh/bun/pull/27524)
- **HTML bundling** Multiple HTML entrypoints sharing one CSS file all get the `<link>` tag.
- **HTML bundling** Compiled HTML references chunks with root-relative paths so assets load from any route.
- **HTML bundling** `--compile --target=browser` now emits sourcemaps for inlined scripts. [#27821](https://github.com/oven-sh/bun/pull/27821)
- **HTML bundling** `--compile --target=browser` correctly inlines JS-imported assets as `data:` URIs. [#27821](https://github.com/oven-sh/bun/pull/27821)
- **Dev server & HMR**: rapid successive saves no longer throw "Unknown HMR script".
- **Dev server & HMR**: multiple `import {}` statements from the same barrel no longer fail with "X is not a function".
- **Dev server & HMR**: CSS rebuilds and file-watching are hardened.
- **Sourcemaps**: `--compile --sourcemap=external` now writes `.map` files to disk (one per chunk with `--splitting`). [#27396](https://github.com/oven-sh/bun/pull/27396)
- **Sourcemaps**: comment statements now emit mappings for better debugger accuracy. [#27396](https://github.com/oven-sh/bun/pull/27396)
- **Sourcemaps**: a memory leak in `Bun.build()` with `sourcemap: 'inline'` and no `outdir` is fixed. [#27396](https://github.com/oven-sh/bun/pull/27396)
- **Symbol renaming**: a named function expression that shadowed an inlined import is now correctly renamed, fixing infinite recursion at runtime in Svelte 5 dev-mode apps. [#26027](https://github.com/oven-sh/bun/pull/26027)
- **Dynamic `import()`** with `{ with: { type: 'text' } }` now applies the requested loader during bundling. [#28045](https://github.com/oven-sh/bun/pull/28045)
- **Dynamic `import()`**: CommonJS chunks from dynamic imports are correctly wrapped with `__toESM` when code splitting is enabled. [#26120](https://github.com/oven-sh/bun/pull/26120)
- **Transpiler correctness**: we fixed dozens of fuzzer-found invalid-output cases and hardened the parser. This includes:
	- `using` declarations inside `switch` cases
		- decorators on dropped TypeScript members
		- anonymous decorated `export default class`
		- deeply nested types and block statements (now throw a clean error)
		- `infer ... extends` parsing
		- `for (async of …)`
		- reserved-word inferred names
		- namespace/enum scope handling
		- malformed `declare` blocks
- Fixed `bun build --compile` producing segfaulting Linux binaries when the base `bun` had been run through `patchelf` (as NixOS's `autoPatchelfHook` does): the writable `PT_LOAD` segment to extend is now selected by vaddr containment of the `.bun` section, not table order.
- Fixed `bun build --compile` mangling `..` segments in embedded entrypoint paths to `_.._`, breaking `new Worker()` targets that lived above the compile root. [#32730](https://github.com/oven-sh/bun/pull/32730)
- Fixed non-deterministic output and silently dropped modules when code-splitting through chained `sideEffects: false` barrel packages (`@sentry/node-core` re-exporting `@sentry/core`), which surfaced at runtime as `Exported binding 'X' needs to refer to a top-level declared variable`. [#36838](https://github.com/oven-sh/bun/pull/36838)
- Fixed HTML entry points writing a shared chunk into `<script src>` instead of the entry chunk when code splitting was enabled, leaving the page blank with no error. [#34113](https://github.com/oven-sh/bun/pull/34113)
- An unresolvable `require()` inside a `catch` block now emits a runtime throw instead of failing the build, matching the existing handling for `try` bodies (fixes bundling packages that probe optional dependencies with try/catch fallbacks). [#35659](https://github.com/oven-sh/bun/pull/35659)
- **JS minifier** `[x][0]` / `{f:x}.f` folding no longer breaks optional-chain, `this` -binding, or assignment-target semantics. [#36730](https://github.com/oven-sh/bun/pull/36730)
- **JS minifier** `delete` on constant-folded import identifiers no longer emits invalid output. [#36740](https://github.com/oven-sh/bun/pull/36740)
- **JS minifier** `!`/ `typeof` folding on array/object/class literals keeps their side effects. [#34254](https://github.com/oven-sh/bun/pull/34254)
- **JS minifier** Non-decimal BigInt literals (`0xffn`, `0o7n`, `0b1n`) are no longer constant-folded using their raw source text. [#34823](https://github.com/oven-sh/bun/pull/34823)
- **JS minifier** Non-ASCII Unicode identifiers survive the bundler's renaming. [#33863](https://github.com/oven-sh/bun/pull/33863)
- **JS minifier** Bare `$` is never picked as a minified name to avoid colliding with jQuery-style globals. [#35668](https://github.com/oven-sh/bun/pull/35668)
- Unused classes containing private fields/methods are now dropped. [#36528](https://github.com/oven-sh/bun/pull/36528) [#35472](https://github.com/oven-sh/bun/pull/35472) [#35957](https://github.com/oven-sh/bun/pull/35957)
- Classes with side-effectful computed keys are no longer incorrectly tree-shaken. [#36528](https://github.com/oven-sh/bun/pull/36528) [#35472](https://github.com/oven-sh/bun/pull/35472) [#35957](https://github.com/oven-sh/bun/pull/35957)
- **TypeScript parser** ASI applies after contextual keywords before a newline. [#34258](https://github.com/oven-sh/bun/pull/34258)
- **TypeScript parser** Block-scoped `enum` lowers with `let` instead of `var` [#34249](https://github.com/oven-sh/bun/pull/34249)
- **TypeScript parser** `enum` / `namespace` bodies reject stray `yield` / `await` / `this` / `return` [#34250](https://github.com/oven-sh/bun/pull/34250)
- **TypeScript parser** Optional tuple labels that are type-position keywords parse. [#34248](https://github.com/oven-sh/bun/pull/34248)
- **TypeScript parser** `async as T` / `async satisfies T` parse as casts, not arrow functions. [#34246](https://github.com/oven-sh/bun/pull/34246)
- **TypeScript parser** Standard decorator grammar accepts `!`, `#private`, and `export @dec` forms. [#34245](https://github.com/oven-sh/bun/pull/34245)
- **TypeScript parser** Type-argument lists in expression position require a bare `>` to close. [#34224](https://github.com/oven-sh/bun/pull/34224)
- **Printer & lexer**: `export {}` is no longer emitted inside unbraced `if` / `while` / `do` bodies (a syntax error).
- **Printer & lexer**: the JSON printer emits valid escapes for the BEL and VT control characters (`U+0007`, `U+000B`).
- **Printer & lexer**: overflowing or unterminated `\u{…}` escapes are rejected at parse time.
- `@supports` conditions containing newlines keep correct sourcemap line/column tracking.
- url() `#fragment` suffixes (and `?query` on the file-loader path) survive asset rewriting.
- color-mix() rejects out-of-range percentages.
- The CSS tokenizer handles non-UTF-8 bytes.
- Minified token lists keep adjacent '/' and '\*' delims separated.
- Fixed sourcemap column drift and unsorted `mappings` segments on generated lines crossing two or more placeholder substitutions (multiple file-loader imports, or an entry chunk importing from multiple shared chunks). [#33860](https://github.com/oven-sh/bun/pull/33860)
- **Build pipeline**: `onBeforeParse` plugin externals are GC-rooted for the lifetime of the build.
- **Build pipeline**: `--no-macros` propagates to every parse task.
- **Build pipeline**: an unterminated `[placeholder` in `--entry-naming` / `--chunk-naming` reports an error.
- **Build pipeline**: a module that fails to print now fails the build instead of emitting truncated output.
- `bun build --compile --target=bun-darwin-*` validates that `--compile-executable-path` points at a well-formed Mach-O binary and exits 1 with `InvalidObject` otherwise, as malformed ELF and PE bases already did with `InvalidElfFile` and `InvalidPEFile`.
- Fixed `--compile --bytecode --format=esm --splitting` builds in which an import from another chunk resolved to a Node builtin instead of the chunk's export. It happened when a `require()` d file in that chunk had a tree-shaken import with the same name as the export (`import { rm } from "fs/promises"`). Minified builds hit this whenever the minifier reused such a name. [#37619](https://github.com/oven-sh/bun/pull/37619)
- Fixed `--compile --bytecode --format=esm` binaries breaking on imports and re-exports of modules left outside the bundle. Examples: `export * as ns from "node:fs"` threw `Cannot access 'ns' before initialization`; `export { readFileSync as rfs } from "node:fs"` left `rfs` as `undefined`; `import { join } from "node:path"` in a file that also assigns `module.exports` gave `join is not defined`. These builds now behave the same as without `--bytecode`. [#37677](https://github.com/oven-sh/bun/pull/37677)
- `--public-path` was composing with the importer-relative chunk path instead of the outdir-relative one, so any chunk in a subdirectory emitted a URL like `https://cdn.example/app/../../chunk.js` that escapes the prefix. Code-split apps deployed under a CDN prefix now resolve their chunks and file-loader assets correctly. [#33385](https://github.com/oven-sh/bun/pull/33385)
- Fixed concurrent `bun build` processes (as spawned by concurrently or turbo) non-deterministically stalling for ~10 seconds instead of ~10 ms; a thread-pool shutdown race left a worker sleeping until its idle timeout. [#32494](https://github.com/oven-sh/bun/pull/32494)
- `bun build --splitting` with `--format=cjs` or `--format=iife` now fails with a clear "only supported with esm" error instead of panicking; `Bun.build()` returns the same as a catchable build error.
- Bundled CommonJS dependencies that set `module.exports = null` (or any primitive) no longer crash at load time.
- Top-level `arguments` in bundled CommonJS resolves to the module wrapper's arguments instead of throwing `ReferenceError` in ESM output.
- Fixed a local variable named `jsx`, `jsxDEV`, `jsxs`, `Fragment`, or `createElement` in the same scope as the first JSX element aliasing the automatic JSX runtime import and causing `TypeError: jsx is not a function` at runtime. [#32593](https://github.com/oven-sh/bun/pull/32593)
- Fixed decorator lowering for class fields whose key is a string literal containing non-ASCII characters; the decorated field previously landed on a garbage property name at runtime. [#32713](https://github.com/oven-sh/bun/pull/32713)
- **CSS**: `calc()` results of NaN serialize as `0` per CSS Values 4 instead of the invalid literal `NaNpx`. [#33147](https://github.com/oven-sh/bun/pull/33147)
- **CSS**: `:nth-child(... of <list>)` and `:has()` with an empty selector list are now rejected as invalid instead of emitted. [#33151](https://github.com/oven-sh/bun/pull/33151)
- **CSS**: CSS-modules `animation` / `animation-name` now scope the referenced `@keyframes` name to the same hash the definition receives. [#33322](https://github.com/oven-sh/bun/pull/33322)
- Fixed repeated in-process `Bun.build()` calls failing with `EBADF` when a package is reached through a symlinked `node_modules` entry; the parse task was closing a file descriptor it had borrowed from the resolver cache. [#33102](https://github.com/oven-sh/bun/pull/33102)

### Other Node.js fixes

- `bun --bun jest` runs. `require("module").prototype` is non-enumerable, as in Node, so jest no longer fails with "Attempted to assign to readonly property". [#39535](https://github.com/oven-sh/bun/pull/39535)
- A TCP peer reset behind unread data is reported as `ECONNRESET`, not a clean `end`. [#39600](https://github.com/oven-sh/bun/pull/39600)
- On macOS, a peer reset on a paused socket is reported instead of leaving the socket open forever. [#39610](https://github.com/oven-sh/bun/pull/39610)
- `node:http` no longer writes `Connection: close` into the body on `res.destroy()`. [#39364](https://github.com/oven-sh/bun/pull/39364)
- `node:http` no longer appends `Content-Length: 0` to a close-delimited streamed response. [#38701](https://github.com/oven-sh/bun/pull/38701)
- On Windows, `fs.writeFile(path, data, { flag: "a+" })` appends instead of overwriting from offset 0. [#39355](https://github.com/oven-sh/bun/pull/39355)
- **N-API**: return status codes on error paths now align with Node across a set of entry points — NULL env/out-params return `napi_invalid_arg`, calls with a pending exception return `napi_pending_exception` on the entry points Node gates, and `napi_define_properties` / `freeze` / `seal` / `type_tag` /element accessors coerce primitives via `ToObject` like Node.
- `napi_get_all_property_names` `napi_key_*` filters (own-only skip\_strings/skip\_symbols, and writable/configurable on Proxy and String wrappers) match Node. [#34134](https://github.com/oven-sh/bun/pull/34134) [#34129](https://github.com/oven-sh/bun/pull/34129) [#34144](https://github.com/oven-sh/bun/pull/34144) [#34143](https://github.com/oven-sh/bun/pull/34143) [#34142](https://github.com/oven-sh/bun/pull/34142) [#34126](https://github.com/oven-sh/bun/pull/34126) [#34479](https://github.com/oven-sh/bun/pull/34479)
- `napi_get_all_property_names` handles accessor properties under every `napi_key_*` filter.
- **N-API**: threadsafe functions stay alive after their env is torn down.
- **N-API**: threadsafe functions are finalized when the last ref is released after abort.
- **N-API**: threadsafe functions receive `NULL` in `call_js` when no JS function was supplied.
- **N-API**: pending exceptions are cleared between finalizers during environment cleanup.
- **N-API**: Async cleanup hook handles stay alive until the addon removes them.
- **V8 C++ API**: `ReturnValue` contents stay alive across `HandleScope` pops. [#37159](https://github.com/oven-sh/bun/pull/37159)
- **V8 C++ API**: `v8::Value::IsArray` matches V8's `JSArray` type check instead of the spec `IsArray` operation, so Proxy-wrapped arrays are no longer treated as arrays and revoked proxies no longer throw. [#34149](https://github.com/oven-sh/bun/pull/34149)
- **[`node:http2`](https://nodejs.org/api/http2.html)**: frame writing over JS-backed transport sockets, padded `DATA` frames, re-entrant `streamStart` callbacks, and inbound `HEADERS` parsing are hardened.
- **[`node:http2`](https://nodejs.org/api/http2.html)**: corked frames stay scoped to their own session.
- Destroying a session during the writable flush loop is handled.
- **[`node:http`](https://nodejs.org/api/http.html)**: chunked responses to HTTP/1.0 clients are well-formed.
- **[`node:http`](https://nodejs.org/api/http.html)**: resizable `ArrayBuffer` s write correctly under backpressure.
- **[`node:http`](https://nodejs.org/api/http.html)**: `'error'` `ECONNRESET` and `'close'` ordering on aborted request bodies matches Node.
- **[`node:http`](https://nodejs.org/api/http.html)**: `req.socket` emits `'pause'` when the body buffer fills.
- **[`node:http`](https://nodejs.org/api/http.html)**: request lines are validated strictly and rejected via `clientError`.
- **[`node:http`](https://nodejs.org/api/http.html)**: already-written response bytes are drained when the client half-closes. [#35034](https://github.com/oven-sh/bun/pull/35034)
- **[`node:http`](https://nodejs.org/api/http.html)**: Unread request body is drained after `res.socket.end()`. [#34356](https://github.com/oven-sh/bun/pull/34356)
- **[`node:http`](https://nodejs.org/api/http.html)**: Upgrade sockets emit `'close'` when the WebSocket peer disconnects. [#32737](https://github.com/oven-sh/bun/pull/32737)
- **[`node:http`](https://nodejs.org/api/http.html)**: `process.binding('http_parser')` exposes the `M-SEARCH` method token. [#35277](https://github.com/oven-sh/bun/pull/35277)
- **[`node:tls`](https://nodejs.org/api/tls.html)**: `getSession()` / `getTLSTicket()` return the resumable ticket-bearing session on TLS 1.3. [#36475](https://github.com/oven-sh/bun/pull/36475) [#32630](https://github.com/oven-sh/bun/pull/32630)
- **[`node:tls`](https://nodejs.org/api/tls.html)**: error routing, `manualStart` reads, handshake timeout, and `setSecureContext` edge cases are fixed. [#35006](https://github.com/oven-sh/bun/pull/35006) [#32630](https://github.com/oven-sh/bun/pull/32630)
- **[`node:fs`](https://nodejs.org/api/fs.html)**: `WriteStream` no longer closes its fd before an in-flight write completes. [#34803](https://github.com/oven-sh/bun/pull/34803)
- **[`node:fs`](https://nodejs.org/api/fs.html)**: `WriteStream.write()` after `destroy()` fails with `ERR_STREAM_DESTROYED` on the fast path. [#34267](https://github.com/oven-sh/bun/pull/34267)
- **[`node:fs`](https://nodejs.org/api/fs.html)**: `ReadStream` no longer leaks its fd on destroy with `{ start, autoClose }`. [#30920](https://github.com/oven-sh/bun/pull/30920)
- **[`node:fs`](https://nodejs.org/api/fs.html)**: `watchFile` no longer fires queued callbacks after close. [#36926](https://github.com/oven-sh/bun/pull/36926)
- **[`node:fs`](https://nodejs.org/api/fs.html)**: Recursive `fs.watch` inotify subtree failures surface as `'error'` events. [#36415](https://github.com/oven-sh/bun/pull/36415)
- **[`node:fs`](https://nodejs.org/api/fs.html)**: `fs.close(0/1/2)` actually closes the standard descriptors. [#33561](https://github.com/oven-sh/bun/pull/33561)
- **[`node:fs`](https://nodejs.org/api/fs.html)**: `mkdtemp()` honors `encoding`. [#33844](https://github.com/oven-sh/bun/pull/33844)
- **[`node:fs`](https://nodejs.org/api/fs.html)**: `appendFile` honors explicit `flag: 'w'`. [#36553](https://github.com/oven-sh/bun/pull/36553)
- **[`node:fs`](https://nodejs.org/api/fs.html)**: Non-bigint `statfs` no longer truncates to i32. [#36503](https://github.com/oven-sh/bun/pull/36503)
- **[`node:fs`](https://nodejs.org/api/fs.html)**: `BigIntStats` returns correct negative nanosecond values for pre-epoch times. [#36187](https://github.com/oven-sh/bun/pull/36187)
- **[`node:fs`](https://nodejs.org/api/fs.html)**: `utimes` handles negative fractional string timestamps. [#34701](https://github.com/oven-sh/bun/pull/34701)
- **[`node:fs`](https://nodejs.org/api/fs.html)**: `promises.glob()` / `promises.watch()` validation and event prototypes match Node. [#34196](https://github.com/oven-sh/bun/pull/34196) [#34279](https://github.com/oven-sh/bun/pull/34279)
- `Readable#pause()` is a no-op on already-destroyed streams (matching Node's post-pipe flow state). [#33467](https://github.com/oven-sh/bun/pull/33467) [#34593](https://github.com/oven-sh/bun/pull/34593) [#34025](https://github.com/oven-sh/bun/pull/34025) [#34031](https://github.com/oven-sh/bun/pull/34031) [#37183](https://github.com/oven-sh/bun/pull/37183) [#32627](https://github.com/oven-sh/bun/pull/32627)
- **[`node:events`](https://nodejs.org/api/events.html)**: single listeners are stored bare with copy-on-write arrays (matching Node's internal shape).
- **[`node:events`](https://nodejs.org/api/events.html)**: `addAbortListener` fires even when another listener calls `stopImmediatePropagation`.
- **[`node:events`](https://nodejs.org/api/events.html)**: `EventEmitter.listenerCount()` validates its emitter argument.
- **[`node:events`](https://nodejs.org/api/events.html)**: a `ReferenceError` in `listenerCount` is fixed.
- **[`process`](https://nodejs.org/api/process.html)**: `'beforeExit'` no longer emits after a fatal uncaught exception. [#34639](https://github.com/oven-sh/bun/pull/34639)
- **[`process`](https://nodejs.org/api/process.html)**: `reallyExit()` no longer emits `'exit'` listeners. [#34997](https://github.com/oven-sh/bun/pull/34997)
- **[`process`](https://nodejs.org/api/process.html)**: Errors thrown in `beforeExit` / `exit` listeners route to `'uncaughtException'`. [#33466](https://github.com/oven-sh/bun/pull/33466)
- **[`process`](https://nodejs.org/api/process.html)**: Throwing `'data'` listeners on stdin no longer destroy stdin. [#34019](https://github.com/oven-sh/bun/pull/34019)
- **[`process`](https://nodejs.org/api/process.html)**: File-backed stdout/stderr can be written after `end()`. [#33618](https://github.com/oven-sh/bun/pull/33618)
- **[`process`](https://nodejs.org/api/process.html)**: Piped stdout/stderr correctly errors on write-after-end. [#33557](https://github.com/oven-sh/bun/pull/33557)
- **Module resolution**: running Bun as `node` no longer auto-loads `.env` files.
- **Module resolution**: wildcard `exports` / `imports` targets auto-resolve extensions.
- **Module resolution**: `"."` and `".."` specifiers are treated as directories.
- **Module resolution**: `Module._nodeModulePaths` strips trailing separators.
- **Module resolution**: `module._resolveFilename` validates its argument.
- **[`node:buffer`](https://nodejs.org/api/buffer.html)**: `toString` / `write` handle buffers of `MAX_LENGTH` bytes.
- **[`node:buffer`](https://nodejs.org/api/buffer.html)**: `indexOf` / `lastIndexOf` with a negative offset and a Buffer (not string) needle under `ucs2` / `utf16le` wraps against the raw byte length as Node does.
- **[`node:buffer`](https://nodejs.org/api/buffer.html)**: the internal `<encoding>Slice` / `<encoding>Write` bindings match Node's semantics.
- **[`node:dns`](https://nodejs.org/api/dns.html)**: pending queries always time out.
- **[`node:dns`](https://nodejs.org/api/dns.html)**: `resolve` throws `ERR_INVALID_ARG_TYPE` for undefined `rrtype`.
- **[`node:dns`](https://nodejs.org/api/dns.html)**: `Resolver` / `setServers` / `lookupService` validation matches Node.
- **[`node:vm`](https://nodejs.org/api/vm.html)**: property definition in sandboxed contexts crash is fixed.
- **[`node:vm`](https://nodejs.org/api/vm.html)**: `createContext` throws when a context option getter throws.
- `Error.captureStackTrace` installs `.stack` as non-enumerable (matching V8). [#34259](https://github.com/oven-sh/bun/pull/34259)
- `Error.stackTraceLimit` stays in sync with the limit actually used for captures. [#34263](https://github.com/oven-sh/bun/pull/34263)
- `assert.deepEqual` throws `TypeError` on detached `ArrayBuffer` s. [#34587](https://github.com/oven-sh/bun/pull/34587)
- **[`node:worker_threads`](https://nodejs.org/api/worker_threads.html)**: workers no longer hang when captured stdout/stderr is never consumed. [#34338](https://github.com/oven-sh/bun/pull/34338)
- **[`node:perf_hooks`](https://nodejs.org/api/perf_hooks.html)**: exports the real `performance` object with correct entry prototypes. [#34518](https://github.com/oven-sh/bun/pull/34518)
- **[`node:tty`](https://nodejs.org/api/tty.html)**: raw mode is tracked per-handle instead of per-process. [#33527](https://github.com/oven-sh/bun/pull/33527)
- **[`node:timers`](https://nodejs.org/api/timers.html)**: timers reschedule when `_idleStart` is written, matching Node's internals. [#36859](https://github.com/oven-sh/bun/pull/36859)
- **[`node:string_decoder`](https://nodejs.org/api/string_decoder.html)**: state resets correctly after completing a buffered partial character. [#33703](https://github.com/oven-sh/bun/pull/33703)
- **[`node:os`](https://nodejs.org/api/os.html)**: fixed IPv6 address, netmask, and CIDR formatting in `os.networkInterfaces()`. [#32300](https://github.com/oven-sh/bun/pull/32300)
- **[`node:dgram`](https://nodejs.org/api/dgram.html)**: compatibility improved to match Node v26.3.0 behavior. [#32625](https://github.com/oven-sh/bun/pull/32625)
- `createTagStore()` capacity is now coerced like Node (double→int→size\_t, so `-1` means unlimited and `0` caches nothing). [#34454](https://github.com/oven-sh/bun/pull/34454)
- Explicit- `undefined` option rejection matches Node's arity-based validation. [#34450](https://github.com/oven-sh/bun/pull/34450)
- **[`node:http2`](https://nodejs.org/api/http2.html)**: `request()` no longer sends headers out of order when an options getter calls `request()` again; options are now copied before encoding. [#31323](https://github.com/oven-sh/bun/pull/31323)
- `node:vm` `SyntheticModule` works together with `node:async_hooks`, fixing `react-email` 's preview server.
- `node:https` now honors `ca` and other TLS options passed via the `agent`. [#25937](https://github.com/oven-sh/bun/pull/25937)
- Passing a custom `lookup` function to `node:http` / `node:https` no longer breaks SNI and certificate validation, fixing axios with custom DNS resolution. [#25937](https://github.com/oven-sh/bun/pull/25937)
- `node:http` server now delivers data pipelined immediately after a CONNECT request to the `'connect'` event's `head` parameter, fixing CONNECT tunneling from Cloudflare's workerd. [#25938](https://github.com/oven-sh/bun/pull/25938)
- `fs.stat` on Linux now works inside older Docker containers and locked-down sandboxes that previously blocked the underlying system call. [#28825](https://github.com/oven-sh/bun/pull/28825)
- `fs.cp` / `fs.cpSync` on Linux and FreeBSD now correctly preserve symlink targets instead of creating links pointing back at the source symlink's own path. [#30073](https://github.com/oven-sh/bun/pull/30073)
- `fs.statfs()` on Intel macOS no longer returns field-shifted garbage (`bsize: 0`), fixing disk-space checks in tools like Unity Hub. [#31139](https://github.com/oven-sh/bun/pull/31139)
- `os.freemem()` on Linux now reports the memory that is actually available, matching Node.js, instead of a much smaller number that ignored disk cache the kernel can free on demand. [#29080](https://github.com/oven-sh/bun/pull/29080)
- `process.ppid` is now a live getter, so the orphan-detection pattern `if (process.ppid === 1) process.exit()` works after the parent dies. [#29171](https://github.com/oven-sh/bun/pull/29171)
- Unix domain socket binding now returns `EADDRINUSE` instead of silently unlinking an existing socket and stealing the address. [#28798](https://github.com/oven-sh/bun/pull/28798)
- The Unix domain socket `.sock` file is cleaned up on `close()`. [#28798](https://github.com/oven-sh/bun/pull/28798)
- `Buffer.copyBytesFrom(view)` no longer returns wrong bytes (or throws a spurious out-of-memory error) when the view has a non-zero `byteOffset`. [#30132](https://github.com/oven-sh/bun/pull/30132)
- Dynamic `import()` of unknown `node:` modules inside CommonJS is now deferred to runtime instead of failing at transpile time, unblocking Next.js + turbopack + Better Auth probing for `node:sqlite`. [#26981](https://github.com/oven-sh/bun/pull/26981)
- **[`node:crypto`](https://nodejs.org/api/crypto.html)**: `createCipheriv()` and `createDecipheriv()` reject a GCM IV longer than 128 bytes with `ERR_CRYPTO_INVALID_IV`, as Node does, instead of producing ciphertext Node cannot decrypt. [#34092](https://github.com/oven-sh/bun/pull/34092)
- **[`node:fs`](https://nodejs.org/api/fs.html)**: `fs.mkdtemp("")` in its sync, callback, and promise forms fails with `EINVAL` like Node instead of creating a six-character directory in the working directory. [#34908](https://github.com/oven-sh/bun/pull/34908)
- **[`node:fs`](https://nodejs.org/api/fs.html)**: `fs.createWriteStream()` no longer overwrites the start of the file with the unwritten tail of a short write; it retries at the current offset, and a write that then fails (for example `EFBIG`) emits `'error'` instead of `'finish'`. [#36135](https://github.com/oven-sh/bun/pull/36135)
- **[`node:fs`](https://nodejs.org/api/fs.html)**: `fs.write`, `fs.writev`, and `fs.readv` ignore a `position` that is not a safe integer (`NaN`, `Infinity`, `1.5`, a BigInt) and use the current offset, matching Node. [#36135](https://github.com/oven-sh/bun/pull/36135)
- **[`node:fs`](https://nodejs.org/api/fs.html)**: `fs.write` and `fs.writeSync` throw `ERR_OUT_OF_RANGE` for an `offset` past the end of the buffer when no `length` is passed, instead of writing 0 bytes. [#37632](https://github.com/oven-sh/bun/pull/37632)
- **[`node:dns`](https://nodejs.org/api/dns.html)**: on Linux, `dns.lookup()` now uses the system resolver (`getaddrinfo`) like Node. Before, it used c-ares, the resolver library Bun bundles. c-ares reads `/etc/resolv.conf` itself. So on hosts using systemd-resolved or a split-DNS VPN, names that Node resolved failed in Bun. `dns.promises.lookup()` and `net.connect()` by hostname are covered. `Bun.dns.lookup()` still defaults to c-ares on Linux. [#37383](https://github.com/oven-sh/bun/pull/37383)
- **[`node:dns`](https://nodejs.org/api/dns.html)**: `dns.lookup()` and `dns.promises.lookup()` treat a `null` `hints`, `all`, or `verbatim` option as unset, as Node does, instead of throwing `ERR_INVALID_ARG_TYPE`. [#37319](https://github.com/oven-sh/bun/pull/37319)
- **[`node:dns`](https://nodejs.org/api/dns.html)**: `dns.lookupService()` resolves IPv4-mapped IPv6 addresses such as `::ffff:127.0.0.1` instead of failing with `ENOTFOUND`. [#37490](https://github.com/oven-sh/bun/pull/37490)
- **[`process`](https://nodejs.org/api/process.html)**: the default `'warning'` printer is registered as a listener at startup, as in Node, so `process.removeAllListeners("warning")` silences it and `process.emit("warning", err)` prints. [#37344](https://github.com/oven-sh/bun/pull/37344)
- **[`node:http2`](https://nodejs.org/api/http2.html)**: `session.setNextStreamID(0.5)` on a fresh client leaves the next stream ID at `1`, as in Node, instead of overflowing.
- **[`node:http2`](https://nodejs.org/api/http2.html)**: `session.state.nextStreamID` no longer reports `0` when a server session reaches `2 ** 32 - 1`.
- **[`node:http2`](https://nodejs.org/api/http2.html)**: sessions now have `goawayCode` and `goawayLastStreamID`, set from a received `GOAWAY` before `'goaway'` is emitted and kept after the session is destroyed. They were `undefined`, so a `goawayCode !== NGHTTP2_NO_ERROR` check treated every session as errored. [#37550](https://github.com/oven-sh/bun/pull/37550)
- **[`node:http2`](https://nodejs.org/api/http2.html)**: `pushStream()` now sends an array header value as one field per element. So `"set-cookie": ["c1=1", "c2=2"]` arrives as two cookies rather than one comma-joined value. An array (or a duplicate) for a single-value header such as `content-type` throws `ERR_HTTP2_HEADER_SINGLE_VALUE`. Both match Node. [#37579](https://github.com/oven-sh/bun/pull/37579)
- **[`node:net`](https://nodejs.org/api/net.html)**: on Linux, an `allowHalfOpen` socket (which every `node:http` server socket is) whose `AF_UNIX` peer closes first emits `'end'` and closes. A paused socket keeps the bytes it received before the peer closed until `resume()`, then ends and closes.
- **`util.inspect.custom` on web classes**: assigning `Symbol.for("nodejs.util.inspect.custom")` on a `URL` instance in strict-mode code no longer throws `TypeError: Attempted to assign to readonly property`. That broke SvelteKit SSR. The prototype property is now writable on `URL`, `URLSearchParams`, `CryptoKey`, `BroadcastChannel`, and the web stream classes. This matches Node. [#38106](https://github.com/oven-sh/bun/pull/38106)
- **[`node:worker_threads`](https://nodejs.org/api/worker_threads.html)**: a worker's `process.stdout` and `process.stderr` output now all reaches the parent when the worker exits synchronously (`process.exit()`, an uncaught exception, or an unhandled rejection). Previously everything after the first write was dropped. `worker.terminate()` still does not flush, as in Node. [#38229](https://github.com/oven-sh/bun/pull/38229)
- **[`node:worker_threads`](https://nodejs.org/api/worker_threads.html)**: `process.exitCode` set inside an `'exit'` listener is now honored, in workers and on the main thread. [#38229](https://github.com/oven-sh/bun/pull/38229)
- **[`node:net`](https://nodejs.org/api/net.html)**: asynchronous `connect` failures now carry Node's ` - Local (address:port)` suffix when the local address is known, so `connect ECONNREFUSED 127.0.0.1:12399 - Local (127.0.0.1:12400)` reads the same as in Node. [#34523](https://github.com/oven-sh/bun/pull/34523)
- **[`node:console`](https://nodejs.org/api/console.html)**: `new Console({ inspectOptions })` now honors a `Map` keyed by stream, so stdout and stderr can be formatted differently; previously the `Map` was treated as a plain options object and per-stream colors did nothing. [#34523](https://github.com/oven-sh/bun/pull/34523)
- **[`node:v8`](https://nodejs.org/api/v8.html)**: `v8.setFlagsFromString()` now rejects a non-string argument with `ERR_INVALID_ARG_TYPE`, as Node does, before throwing `ERR_NOT_IMPLEMENTED`. [#34523](https://github.com/oven-sh/bun/pull/34523)
- `v8.startupSnapshot.isBuildingSnapshot()` now returns `false` instead of throwing, unblocking bson (and therefore mongodb and @keyv/mongo) which calls it at import time. [#32502](https://github.com/oven-sh/bun/pull/32502)
- `process.stdin` in paused mode no longer drops the final partial chunk at EOF: `read(n)` returns the buffered remainder once the stream ends, and a bare `process.stdin.read()` with no `'readable'` listener now delivers data. [#33123](https://github.com/oven-sh/bun/pull/33123)
- `tty.WriteStream#getColorDepth()` no longer reports 256 colors for every terminal; TMUX and `xterm-kitty` now report 24-bit, GitHub Actions and CircleCI report truecolor, and empty `NO_COLOR` is ignored per no-color.org. [#33124](https://github.com/oven-sh/bun/pull/33124)
- `fs.readdir(path, { recursive: true })` no longer silently drops entries whose relative path approached `MAX_PATH_BYTES` (~1022 bytes on macOS, ~4094 on Linux); long paths now spill to a heap buffer.
- `fs.promises.readdir(path, { recursive: true })` completes when multiple per-directory subtasks fail.
- `fs.open` / `openSync` / `readFile` / `writeFile` now accept a numeric `flags` argument that arrived as a double (e.g. read from a `Float64Array`), fixing Go programs compiled with `GOOS=js GOARCH=wasm` whose syscall bridge delivers every argument that way. [#32506](https://github.com/oven-sh/bun/pull/32506)
- `fs.open()` now validates flag and mode strings strictly, rejecting uppercase flags like `"W"` and non-octal mode strings with `ERR_INVALID_ARG_VALUE` instead of silently opening the file. [#32966](https://github.com/oven-sh/bun/pull/32966)
- `node:fs` errors now report Node's platform-independent operation name in `error.syscall` (`"stat"`, `"lstat"`, `"utime"`) instead of the raw syscall Bun issued (`"statx"`, `"utimensat"`), so packages that branch on `err.syscall` match correctly. [#32964](https://github.com/oven-sh/bun/pull/32964)
- Aborted `node:fs` and `node:fs/promises` operations now reject with an `AbortError` whose `code` is `'ABORT_ERR'`, matching Node.js.
- On Linux, `fs.watch()` now emits both `rename` events with the correct basename when the watched path itself is deleted or moved, matching Node.js. [#32962](https://github.com/oven-sh/bun/pull/32962)
- `node:net` 's `autoSelectFamily` (Happy Eyeballs) path no longer throws an uncaught `TypeError: null is not an object` when `connect()` fails synchronously, common on macOS when DNS returns unroutable IPv6 addresses. [#32660](https://github.com/oven-sh/bun/pull/32660)
- `node:http` tolerates cleared `onwritable` / `ondata` / `onabort` callback slots on the socket.
- `socket.connect()` in `node:net` on a socket that already has a live native handle is handled.
- TLS handshake failures discovered from a write issued before `secureConnect` (as `https.request` does) now report the handshake's own error code instead of being misreported as `ERR_TLS_CERT_ALTNAME_INVALID`. [#33390](https://github.com/oven-sh/bun/pull/33390)
- `X509Certificate.checkHost()` now returns the subject name that matched (e.g. `*.wildcard.example.com`) instead of echoing back the hostname you passed in. [#33299](https://github.com/oven-sh/bun/pull/33299)
- `crypto.createHash()` and `crypto.hash()` now accept the hyphenated and mixed-case algorithm aliases Node.js accepts (`"shake-128"`, `"SHAKE256"`, `"BLAKE2s256"`). [#32439](https://github.com/oven-sh/bun/pull/32439)
- `crypto.subtle.wrapKey()` with `AES-KW` and `"jwk"` format now pads the serialized JWK to a multiple of 8 bytes; previously it threw `OperationError` for any key whose JWK wasn't already 8-byte-aligned (e.g. HMAC SHA-512). [#32616](https://github.com/oven-sh/bun/pull/32616)
- `cipher.setAAD()` on a non-AEAD cipher such as `aes-128-cbc` throws `ERR_CRYPTO_INVALID_STATE`.
- `crypto.Hmac` 's native `update()` throws `ERR_INVALID_THIS` when called with a wrong receiver.
- Bun's `node:crypto` implementation now includes upstream correctness fixes from Node.js that tighten error handling in low-level cipher and memory-allocation code paths. [#33202](https://github.com/oven-sh/bun/pull/33202)
- `node:zlib` native handle lifecycle crash fixed, including `dictionary` validation in `zlib.deflateSync`.
- `Readable.fromWeb()` no longer reorders chunks when composed with `Readable.toWeb()`; concurrent pump loops on the same reader could interleave and permute the stream. [#33300](https://github.com/oven-sh/bun/pull/33300)
- `child.kill()` now returns `false` when the child has already exited, matching Node.js and making `kill(0)` usable as a liveness probe. [#32877](https://github.com/oven-sh/bun/pull/32877)
- `process.execve()` throws an `ErrnoException` when the underlying syscall fails (`ENOENT`, `EACCES`), and restores file-descriptor flags and the signal mask on failure.
- `process.hrtime([a, b])` coerces tuple elements with `ToNumber` like Node.js.
- `dgram.Socket` methods called after `close()` now throw `ERR_SOCKET_DGRAM_NOT_RUNNING` instead of an uncoded internal `TypeError`. [#33024](https://github.com/oven-sh/bun/pull/33024)
- `dgram.Socket` `[Symbol.asyncDispose]()` on a closed socket resolves instead of rejecting. [#33024](https://github.com/oven-sh/bun/pull/33024)
- `dgram.Socket.prototype.bind()` on an already-bound socket now throws `ERR_SOCKET_ALREADY_BOUND` synchronously instead of emitting an `'error'` event. [#33037](https://github.com/oven-sh/bun/pull/33037)
- `Buffer.alloc(n, pattern, enc)` and `buf.fill(pattern, enc)` now byte-truncate the pattern's encoding when it's longer than the destination. [#33019](https://github.com/oven-sh/bun/pull/33019)
- `Buffer.alloc(n, pattern, enc)` and `buf.fill(pattern, enc)`: lone high surrogates encode as U+FFFD instead of throwing. [#33019](https://github.com/oven-sh/bun/pull/33019)
- `Buffer.prototype.fill` now matches Node's offset/end handling: string offsets on non-string values throw `ERR_INVALID_ARG_TYPE`, an undefined offset ignores end, and a null or empty-string encoding is treated as utf8. [#33033](https://github.com/oven-sh/bun/pull/33033)
- `Buffer.from(arrayBuffer, byteOffset, length)` now clamps negative and NaN lengths to 0 instead of throwing. [#33036](https://github.com/oven-sh/bun/pull/33036)
- `Buffer.from(arrayBuffer, byteOffset, length)` honors an explicit length on resizable ArrayBuffers instead of always returning a length-tracking view. [#33036](https://github.com/oven-sh/bun/pull/33036)
- `structuredClone`, worker `postMessage`, and the `Worker` `transferList` option now validate the transfer list per WebIDL before serializing, throwing `TypeError` on invalid entries instead of silently detaching the valid buffers. [#32809](https://github.com/oven-sh/bun/pull/32809)
- `path.normalize()` and `path.join()` now correctly handle a first segment ending in `..` (such as `"bb../../x"`), matching Node.js. [#32783](https://github.com/oven-sh/bun/pull/32783)
- `new StringDecoder(enc).encoding` and `Readable#readableEncoding` now normalize all UTF-16LE aliases (`ucs2`, `ucs-2`, `utf-16le`) to `"utf16le"`. [#33038](https://github.com/oven-sh/bun/pull/33038)
- `napi_is_arraybuffer` now returns `false` for `SharedArrayBuffer`, matching Node.js. [#32629](https://github.com/oven-sh/bun/pull/32629)
- `navigator.userAgent`, `navigator.platform`, and `navigator.hardwareConcurrency` are now read-only accessors instead of writable data properties, matching Node.js and browsers. [#32440](https://github.com/oven-sh/bun/pull/32440)
- `queueMicrotask.length` now reports 1 instead of 2, matching the HTML spec, browsers, and Node.js. [#32419](https://github.com/oven-sh/bun/pull/32419)
- Calling `socket.destroySoon()` or `socket.destroy()` on a TLS socket after a large write could drop the tail of the stream while still signaling a clean close, so the receiver saw a short read with no error. Pending encrypted bytes are now flushed before the socket closes. [#32719](https://github.com/oven-sh/bun/pull/32719)
- `fs.write`, `fs.writeSync`, and `filehandle.write` now apply the encoding argument when writing a string. Previously the encoding was parsed and then ignored, so `fs.writeSync(fd, "abc", 0, "utf16le")` silently wrote UTF-8 bytes. [#32813](https://github.com/oven-sh/bun/pull/32813)
- `fs.writeFile` and `fs.writeFileSync` no longer truncate files opened with a non-truncating flag (`r+`, `rs+`, or numeric `O_RDWR`), which is the documented way to patch a region in place. [#33355](https://github.com/oven-sh/bun/pull/33355)
- `fs.writeFile` and `fs.writeFileSync`: Also fixed: `flag: "a"` on Linux leaving a hole of zeroes before the appended data. [#33355](https://github.com/oven-sh/bun/pull/33355)
- `fs.writeFile` and `fs.writeFileSync`: Also fixed: partial-write failures leaving the old file's stale tail behind the bytes that did land. [#33355](https://github.com/oven-sh/bun/pull/33355)
- `tls.connect({ socket })` and `new TLSSocket(socket)` work when both ends of an in-process `duplexPair()` are wrapped in TLS.
- `socket.end()` sends `close_notify` before FIN so the peer sees a clean shutdown.
- A handshake rejected by certificate verification fails closed on every code path.

### Other package manager fixes

- `bun outdated` and `bun update -i` exit 1 with the error when a manifest cannot be fetched, instead of printing an empty table and exit 0. [#38809](https://github.com/oven-sh/bun/pull/38809)
- Credentials in a registry URL are sent as `Authorization`, whether the URL comes from `--registry`, `BUN_CONFIG_REGISTRY`, `npm_config_registry`, or a bunfig `registry = { url }` object. Bun 1.3 dropped them. [#38796](https://github.com/oven-sh/bun/pull/38796) [#38824](https://github.com/oven-sh/bun/pull/38824)
- A git dependency is cloned into a staging directory and moved into the cache only when the clone completes, so a killed install no longer leaves a half-cloned package that later resolves as valid. [#38269](https://github.com/oven-sh/bun/pull/38269)
- `bun patch` works for git and tarball dependencies. [#38269](https://github.com/oven-sh/bun/pull/38269)
- **`bun pm pack`** now always includes files referenced by `"bin"` and `"directories.bin"` in the tarball even when they aren't listed in `"files"`, matching npm. [#23606](https://github.com/oven-sh/bun/pull/23606)
- **`bun pm pack` and `bun publish`** now re-read `package.json` after `prepublishOnly`, `prepack`, and `prepare` run, so version bumps made by lifecycle scripts land in the tarball filename and registry metadata. [#26267](https://github.com/oven-sh/bun/pull/26267)
- **`.npmrc` parsing** now expands environment variables inside quoted values. [#25518](https://github.com/oven-sh/bun/pull/25518)
- **`.npmrc` parsing** supports npm's `${VAR?}` optional modifier. [#25518](https://github.com/oven-sh/bun/pull/25518)
- **`.npmrc` parsing** reads the `email` field for registries (like Sonatype Nexus) that require it. [#25518](https://github.com/oven-sh/bun/pull/25518)
- **`--frozen-lockfile`** now respects scope-specific registries from `bunfig.toml` when the lockfile entry has an empty registry URL. [#26047](https://github.com/oven-sh/bun/pull/26047)
- **Optional peer dependencies** now resolve to an installed package when one is available instead of being left unresolved, fixing duplicated packages under `node_modules/.bun` in monorepos. [#24272](https://github.com/oven-sh/bun/pull/24272)
- **Lockfile migration** from npm/yarn/pnpm now creates the text-based `bun.lock` instead of the legacy binary `bun.lockb` when migration fails partway through. [#24494](https://github.com/oven-sh/bun/pull/24494)
- **Git dependencies** that point to the same repository via different protocols (`git+ssh://` vs `git+https://`) now resolve correctly. [#24138](https://github.com/oven-sh/bun/pull/24138)
- **Git dependencies**: GitHub URLs with custom protocol prefixes take the faster tarball path instead of a full clone. [#24138](https://github.com/oven-sh/bun/pull/24138)
- **The security scanner** now collects dependencies from all workspace packages, not just the root. [#24942](https://github.com/oven-sh/bun/pull/24942)
- **The security scanner**: every scanner failure path now prints a diagnostic instead of exiting silently with code 1. [#24942](https://github.com/oven-sh/bun/pull/24942)
- **The isolated linker** fails fast on integrity-check failures and error tarball responses.
- **The isolated linker**: Cross-filesystem installs now fall back to copying instead of hardlinking.
- **The isolated linker**: workspace packages get their self-link when they depend on themselves.
- **`bunx @scope/name`** always resolves the scoped package it names.
- Rare crashes in `bun install`, `bun add`, `bun pm ls`, `bun pm patch`, and `bun update --interactive` are fixed, including registry request retries, `.npmrc` `ca` cert handling, local tarball resolution, git specifier parsing, package names, and lifecycle script filtering.
- **Better error messages** when a `file:` dependency points at a missing or stale path: `bun install` now names the offending dependency instead of suggesting you run `bun init`. [#26339](https://github.com/oven-sh/bun/pull/26339)
- `bun init` now falls back to `-y` when stdin isn't a TTY. [#35165](https://github.com/oven-sh/bun/pull/35165)
- `bun update -i` now errors out early (pointing to `bun update` / `bun outdated`) instead of hanging. [#34858](https://github.com/oven-sh/bun/pull/34858)
- **`bun install`** now falls back to copying when hardlinking from the cache fails with `EACCES` / `EPERM`. [#36853](https://github.com/oven-sh/bun/pull/36853)
- **`postinstall`** now runs when Bun auto-injects `node-gyp rebuild` for a package with a `binding.gyp` but no `install` or `preinstall` script; previously the postinstall was silently dropped.
- `bun.lock` no longer keeps packages that are only reachable through an optional peer dependency's resolution slot. [#35681](https://github.com/oven-sh/bun/pull/35681)
- **`bun patch --commit`** now resolves paths correctly when run from inside a workspace package. [#36290](https://github.com/oven-sh/bun/pull/36290)
- Isolated installs no longer re-apply the same patch once per peer-dependency variant. [#33646](https://github.com/oven-sh/bun/pull/33646)
- **`--frozen-lockfile`** no longer spuriously rejects a lockfile when `npm:` aliases place duplicate package names in one tree node. [#36578](https://github.com/oven-sh/bun/pull/36578)
- **`npm:` alias dependencies** whose registry target name collides with a same-named alias elsewhere in the tree now resolve to the package they name instead of being redirected to the alias — fixing Microsoft's recommended TypeScript 6/7 coexistence setup. [#33835](https://github.com/oven-sh/bun/pull/33835)
- A tarball whose download already failed during resolution is no longer re-downloaded (and re-reported) during the install phase. [#34861](https://github.com/oven-sh/bun/pull/34861) [#34103](https://github.com/oven-sh/bun/pull/34103)
- **Nested `bun run --bun`** no longer creates a self-referencing `node` shim symlink and fails with `Too many levels of symbolic links`. [#30713](https://github.com/oven-sh/bun/pull/30713)
- **`Bun.semver.satisfies()`** no longer collapses `^` / `~` /x-range/hyphen ranges to an empty range when a version component is `u64::MAX`. [#34600](https://github.com/oven-sh/bun/pull/34600)
- **`BUN_DISABLE_SLOW_FILESYSTEM_WARNING=1`** suppresses the "slow filesystem detected" notice. [#37000](https://github.com/oven-sh/bun/pull/37000)
- **Git, `github:`, and tarball dependencies**: `bun install` from a lockfile with a cold cache now installs every git dependency that points at a different branch of the same repository (previously it installed one and exited 0). [#35426](https://github.com/oven-sh/bun/pull/35426)
- **Git, `github:`, and tarball dependencies**: a git, `github:`, or tarball dependency that appears both directly and transitively no longer fails with `failed to resolve`. [#35426](https://github.com/oven-sh/bun/pull/35426)
- **Git, `github:`, and tarball dependencies**: `git+file://` dependencies install instead of failing with `no commit matching`. [#35426](https://github.com/oven-sh/bun/pull/35426)
- **`$HOME/.npmrc`** is now read when `XDG_CONFIG_HOME` is set but `$XDG_CONFIG_HOME/.npmrc` does not exist, as on GitHub Actions `ubuntu-latest`. Previously `bun publish` there failed with `missing authentication` and `bun install` ignored the registry configured in `$HOME/.npmrc`. [#36289](https://github.com/oven-sh/bun/pull/36289)
- **`--frozen-lockfile`** no longer fails with `lockfile had changes` on an unchanged `bun.lock` when a root dependency satisfies a bundled package's optional peer (`cdk8s` bundles `follow-redirects`, whose optional peer `debug` is also a root dependency). [#37350](https://github.com/oven-sh/bun/pull/37350)
- **Long version labels** (a tarball or `file:` spec, or a workspace's own version) are handled by the hoisted linker.
- **Long version labels**: a `patchedDependencies` entry keyed by one is applied.
- **Long version labels**: `bun patch` and `bun patch --commit` handle long labels and report an error where the package cannot be patched.
- **`workspaces` entries** whose resolved path is longer than the platform path limit make `bun install` exit 1 with `ENAMETOOLONG`; the same applies to a glob match whose `package.json` path is too long. Over-long glob patterns match or are skipped like any other.

### Bun.serve()

- **`Bun.serve` HEAD and 204 responses** are framed per RFC 9110/9112: HEAD returns the same headers GET would, 204 responses no longer carry `Content-Length: 0`, and static routes with a null-body status no longer put body bytes on the wire. [#32800](https://github.com/oven-sh/bun/pull/32800)
- **`Bun.serve` per-method routes** (`{ GET: handler }`) now answer HEAD requests using the GET handler instead of falling through to the next route or returning 404. [#32822](https://github.com/oven-sh/bun/pull/32822)
- **`Bun.serve` HTML routes in production** now inline `import.meta.env.*` (fixing a runtime `TypeError` in the browser). [#32854](https://github.com/oven-sh/bun/pull/32854)
- **`Bun.serve` HTML routes in production** emit correctly quoted `ETag` and `Cache-Control` headers on bundled assets. [#32854](https://github.com/oven-sh/bun/pull/32854)
- **`Bun.serve` error handler** `error()` is no longer re-invoked after the status line is committed.
- **`Bun.serve` error handler** `null` rejection reasons are passed through verbatim.
- **`Bun.serve` error handler** A streaming body returned from `error()` keeps the request alive.
- **`Bun.serve` error handler** HEAD requests on error paths no longer receive a body.
- **`Bun.serve` error handler** Aborted uploads are handled cleanly while a `req.body.tee()` branch is being read.
- **`Bun.serve` error handler** A stream `cancel()` that throws when a peer aborts a streaming `Response` no longer surfaces as an unhandled rejection.
- **`Bun.serve` error handler** The development error page shows stack traces and source lines again.
- **`Bun.serve()`** `server.stop()` closes idle keep-alive connections.
- **`Bun.serve()`** A handler response with `Connection: close` closes the connection.
- **`Bun.serve()`** `req.url` / `req.headers` remain populated after `server.upgrade()`.
- **`Bun.serve()`** `server.upgrade()` now validates the WebSocket opening handshake before accepting.
- **`Bun.serve()`** `ServerWebSocket.send(blob)` sends the Blob's bytes instead of `"[object Blob]"`
- **`Bun.serve()`** TCP backpressure applies when a handler reads the request body slowly.
- **`Bun.serve()`** FIFO/pipe file bodies stream with chunked encoding instead of `Content-Length: 0`
- **`Bun.serve()`** `ReadableStream` response bodies are cancelled for HEAD requests.
- **`Bun.serve()`** Per- `serverName` SNI TLS entries honor `requestCert` / `rejectUnauthorized`
- **`Bun.serve()`** Routes set to `false` return 404 when no `fetch` handler is configured.
- **`Bun.serve()`** Static routes no longer emit a duplicate `Date` header.
- **`Bun.serve()`** HTTP/3 responses include `Date`.
- **`Bun.serve()`** HTTP/3 responses send `CONNECTION_CLOSE` when an idle connection is stopped abruptly.
- **`Bun.serve()`** Server callbacks are GC-traced instead of strongly rooted.
- **`Bun.serve()`**: returning a `Response` whose body was already used, or whose status is outside 100–999 (including `Response.error()`), now routes through the `error()` handler instead of sending an empty 200 or a malformed `HTTP/1.1 0` status line. [#33118](https://github.com/oven-sh/bun/pull/33118) [#33400](https://github.com/oven-sh/bun/pull/33400)
- **`Bun.serve()`**: static routes keep their `Content-Type` when the same `Response` is registered on multiple paths or after `reload()`. [#33404](https://github.com/oven-sh/bun/pull/33404)
- `Bun.serve` now prints the "Expected a Response object, but received …" diagnostic when a synchronous `fetch` handler returns a non-Response value, matching what the async path already did. [#33120](https://github.com/oven-sh/bun/pull/33120)
- `Bun.serve()` and `Bun.listen()` now throw when `epoll_ctl(EPOLL_CTL_ADD)` fails (e.g. `fs.epoll.max_user_watches` exhausted) instead of returning a server that silently never accepts connections. [#32706](https://github.com/oven-sh/bun/pull/32706)
- `Bun.serve()` and `Bun.listen()`: Accepted sockets that fail registration are now closed so peers see RST instead of a hung connection. [#32706](https://github.com/oven-sh/bun/pull/32706)
- **`Bun.serve()` on Linux**: now sets [`TCP_DEFER_ACCEPT`](https://github.com/oven-sh/bun/pull/28617) (and `SO_ACCEPTFILTER` on FreeBSD), letting the kernel hold new connections until data arrives. This collapses an extra epoll round-trip per accepted connection.
- **`Bun.serve`** caps chunk-extension bytes per chunk and responds `413`, matching `node:http` and llhttp.
- **`Bun.serve`** rejects a `Transfer-Encoding` header naming any coding other than a single trailing `chunked` with `400 Bad Request`.
- **`Bun.serve`** answers an HTTP/1.0 request that carries a `Transfer-Encoding` header with `400 Bad Request`, per RFC 9112. `node:http` still accepts the request and then closes the connection, as Node does.
- **`Bun.serve` WebSocket `publish()`** now delivers to subscribers when called from a socket that has never itself subscribed. [#32879](https://github.com/oven-sh/bun/pull/32879)
- **`Bun.serve` WebSocket `publish()`**: messages queued in the same tick are delivered before a subscriber's last `unsubscribe()` frees it. [#32852](https://github.com/oven-sh/bun/pull/32852)
- **`server.publish()` and `ws.publish()`** now return `0` (dropped) or `-1` (backpressure) when subscribers are over their buffer limit, honoring the same contract as `ws.send()`. [#32889](https://github.com/oven-sh/bun/pull/32889)
- **`ServerWebSocket.cork(callback)`** now passes the WebSocket as the callback's first argument, as documented; previously the argument was `undefined`. [#32438](https://github.com/oven-sh/bun/pull/32438)
- `ServerWebSocket` `subscribe()` / `unsubscribe()` return `false` on a closed socket instead of `true`. [#36930](https://github.com/oven-sh/bun/pull/36930) [#36790](https://github.com/oven-sh/bun/pull/36790) [#35236](https://github.com/oven-sh/bun/pull/35236) [#32746](https://github.com/oven-sh/bun/pull/32746)
- **`WebSocket#close()`** now throws `InvalidAccessError` for invalid close codes and `SyntaxError` for reasons over 123 UTF-8 bytes. [#32820](https://github.com/oven-sh/bun/pull/32820)
- `Bun.serve` 's WebSocket server now closes the connection when a client sends unmasked data, which the WebSocket spec requires servers to reject. [#32820](https://github.com/oven-sh/bun/pull/32820)
- `Bun.serve` no longer truncates responses from a `type: "direct"` `ReadableStream` whose `pull()` returns synchronously but writes more data later via a captured controller. Previously the response ended after the first synchronous flush. This fixes React 19's `renderToReadableStream` (the `react-dom/server.bun` build), which was closing after the shell and aborting the render.
- **`Bun.serve()`**: an over-long bracketed IPv6 `hostname` throws a validation error.
- **`Bun.serve` HTML routes**: fixed a crash when `server.stop()` was called while a route was still bundling in `development: false` mode. `stop()` now waits for the build, which counts as one pending request.
- `Bun.serve` handles a client aborting a streaming `Response` while the socket is under write backpressure.
- **`Bun.serve()` GC pacing**: [the per-tick heap sampler is replaced with an idle-only timer](https://github.com/oven-sh/bun/pull/35356). The old sampler self-perpetuated ~62 eden collections per second regardless of allocation rate; a 150 rps server with a 300 MB live heap was spending up to ~40% of wall time in GC.
- **`Bun.serve()` backpressure drain**: the uWS `BackPressure` buffer is now a cursor-tracked slab so `erase()` is a pointer bump; a full drain no longer `memmove` s and reallocs the remaining bytes ~32 times. [#34824](https://github.com/oven-sh/bun/pull/34824)
- **`Bun.serve()`**: fixed a per-request memory leak when returning a direct `ReadableStream` that drains synchronously. [#29877](https://github.com/oven-sh/bun/pull/29877)
- **`Bun.serve()`**: passing `Bun.file()` as `cert` / `key` / `ca` no longer leaks one buffer per config parse.
- Fixed `req.text()` in `Bun.serve()` throwing `TypeError: undefined is not a function` in certain cases.
- Fixed a file descriptor leak in `Bun.serve` static file routes.
- **`Bun.serve()` WebSocket**: `perMessageDeflate: { decompress: "dedicated" }` no longer drops browsers and ws clients after their second compressed message
- **`Bun.serve()` WebSocket**: a control or continuation frame with the compression flag set is now rejected
- `Bun.serve` file responses on macOS use the buffered read/write path instead of `sendfile(2)`, working around a Darwin XNU kernel bug.
- **`Bun.listen` / `Bun.connect`**: fixed callbacks being garbage-collected while the socket was still alive.
- **`Bun.listen` / `Bun.connect`**: fixed a crash when a socket close handler closes a sibling in the same group.
- **`Bun.listen` / `Bun.connect`**: sockets retry on `ENOBUFS` / `ENOMEM` instead of treating them as fatal.
- **`Bun.listen` / `Bun.connect`**: unhandled pending exceptions from connect-promise or TLS-session callbacks are now surfaced.
- `Bun.serve()` route objects accept a `Response` directly under an HTTP-method key.
- **Duplicate HTTP headers** on `fetch()` responses and `Bun.serve` requests are now combined with `", "` per the Fetch spec instead of silently keeping only the last value; `Set-Cookie` continues to return separate values. [#31734](https://github.com/oven-sh/bun/pull/31734)
- **HTML bundling** Favicons, `<link rel="manifest">`, and other URL-referenced assets now appear in the manifest `files` array (no more 404s from `Bun.serve()`)
- **[`node:tls`](https://nodejs.org/api/tls.html)**: `socket.write()` from inside a server's `ALPNCallback` or `SNICallback` no longer fails the handshake (the client saw `TLSV1_ALERT_INTERNAL_ERROR`); the bytes go out once the handshake completes. From inside `Bun.listen()` 's `alpnCallback` and `serverName` hooks, the same write returns `0` and `drain` fires after the handshake, like any other write made before the handshake. [#37675](https://github.com/oven-sh/bun/pull/37675)
- **HTTP** `Bun.serve` and `node:http` apply stricter chunked `Transfer-Encoding` parsing (HEXDIG-only sizes, 64-bit chunk sizes, a cap on chunk-extension bytes, and rejection of any coding besides a single trailing `chunked` and of `Transfer-Encoding` on HTTP/1.0 requests)

### Bun.$ (shell)

- **`Bun.$` (shell)** `mv` falls back to copy+unlink across filesystems.
- **`Bun.$` (shell)** Bare `cd` changes to `$HOME`
- **`Bun.$` (shell)** Comma-less brace groups like `{abc}` are literals and nested groups keep trailing empty variants.
- **`Bun.$` (shell)** A redirect target that expands to multiple words is an error.
- **`Bun.$` (shell)** Redirects to FIFOs use the pollable writer path.
- **`Bun.$` (shell)** Redirecting an empty buffer to stdin delivers EOF instead of hanging.
- **`Bun.$` (shell)** `rm` no longer hangs on a lost wakeup between directory tasks.
- **`Bun.$` (shell)** `new $.Shell()` inherits env/cwd/throws defaults.
- **`Bun.$` (shell)** `$.escape` no longer corrupts Latin-1 characters. [#36338](https://github.com/oven-sh/bun/pull/36338) [#34822](https://github.com/oven-sh/bun/pull/34822) [#34856](https://github.com/oven-sh/bun/pull/34856) [#34865](https://github.com/oven-sh/bun/pull/34865) [#34324](https://github.com/oven-sh/bun/pull/34324) [#34696](https://github.com/oven-sh/bun/pull/34696) [#33994](https://github.com/oven-sh/bun/pull/33994) [#34032](https://github.com/oven-sh/bun/pull/34032) [#36409](https://github.com/oven-sh/bun/pull/36409) [#32933](https://github.com/oven-sh/bun/pull/32933)
- **`Bun.$` (shell)** `$.escape` no longer drops empty-string arguments. [#36338](https://github.com/oven-sh/bun/pull/36338) [#34822](https://github.com/oven-sh/bun/pull/34822) [#34856](https://github.com/oven-sh/bun/pull/34856) [#34865](https://github.com/oven-sh/bun/pull/34865) [#34324](https://github.com/oven-sh/bun/pull/34324) [#34696](https://github.com/oven-sh/bun/pull/34696) [#33994](https://github.com/oven-sh/bun/pull/33994) [#34032](https://github.com/oven-sh/bun/pull/34032) [#36409](https://github.com/oven-sh/bun/pull/36409) [#32933](https://github.com/oven-sh/bun/pull/32933)
- **`Bun.$` builtins** `.quiet()` accepts a boolean.
- **`Bun.$` builtins** `ls -l` prints a real long listing.
- **`Bun.$` builtins** `echo` supports `-e` / `-E`
- **`Bun.$` builtins** Empty-string arguments are no longer dropped (so `ssh-keygen -N ""` works)
- **`Bun.$` builtins** `[[ -f ]]` only matches regular files.
- **`Bun.$` builtins** Globbing into a nonexistent directory reports `no matches found` instead of aborting the process..
- The buffered pipe writer used by `Bun.$` and `spawn` stdin stays alive across async write completions on Windows.
- Bun Shell handles `epoll_ctl` failures during poll-driven pipe reads.
- Bun Shell handles synchronous redirect write failures such as `ENOSPC` gracefully.
- Shell completions for `bun run` no longer hide standalone scripts whose names start with `pre` or `post`, so prettier, postgres, postcss, and `preview` now tab-complete correctly. [#30088](https://github.com/oven-sh/bun/pull/30088)
- `bun run --elide-lines` is now a silent no-op when stdout isn't a TTY, so the same script works in both interactive shells and git hooks. [#28977](https://github.com/oven-sh/bun/pull/28977)
- Fish shell completions now include `bun update` and its flags. [#25978](https://github.com/oven-sh/bun/pull/25978)
- **`Bun.spawn()` and `Bun.$`**: fixed a leak of the writer that feeds a `Buffer` or `Blob` `stdin` to the child when the child closed its stdin before the buffer had drained (typically `EPIPE`). This affected the shell's `< ${buffer}` redirect on every POSIX platform and `Bun.spawn()` on macOS; on Linux `Bun.spawn()` passes the buffer as a memfd instead, so it only leaked where memfd was unavailable. [#37774](https://github.com/oven-sh/bun/pull/37774)
- **Windows dirfd-relative opens**: [~22 µs → 12–15 µs per call](https://github.com/oven-sh/bun/pull/33874) for common path shapes (~17 µs for relatives that resolve above the directory handle; bare names stay a ~10 ns passthrough). The `NtCreateFile` object name is built from the NT device path directly, skipping the mount-manager IOCTL that drive-letter lookup costs. Applies to tarball extraction, dirfd-relative `node:fs`, and shell file ops.
- Bun's crash handler now re-raises the original fault signal (SIGSEGV, SIGBUS, SIGFPE), or SIGABRT for panics, instead of always terminating with SIGILL, so shells and orchestrators see the real crash cause instead of "Illegal instruction".
- **Injection**: `Bun.spawn()`, `Bun.spawnSync()`, and Bun Shell reject NUL bytes in arguments, environment variables, `argv0`, and `cwd`.
- **Injection**: `Bun.sql` rejects NUL bytes in connection parameters.
- **Injection**: `Bun.s3` rejects CR/LF in `contentDisposition`, `contentEncoding`, and `type`.
- **Injection**: `node:dns` rejects hostnames with embedded NUL bytes.
- **Injection**: Bun Shell treats glob metacharacters arriving through interpolation as literals and keeps its internal delimiter out of reach of interpolated strings.
- **Injection**: `vm.createContext(DONT_CONTEXTIFY)` sandboxes get their own `Object.prototype`.
- File handles that Bun duplicates internally (for `Bun.file(fd).stream()`, a `fetch()` body made from `Bun.file(fd)`, a `FileSink` on an fd, and `Bun.$` subshells and pipelines) are created non-inheritable on Windows, as they already were on POSIX via `F_DUPFD_CLOEXEC`.
- **`Bun.$`**: pipeline write failures other than `EPIPE` are handled.
- **`Bun.$`**: `rm` no longer leaks when the directory-read loop aborts with child tasks already queued.
- **`Bun.$`**: spawn-time pipe failures are handled.
- **`Bun.$`**: multiple parse errors in `ShellError.message` are separated by newlines.
- **`Bun.$`**: the interpreter no longer leaks when finalized with subprocesses still running.
- **`Bun.$`**: `ls -a -A` respects flag order (last one wins).
- **`Bun.$`**: the `yes` builtin works when its stdout is captured.

### Bun.sql

- **`Bun.sql`**: a result column named `""` (for example `select ''` on MySQL or MariaDB) no longer crashes the process. [#38143](https://github.com/oven-sh/bun/pull/38143)
- **`Bun.sql` (MySQL)**: JSON columns from MariaDB parse into objects via extended-type-info negotiation. [#37130](https://github.com/oven-sh/bun/pull/37130)
- **`Bun.sql` (MySQL)**: column-count and structure mismatches are asserted instead of silently dropping values. [#36554](https://github.com/oven-sh/bun/pull/36554)
- **`Bun.sql` (MySQL)**: prepared statements assigned `statement_id` 0 by the server are rejected instead of silently misbehaving. [#33238](https://github.com/oven-sh/bun/pull/33238)
- **`Bun.sql` (Postgres)**: fixed memory leaks in array-typed columns and failed connections.
- **`Bun.sql` (Postgres)**: binary `NUMERIC` values smaller than 1e-8 decode correctly.
- **`Bun.sql` (Postgres)**: queries exceeding the 65,535-parameter wire limit throw `ERR_POSTGRES_TOO_MANY_PARAMETERS`.
- **`Bun.sql` (Postgres)**: multi-statement simple queries return the correct column names per result set.
- **`Bun.sql` (MySQL)** `SELECT` no longer silently returns zero rows against StarRocks, TiDB, and SingleStore.
- **`Bun.sql` (MySQL)** Memory usage stays flat across thousands of queries (column-name and prepared-statement buffers are now freed)
- **`Bun.sql` (MySQL)** `DATETIME` / `TIMESTAMP` round-trip as UTC.
- **`Bun.sql` (MySQL)** `YEAR` and computed `DECIMAL` columns decode correctly.
- **`Bun.sql` (MySQL)** BINARY/VARBINARY/BLOB return `Buffer` while binary-collated VARCHAR returns `string`
- **`Bun.sql` (MySQL)** `.raw()` no longer includes stray protocol bytes at the start of each value.
- **`Bun.sql` (MySQL)** A hang involving stored procedures and multi-statement queries has been fixed.
- **`Bun.sql` (MySQL)** Idle connections no longer hold the event loop open or spike CPU to 100% over TLS.. [#28005](https://github.com/oven-sh/bun/pull/28005) [#28633](https://github.com/oven-sh/bun/pull/28633) [#31212](https://github.com/oven-sh/bun/pull/31212)
- **`Bun.sql` (pool & helpers)** The `sql({...})` INSERT helper omits `undefined` so columns fall back to their `DEFAULT`
- **`Bun.sql` (pool & helpers)** Throwing inside `onconnect` / `onclose` no longer hangs the pool.
- **`Bun.sql` (pool & helpers)** `sql.close({ timeout: 0 })` resolves during a half-open handshake.
- **`Bun.sql` (pool & helpers)** New `ERR_*_CONNECTION_FAILED` codes distinguish "never connected" from "connection dropped".. [#25830](https://github.com/oven-sh/bun/pull/25830)
- `Bun.sql` (Postgres) could silently deliver one query's rows to a different query when a simple-protocol query ran concurrently with a not-yet-prepared parameterized query on the same connection. Simple-protocol queries include `.simple()`, parameter-less `sql.unsafe()`, and the `BEGIN` / `COMMIT` / `ROLLBACK` that `sql.begin()` issues. Bun was sending a redundant protocol message that pushed its reply queue out of step with the server. [#32772](https://github.com/oven-sh/bun/pull/32772)
- **JSON serialization**: [~3x faster](https://github.com/oven-sh/bun/pull/25733) across IPC, `console.log('%j')`, PostgreSQL/MySQL JSON columns, and Jest format specifiers. These paths now hit JavaScriptCore's SIMD-optimized FastStringifier instead of the slow path.
- **TLS** Hostname matching is one implementation across `fetch()`, `WebSocket`, `Bun.connect`, `Bun.sql`, and `X509Certificate#checkHost`, aligned with `tls.checkServerIdentity`
- **Native memory**: edge cases involving bounds and lifetime checks in `Buffer` (`concat`, `compare`, `indexOf` / `lastIndexOf` / `includes`), `crypto.randomFill`, `TextDecoder.decode`, `Bun.udpSocket` `send` / `sendMany`, `node:zlib`, structured-clone deserialization (`bun:jsc`, `node:v8`, advanced IPC), `node:fs` path handling and Windows path normalization, generated native-class setters called with a foreign receiver, the `.npmrc` INI parser, and the Postgres and MySQL wire parsers have been fixed
- **`Bun.sql` (Postgres)**: connection parameters are validated and reject null bytes with `ERR_INVALID_ARG_TYPE`.
- **`Bun.sql` (Postgres)**: a synchronous validation error on an idle pooled connection no longer wedges the event loop keep-alive and prevents exit.
- **`Bun.sql` (Postgres)**: backend message framing is validated.
- **`Bun.sql` (Postgres)**: connection-failure messages are handled regardless of how they arrive across TCP reads.
- **`Bun.sql` (MySQL)**: `caching_sha2_password` fast authentication against MySQL 8 now works instead of falling back to full authentication on every connect. [#33179](https://github.com/oven-sh/bun/pull/33179)
- **`Bun.sql` (MySQL)**: binary-protocol `NULL` on digit-named columns lands at the column's numeric name instead of index `0`. [#32367](https://github.com/oven-sh/bun/pull/32367)
- **`Bun.sql` (Postgres)**: `'infinity'::date` / `timestamp` values decode to `±Infinity` instead of invalid dates. [#35121](https://github.com/oven-sh/bun/pull/35121)
- **`Bun.sql` (Postgres)**: `DateStyle=ISO` is pinned on connect so a server default can't corrupt date parsing. [#35112](https://github.com/oven-sh/bun/pull/35112)
- **`Bun.sql` (Postgres)**: the wire-protocol parser enforces message-length frame boundaries and bounds `DataRow` / `RowDescription` reads. [#35114](https://github.com/oven-sh/bun/pull/35114) [#34436](https://github.com/oven-sh/bun/pull/34436)
- **`Bun.sql` (Postgres)**: out-of-range digit words are rejected when decoding binary `NUMERIC`. [#34429](https://github.com/oven-sh/bun/pull/34429)

### Bun.spawn()

- **`AbortSignal.timeout()`** now fires even if nothing is observing the signal when the deadline arrives, as in Node and browsers. Previously, removing the last abort listener, clearing `onabort`, closing an `fs.watch()` watcher the signal was passed to, or a `Bun.spawn()` child exiting cancelled the timer, so `aborted` stayed `false` and listeners attached later never fired.
- **`Bun.spawn()`**: relative `$PATH` entries are resolved against the `cwd` option.
- **`Bun.spawn()`**: the parent's cwd is inherited when no `cwd` is given.
- **`Bun.spawn()`**: an already-aborted `signal` throws `AbortError` immediately instead of spawning.
- **`Bun.spawn()`**: `timeout: NaN` and `killSignal: 0` are rejected with a validation error.
- **`Bun.spawn()`**: extra stdio file descriptors exposed via `.stdio` are no longer double-closed.
- **`Bun.spawn()`**: caller-supplied file descriptors are returned from `proc.stdio[N]` instead of `null`. [#29629](https://github.com/oven-sh/bun/pull/29629)
- `Bun.spawn` keeps the subprocess `stdout` / `stderr` reader alive while its pipe poll is armed.
- A `Bun.spawn` `stdout` / `stderr` stream reader can be cancelled from inside its own read callback.
- `Bun.spawn({ stdin: readableStream })` no longer surfaces an unhandled `EPIPE` rejection when the child exits while the internal stdin pump still has a write in flight. [#33021](https://github.com/oven-sh/bun/pull/33021)
- **[`node:child_process`](https://nodejs.org/api/child_process.html)**: stdin `EPIPE` emits `'error'` and destroys the stream.
- **[`node:child_process`](https://nodejs.org/api/child_process.html)**: the abort listener on `options.signal` is no longer leaked when spawn fails.
- **[`node:child_process`](https://nodejs.org/api/child_process.html)**: `stdio: 'overlapped'` string shorthand is accepted.
- **[`node:child_process`](https://nodejs.org/api/child_process.html)**: `spawn()` ignores `options.encoding`.
- **[`node:child_process`](https://nodejs.org/api/child_process.html)**: `subprocess.stdin` stays `null` after exit when stdio wasn't piped.
- `child_process` `maxBuffer` now stops reading and closes the pipe when the limit is hit instead of continuing to drain everything the child writes before it dies; stdout/stderr overshoot is bounded to at most 64 KB past the limit, matching Node.js. [#33309](https://github.com/oven-sh/bun/pull/33309) [#33330](https://github.com/oven-sh/bun/pull/33330)
- `spawnSync()` now forwards the `detached` option, so the child gets its own process group as documented. [#32874](https://github.com/oven-sh/bun/pull/32874)
- `spawn()` with `stdio: 'ignore'` at fd ≥ 3 now leaves that descriptor closed in the child instead of opening `/dev/null`, matching Node.js. [#32892](https://github.com/oven-sh/bun/pull/32892)
- **[`node:child_process`](https://nodejs.org/api/child_process.html)**: piped `stdout` / `stderr` now apply kernel backpressure instead of buffering unbounded in memory. [#34971](https://github.com/oven-sh/bun/pull/34971)
- **[`node:child_process`](https://nodejs.org/api/child_process.html)**: `child.stdout.pause()` is honored after the stream has started flowing. [#36035](https://github.com/oven-sh/bun/pull/36035)
- **[`node:child_process`](https://nodejs.org/api/child_process.html)**: `spawnSync` drains piped stdio to EOF after the child exits. [#33832](https://github.com/oven-sh/bun/pull/33832)
- Fixed Python asyncio-based subprocesses (including all Python MCP servers) breaking under `Bun.spawn`: Bun was prematurely signaling end-of-stream on the child's stdio pipes, which asyncio read as "connection closed". [#27435](https://github.com/oven-sh/bun/pull/27435)
- A rare bug causing silent data loss when reading subprocess pipes on Windows is fixed.
- Fixed `Bun.spawnSync({ timeout })` on Windows firing the timeout immediately if its isolated event loop had been idle longer than the timeout value; libuv's cached loop clock is now refreshed before arming the timer. [#33935](https://github.com/oven-sh/bun/pull/33935)
- A failed `Bun.spawn()` (e.g. `ENOENT`) on Windows leaves later spawn calls unaffected.
- Pausing and resuming a pipe from inside its own read callback (the path `child_process` stdio backpressure takes) is safe on Windows, via a libuv upgrade.
- **`Bun.spawn()`**: `Bun.file(path)` and `Bun.file(fd)` work at `stdio[3]` and higher.
- **`Bun.spawn()`**: on Windows, an async-iterable `stdin` completes after the child exits.
- **`Bun.spawn()`**: `maxBuffer` stays enforced after the `.stdout` /`.stderr` stream getters are accessed. [#34349](https://github.com/oven-sh/bun/pull/34349)
- **`Bun.spawn()`**: stdout/stderr pipes are closed after a timeout kill so buffered reads don't hang. [#35012](https://github.com/oven-sh/bun/pull/35012)
- **`Bun.spawn()`**: Windows child processes can now set `CREATE_BREAKAWAY_FROM_JOB` under Bun's no-orphans job object. [#36414](https://github.com/oven-sh/bun/pull/36414)

### Web Streams

- **`Response.clone()` and `Request.clone()`** no longer lock the original body's `ReadableStream` when `.body` was accessed before cloning. Both the original and the clone remain independently readable, per the Fetch spec. [#25484](https://github.com/oven-sh/bun/pull/25484)
- **`type: "direct"` `ReadableStream` s** now deliver bytes written after a `flush()` inside `pull()` to `pipeTo()`, `pipeThrough()`, `tee()`, `for await`, and `Response#textStream()`; previously those consumers stopped at the flush, while `text()` and a plain reader were unaffected. [#37692](https://github.com/oven-sh/bun/pull/37692)
- **`type: "direct"` `ReadableStream` s**: a `pull()` that throws synchronously no longer also reports a stray `unhandledRejection`. [#37692](https://github.com/oven-sh/bun/pull/37692)
- **`ReadableStream({ type: "direct" })`** serializes `pull()` calls on the JS reader path. [#33782](https://github.com/oven-sh/bun/pull/33782)
- **`FileSink.write()`** under backpressure resolves to the correct byte count for that chunk. [#33538](https://github.com/oven-sh/bun/pull/33538)
- `FileSink` teardown in Windows standalone executables no longer captures diagnostic backtraces, which had also taken a process-wide dbghelp lock on every `FileSink` destruction.
- `console.log(ReadableStream)` and other Web/DOM constructors now print `[class ReadableStream]` instead of `[class Function]`. [#29229](https://github.com/oven-sh/bun/pull/29229)
- `FileSink.write()` now returns `number | Promise<number>`
- Removed the non-existent `.formData()` / `.arrayBuffer()` methods from `ReadableStream`
- `fetch()` with a streamed request body frames empty chunks correctly on the wire.
- `fetch()` with a streamed request body keeps the connection out of the keep-alive pool until the upload has finished.
- `fetch()` with a streamed request body completes uploads sent with an explicit `Content-Length` that yield empty chunks.
- Fixed `BuildArtifact.prototype.stream()` returning the artifact's `.kind` string instead of a `ReadableStream` after any cached getter was read, a regression from December 2023. [#33144](https://github.com/oven-sh/bun/pull/33144)
- `Readable.fromWeb()` now propagates the underlying web stream's error to the Readable's `'error'` event instead of surfacing an unhandled rejection. [#32863](https://github.com/oven-sh/bun/pull/32863)
- `stream.finished()` accepts WHATWG `ReadableStream` and `WritableStream`. [#32863](https://github.com/oven-sh/bun/pull/32863)
- **Cancelled streaming `fetch()` bodies** never freed the `ReadableStream`, its Promises, and `Uint8Array` buffers, leaking **~260 KB per cancelled request**. Cancel now propagates back to the underlying HTTP request and releases the stream immediately. [#27191](https://github.com/oven-sh/bun/pull/27191)
- **Native `ReadableStream` sources** reuse the same buffer across reads until it actually fills, instead of allocating a fresh one on every pull; this sharply reduces memory commit on Windows.
- **`ReadableStream` native sinks**: long-lived closures stored on native sinks and controllers are now bound top-level helpers, so they no longer keep their parent function's entire lexical environment alive. [#32656](https://github.com/oven-sh/bun/pull/32656)
- Fixed `new TransformStream()` never being garbage-collected unless explicitly closed; `for (;;) new TransformStream()` would OOM. [#29891](https://github.com/oven-sh/bun/pull/29891)
- An error thrown inside a `ReadableStream` used as a `Response` body is reported and the connection is aborted. A stream that errors mid-body force-closes the socket instead of ending the response cleanly.
- **`ReadableStream.pipeTo()`**: drains already-queued chunks in place when the destination has capacity, making pipes to a `WritableStream` with `highWaterMark > 1` up to 12% faster and avoiding a promise allocation per chunk. [#33329](https://github.com/oven-sh/bun/pull/33329)
- **`FileSink`**: pending `write()` promises are settled on every synchronous `close()` / `end()` path. [#35365](https://github.com/oven-sh/bun/pull/35365)
- **`FileSink`**: pending `write()` promises are rejected when a deferred auto-flush hits `EPIPE`. [#35278](https://github.com/oven-sh/bun/pull/35278)
- **`FileSink`**: pending `write()` promises are rejected (not double-reported) when `end()` fails. [#35344](https://github.com/oven-sh/bun/pull/35344)
- **`FileSink`**: buffered writes are flushed when `process.exit()` is called in the same tick. [#36250](https://github.com/oven-sh/bun/pull/36250)
- **Web Streams**: `.bytes()` /`.arrayBuffer()` on a single-chunk stream return a copy.
- **Web Streams**: direct-controller `write()` / `close()` no-op instead of throwing after the stream is closed.
- **Web Streams**: the direct controller marks closed on cancel.
- **Web Streams**: `Response.textStream()` over a native fetch body decodes multi-byte characters split across any number of chunks.
- **Web Streams**: a `ReadableStream` 's underlying source is released to GC as soon as the stream reaches a terminal state. [#36666](https://github.com/oven-sh/bun/pull/36666)
- **Web Streams**: `Request` / `Response` `.body` no longer holds a strong GC reference to the stream after the wrapper owns it. [#36624](https://github.com/oven-sh/bun/pull/36624)
- **Web Streams**: body-producer hooks are freed once the body is realized as a stream. [#36809](https://github.com/oven-sh/bun/pull/36809)
- **Web Streams**: native sinks release their backing buffer on `close()`. [#36785](https://github.com/oven-sh/bun/pull/36785)
- `@types/bun` now includes the `wait?: boolean` parameter on `ReadableStreamDirectController.flush()`, and the `type: "direct"` backpressure contract is documented: `write()` returns a negative number under backpressure, and `await flush(true)` waits for the sink to drain. [#32640](https://github.com/oven-sh/bun/pull/32640)

### WebSocket client

- **The WebSocket client** now closes with a protocol error when the server sets the permessage-deflate compression flag mid-message, instead of silently delivering the malformed data, matching browsers and Node's ws. [#33395](https://github.com/oven-sh/bun/pull/33395)
- **`WebSocket` close events** now report the correct `CloseEvent.code` and `wasClean`: a bodyless server close reports `1005` (not `1000`), a received `1001` is no longer remapped, and `wasClean` is `true` for clean server-initiated closes. [#31518](https://github.com/oven-sh/bun/pull/31518)
- **`new WebSocket("wss://...", { proxy })`**: large bursts of incoming frames are processed correctly while a write happens concurrently (an automatic pong, or `send()` from `onmessage`). The bug showed up on busy long-lived connections. The same fix stops `tls.connect({ socket })` from firing the next `'data'` event from inside a `'data'` handler that calls `write()`. [#37467](https://github.com/oven-sh/bun/pull/37467)
- **`wss://` through an HTTP `CONNECT` proxy** no longer loses the connection when the `open` handler spins the event loop (for example `expect(...).resolves` in `bun:test`). Previously the socket stayed `OPEN` forever without ever firing `message` or `close`. [#37610](https://github.com/oven-sh/bun/pull/37610)
- **`WebSocket#terminate()` on a `wss://` connection** whose peer has stopped responding now fires `close` with code `1006`. Previously the socket stayed in `CLOSING` forever, waiting for a TLS `close_notify` the peer never sent, while the same call on `ws://` closed immediately. `close()` still sends the Close frame before tearing down the connection. [#38243](https://github.com/oven-sh/bun/pull/38243)
- **`fetch()`** and `WebSocket` accept a `URL` instance for the `proxy` option and `proxy.url`. [#33648](https://github.com/oven-sh/bun/pull/33648) [#33641](https://github.com/oven-sh/bun/pull/33641)
- Fixed a re-entrancy bug in WebSocket client when calling certain functions inside a `message` handler during a multi-frame read
- Fixed the WebSocket client dropping and reallocating its receive buffer after every fragmented message, and a related head-offset bug that could truncate a later payload; the 2 KB preallocation is now retained across messages as in 1.3. [#32356](https://github.com/oven-sh/bun/pull/32356)
- **Parsers and decoders**: the JSON/JSONC parser and CSS minifier are bounded on deeply nested or fan-out-heavy input and raise a catchable error.
- **Parsers and decoders**: the WebSocket client enforces a maximum decompressed message size for `permessage-deflate`.
- **Parsers and decoders**: the WebSocket client verifies `Sec-WebSocket-Accept`.
- **Parsers and decoders**: the Redis/Valkey RESP parser caps aggregate nesting depth.
- Fixed the WebSocket client rejecting the upgrade with `Invalid response` when a server pipelined a large (>16 KB) initial frame in the same TCP segment as the tail of the `101` response. [#32394](https://github.com/oven-sh/bun/pull/32394)
- **`WebSocket` client**: `Sec-WebSocket-Key` is now 16 spec-compliant random bytes instead of a v4 UUID. [#36496](https://github.com/oven-sh/bun/pull/36496)
- **`WebSocket` client**: the opening-handshake timeout is re-armed after TCP connect so a slow upgrade times out. [#35167](https://github.com/oven-sh/bun/pull/35167)
- **`WebSocket` client**: unsupported proxy protocols are rejected with a clear error instead of misusing HTTP CONNECT. [#35147](https://github.com/oven-sh/bun/pull/35147)
- **`WebSocket` client**: `ping()` / `pong()` reject payloads over 125 bytes per RFC 6455. [#35030](https://github.com/oven-sh/bun/pull/35030)
- **`WebSocket` client**: the `close` event is dispatched as a queued task per spec, not synchronously. [#27259](https://github.com/oven-sh/bun/pull/27259)
- **`WebSocket` client**: fixed permessage-deflate decompression failing after `Z_STREAM_END` with context takeover enabled. [#34105](https://github.com/oven-sh/bun/pull/34105)

### Windows

- `bun:ffi` now works on Windows ARM64, after fixing a TinyCC arm64 codegen bug where LLP64's 32-bit `long` truncated an immediate-operand mask and corrupted every double and pointer crossing the FFI boundary. [#33696](https://github.com/oven-sh/bun/pull/33696)
- `dlopen()` accepts non-ASCII library paths on Windows, so DLLs under a profile directory with a non-English username load. [#33712](https://github.com/oven-sh/bun/pull/33712)
- On Windows, `bun ./dist/**/*.html` now registers subdirectory routes with forward slashes; previously `/components/buttons` 404'd because the route was stored as `/components\buttons`. [#36532](https://github.com/oven-sh/bun/pull/36532)
- The `Response(Bun.file(path))` streaming path on Windows closes its file descriptor exactly once.
- `fs.rm(..., { recursive: true })` on Windows handles readonly files and files held by antivirus or cloud-sync software.
- Unrecognized Windows error codes now map to the same errno values Node.js returns.
- The Windows `bun run` / `bunx` fast path now heap-allocates its environment block instead of using a fixed 32,767-character buffer, so it no longer bails to the slow path when the process environment exceeds 32 KB (common in CI).
- `bun getcompletes` now works on Windows, so tab completion can be installed on every platform. [#24620](https://github.com/oven-sh/bun/pull/24620)
- **`--compile` on Windows**: the emitted `.exe` now carries a valid PE `OptionalHeader.CheckSum`.
- **`--compile` on Windows**: the emitted `.exe` is truncated to the correct length (orphaned Authenticode bytes from the base binary were being left past the last section).
- Fixed `bun build --compile` dropping the `[dir]` prefix from `Bun.embeddedFiles[].name` under a path-preserving asset naming pattern. [#31576](https://github.com/oven-sh/bun/pull/31576)
- Fixed ENOENT reading nested embedded assets on Windows. [#31576](https://github.com/oven-sh/bun/pull/31576)
- **Sourcemaps**: original columns are no longer off by one on lines containing a non-ASCII character.
- **Sourcemaps**: `sources` paths on Windows use forward slashes so DevTools resolves them.
- **Sourcemaps**: source files ending in an incomplete multi-byte UTF-8 sequence are handled.
- **[`node:net`](https://nodejs.org/api/net.html)**: sockets no longer close before buffered inbound data is read. [#36332](https://github.com/oven-sh/bun/pull/36332)
- **[`node:net`](https://nodejs.org/api/net.html)**: `SO_REUSEADDR` is set when binding `localPort` on outgoing connections on non-Windows platforms. [#33886](https://github.com/oven-sh/bun/pull/33886)
- **[`node:net`](https://nodejs.org/api/net.html)**: `server.unref()` releases Windows named-pipe listeners. [#37079](https://github.com/oven-sh/bun/pull/37079)
- **[`node:net`](https://nodejs.org/api/net.html)**: a `ReferenceError` in the happy-eyeballs path with `localPort` set is fixed. [#30699](https://github.com/oven-sh/bun/pull/30699)
- **[`node:fs`](https://nodejs.org/api/fs.html)**: coverage of Node's suite reaches **97.5%** with `Utf8Stream` support and unified Windows errno mapping. [#34505](https://github.com/oven-sh/bun/pull/34505)
- **[`node:fs`](https://nodejs.org/api/fs.html)**: Leaked `fs.promises` `FileHandle` descriptors are closed on GC with `ERR_INVALID_STATE`. [#33693](https://github.com/oven-sh/bun/pull/33693)
- **[`node:fs`](https://nodejs.org/api/fs.html)**: `fs.writev` / `readv` chunk more than `IOV_MAX` buffers. [#33695](https://github.com/oven-sh/bun/pull/33695)
- **[`node:fs`](https://nodejs.org/api/fs.html)**: paths of exactly `MAX_PATH_BYTES` are rejected with `ENAMETOOLONG`. [#34091](https://github.com/oven-sh/bun/pull/34091)
- **[`node:path`](https://nodejs.org/api/path.html)**: `path.win32.resolve` fixed for drive-relative paths on Windows.
- **[`node:path`](https://nodejs.org/api/path.html)**: `path.win32.relative()` handles slash-rooted prefix inputs.
- `fs.watch` now emits `('change', null)` to every live watcher when the kernel's event queue overflows on Linux or Windows, instead of silently dropping the loss signal.
- **`bunx` on Windows** now correctly handles empty-string arguments, quoted arguments containing spaces, and package names containing multi-byte UTF-8 characters.
- **Windows ARM64**: the `node_modules/.bin` shim executable is now compiled natively for aarch64, so package binaries no longer launch through x64 emulation. [#27448](https://github.com/oven-sh/bun/pull/27448)
- **Native-binary postinstall skipping** now applies to nested copies of a `nativeDependencies` package (a second esbuild pinned under `drizzle-kit/node_modules/`), not just the hoisted one. [#36495](https://github.com/oven-sh/bun/pull/36495)
- **Native-binary postinstall skipping**: Windows now takes the same `.bin` → platform-binary redirect path as POSIX. [#36856](https://github.com/oven-sh/bun/pull/36856)
- **Isolated store directory names** now sanitize `?` in tarball URLs, so a package installed from a URL with a query string can be imported (and installs on Windows, where `?` is an invalid filename character). [#36989](https://github.com/oven-sh/bun/pull/36989)
- **BoringSSL on macOS and Windows**: [now allocates through mimalloc](https://github.com/oven-sh/bun/pull/34847). The `OPENSSL_memory_*` override hooks were compiled out on non-ELF targets, so every TLS record read hit the system allocator.
- **Startup memory on Windows**: JavaScriptCore's 128MB compact-heap reservation is now [lazily committed](https://github.com/oven-sh/bun/pull/29294), so only the ~3–8MB actually used counts toward committed memory.
- **[`node:http`](https://nodejs.org/api/http.html)** On Windows, the server now stops reading the socket while a request body is paused (`req.pause()`, or a handler that never reads `req`), applying backpressure to the client.
- Fixed a memory leak on Windows (one `StaticPipeWriter` per spawn) when a buffer `stdin` finishes writing. [#35297](https://github.com/oven-sh/bun/pull/35297) [#35150](https://github.com/oven-sh/bun/pull/35150) [#35107](https://github.com/oven-sh/bun/pull/35107)
- Fixed a crash at thread teardown or in `free` on Linux and Windows for threads that had used a private mimalloc heap, which includes `Worker` threads; fixed by resyncing Bun's mimalloc fork with upstream.
- `fs.watch()` on Windows cleans up its internal path map when a watch fails, so retrying the same path (as Vite, NestJS CLI, chokidar, and watchpack do) works.
- **`Buffer.indexOf` / `lastIndexOf`**: [worst case is now O(n+m)](https://github.com/oven-sh/bun/pull/36420). A rare-byte two-anchor SIMD prefilter backed by a Two-Way fallback replaces the first-byte-only scan; a `lastIndexOf` over a 4 MB `aaa…` haystack with a 4000-byte adversarial needle drops from 7.4 s to under 1 ms (Node: 19 ms). About 250 byte- and substring-search sites in the runtime now [call the Highway kernel directly](https://github.com/oven-sh/bun/pull/37052), including on [Windows](https://github.com/oven-sh/bun/pull/34820).
- **`Bun.Glob` on Windows**: up to [2.39x faster](https://github.com/oven-sh/bun/pull/28489) for non- `**` patterns. The current pattern component is passed as a kernel-side `FileName` filter to `NtQueryDirectoryFile`, so non-matching entries never reach userspace.
- **Internal rough-tick clock**: sub-µs everywhere, backed by the CPU timestamp counter on x64 and ARM64. The old ~15.6 ms `GetTickCount64` floor on Windows is gone. [#29806](https://github.com/oven-sh/bun/pull/29806)
- Linux and Windows builds now bundle ICU 78.3 (up from 75.1 and 73.2), so `Intl` uses newer locale data.
- On Windows, `bun run --filter` now kills the full descendant process tree on Ctrl+C, so grandchild dev servers spawned through `.cmd` shims or `cmd.exe` no longer survive with their ports still bound. [#36291](https://github.com/oven-sh/bun/pull/36291)
- On Windows, `net.connect()` failures now surface the real error code (`EADDRINUSE`, `ECONNRESET`) instead of reporting `ECONNREFUSED` (or `ENOENT` for a path connect) for every failure. [#36786](https://github.com/oven-sh/bun/pull/36786)
- On Windows, `fs.mkdir(dir, { recursive: true })` no longer throws `EEXIST` when the directory already exists with the ReadOnly attribute set, which OneDrive applies to synced folders. [#34416](https://github.com/oven-sh/bun/pull/34416)
- Fixed a hang where `await proc.exited` after `proc.unref()` (or an `AbortSignal.timeout()` under `bun test`) busy-spun forever because libuv's `uv_run(UV_RUN_NOWAIT)` skipped its IOCP poll with only unref'd handles alive.
- Fixed a CRT fd leak in `fstat` / `futimens` on `NtCreateFile` -backed handles (`Bun.Image(path)`, `bun pm pack`, `bun create`) that drifted long-running processes into `EMFILE` after ~8,189 calls. [#33713](https://github.com/oven-sh/bun/pull/33713)
- Fixed `NtCreateFile` opens with `O_NOFOLLOW` dropping `FILE_SYNCHRONOUS_IO_NONALERT`, a latent bug with no JS-reachable path today. [#36193](https://github.com/oven-sh/bun/pull/36193)
- Reading and writing files larger than 4GB works on Windows.
- Reparse points are classified by tag so only name surrogates are followed as symlinks
- Opening files with `O_TRUNC` truncates correctly regardless of access mode
- `process.dlopen` returns an error for over-length paths
- `Bun.write()` reports an error when the source file does not exist
- Socket polling setup handles `uv_poll_init_socket` failure
- Native addons using SEH no longer have first-chance exceptions hijacked by Bun's crash handler
- **`--linker=isolated` on Windows** now falls back to junctions when symlink creation fails with an unrecognized Windows error (typically from security software or certain filesystems), instead of silently succeeding with missing package links. [#32643](https://github.com/oven-sh/bun/pull/32643)
- **`bun pm pack --quiet`** no longer prints a leading newline before the tarball name, so `$(bun pm pack --quiet)` captures a clean filename. [#32751](https://github.com/oven-sh/bun/pull/32751)
- **`bun pm pack`** `--destination` on Windows no longer prints a mixed-separator path. [#32751](https://github.com/oven-sh/bun/pull/32751)

### Memory and reliability

- **`node:zlib` Brotli/Zstd `reset()`** uses **~50x less memory**. It was allocating a new encoder/decoder on every reset without freeing the previous one. [#25592](https://github.com/oven-sh/bun/pull/25592)
- **`tls.connect({ socket })` upgrades** leaked one raw socket wrapper per upgrade, causing unbounded growth with the MongoDB Node.js driver (whose connection-monitoring heartbeats cycle TLS upgrades every ~10s) and the mysql2 TLS path. [#26766](https://github.com/oven-sh/bun/pull/26766)
- **Mongoose + MongoDB over TLS**: a longstanding issue causing excessive peak memory usage is fixed.
- **`Response.clone()` chain memory**: [flat across depth](https://github.com/oven-sh/bun/pull/35843). Tee'd chunks are shared by reference instead of structured-cloned into each branch; a 100-deep clone chain of a 10 MB streaming body now costs ~20 MB RSS instead of ~1050 MB. Node.js 26.7 and Deno 2.9 both use ~1050 MB for the same chain.
- **Startup symbol ordering**: [Linux `bun -e` RSS drops another ~9 MB](https://github.com/oven-sh/bun/pull/35085). Function-entry tracing (replacing page-fault tracing) lists only the ~14k functions that actually run at startup instead of the ~38k that share a page with one, and macOS arm64 now gets startup ordering too.
- **Bundled startup heap**: [11% fewer objects](https://github.com/oven-sh/bun/pull/27022) and 4 MB less memory on a large React bundle. `__toESM` caches its wrapper objects in a `WeakMap`, and getter/setter closures are replaced with `.bind()`.
- **Runtime source maps**: [~8x smaller in memory](https://github.com/oven-sh/bun/pull/29358). A bit-packed binary format read in place shrinks mappings from 20 bytes each to ~2.4 bytes; on TypeScript's compiler that's ~11.3 MB → 1.3 MB resident, and `bun build --compile` binaries get several MB smaller.
- **`bun build --compile` startup**: [zero-copy module strings](https://github.com/oven-sh/bun/pull/31557). ASCII bundle source is wrapped directly from the kernel-mmapped `.bun` section instead of heap-copied; on a 40 MB bundle that's one 40 MB allocation gone at startup.
- **`Bun.RedisClient` buffer replies**: [~10% less CPU and 25–33% less peak RSS](https://github.com/oven-sh/bun/pull/31673) for 1MB `getBuffer` calls. The parser's allocation is adopted directly as the Buffer backing store instead of copied.
- **`bun build --compile` resident memory**: standalone executables now [`madvise(MADV_DONTNEED)` the embedded source section](https://github.com/oven-sh/bun/pull/29320) once the entrypoint is parsed, releasing bundled JS source pages back to the kernel.
- **Bundler memory**: boolean flags in `ImportRecord`, `Chunk`, `Location`, and resolver `Result` are now [packed into bitfields](https://github.com/oven-sh/bun/pull/25627), saving an estimated 200KB–1.5MB per large build.
- **Transpiler comma-expression simplification**: runs in linear memory with `target: "bun"`; at n=4000 operands the RSS delta drops from ~370 MB to ~4 MB.
- Boolean flags across stream/controller/tee/pipe classes are packed into bitfields. [#33817](https://github.com/oven-sh/bun/pull/33817) [#33833](https://github.com/oven-sh/bun/pull/33833)
- **`fetch()` response body memory**: [`await res.arrayBuffer()` peaks at ~1× the payload](https://github.com/oven-sh/bun/pull/36570) instead of 2–3×. The buffered path reserves `Content-Length` upfront, and decoded body bytes are delivered as a borrowed slice instead of copied through an intermediate; a 129 MB body drops from 377 MB to 139 MB over baseline.
- **`fetch()` streaming**: response-body buffers are now [released eagerly as chunks are consumed](https://github.com/oven-sh/bun/pull/23697) during long-running downloads and proxy passthroughs, instead of being held for the lifetime of the stream.
- **`file:` tarball dependencies** at or above the 64 MB libdeflate threshold are now streamed through libarchive instead of being decompressed into memory first, removing the 2 GiB decompressed-size cap and the intermediate buffer. [#36541](https://github.com/oven-sh/bun/pull/36541)
- `node:crypto` wrapper classes (`KeyObject`, `Hash`, `Hmac`, `Cipher`, `Sign`, `Verify`, `ECDH`) now report their native OpenSSL memory to the garbage collector, so tight loops that allocate large keys or XOF digests no longer grow the native heap unbounded.
- **[`node:http`](https://nodejs.org/api/http.html)** A paused upload no longer buffers in memory on Windows.
- **[`node:http`](https://nodejs.org/api/http.html)** A client that finishes uploading and half-closes while the request is paused now gets its response on `resume()`, as it already did on Linux and macOS, instead of an aborted request.
- **`node:http` `res.write()` under backpressure**: [large payloads are held by reference](https://github.com/oven-sh/bun/pull/34511) instead of copied into the uWS `std::string` backpressure buffer. The caller's Buffer is pinned and resumed from an offset on drain, matching Node.
- Async operations free their context before invoking the callback (preventing a leak when the callback exits the process). [#36986](https://github.com/oven-sh/bun/pull/36986) [#35948](https://github.com/oven-sh/bun/pull/35948) [#37057](https://github.com/oven-sh/bun/pull/37057) [#37017](https://github.com/oven-sh/bun/pull/37017)
- **`HTMLRewriter`**: fixed a memory leak where handler exceptions were over-protected in the rejection slot. [#36511](https://github.com/oven-sh/bun/pull/36511)
- **`HTMLRewriter`**: handlers registered via `.on()` /`.onDocument()` no longer leak memory when the rewriter is garbage-collected. [#29879](https://github.com/oven-sh/bun/pull/29879)
- Fixed a memory leak where partially-read `Blob.stream()` and `fetch()` response bodies were never collected if the reader was released without cancelling. [#32582](https://github.com/oven-sh/bun/pull/32582)
- Fixed per-call string leaks in `fetch()`: the `proxy` option URL, and the response URL for `file://` and `blob:` fetches, were leaked on every request. [#32329](https://github.com/oven-sh/bun/pull/32329)
- `AbortSignal.timeout()` used with `util.aborted()` no longer leaks memory.
- Fixed a memory leak in `require('module')._nodeModulePaths()` where each call leaked one string ref for the input and one per returned path; a 30,000-call loop now grows RSS by ~8 MB instead of ~76 MB. [#32337](https://github.com/oven-sh/bun/pull/32337)
- Fixed a leak where dropped `AbortSignal.timeout()` signals kept their native timer alive until the deadline even after the JS wrapper was collected.
- Fixed a shutdown leak where JSC deferred-work tasks scheduled after the last event-loop tick were never dropped. [#34293](https://github.com/oven-sh/bun/pull/34293) [#32703](https://github.com/oven-sh/bun/pull/32703) [#33131](https://github.com/oven-sh/bun/pull/33131)
- **`bun info`, `bun audit`, `bun publish`, `bun upgrade`, `bun create`**: fixed a small memory leak of the response metadata on every request these commands make. [#36335](https://github.com/oven-sh/bun/pull/36335)
- Environment variables that contain bytes that aren't valid UTF-8 are read correctly through `process.env` (closes eight reported issues).
- Fixed a data corruption bug in `Bun.write()` where files larger than 2 GB would silently skip chunks, producing truncated or interleaved output. [#25720](https://github.com/oven-sh/bun/pull/25720)
- A hypothetical race condition in the thread pool on aarch64 could leave a scheduled task with no thread awake to run it, causing `fs.promises`, `Bun.file()`, `Bun.write()`, `crypto.subtle`, and `bun install` to hang forever. This is fixed. Intel and AMD (x86\_64) machines were never affected.
- Separately, a crashing Bun process on aarch64 could spin forever at 100% CPU instead of terminating whenever a JS `SIGTRAP` listener was registered, which the `signal-exit` npm package (a transitive dep of most CLI tools) does by default. The crash handler now restores the default `SIGTRAP` handler, and the process terminates instead of spinning.
- `Illegal instruction` (SIGILL) crashes on ARMv8.0 hardware (Raspberry Pi 4, Cortex-A53, AWS a1 instances) are fixed. The memory allocator was being compiled with CPU instructions these chips don't support; it now targets the baseline ARM instruction set, and CI emulates this hardware to catch regressions.
- `MessagePort` and `BroadcastChannel` were rewritten to be thread-safe.
- `socket.upgradeTLS()` can be called synchronously from inside that socket's own `open` or `data` handler. This is the native code path taken by Node's `tls.connect({ socket })`, which is how database drivers upgrade an existing TCP connection to TLS after a plaintext protocol handshake.
- `realpathSync` no longer hangs when called on a FIFO — the internal `open()` now passes `O_NONBLOCK`

### Other performance improvements

- **macOS DNS**: [`dns.lookup()` no longer parks one thread per in-flight query](https://github.com/oven-sh/bun/pull/36619). Rewritten on `DNSServiceGetAddrInfo` over a shared connection to mDNSResponder; 500 concurrent lookups stay at ~9 threads instead of spiking to 513.
- **`fs.copyFile` / `Bun.write(file, file)` read/write fallback**: when `clonefile` / `copy_file_range` / `sendfile` aren't available, the source is hinted `POSIX_FADV_SEQUENTIAL` so the kernel doubles its readahead: up to 1.39× faster on the 32 KiB inner loop from a cold cache (~1.2× end-to-end for small files); the >1 MiB slab path is unchanged. [#34825](https://github.com/oven-sh/bun/pull/34825)
- **`url.searchParams.append()`**: fixed an O(N²) reserialize-on-every-mutation; 4000 appends took 2–5 s before and now take under 1 ms, within noise of a detached `URLSearchParams`. The URL's href is now rebuilt lazily on the next read. [#35080](https://github.com/oven-sh/bun/pull/35080)
- **Timer GC sweep**: fixed an O(n²) ordered-map remove when many timers had their numeric id read (`+t`, `` `${t}` ``); sweeping 30,000 such timers drops from seconds to ~2 ms. [#35077](https://github.com/oven-sh/bun/pull/35077)
- **`bun install --minimum-release-age` / `bun outdated`**: npm-manifest `time` entries are indexed in one O(V) pass instead of an O(V²) linear scan per version; packages with thousands of versions like typescript no longer pay millions of comparisons per cold resolve. [#34543](https://github.com/oven-sh/bun/pull/34543)
- **`bun build` cross-chunk export aliasing**: fixed an O(N²) restart-from-1 probe loop; a shared chunk with 20,000 same-name exports builds in 424 ms instead of 17.3 s. [#34529](https://github.com/oven-sh/bun/pull/34529)
- **`Bun.Glob` brace groups**: skipping to the end of a group is now O(1) via a cached close- `}` index; a ~300 KB `{*,*,…,*}b` pattern that took ~5 s per `match()` now completes instantly. [#36407](https://github.com/oven-sh/bun/pull/36407)
- **`Response.json()`**: [~3.5x faster](https://github.com/oven-sh/bun/pull/25717). Bun was accidentally passing `0` instead of `undefined` for the indent argument, knocking JavaScriptCore out of its SIMD-accelerated FastStringifier path.
- **`Buffer.toString("hex")`**: [up to ~1.8x faster](https://github.com/oven-sh/bun/pull/31421) than Bun 1.3.14 (1.2–1.5x on 64 KB–1 MB buffers), now backed by a Highway SIMD kernel instead of a scalar table loop.
- `Buffer.toString("base64")` / `"base64url"` on 32–128 KB buffers are ~20–30% faster now that the output string is allocated through a cheaper path.
- **`path.parse()`**: [~2.2–2.8x faster](https://github.com/oven-sh/bun/pull/26865) for typical paths and ~7x faster for empty strings. Bun caches a pre-built Structure for `{root, dir, base, ext, name}` and writes property values by offset instead of triggering five shape transitions per call.
- **`Bun.hash.xxHash3`**: [~2.5x faster](https://github.com/oven-sh/bun/pull/31491) on AVX-512 hardware for the `-baseline` build, ~1.2x for the AVX2 build — the stripe loop now runtime-dispatches to the widest SIMD available.
- **`TextEncoder.encode`**: up to [~1.6x faster](https://github.com/oven-sh/bun/pull/31385) on ASCII strings of a few hundred bytes and up. The leading ASCII run is now scanned and copied in a single SIMD pass, and a redundant 2 KB stack zero-fill on every call is gone.
- **`Buffer.slice()` / `Buffer.subarray()`**: [~1.5–1.7x faster](https://github.com/oven-sh/bun/pull/26819) across all cases. Moved from a JS builtin to native C++ with an int32 fast path that skips `toNumber()` coercion.
- **`bun build` on 2-core machines**: [~1.3–1.4x faster](https://github.com/oven-sh/bun/pull/28940). A CAS bug in `ThreadPool.warm()` meant worker threads were never actually pre-spawned, so the bundler ran with one fewer real thread than configured.
- **`expect().toContain()`**: [~2x faster](https://github.com/oven-sh/bun/pull/29104), `toBeOneOf()` ~1.3x faster. `JSArrayIterator` reads directly from contiguous array storage instead of calling `getIndex()` per element.
- **ESM module loading**: [~12% faster](https://github.com/oven-sh/bun/pull/29948). A one-character fix in the parser stops copying an 8 KB allocator struct on every AST node creation; `_platform_memmove` dropped from 7.5% to 2.9% of self time.
- **Async HTTP handlers that interleave**: [stay on the corked fast path](https://github.com/oven-sh/bun/pull/28615). Bun keeps two independent cork buffers per event loop, so a resumed handler can batch its writes even when another request is mid-flight.
- **`structuredClone()` of dense arrays**: [`memcpy` fast path](https://github.com/oven-sh/bun/pull/26814). Int32 and Double arrays clone with a single `memcpy` of their backing storage, and contiguous arrays of primitives skip the byte-stream serializer entirely.
- **`structuredClone()` of arrays of flat objects**: [Structure-cache fast path](https://github.com/oven-sh/bun/pull/26818). The shape of the first element is reused for every subsequent same-shaped element, skipping all property transitions during deserialization.
- **`Bun.Glob.scan()` with multiple `**`**: [visits each directory once](https://github.com/oven-sh/bun/pull/28496). Patterns like `**/node_modules/**/\*.js` no longer fork the traversal at every `\*\*/X` boundary; the walker carries an NFA state set instead.
- **`Bun.stringWidth`**: [SIMD throughout](https://github.com/oven-sh/bun/pull/28767). We scan ASCII runs 64 bytes at a time and skip ANSI escape sequences (terminal hyperlinks, colors) vector-wide instead of byte by byte.
- **`Bun.escapeHTML`**: [zero-allocation when nothing to escape](https://github.com/oven-sh/bun/pull/31483). Rewritten as a Highway SIMD binding that returns the input `JSString` unchanged when clean, and computes exact output length in one pass before a single table-driven fill.
- **Compile-time string maps**: [no runtime hashing](https://github.com/oven-sh/bun/pull/31875). Static string lookups throughout the runtime use length-dispatched jump tables and constant word-sized compares; lexer keywords and HTTP method names resolve without a hash round.
- **`Bun.hash.crc32()`**: [20–100x faster](https://github.com/oven-sh/bun/pull/25692) on 1MB inputs (2.3 ms → 18 µs on an AVX-512 x64 machine). Now uses zlib's hardware-accelerated implementation (PCLMULQDQ on x86, CRC32 instructions on ARM) instead of a software-only loop.
- **`Buffer.from(array)`**: [up to ~2x faster](https://github.com/oven-sh/bun/pull/26135) for small plain JS arrays. Skips `JSC::construct()` overhead and hits JavaScriptCore's bulk-copy fast path for Int32/Double-shaped arrays.
- **JSON-mode IPC**: fixed an [O(n²) hot loop](https://github.com/oven-sh/bun/pull/25743) when large messages arrive in chunks. Each byte is now scanned exactly once; a 100 MB message from a `node` child arrives in 0.5 s instead of 1.2 s.
- **`tls.getCACertificates('system')` on macOS**: [~10s → ~50ms](https://github.com/oven-sh/bun/pull/30323) on managed Macs. No longer triggers per-certificate OCSP/CRL network fetches when enumerating the keychain.
- **`setImmediate` on Linux/macOS**: [no longer writes to the eventfd on every iteration](https://github.com/oven-sh/bun/pull/26821). strace shows ~44k eventfd writes for a 5s `setImmediate` loop dropping to 0.
- **Event loop on Linux**: now uses [edge-triggered epoll for eventfd wakeups](https://github.com/oven-sh/bun/pull/26815), eliminating an unnecessary `read()` syscall on every loop tick.
- **Event loop under load**: now [drains epoll/kqueue in a tight loop](https://github.com/oven-sh/bun/pull/28823) when more than 1024 fds become ready at once, so one tick can service the whole backlog instead of one 1024-event batch.
- **Module resolver**: [caches not-found results](https://github.com/oven-sh/bun/pull/23505) to skip repeated `stat` / `openat` syscalls for the same missing path during import resolution ([part 2](https://github.com/oven-sh/bun/pull/23506)).
- **Enum-string getters**: `request.cache`, `response.type`, `ws.binaryType`, `socket.localFamily`, and friends now [return cached atom-backed strings](https://github.com/oven-sh/bun/pull/30173) instead of allocating on every access.
- **`bun build --compile`**: embedded `.node` addons are [extracted once to a content-hashed file](https://github.com/oven-sh/bun/pull/29587) in the temp dir and reused across `dlopen()` calls, Workers, and restarts, instead of writing a new copy per load.
- **Incremental GC**: ~60 generated JS classes (`Request`, `Response`, `Stats`, `Dirent`, `Subprocess`, …) [no longer enroll in JSC's output-constraint GC pass](https://github.com/oven-sh/bun/pull/29532). Every edge they expose already fires a write barrier, so the per-mutator-yield rescan was pure overhead.
- **`structuredClone()`**: the dense-number-array fast path [no longer zero-fills the destination](https://github.com/oven-sh/bun/pull/26989) before copying into it.
- **`AbortSignal.abort()`**: [~6% faster](https://github.com/oven-sh/bun/pull/26686) when no listeners are registered. Skips allocating and dispatching the Event entirely.
- Removed an [unnecessary `getcwd()` syscall](https://github.com/oven-sh/bun/pull/27967) from `fs.watch()`.
- Fixed an [operator-precedence bug](https://github.com/oven-sh/bun/pull/27966) in the native-readable stream's `getRemainingChunk` that was triggering an unnecessary `Buffer.alloc` on nearly every chunk.
- Dozens of hot-path micro-optimizations across the runtime: redundant allocations and copies removed from [`response.statusText`](https://github.com/oven-sh/bun/pull/31038), [`hash.digest('base64')`](https://github.com/oven-sh/bun/pull/31037), [`server.fetch(url)`](https://github.com/oven-sh/bun/pull/31062), [`fetch()` with a custom `Host` header](https://github.com/oven-sh/bun/pull/31066), [`package.json` `"exports"` resolution](https://github.com/oven-sh/bun/pull/31036), and the runtime transpiler cache ([#31054](https://github.com/oven-sh/bun/pull/31054), [#31064](https://github.com/oven-sh/bun/pull/31064)).
- **Rejected-promise drain**: draining the rejected-promise list at each macrotask checkpoint is now O(n) instead of O(n²); rejecting 20,000 promises in one tick drops from 19.13 ms to 0.88 ms. [#32554](https://github.com/oven-sh/bun/pull/32554)
- **`Bun.indexOfLine()`**: fixed an O(n²) scan when the buffer contained any non-ASCII byte; a 60 KB buffer with a single `é` before the newline now scans in ~0.01 ms instead of ~15 ms. [#32732](https://github.com/oven-sh/bun/pull/32732)
- **Recursive `fs.cp` on macOS**: once again uses a single whole-tree `clonefile()` when the source contains only regular files and directories and the destination doesn't exist, restoring the fast path lost when Node's relative-symlink rewriting was ported. [#32503](https://github.com/oven-sh/bun/pull/32503)
- **`FileSystemRouter` URL joins**: skip zero-filling two 2 KB stack scratch buffers per join, saving 4 KB of memset per emitted URL in the router and dev server. [#32393](https://github.com/oven-sh/bun/pull/32393)
- `bun install` now explains that an unsupported `bun.lock` version was likely written by a newer Bun and suggests running `bun upgrade`, instead of a bare "Unknown lockfile version" error. [#32465](https://github.com/oven-sh/bun/pull/32465)
- Error messages for `bun install --linker`, `bun build --format` / `--loader` / `--define`, `bun patch` with no argument, and `bun run --filter` on an unreadable workspace `package.json` now echo the offending value and/or show a correct example. [#32470](https://github.com/oven-sh/bun/pull/32470)
- `bun init` now scaffolds every template (blank, library, and all React variants) with TypeScript 7. [#33265](https://github.com/oven-sh/bun/pull/33265)
- The `bun init` template lockfiles have been regenerated so `bun install --frozen-lockfile` passes out of the box. [#33265](https://github.com/oven-sh/bun/pull/33265)
- **ESM imports of builtins**: `import` of `node:fs`, `node:tls`, `node:http`, `node:timers`, and the other builtins with lazily computed exports no longer computes those exports at import time; each is computed when something first binds to it. Plain data exports are still snapshotted at import. `import "node:fs"` was pulling in the whole `node:stream` stack for `ReadStream` and `WriteStream`, taking 13.3 ms where `require("node:fs")` took 7.8 ms. [#37525](https://github.com/oven-sh/bun/pull/37525)
- **`export * from "bun"`**: re-exporting the `bun` module, or loading it through `import()` with a computed specifier, no longer constructs all 115 `Bun.*` properties up front; each is constructed when first bound. One consequence: an invalid `REDIS_URL` now throws when the `redis` export is first used, and the rest of the module loads. [#37714](https://github.com/oven-sh/bun/pull/37714)
- **`node:process` and `node:module`**: both now construct only the exports a file imports. `import process from "node:process"` no longer builds `stdout`, `stderr`, and `stdin` or loads `node:tty` and `node:stream` for them, which was adding 10–18 ms to the startup of an otherwise empty file; `import { createRequire } from "node:module"` constructs only `createRequire`. [#37726](https://github.com/oven-sh/bun/pull/37726)

### Other JavaScriptCore changes

- `Iterator.prototype.includes()` is enabled by default (319f94b3db4a). [#36794](https://github.com/oven-sh/bun/pull/36794)
- Cyclic `Array#join` / `toString` now throws `RangeError` per spec instead of returning `""` (f2f2c2ddf637). [#36794](https://github.com/oven-sh/bun/pull/36794)
- The debugger now resolves breakpoints in ES modules loaded by `bun test --isolate` or `--parallel` and in `bun build --compile` executables (oven-sh/WebKit#405). Previously `Debugger.setBreakpoint` replied "Could not resolve breakpoint" and `Debugger.setBreakpointByUrl` returned no locations. [#37352](https://github.com/oven-sh/bun/pull/37352)
- The `ar` locale, for example, now formats numbers with Latin digits.
- `new URL()` and `url.domainToASCII()` now take their Unicode 16 hostname mappings (`ẞ` to `ß`) from ICU instead of a table in Bun.
- `Math.round` returned the wrong result via the `floor(x+0.5)` JIT fast path for `0.49999999999999994` ([312687](https://bugs.webkit.org/show_bug.cgi?id=312687)).
- JIT miscompiled self-comparisons like `x === x` ([306820](https://bugs.webkit.org/show_bug.cgi?id=306820)).
- JIT miscompiled `%` results that should be `-0` ([308016](https://bugs.webkit.org/show_bug.cgi?id=308016)).
- JIT miscompiled guards that a value matches a known constant ([311779](https://bugs.webkit.org/show_bug.cgi?id=311779)).
- `Array` `ToPrimitive` fast path ignored `valueOf` overrides ([312672](https://bugs.webkit.org/show_bug.cgi?id=312672), [314582](https://bugs.webkit.org/show_bug.cgi?id=314582)).
- `String#split` RegExp fast path missed side effects ([316508](https://bugs.webkit.org/show_bug.cgi?id=316508)).
- `matchAll` fast path ignored `Symbol.species` on RegExp subclasses after `RegExp.prototype` was modified ([316047](https://bugs.webkit.org/show_bug.cgi?id=316047)).
- Map/Set iteration fast path skipped `IteratorClose` when the callback threw ([316495](https://bugs.webkit.org/show_bug.cgi?id=316495), [315979](https://bugs.webkit.org/show_bug.cgi?id=315979)).
- `Array#concat` fast path could return wrong results when concatenating arrays with mixed element kinds ([314015](https://bugs.webkit.org/show_bug.cgi?id=314015)).
- `String#search` JIT fast path mishandled `lastIndex` for global/sticky regexes ([313139](https://bugs.webkit.org/show_bug.cgi?id=313139)).
- RegExp engine: named groups dropped from `indices.groups` on backtrack with `/d` (e1cdfab158f3).
- RegExp engine: `/^(?:c||b)/` mid-empty alternatives gave wrong JIT result (e6d0f57f8d04).
- RegExp engine: `/i` ASCII ranges didn't match `ſ` (U+017F) and `K` (U+212A) (faf717c136d1).
- RegExp engine: greedy backtracking didn't try up to max count ([316378](https://bugs.webkit.org/show_bug.cgi?id=316378)).
- `Promise.resolve` returned a base Promise even for subclasses ([309472](https://bugs.webkit.org/show_bug.cgi?id=309472)).
- `Promise.prototype.finally` throw timing in `SpeciesConstructor` ([312466](https://bugs.webkit.org/show_bug.cgi?id=312466)).
- Promise jobs ran with the realm of a cross-realm settle site ([316187](https://bugs.webkit.org/show_bug.cgi?id=316187)).
- Deferred module namespace's `"then"` leaked into `Object.keys` ([316610](https://bugs.webkit.org/show_bug.cgi?id=316610)).
- Intl spec conformance: `Intl.NumberFormat` ([303270](https://bugs.webkit.org/show_bug.cgi?id=303270)), `Intl.Locale.prototype.getWeekInfo` ([302587](https://bugs.webkit.org/show_bug.cgi?id=302587)), `Intl.Segmenter` `isWordLike` off-by-one ([312596](https://bugs.webkit.org/show_bug.cgi?id=312596)), `Intl.Locale` canonicalization before language override ([312693](https://bugs.webkit.org/show_bug.cgi?id=312693)), `Intl.DateTimeFormat` legacy `[[TimeZone]]` ([312841](https://bugs.webkit.org/show_bug.cgi?id=312841)) and `RangeError` for legacy non-IANA timezones ([296248](https://bugs.webkit.org/show_bug.cgi?id=296248)), `String.prototype.substring` uses `ToIntegerOrInfinity` ([300578](https://bugs.webkit.org/show_bug.cgi?id=300578)).
- A crash in **WebAssembly** resizable memory buffers is fixed.
- Deep import graphs of modules using top-level `await` load safely.
- A GC bug in `eval` has been fixed.
- Garbage-collector heap cleanup is synchronized with background scanning threads.
- The JIT rechecks the prototype chain when optimizing prototype property accesses.
- Wasm interpreter miscomputed `memory.atomic.*` / `memory.grow` results ([316507](https://bugs.webkit.org/show_bug.cgi?id=316507)).
- Better error messages: calling a class constructor without `new` now names the class (dabbab2ba61e).
- Better error messages: a non-object return from a derived constructor now names the constructor (e2c7e56a9516).

### Security hardening

- **TLS** `tls.Server` applies its default `rejectUnauthorized: true` to incoming connections and gates peer-certificate verification on `requestCert`, matching Node.
- **TLS** Wildcard certificates no longer match across multiple labels.
- **TLS** `fetch()` supports mTLS: pass `cert` and `key` in `tls` and each request uses its own client certificate.
- **TLS** Long `tls.passphrase` values are handled safely.
- **HTTP** `res.statusMessage` and `writeEarlyHints` validate against CRLF.
- **HTTP** `fetch()` drops caller-supplied `Transfer-Encoding` for fixed-size bodies.
- **HTTP** `fetch()` caps user-supplied header count.
- **HTTP** `node:http2` zero-fills DATA-frame padding.
- **HTTP** `node:http2` validates padding lengths.
- **HTTP** `node:http2` rejects malformed request pseudo-header blocks.
- **HTTP** The HTTP/3 server enforces the same header-byte and client-certificate rules as TCP.
- **`bun install` and registry auth** Package folder names are validated before extraction.
- **`bun install` and registry auth** Off-registry tarballs migrated from `package-lock.json` require integrity.
- **`bun install` and registry auth** Transitive `file:` targets are constrained.
- **`bun install` and registry auth** Bin links that escape the package directory are rejected.
- **`bun install` and registry auth** Symlink entries in git/GitHub tarballs are created after every file and directory entry.
- **`bun install` and registry auth** Trusted-dependency names, `.npmrc` scope names, and local `file:` paths are compared by their full bytes rather than a hash.
- **`bun install` and registry auth** Registry tokens stay scoped to their configured host and are never sent cross-origin or downgraded to `http://`
- **`bun install` and registry auth** Credentials are redacted from error and verbose output and from published `dist.tarball` URLs.
- **`bun install` and registry auth** Build artifacts are created with owner-only permissions.
- **`bun install` and registry auth** `NODE_COMPILE_CACHE` files are `0600`
- **`bun install` and registry auth** The install-time security scanner receives package data over a pipe instead of process arguments.
- **Crypto**: PostgreSQL SCRAM-SHA-256 server-signature verification is constant-time.
- **Crypto**: WebCrypto pads the JWK `"d"` field to the correct length for EC private keys.
- **Crypto**: `crypto.subtle.deriveBits` handles `length: 0`, omitted, and non-multiple-of-8 lengths per spec.
- **Crypto**: `crypto.subtle.importKey` rejects Ed25519 keys whose public half does not match.
- **Crypto**: `crypto.getCiphers()` / `getHashes()` return lowercase names.
- **Crypto**: `node:crypto` random functions draw from BoringSSL's DRBG again.
- **Dependencies**: BoringSSL updated to upstream `606d3a344` (post-quantum algorithms, plus upstream fixes to RC2 and TLS handshake handling).
- **Dependencies**: bundled root certificates updated to NSS 3.124 (the store shipping in Firefox 152), removing 25 expired or distrusted roots.

### Platform

- Sockets are now created with `WSA_FLAG_NO_HANDLE_INHERIT`, so a detached child spawned while a server is listening no longer inherits the listen socket and holds the port open after the parent exits. [#36938](https://github.com/oven-sh/bun/pull/36938)

### Bug fixes

We fixed over 2,900 issues since Bun 1.3. Many were found through continuous fuzzing of runtime APIs with Fuzzilli, coverage-guided fuzzing of system calls and parsers, AddressSanitizer in CI, LeakSanitizer in CI, and a continuously-running Claude Code session fuzzing Bun canary's outputs against Bun v1.3.14 and Node.js.

- **`bun build --compile`**: Linux standalone executables run on WSL1. The `.bun` payload is now embedded inside an existing segment of the binary instead of adding a new one, a layout WSL1's program loader rejects. [#29967](https://github.com/oven-sh/bun/pull/29967)
- `path.resolve`, `path.relative`, and `path.toNamespacedPath` handle arbitrarily long paths.
- The timer behind `Atomics.waitAsync` is thread-safe.
- Async zstd compression, `crypto.scrypt`, and `Bun.Transpiler` keep their input buffers alive for the duration of the operation.
- Fixed `Request.formData()` truncating small binary file uploads at the first null byte, so a 4-byte gzip header would come back as 3 bytes.
- Fixed `process.env` being completely empty when the current working directory lacks read permission (common in locked-down containers). [#28785](https://github.com/oven-sh/bun/pull/28785)
- Bun now starts on older Linux kernels (< 3.17, e.g. Synology NAS) that lack the `getrandom()` syscall. [#27282](https://github.com/oven-sh/bun/pull/27282)
- Bun no longer returns `EINVAL` on socket reads under gVisor (Google Cloud Run). [#27390](https://github.com/oven-sh/bun/pull/27390)
- Fixed piping Bun's output into `less`, `fzf`, and `fx`. Bun was clobbering the downstream program's raw mode at exit, leaving it unresponsive to keypresses. [#29593](https://github.com/oven-sh/bun/pull/29593)
- Fixed `Bun.Glob` and `fs.readdir({ recursive: true })` silently skipping files on bind mounts, FUSE, NFS, and similar filesystems. [#25838](https://github.com/oven-sh/bun/pull/25838)
- The Linux file watcher handles large batches of inotify events.
- Fixed `bun --hot` on macOS losing track of files after editors performed atomic write-then-rename saves, causing the module graph to flip between old and new code. [#29529](https://github.com/oven-sh/bun/pull/29529)
- Bun's HTTP server handles absolute-form request URLs on keep-alive connections.
- Fixed Bun's DNS cache never expiring stale entries while any in-flight request to that host held a reference, so DNS results never refreshed under sustained traffic. [#28271](https://github.com/oven-sh/bun/pull/28271)
- Fixed `require()` of an ES module deadlocking when the module graph contained a diamond dependency through a barrel file. [#30527](https://github.com/oven-sh/bun/pull/30527)
- Deeply nested expressions and JSX throw a catchable error in `bun build` and the dev server.
- **`Bun.S3Client`**: fixed a leak when a download stream is cancelled while the socket is idle. [#32608](https://github.com/oven-sh/bun/pull/32608)
- **`Bun.S3Client`**: a `Content-Length: 0` + `Connection: close` response (the shape of every S3 PUT/DELETE) is no longer misreported as `ConnectionClosed`, fixing spurious retries through connection-recycling proxies. [#33292](https://github.com/oven-sh/bun/pull/33292)
- **`Bun.Glob`**: explicitly-named dotfile segments match without `dot: true`, matching bash and fast-glob.
- **`Bun.Glob`**: literal segments resolve through symlinked directories without `followSymlinks: true`, matching bash and fast-glob.
- **`Bun.Glob`**: `absolute: true` reports `ENAMETOOLONG` for over-long paths.
- **`Bun.Glob`**: deeply nested braces are handled.
- **`Bun.color()`**: 24-bit `number` inputs like `0xff0000` are treated as opaque instead of alpha 0.
- **`Bun.color()`**: `ansi-16` output emits the color number as decimal digits instead of a raw control byte.
- **`Bun.color()`**: `ansi-256` no longer underflows the grey ramp.
- **`Bun.color()`**: `hsl` / `lab` output is parseable.
- **`Bun.color()`**: `lab()` / `oklab()` on the sRGB gamut boundary no longer desaturate in their sRGB fallback.
- **`Bun.Cookie`**: `Expires` serializes as a valid RFC 6265 date (previously every date had the wrong weekday, an unpadded day, and `-0000` instead of `GMT`). [#32926](https://github.com/oven-sh/bun/pull/32926)
- **`Bun.Cookie`**: `parse()` records both `Expires` and `Max-Age` regardless of order. [#33393](https://github.com/oven-sh/bun/pull/33393)
- **`Bun.Cookie`**: `isExpired()` applies the RFC 6265 precedence rule. [#33393](https://github.com/oven-sh/bun/pull/33393)
- **`Bun.YAML`**: `parse()` combines `\uD8xx\uDCxx` surrogate-pair escapes so JSON documents containing emoji parse correctly. [#32731](https://github.com/oven-sh/bun/pull/32731)
- **`Bun.YAML`**: `stringify()` no longer emits `\L` / `\P` for U+00A8/U+00A9. [#32718](https://github.com/oven-sh/bun/pull/32718)
- **`HTMLRewriter`**: `element.getAttribute()` returns `""` for present-but-empty attributes (including boolean attributes like `disabled`) instead of `null`. [#32840](https://github.com/oven-sh/bun/pull/32840)
- **`HTMLRewriter`**: `setAttribute` / `removeAttribute` throw on invalid arguments instead of returning an `Error` object. [#32840](https://github.com/oven-sh/bun/pull/32840)
- **`bun:sqlite`**: generic errors (syntax errors, unknown tables, unknown columns) set `error.code` to `"SQLITE_ERROR"` instead of `undefined`, matching better-sqlite3. [#33397](https://github.com/oven-sh/bun/pull/33397)
- **`Bun.stringWidth()`**: bidi controls (U+202A–U+202E, U+2066–U+2069, U+061C) and Mongolian variation selectors are now zero-width, matching `wcwidth(3)` and the `string-width` package. [#33049](https://github.com/oven-sh/bun/pull/33049)
- `Bun.JSON5.parse`, `Bun.JSONC.parse`, `Bun.TOML.parse`, `Bun.YAML.parse`, and the `Bun.markdown` renderers throw `ERR_OUT_OF_RANGE` on oversized inputs.
- Sockets with pending writes are torn down cleanly on peer reset on macOS.
- Fixed `fetch()` hanging at 100% CPU when a `node:stream` `Readable` whose `_read()` pushes synchronously was passed as the request body. [#36087](https://github.com/oven-sh/bun/pull/36087)
- Fixed `node:https` server truncating large response bodies when the client half-closed the connection before Bun had finished flushing its buffered TLS writes. [#35109](https://github.com/oven-sh/bun/pull/35109)
- Fixed `process.setuid()`, `process.seteuid()`, and related identity calls deadlocking on Linux. [#33565](https://github.com/oven-sh/bun/pull/33565)
- Fixed nested `bun run` exiting before its child on Ctrl-C — the signal-forwarding handler now stays installed across deliveries, so `bun run` waits for the script's cleanup to finish. [#36711](https://github.com/oven-sh/bun/pull/36711)
- The epoll\_pwait fallback no longer busy-spins on sub-millisecond timers. [#34779](https://github.com/oven-sh/bun/pull/34779) [#34780](https://github.com/oven-sh/bun/pull/34780)
- epoll/kqueue waits now subtract elapsed time when retrying after EINTR instead of over-waiting. [#34779](https://github.com/oven-sh/bun/pull/34779) [#34780](https://github.com/oven-sh/bun/pull/34780)
- Loading a glibc-linked native addon on musl-based Linux now throws `ERR_DLOPEN_FAILED` instead of segfaulting.
- Restored the Izenpe.com root CA to the bundled certificate store; a bug in the cert-bundling script had accidentally dropped it. [#31612](https://github.com/oven-sh/bun/pull/31612)
- Fixed a crash when aborting a `fetch()` after its response body stream had been garbage collected.
- Comma-separated `Connection`, `Transfer-Encoding`, `Content-Encoding`, and `Upgrade` headers are now parsed as token lists. [#36777](https://github.com/oven-sh/bun/pull/36777) [#36370](https://github.com/oven-sh/bun/pull/36370) [#34425](https://github.com/oven-sh/bun/pull/34425) [#36588](https://github.com/oven-sh/bun/pull/36588)
- File-response streams tear down cleanly on read errors.
- **Sockets**: TLS sockets now FIN the TCP write side after `SSL_shutdown` completes on half-open connections.
- **Sockets**: UDP sockets stop dispatching batched packets once `close()` is called from a data handler.
- **Sockets**: connecting to over-long Unix socket paths on Linux returns an error.
- **DNS**: `dns.Resolver` no longer keeps the event loop alive for an extra retransmit interval after its last query completes via c-ares timeout. [#36192](https://github.com/oven-sh/bun/pull/36192)
- **DNS**: fixed a `FilePoll` slot leak per distinct-hostname libinfo lookup (`fetch`, `Bun.connect`, WebSocket, QUIC) on macOS. [#34423](https://github.com/oven-sh/bun/pull/34423)
- **DNS**: fixed a memory leak of pending-lookup hostnames when the resolver pool is dropped. [#33901](https://github.com/oven-sh/bun/pull/33901)
- **`Worker` termination**: fixed several crashes when `worker.terminate()` ran while sockets, WebSockets, CJS `require`, `process.emit`, `fs.readFile`, or DNS lookups were in flight.
- **`Bun.file()`**: fixed an fd leak on POSIX when an abandoned `.stream()` reader is garbage-collected. [#35211](https://github.com/oven-sh/bun/pull/35211)
- **Module resolver**: fixed a bug in `tsconfig` `paths` wildcard resolution when the pattern's prefix and suffix overlap.
- **Module loading**: importing a long `data:` URL no longer fails with `ENAMETOOLONG`. [#37157](https://github.com/oven-sh/bun/pull/37157)
- **Module loading**: CSS imports at runtime now default-export `{}`, matching `bun build` behavior. [#35163](https://github.com/oven-sh/bun/pull/35163)
- **Parser**: JS, TS, and TOML error columns now count UTF-16 code units, so editors jump to the right column. [#34720](https://github.com/oven-sh/bun/pull/34720)
- **Parser**: error locations are correct for rest-with-default and parenthesized destructuring pattern syntax errors. [#35970](https://github.com/oven-sh/bun/pull/35970)
- `ResolveMessage` `.message`, `.specifier`, and `.referrer` render non-ASCII paths correctly. [#34096](https://github.com/oven-sh/bun/pull/34096)
- **Parser**: deeply nested TOML throws `RangeError`.
- **Parser**: the sourcemap parser rejects malformed VLQ fields with a proper error.
- **Parser**: the CSS parser reports custom at-rule block parse errors.
- **`structuredClone`**: malformed `Set`, `Map`, and `RegExp` payloads are rejected.
- Duplex-wrap origin/listeners are now GC-rooted via the JS wrapper instead of Strong handles (rooting-model cleanup, not a leak). [#34672](https://github.com/oven-sh/bun/pull/34672)
- **`HTMLRewriter`**: abandoned transforms are collected safely.
- Process exit and worker termination are safe while an off-thread transform is in flight.
- **`bun build --compile`**: inject temp files use random names to avoid cross-process collisions.
- **`bun build --compile`**: single-file executables validate the Mach-O `__BUN` segment size.
- **`Bun.plugin`**: an object-loader `exports` getter that throws is handled.
- `WebAssembly.instantiateStreaming` accepts `application/wasm` regardless of `Content-Type` letter case. [#33229](https://github.com/oven-sh/bun/pull/33229)
- `multipart/form-data` parsing matches `form-data` case-insensitively and accepts HTAB whitespace. [#34362](https://github.com/oven-sh/bun/pull/34362)
- Oversized strings throw `ERR_STRING_TOO_LONG`.
- `--cpu-prof-dir` and `--heap-prof-dir` report an error on over-long paths.
- `Bun.JSONC.parse` throws `SyntaxError` on invalid input instead of a `BuildMessage`.
- bunfig.toml type-mismatch errors print human-readable type names.
- `Error.stack` computation, `Blob` content-type handling, and deserialized `Blob` `lastModified` are hardened.
- `node:vm` `link()`, `Worker` `name`, and FFI threadsafe callbacks are hardened.
- Sliced `Bun.file()` reads respect the slice bounds.
- `process.stdin` no longer ignores `highWaterMark` backpressure when reading from a pipe.
- The file watcher returns an error when its thread fails to spawn.
- Nested `${...}` inside `${VAR:-default}` in `.env` files parses correctly.
- Native `SIGABRT` and `SIGTRAP` crashes now produce Bun crash reports.
- Heap snapshots report `module.children` and `module._compile` for better memory debugging.
- `bun create` no longer busy-waits on git operations.
- `Bun.sliceAnsi` returns the ellipsis when a start-cut range contains only zero-width clusters.
- **TLS sockets**: the handshake idles correctly while waiting on the peer.
- **Module resolver**: over-long `package.json` `browser` map keys are handled; the package loads and the other entries in the map still apply.
- **`file:../` paths in `overrides` and `resolutions`** are no longer rejected with "unsafe folder path"; paths declared in the root `package.json` are trusted the same as direct dependencies. [#32452](https://github.com/oven-sh/bun/pull/32452)
- **Transitive `file:` dependencies** of a local `file:` package are now linked into `node_modules` under the hoisted linker, fixing `Cannot find module` at runtime for the nested package. [#33159](https://github.com/oven-sh/bun/pull/33159)
- **Lockfile migration** from `package-lock.json` and `pnpm-lock.yaml` no longer silently drops `file:` dependencies whose `os` / `cpu` fields don't match the host. [#33155](https://github.com/oven-sh/bun/pull/33155)
- **The isolated linker** no longer leaves `node_modules/.bun` symlinked to the shared global store after `install.globalStore` is disabled. [#32182](https://github.com/oven-sh/bun/pull/32182)
- **The isolated linker**: ranged peer dependencies loaded from `bun.lock` now resolve to the same version on the second install as the first. [#32182](https://github.com/oven-sh/bun/pull/32182)
- **`bun pm pkg set`** no longer writes a garbage property key into `package.json` when the key path contains a bracketed index like `contributors[0]=alice`. [#33186](https://github.com/oven-sh/bun/pull/33186)
- **Registry request retries** follow 3xx redirects to the correct URL.
- **Registry request retries**: a retry after a cross-origin redirect keeps its `Authorization` header.
- **`patchedDependencies`** entries with malformed hunks are handled by `bun install`.
- **Error message formatting**: several `bun install` error paths no longer leak raw markup tags (`Integrity check failed<r> for tarball`) into terminal output. [#33245](https://github.com/oven-sh/bun/pull/33245)
- A crash in the HTTP client in request-failure handling has been fixed.
- **`Bun.YAML.stringify()`, `Bun.TOML.stringify()`, `Bun.JSON5.stringify()`**: a boxed `String` or `Number` whose `Symbol.toPrimitive`, `valueOf`, or `toString` throws now surfaces that exception; previously it was dropped (and tripped an assertion in debug builds). [#37025](https://github.com/oven-sh/bun/pull/37025)
- **`Bun.inspect()` and `Bun.deepEquals()`**: objects mutated by a custom inspect hook or getter during formatting or comparison are handled safely.
- GitHub Actions error annotations no longer drop non-ASCII bytes from the title and body, so a test throwing `"hello é world"` shows the full message instead of a truncated fragment. [#32736](https://github.com/oven-sh/bun/pull/32736)
- `expect.any(Object)` now matches `null` and rejects functions, matching Jest's `typeof === "object"` semantics. [#32922](https://github.com/oven-sh/bun/pull/32922)
- `expect().toContain()` now compares array and iterable elements with `===` instead of `Object.is`, matching Jest. `expect([-0]).toContain(0)` now passes and `expect([NaN]).toContain(NaN)` now fails. [#32950](https://github.com/oven-sh/bun/pull/32950)
- `jest.resetAllMocks()` and `vi.resetAllMocks()` now reset mock implementations and return values, not just call history. Previously both were bound to the same function as `clearAllMocks()`. [#33374](https://github.com/oven-sh/bun/pull/33374)
- Fixed the `oven/bun` Debian and Debian-slim Docker images failing `apt-get` over HTTPS with `certificate verify failed`; `ca-certificates` is now installed in the final stage. [#33136](https://github.com/oven-sh/bun/pull/33136)

## Thank you!

Bun is free, open source, and MIT-licensed. We receive a lot of contributions from the community, and we'd like to thank everyone who fixed a bug or contributed a feature in this release.

- [@190n](https://github.com/190n)
- [@alanstott](https://github.com/alanstott)
- [@alii](https://github.com/alii)
- [@alinalihassan](https://github.com/alinalihassan)
- [@amdad121](https://github.com/amdad121)
- [@ant-kurt](https://github.com/ant-kurt)
- [@anthonybaldwin](https://github.com/anthonybaldwin)
- [@avarayr](https://github.com/avarayr)
- [@baboon-king](https://github.com/baboon-king)
- [@billywhizz](https://github.com/billywhizz)
- [@bmwalters](https://github.com/bmwalters)
- [@Boshen](https://github.com/Boshen)
- [@braden-w](https://github.com/braden-w)
- [@c-stoeckl](https://github.com/c-stoeckl)
- [@carlsmedstad](https://github.com/carlsmedstad)
- [@chrislloyd](https://github.com/chrislloyd)
- [@cirospaciari](https://github.com/cirospaciari)
- [@coleleavitt](https://github.com/coleleavitt)
- [@connerlphillippi](https://github.com/connerlphillippi)
- [@crishoj](https://github.com/crishoj)
- [@csvlad](https://github.com/csvlad)
- [@d4mr](https://github.com/d4mr)
- [@darwin808](https://github.com/darwin808)
- [@ddmoney420](https://github.com/ddmoney420)
- [@dioro](https://github.com/dioro)
- [@djs5008](https://github.com/djs5008)
- [@dylan-conway](https://github.com/dylan-conway)
- [@Elfayer](https://github.com/Elfayer)
- [@emwadde](https://github.com/emwadde)
- [@eroderust](https://github.com/eroderust)
- [@fraidev](https://github.com/fraidev)
- [@franklinfollis](https://github.com/franklinfollis)
- [@gameroman](https://github.com/gameroman)
- [@gaowhen](https://github.com/gaowhen)
- [@halil-pan](https://github.com/halil-pan)
- [@hamidrezahanafi](https://github.com/hamidrezahanafi)
- [@HK-SHAO](https://github.com/HK-SHAO)
- [@Hona](https://github.com/Hona)
- [@hoXyy](https://github.com/hoXyy)
- [@ig-ant](https://github.com/ig-ant)
- [@igorkofman](https://github.com/igorkofman)
- [@jackkleeman](https://github.com/jackkleeman)
- [@Jarred-Sumner](https://github.com/Jarred-Sumner)
- [@jsparkdev](https://github.com/jsparkdev)
- [@kirillmarkelov](https://github.com/kirillmarkelov)
- [@kjanat](https://github.com/kjanat)
- [@km-anthropic](https://github.com/km-anthropic)
- [@kylekz](https://github.com/kylekz)
- [@ldkhang1201](https://github.com/ldkhang1201)
- [@Lillious](https://github.com/Lillious)
- [@lydiahallie](https://github.com/lydiahallie)
- [@makuko](https://github.com/makuko)
- [@mariusz4044](https://github.com/mariusz4044)
- [@markovejnovic](https://github.com/markovejnovic)
- [@martinamps](https://github.com/martinamps)
- [@mattermoran](https://github.com/mattermoran)
- [@MiniGod](https://github.com/MiniGod)
- [@mippbipp](https://github.com/mippbipp)
- [@mmitchellg5](https://github.com/mmitchellg5)
- [@nathanosoares](https://github.com/nathanosoares)
- [@nektro](https://github.com/nektro)
- [@nfreya](https://github.com/nfreya)
- [@NicoCevallos](https://github.com/NicoCevallos)
- [@nkxxll](https://github.com/nkxxll)
- [@ocodista](https://github.com/ocodista)
- [@paperclover](https://github.com/paperclover)
- [@pfgithub](https://github.com/pfgithub)
- [@prekucki](https://github.com/prekucki)
- [@rekram1-node](https://github.com/rekram1-node)
- [@remorses](https://github.com/remorses)
- [@RiskyMH](https://github.com/RiskyMH)
- [@robjtede](https://github.com/robjtede)
- [@RyanGst](https://github.com/RyanGst)
- [@shendongming](https://github.com/shendongming)
- [@ShlomoCode](https://github.com/ShlomoCode)
- [@sosukesuzuki](https://github.com/sosukesuzuki)
- [@sqdshguy](https://github.com/sqdshguy)
- [@ssing2](https://github.com/ssing2)
- [@Tamicktom](https://github.com/Tamicktom)
- [@taylordotfish](https://github.com/taylordotfish)
- [@vadim-anthropic](https://github.com/vadim-anthropic)
- [@veggiesaurus](https://github.com/veggiesaurus)
- [@WhiteMinds](https://github.com/WhiteMinds)
- [@xingxingmofashu](https://github.com/xingxingmofashu)
- [@yinheli](https://github.com/yinheli)
- [@zackradisic](https://github.com/zackradisic)
- [@brunorodmoreira](https://github.com/brunorodmoreira)
- [@pxseu](https://github.com/pxseu)