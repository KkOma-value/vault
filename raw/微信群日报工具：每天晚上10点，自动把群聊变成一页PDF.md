---
title: "微信群日报工具：每天晚上10点，自动把群聊变成一页PDF"
source: "https://x.com/Leobai825/status/2079855531863195713"
author:
  - "[[@Leobai825]]"
published: 2026-07-22
created: 2026-07-23
description: "由于每天需要看的微信群很多，有价值的信息还要爬楼比较麻烦，看到群友有做一个微信群聊日报总结，一下子就感觉清楚了，于是自己也做出来一个AI工具，方便我每天直接阅读完多个群聊信息7月21日天策成长团日报示例它每天会自动做什么？你只需要填写群名。程序会在每天晚上 10 点自动执行：只读..."
tags:
  - "clippings"
---
![Image](https://pbs.twimg.com/media/HN0aQAMXMAAtocQ?format=jpg&name=large)

由于每天需要看的微信群很多，有价值的信息还要爬楼比较麻烦，看到群友有做一个微信群聊日报总结，一下子就感觉清楚了，于是自己也做出来一个AI工具，方便我每天直接阅读完多个群聊信息

![Image](https://pbs.twimg.com/media/HN0btNXXIAETVi-?format=jpg&name=large)

7月21日天策成长团日报示例

## 它每天会自动做什么？

你只需要填写群名。

程序会在每天晚上 10 点自动执行：

1. 只读提取指定微信群当天的本地聊天记录；
2. 在电脑本地识别并脱敏手机号、邮箱、身份证号等信息；
3. 调用 AI 整理当天讨论内容；
4. 分别生成 Markdown 和 PDF 两个版本；
5. 自动保存到电脑本地。

Markdown 适合归档和继续编辑。

PDF 是给人看的版本，排版压缩在 A4 一到两页内，可以直接阅读或者转发。

一份日报里会包含：

- 今日概览
- 核心讨论
- 已确认结论
- 待办事项
- 群内资源
- 尚未解决的问题

效果不是把聊天记录重新复制一遍，而是尽量把一天的信息压缩成一份真正有用的行动报告。

[查看PDF日报效果](https://github.com/Leobai03/wechat-group-daily/blob/main/output/pdf/%E5%BE%AE%E4%BF%A1%E7%BE%A4%E6%97%A5%E6%8A%A5%E7%A4%BA%E4%BE%8B.pdf)

![Image](https://pbs.twimg.com/media/HN0gl4DXAAAsURn?format=jpg&name=large)

## 它不是微信机器人

这个工具不会往微信群里发送消息，也不会修改聊天记录。

它是运行在自己电脑上的本地自动化工具：

微信本地数据库 ↓ 只读提取指定群聊 ↓ 本地脱敏 ↓ AI总结 ↓ Markdown + PDF日报

它不需要微信官方API，可以同时配置多个群，每个群单独生成一份日报。

## Mac和Windows都可以使用

Mac 版本使用 launchd 每天定时运行，我已经在自己的电脑上实际跑通过。

Windows 版本使用任务计划程序定时运行，代码和自动测试已经通过。由于微信数据库密钥需要从本机微信进程读取，第一次初始化必须在已经登录微信的Windows电脑上完成。

两个版本的运行逻辑和输出格式基本一致。

## 有Codex：直接让它帮你安装

如果你的电脑已经有 Codex，不需要自己研究每一行命令。

把项目地址和下面这段话发给 Codex：

**请阅读这个项目的README和对应系统教程，在我的电脑上完成安装、配置、doctor检查和dry-run测试。 项目地址：** [https://xuedingtoken1.com/v1](https://xuedingtoken1.com/v1) **涉及sudo、管理员权限、微信重新签名或者输入API Key时，先停下来让我确认。 不要在终端、聊天或截图中输出我的API Key和真实聊天内容。**[https://github.com/Leobai03/wechat-group-daily](https://github.com/Leobai03/wechat-group-daily)

**Codex会帮助你完成下载、安装、配置和调试。**

**Codex在这里负责安装和排查问题，真正每天生成日报的模型调用，默认通过薛定Token完成。如何创建APi key**

## 没有Codex：跟着手动教程安装

我分别写了两份教程。

Mac 教程

包括：

- 安装运行环境
- 下载项目
- 配置群名
- 获取微信数据库密钥
- 设置 API 密钥
- 运行安全检查
- 生成第一份日报
- 设置每天22:00自动运行
- 常见报错处理

[打开Mac完整教程](https://github.com/Leobai03/wechat-group-daily/blob/main/docs/macOS%E4%BD%BF%E7%94%A8%E6%95%99%E7%A8%8B.md)

Windows教程

包括：

- 安装Git和uv
- 下载项目
- 使用管理员PowerShell初始化微信
- 配置群名和 API Key
- 生成Markdown与PDF
- 安装Windows定时任务
- 常见报错处理

[打开Windows完整教程](https://github.com/Leobai03/wechat-group-daily/blob/main/docs/Windows%E4%BD%BF%E7%94%A8%E6%95%99%E7%A8%8B.md)

## 为什么默认接入薛定Token？

这里我把商业逻辑讲明白。

项目代码放在 GitHub，但AI总结不是凭空产生的，模型调用本身需要消耗Token。

这个项目默认接入的是我们自己在做的「薛定Token」：

模型：claude-opus-4-8 基本网址： [https://xuedingtoken1.com/v1](https://xuedingtoken1.com/v1)

你不需要自己研究接口格式，创建API Key以后，在项目目录执行：

uv run wechat-daily set-api-key

API Key会被保存到Mac钥匙串或者Windows凭据管理器，不会直接写进配置文件。

我本质上是一个商人，这一点没有必要遮遮掩掩。

我把真正能解决问题的工具和教程做出来，大家通过薛定Token完成模型调用，让AI真正进入工作流、替你持续完成任

建议第一次按照实际需要小额测试，确定工具能够正常运行以后，再决定后续用量。

- [薛定Token购买入口](https://shop.xuedingtoken.com/?invite=XLPB9REJ)
- [API Key创建教程](https://github.com/Leobai03/wechat-group-daily/blob/main/docs/%E8%96%9B%E5%AE%9AToken%E6%8E%A5%E5%85%A5%E6%95%99%E7%A8%8B.md)

目前能做到的是：

- 微信数据库只读，不发送或者修改微信消息；
- 聊天内容先在电脑本地进行脱敏；
- API Key保存在系统凭据库；
- 默认不额外保存原始聊天副本；
- 脱敏后的内容才会发送给第三方模型服务。

自动脱敏不可能识别所有商业秘密和个人信息。

涉及公司机密、客户隐私或者高度敏感内容的群，不建议发送给任何第三方模型。使用前也应该确认自己有权处理相关群聊内容。

## 写在后面：

AI真正有价值的地方，不是陪我们聊天，而是嵌入现有工作流，每天自动完成一件原本需要人重复处理的事情。

## 我们的愿景是：

AI可以取代世界上所有的白领岗位，至少现在，AI的能力已经可以取代部分工作，用token来实现帮我们工作提效

**希望我们让一个普通人，在这个AI时代，也能够收获到财富！**

项目地址：

[WeChat Group Daily · 微信群日报](https://github.com/Leobai03/wechat-group-daily)