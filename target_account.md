# 目标账号分析模块 API 文档

## 概述

本模块提供用于管理、监控和分析目标账号（如YouTube频道）的核心功能。主要包括：

-   快速添加和监控新账号
-   触发账号数据（视频、指标）的爬取任务
-   管理账号和视频信息
-   查询历史数据快照
-   触发视频下载任务

所有API的基地址为 `/api/analysis`。

---

## 账号管理 (Accounts)

### 1. 快速添加账号并触发爬取

此接口用于通过一个频道URL快速添加一个新的目标账号，并立即创建一系列任务来爬取该账号的初始数据。

-   **Endpoint**: `POST /accounts/quick-add`
-   **描述**: 添加新账号并立即触发爬取任务。如果账号已存在，则仅触发爬取任务。
-   **请求体** (`QuickAddAccountRequest`):
    ```json
    {
      "channel_url": "https://www.youtube.com/@MrBeast",
      "category": "Entertainment",
      "video_limit": 50,
      "crawl_videos": true
    }
    ```
-   **参数说明**:
    -   `channel_url` (string, **required**): 目标账号的完整URL。
    -   `category` (string, optional): 账号分类。
    -   `video_limit` (integer, optional, default: 50): 爬取视频列表时，获取的视频数量上限。该值将作为此账号的长期配置被保存。
    -   `crawl_videos` (boolean, optional, default: true): 是否爬取视频列表。**[功能正常]**

-   **成功响应** (200 OK):
    ```json
    {
      "code": 0,
      "msg": "Successfully added account and triggered crawl tasks",
      "data": {
        "account": {
          "id": 1,
          "account_id": "UCX6OQ3DkcsbYNE6H8uQQuVA",
          "display_name": "MrBeast",
          "profile_url": "https://www.youtube.com/@MrBeast",
          "is_active": true,
          "...": "其他账号字段"
        },
        "tasks": [
          { "task_id": 101, "task_type": "crawl_channel_info" },
          { "task_id": 102, "task_type": "crawl_channel_videos" }
        ]
      }
    }
    ```
-   **失败响应** (400 Bad Request):
    ```json
    {
      "detail": "Invalid YouTube channel URL format"
    }
    ```

### 2. 获取目标账号列表

-   **Endpoint**: `GET /accounts/`
-   **描述**: 分页和筛选获取目标账号列表。
-   **查询参数**:
    -   `skip` (integer, optional, default: 0): 跳过的记录数。
    -   `limit` (integer, optional, default: 100): 返回的记录数上限。
    -   `is_active` (boolean, optional): 根据是否激活进行筛选。
    -   `category` (string, optional): 根据分类进行筛选。
-   **成功响应** (200 OK):
    ```json
    {
      "code": 0,
      "msg": "success",
      "data": [
        {
          "id": 1,
          "account_id": "UCX6OQ3DkcsbYNE6H8uQQuVA",
          "display_name": "MrBeast",
          "..." : "其他字段"
        }
      ]
    }
    ```

### 3. 获取单个目标账号信息

-   **Endpoint**: `GET /accounts/{account_id}`
-   **成功响应** (200 OK): 返回指定ID的账号详细信息。
-   **失败响应** (404 Not Found): 如果账号不存在。

### 4. 更新目标账号信息

-   **Endpoint**: `PUT /accounts/{account_id}`
-   **请求体** (`TargetAccountUpdate`): 包含需要更新的字段，所有字段均为可选。
    ```json
    {
      "display_name": "MrBeast Official",
      "category": "Top Creator",
      "is_active": false
    }
    ```
-   **成功响应** (200 OK): 返回更新后的账号信息。

### 5. 删除目标账号

-   **Endpoint**: `DELETE /accounts/{account_id}`
-   **描述**: 逻辑删除一个目标账号。默认情况下，如果账号有关联的正在运行的任务，删除会失败。
-   **请求体** (`DeleteAccountRequest`):
    ```json
    {
      "force": false
    }
    ```
-   **参数说明**:
    -   `force` (boolean, optional, default: false): 是否强制删除。如果为 `true`，将忽略正在运行的任务并直接删除。
-   **成功响应** (200 OK):
    ```json
    {
      "code": 0,
      "msg": "Account 1 deleted successfully.",
      "data": null
    }
    ```
-   **失败响应** (400 Bad Request):
    ```json
    {
      "detail": "Account has 2 running tasks. Use 'force=true' to delete."
    }
    ```

---

## 数据爬取与下载 (Crawl & Download)

### 1. 手动触发账号数据爬取

-   **Endpoint**: `POST /accounts/{account_id}/trigger-crawl`
-   **描述**: 为单个已存在的账号手动触发一次数据爬取。
-   **请求体** (`AccountCrawlRequest`):
    ```json
    {
      "crawl_videos": true,
      "video_limit": 20
    }
    ```
