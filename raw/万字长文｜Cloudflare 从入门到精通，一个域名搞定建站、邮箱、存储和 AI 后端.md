---
title: "万字长文｜Cloudflare 从入门到精通，一个域名搞定建站、邮箱、存储和 AI 后端"
source: "https://x.com/xiaomovps/status/2108371593747709979"
author:
  - "[[@xiaomovps]]"
published: 2026-10-09
created: 2026-10-09
description: "很多人第一次登录 Cloudflare，是因为某篇建站教程让你“把域名接进 Cloudflare”。照着改完域名服务器，网站确实能打开了，可再回到控制台，左边一长串菜单摆在眼前：域名、计算、AI、存储和数据库、应用程序安全、Zero Trust。每一项都像有用，又不知道哪些跟自己..."
tags:
  - "clippings"
---
![Image](https://pbs.twimg.com/media/HUH3bj0bQAQLxso?format=jpg&name=large)

很多人第一次登录 Cloudflare，是因为某篇建站教程让你“把域名接进 Cloudflare”。照着改完域名服务器，网站确实能打开了，可再回到控制台，左边一长串菜单摆在眼前：域名、计算、AI、存储和数据库、应用程序安全、Zero Trust。每一项都像有用，又不知道哪些跟自己有关。

我从写 VPS 教程开始就一直在用 Cloudflare，前后单独写过域名托管、CDN、WAF 规则、邮件路由和优选 IP。9 月发过一条 Cloudflare 十项福利，后来又陆续发了域名邮箱、防 AI 爬虫、数字名片、低成本做 AI 应用和新 CLI 几条短帖。零散的点越攒越多，这次干脆串成一篇。

![Image](https://pbs.twimg.com/media/HUH3hEHbQAE46-i?format=jpg&name=large)

这篇文章用一个域名贯穿全程。先把域名接进 Cloudflare，配好解析和 HTTPS；再从 GitHub 仓库发布一个网站，给域名配一个能收信的邮箱，用 R2 存图片和备份；最后写一个 Worker，调用 Workers AI 跑开源模型，并把整个账号交给 Agent 通过命令行管理。

标题写了从入门到精通，这里的精通也有一个实际范围。你能用免费版独立搭起个人网站、域名邮箱、对象存储和一个小型 AI 接口，知道每项服务的免费额度在哪里，遇到常见报错知道先查什么，也知道涉及 API 令牌和删除操作时该停下来确认。企业级 WAF 调优、Zero Trust 组网和大规模付费架构，不在这一篇里展开。

正文用 [example.com](https://example.com/) 代替你的域名，操作时换成自己的即可。截图里的演示域名是我的 [79702701.xyz](https://79702701.xyz/)，控制台是中文界面，菜单名以截图为准。

## 本文导读

**01｜先把域名接进来**

第一章说清 Cloudflare 对普通人有什么用，第二、三章完成域名接入、DNS 和 HTTPS。看完这三章，你的域名就已经在 Cloudflare 上正常工作。

**02｜网站、邮箱和存储**

第四章从 GitHub 仓库发布网站并绑定域名，第五章配置域名邮箱，第六章用 R2 存放图片和备份。这三样加起来，就是一个个人站点最常用的基础设施。

**03｜挡住不该来的流量**

第七章处理 AI 爬虫和机器人流量，知道谁在爬你的网站，哪些能直接拦，哪些只是拖住。

**04｜给网站加上后端和 AI**

第八章写第一个 Worker，第九章接上 Workers AI，并介绍 Cloudflare 新发布的 Clef 决策模型。

**05｜交给 Agent，再留一张速查表**

第十章用新的 cf 命令行，让 Claude Code、Codex 或 Pi 这类 Agent 管理 Cloudflare。第十一章汇总免费额度和常见故障，只想解决眼前问题，可以直接从最后一章开始查。

# 一、Cloudflare 能替普通人做什么

## 1\. 它站在你的网站前面

很多人把 Cloudflare 理解成一个 CDN，让网站打开快一点。这只说对了一半。

更准确的理解是，Cloudflare 站在访客和你的服务器之间。域名接进来以后，访客的请求先到 Cloudflare 的网络，再由它决定怎么处理：直接返回缓存，转给你的服务器，拦下可疑流量，或者交给运行在 Cloudflare 上的代码。

所以它能做的事情分成三层。

- **网站入口。** DNS 解析、CDN 加速、HTTPS 证书和基础防护。这是大多数人用 Cloudflare 的起点。
- **开发者平台。** Workers 运行网站和后端代码，R2、KV、D1 负责存储。没有服务器，也能做出一个完整的小应用。
- **Agent 基础设施。** Workers AI 能直接调用开源模型，Clef 专门帮 Agent 做判断，新的 cf 命令行则是为 Agent 设计的操作入口。

## 2\. 免费版已经够个人用很久

这篇文章的所有操作都在免费版内完成。个人网站、作品页、文档站和小工具，大多数时候碰不到免费额度的上限。

| 服务 | 免费额度（截至 2026 年 10 月官方文档） |
| --- | --- |
| Workers | 每天 100,000 次请求，每次最多 10 毫秒 CPU 时间；访问静态资源的请求免费且不限量 |
| R2 | 每月 10 GB 存储，100 万次 A 类操作，1,000 万次 B 类操作，出站流量免费 |
| Workers AI | 每天 10,000 Neurons |
| Email Routing | 接收和转发免费 |

这些数字以后可能调整，正式使用前以官方文档为准。每项服务的细节放在对应章节里。

## 3\. 读完以后的完成标准

学完这篇文章，你应该可以完成下面这些事。

- 把一个域名接进 Cloudflare，分清已代理和仅 DNS 两种解析
- 选对 SSL/TLS 加密模式，避开“重定向次数过多”
- 从 GitHub 仓库发布网站，并绑定自己的域名
- 让 hi@example.com 这样的地址收信，并转发到常用邮箱
- 创建 R2 存储桶，用自己的域名公开访问文件
- 看清哪些 AI 爬虫在访问网站，并开启 AI 迷宫
- 部署一个 Worker，让它调用开源模型返回回答
- 让 Agent 用 cf 查命令、预览改动，再执行

这些服务看起来很多，最后都会落在同一个域名上。接下来先从控制台开始。

# 二、把域名接进 Cloudflare

## 1\. 先认控制台的入口地图

登录 [Cloudflare 控制台](https://dash.cloudflare.com/) 以后，左侧菜单是整个账号的入口。第一次不用把每一项都点开，先记住和本文有关的几组。

- **域名**：管理接进来的域名，每个域名有自己的 DNS、SSL/TLS 和安全设置
- **计算**：Workers 和 Pages、电子邮件服务都在这里
- **AI**：Workers AI 模型
- **存储和数据库**：R2 对象存储、Workers KV、D1 数据库

Cloudflare 的控制台改版比较频繁，菜单名称和位置可能和截图有出入。找不到时，按 ⌘K 打开顶部的搜索框，直接搜功能名，通常比翻菜单快。

![Image](https://pbs.twimg.com/media/HUH3r8ibQAMVTJj?format=jpg&name=large)

## 2\. 添加域名

进入“域名”，选择接入新域名的入口（英文界面是 Onboard a domain），输入根域名 [example.com](https://example.com/)。这里填的是不带 www 的主域名，子域名会在后面的 DNS 记录里管理。

继续以后选择 Free 计划。Cloudflare 会扫描这个域名现有的 DNS 记录，并列出它找到的结果。

扫描结果不一定完整。重点核对三类记录：根域名 [example.com](https://example.com/) 指向哪里，www 等常用子域名在不在，邮箱用的 MX、SPF、DKIM 记录有没有漏。漏掉的记录手动补上，再继续。这一步漏了邮件记录，切换以后最常见的结果就是收不到信。

## 3\. 去注册商修改域名服务器

Cloudflare 会给你分配两条域名服务器地址，形如 [ashton.ns.cloudflare.com](https://ashton.ns.cloudflare.com/)。接下来要回到买域名的地方，比如 Namecheap、Spaceship 或阿里云，把原来的域名服务器换成这两条。

接入以后，这两条地址也能随时在域名的 DNS → 设置里查到。

![Image](https://pbs.twimg.com/media/HUH3uPZbQAgAciE?format=jpg&name=large)

修改之前先确认一件事：如果注册商那边开启了 DNSSEC，要先关闭。Cloudflare 官方文档专门提醒过，带着旧的 DNSSEC 切换域名服务器，可能导致域名暂时无法访问。接入完成后，可以在同一个页面里重新启用。

各家注册商的修改入口不同，我之前单独写过一篇[域名托管到 Cloudflare 的完整步骤](https://www.legacyvps.com/archives/add-domain-to-cloudflare)，找不到入口可以对照着看。

## 4\. 等待生效，认识域名自己的菜单

域名服务器的修改需要时间传播，快的几分钟，慢的可能要更久。期间什么都不用做，Cloudflare 会自动检测，生效后域名状态会变成已激活。

点进这个域名，左侧菜单会换成它自己的设置。后面要用到的 AI Crawl Control、DNS、电子邮件、SSL/TLS 和安全性，都在这一列里。

![Image](https://pbs.twimg.com/media/HUH3w1ObQAE1u1M?format=jpg&name=large)

到这里，域名的解析已经交给 Cloudflare 管理。下一步处理两个最容易出问题的设置：代理状态和 HTTPS。

# 三、DNS、代理与 HTTPS

## 1\. 橙色云和灰色云

打开域名的 DNS → 记录，每条记录后面都有一列代理状态。

![Image](https://pbs.twimg.com/media/HUH3ze8bQAU5qAL?format=jpg&name=large)

- **已代理（橙色云）**：访客先到 Cloudflare，再转到你的服务器。CDN、HTTPS 证书、防护和缓存都依赖这个状态，访客也看不到服务器的真实 IP。
- **仅 DNS（灰色云）**：Cloudflare 只负责解析，访客直接连你的服务器。

网站的根域名和 www 通常开橙色云。下面这些情况要改成灰色云：

- 用来 SSH 登录服务器的域名。代理只转发网页常用的端口，SSH 走不通。
- 邮件服务器用的域名，比如 MX 记录指向的 [mail.example.com](https://mail.example.com/)。它的 A 记录开了代理，邮件就送不到服务器。MX、TXT 这类记录本身没有代理选项，截图里三条 MX 记录就固定显示仅 DNS。
- 需要访客直连服务器的其他服务，比如某些游戏或数据库端口。

一个实用习惯：网站用一个开代理的域名，SSH 和面板另配一个灰色云的子域名，两者分开。

国内访问开了代理的网站，速度有时不理想，可以参考我之前写的[优选 IP 教程](https://www.legacyvps.com/archives/cloudflare-speed-optimization-preferred-ip-guide-single-domain)。

## 2\. SSL/TLS 模式选错，最常见的结果是打不开

进入 SSL/TLS → 概述，可以配置加密模式。它决定的是 Cloudflare 和你的服务器之间怎么连接。访客和 Cloudflare 之间，开了代理就会自动使用 HTTPS。

![Image](https://pbs.twimg.com/media/HUH317BbQAM3_G-?format=jpg&name=large)

- **自动 SSL/TLS（推荐）**：Cloudflare 扫描你的源服务器，自动应用它支持的最安全模式。截图里的域名，自动模式当前选中的就是完整（严格）。
- **完整（严格）**：用 HTTPS 连接，并验证服务器证书。最安全。
- **完整**：用 HTTPS 连接，但不检查证书，自签名证书也接受。
- **灵活**：Cloudflare 用 HTTP 连你的服务器，服务器上不用装证书，但这一段是明文。
- **关闭（不安全）**：全程不加密，不要用。

不确定怎么选，就保持自动模式。想手动指定时，服务器装了有效证书，比如 Let's Encrypt 或 Cloudflare 签发的源服务器证书，就选完整（严格）。

用灵活模式时最常见的翻车，是浏览器提示“重定向次数过多”。原因是服务器自己设置了 HTTP 跳转 HTTPS，Cloudflare 却一直用 HTTP 去连，于是两边来回跳。改成完整或完整（严格）通常就能解决。

托管在 Workers 上的网站不涉及你自己的服务器，证书由 Cloudflare 自动处理，这一节的设置主要影响有源服务器的网站。

## 3\. 打开始终使用 HTTPS

在 SSL/TLS → 边缘证书页面，打开 Always Use HTTPS（始终使用 HTTPS）。访客输入 http:// 时会被自动跳到 https://。

到这里，域名已经可以安全地接住访问。接下来让它真正承载内容。

# 四、从 GitHub 仓库发布一个网站

## 1\. 发布入口已经换成了 Workers

以前在 Cloudflare 发静态网站，第一反应是用 Pages。现在控制台的创建流程默认走 Workers：从 GitHub 导入仓库，构建后作为 Worker 部署。页面顶部还留着一行“需要使用旧版 Pages 工作流？继续前往 Pages”，说明 Pages 已经是旧入口。

对普通用户来说，差别不大。官方定价页写明，访问静态资源的请求免费且不限量，导入页面上也有同样的提示；以后想给网站加接口、绑定存储，也都在同一个项目里接着做。

我这里用自己的 Pi 蓝皮书仓库 pi-bluebook 演示，它现在挂在 [pi.xiaomovps.com](https://pi.xiaomovps.com/) 上。你也可以用之前那篇长文[GitHub 从入门到精通](https://x.com/xiaomovps/status/2095322130422653298)里建的 github-first-project，一个只有 index.html 的仓库就够用。

## 2\. 选择仓库

进入 计算 → Workers 和 Pages，点击创建，选择从 GitHub 导入存储库。第一次使用需要授权 Cloudflare 访问你的 GitHub 账号，可以只授权需要部署的仓库，不必放开全部。

![Image](https://pbs.twimg.com/media/HUH34dkbQAArYzI?format=jpg&name=large)

在仓库列表里搜索并选中要部署的仓库，点击下一步。

## 3\. 构建与部署设置

![Image](https://pbs.twimg.com/media/HUH364lbQAYRl5W?format=jpg&name=large)

- **项目名称**：默认和仓库同名，会出现在 [workers.dev](https://workers.dev/) 地址里。
- **构建命令**：可选。纯 HTML 项目不需要构建；用 Hugo、Astro、VitePress 这类框架时，填对应的构建命令。
- **部署命令**：默认是 npx wrangler deploy，保留即可。

确认后点击部署。部署失败时，先看构建日志里第一条报错，多半是构建命令或输出目录没对上。

## 4\. 拿到访问地址

部署完成后进入项目概述页。右下角的“域名和路由”里能看到 项目名.你的子域.[workers.dev](https://workers.dev/) 这个地址，右上角的“访问”按钮可以直接打开网站。截图里的项目已经绑定过自定义域名，所以这里多了一行 [pi.xiaomovps.com](https://pi.xiaomovps.com/)，刚部署的项目只有 [workers.dev](https://workers.dev/) 一个地址，绑定方法在下一节。

![Image](https://pbs.twimg.com/media/HUH39HPbQAI9fEU?format=jpg&name=large)

以后每次向 main 推送提交，Cloudflare 都会自动重新部署。

## 5\. 绑定自己的域名

切到项目的“域”标签页，在“自定义域和路由”里点击添加域名，填入 [www.example.com](https://www.example.com/) 或 [example.com](https://example.com/)。域名已经在同一个 Cloudflare 账号下，DNS 记录会自动创建，不用手动去配。

绑定前先确认这个主机名没有别的用途。官方文档写明，已经有 CNAME 记录的主机名不能直接绑定，要先删掉那条记录。根域名如果还指向 VPS 上的旧网站，建议先用 www 或 blog 这类空闲的子域名试，确认没问题再迁移。

![Image](https://pbs.twimg.com/media/HUH3_tQaQAA4lPQ?format=jpg&name=large)

绑定完成后，用自己的域名访问，网站就上线了，证书也已经自动配好。

想做一个更完整的个人主页，可以参考我之前发的[数字名片短帖](https://x.com/xiaomovps/status/2100768053579715028)，同样是 GitHub 加 Cloudflare 的组合。

# 五、给域名配一个能收信的邮箱

## 1\. 邮件路由做的是收信和转发

有了 [example.com](https://example.com/)，很多人会想要一个 hi@example.com 这样的邮箱，放在网站和名片上更像样。

Cloudflare 的邮件路由（Email Routing）可以免费实现这件事。它的工作方式是：发到 hi@example.com 的邮件，由 Cloudflare 接收，再转发到你已有的 Gmail、Outlook 或 QQ 邮箱。

先说清它的边界：邮件路由负责收信和转发，不是一个完整的邮箱服务。用这个地址对外发信是另一项功能，控制台里叫“电子邮件发送”，目前还是 Beta，本文不展开。

使用前提是域名的 DNS 托管在 Cloudflare。上一章已经完成了这一步。

## 2\. 接入域名

在控制台进入 计算 → 电子邮件服务 → 电子邮件路由。列表里是已经开启的域名，新域名点右上角的“接入域名”。

![Image](https://pbs.twimg.com/media/HUH4B-KbQAMnp6J?format=jpg&name=large)

接入时，Cloudflare 会提示添加几条 DNS 记录，包括 MX、SPF 和 DKIM，确认即可，通常几分钟内生效。

如果这个域名之前已经在用别家的企业邮箱，现有的 MX 记录会和邮件路由冲突。开启前想清楚，邮件到底由谁来收。列表里的“DNS 记录”一列显示配置错误时，多半就是这类记录没对上。

## 3\. 先加目标地址，再建路由规则

点进域名，可以看到概览、活动日志、路由规则、目标地址等几个标签页。右侧的配置摘要里，路由状态显示已启用，说明收信这一层已经通了。

![Image](https://pbs.twimg.com/media/HUH4EQkaMAAMunG?format=jpg&name=large)

先在“目标地址”里添加你的常用邮箱。Cloudflare 会往这个邮箱发一封验证邮件，点击里面的链接，状态变成已验证才能使用。

然后切到“路由规则”，创建一条规则。

![Image](https://pbs.twimg.com/media/HUH4GnabUAA--RW?format=jpg&name=large)

- 电子邮件匹配模式：@ 前面填 hi，后面选择你的域名
- 操作：选“发送到电子邮件”，目标选刚才验证过的邮箱
- 保存

用另一个邮箱给 hi@example.com 发一封测试邮件，几秒到几分钟内，常用邮箱就能收到。收不到时先看垃圾箱，再检查 MX 记录是否只剩 Cloudflare 的那几条。

规则可以建很多条，比如 github@、shop@、newsletter@ 分别对应不同用途，哪个地址开始收垃圾邮件，直接删掉那一条规则。列表里默认还有一条“全收”规则，打开以后，所有没匹配上的地址都会按它处理。想把这件事玩到极致，可以看我之前写的[无限子邮箱配置指南](https://www.legacyvps.com/archives/cloudflare-email-routing-catch-all-guide)。

# 六、用 R2 存图片和备份

## 1\. R2 最大的好处是出站不收费

R2 是 Cloudflare 的对象存储，可以理解成一个放文件的大仓库，图片、视频、备份压缩包、静态资源都能放。

它最受欢迎的一点，是出站流量免费。很多云存储按下载流量收费，图片被大量访问时账单会涨得很快。R2 免费版每月包含 10 GB 存储、100 万次 A 类操作和 1,000 万次 B 类操作，下载流量本身不收费。

A 类操作大致对应写入、列出这类动作，B 类操作大致对应读取。个人图床和备份，一般很难用完。

需要注意，免费额度只适用于标准存储，不包括不频繁访问存储。

## 2\. 创建存储桶

进入 存储和数据库 → R2 对象存储，点击创建存储桶。

![Image](https://pbs.twimg.com/media/HUH4KQtbIAAeKyk?format=jpg&name=large)

- **存储桶名称**：页面上写着“存储桶名称是永久性的”，创建后不能改，最好一开始就想好用途。
- **位置**：保持自动即可，Cloudflare 会按你的位置选一个区域。
- **默认存储类**：保持“标准”。选“不频繁访问”就用不了免费额度。

点击创建存储桶，进入以后把一张图片拖进去上传，就能在“对象”列表里看到它。

## 3\. 用自己的域名公开访问

存储桶默认是私有的，外部打不开里面的文件。要让网站引用图片，需要在存储桶的“设置”里开启公开访问，有两条路。

![Image](https://pbs.twimg.com/media/HUH4MyAbUAAkFVK?format=jpg&name=large)

- **自定义域。** 在“自定义域”里点击添加，填入 [img.example.com](https://img.example.com/)，确认 DNS 记录后连接。状态变成活动，通常只要几分钟。截图里我用的是 [r2.79702701.xyz](https://r2.79702701.xyz/)。
- **公共开发 URL。** 也就是 [r2.dev](https://r2.dev/) 地址，点击启用，输入 allow 确认。

正式使用一定选自定义域。官方文档写得很清楚，r2.dev 地址有速率限制，只适合开发测试，也用不了缓存和访问控制。截图里这个存储桶就只开了自定义域，公共开发 URL 保持禁用。

开启以后，用 [https://img.example.com/](https://img.example.com/)文件名 就能直接访问刚上传的图片，可以填进网站、Markdown 或博客的图床设置里。

设置页上方的 S3 API 地址里带着你的账户 ID，截图分享前记得打码。

想要一个带上传界面的图床，可以看看 awesome-cloudflare 合集里收录的 CloudFlare-ImgBed，它支持把 R2 作为存储后端。这类第三方项目部署前，记得按那篇 GitHub 长文里说的，先看作者、维护状态和 License。

# 七、挡住不该来的流量

## 1\. 先看清谁在爬你的网站

现在除了搜索引擎，还有大量 AI 公司的爬虫在抓取网页，有的拿去训练模型，有的替用户实时搜索。对内容站来说，这部分流量不一定带来访客，却会消耗资源。

Cloudflare 把这部分管理放在域名菜单里的 AI Crawl Control，免费版也能用。它的概述页按运营商列出访问过网站的爬虫，比如 OpenAI、Anthropic、Common Crawl、ByteDance、Google，以及每家被允许的请求数。

![Image](https://pbs.twimg.com/media/HUH4PPXaYAAvbxF?format=jpg&name=large)

以我这个演示域名为例，过去 7 天 AI 爬虫一共发来 974 次请求，放行 390 次，失败 584 次，OpenAI 的 ChatGPT-User 单个爬虫就有 113 次。这里的失败不等于被拦截，页面提示其中 349 次是爬虫请求了不存在的页面，收到了 404。一个流量不大的小站也是这样，内容多的网站只会更多。

## 2\. 在“安全性”里决定放行还是拦截

AI Crawl Control 下面有概述、指标、安全性、优化、信号几个子页。放行和拦截在“安全性”里设置，可以针对每个爬虫单独选择。

- **放行**：这个爬虫能带来引用和流量，或者你本来就愿意被它收录。
- **拦截**：你不希望内容被它抓走。拦截时可以选择返回 403 禁止访问，或者 402 需要付费。

判断方法很简单：搜索引擎类的爬虫一般放行，否则网站在搜索结果里会消失；纯训练用途的爬虫，按你对内容的态度决定。

## 3\. AI 迷宫是拖住，不是拦截

有些爬虫不遵守 robots.txt，换着身份继续抓。AI 迷宫（AI Labyrinth）的思路是给它们设一个迷宫：在网页里加入只有爬虫能看到的 nofollow 链接，链向 AI 生成的内容，干扰不遵守爬取规范的自动程序。控制台上的说明写得很清楚，这些链接不会改变网页本身的内容，只对自动程序可见。

开启位置在域名的 安全性 → 设置，找到“AI 迷宫”这一行，打开右侧开关。它目前还标着 Beta。

![Image](https://pbs.twimg.com/media/HUH4VN8awAANecD?format=jpg&name=large)

要分清它和拦截的区别。官方文档写明，AI 迷宫的动作不算拦截，请求本身不会被阻止或质询。想明确挡住某个爬虫，还是用上一节的拦截。同一个页面里的“配置 AI 自动程序策略”，可以按类型控制 AI 自动程序的访问。

更完整的防护规则，比如按国家、路径或请求频率拦截，可以看我之前整理的[免费版 WAF 规则详解](https://www.legacyvps.com/archives/cloudflare-waf)。

# 八、Workers：给网站加一段后端

## 1\. Workers 是什么

第四章发布的网站是静态的：页面写好放上去，所有人看到的内容一样。想要一个能处理请求的后端，比如接收表单、调用 API、返回动态数据，传统做法是租一台服务器。

Workers 让你把一段 JavaScript 代码放到 Cloudflare 的网络上运行。请求进来，代码执行，返回结果。不用管服务器，也不用管扩容。

免费版每天可以处理 100,000 次请求，每次请求最多 10 毫秒 CPU 时间。这里的 CPU 时间只算代码真正在计算的时间，等待网络请求返回的时间不算在内，所以调用外部 API 的代码一般不容易超限。

## 2\. 部署第一个 Worker

为了把后端和第四章的网站分开演示，这里单独建一个新的 Worker。进入 计算 → Workers 和 Pages，点击创建，选择从 Hello World 开始，名称填 hello-ai，然后部署。

部署完成后，你会得到一个 hello-ai.你的子域.[workers.dev](https://workers.dev/) 的地址。在浏览器里打开它，能看到返回的 Hello World!。

![Image](https://pbs.twimg.com/media/HUH4Xc3akAAiaVA?format=jpg&name=large)

这一行字说明代码已经在 Cloudflare 的网络上跑起来了。下一章就给它接上模型。

## 3\. 需要存数据时，再认识 KV 和 D1

Worker 本身不保存数据，每次请求都是独立的。需要存东西时，Cloudflare 还有两个免费的存储，都在“存储和数据库”菜单里。

| 存储 | 适合存什么 | 免费额度 |
| --- | --- | --- |
| Workers KV | 配置、缓存、短链接这类按键取值的数据 | 每天 10 万次读取、1,000 次写入，共 1 GB |
| D1 SQLite 数据库 | 需要查询的表格数据，比如留言、订单记录 | 每天读取 500 万行、写入 10 万行，共 5 GB |

本文的例子用不到它们，先知道有这两样东西，等项目需要时再接。

# 九、Workers AI：用免费额度跑开源模型

## 1\. 不用 GPU，也能调用模型

Workers AI 把一批开源模型放在 Cloudflare 的 GPU 上，Worker 可以直接调用，不需要自己准备显卡，也不用单独申请模型的 API Key。

免费版每天有 10,000 Neurons。Neurons 是 Cloudflare 自己的计量单位，不同模型、不同长度的请求消耗不一样。超出后需要升级到付费计划，按每 1,000 Neurons 0.011 美元计费。

在控制台的 AI 菜单里，可以浏览目前支持的模型，有聊天、翻译、图像生成、语音识别等不同类型。

## 2\. 给 Worker 绑定 Workers AI

回到 hello-ai 的概述页，找到“绑定”卡片，点击添加绑定，选择 Workers AI，变量名填 AI。绑定的作用，是让代码里可以通过 [env.AI](https://env.ai/) 调用模型。变量名要和代码里一致，大小写也算。

## 3\. 改代码，让它回答问题

点击右上角的编辑代码，把默认代码换成下面这段。

```javascript
export default {
  async fetch(request, env) {
    const answer = await env.AI.run("@cf/google/gemma-4-26b-a4b-it", {
      messages: [
        { role: "system", content: "你是一个回答简洁的中文助手。" },
        { role: "user", content: "用两句话解释 CDN 是什么。" },
      ],
      chat_template_kwargs: { enable_thinking: false },
    });
    return Response.json(answer);
  },
};
```

这里调用的是 Google 的 Gemma 4 开源模型，模型 ID 取自 Cloudflare 官方入门文档。messages 和常见的聊天接口格式一样，system 设定角色，user 是要问的问题。

部署以后，刷新刚才的 [workers.dev](https://workers.dev/) 页面。

![Image](https://pbs.twimg.com/media/HUH4ibQaQAA9_OY?format=jpg&name=large)

浏览器里出现一段 JSON，content 里就是模型用中文写的回答。一个没有服务器、没有显卡、没有额外 API Key 的 AI 接口，就这样跑起来了。

返回结果末尾的 usage 也值得看一眼。这次一问一答一共 84 个 token，消耗约 1.67 Neurons。按每天 10,000 Neurons 的免费额度粗算，这种短问答一天能跑五六千次。

模型列表和推荐 ID 会随时间更新。调用报错时，先去 AI 菜单的模型页确认这个 ID 是否还在。

还有一点要注意：这个 [workers.dev](https://workers.dev/) 地址谁都能打开，每打开一次就消耗一次额度。免费版超出每天的额度后只会调用失败，不会扣钱，但演示完最好在设置里关掉 [workers.dev](https://workers.dev/) 访问，或者直接删除这个 Worker。真要做成对外的服务，先加上访问控制。

## 4\. Clef：专门帮 Agent 做判断的模型

10 月 1 日，Cloudflare 发布了两个开源的决策模型 Clef 和 Clef-flash。它们和聊天模型不一样，不负责写长段回答，只回答选择题。

你给它一段内容，再给一组问题和可选答案，比如“这条工单紧不紧急”“该转给哪个团队”。它不生成文字，而是给每个选项打出一个概率。下游程序拿到概率，就能自动决定下一步。

| 模型 | 底座 | 特点 |
| --- | --- | --- |
| Clef | Qwen 3.8 27B | 64K 上下文，支持图片输入，中位延迟约 209 毫秒 |
| Clef-flash | Qwen 3.5 9B | 中位延迟约 39 毫秒，速度优先 |

两个模型都以 Apache 2.0 协议开源，权重放在 Hugging Face，也可以在 Workers AI 上通过 [@cf/cloudflare](https://x.com/@cf/cloudflare)/clef 和 [@cf/cloudflare](https://x.com/@cf/cloudflare)/clef-flash 直接调用。

它适合 Agent 里那些需要快速分流的环节：这封邮件要不要处理，这条评论是不是垃圾信息，这个任务该交给哪个工具。以前这些判断也要调用一次大模型，现在可以交给更快的专用模型。

# 十、让 Agent 接管：用 cf 管理 Cloudflare

## 1\. 一半的命令行操作已经来自 Agent

Cloudflare 原来的命令行工具叫 Wrangler，主要用来开发和部署 Workers。官方公开过一组数据：2026 年 3 月，Agent 发起的 Wrangler 使用占四分之一，到发布 cf 的前一周已经升到 48%，差不多一半。

于是在 9 月 28 日，Cloudflare 发布了新的命令行工具 cf，目前处于公开测试阶段。它和 Wrangler 的主要区别有两点。

- **覆盖范围更大。** Wrangler 大约有 280 条命令路径，cf 覆盖了 Cloudflare API 的 3,000 多项操作，DNS、R2、邮件、安全设置都能管。
- **为 Agent 设计。** 结果默认输出 JSON，能用自然语言搜索命令，危险操作有额外保护。

Wrangler 不会马上消失。官方的计划是公开测试结束后，再发布一个提示迁移的 Wrangler 最终版本，并继续维护 18 个月。已有项目可以慢慢迁移，第四章导入仓库时默认的部署命令也还是 npx wrangler deploy。

## 2\. 安装并登录

cf 通过 npm 安装，电脑上需要先装好 Node.js。

```text
npm install --global cf
cf auth login
```

cf auth login 会打开浏览器，在 Cloudflare 页面确认授权后，回到终端就可以使用。

## 3\. 不知道命令，就让它自己搜

cf 最适合 Agent 的一点，是不需要提前背命令。用自然语言描述要做的事，它会返回最多 5 条匹配的命令。

```text
cf cli search "create D1 database"
```

![Image](https://pbs.twimg.com/media/HUH4uCYbcAAL9N9?format=jpg&name=large)

返回结果是一组 JSON，每条有命令和说明，最匹配的 cf d1 create 排在第一。找到命令以后，可以继续查看这条命令需要哪些参数。

```text
cf schema d1 create
```

## 4\. 先预览，再执行

涉及创建和修改的命令，可以加上 --dry-run，只打印将要发出的请求，不真正执行。

```text
cf d1 create --name my-database --dry-run
```

![Image](https://pbs.twimg.com/media/HUH40N5a4AE2YbD?format=jpg&name=large)

输出里能看到请求方法、接口地址和请求体，确认无误再去掉 --dry-run 正式执行。接口地址里同样带着账户 ID，截图分享前记得打码。

删除类操作还有一层保护。在非交互模式下，也就是 Agent 自动执行时，删除命令如果没有加 --force，会输出 Aborted. 并停止。Agent 想删东西，必须明确地多加一个参数，这给了你在审查命令时一个明显的信号。

要注意，这时命令的退出码是 0，看起来像执行成功了，其实什么都没删。官方文档专门提醒，退出成功不代表资源已被删除，让 Agent 删完以后再查一次确认结果。

## 5\. 告诉 Agent 用它

在用户级的 AGENTS.md 或 CLAUDE.md 里加一句官方推荐的说明，这样所有项目都会生效：

```text
When interacting with Cloudflare, use the cf CLI unless the project has a Wrangler configuration file.
```

意思是操作 Cloudflare 时优先用 cf，项目里已经有 Wrangler 配置文件的除外。Claude Code、Codex、Pi 这类 Agent 读到这句，就知道该调用哪个工具。

之后可以直接对 Agent 说：“把我账号里的 R2 存储桶列出来”“给 [example.com](https://example.com/) 加一条 CNAME，先 dry-run 给我看”。

## 6\. 令牌只给必要权限

让 Agent 在无人值守的环境里运行时，比如定时任务或 CI，不能每次都打开浏览器登录。这时需要创建一个 API 令牌，放进 CLOUDFLARE\_API\_TOKEN 环境变量。

这一步有三条规矩。

- 令牌只勾选任务需要的权限和域名，不要图省事选全部。
- 设置合理的有效期，不用的令牌及时删除。
- 令牌不要写进代码、提交到仓库，也不要贴进和 AI 的对话。一旦泄露，立即在控制台撤销并重新创建。

Agent 能帮你点按钮，但它拿到的权限，就是出问题时的影响范围。

# 十一、免费额度速查与常见问题

## 1\. 免费额度一张表

| 服务 | 免费额度 | 需要更多时 |
| --- | --- | --- |
| Workers | 每天 100,000 次请求，每次 10 毫秒 CPU；访问静态资源的请求免费且不限量 | 付费计划每月 5 美元起，含一定用量 |
| 旧版 Pages | 每月 500 次构建，同时 1 个构建，单站 20,000 个文件，单文件 25 MiB | 看官方付费计划 |
| Workers KV | 每天 10 万次读取、1,000 次写入，1 GB 存储 | 包含在 Workers 付费计划里 |
| D1 | 每天读取 500 万行、写入 10 万行，5 GB 存储 | 看官方付费计划 |
| R2 | 每月 10 GB 存储、100 万次 A 类操作、1,000 万次 B 类操作，出站免费；仅限标准存储 | 超出部分按用量计费 |
| Workers AI | 每天 10,000 Neurons | 付费计划每 1,000 Neurons 0.011 美元 |
| 邮件路由 | 收信和转发 | — |

数字来自 2026 年 10 月的 Cloudflare 官方文档，以后可能调整。

## 2\. 最常见的六种翻车

| 现象 | 先检查什么 | 第一处理动作 |
| --- | --- | --- |
| 浏览器提示重定向次数过多 | SSL/TLS 模式是不是灵活，服务器是否强制 HTTPS | 改成自动、完整或完整（严格） |
| 域名一直没激活 | 注册商的域名服务器有没有改对，DNSSEC 是否关闭 | 核对两条 NS 地址，耐心等待传播 |
| 接入后收不到邮件 | MX、SPF、DKIM 记录是否在扫描时漏掉 | 补齐邮件记录，或检查邮件路由的 DNS 记录是否显示配置错误 |
| SSH 连不上服务器 | 用来连接的域名是不是已代理（橙色云） | 换成仅 DNS 的子域名，或直接用 IP |
| R2 图片访问变慢或被限制 | 是不是在用  r2.dev  地址 | 改用自定义域 |
| Worker 报错超出 CPU 限制 | 代码里有没有大量计算或循环 | 把计算挪走，或升级付费计划 |

## 3\. 一条日常使用路径

以后遇到新项目，可以按这个顺序想。

1. 域名先接进 Cloudflare，DNS 和 HTTPS 配好。
2. 网站从 GitHub 仓库导入，推送后自动部署。
3. 需要邮箱，开邮件路由转发。
4. 需要存文件，用 R2 加自定义域。
5. 需要接口，写一个 Worker；需要存数据，再接 KV 或 D1。
6. 需要模型，绑定 Workers AI；需要快速判断，试试 Clef。
7. 日常维护交给 Agent，用 cf 查命令、先预览、再执行。

不是每个项目都要走完七步。大多数个人网站停在第 3 步就已经够用，等真有需求时再往下加。

## 4\. 延伸阅读

下面几篇是我之前写的单项教程，可以按需要接着看。

- [保姆级教程：如何将域名无缝托管到 Cloudflare](https://www.legacyvps.com/archives/add-domain-to-cloudflare)
- [Cloudflare CDN 部署教程](https://www.legacyvps.com/archives/cloudflare-cdn-setup-tutorial)
- [告别龟速！Cloudflare 优选 IP 傻瓜式教程](https://www.legacyvps.com/archives/cloudflare-speed-optimization-preferred-ip-guide-single-domain)
- [Cloudflare 免费版 WAF 规则分享与详解](https://www.legacyvps.com/archives/cloudflare-waf)
- [利用 Cloudflare 邮件路由实现无限子邮箱配置指南](https://www.legacyvps.com/archives/cloudflare-email-routing-catch-all-guide)

## 参考资料

- [Cloudflare 添加域名](https://developers.cloudflare.com/fundamentals/manage-domains/add-site/)
- [Pages 免费版限制](https://developers.cloudflare.com/pages/platform/limits/)
- [Email Routing 开启步骤](https://developers.cloudflare.com/email-service/get-started/route-emails/)
- [R2 价格](https://developers.cloudflare.com/r2/pricing/)、[R2 公开存储桶](https://developers.cloudflare.com/r2/buckets/public-buckets/)
- [AI Crawl Control 管理爬虫](https://developers.cloudflare.com/ai-crawl-control/features/manage-ai-crawlers/)、[AI Labyrinth](https://developers.cloudflare.com/bots/additional-configurations/ai-labyrinth/)
- [Workers 价格与额度](https://developers.cloudflare.com/workers/platform/pricing/)
- [Workers AI 价格](https://developers.cloudflare.com/workers-ai/platform/pricing/)、[Workers AI 入门](https://developers.cloudflare.com/workers-ai/get-started/workers-wrangler/)
- [Introducing Clef](https://blog.cloudflare.com/clef-decision-models/)
- [Introducing cf](https://blog.cloudflare.com/cloudflare-cf-cli-launch/)、[cf 与编程 Agent](https://developers.cloudflare.com/cf/agents/)