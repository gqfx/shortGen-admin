# ShortsGen API 详细文档

## 基础信息
- **API 标题**: Short Video Automation Platform API
- **版本**: 1.0.0
- **描述**: 用于管理视频生成项目、资源和任务的API
- **基础URL**: http://localhost:8000

## 重要更新说明
- **2024年最新**: 所有API端点都支持带或不带尾随斜杠的访问方式
- **新增**: 工作流注册管理API (`/api/workflow-registry`)
- **新增**: 项目类型管理API (`/api/project-types`)
- **新增**: 目标账号分析管理API (`/api/target-account-analysis`) - 支持yt-dlp爬虫Worker数据管理
- **更新**: 平台账号查询响应现包含完整的凭证信息（包括代理配置）
- **新增**: 完整的CRUD服务层，支持批量操作和增长率自动计算

## 通用响应格式
所有API响应都使用统一的Response格式：
```json
{
  "code": 0,
  "msg": "success",
  "data": {}
}
```

**响应代码说明:**
- `0`: 成功
- `1`: 无内容
- `404`: 资源未找到
- `400`: 请求参数错误
- `500`: 服务器内部错误
- `-1`: 通用失败

## API 接口详情

### 1. 项目管理 (/api/projects)

#### 1.1 创建项目
- **POST** `/api/projects`
- **功能**: 创建新项目并自动生成任务图

**请求体:**
```json
{
  "name": "string",
  "project_type": "string",
  "initial_parameters": {
    "key": "value"
  }
}
```

**响应示例:**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "id": 1,
    "name": "测试项目",
    "project_type": "video_generation",
    "status": "pending",
    "initial_parameters": {},
    "inspiration_id": null,
    "score": null,
    "score_details": null,
    "review_notes": null,
    "used_transform_workflow_id": null,
    "used_execution_workflow_id": null,
    "total_tasks": 0,
    "completed_tasks": 0,
    "failed_tasks": 0,
    "output_asset_id": null,
    "created_at": "2023-01-01T00:00:00",
    "updated_at": "2023-01-01T00:00:00",
    "tasks": []
  }
}
```

#### 1.2 获取项目列表
- **GET** `/api/projects?skip=0&limit=100`

**查询参数:**
- `skip`: 跳过记录数 (默认: 0)
- `limit`: 限制记录数 (默认: 100)

**响应示例:**
```json
{
  "code": 0,
  "msg": "success",
  "data": [
    {
      "id": 1,
      "name": "测试项目",
      "project_type": "video_generation",
      "status": "pending",
      "total_tasks": 5,
      "completed_tasks": 2,
      "failed_tasks": 0,
      "created_at": "2023-01-01T00:00:00",
      "updated_at": "2023-01-01T00:00:00"
    }
  ]
}
```

#### 1.3 获取项目详情
- **GET** `/api/projects/{project_id}`

**路径参数:**
- `project_id`: 项目ID (整数)

**响应**: 同创建项目响应格式

#### 1.4 更新项目
- **PUT** `/api/projects/{project_id}`

**请求体:**
```json
{
  "name": "string (可选)",
  "initial_parameters": {},
  "inspiration_id": 1,
  "status": "pending|processing|completed|failed",
  "score": 4.5,
  "score_details": {},
  "review_notes": "string"
}
```

**状态转换规则:**
- `pending` → `processing`, `failed`
- `processing` → `completed`, `failed`
- `completed` → `processing`
- `failed` → `pending`, `processing`

#### 1.5 删除项目
- **DELETE** `/api/projects/{project_id}`

**响应:**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "message": "Project deleted successfully"
  }
}
```

#### 1.6 重算任务数量
- **POST** `/api/projects/{project_id}/recalculate-tasks`

#### 1.7 重新生成项目
- **POST** `/api/projects/{project_id}/regenerate`

**请求体 (可选):**
```json
{
  "key": "value"
}
```

**响应:**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "message": "Project regeneration workflow triggered",
    "project_id": 1,
    "execution_id": "workflow_exec_123"
  }
}
```

### 2. 任务管理 (/api/tasks)

#### 2.1 创建任务
- **POST** `/api/tasks`

**请求体:**
```json
{
  "project_id": 1,
  "task_type": "string",
  "status": "waiting|pending|processing|completed|failed",
  "dependencies": [1, 2, 3],
  "task_output": {},
  "platform_account_id": 1,
  "commit_id": "string",
  "error_message": "string"
}
```

**响应示例:**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "id": 1,
    "project_id": 1,
    "task_type": "video_generation",
    "status": "waiting",
    "dependencies": [1, 2],
    "task_output": null,
    "platform_account_id": 1,
    "commit_id": null,
    "error_message": null,
    "started_at": null,
    "completed_at": null,
    "created_at": "2023-01-01T00:00:00",
    "updated_at": "2023-01-01T00:00:00"
  }
}
```

#### 2.2 批量创建任务
- **POST** `/api/tasks/batch`

**请求体:**
```json
{
  "tasks": [
    {
      "project_id": 1,
      "task_type": "video_generation",
      "status": "waiting"
    },
    {
      "project_id": 1,
      "task_type": "audio_generation",
      "status": "waiting",
      "dependencies": [1]
    }
  ]
}
```

#### 2.3 认领任务
- **POST** `/api/tasks/claim`

**请求体:**
```json
{
  "task_types": ["video_generation", "audio_generation"]
}
```

