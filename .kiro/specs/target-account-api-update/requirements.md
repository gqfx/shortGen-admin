# 需求文档

## 介绍

本功能旨在更新目标账号分析模块，使其完全符合最新的API文档规范。当前的实现与API文档存在差异，需要进行全面的更新以确保功能的正确性和完整性。

## 需求

### 需求 1

**用户故事:** 作为一个用户，我希望能够通过快速添加接口添加新的目标账号，这样我可以立即开始监控和分析

#### 验收标准

1. WHEN 用户填写频道URL并提交快速添加表单 THEN 系统应该调用 `/api/analysis/accounts/quick-add` POST 接口
2. WHEN 快速添加成功 THEN 系统应该显示成功消息并显示创建的任务信息
3. WHEN 快速添加失败 THEN 系统应该显示具体的错误信息
4. WHEN 用户设置video_limit参数 THEN 该值应该作为账号的长期配置被保存
5. WHEN 用户启用crawl_videos选项 THEN 系统应该自动触发视频爬取任务

### 需求 2

**用户故事:** 作为一个用户，我希望能够手动触发单个账号的数据爬取，这样我可以获取最新的账号和视频数据

#### 验收标准

1. WHEN 用户选择触发账号爬取 THEN 系统应该调用 `/api/analysis/accounts/{account_id}/trigger-crawl` POST 接口
2. WHEN 爬取触发成功 THEN 系统应该显示创建的任务数量和任务ID
3. WHEN 设置video_limit参数 THEN 该值仅对本次爬取生效，不更新账号配置
4. WHEN 爬取触发失败 THEN 系统应该显示具体的错误信息

### 需求 3

**用户故事:** 作为一个用户，我希望能够批量触发多个账号的数据爬取，这样我可以高效地更新多个账号的数据

#### 验收标准

1. WHEN 用户选择多个账号进行批量爬取 THEN 系统应该调用 `/api/analysis/accounts/batch-trigger-crawl` POST 接口
2. WHEN 批量爬取触发成功 THEN 系统应该显示每个账号的处理结果
3. WHEN 部分账号处理失败 THEN 系统应该显示成功和失败的账号数量及详细信息
4. WHEN 所有账号处理失败 THEN 系统应该显示错误信息

### 需求 4

**用户故事:** 作为一个用户，我希望能够触发视频下载任务，这样我可以获取视频文件进行深度分析

#### 验收标准

1. WHEN 用户选择视频进行下载 THEN 系统应该调用 `/api/analysis/videos/trigger-download` POST 接口
2. WHEN 下载任务创建成功 THEN 系统应该显示任务创建结果和无效视频ID
3. WHEN 设置任务优先级 THEN 系统应该按照优先级处理下载任务
4. WHEN 下载任务创建失败 THEN 系统应该显示具体的错误信息

### 需求 5

**用户故事:** 作为一个用户，我希望能够查看账号下的视频列表，这样我可以了解账号的内容情况

#### 验收标准

1. WHEN 用户查看账号详情 THEN 系统应该调用 `/api/analysis/accounts/{account_id}/videos` GET 接口
2. WHEN 视频列表加载成功 THEN 系统应该显示分页的视频列表
3. WHEN 视频列表加载失败 THEN 系统应该显示错误信息
4. WHEN 用户进行分页操作 THEN 系统应该正确处理skip和limit参数

### 需求 6

**用户故事:** 作为一个用户，我希望能够查看账号和视频的历史快照数据，这样我可以分析趋势和变化

#### 验收标准

1. WHEN 用户查看账号历史数据 THEN 系统应该调用 `/api/analysis/accounts/{account_id}/snapshots` GET 接口
2. WHEN 用户查看视频历史数据 THEN 系统应该调用 `/api/analysis/videos/{video_id}/snapshots` GET 接口
3. WHEN 快照数据加载成功 THEN 系统应该按时间倒序显示快照列表
4. WHEN 快照数据加载失败 THEN 系统应该显示错误信息

### 需求 7

**用户故事:** 作为一个用户，我希望能够查看和管理监控任务，这样我可以了解系统的运行状态

#### 验收标准

1. WHEN 用户查看任务列表 THEN 系统应该调用 `/api/analysis/tasks/` GET 接口
2. WHEN 用户按条件筛选任务 THEN 系统应该支持按account_id、video_id、task_type、status等条件筛选
3. WHEN 用户更新任务状态 THEN 系统应该调用 `/api/analysis/tasks/{task_id}` PUT 接口
4. WHEN 任务操作失败 THEN 系统应该显示具体的错误信息

### 需求 8

**用户故事:** 作为一个用户，我希望删除账号时能够处理关联任务的情况，这样我可以安全地管理账号

#### 验收标准

1. WHEN 用户删除有运行任务的账号 THEN 系统应该显示警告信息
2. WHEN 用户选择强制删除 THEN 系统应该调用带force=true参数的删除接口
3. WHEN 删除成功 THEN 系统应该显示成功消息并刷新列表
4. WHEN 删除失败 THEN 系统应该显示具体的错误信息和建议操作

### 需求 9

**用户故事:** 作为一个用户，我希望API接口路径和参数完全符合文档规范，这样系统能够正确与后端通信

#### 验收标准

1. WHEN 系统调用任何API接口 THEN 接口路径应该以 `/api/analysis` 为基地址
2. WHEN 系统发送请求参数 THEN 参数名称和格式应该完全符合API文档
3. WHEN 系统接收响应数据 THEN 应该正确解析API文档中定义的响应格式
4. WHEN API返回错误 THEN 系统应该正确处理错误响应格式

### 需求 10

**用户故事:** 作为一个用户，我希望界面能够展示所有API文档中定义的功能，这样我可以充分利用系统的能力

#### 验收标准

1. WHEN 用户访问目标账号页面 THEN 应该能够看到快速添加、批量爬取、视频下载等功能入口
2. WHEN 用户查看账号详情 THEN 应该能够看到视频列表、历史快照、任务管理等功能
3. WHEN 用户进行各种操作 THEN 界面应该提供清晰的反馈和状态显示
4. WHEN 操作完成 THEN 相关数据应该自动刷新以反映最新状态