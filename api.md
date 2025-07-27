# API Documentation

This document provides a detailed overview of all available API endpoints.

## Table of Contents

- [Assets](#assets)
- [Inspirations](#inspirations)
- [Platform Accounts](#platform-accounts)
- [Project Types](#project-types)
- [Projects](#projects)
- [Target Account Analysis](#target-account-analysis)
- [Tasks](#tasks)
- [Webhooks](#webhooks)
- [Worker Configs](#worker-configs)
- [Workflow Registry](#workflow-registry)

---

## Assets

**Prefix:** `/api/assets`

### Get Asset by Hash

- **Method:** `GET`
- **Path:** `/api/assets/by-hash/{file_hash}`
- **Description:** 根据文件hash查询asset信息，用于去重检查 (Get asset information by file hash for deduplication check).
- **Path Parameters:**
  - `file_hash` (string, required): The hash of the file.
- **Response:** `Response[Asset]`

### Create Asset

- **Method:** `POST`
- **Path:** `/api/assets`
- **Description:** 创建新的资源，支持基于hash的去重检查 (Create a new asset, with support for deduplication based on hash).
- **Request Body:** `AssetCreate`
- **Response:** `Response[Asset]`

### List Assets

- **Method:** `GET`
- **Path:** `/api/assets`
- **Description:** 获取资源列表，支持类型和状态筛选 (List assets with optional filtering by type and status).
- **Query Parameters:**
  - `page` (integer, optional, default: 1): Page number.
  - `size` (integer, optional, default: 10): Page size.
  - `asset_type` (string, optional): Filter by asset type.
  - `status` (string, optional): Filter by status.
- **Response:** `Response[Page[Asset]]`

### Get Asset

- **Method:** `GET`
- **Path:** `/api/assets/{asset_id}`
- **Description:** 获取指定资源详情 (Get details of a specific asset).
- **Path Parameters:**
  - `asset_id` (integer, required): The ID of the asset.
- **Response:** `Response[Asset]`

### Update Asset

- **Method:** `PUT`
- **Path:** `/api/assets/{asset_id}`
- **Description:** 更新资源信息 (Update asset information).
- **Path Parameters:**
  - `asset_id` (integer, required): The ID of the asset.
- **Request Body:** `AssetUpdate`
- **Response:** `Response[Asset]`

### Delete Asset

- **Method:** `DELETE`
- **Path:** `/api/assets/{asset_id}`
- **Description:** 删除资源 (Delete an asset).
- **Path Parameters:**
  - `asset_id` (string, required): The ID of the asset to delete.
- **Response:** `Response`

### Get Assets by Type

- **Method:** `GET`
- **Path:** `/api/assets/by-type/{asset_type}`
- **Description:** 根据资源类型获取资源列表 (Get a list of assets by asset type).
- **Path Parameters:**
  - `asset_type` (string, required): The type of the assets.
- **Query Parameters:**
  - `page` (integer, optional, default: 1): Page number.
  - `size` (integer, optional, default: 10): Page size.
- **Response:** `Response[Page[Asset]]`

---

## Inspirations

**Prefix:** `/api/inspirations`

### Create Inspiration

- **Method:** `POST`
- **Path:** `/api/inspirations`
- **Description:** 创建新的创意灵感并触发n8n工作流 (Create a new inspiration and trigger the n8n workflow).
- **Request Body:** `InspirationCreate`
- **Response:** `Response[Inspiration]`

### List Inspirations

- **Method:** `GET`
- **Path:** `/api/inspirations`
- **Description:** 获取创意列表，支持状态筛选 (List inspirations with optional filtering by status).
- **Query Parameters:**
  - `page` (integer, optional, default: 1): Page number.
  - `size` (integer, optional, default: 100): Page size.
  - `status` (string, optional): Filter by status.
- **Response:** `Response[List[Inspiration]]`

### Get Inspiration

- **Method:** `GET`
- **Path:** `/api/inspirations/{inspiration_id}`
- **Description:** 获取指定创意详情 (Get details of a specific inspiration).
- **Path Parameters:**
  - `inspiration_id` (integer, required): The ID of the inspiration.
- **Response:** `Response[Inspiration]`

### Update Inspiration

- **Method:** `PUT`
- **Path:** `/api/inspirations/{inspiration_id}`
- **Description:** 更新创意信息 (Update inspiration information).
- **Path Parameters:**
  - `inspiration_id` (integer, required): The ID of the inspiration.
- **Request Body:** `InspirationUpdate`
- **Response:** `Response[Inspiration]`

### Delete Inspiration

- **Method:** `DELETE`
- **Path:** `/api/inspirations/{inspiration_id}`
- **Description:** 删除创意 (Delete an inspiration).
- **Path Parameters:**
  - `inspiration_id` (integer, required): The ID of the inspiration.
- **Response:** `Response[dict]`

### Approve Inspiration

- **Method:** `POST`
- **Path:** `/api/inspirations/{inspiration_id}/approve`
- **Description:** 审核通过创意并触发项目创建工作流 (Approve an inspiration and trigger the project creation workflow).
- **Path Parameters:**
  - `inspiration_id` (integer, required): The ID of the inspiration.
- **Request Body:** `Optional[dict]`
- **Response:** `Response[Inspiration]`

### Reject Inspiration

- **Method:** `POST`
- **Path:** `/api/inspirations/{inspiration_id}/reject`
- **Description:** 拒绝创意 (Reject an inspiration).
- **Path Parameters:**
  - `inspiration_id` (integer, required): The ID of the inspiration.
- **Request Body:** `Optional[dict]`
- **Response:** `Response[Inspiration]`

### Regenerate Inspiration

- **Method:** `POST`
- **Path:** `/api/inspirations/{inspiration_id}/regenerate`
- **Description:** 重新生成创意 (Regenerate an inspiration).
- **Path Parameters:**
  - `inspiration_id` (integer, required): The ID of the inspiration.
- **Request Body:** `Optional[dict]`
- **Response:** `Response[dict]`

---

## Platform Accounts

**Prefix:** `/api/platform-accounts`

### Create Platform Account

- **Method:** `POST`
- **Path:** `/api/platform-accounts`
- **Description:** Create a new platform account.
- **Request Body:** `PlatformAccountCreate`
- **Response:** `Response[PlatformAccount]`

### List Platform Accounts

- **Method:** `GET`
- **Path:** `/api/platform-accounts`
- **Description:** List platform accounts with optional filtering.
- **Query Parameters:**
  - `page` (integer, optional, default: 1): Page number.
  - `size` (integer, optional, default: 10): Page size.
  - `platform` (string, optional): Filter by platform.
  - `status` (string, optional): Filter by status.
- **Response:** `Response[Page[PlatformAccountList]]`

### Get Platform Account

- **Method:** `GET`
- **Path:** `/api/platform-accounts/{account_id}`
- **Description:** Get a specific platform account by ID.
- **Path Parameters:**
  - `account_id` (integer, required): The ID of the account.
- **Response:** `Response[PlatformAccount]`

### Update Platform Account

- **Method:** `PUT`
- **Path:** `/api/platform-accounts/{account_id}`
- **Description:** Update a platform account.
- **Path Parameters:**
  - `account_id` (integer, required): The ID of the account.
- **Request Body:** `PlatformAccountUpdate`
- **Response:** `Response[PlatformAccount]`

### Delete Platform Account

- **Method:** `DELETE`
- **Path:** `/api/platform-accounts/{account_id}`
- **Description:** Logically delete a platform account.
- **Path Parameters:**
  - `account_id` (integer, required): The ID of the account.
- **Response:** `Response[dict]`

### Get Available Accounts

- **Method:** `GET`
- **Path:** `/api/platform-accounts/available/{platform}`
- **Description:** Get available accounts for a specific platform.
- **Path Parameters:**
  - `platform` (string, required): The platform name.
- **Response:** `Response[List[PlatformAccountList]]`

### Reset Usage Count

- **Method:** `POST`
- **Path:** `/api/platform-accounts/{account_id}/reset-usage`
- **Description:** Reset the daily usage count for a platform account.
- **Path Parameters:**
  - `account_id` (integer, required): The ID of the account.
- **Request Body:** `PlatformAccountUsageReset`
- **Response:** `Response[PlatformAccount]`

### List Platforms

- **Method:** `GET`
- **Path:** `/api/platform-accounts/platforms/list`
- **Description:** Get a list of all unique platforms.
- **Response:** `Response[List[str]]`

---

## Project Types

**Prefix:** `/api/project-types`

### Create Project Type

- **Method:** `POST`
- **Path:** `/api/project-types`
- **Description:** Create a new project type.
- **Request Body:** `ProjectTypeCreate`
- **Response:** `Response[ProjectType]`

### List Project Types

- **Method:** `GET`
- **Path:** `/api/project-types`
- **Description:** List project types with optional filtering.
- **Query Parameters:**
  - `page` (integer, optional, default: 1): Page number.
  - `size` (integer, optional, default: 100): Page size.
  - `category` (string, optional): Filter by category.
  - `is_active` (boolean, optional): Filter by active status.
- **Response:** `Response[List[ProjectTypeList]]`

### Get Project Type

- **Method:** `GET`
- **Path:** `/api/project-types/{project_type_code}`
- **Description:** Get project type by code with workflow details.
- **Path Parameters:**
  - `project_type_code` (string, required): The code of the project type.
- **Response:** `Response[ProjectTypeWithWorkflows]`

### Update Project Type

- **Method:** `PUT`
- **Path:** `/api/project-types/{project_type_code}`
- **Description:** Update project type.
- **Path Parameters:**
  - `project_type_code` (string, required): The code of the project type.
- **Request Body:** `ProjectTypeUpdate`
- **Response:** `Response[ProjectType]`

### Delete Project Type

- **Method:** `DELETE`
- **Path:** `/api/project-types/{project_type_code}`
- **Description:** Soft delete project type.
- **Path Parameters:**
  - `project_type_code` (string, required): The code of the project type.
- **Response:** `Response[dict]`

### Activate Project Type

- **Method:** `POST`
- **Path:** `/api/project-types/{project_type_code}/activate`
- **Description:** Activate a project type.
- **Path Parameters:**
  - `project_type_code` (string, required): The code of the project type.
- **Response:** `Response[ProjectType]`

### Deactivate Project Type

- **Method:** `POST`
- **Path:** `/api/project-types/{project_type_code}/deactivate`
- **Description:** Deactivate a project type.
- **Path Parameters:**
  - `project_type_code` (string, required): The code of the project type.
- **Response:** `Response[ProjectType]`

### List Project Type Categories

- **Method:** `GET`
- **Path:** `/api/project-types/categories/list`
- **Description:** Get list of all unique project type categories.
- **Response:** `Response[List[str]]`

### Update Sort Order

- **Method:** `PUT`
- **Path:** `/api/project-types/{project_type_code}/sort-order`
- **Description:** Update project type sort order.
- **Path Parameters:**
  - `project_type_code` (string, required): The code of the project type.
- **Query Parameters:**
  - `sort_order` (integer, required): The new sort order.
- **Response:** `Response[ProjectType]`

---

## Projects

**Prefix:** `/api/projects`

### Create Project

- **Method:** `POST`
- **Path:** `/api/projects`
- **Description:** Create a new project.
- **Request Body:** `ProjectCreate`
- **Response:** `Response[Project]`

### Update Project

- **Method:** `PUT`
- **Path:** `/api/projects/{project_id}`
- **Description:** Update a project with comprehensive validation and business logic.
- **Path Parameters:**
  - `project_id` (integer, required): The ID of the project.
- **Request Body:** `ProjectUpdate`
- **Response:** `Response[Project]`

### Read Projects

- **Method:** `GET`
- **Path:** `/api/projects`
- **Description:** Get a list of projects.
- **Query Parameters:**
  - `page` (integer, optional, default: 1): Page number.
  - `size` (integer, optional, default: 100): Page size.
- **Response:** `Response[List[Project]]`

### Read Project

- **Method:** `GET`
- **Path:** `/api/projects/{project_id}`
- **Description:** Get details of a specific project.
- **Path Parameters:**
  - `project_id` (integer, required): The ID of the project.
- **Response:** `Response[Project]`

### Delete Project

- **Method:** `DELETE`
- **Path:** `/api/projects/{project_id}`
- **Description:** 逻辑删除项目 (Logically delete a project).
- **Path Parameters:**
  - `project_id` (integer, required): The ID of the project.
- **Response:** `Response[dict]`

### Recalculate Project Tasks

- **Method:** `POST`
- **Path:** `/api/projects/{project_id}/recalculate-tasks`
- **Description:** Manually recalculate project task counts. Useful for fixing data inconsistencies.
- **Path Parameters:**
  - `project_id` (integer, required): The ID of the project.
- **Response:** `Response[Project]`

### Regenerate Project

- **Method:** `POST`
- **Path:** `/api/projects/{project_id}/regenerate`
- **Description:** 重新生成项目，触发n8n执行工作流 (Regenerate a project, triggering an n8n execution workflow).
- **Path Parameters:**
  - `project_id` (integer, required): The ID of the project.
- **Request Body:** `Optional[dict]`
- **Response:** `Response[dict]`

---

## Target Account Analysis

**Prefix:** `/api/analysis`

### Quick Add Target Account

- **Method:** `POST`
- **Path:** `/api/analysis/accounts/quick-add`
- **Description:** 快速添加目标账号并立即触发一次后台数据同步任务。此端点会立即返回，所有耗时操作都在后台完成。 (Quickly add a target account and immediately trigger a background data synchronization task. This endpoint returns immediately; all time-consuming operations are done in the background.)
- **Request Body:** `QuickAddAccountRequest`
- **Response:** `Response[TargetAccount]`

### Trigger Video Download

- **Method:** `POST`
- **Path:** `/api/analysis/videos/trigger-download`
- **Description:** 手动创建并入队视频下载任务 (Manually create and enqueue video download tasks).
- **Request Body:** `TriggerDownloadRequest`
- **Response:** `Response`

### Trigger Crawl

- **Method:** `POST`
- **Path:** `/api/analysis/accounts/{account_id}/trigger-crawl`
- **Description:** 手动触发对指定账号的后台数据同步任务。 (Manually trigger a background data synchronization task for a specific account.)
- **Path Parameters:**
  - `account_id` (string, required): The ID of the account.
- **Request Body:** `AccountCrawlRequest`
- **Response:** `Response[MonitoringTask]`

### Batch Trigger Crawl

- **Method:** `POST`
- **Path:** `/api/analysis/accounts/batch-trigger-crawl`
- **Description:** 批量触发多个账号的后台数据同步任务。 (Batch trigger background data synchronization tasks for multiple accounts.)
- **Request Body:** `BatchAccountCrawlRequest`
- **Response:** `Response`

### List Accounts

- **Method:** `GET`
- **Path:** `/api/analysis/accounts`
- **Description:** 获取目标账号列表, 并附带最新的快照数据 (Get a list of target accounts with the latest snapshot data).
- **Query Parameters:**
  - `page` (integer, optional, default: 1)
  - `size` (integer, optional, default: 10)
  - `category` (string, optional)
  - `is_active` (boolean, optional)
  - `q` (string, optional): Search query.
- **Response:** `Response[Page[TargetAccount]]`

### Get Account

- **Method:** `GET`
- **Path:** `/api/analysis/accounts/{account_id}`
- **Description:** 获取单个目标账号信息, 并附带最新的快照数据 (Get information for a single target account with the latest snapshot data).
- **Path Parameters:**
  - `account_id` (string, required): The ID of the account.
- **Response:** `Response[TargetAccount]`

### Update Account

- **Method:** `PUT`
- **Path:** `/api/analysis/accounts/{account_id}`
- **Description:** 更新目标账号信息 (Update target account information).
- **Path Parameters:**
  - `account_id` (string, required): The ID of the account.
- **Request Body:** `TargetAccountUpdate`
- **Response:** `Response[TargetAccount]`

### Delete Account

- **Method:** `DELETE`
- **Path:** `/api/analysis/accounts/{account_id}`
- **Description:** 删除目标账号 (Delete a target account).
- **Path Parameters:**
  - `account_id` (string, required): The ID of the account.
- **Request Body:** `DeleteAccountRequest`
- **Response:** `Response`

### List Account Videos

- **Method:** `GET`
- **Path:** `/api/analysis/accounts/{account_id}/videos`
- **Description:** 获取指定账号下的视频列表, 并附带所有快照数据 (Get a list of videos for a specific account, with all snapshot data).
- **Path Parameters:**
  - `account_id` (string, required): The ID of the account.
- **Query Parameters:**
  - `page` (integer, optional, default: 1)
  - `size` (integer, optional, default: 10)
  - `sort_by` (string, optional, enum: `published_at`, `views_count`, `date_desc`, `views_desc`): Sort order.
- **Response:** `Response[Page[TargetVideo]]`

### List Videos

- **Method:** `GET`
- **Path:** `/api/analysis/videos`
- **Description:** 获取视频列表, 并附带所有快照数据 (Get a list of videos with all snapshot data).
- **Query Parameters:**
  - `page` (integer, optional, default: 1)
  - `size` (integer, optional, default: 10)
  - `sort_by` (string, optional, enum: `published_at`, `views_count`, `date_desc`, `views_desc`): Sort order.
- **Response:** `Response[Page[TargetVideo]]`

### List Account Snapshots

- **Method:** `GET`
- **Path:** `/api/analysis/accounts/{account_id}/snapshots`
- **Description:** 获取账号的历史快照数据 (Get historical snapshot data for an account).
- **Path Parameters:**
  - `account_id` (string, required): The ID of the account.
- **Query Parameters:**
  - `page` (integer, optional, default: 1)
  - `size` (integer, optional, default: 100)
- **Response:** `Response[List[TargetAccountSnapshot]]`

### List Video Snapshots

- **Method:** `GET`
- **Path:** `/api/analysis/videos/{video_id}/snapshots`
- **Description:** 获取视频的历史快照数据 (Get historical snapshot data for a video).
- **Path Parameters:**
  - `video_id` (string, required): The ID of the video.
- **Query Parameters:**
  - `page` (integer, optional, default: 1)
  - `size` (integer, optional, default: 10)
- **Response:** `Response[Page[TargetVideoSnapshot]]`

### Trigger Video Analysis

- **Method:** `POST`
- **Path:** `/api/analysis/videos/{video_id}/analyze`
- **Description:** 触发对指定视频的后台镜头分析任务。 (Trigger a background scene analysis task for a specific video.)
- **Path Parameters:**
  - `video_id` (string, required): The ID of the video.
- **Response:** `Response`

### List Tasks

- **Method:** `GET`
- **Path:** `/api/analysis/tasks`
- **Description:** 获取监控任务列表 (Get a list of monitoring tasks).
- **Query Parameters:**
  - `page` (integer, optional, default: 1)
  - `size` (integer, optional, default: 10)
  - `account_id` (string, optional)
  - `video_id` (string, optional)
  - `task_type` (string, optional, enum: `YOUTUBE_CRAWL`, `DOWNLOAD_VIDEO_FILE`, `VIDEO_ANALYSIS`)
  - `status` (string, optional, enum: `PENDING`, `QUEUED`, `PROCESSING`, `COMPLETED`, `FAILED`, `CANCELLED`)
- **Response:** `Response[Page[MonitoringTask]]`

### Update Task

- **Method:** `PUT`
- **Path:** `/api/analysis/tasks/{task_id}`
- **Description:** 更新监控任务状态 (例如，手动取消) (Update monitoring task status (e.g., manual cancellation)).
- **Path Parameters:**
  - `task_id` (string, required): The ID of the task.
- **Request Body:** `MonitoringTaskUpdate`
- **Response:** `Response[MonitoringTask]`

---

## Tasks

**Prefix:** `/api/tasks`

### Create Task

- **Method:** `POST`
- **Path:** `/api/tasks`
- **Description:** Create a new task.
- **Request Body:** `TaskCreate`
- **Response:** `Response[Task]`

### Create Tasks Batch

- **Method:** `POST`
- **Path:** `/api/tasks/batch`
- **Description:** Create multiple tasks in a batch.
- **Request Body:** `TaskBatchCreate`
- **Response:** `Response[List[Task]]`

### Update Task Status

- **Method:** `PATCH`
- **Path:** `/api/tasks/{task_id}`
- **Description:** Allows a worker to update the status of a task (e.g., to 'completed' or 'failed').
- **Path Parameters:**
  - `task_id` (string, required): The ID of the task.
- **Request Body:** `TaskStatusUpdate`
- **Response:** `Response[Task]`

### List Task Types

- **Method:** `GET`
- **Path:** `/api/tasks/types`
- **Description:** Get a list of all available task types.
- **Response:** `Response[List[str]]`

### List Tasks

- **Method:** `GET`
- **Path:** `/api/tasks`
- **Description:** Get a list of tasks.
- **Query Parameters:**
  - `project_id` (string, optional): Filter by project ID.
  - `task_type` (string, optional): Filter by task type.
  - `skip` (integer, optional, default: 0)
  - `limit` (integer, optional, default: 10)
- **Response:** `Response[Page[Task]]`

### Enqueue Task Manually

- **Method:** `POST`
- **Path:** `/api/tasks/{task_id}/enqueue`
- **Description:** 手动将任务加入队列，并构建发送给worker的最终任务结构。 (Manually add a task to the queue and build the final task structure to be sent to the worker.)
- **Path Parameters:**
  - `task_id` (string, required): The ID of the task.
- **Response:** `Response[dict]`

### Get Task Queue Status

- **Method:** `GET`
- **Path:** `/api/tasks/{task_id}/queue-status`
- **Description:** 获取任务的队列状态 (Get the queue status of a task).
- **Path Parameters:**
  - `task_id` (string, required): The ID of the task.
- **Response:** `Response[dict]`

### Cancel Task Queue

- **Method:** `POST`
- **Path:** `/api/tasks/{task_id}/cancel`
- **Description:** 取消任务的队列执行 (Cancel the execution of a task in the queue).
- **Path Parameters:**
  - `task_id` (string, required): The ID of the task.
- **Response:** `Response[dict]`

### Delete All Queues

- **Method:** `POST`
- **Path:** `/api/tasks/delete-all-queues`
- **Description:** 清空并删除所有队列 (Clear and delete all queues).
- **Response:** `Response[dict]`

### Get All Queues Info

- **Method:** `GET`
- **Path:** `/api/tasks/queue-info`
- **Description:** 获取所有队列的信息 (Get information about all queues).
- **Response:** `Response[dict]`

### List Redis Queues

- **Method:** `GET`
- **Path:** `/api/tasks/list-redis-queues`
- **Description:** 直接从Redis中列出所有实际存在的RQ队列 (Directly list all existing RQ queues from Redis).
- **Response:** `Response[list[str]]`

### Worker Callback

- **Method:** `POST`
- **Path:** `/api/tasks/callback`
- **Description:** 统一的Worker回调接口 (Unified worker callback interface).
- **Request Body:** `WorkerCallbackRequest`
- **Response:** `Response[dict]`

### Retry Monitoring Task

- **Method:** `POST`
- **Path:** `/api/tasks/monitoring/{task_id}/retry`
- **Description:** Retry a failed monitoring task. This is specifically for tasks managed by the MonitoringTask model.
- **Path Parameters:**
  - `task_id` (string, required): The ID of the monitoring task.
- **Response:** `Response[dict]`

---

## Webhooks

**Prefix:** `/api/webhooks`

### Handle Inspiration Webhook

- **Method:** `POST`
- **Path:** `/api/webhooks/n8n/inspiration/{inspiration_id}`
- **Description:** Handle n8n webhook for inspiration workflow completion.
- **Path Parameters:**
  - `inspiration_id` (string, required): The ID of the inspiration.
- **Request Body:** `JSON payload from n8n`
- **Response:** `Response`

### Handle Project Creation Webhook

- **Method:** `POST`
- **Path:** `/api/webhooks/n8n/project_creation/{inspiration_id}`
- **Description:** Handle n8n webhook for project creation (transform workflow).
- **Path Parameters:**
  - `inspiration_id` (string, required): The ID of the inspiration that triggered project creation.
- **Request Body:** `JSON payload from n8n`
- **Response:** `Response`

### Handle Project Execution Webhook

- **Method:** `POST`
- **Path:** `/api/webhooks/n8n/project_execution/{project_id}`
- **Description:** Handle n8n webhook for project execution workflow updates.
- **Path Parameters:**
  - `project_id` (string, required): The ID of the project.
- **Request Body:** `JSON payload from n8n`
- **Response:** `Response`

### Handle Task Update Webhook

- **Method:** `POST`
- **Path:** `/api/webhooks/n8n/task_update/{task_id}`
- **Description:** Handle n8n webhook for individual task updates.
- **Path Parameters:**
  - `task_id` (string, required): The ID of the task.
- **Request Body:** `JSON payload from n8n`
- **Response:** `Response`

---

## Worker Configs

**Prefix:** `/api/worker-configs`

### Create Worker Config

- **Method:** `POST`
- **Path:** `/api/worker-configs`
- **Description:** Create a new worker configuration.
- **Request Body:** `WorkerConfigCreate`
- **Response:** `Response[WorkerConfig]`

### List Worker Configs

- **Method:** `GET`
- **Path:** `/api/worker-configs`
- **Description:** List worker configurations with optional filtering.
- **Query Parameters:**
  - `worker_type` (string, optional)
  - `config_type` (string, optional)
  - `is_active` (boolean, optional, default: True)
  - `page` (integer, optional, default: 1)
  - `size` (integer, optional, default: 100)
- **Response:** `Response[List[WorkerConfig]]`

### Get Worker Config

- **Method:** `GET`
- **Path:** `/api/worker-configs/{config_id}`
- **Description:** Get a specific worker configuration.
- **Path Parameters:**
  - `config_id` (string, required): The ID of the configuration.
- **Response:** `Response[WorkerConfig]`

### Update Worker Config

- **Method:** `PUT`
- **Path:** `/api/worker-configs/{config_id}`
- **Description:** Update a worker configuration.
- **Path Parameters:**
  - `config_id` (string, required): The ID of the configuration.
- **Request Body:** `WorkerConfigUpdate`
- **Response:** `Response[WorkerConfig]`

### Delete Worker Config

- **Method:** `DELETE`
- **Path:** `/api/worker-configs/{config_id}`
- **Description:** Delete a worker configuration (soft delete by setting is_active=False).
- **Path Parameters:**
  - `config_id` (string, required): The ID of the configuration.
- **Response:** `Response[Dict[str, str]]`

### Assign Configs to Task

- **Method:** `POST`
- **Path:** `/api/worker-configs/tasks/{task_id}/assign`
- **Description:** Assign configurations to a specific task.
- **Path Parameters:**
  - `task_id` (string, required): The ID of the task.
- **Request Body:** `ConfigAssignmentRequest`
- **Response:** `Response[List[TaskConfig]]`

### Get Task Configs

- **Method:** `GET`
- **Path:** `/api/worker-configs/tasks/{task_id}/configs`
- **Description:** Get all configurations assigned to a specific task.
- **Path Parameters:**
  - `task_id` (string, required): The ID of the task.
- **Response:** `Response[Dict[str, Any]]`

---

## Workflow Registry

**Prefix:** `/api/workflow-registry`

### Create Workflow

- **Method:** `POST`
- **Path:** `/api/workflow-registry`
- **Description:** Create a new workflow registry entry.
- **Request Body:** `WorkflowRegistryCreate`
- **Response:** `Response[WorkflowRegistry]`

### List Workflows

- **Method:** `GET`
- **Path:** `/api/workflow-registry`
- **Description:** List workflow registry entries with optional filtering.
- **Query Parameters:**
  - `page` (integer, optional, default: 1)
  - `size` (integer, optional, default: 100)
  - `workflow_type` (string, optional)
  - `is_active` (boolean, optional)
- **Response:** `Response[List[WorkflowRegistryList]]`

### Get Workflow

- **Method:** `GET`
- **Path:** `/api/workflow-registry/{workflow_id}`
- **Description:** Get workflow registry entry by ID.
- **Path Parameters:**
  - `workflow_id` (string, required): The ID of the workflow.
- **Response:** `Response[WorkflowRegistry]`

### Update Workflow

- **Method:** `PUT`
- **Path:** `/api/workflow-registry/{workflow_id}`
- **Description:** Update workflow registry entry.
- **Path Parameters:**
  - `workflow_id` (string, required): The ID of the workflow.
- **Request Body:** `WorkflowRegistryUpdate`
- **Response:** `Response[WorkflowRegistry]`

### Delete Workflow

- **Method:** `DELETE`
- **Path:** `/api/workflow-registry/{workflow_id}`
- **Description:** Soft delete workflow registry entry.
- **Path Parameters:**
  - `workflow_id` (string, required): The ID of the workflow.
- **Response:** `Response[dict]`

### Activate Workflow

- **Method:** `POST`
- **Path:** `/api/workflow-registry/{workflow_id}/activate`
- **Description:** Activate a workflow.
- **Path Parameters:**
  - `workflow_id` (string, required): The ID of the workflow.
- **Response:** `Response[WorkflowRegistry]`

### Deactivate Workflow

- **Method:** `POST`
- **Path:** `/api/workflow-registry/{workflow_id}/deactivate`
- **Description:** Deactivate a workflow.
- **Path Parameters:**
  - `workflow_id` (string, required): The ID of the workflow.
- **Response:** `Response[WorkflowRegistry]`

### List Workflow Types

- **Method:** `GET`
- **Path:** `/api/workflow-registry/types/list`
- **Description:** Get list of all unique workflow types.
- **Response:** `Response[List[str]]`

---

## Data Schemas

### Asset

```json
{
  "name": "string",
  "description": "string",
  "asset_type": "string",
  "storage_path": "string",
  "asset_metadata": {},
  "duration_seconds": 0,
  "source": "string",
  "visibility": "private",
  "id": "string",
  "file_hash": "string",
  "original_filename": "string",
  "status": "string",
  "created_at": "2025-07-27T13:25:22.011Z",
  "updated_at": "2025-07-27T13:25:22.011Z"
}
```

### AssetCreate

```json
{
  "name": "string",
  "description": "string",
  "asset_type": "string",
  "storage_path": "string",
  "asset_metadata": {},
  "duration_seconds": 0,
  "source": "string",
  "visibility": "private",
  "file_hash": "string",
  "original_filename": "string",
  "status": "PENDING_ANALYSIS"
}
```

### AssetUpdate

```json
{
  "name": "string",
  "description": "string",
  "asset_type": "string",
  "storage_path": "string",
  "file_hash": "string",
  "original_filename": "string",
  "asset_metadata": {},
  "duration_seconds": 0,
  "source": "string",
  "visibility": "string",
  "status": "string"
}
```

### Inspiration

```json
{
  "title": "string",
  "description": "string",
  "project_type_code": "string",
  "source": "string",
  "parameters": {},
  "id": "string",
  "status": "string",
  "score": 0,
  "score_details": {},
  "review_notes": "string",
  "created_at": "2025-07-27T13:25:22.011Z",
  "updated_at": "2025-07-27T13:25:22.011Z"
}
```

### InspirationCreate

```json
{
  "title": "string",
  "description": "string",
  "project_type_code": "string",
  "source": "string",
  "parameters": {}
}
```

### InspirationUpdate

```json
{
  "title": "string",
  "description": "string",
  "project_type_code": "string",
  "source": "string",
  "parameters": {},
  "status": "string",
  "score": 0,
  "score_details": {},
  "review_notes": "string"
}
```

### PlatformAccount

```json
{
  "platform": "string",
  "name": "string",
  "credentials": {},
  "status": "active",
  "daily_limit": 0,
  "id": "string",
  "used_today": 0,
  "last_used_at": "2025-07-27T13:25:22.011Z",
  "created_at": "2025-07-27T13:25:22.011Z",
  "updated_at": "2025-07-27T13:25:22.011Z",
  "is_available": true,
  "remaining_quota": 0
}
```

### PlatformAccountCreate

```json
{
  "platform": "string",
  "name": "string",
  "credentials": {},
  "status": "active",
  "daily_limit": 0
}
```

### PlatformAccountUpdate

```json
{
  "platform": "string",
  "name": "string",
  "credentials": {},
  "status": "string",
  "daily_limit": 0
}
```

### Project

```json
{
  "name": "string",
  "project_type_code": "string",
  "initial_parameters": {},
  "id": "string",
  "status": "string",
  "inspiration_id": "string",
  "score": 0,
  "score_details": {},
  "review_notes": "string",
  "used_transform_workflow_id": "string",
  "used_execution_workflow_id": "string",
  "total_tasks": 0,
  "completed_tasks": 0,
  "failed_tasks": 0,
  "output_asset_id": "string",
  "created_at": "2025-07-27T13:25:22.011Z",
  "updated_at": "2025-07-27T13:25:22.011Z",
  "tasks": []
}
```

### ProjectCreate

```json
{
  "name": "string",
  "project_type_code": "string",
  "initial_parameters": {}
}
```

### ProjectUpdate

```json
{
  "name": "string",
  "initial_parameters": {},
  "inspiration_id": "string",
  "status": "string",
  "score": 0,
  "score_details": {},
  "review_notes": "string"
}
```

### Task

```json
{
  "task_type": "string",
  "status": "waiting",
  "dependencies": [],
  "task_output": {},
  "task_input": {},
  "id": "string",
  "project_id": "string",
  "platform_account_id": "string",
  "platform_account": {
    "name": "string",
    "credentials": {},
    "proxy": "string"
  },
  "submit_id": "string",
  "error_message": "string",
  "started_at": "2025-07-27T13:25:22.011Z",
  "completed_at": "2025-07-27T13:25:22.011Z",
  "created_at": "2025-07-27T13:25:22.011Z",
  "updated_at": "2025-07-27T13:25:22.011Z",
  "deleted_at": "2025-07-27T13:25:22.011Z",
  "forecast_generate_cost": 0,
  "forecast_queue_cost": 0
}
```

### TaskCreate

```json
{
  "task_type": "string",
  "dependencies": [],
  "task_input": {},
  "project_id": "string",
  "platform_account_id": "string"
}
```

### TaskStatusUpdate

```json
{
  "status": "string",
  "task_output": {},
  "error_message": "string",
  "task_input": {}
}
```

### Page[T]

```json
{
  "items": [],
  "total": 0,
  "page": 0,
  "size": 0,
  "pages": 0
}
```

### Response[T]

```json
{
  "code": 0,
  "msg": "success",
  "data": {}
}