**响应 (有可用任务):**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "id": 1,
    "task_type": "video_generation",
    "status": "processing",
    "project_id": 1
  }
}
```

**响应 (无可用任务):**
```json
{
  "code": 1,
  "msg": "No pending tasks available for the given types.",
  "data": null
}
```

#### 2.4 批量更新任务
- **PATCH** `/api/tasks/batch-update`

**请求体:**
```json
{
  "commit_ids": ["commit_123", "commit_456"],
  "status": "completed",
  "task_output": {
    "result": "success"
  },
  "error_message": null
}
```

#### 2.5 通过commit_id更新任务
- **PATCH** `/api/tasks/update-by-commit-id`

**请求体:**
```json
{
  "commit_id": "commit_123",
  "status": "completed",
  "task_output": {
    "video_url": "https://example.com/video.mp4"
  }
}
```

#### 2.6 更新任务状态
- **PATCH** `/api/tasks/{task_id}`

**请求体:**
```json
{
  "status": "completed",
  "task_output": {},
  "error_message": "string"
}
```

#### 2.7 获取任务列表
- **GET** `/api/tasks?skip=0&limit=100`

### 3. 资源管理 (/api/assets)

#### 3.1 创建资源
- **POST** `/api/assets`

**请求体:**
```json
{
  "name": "string",
  "description": "string",
  "asset_type": "video|image|audio|text",
  "storage_path": "string",
  "asset_metadata": {},
  "duration_seconds": 120.5,
  "source": "string",
  "visibility": "private|public",
  "status": "PENDING_ANALYSIS"
}
```

**响应示例:**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "id": 1,
    "name": "测试视频",
    "description": "这是一个测试视频",
    "asset_type": "video",
    "storage_path": "/storage/videos/test.mp4",
    "asset_metadata": {
      "resolution": "1920x1080",
      "fps": 30
    },
    "duration_seconds": 120.5,
    "source": "ai_generated",
    "visibility": "private",
    "status": "PENDING_ANALYSIS",
    "created_at": "2023-01-01T00:00:00",
    "updated_at": "2023-01-01T00:00:00"
  }
}
```

#### 3.2 获取资源列表
- **GET** `/api/assets?skip=0&limit=100&asset_type=video&status=ACTIVE`

**查询参数:**
- `skip`: 跳过记录数
- `limit`: 限制记录数
- `asset_type`: 资源类型筛选
- `status`: 状态筛选

#### 3.3 获取资源详情
- **GET** `/api/assets/{asset_id}`

#### 3.4 更新资源
- **PUT** `/api/assets/{asset_id}`

**请求体:** (所有字段都是可选的)
```json
{
  "name": "string",
  "description": "string",
  "asset_type": "string",
  "storage_path": "string",
  "asset_metadata": {},
  "duration_seconds": 120.5,
  "source": "string",
  "visibility": "string",
  "status": "string"
}
```

#### 3.5 删除资源
- **DELETE** `/api/assets/{asset_id}`

#### 3.6 按类型获取资源
- **GET** `/api/assets/by-type/{asset_type}?skip=0&limit=100`

### 4. 创意管理 (/api/inspirations)

#### 4.1 创建创意
- **POST** `/api/inspirations`

**请求体:**
```json
{
  "title": "string",
  "description": "string",
  "project_type_code": "string",
  "source": "string",
  "parameters": {}
}
```

**响应示例:**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "id": 1,
    "title": "创意标题",
    "description": "创意描述",
    "project_type_code": "video_gen",
    "source": "user_input",
    "parameters": {
      "style": "modern"
    },
    "status": "draft",
    "score": null,
    "score_details": null,
    "review_notes": null,
    "created_at": "2023-01-01T00:00:00",
    "updated_at": "2023-01-01T00:00:00"
  }
}
```

#### 4.2 获取创意列表
- **GET** `/api/inspirations?skip=0&limit=100&status=draft`

#### 4.3 获取创意详情
- **GET** `/api/inspirations/{inspiration_id}`

#### 4.4 更新创意
- **PUT** `/api/inspirations/{inspiration_id}`

**请求体:** (所有字段都是可选的)
```json
{
  "title": "string",
  "description": "string",
  "project_type_code": "string",
  "source": "string",
  "parameters": {},
  "status": "string",
  "score": 4.5,
  "score_details": {},
  "review_notes": "string"
}
```

#### 4.5 删除创意
- **DELETE** `/api/inspirations/{inspiration_id}`

#### 4.6 审核通过创意
- **POST** `/api/inspirations/{inspiration_id}/approve`

**请求体 (可选):**
```json
{
  "review_notes": "string",
  "score": 4.5
}
```

#### 4.7 拒绝创意
- **POST** `/api/inspirations/{inspiration_id}/reject`

**请求体 (可选):**
```json
{
  "review_notes": "string"
}
```

#### 4.8 重新生成创意
- **POST** `/api/inspirations/{inspiration_id}/regenerate`

**请求体 (可选):**
```json
{
  "parameter_overrides": {}
}
```

### 5. 平台账号管理 (/api/platform-accounts)

#### 5.1 创建平台账号
- **POST** `/api/platform-accounts`

**请求体:**
```json
{
  "platform": "dreamina|midjourney|runway",
  "name": "账号标识名称",
  "credentials": {
    "api_key": "string",
    "secret": "string"
  },
  "status": "active|inactive",
  "daily_limit": 100
}
```

**响应示例:**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "id": 1,
    "platform": "dreamina",
    "name": "dreamina_account_1",
    "credentials": {
      "api_key": "***masked***"
    },
    "status": "active",
    "daily_limit": 100,
    "used_today": 0,
    "last_used_at": null,
    "is_available": true,
    "remaining_quota": 100,
    "created_at": "2023-01-01T00:00:00",
    "updated_at": "2023-01-01T00:00:00"
  }
}
```

