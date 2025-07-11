# ShortsGen API 详细文档

## 基础信息
- **API 标题**: Short Video Automation Platform API
- **版本**: 1.0.0
- **描述**: 用于管理视频生成项目、资源和任务的API
- **基础URL**: http://localhost:8000

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

### 1. 项目管理 (/projects)

#### 1.1 创建项目
- **POST** `/projects`
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
- **GET** `/projects?skip=0&limit=100`

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
- **GET** `/projects/{project_id}`

**路径参数:**
- `project_id`: 项目ID (整数)

**响应**: 同创建项目响应格式

#### 1.4 更新项目
- **PUT** `/projects/{project_id}`

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
- **DELETE** `/projects/{project_id}`

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
- **POST** `/projects/{project_id}/recalculate-tasks`

#### 1.7 重新生成项目
- **POST** `/projects/{project_id}/regenerate`

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