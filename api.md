# Short Video Automation Platform API Documentation

This document provides a detailed overview of all available API endpoints for the Short Video Automation Platform.

## Table of Contents

- [Assets](#assets)
- [Inspirations](#inspirations)
- [Platform Accounts](#platform-accounts)
- [Project Types](#project-types)
- [Projects](#projects)
- [Analysis](#analysis)
- [Tasks](#tasks)
- [Webhooks](#webhooks)
- [Worker Configs](#worker-configs)
- [Workflow Registry](#workflow-registry)

---

## Assets

**Prefix**: `/api/assets`

### GET `/api/assets/by-hash/{file_hash}`
- **Description**: 根据文件hash查询asset信息，用于去重检查 (Query asset information by file hash for deduplication).
- **Path Parameters**:
  - `file_hash` (string): The hash of the file.
- **Response**:
  ```json
  {
    "id": "string",
    "name": "string",
    "description": "string (optional)",
    "asset_type": "string",
    "storage_path": "string (optional)",
    "asset_metadata": {
      "additionalProp1": {}
    },
    "duration_seconds": "number (optional)",
    "source": "string (optional)",
    "visibility": "string (optional)",
    "file_hash": "string",
    "original_filename": "string (optional)",
    "status": "string",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
  ```

### POST `/api/assets`
- **Description**: 创建新的资源，支持基于hash的去重检查 (Create a new asset, with support for deduplication based on hash).
- **Request Body**: `schemas.AssetCreate`
- **Response**:
  ```json
  {
    "id": "string",
    "name": "string",
    "description": "string (optional)",
    "asset_type": "string",
    "storage_path": "string (optional)",
    "asset_metadata": {
      "additionalProp1": {}
    },
    "duration_seconds": "number (optional)",
    "source": "string (optional)",
    "visibility": "string (optional)",
    "file_hash": "string",
    "original_filename": "string (optional)",
    "status": "string",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
  ```

### GET `/api/assets`
- **Description**: 获取资源列表，支持类型和状态筛选 (List assets with optional filtering by type and status).
- **Query Parameters**:
  - `skip` (int, optional, default: 0): Number of records to skip.
  - `limit` (int, optional, default: 100): Maximum number of records to return.
  - `asset_type` (string, optional): Filter by asset type.
  - `status` (string, optional): Filter by asset status.
- **Response**:
  ```json
  [
    {
      "id": "string",
      "name": "string",
      "description": "string (optional)",
      "asset_type": "string",
      "storage_path": "string (optional)",
      "asset_metadata": {
        "additionalProp1": {}
      },
      "duration_seconds": "number (optional)",
      "source": "string (optional)",
      "visibility": "string (optional)",
      "file_hash": "string",
      "original_filename": "string (optional)",
      "status": "string",
      "created_at": "datetime",
      "updated_at": "datetime"
    }
  ]
  ```

### GET `/api/assets/{asset_id}`
- **Description**: 获取指定资源详情 (Get details of a specific asset).
- **Path Parameters**:
  - `asset_id` (int): The ID of the asset.
- **Response**:
  ```json
  {
    "id": "string",
    "name": "string",
    "description": "string (optional)",
    "asset_type": "string",
    "storage_path": "string (optional)",
    "asset_metadata": {
      "additionalProp1": {}
    },
    "duration_seconds": "number (optional)",
    "source": "string (optional)",
    "visibility": "string (optional)",
    "file_hash": "string",
    "original_filename": "string (optional)",
    "status": "string",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
  ```

### PUT `/api/assets/{asset_id}`
- **Description**: 更新资源信息 (Update asset information).
- **Path Parameters**:
  - `asset_id` (int): The ID of the asset.
- **Request Body**: `schemas.AssetUpdate`
- **Response**:
  ```json
  {
    "id": "string",
    "name": "string",
    "description": "string (optional)",
    "asset_type": "string",
    "storage_path": "string (optional)",
    "asset_metadata": {
      "additionalProp1": {}
    },
    "duration_seconds": "number (optional)",
    "source": "string (optional)",
    "visibility": "string (optional)",
    "file_hash": "string",
    "original_filename": "string (optional)",
    "status": "string",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
  ```

### DELETE `/api/assets/{asset_id}`
- **Description**: 删除资源 (Delete an asset).
- **Path Parameters**:
  - `asset_id` (int): The ID of the asset.
- **Response**: A confirmation message.

### GET `/api/assets/by-type/{asset_type}`
- **Description**: 根据资源类型获取资源列表 (Get a list of assets by asset type).
- **Path Parameters**:
  - `asset_type` (string): The type of the asset.
- **Query Parameters**:
  - `skip` (int, optional, default: 0): Number of records to skip.
  - `limit` (int, optional, default: 100): Maximum number of records to return.
- **Response**:
  ```json
  [
    {
      "id": "string",
      "name": "string",
      "description": "string (optional)",
      "asset_type": "string",
      "storage_path": "string (optional)",
      "asset_metadata": {
        "additionalProp1": {}
      },
      "duration_seconds": "number (optional)",
      "source": "string (optional)",
      "visibility": "string (optional)",
      "file_hash": "string",
      "original_filename": "string (optional)",
      "status": "string",
      "created_at": "datetime",
      "updated_at": "datetime"
    }
  ]
  ```

---

## Inspirations

**Prefix**: `/api/inspirations`

### POST `/api/inspirations`
- **Description**: 创建新的创意灵感并触发n8n工作流 (Create a new inspiration and trigger an n8n workflow).
- **Request Body**: `schemas.InspirationCreate`
- **Response**:
  ```json
  {
    "id": "string",
    "title": "string",
    "description": "string (optional)",
    "project_type_code": "string (optional)",
    "source": "string (optional)",
    "parameters": {
      "additionalProp1": {}
    },
    "status": "string",
    "score": "number (optional)",
    "score_details": {
      "additionalProp1": {}
    },
    "review_notes": "string (optional)",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
  ```

### GET `/api/inspirations`
- **Description**: 获取创意列表，支持状态筛选 (List inspirations with optional filtering by status).
- **Query Parameters**:
  - `skip` (int, optional, default: 0): Number of records to skip.
  - `limit` (int, optional, default: 100): Maximum number of records to return.
  - `status` (string, optional): Filter by inspiration status.
- **Response**:
  ```json
  [
    {
      "id": "string",
      "title": "string",
      "description": "string (optional)",
      "project_type_code": "string (optional)",
      "source": "string (optional)",
      "parameters": {
        "additionalProp1": {}
      },
      "status": "string",
      "score": "number (optional)",
      "score_details": {
        "additionalProp1": {}
      },
      "review_notes": "string (optional)",
      "created_at": "datetime",
      "updated_at": "datetime"
    }
  ]
  ```

### GET `/api/inspirations/{inspiration_id}`
- **Description**: 获取指定创意详情 (Get details of a specific inspiration).
- **Path Parameters**:
  - `inspiration_id` (int): The ID of the inspiration.
- **Response**:
  ```json
  {
    "id": "string",
    "title": "string",
    "description": "string (optional)",
    "project_type_code": "string (optional)",
    "source": "string (optional)",
    "parameters": {
      "additionalProp1": {}
    },
    "status": "string",
    "score": "number (optional)",
    "score_details": {
      "additionalProp1": {}
    },
    "review_notes": "string (optional)",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
  ```

### PUT `/api/inspirations/{inspiration_id}`
- **Description**: 更新创意信息 (Update inspiration information).
- **Path Parameters**:
  - `inspiration_id` (int): The ID of the inspiration.
- **Request Body**: `schemas.InspirationUpdate`
- **Response**:
  ```json
  {
    "id": "string",
    "title": "string",
    "description": "string (optional)",
    "project_type_code": "string (optional)",
    "source": "string (optional)",
    "parameters": {
      "additionalProp1": {}
    },
    "status": "string",
    "score": "number (optional)",
    "score_details": {
      "additionalProp1": {}
    },
    "review_notes": "string (optional)",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
  ```

### DELETE `/api/inspirations/{inspiration_id}`
- **Description**: 删除创意 (Delete an inspiration).
- **Path Parameters**:
  - `inspiration_id` (int): The ID of the inspiration.
- **Response**: A confirmation message.

### POST `/api/inspirations/{inspiration_id}/approve`
- **Description**: 审核通过创意并触发项目创建工作流 (Approve an inspiration and trigger the project creation workflow).
- **Path Parameters**:
  - `inspiration_id` (int): The ID of the inspiration.
- **Request Body** (optional): `approval_data` (dict) - e.g., `{"review_notes": "Looks good", "score": 95}`
- **Response**:
  ```json
  {
    "id": "string",
    "title": "string",
    "description": "string (optional)",
    "project_type_code": "string (optional)",
    "source": "string (optional)",
    "parameters": {
      "additionalProp1": {}
    },
    "status": "string",
    "score": "number (optional)",
    "score_details": {
      "additionalProp1": {}
    },
    "review_notes": "string (optional)",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
  ```

### POST `/api/inspirations/{inspiration_id}/reject`
- **Description**: 拒绝创意 (Reject an inspiration).
- **Path Parameters**:
  - `inspiration_id` (int): The ID of the inspiration.
- **Request Body** (optional): `rejection_data` (dict) - e.g., `{"review_notes": "Not a good fit"}`
- **Response**:
  ```json
  {
    "id": "string",
    "title": "string",
    "description": "string (optional)",
    "project_type_code": "string (optional)",
    "source": "string (optional)",
    "parameters": {
      "additionalProp1": {}
    },
    "status": "string",
    "score": "number (optional)",
    "score_details": {
      "additionalProp1": {}
    },
    "review_notes": "string (optional)",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
  ```

### POST `/api/inspirations/{inspiration_id}/regenerate`
- **Description**: 重新生成创意 (Regenerate an inspiration).
- **Path Parameters**:
  - `inspiration_id` (int): The ID of the inspiration.
- **Request Body** (optional): `regeneration_params` (dict) - Parameters for regeneration.
- **Response**: A confirmation message with `inspiration_id` and `execution_id`.

---

## Platform Accounts

**Prefix**: `/api/platform-accounts`

### POST `/api/platform-accounts`
- **Description**: Create a new platform account.
- **Request Body**: `schemas.platform_account.PlatformAccountCreate`
- **Response**:
  ```json
  {
    "id": "string",
    "platform": "string",
    "name": "string",
    "credentials": {
      "additionalProp1": {}
    },
    "status": "string",
    "daily_limit": "integer (optional)",
    "used_today": "integer",
    "last_used_at": "datetime (optional)",
    "created_at": "datetime",
    "updated_at": "datetime",
    "is_available": "boolean",
    "remaining_quota": "integer (optional)"
  }
  ```

### GET `/api/platform-accounts`
- **Description**: List platform accounts with optional filtering.
- **Query Parameters**:
  - `skip` (int, optional, default: 0): Number of records to skip.
  - `limit` (int, optional, default: 100): Maximum number of records to return.
  - `platform` (string, optional): Filter by platform name (e.g., "youtube").
  - `status` (string, optional): Filter by account status (e.g., "active").
- **Response**:
  ```json
  [
    {
      "platform": "string",
      "name": "string",
      "status": "string",
      "daily_limit": "integer (optional)",
      "used_today": "integer",
      "is_available": "boolean",
      "remaining_quota": "integer (optional)",
      "id": "string",
      "created_at": "datetime",
      "credentials": {
        "additionalProp1": {},
        "additionalProp2": {},
        "additionalProp3": {}
      }
    }
  ]
  ```

### GET `/api/platform-accounts/{account_id}`
- **Description**: Get a specific platform account by ID.
- **Path Parameters**:
  - `account_id` (int): The ID of the platform account.
- **Response**:
  ```json
  {
    "id": "string",
    "platform": "string",
    "name": "string",
    "credentials": {
      "additionalProp1": {}
    },
    "status": "string",
    "daily_limit": "integer (optional)",
    "used_today": "integer",
    "last_used_at": "datetime (optional)",
    "created_at": "datetime",
    "updated_at": "datetime",
    "is_available": "boolean",
    "remaining_quota": "integer (optional)"
  }
  ```

### PUT `/api/platform-accounts/{account_id}`
- **Description**: Update a platform account.
- **Path Parameters**:
  - `account_id` (int): The ID of the platform account.
- **Request Body**: `schemas.platform_account.PlatformAccountUpdate`
- **Response**:
  ```json
  {
    "id": "string",
    "platform": "string",
    "name": "string",
    "credentials": {
      "additionalProp1": {}
    },
    "status": "string",
    "daily_limit": "integer (optional)",
    "used_today": "integer",
    "last_used_at": "datetime (optional)",
    "created_at": "datetime",
    "updated_at": "datetime",
    "is_available": "boolean",
    "remaining_quota": "integer (optional)"
  }
  ```

### DELETE `/api/platform-accounts/{account_id}`
- **Description**: Logically delete a platform account.
- **Path Parameters**:
  - `account_id` (int): The ID of the platform account.
- **Response**: A confirmation message.

### GET `/api/platform-accounts/available/{platform}`
- **Description**: Get available accounts for a specific platform.
- **Path Parameters**:
  - `platform` (string): The platform name.
- **Response**:
  ```json
  [
    {
      "platform": "string",
      "name": "string",
      "status": "string",
      "daily_limit": "integer (optional)",
      "used_today": "integer",
      "is_available": "boolean",
      "remaining_quota": "integer (optional)",
      "id": "string",
      "created_at": "datetime",
      "credentials": {
        "additionalProp1": {},
        "additionalProp2": {},
        "additionalProp3": {}
      }
    }
  ]
  ```

### POST `/api/platform-accounts/{account_id}/reset-usage`
- **Description**: Reset the daily usage count for a platform account.
- **Path Parameters**:
  - `account_id` (int): The ID of the platform account.
- **Request Body**: `schemas.platform_account.PlatformAccountUsageReset`
- **Response**:
  ```json
  {
    "id": "string",
    "platform": "string",
    "name": "string",
    "credentials": {
      "additionalProp1": {}
    },
    "status": "string",
    "daily_limit": "integer (optional)",
    "used_today": "integer",
    "last_used_at": "datetime (optional)",
    "created_at": "datetime",
    "updated_at": "datetime",
    "is_available": "boolean",
    "remaining_quota": "integer (optional)"
  }
  ```

### GET `/api/platform-accounts/platforms/list`
- **Description**: Get a list of all unique platforms.
- **Response**: `List[string]`

---

## Project Types

**Prefix**: `/api/project-types`

### POST `/api/project-types`
- **Description**: Create a new project type.
- **Request Body**: `schemas.project_type.ProjectTypeCreate`
- **Response**:
  ```json
  {
    "code": "string",
    "name": "string",
    "description": "string (optional)",
    "inspiration_workflow_id": "string (optional)",
    "transform_workflow_id": "string (optional)",
    "execution_workflow_id": "string (optional)",
    "default_parameters": {
      "additionalProp1": {}
    },
    "parameter_schema": {
      "additionalProp1": {}
    },
    "category": "string (optional)",
    "sort_order": "integer",
    "is_active": "boolean",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
  ```

### GET `/api/project-types`
- **Description**: List project types with optional filtering.
- **Query Parameters**:
  - `skip` (int, optional, default: 0): Number of records to skip.
  - `limit` (int, optional, default: 100): Maximum number of records to return.
  - `category` (string, optional): Filter by category.
  - `is_active` (bool, optional): Filter by active status.
- **Response**:
  ```json
  [
    {
      "code": "string",
      "name": "string",
      "description": "string (optional)",
      "category": "string (optional)",
      "sort_order": "integer",
      "is_active": "boolean",
      "created_at": "datetime"
    }
  ]
  ```

### GET `/api/project-types/{project_type_code}`
- **Description**: Get project type by code with workflow details.
- **Path Parameters**:
  - `project_type_code` (string): The unique code for the project type.
- **Response**:
  ```json
  {
    "code": "string",
    "name": "string",
    "description": "string (optional)",
    "inspiration_workflow_id": "string (optional)",
    "transform_workflow_id": "string (optional)",
    "execution_workflow_id": "string (optional)",
    "default_parameters": {
      "additionalProp1": {}
    },
    "parameter_schema": {
      "additionalProp1": {}
    },
    "category": "string (optional)",
    "sort_order": "integer",
    "is_active": "boolean",
    "created_at": "datetime",
    "updated_at": "datetime",
    "inspiration_workflow": {
      "additionalProp1": {}
    },
    "transform_workflow": {
      "additionalProp1": {}
    },
    "execution_workflow": {
      "additionalProp1": {}
    }
  }
  ```

### PUT `/api/project-types/{project_type_code}`
- **Description**: Update project type.
- **Path Parameters**:
  - `project_type_code` (string): The unique code for the project type.
- **Request Body**: `schemas.project_type.ProjectTypeUpdate`
- **Response**:
  ```json
  {
    "code": "string",
    "name": "string",
    "description": "string (optional)",
    "inspiration_workflow_id": "string (optional)",
    "transform_workflow_id": "string (optional)",
    "execution_workflow_id": "string (optional)",
    "default_parameters": {
      "additionalProp1": {}
    },
    "parameter_schema": {
      "additionalProp1": {}
    },
    "category": "string (optional)",
    "sort_order": "integer",
    "is_active": "boolean",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
  ```

### DELETE `/api/project-types/{project_type_code}`
- **Description**: Soft delete project type.
- **Path Parameters**:
  - `project_type_code` (string): The unique code for the project type.
- **Response**: A confirmation message.

### POST `/api/project-types/{project_type_code}/activate`
- **Description**: Activate a project type.
- **Path Parameters**:
  - `project_type_code` (string): The unique code for the project type.
- **Response**:
  ```json
  {
    "code": "string",
    "name": "string",
    "description": "string (optional)",
    "inspiration_workflow_id": "string (optional)",
    "transform_workflow_id": "string (optional)",
    "execution_workflow_id": "string (optional)",
    "default_parameters": {
      "additionalProp1": {}
    },
    "parameter_schema": {
      "additionalProp1": {}
    },
    "category": "string (optional)",
    "sort_order": "integer",
    "is_active": "boolean",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
  ```

### POST `/api/project-types/{project_type_code}/deactivate`
- **Description**: Deactivate a project type.
- **Path Parameters**:
  - `project_type_code` (string): The unique code for the project type.
- **Response**:
  ```json
  {
    "code": "string",
    "name": "string",
    "description": "string (optional)",
    "inspiration_workflow_id": "string (optional)",
    "transform_workflow_id": "string (optional)",
    "execution_workflow_id": "string (optional)",
    "default_parameters": {
      "additionalProp1": {}
    },
    "parameter_schema": {
      "additionalProp1": {}
    },
    "category": "string (optional)",
    "sort_order": "integer",
    "is_active": "boolean",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
  ```

### GET `/api/project-types/categories/list`
- **Description**: Get list of all unique project type categories.
- **Response**: `List[string]`

### PUT `/api/project-types/{project_type_code}/sort-order`
- **Description**: Update project type sort order.
- **Path Parameters**:
  - `project_type_code` (string): The unique code for the project type.
- **Query Parameters**:
  - `sort_order` (int): The new sort order.
- **Response**:
  ```json
  {
    "code": "string",
    "name": "string",
    "description": "string (optional)",
    "inspiration_workflow_id": "string (optional)",
    "transform_workflow_id": "string (optional)",
    "execution_workflow_id": "string (optional)",
    "default_parameters": {
      "additionalProp1": {}
    },
    "parameter_schema": {
      "additionalProp1": {}
    },
    "category": "string (optional)",
    "sort_order": "integer",
    "is_active": "boolean",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
  ```

---

## Projects

**Prefix**: `/api/projects`

### POST `/api/projects`
- **Description**: Create a new project.
- **Request Body**: `schemas.ProjectCreate`
- **Response**:
  ```json
  {
    "id": "string",
    "name": "string",
    "project_type_code": "string",
    "initial_parameters": {
      "additionalProp1": {}
    },
    "status": "string",
    "inspiration_id": "string (optional)",
    "score": "number (optional)",
    "score_details": {
      "additionalProp1": {}
    },
    "review_notes": "string (optional)",
    "used_transform_workflow_id": "string (optional)",
    "used_execution_workflow_id": "string (optional)",
    "total_tasks": "integer",
    "completed_tasks": "integer",
    "failed_tasks": "integer",
    "output_asset_id": "string (optional)",
    "created_at": "datetime",
    "updated_at": "datetime",
    "tasks": []
  }
  ```

### PUT `/api/projects/{project_id}`
- **Description**: Update a project with comprehensive validation and business logic.
- **Path Parameters**:
  - `project_id` (int): The ID of the project.
- **Request Body**: `schemas.ProjectUpdate`
- **Response**:
  ```json
  {
    "id": "string",
    "name": "string",
    "project_type_code": "string",
    "initial_parameters": {
      "additionalProp1": {}
    },
    "status": "string",
    "inspiration_id": "string (optional)",
    "score": "number (optional)",
    "score_details": {
      "additionalProp1": {}
    },
    "review_notes": "string (optional)",
    "used_transform_workflow_id": "string (optional)",
    "used_execution_workflow_id": "string (optional)",
    "total_tasks": "integer",
    "completed_tasks": "integer",
    "failed_tasks": "integer",
    "output_asset_id": "string (optional)",
    "created_at": "datetime",
    "updated_at": "datetime",
    "tasks": []
  }
  ```

### GET `/api/projects`
- **Description**: Read a list of projects.
- **Query Parameters**:
  - `skip` (int, optional, default: 0): Number of records to skip.
  - `limit` (int, optional, default: 100): Maximum number of records to return.
- **Response**:
  ```json
  [
    {
      "id": "string",
      "name": "string",
      "project_type_code": "string",
      "initial_parameters": {
        "additionalProp1": {}
      },
      "status": "string",
      "inspiration_id": "string (optional)",
      "score": "number (optional)",
      "score_details": {
        "additionalProp1": {}
      },
      "review_notes": "string (optional)",
      "used_transform_workflow_id": "string (optional)",
      "used_execution_workflow_id": "string (optional)",
      "total_tasks": "integer",
      "completed_tasks": "integer",
      "failed_tasks": "integer",
      "output_asset_id": "string (optional)",
      "created_at": "datetime",
      "updated_at": "datetime",
      "tasks": []
    }
  ]
  ```

### GET `/api/projects/{project_id}`
- **Description**: Read a single project.
- **Path Parameters**:
  - `project_id` (int): The ID of the project.
- **Response**:
  ```json
  {
    "id": "string",
    "name": "string",
    "project_type_code": "string",
    "initial_parameters": {
      "additionalProp1": {}
    },
    "status": "string",
    "inspiration_id": "string (optional)",
    "score": "number (optional)",
    "score_details": {
      "additionalProp1": {}
    },
    "review_notes": "string (optional)",
    "used_transform_workflow_id": "string (optional)",
    "used_execution_workflow_id": "string (optional)",
    "total_tasks": "integer",
    "completed_tasks": "integer",
    "failed_tasks": "integer",
    "output_asset_id": "string (optional)",
    "created_at": "datetime",
    "updated_at": "datetime",
    "tasks": []
  }
  ```

### DELETE `/api/projects/{project_id}`
- **Description**: 逻辑删除项目 (Logically delete a project).
- **Path Parameters**:
  - `project_id` (int): The ID of the project.
- **Response**: A confirmation message.

### POST `/api/projects/{project_id}/recalculate-tasks`
- **Description**: Manually recalculate project task counts. Useful for fixing data inconsistencies.
- **Path Parameters**:
  - `project_id` (int): The ID of the project.
- **Response**:
  ```json
  {
    "id": "string",
    "name": "string",
    "project_type_code": "string",
    "initial_parameters": {
      "additionalProp1": {}
    },
    "status": "string",
    "inspiration_id": "string (optional)",
    "score": "number (optional)",
    "score_details": {
      "additionalProp1": {}
    },
    "review_notes": "string (optional)",
    "used_transform_workflow_id": "string (optional)",
    "used_execution_workflow_id": "string (optional)",
    "total_tasks": "integer",
    "completed_tasks": "integer",
    "failed_tasks": "integer",
    "output_asset_id": "string (optional)",
    "created_at": "datetime",
    "updated_at": "datetime",
    "tasks": []
  }
  ```

### POST `/api/projects/{project_id}/regenerate`
- **Description**: 重新生成项目，触发n8n执行工作流 (Regenerate a project, triggering an n8n execution workflow).
- **Path Parameters**:
  - `project_id` (int): The ID of the project.
- **Request Body** (optional): `regeneration_params` (dict) - Parameters for regeneration.
- **Response**: A confirmation message with `project_id` and `execution_id`.

---

## Analysis

**Prefix**: `/api/analysis`

### POST `/api/analysis/accounts/quick-add`
- **Description**: 快速添加目标账号并立即触发一次后台数据同步任务 (Quickly add a target account and immediately trigger a background data sync task).
- **Request Body**: `QuickAddAccountRequest`
  - `channel_url` (string): URL of the channel.
  - `category` (string, optional): Category for the account.
  - `video_limit` (int, optional, default: 50): Number of videos to crawl.
  - `crawl_videos` (bool, optional, default: True): Whether to crawl videos.
  - `is_scheduled` (bool, optional, default: True): Whether to schedule regular crawls.
  - `schedule_interval` (int, optional): Interval in seconds for scheduled crawls.
  - `cron_string` (string, optional): Cron string for scheduled crawls.
- **Response**:
  ```json
  {
    "id": "string",
    "account_id": "string (optional)",
    "display_name": "string (optional)",
    "username": "string (optional)",
    "profile_url": "string (optional)",
    "channel_url": "string (optional)",
    "description": "string (optional)",
    "avatar_url": "string (optional)",
    "is_verified": "boolean (optional)",
    "category": "string (optional)",
    "subscriber_count": "integer (optional)",
    "is_active": "boolean",
    "last_crawled_at": "datetime (optional)",
    "video_crawl_limit": "integer",
    "created_at": "datetime",
    "updated_at": "datetime",
    "deleted_at": "datetime (optional)",
    "uploads_playlist_id": "string (optional)",
    "country": "string (optional)",
    "published_at": "datetime (optional)",
    "is_scheduled": "boolean (optional)",
    "schedule_interval": "integer (optional)",
    "cron_string": "string (optional)",
    "latest_snapshot": {
      "id": "string",
      "target_account_id": "string",
      "subscriber_count": "integer (optional)",
      "total_videos_count": "integer (optional)",
      "hidden_subscriber_count": "boolean (optional)",
      "total_views": "integer (optional)",
      "collected_at": "datetime",
      "created_at": "datetime"
    }
  }
  ```

### POST `/api/analysis/videos/trigger-download`
- **Description**: 手动创建并入队视频下载任务 (Manually create and enqueue video download tasks).
- **Request Body**: `TriggerDownloadRequest`
  - `video_ids` (List[string]): List of video IDs to download.
  - `priority` (int, optional, default: 10): Task priority.
- **Response**: A summary of processed requests.

### POST `/api/analysis/accounts/{account_id}/trigger-crawl`
- **Description**: 手动触发对指定账号的后台数据同步任务 (Manually trigger a background data sync task for a specific account).
- **Path Parameters**:
  - `account_id` (string): The ID of the target account.
- **Request Body**: `AccountCrawlRequest`
  - `crawl_videos` (bool, optional, default: True): Whether to crawl videos.
  - `video_limit` (int, optional, default: 50): Number of videos to crawl.
- **Response**:
  ```json
  {
    "id": "string",
    "task_type": "string",
    "status": "string",
    "priority": "integer",
    "dependencies": [
      "string"
    ],
    "target_account_id": "string",
    "video_id": "string (optional)",
    "error_message": "string (optional)",
    "started_at": "datetime (optional)",
    "completed_at": "datetime (optional)",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
  ```

### POST `/api/analysis/accounts/batch-trigger-crawl`
- **Description**: 批量触发多个账号的后台数据同步任务 (Batch trigger background data sync tasks for multiple accounts).
- **Request Body**: `BatchAccountCrawlRequest`
  - `account_ids` (List[string]): List of account IDs.
  - `crawl_videos` (bool, optional, default: True): Whether to crawl videos.
  - `video_limit` (int, optional, default: 50): Number of videos to crawl.
- **Response**: A summary of batch results.

### GET `/api/analysis/accounts`
- **Description**: 获取目标账号列表, 并附带最新的快照数据 (Get a list of target accounts with their latest snapshot data).
- **Query Parameters**:
  - `skip` (int, optional, default: 0): Number of records to skip.
  - `limit` (int, optional, default: 100): Maximum number of records to return.
  - `is_active` (bool, optional): Filter by active status.
  - `category` (string, optional): Filter by category.
- **Response**:
  ```json
  [
    {
      "id": "string",
      "account_id": "string (optional)",
      "display_name": "string (optional)",
      "username": "string (optional)",
      "profile_url": "string (optional)",
      "channel_url": "string (optional)",
      "description": "string (optional)",
      "avatar_url": "string (optional)",
      "is_verified": "boolean (optional)",
      "category": "string (optional)",
      "subscriber_count": "integer (optional)",
      "is_active": "boolean",
      "last_crawled_at": "datetime (optional)",
      "video_crawl_limit": "integer",
      "created_at": "datetime",
      "updated_at": "datetime",
      "deleted_at": "datetime (optional)",
      "uploads_playlist_id": "string (optional)",
      "country": "string (optional)",
      "published_at": "datetime (optional)",
      "is_scheduled": "boolean (optional)",
      "schedule_interval": "integer (optional)",
      "cron_string": "string (optional)",
      "latest_snapshot": {
        "id": "string",
        "target_account_id": "string",
        "subscriber_count": "integer (optional)",
        "total_videos_count": "integer (optional)",
        "hidden_subscriber_count": "boolean (optional)",
        "total_views": "integer (optional)",
        "collected_at": "datetime",
        "created_at": "datetime"
      }
    }
  ]
  ```

### GET `/api/analysis/accounts/{account_id}`
- **Description**: 获取单个目标账号信息, 并附带最新的快照数据 (Get a single target account's info with its latest snapshot data).
- **Path Parameters**:
  - `account_id` (string): The ID of the target account.
- **Response**:
  ```json
  {
    "id": "string",
    "account_id": "string (optional)",
    "display_name": "string (optional)",
    "username": "string (optional)",
    "profile_url": "string (optional)",
    "channel_url": "string (optional)",
    "description": "string (optional)",
    "avatar_url": "string (optional)",
    "is_verified": "boolean (optional)",
    "category": "string (optional)",
    "subscriber_count": "integer (optional)",
    "is_active": "boolean",
    "last_crawled_at": "datetime (optional)",
    "video_crawl_limit": "integer",
    "created_at": "datetime",
    "updated_at": "datetime",
    "deleted_at": "datetime (optional)",
    "uploads_playlist_id": "string (optional)",
    "country": "string (optional)",
    "published_at": "datetime (optional)",
    "is_scheduled": "boolean (optional)",
    "schedule_interval": "integer (optional)",
    "cron_string": "string (optional)",
    "latest_snapshot": {
      "id": "string",
      "target_account_id": "string",
      "subscriber_count": "integer (optional)",
      "total_videos_count": "integer (optional)",
      "hidden_subscriber_count": "boolean (optional)",
      "total_views": "integer (optional)",
      "collected_at": "datetime",
      "created_at": "datetime"
    }
  }
  ```

### PUT `/api/analysis/accounts/{account_id}`
- **Description**: 更新目标账号信息 (Update target account information).
- **Path Parameters**:
  - `account_id` (string): The ID of the target account.
- **Request Body**: `schemas.target_account.TargetAccountUpdate`
- **Response**:
  ```json
  {
    "id": "string",
    "account_id": "string (optional)",
    "display_name": "string (optional)",
    "username": "string (optional)",
    "profile_url": "string (optional)",
    "channel_url": "string (optional)",
    "description": "string (optional)",
    "avatar_url": "string (optional)",
    "is_verified": "boolean (optional)",
    "category": "string (optional)",
    "subscriber_count": "integer (optional)",
    "is_active": "boolean",
    "last_crawled_at": "datetime (optional)",
    "video_crawl_limit": "integer",
    "created_at": "datetime",
    "updated_at": "datetime",
    "deleted_at": "datetime (optional)",
    "uploads_playlist_id": "string (optional)",
    "country": "string (optional)",
    "published_at": "datetime (optional)",
    "is_scheduled": "boolean (optional)",
    "schedule_interval": "integer (optional)",
    "cron_string": "string (optional)",
    "latest_snapshot": {
      "id": "string",
      "target_account_id": "string",
      "subscriber_count": "integer (optional)",
      "total_videos_count": "integer (optional)",
      "hidden_subscriber_count": "boolean (optional)",
      "total_views": "integer (optional)",
      "collected_at": "datetime",
      "created_at": "datetime"
    }
  }
  ```

### DELETE `/api/analysis/accounts/{account_id}`
- **Description**: 删除目标账号 (Delete a target account).
- **Path Parameters**:
  - `account_id` (string): The ID of the target account.
- **Request Body**: `DeleteAccountRequest`
  - `force` (bool, optional, default: False): Force deletion, ignoring dependencies.
- **Response**: A confirmation message.

### GET `/api/analysis/accounts/{account_id}/videos`
- **Description**: 获取指定账号下的视频列表 (Get the list of videos for a specific account).
- **Path Parameters**:
  - `account_id` (string): The ID of the target account.
- **Query Parameters**:
  - `skip` (int, optional, default: 0): Number of records to skip.
  - `limit` (int, optional, default: 100): Maximum number of records to return.
  - `sort_by` (enum, optional, default: "published_at"): Sort by `published_at` or `views_count`.
- **Response**:
  ```json
  [
    {
      "id": "string",
      "target_account_id": "string",
      "video_id": "string",
      "video_url": "string",
      "asset_id": "string (optional)",
      "title": "string (optional)",
      "description": "string (optional)",
      "thumbnail_url": "string (optional)",
      "duration": "integer (optional)",
      "published_at": "datetime (optional)",
      "category_id": "string (optional)",
      "default_audio_language": "string (optional)",
      "analysis_results": {},
      "analysis_status": "string (optional)",
      "analysis_error": "string (optional)",
      "is_downloaded": "boolean",
      "created_at": "datetime",
      "updated_at": "datetime",
      "deleted_at": "datetime (optional)",
      "latest_snapshot": {
        "id": "string",
        "video_id": "string",
        "views_count": "integer (optional)",
        "likes_count": "integer (optional)",
        "comments_count": "integer (optional)",
        "favorite_count": "integer (optional)",
        "collected_at": "datetime",
        "created_at": "datetime"
      },
      "asset": {
        "id": "string",
        "name": "string",
        "description": "string (optional)",
        "asset_type": "string",
        "storage_path": "string (optional)",
        "asset_metadata": {
          "additionalProp1": {}
        },
        "duration_seconds": "number (optional)",
        "source": "string (optional)",
        "visibility": "string (optional)",
        "file_hash": "string",
        "original_filename": "string (optional)",
        "status": "string",
        "created_at": "datetime",
        "updated_at": "datetime"
      }
    }
  ]
  ```

### GET `/api/analysis/videos`
- **Description**: 获取视频列表, 并附带最新的快照数据 (Get a list of videos with their latest snapshot data).
- **Query Parameters**:
  - `skip` (int, optional, default: 0): Number of records to skip.
  - `limit` (int, optional, default: 50): Maximum number of records to return.
  - `sort_by` (enum, optional, default: "published_at"): Sort by `published_at` or `views_count`.
- **Response**:
  ```json
  [
    {
      "id": "string",
      "target_account_id": "string",
      "video_id": "string",
      "video_url": "string",
      "asset_id": "string (optional)",
      "title": "string (optional)",
      "description": "string (optional)",
      "thumbnail_url": "string (optional)",
      "duration": "integer (optional)",
      "published_at": "datetime (optional)",
      "category_id": "string (optional)",
      "default_audio_language": "string (optional)",
      "analysis_results": {},
      "analysis_status": "string (optional)",
      "analysis_error": "string (optional)",
      "is_downloaded": "boolean",
      "created_at": "datetime",
      "updated_at": "datetime",
      "deleted_at": "datetime (optional)",
      "latest_snapshot": {
        "id": "string",
        "video_id": "string",
        "views_count": "integer (optional)",
        "likes_count": "integer (optional)",
        "comments_count": "integer (optional)",
        "favorite_count": "integer (optional)",
        "collected_at": "datetime",
        "created_at": "datetime"
      },
      "asset": {
        "id": "string",
        "name": "string",
        "description": "string (optional)",
        "asset_type": "string",
        "storage_path": "string (optional)",
        "asset_metadata": {
          "additionalProp1": {}
        },
        "duration_seconds": "number (optional)",
        "source": "string (optional)",
        "visibility": "string (optional)",
        "file_hash": "string",
        "original_filename": "string (optional)",
        "status": "string",
        "created_at": "datetime",
        "updated_at": "datetime"
      }
    }
  ]
  ```

### GET `/api/analysis/accounts/{account_id}/snapshots`
- **Description**: 获取账号的历史快照数据 (Get historical snapshot data for an account).
- **Path Parameters**:
  - `account_id` (string): The ID of the target account.
- **Query Parameters**:
  - `skip` (int, optional, default: 0): Number of records to skip.
  - `limit` (int, optional, default: 100): Maximum number of records to return.
- **Response**:
  ```json
  [
    {
      "id": "string",
      "target_account_id": "string",
      "subscriber_count": "integer (optional)",
      "total_videos_count": "integer (optional)",
      "hidden_subscriber_count": "boolean (optional)",
      "total_views": "integer (optional)",
      "collected_at": "datetime",
      "created_at": "datetime"
    }
  ]
  ```

### GET `/api/analysis/videos/{video_id}/snapshots`
- **Description**: 获取视频的历史快照数据 (Get historical snapshot data for a video).
- **Path Parameters**:
  - `video_id` (string): The ID of the video.
- **Query Parameters**:
  - `skip` (int, optional, default: 0): Number of records to skip.
  - `limit` (int, optional, default: 100): Maximum number of records to return.
- **Response**:
  ```json
  [
    {
      "id": "string",
      "video_id": "string",
      "views_count": "integer (optional)",
      "likes_count": "integer (optional)",
      "comments_count": "integer (optional)",
      "favorite_count": "integer (optional)",
      "collected_at": "datetime",
      "created_at": "datetime"
    }
  ]
  ```

### POST `/api/analysis/videos/{video_id}/analyze`
- **Description**: 触发对指定视频的后台镜头分析任务 (Trigger a background shot analysis task for a specific video).
- **Path Parameters**:
  - `video_id` (string): The ID of the video.
- **Response**: A confirmation message with `job_id`.

### GET `/api/analysis/tasks`
- **Description**: 获取监控任务列表 (Get a list of monitoring tasks).
- **Query Parameters**:
  - `skip` (int, optional, default: 0): Number of records to skip.
  - `limit` (int, optional, default: 100): Maximum number of records to return.
  - `account_id` (string, optional): Filter by account ID.
  - `video_id` (string, optional): Filter by video ID.
  - `task_type` (enum, optional): Filter by task type.
  - `status` (enum, optional): Filter by task status.
- **Response**:
  ```json
  [
    {
      "id": "string",
      "task_type": "string",
      "status": "string",
      "priority": "integer",
      "dependencies": [
        "string"
      ],
      "target_account_id": "string",
      "video_id": "string (optional)",
      "error_message": "string (optional)",
      "started_at": "datetime (optional)",
      "completed_at": "datetime (optional)",
      "created_at": "datetime",
      "updated_at": "datetime"
    }
  ]
  ```

### PUT `/api/analysis/tasks/{task_id}`
- **Description**: 更新监控任务状态 (例如，手动取消) (Update monitoring task status, e.g., manual cancellation).
- **Path Parameters**:
  - `task_id` (string): The ID of the task.
- **Request Body**: `schemas.monitoring_task.MonitoringTaskUpdate`
- **Response**:
  ```json
  {
    "id": "string",
    "task_type": "string",
    "status": "string",
    "priority": "integer",
    "dependencies": [
      "string"
    ],
    "target_account_id": "string",
    "video_id": "string (optional)",
    "error_message": "string (optional)",
    "started_at": "datetime (optional)",
    "completed_at": "datetime (optional)",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
  ```

---

## Tasks

**Prefix**: `/api/tasks`

### POST `/api/tasks`
- **Description**: Create a new task.
- **Request Body**: `schemas.TaskCreate`
- **Response**:
  ```json
  {
    "id": "string",
    "task_type": "string",
    "status": "string",
    "dependencies": [
      "string"
    ],
    "task_output": {
      "additionalProp1": {}
    },
    "task_input": {
      "additionalProp1": {}
    },
    "project_id": "string (optional)",
    "platform_account_id": "string (optional)",
    "platform_account": {
      "name": "string",
      "credentials": {
        "additionalProp1": {}
      },
      "proxy": "string (optional)"
    },
    "submit_id": "string (optional)",
    "error_message": "string (optional)",
    "started_at": "datetime (optional)",
    "completed_at": "datetime (optional)",
    "created_at": "datetime",
    "updated_at": "datetime",
    "deleted_at": "datetime (optional)",
    "forecast_generate_cost": "number (optional)",
    "forecast_queue_cost": "number (optional)"
  }
  ```

### POST `/api/tasks/batch`
- **Description**: Create multiple tasks in a batch.
- **Request Body**: `schemas.task.TaskBatchCreate`
- **Response**:
  ```json
  [
    {
      "id": "string",
      "task_type": "string",
      "status": "string",
      "dependencies": [
        "string"
      ],
      "task_output": {
        "additionalProp1": {}
      },
      "task_input": {
        "additionalProp1": {}
      },
      "project_id": "string (optional)",
      "platform_account_id": "string (optional)",
      "platform_account": {
        "name": "string",
        "credentials": {
          "additionalProp1": {}
        },
        "proxy": "string (optional)"
      },
      "submit_id": "string (optional)",
      "error_message": "string (optional)",
      "started_at": "datetime (optional)",
      "completed_at": "datetime (optional)",
      "created_at": "datetime",
      "updated_at": "datetime",
      "deleted_at": "datetime (optional)",
      "forecast_generate_cost": "number (optional)",
      "forecast_queue_cost": "number (optional)"
    }
  ]
  ```

### PATCH `/api/tasks/{task_id}`
- **Description**: Allows a worker to update the status of a task (e.g., to 'completed' or 'failed').
- **Path Parameters**:
  - `task_id` (string): The ID of the task.
- **Request Body**: `schemas.task.TaskStatusUpdate`
- **Response**:
  ```json
  {
    "id": "string",
    "task_type": "string",
    "status": "string",
    "dependencies": [
      "string"
    ],
    "task_output": {
      "additionalProp1": {}
    },
    "task_input": {
      "additionalProp1": {}
    },
    "project_id": "string (optional)",
    "platform_account_id": "string (optional)",
    "platform_account": {
      "name": "string",
      "credentials": {
        "additionalProp1": {}
      },
      "proxy": "string (optional)"
    },
    "submit_id": "string (optional)",
    "error_message": "string (optional)",
    "started_at": "datetime (optional)",
    "completed_at": "datetime (optional)",
    "created_at": "datetime",
    "updated_at": "datetime",
    "deleted_at": "datetime (optional)",
    "forecast_generate_cost": "number (optional)",
    "forecast_queue_cost": "number (optional)"
  }
  ```

### GET `/api/tasks/types`
- **Description**: Get a list of all available task types.
- **Response**: `List[string]`

### GET `/api/tasks`
- **Description**: List tasks.
- **Query Parameters**:
  - `project_id` (string, optional): Filter tasks by project ID.
  - `task_type` (string, optional): Filter tasks by task type.
  - `skip` (int, optional, default: 0): Number of records to skip.
  - `limit` (int, optional, default: 100): Maximum number of records to return.
- **Response**:
  ```json
  [
    {
      "id": "string",
      "task_type": "string",
      "status": "string",
      "dependencies": [
        "string"
      ],
      "task_output": {
        "additionalProp1": {}
      },
      "task_input": {
        "additionalProp1": {}
      },
      "project_id": "string (optional)",
      "platform_account_id": "string (optional)",
      "platform_account": {
        "name": "string",
        "credentials": {
          "additionalProp1": {}
        },
        "proxy": "string (optional)"
      },
      "submit_id": "string (optional)",
      "error_message": "string (optional)",
      "started_at": "datetime (optional)",
      "completed_at": "datetime (optional)",
      "created_at": "datetime",
      "updated_at": "datetime",
      "deleted_at": "datetime (optional)",
      "forecast_generate_cost": "number (optional)",
      "forecast_queue_cost": "number (optional)"
    }
  ]
  ```

### POST `/api/tasks/{task_id}/enqueue`
- **Description**: 手动将任务加入队列，并构建发送给worker的最终任务结构 (Manually enqueue a task and construct the final task structure to be sent to the worker).
- **Path Parameters**:
  - `task_id` (string): The ID of the task.
- **Response**: A confirmation message with `job_id` and `queue_name`.

### GET `/api/tasks/{task_id}/queue-status`
- **Description**: 获取任务的队列状态 (Get the queue status of a task).
- **Path Parameters**:
  - `task_id` (string): The ID of the task.
- **Response**: A dictionary with task status and queue status.

### POST `/api/tasks/{task_id}/cancel`
- **Description**: 取消任务的队列执行 (Cancel a queued task).
- **Path Parameters**:
  - `task_id` (string): The ID of the task.
- **Response**: A confirmation message.

### POST `/api/tasks/delete-all-queues`
- **Description**: 清空并删除所有队列 (Clear and delete all queues).
- **Response**: A summary of deleted queues.

### GET `/api/tasks/queue-info`
- **Description**: 获取所有队列的信息 (Get information about all queues).
- **Response**: A dictionary with queue information.

### GET `/api/tasks/list-redis-queues`
- **Description**: 直接从Redis中列出所有实际存在的RQ队列 (List all existing RQ queues directly from Redis).
- **Response**: `List[string]`

### POST `/api/tasks/callback`
- **Description**: 统一的Worker回调接口 (Unified callback interface for workers).
- **Request Body**: `WorkerCallbackRequest`
  - `report_type` (string): Type of report to determine the handler.
  - `worker` (enum): The worker reporting the status.
  - `data` (List[dict]): The callback data.
- **Response**: Processing result.

### POST `/api/tasks/monitoring/{task_id}/retry`
- **Description**: Retry a failed monitoring task.
- **Path Parameters**:
  - `task_id` (string): The ID of the monitoring task.
- **Response**: A confirmation message with `job_id`.

---

## Webhooks

**Prefix**: `/api/webhooks`

### POST `/api/webhooks/n8n/inspiration/{inspiration_id}`
- **Description**: Handle n8n webhook for inspiration workflow completion.
- **Path Parameters**:
  - `inspiration_id` (string): The ID of the inspiration.
- **Request Body**: JSON payload from n8n.
- **Response**: A confirmation message.

### POST `/api/webhooks/n8n/project_creation/{inspiration_id}`
- **Description**: Handle n8n webhook for project creation (transform workflow).
- **Path Parameters**:
  - `inspiration_id` (string): The ID of the inspiration that triggered the project.
- **Request Body**: JSON payload from n8n.
- **Response**: A confirmation message.

### POST `/api/webhooks/n8n/project_execution/{project_id}`
- **Description**: Handle n8n webhook for project execution workflow updates.
- **Path Parameters**:
  - `project_id` (string): The ID of the project.
- **Request Body**: JSON payload from n8n.
- **Response**: A confirmation message.

### POST `/api/webhooks/n8n/task_update/{task_id}`
- **Description**: Handle n8n webhook for individual task updates.
- **Path Parameters**:
  - `task_id` (string): The ID of the task.
- **Request Body**: JSON payload from n8n.
- **Response**: A confirmation message.

---

## Worker Configs

**Prefix**: `/api/worker-configs`

### POST `/api/worker-configs`
- **Description**: Create a new worker configuration.
- **Request Body**: `schemas.worker_config.WorkerConfigCreate`
- **Response**:
  ```json
  {
    "id": "string",
    "config_name": "string",
    "config_type": "string",
    "worker_type": "string (optional)",
    "config_data": {
      "additionalProp1": {}
    },
    "description": "string (optional)",
    "priority": "integer",
    "is_active": "boolean",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
  ```

### GET `/api/worker-configs`
- **Description**: List worker configurations with optional filtering.
- **Query Parameters**:
  - `worker_type` (string, optional): Filter by worker type.
  - `config_type` (string, optional): Filter by config type.
  - `is_active` (bool, optional, default: True): Filter by active status.
  - `skip` (int, optional, default: 0): Number of records to skip.
  - `limit` (int, optional, default: 100): Maximum number of records to return.
- **Response**:
  ```json
  [
    {
      "id": "string",
      "config_name": "string",
      "config_type": "string",
      "worker_type": "string (optional)",
      "config_data": {
        "additionalProp1": {}
      },
      "description": "string (optional)",
      "priority": "integer",
      "is_active": "boolean",
      "created_at": "datetime",
      "updated_at": "datetime"
    }
  ]
  ```

### GET `/api/worker-configs/{config_id}`
- **Description**: Get a specific worker configuration.
- **Path Parameters**:
  - `config_id` (string): The ID of the configuration.
- **Response**:
  ```json
  {
    "id": "string",
    "config_name": "string",
    "config_type": "string",
    "worker_type": "string (optional)",
    "config_data": {
      "additionalProp1": {}
    },
    "description": "string (optional)",
    "priority": "integer",
    "is_active": "boolean",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
  ```

### PUT `/api/worker-configs/{config_id}`
- **Description**: Update a worker configuration.
- **Path Parameters**:
  - `config_id` (string): The ID of the configuration.
- **Request Body**: `schemas.worker_config.WorkerConfigUpdate`
- **Response**:
  ```json
  {
    "id": "string",
    "config_name": "string",
    "config_type": "string",
    "worker_type": "string (optional)",
    "config_data": {
      "additionalProp1": {}
    },
    "description": "string (optional)",
    "priority": "integer",
    "is_active": "boolean",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
  ```

### DELETE `/api/worker-configs/{config_id}`
- **Description**: Delete a worker configuration (soft delete by setting is_active=False).
- **Path Parameters**:
  - `config_id` (string): The ID of the configuration.
- **Response**: A confirmation message.

### POST `/api/worker-configs/tasks/{task_id}/assign`
- **Description**: Assign configurations to a specific task.
- **Path Parameters**:
  - `task_id` (string): The ID of the task.
- **Request Body**: `schemas.worker_config.ConfigAssignmentRequest`
- **Response**:
  ```json
  [
    {
      "id": "string",
      "task_id": "string",
      "config_id": "string",
      "override_data": {
        "additionalProp1": {}
      },
      "created_at": "datetime"
    }
  ]
  ```

### GET `/api/worker-configs/tasks/{task_id}/configs`
- **Description**: Get all configurations assigned to a specific task.
- **Path Parameters**:
  - `task_id` (string): The ID of the task.
- **Response**: A dictionary of configurations.

---

## Workflow Registry

**Prefix**: `/api/workflow-registry`

### POST `/api/workflow-registry`
- **Description**: Create a new workflow registry entry.
- **Request Body**: `schemas.workflow_registry.WorkflowRegistryCreate`
- **Response**:
  ```json
  {
    "id": "string",
    "name": "string",
    "description": "string (optional)",
    "workflow_type": "string",
    "n8n_webhook_url": "string (optional)",
    "is_active": "boolean",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
  ```

### GET `/api/workflow-registry`
- **Description**: List workflow registry entries with optional filtering.
- **Query Parameters**:
  - `skip` (int, optional, default: 0): Number of records to skip.
  - `limit` (int, optional, default: 100): Maximum number of records to return.
  - `workflow_type` (string, optional): Filter by workflow type.
  - `is_active` (bool, optional): Filter by active status.
- **Response**:
  ```json
  [
    {
      "id": "string",
      "name": "string",
      "description": "string (optional)",
      "workflow_type": "string",
      "is_active": "boolean"
    }
  ]
  ```

### GET `/api/workflow-registry/{workflow_id}`
- **Description**: Get workflow registry entry by ID.
- **Path Parameters**:
  - `workflow_id` (string): The ID of the workflow.
- **Response**:
  ```json
  {
    "id": "string",
    "name": "string",
    "description": "string (optional)",
    "workflow_type": "string",
    "n8n_webhook_url": "string (optional)",
    "is_active": "boolean",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
  ```

### PUT `/api/workflow-registry/{workflow_id}`
- **Description**: Update workflow registry entry.
- **Path Parameters**:
  - `workflow_id` (string): The ID of the workflow.
- **Request Body**: `schemas.workflow_registry.WorkflowRegistryUpdate`
- **Response**:
  ```json
  {
    "id": "string",
    "name": "string",
    "description": "string (optional)",
    "workflow_type": "string",
    "n8n_webhook_url": "string (optional)",
    "is_active": "boolean",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
  ```

### DELETE `/api/workflow-registry/{workflow_id}`
- **Description**: Soft delete workflow registry entry.
- **Path Parameters**:
  - `workflow_id` (string): The ID of the workflow.
- **Response**: A confirmation message.

### POST `/api/workflow-registry/{workflow_id}/activate`
- **Description**: Activate a workflow.
- **Path Parameters**:
  - `workflow_id` (string): The ID of the workflow.
- **Response**:
  ```json
  {
    "id": "string",
    "name": "string",
    "description": "string (optional)",
    "workflow_type": "string",
    "n8n_webhook_url": "string (optional)",
    "is_active": "boolean",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
  ```

### POST `/api/workflow-registry/{workflow_id}/deactivate`
- **Description**: Deactivate a workflow.
- **Path Parameters**:
  - `workflow_id` (string): The ID of the workflow.
- **Response**:
  ```json
  {
    "id": "string",
    "name": "string",
    "description": "string (optional)",
    "workflow_type": "string",
    "n8n_webhook_url": "string (optional)",
    "is_active": "boolean",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
  ```

### GET `/api/workflow-registry/types/list`
- **Description**: Get list of all unique workflow types.
- **Response**: `List[string]`