#### 5.2 获取账号列表
- **GET** `/api/platform-accounts?skip=0&limit=100&platform=dreamina&status=active`

**查询参数:**
- `skip`: 跳过记录数
- `limit`: 限制记录数
- `platform`: 平台筛选
- `status`: 状态筛选

**响应示例:**
```json
{
  "code": 0,
  "msg": "success",
  "data": [
    {
      "id": 1,
      "platform": "dreamina",
      "name": "dreamina_account_1",
      "status": "active",
      "daily_limit": 100,
      "used_today": 25,
      "is_available": true,
      "remaining_quota": 75,
      "created_at": "2023-01-01T00:00:00"
    }
  ]
}
```

#### 5.3 获取账号详情
- **GET** `/api/platform-accounts/{account_id}`

#### 5.4 更新账号
- **PUT** `/api/platform-accounts/{account_id}`

**请求体:** (所有字段都是可选的)
```json
{
  "platform": "string",
  "name": "string",
  "credentials": {},
  "status": "string",
  "daily_limit": 100
}
```

#### 5.5 删除账号
- **DELETE** `/api/platform-accounts/{account_id}`

#### 5.6 获取可用账号
- **GET** `/api/platform-accounts/available/{platform}`

**响应:** 返回指定平台的所有可用账号列表

#### 5.7 重置使用量
- **POST** `/api/platform-accounts/{account_id}/reset-usage`

**请求体:**
```json
{
  "used_today": 0
}
```

#### 5.8 获取平台列表
- **GET** `/api/platform-accounts/platforms/list`

**响应示例:**
```json
{
  "code": 0,
  "msg": "success",
  "data": ["dreamina", "midjourney", "runway"]
}
```

### 6. Worker配置管理 (/api/worker-configs)

#### 6.1 创建Worker配置
- **POST** `/api/worker-configs`

**请求体:**
```json
{
  "config_name": "video_worker_config",
  "config_type": "execution",
  "worker_type": "video_generator",
  "config_data": {
    "max_concurrent": 3,
    "timeout": 300
  },
  "description": "视频生成器配置",
  "priority": 10,
  "is_active": true
}
```

**响应示例:**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "id": 1,
    "config_name": "video_worker_config",
    "config_type": "execution",
    "worker_type": "video_generator",
    "config_data": {
      "max_concurrent": 3,
      "timeout": 300
    },
    "description": "视频生成器配置",
    "priority": 10,
    "is_active": true,
    "created_at": "2023-01-01T00:00:00",
    "updated_at": "2023-01-01T00:00:00"
  }
}
```

#### 6.2 获取配置列表
- **GET** `/api/worker-configs?worker_type=video_generator&config_type=execution&is_active=true&skip=0&limit=100`

**查询参数:**
- `worker_type`: Worker类型筛选
- `config_type`: 配置类型筛选
- `is_active`: 是否激活筛选
- `skip`: 跳过记录数
- `limit`: 限制记录数

#### 6.3 获取配置详情
- **GET** `/api/worker-configs/{config_id}`

#### 6.4 更新配置
- **PUT** `/api/worker-configs/{config_id}`

**请求体:** (所有字段都是可选的)
```json
{
  "config_name": "string",
  "config_type": "string",
  "worker_type": "string",
  "config_data": {},
  "description": "string",
  "priority": 10,
  "is_active": true
}
```

#### 6.5 删除配置
- **DELETE** `/api/worker-configs/{config_id}`

**注意**: 这是软删除，会将`is_active`设置为`false`

#### 6.6 为任务分配配置
- **POST** `/api/worker-configs/tasks/{task_id}/assign`

**请求体:**
```json
{
  "config_ids": [1, 2, 3],
  "override_data": {
    "custom_param": "value"
  }
}
```

**响应示例:**
```json
{
  "code": 0,
  "msg": "success",
  "data": [
    {
      "id": 1,
      "task_id": 5,
      "config_id": 1,
      "override_data": {
        "custom_param": "value"
      },
      "created_at": "2023-01-01T00:00:00"
    }
  ]
}
```

#### 6.7 获取任务配置
- **GET** `/api/worker-configs/tasks/{task_id}/configs`

**响应示例:**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "task_id": 5,
    "configs": [
      {
        "config_name": "video_worker_config",
        "config_data": {
          "max_concurrent": 3,
          "timeout": 300,
          "custom_param": "value"
        }
      }
    ]
  }
}
```

### 7. Webhook接口 (/api/webhooks)

#### 7.1 创意工作流Webhook
- **POST** `/api/webhooks/n8n/inspiration/{inspiration_id}`

**请求体:**
```json
{
  "status": "success|failed",
  "data": {
    "title": "AI生成的标题",
    "description": "AI生成的描述",
    "parameters": {},
    "score": 4.5,
    "error": "错误信息"
  },
  "executionId": "n8n_exec_123"
}
```

**响应示例:**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "message": "Inspiration webhook processed",
    "inspiration_id": 1,
    "status": "success"
  }
}
```

#### 7.2 项目创建Webhook
- **POST** `/api/webhooks/n8n/project_creation/{inspiration_id}`

**请求体:**
```json
{
  "status": "success|failed",
  "project": {
    "name": "项目名称",
    "project_type": "video_generation",
    "initial_parameters": {}
  },
  "tasks": [
    {
      "task_type": "video_generation",
      "status": "waiting",
      "dependencies": [],
      "task_output": {},
      "platform_account_id": 1,
      "commit_id": "task_commit_123"
    }
  ],
  "executionId": "n8n_exec_456"
}
```

**响应示例:**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "message": "Project created successfully",
    "project_id": 5,
    "tasks_created": 3
  }
}
```