-   **参数说明**:
    -   `video_limit` (integer, optional): 爬取视频列表时，获取的视频数量上限。**[注意]** 此接口**不会**更新账号的长期配置，仅对本次触发的任务生效。
    -   `crawl_videos` (boolean, optional): **[功能正常]**
-   **成功响应** (200 OK):
    ```json
    {
      "code": 0,
      "msg": "Created 2 crawl tasks for account 1",
      "data": {
        "account_id": 1,
        "tasks": [
          { "task_id": 104, "task_type": "crawl_channel_info" },
          { "task_id": 105, "task_type": "crawl_channel_videos" }
        ]
      }
    }
    ```

### 2. 批量触发账号数据爬取

-   **Endpoint**: `POST /accounts/batch-trigger-crawl`
-   **描述**: 批量为多个账号触发数据爬取任务。
-   **请求体** (`BatchAccountCrawlRequest`):
    ```json
    {
      "account_ids": [1, 2, 5],
      "crawl_videos": true,
      "video_limit": 10
    }
    ```
-   **参数说明**:
    -   `account_ids` (List[int], **required**): 需要批量触发爬取的目标账号ID列表。
    -   `video_limit` (integer, optional): 爬取视频列表时，获取的视频数量上限。此值仅对本次触发的任务生效，不会更新账号的长期配置。如果未提供，则使用账号上配置的默认值。
    -   `crawl_videos` (boolean, optional): **[功能正常]**
-   **成功响应** (200 OK):
    ```json
    {
      "code": 0,
      "msg": "Processed 3 accounts, 2 successful",
      "data": {
        "results": [
          { "account_id": 1, "status": "success", "task_count": 2 },
          { "account_id": 2, "status": "success", "task_count": 2 },
          { "account_id": 5, "status": "failed", "error": "Account not found" }
        ]
      }
    }
    ```

### 3. 触发视频下载

-   **Endpoint**: `POST /videos/trigger-download`
-   **描述**: 为一个或多个视频创建下载任务。此接口只创建任务记录，由后端worker执行实际下载。
-   **请求体** (`TriggerDownloadRequest`):
    ```json
    {
      "video_ids": [101, 102, 205],
      "priority": 5
    }
    ```
-   **参数说明**:
    -   `video_ids` (List[int], **required**): 需要下载的视频ID列表。
    -   `priority` (integer, optional, default: 10): 任务优先级，数字越小优先级越高。
-   **成功响应** (200 OK):
    ```json
    {
      "code": 0,
      "msg": "Created 2 new download tasks.",
      "data": {
        "requested_videos": 3,
        "valid_videos": 2,
        "invalid_video_ids": [205],
        "tasks": [
          { "task_id": 107, "video_id": 101, "status": "created" },
          { "task_id": 108, "video_id": 102, "status": "existing" }
        ]
      }
    }
    ```

---

## 数据查询 (Data Retrieval)

### 1. 获取账号下的视频列表

-   **Endpoint**: `GET /accounts/{account_id}/videos`
-   **查询参数**: `skip`, `limit`
-   **成功响应** (200 OK): 返回该账号下的视频列表。

### 2. 获取账号的历史快照

-   **Endpoint**: `GET /accounts/{account_id}/snapshots`
-   **描述**: 获取账号指标（如粉丝数、视频总数）的历史记录。
-   **查询参数**: `skip`, `limit`
-   **成功响应** (200 OK): 返回按采集时间倒序排列的快照列表。

### 3. 获取视频的历史快照

-   **Endpoint**: `GET /videos/{video_id}/snapshots`
-   **描述**: 获取单个视频指标（如观看数、点赞数）的历史记录。
-   **查询参数**: `skip`, `limit`
-   **成功响应** (200 OK): 返回按采集时间倒序排列的快照列表。

---

## 任务查询 (Tasks)

### 1. 获取监控任务列表

-   **Endpoint**: `GET /tasks/`
-   **描述**: 查询监控任务列表，支持多种条件筛选。
-   **查询参数**:
    -   `skip`, `limit`
    -   `account_id` (integer, optional): 按账号ID筛选。
    -   `video_id` (integer, optional): 按视频ID筛选。
    -   `task_type` (string, optional): 按任务类型筛选 (如 `crawl_channel_info`, `download_video_file`)。
    -   `status` (string, optional): 按任务状态筛选 (如 `pending`, `processing`, `completed`, `failed`)。
-   **成功响应** (200 OK): 返回任务列表。

### 2. 更新监控任务

-   **Endpoint**: `PUT /tasks/{task_id}`
-   **描述**: 手动更新任务状态或其他信息，主要用于调试或手动干预。
-   **请求体** (`MonitoringTaskUpdate`):
    ```json
    {
      "status": "cancelled",
      "error_message": "Manually cancelled by admin."
    }
    ```
-   **成功响应** (200 OK): 返回更新后的任务信息。