#### 7.3 项目执行Webhook
- **POST** `/api/webhooks/n8n/project_execution/{project_id}`

**请求体:**
```json
{
  "status": "success|failed",
  "task_updates": [
    {
      "task_id": 1,
      "status": "completed",
      "task_output": {
        "video_url": "https://example.com/video.mp4"
      },
      "error_message": null,
      "commit_id": "task_commit_789"
    }
  ],
  "project_updates": {
    "status": "processing"
  },
  "executionId": "n8n_exec_789"
}
```

#### 7.4 任务更新Webhook
- **POST** `/api/webhooks/n8n/task_update/{task_id}`

**请求体:**
```json
{
  "status": "completed|failed|processing",
  "task_output": {
    "result_url": "https://example.com/result.mp4"
  },
  "error_message": "错误信息",
  "commit_id": "task_commit_final"
}
```

**响应示例:**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "message": "Task webhook processed",
    "task_id": 1,
    "status": "completed"
  }
}
```

## 错误处理

### 常见错误响应

#### 资源未找到 (404)
```json
{
  "code": 404,
  "msg": "Project not found",
  "data": null
}
```

#### 参数错误 (400)
```json
{
  "code": 400,
  "msg": "Invalid status transition from completed to pending",
  "data": null
}
```

#### 服务器错误 (500)
```json
{
  "code": 500,
  "msg": "Error processing webhook",
  "data": null
}
```

#### 无内容 (1)
```json
{
  "code": 1,
  "msg": "No pending tasks available for the given types.",
  "data": null
}
```

## 特性说明

### 1. 逻辑删除
- 所有删除操作都是逻辑删除，通过设置`deleted_at`字段实现
- 查询时会自动过滤已删除的记录

### 2. 任务依赖管理
- 支持任务间依赖关系定义
- 创建任务时会验证依赖是否会造成循环依赖
- 任务完成时会自动触发依赖任务的处理

### 3. 状态转换控制
- 项目和任务状态转换有严格的业务规则控制
- 不允许的状态转换会返回400错误

### 4. n8n工作流集成
- 创意、项目生成都会触发对应的n8n工作流
- 通过webhook接收工作流执行结果并更新数据
- 支持异步工作流执行

### 5. Worker认领机制
- 支持多Worker并发安全的任务认领
- 使用数据库锁确保任务不会被重复认领
- 支持按任务类型认领

### 6. 平台账号可用性管理
- 支持每日使用量限制
- 自动判断账号可用性状态
- 实时计算剩余配额

### 7. 配置管理
- 支持Worker配置的动态管理
- 支持任务级别的配置覆盖
- 支持配置优先级排序

## 使用示例

### 创建完整的项目流程

1. **创建创意**
```bash
curl -X POST "http://localhost:8000/api/inspirations" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "AI短视频创意",
    "description": "关于科技的短视频",
    "project_type_code": "tech_video",
    "source": "user_input"
  }'
```

2. **审核通过创意**
```bash
curl -X POST "http://localhost:8000/api/inspirations/1/approve" \
  -H "Content-Type: application/json" \
  -d '{
    "review_notes": "创意不错，可以制作",
    "score": 4.5
  }'
```

3. **Worker认领任务**
```bash
curl -X POST "http://localhost:8000/api/tasks/claim" \
  -H "Content-Type: application/json" \
  -d '{
    "task_types": ["video_generation", "audio_generation"]
  }'
```

4. **更新任务状态**
```bash
curl -X PATCH "http://localhost:8000/api/tasks/update-by-commit-id" \
  -H "Content-Type: application/json" \
  -d '{
    "commit_id": "task_commit_123",
    "status": "completed",
    "task_output": {
      "video_url": "https://example.com/video.mp4"
    }
  }'
```

### 8. 工作流注册管理 (/api/workflow-registry)

#### 8.1 创建工作流
- **POST** `/api/workflow-registry`
- **功能**: 注册新的工作流配置

**请求体:**
```json
{
  "id": "dreamina_video_gen_v1",
  "name": "Dreamina视频生成工作流",
  "description": "使用Dreamina平台生成视频的完整工作流",
  "workflow_type": "execution",
  "version": "1.0.0",
  "config": {
    "platform": "dreamina",
    "model": "video_gen_model",
    "parameters": {
      "duration": 30,
      "quality": "HD"
    }
  },
  "is_active": true
}
```

**响应示例:**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "id": "dreamina_video_gen_v1",
    "name": "Dreamina视频生成工作流",
    "description": "使用Dreamina平台生成视频的完整工作流",
    "workflow_type": "execution",
    "version": "1.0.0",
    "config": {
      "platform": "dreamina",
      "model": "video_gen_model",
      "parameters": {
        "duration": 30,
        "quality": "HD"
      }
    },
    "is_active": true,
    "created_at": "2023-01-01T00:00:00",
    "updated_at": "2023-01-01T00:00:00"
  }
}
```

#### 8.2 获取工作流列表
- **GET** `/api/workflow-registry?skip=0&limit=100&workflow_type=execution&is_active=true`
- **功能**: 获取工作流注册列表，支持按类型和状态过滤

**查询参数:**
- `skip`: 跳过的记录数（分页）
- `limit`: 返回的记录数限制
- `workflow_type`: 工作流类型过滤 (inspiration, transform, execution)
- `is_active`: 是否激活状态过滤 (true/false)

**响应示例:**
```json
{
  "code": 0,
  "msg": "success",
  "data": [
    {
      "id": "dreamina_video_gen_v1",
      "name": "Dreamina视频生成工作流",
      "description": "使用Dreamina平台生成视频的完整工作流",
      "workflow_type": "execution",
      "version": "1.0.0",
      "is_active": true,
      "created_at": "2023-01-01T00:00:00"
    }
  ]
}
```

#### 8.3 获取工作流详情
- **GET** `/api/workflow-registry/{workflow_id}`
- **功能**: 获取指定工作流的详细配置信息

**响应示例:**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "id": "dreamina_video_gen_v1",
    "name": "Dreamina视频生成工作流",
    "description": "使用Dreamina平台生成视频的完整工作流",
    "workflow_type": "execution",
    "version": "1.0.0",
    "config": {
      "platform": "dreamina",
      "model": "video_gen_model",
      "parameters": {
        "duration": 30,
        "quality": "HD"
      }
    },
    "is_active": true,
    "created_at": "2023-01-01T00:00:00",
    "updated_at": "2023-01-01T00:00:00"
  }
}
```

#### 8.4 更新工作流
- **PUT** `/api/workflow-registry/{workflow_id}`
- **功能**: 更新工作流配置信息

**请求体:** (所有字段都是可选的)
```json
{
  "name": "更新后的工作流名称",
  "description": "更新后的描述",
  "workflow_type": "execution",
  "version": "1.1.0",
  "config": {
    "platform": "dreamina",
    "model": "video_gen_model_v2",
    "parameters": {
      "duration": 60,
      "quality": "4K"
    }
  },
  "is_active": true
}
```

#### 8.5 删除工作流
- **DELETE** `/api/workflow-registry/{workflow_id}`
- **功能**: 软删除工作流（逻辑删除）

**响应示例:**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "message": "Workflow deleted successfully"
  }
}
```

#### 8.6 激活工作流
- **POST** `/api/workflow-registry/{workflow_id}/activate`
- **功能**: 激活指定的工作流

**响应示例:**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "id": "dreamina_video_gen_v1",
    "name": "Dreamina视频生成工作流",
    "is_active": true,
    "updated_at": "2023-01-01T00:00:00"
  }
}
```

#### 8.7 停用工作流
- **POST** `/api/workflow-registry/{workflow_id}/deactivate`
- **功能**: 停用指定的工作流

**响应示例:**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "id": "dreamina_video_gen_v1",
    "name": "Dreamina视频生成工作流",
    "is_active": false,
    "updated_at": "2023-01-01T00:00:00"
  }
}
```

#### 8.8 获取工作流类型列表
- **GET** `/api/workflow-registry/types/list`
- **功能**: 获取系统中所有的工作流类型

**响应示例:**
```json
{
  "code": 0,
  "msg": "success",
  "data": [
    "inspiration",
    "transform", 
    "execution"
  ]
}
```

### 9. 项目类型管理 (/api/project-types)

#### 9.1 创建项目类型
- **POST** `/api/project-types`
- **功能**: 创建新的项目类型配置

**请求体:**
```json
{
  "code": "tech_video_short",
  "name": "科技短视频",
  "description": "科技类短视频项目类型",
  "inspiration_workflow_id": "tech_inspiration_v1",
  "transform_workflow_id": "script_transform_v1", 
  "execution_workflow_id": "dreamina_video_gen_v1",
  "default_parameters": {
    "duration": 30,
    "style": "modern",
    "target_audience": "general"
  },
  "parameter_schema": {
    "type": "object",
    "properties": {
      "duration": {
        "type": "integer",
        "minimum": 15,
        "maximum": 60
      },
      "style": {
        "type": "string",
        "enum": ["modern", "classic", "trendy"]
      }
    }
  },
  "category": "video",
  "sort_order": 10,
  "is_active": true
}
```

**响应示例:**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "code": "tech_video_short",
    "name": "科技短视频",
    "description": "科技类短视频项目类型",
    "inspiration_workflow_id": "tech_inspiration_v1",
    "transform_workflow_id": "script_transform_v1",
    "execution_workflow_id": "dreamina_video_gen_v1",
    "default_parameters": {
      "duration": 30,
      "style": "modern",
      "target_audience": "general"
    },
    "parameter_schema": {
      "type": "object",
      "properties": {
        "duration": {
          "type": "integer",
          "minimum": 15,
          "maximum": 60
        },
        "style": {
          "type": "string", 
          "enum": ["modern", "classic", "trendy"]
        }
      }
    },
    "category": "video",
    "sort_order": 10,
    "is_active": true,
    "created_at": "2023-01-01T00:00:00",
    "updated_at": "2023-01-01T00:00:00"
  }
}
```

#### 9.2 获取项目类型列表
- **GET** `/api/project-types?skip=0&limit=100&category=video&is_active=true`
- **功能**: 获取项目类型列表，支持按分类和状态过滤

**查询参数:**
- `skip`: 跳过的记录数（分页）
- `limit`: 返回的记录数限制
- `category`: 项目类型分类过滤
- `is_active`: 是否激活状态过滤 (true/false)

**响应示例:**
```json
{
  "code": 0,
  "msg": "success",
  "data": [
    {
      "code": "tech_video_short",
      "name": "科技短视频",
      "description": "科技类短视频项目类型",
      "category": "video",
      "sort_order": 10,
      "is_active": true,
      "created_at": "2023-01-01T00:00:00"
    }
  ]
}
```

#### 9.3 获取项目类型详情
- **GET** `/api/project-types/{project_type_code}`
- **功能**: 获取指定项目类型的详细信息及关联工作流详情

**响应示例:**
```json
{
  "code": 0,
  "msg": "success", 
  "data": {
    "code": "tech_video_short",
    "name": "科技短视频",
    "description": "科技类短视频项目类型",
    "inspiration_workflow_id": "tech_inspiration_v1",
    "transform_workflow_id": "script_transform_v1",
    "execution_workflow_id": "dreamina_video_gen_v1",
    "default_parameters": {
      "duration": 30,
      "style": "modern"
    },
    "parameter_schema": {
      "type": "object",
      "properties": {
        "duration": {"type": "integer"},
        "style": {"type": "string"}
      }
    },
    "category": "video",
    "sort_order": 10,
    "is_active": true,
    "created_at": "2023-01-01T00:00:00",
    "updated_at": "2023-01-01T00:00:00",
    "inspiration_workflow": {
      "id": "tech_inspiration_v1",
      "name": "科技创意生成工作流",
      "workflow_type": "inspiration"
    },
    "transform_workflow": {
      "id": "script_transform_v1", 
      "name": "脚本转换工作流",
      "workflow_type": "transform"
    },
    "execution_workflow": {
      "id": "dreamina_video_gen_v1",
      "name": "Dreamina视频生成工作流",
      "workflow_type": "execution"
    }
  }
}
```

#### 9.4 更新项目类型
- **PUT** `/api/project-types/{project_type_code}`
- **功能**: 更新项目类型配置信息

**请求体:** (所有字段都是可选的)
```json
{
  "name": "更新后的科技短视频",
  "description": "更新后的描述",
  "inspiration_workflow_id": "tech_inspiration_v2",
  "default_parameters": {
    "duration": 45,
    "style": "trendy"
  },
  "category": "video",
  "sort_order": 15,
  "is_active": true
}
```

#### 9.5 删除项目类型
- **DELETE** `/api/project-types/{project_type_code}`
- **功能**: 软删除项目类型（逻辑删除）

**响应示例:**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "message": "Project type deleted successfully"
  }
}
```

#### 9.6 激活项目类型
- **POST** `/api/project-types/{project_type_code}/activate`
- **功能**: 激活指定的项目类型

**响应示例:**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "code": "tech_video_short",
    "name": "科技短视频",
    "is_active": true,
    "updated_at": "2023-01-01T00:00:00"
  }
}
```

#### 9.7 停用项目类型
- **POST** `/api/project-types/{project_type_code}/deactivate`
- **功能**: 停用指定的项目类型

**响应示例:**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "code": "tech_video_short",
    "name": "科技短视频", 
    "is_active": false,
    "updated_at": "2023-01-01T00:00:00"
  }
}
```

#### 9.8 获取项目类型分类列表
- **GET** `/api/project-types/categories/list`
- **功能**: 获取系统中所有的项目类型分类

**响应示例:**
```json
{
  "code": 0,
  "msg": "success",
  "data": [
    "video",
    "audio",
    "image"
  ]
}
```

#### 9.9 更新项目类型排序
- **PUT** `/api/project-types/{project_type_code}/sort-order?sort_order=20`
- **功能**: 更新项目类型的显示排序

**查询参数:**
- `sort_order`: 新的排序值

**响应示例:**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "code": "tech_video_short",
    "name": "科技短视频",
    "sort_order": 20,
    "updated_at": "2023-01-01T00:00:00"
  }
}
```

### 项目类型管理示例用法

1. **创建新项目类型**
```bash
curl -X POST "http://localhost:8000/api/project-types" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "education_video",
    "name": "教育类视频",
    "description": "适用于教育培训的视频项目类型",
    "inspiration_workflow_id": "education_inspiration_v1",
    "transform_workflow_id": "script_transform_v1",
    "execution_workflow_id": "dreamina_video_gen_v1",
    "default_parameters": {
      "duration": 60,
      "style": "professional",
      "language": "chinese"
    },
    "parameter_schema": {
      "type": "object",
      "properties": {
        "duration": {"type": "integer", "minimum": 30, "maximum": 300},
        "style": {"type": "string", "enum": ["professional", "casual", "formal"]},
        "language": {"type": "string", "enum": ["chinese", "english"]}
      }
    },
    "category": "education",
    "sort_order": 5,
    "is_active": true
  }'
```

2. **查询视频类项目类型**
```bash
curl "http://localhost:8000/api/project-types?category=video&is_active=true"
```

3. **获取项目类型详情及关联工作流**
```bash
curl "http://localhost:8000/api/project-types/education_video"
```

4. **更新项目类型配置**
```bash
curl -X PUT "http://localhost:8000/api/project-types/education_video" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "在线教育视频",
    "default_parameters": {
      "duration": 90,
      "style": "modern",
      "interactive": true
    },
    "sort_order": 3
  }'
```

5. **获取所有项目类型分类**
```bash
curl "http://localhost:8000/api/project-types/categories/list"
```

6. **停用项目类型**
```bash
curl -X POST "http://localhost:8000/api/project-types/education_video/deactivate"
```

### 10. 目标账号分析管理 (/api/target-account-analysis)

#### 10.1 快速添加目标账号
- **POST** `/api/target-account-analysis/accounts/quick-add`
- **功能**: 通过频道URL快速添加监控账号，系统自动检测平台并提取信息

**最简参数:**
```json
{
  "channel_url": "https://www.youtube.com/channel/UCxxxxxxxxxxxxxx",
  "monitor_frequency": "daily",
  "video_limit": 50
}
```

**完整参数示例:**
```json
{
  "channel_url": "https://www.youtube.com/channel/UCxxxxxxxxxxxxxx",
  "category": "technology",
  "monitor_frequency": "daily",
  "video_limit": 50,
  "crawl_videos": true,
  "crawl_metrics": true
}
```

**响应示例:**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "id": 1,
    "platform": "youtube",
    "platform_account_id": "UCxxxxxxxxxxxxxx",
    "username": "tech_channel", 
    "display_name": "科技频道",
    "profile_url": "https://www.youtube.com/channel/UCxxxxxxxxxxxxxx",
    "description": "专注科技内容的频道",
    "avatar_url": "https://example.com/avatar.jpg",
    "is_verified": true,
    "category": "technology",
    "is_active": true,
    "monitor_frequency": "daily",
    "last_crawled_at": null,
    "created_at": "2023-01-01T00:00:00",
    "updated_at": "2023-01-01T00:00:00"
  }
}
```

#### 10.2 创建目标账号（手动）
- **POST** `/api/target-account-analysis/accounts`
- **功能**: 创建新的目标账号监控配置

**请求体:**
```json
{
  "platform": "youtube",
  "platform_account_id": "UCxxxxxxxxxxxxxx", 
  "username": "tech_channel",
  "display_name": "科技频道",
  "profile_url": "https://www.youtube.com/channel/UCxxxxxxxxxxxxxx",
  "description": "专注科技内容的频道",
  "avatar_url": "https://example.com/avatar.jpg",
  "is_verified": true,
  "category": "technology",
  "monitor_frequency": "daily"
}
```

**响应示例:**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "id": 1,
    "platform": "youtube",
    "platform_account_id": "UCxxxxxxxxxxxxxx",
    "username": "tech_channel", 
    "display_name": "科技频道",
    "profile_url": "https://www.youtube.com/channel/UCxxxxxxxxxxxxxx",
    "description": "专注科技内容的频道",
    "avatar_url": "https://example.com/avatar.jpg",
    "is_verified": true,
    "category": "technology",
    "is_active": true,
    "monitor_frequency": "daily",
    "last_crawled_at": null,
    "created_at": "2023-01-01T00:00:00",
    "updated_at": "2023-01-01T00:00:00"
  }
}
```

#### 10.3 获取目标账号列表  
- **GET** `/api/target-account-analysis/accounts?platform=youtube&is_active=true&skip=0&limit=50`

**查询参数:**
- `platform`: 平台过滤 (youtube, tiktok, bilibili)
- `is_active`: 是否活跃监控
- `category`: 内容分类过滤
- `monitor_frequency`: 监控频率过滤
- `skip`: 跳过记录数
- `limit`: 限制记录数

**响应示例:**
```json
{
  "code": 0,
  "msg": "success",
  "data": [
    {
      "id": 1,
      "platform": "youtube",
      "username": "tech_channel",
      "display_name": "科技频道",
      "category": "technology", 
      "is_active": true,
      "monitor_frequency": "daily",
      "last_crawled_at": "2023-01-01T12:00:00",
      "created_at": "2023-01-01T00:00:00"
    }
  ]
}
```

#### 10.4 获取账号详情
- **GET** `/api/target-account-analysis/accounts/{account_id}`

**响应**: 包含账号基本信息及最新统计数据

#### 10.5 更新账号配置
- **PUT** `/api/target-account-analysis/accounts/{account_id}`

**请求体:** (所有字段都是可选的)
```json
{
  "display_name": "更新后的频道名",
  "category": "entertainment",
  "monitor_frequency": "hourly",
  "is_active": false
}
```

#### 10.6 删除账号监控
- **DELETE** `/api/target-account-analysis/accounts/{account_id}`

#### 10.7 创建频道信息
- **POST** `/api/target-account-analysis/channels`

**请求体:**
```json
{
  "platform": "youtube",
  "channel_id": "UCxxxxxxxxxxxxxx",
  "channel_name": "科技频道",
  "channel_url": "https://www.youtube.com/channel/UCxxxxxxxxxxxxxx",
  "is_verified": true,
  "subscriber_count": 150000
}
```

#### 10.8 获取频道列表
- **GET** `/api/target-account-analysis/channels?platform=youtube&skip=0&limit=50`

#### 10.9 更新频道订阅数
- **PATCH** `/api/target-account-analysis/channels/{channel_id}/subscriber-count`

**请求体:**
```json
{
  "subscriber_count": 155000
}
```

#### 10.10 记录账号统计数据
- **POST** `/api/target-account-analysis/accounts/{account_id}/statistics`

**请求体:**
```json
{
  "followers_count": 150000,
  "following_count": 500,
  "total_videos_count": 280,
  "total_views": 5000000,
  "total_likes": 120000,
  "collected_at": "2023-01-01T12:00:00"
}
```

**响应示例:**
```json
{
  "code": 0,
  "msg": "success", 
  "data": {
    "id": 1,
    "account_id": 1,
    "followers_count": 150000,
    "following_count": 500,
    "total_videos_count": 280,
    "total_views": 5000000,
    "total_likes": 120000,
    "followers_growth": 1000,
    "followers_growth_rate": 0.0067,
    "collected_at": "2023-01-01T12:00:00",
    "created_at": "2023-01-01T12:00:00"
  }
}
```

#### 10.11 获取账号统计历史
- **GET** `/api/target-account-analysis/accounts/{account_id}/statistics?days=30&limit=100`

**查询参数:**
- `days`: 获取最近天数的数据
- `limit`: 限制记录数

#### 10.12 获取增长趋势分析
- **GET** `/api/target-account-analysis/accounts/{account_id}/growth-trends?days=7`

**响应示例:**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "followers_trend": 5000,
    "videos_trend": 12,
    "avg_daily_growth": 714,
    "total_growth_rate": 3.44,
    "analysis_period_days": 7,
    "data_points": 7
  }
}
```

#### 10.13 创建视频记录
- **POST** `/api/target-account-analysis/videos`

**请求体:**
```json
{
  "account_id": 1,
  "channel_id": 1,
  "platform": "youtube",
  "platform_video_id": "dQw4w9WgXcQ",
  "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "title": "Amazing Tech Video",
  "description": "This video shows amazing technology",
  "thumbnail_url": "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
  "duration": 240,
  "video_type": "long",
  "published_at": "2023-01-01T10:00:00",
  "discovered_at": "2023-01-01T12:00:00"
}
```

#### 10.14 批量创建视频
- **POST** `/api/target-account-analysis/videos/batch`

**请求体:**
```json
{
  "videos": [
    {
      "account_id": 1,
      "platform_video_id": "video1",
      "title": "Video 1",
      "duration": 120
    },
    {
      "account_id": 1, 
      "platform_video_id": "video2",
      "title": "Video 2", 
      "duration": 180
    }
  ]
}
```

#### 10.15 获取视频列表
- **GET** `/api/target-account-analysis/videos?account_id=1&video_type=short&skip=0&limit=50`

**查询参数:**
- `account_id`: 账号ID过滤
- `channel_id`: 频道ID过滤  
- `video_type`: 视频类型过滤 (long, short, live)
- `is_downloaded`: 是否已下载过滤
- `published_after`: 发布时间起始过滤
- `published_before`: 发布时间结束过滤

#### 10.16 更新视频下载状态
- **PATCH** `/api/target-account-analysis/videos/{video_id}/download-status`

**请求体:**
```json
{
  "download_status": "completed",
  "local_file_path": "/storage/videos/amazing_tech_video.mp4",
  "local_file_size": 52428800,
  "is_downloaded": true
}
```

#### 10.17 记录视频互动数据
- **POST** `/api/target-account-analysis/videos/{video_id}/engagement-metrics`

**请求体:**
```json
{
  "views_count": 100000,
  "likes_count": 5000, 
  "comments_count": 300,
  "shares_count": 150,
  "collected_at": "2023-01-01T12:00:00"
}
```

**响应示例:**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "id": 1,
    "video_id": 1,
    "views_count": 100000,
    "likes_count": 5000,
    "comments_count": 300, 
    "shares_count": 150,
    "engagement_rate": 0.0545,
    "views_growth": 2000,
    "likes_growth": 100,
    "collected_at": "2023-01-01T12:00:00",
    "created_at": "2023-01-01T12:00:00"
  }
}
```

#### 10.18 获取视频互动历史
- **GET** `/api/target-account-analysis/videos/{video_id}/engagement-metrics?days=30&limit=100`

#### 10.19 批量获取最新互动数据
- **POST** `/api/target-account-analysis/videos/latest-metrics`

**请求体:**
```json
{
  "video_ids": [1, 2, 3, 4, 5]
}
```

#### 10.20 获取热门视频排行
- **GET** `/api/target-account-analysis/videos/trending?account_id=1&metric=views_count&days=7&limit=10`

**查询参数:**
- `account_id`: 账号ID过滤
- `metric`: 排序指标 (views_count, likes_count, engagement_rate)
- `days`: 时间范围
- `limit`: 限制数量

#### 10.21 获取账号分析摘要
- **GET** `/api/target-account-analysis/accounts/{account_id}/analytics-summary`

**响应示例:**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "account": {
      "id": 1,
      "username": "tech_channel",
      "platform": "youtube"
    },
    "latest_stats": {
      "followers_count": 150000,
      "total_videos_count": 280,
      "followers_growth": 1000
    },
    "recent_videos": [
      {
        "id": 1,
        "title": "Amazing Tech Video",
        "views_count": 100000,
        "published_at": "2023-01-01T10:00:00"
      }
    ],
    "growth_trends": {
      "followers_trend": 5000,
      "avg_daily_growth": 714
    },
    "engagement_analysis": {
      "avg_engagement_rate": 0.045,
      "top_performing_video_type": "short"
    }
  }
}
```

### Worker专用接口说明

以上目标账号分析接口专为yt-dlp爬虫Worker设计，具有以下特点：

1. **幂等性支持**: 账号、频道、视频创建接口支持重复调用，自动去重
2. **批量操作**: 支持批量创建视频、批量更新互动数据等高效操作
3. **增长计算**: 自动计算粉丝增长、互动增长等趋势数据
4. **时间序列**: 统计和互动数据保留完整历史记录用于趋势分析
5. **状态管理**: 支持下载状态跟踪、爬取状态管理
6. **性能优化**: 使用索引优化查询，支持分页和过滤

### 工作流管理示例用法

1. **注册新工作流**
```bash
curl -X POST "http://localhost:8000/api/workflow-registry" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "runway_video_gen_v1",
    "name": "Runway视频生成工作流",
    "description": "使用Runway平台生成视频",
    "workflow_type": "execution",
    "version": "1.0.0",
    "config": {
      "platform": "runway",
      "model": "gen3_alpha",
      "parameters": {
        "duration": 10,
        "quality": "1080p"
      }
    }
  }'
```

2. **查询执行类型的工作流**
```bash
curl "http://localhost:8000/api/workflow-registry?workflow_type=execution&is_active=true"
```

3. **激活工作流**
```bash
curl -X POST "http://localhost:8000/api/workflow-registry/runway_video_gen_v1/activate"
```

4. **更新工作流配置**
```bash
curl -X PUT "http://localhost:8000/api/workflow-registry/runway_video_gen_v1" \
  -H "Content-Type: application/json" \
  -d '{
    "version": "1.1.0",
    "config": {
      "platform": "runway",
      "model": "gen3_alpha_turbo",
      "parameters": {
        "duration": 10,
        "quality": "4K"
      }
    }
  }'
```