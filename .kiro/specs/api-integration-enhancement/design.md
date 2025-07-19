# 设计文档

## 概述

本设计文档旨在增强项目创建和灵感创建功能的API集成，确保完全替换模拟数据，提供健壮的错误处理、加载状态管理和用户体验优化。

通过分析现有代码，发现以下问题需要解决：
1. 项目对话框中的API调用被注释掉，使用了console.log而不是实际的API调用
2. 项目类型选择使用硬编码数据而不是从API获取
3. 缺乏完善的错误处理和加载状态管理
4. 表单验证需要与服务端错误响应更好地集成

## 架构

### 整体架构
```
Frontend Components
├── Dialog Components (UI Layer)
├── Context Providers (State Management)
├── API Layer (HTTP Client)
└── Error Handling & Loading States
```

### 数据流
```
User Action → Form Validation → API Call → Loading State → Success/Error Handling → UI Update
```

## 组件和接口

### 1. 增强的API集成层

#### 1.1 项目API增强
- **位置**: `src/lib/api.ts`
- **功能**: 确保所有项目相关的API调用都正确实现
- **改进点**:
  - 添加请求超时处理
  - 统一错误响应格式处理
  - 添加重试机制

#### 1.2 项目类型API集成
- **新增功能**: 动态获取项目类型列表
- **API端点**: `/api/project-types`
- **缓存策略**: 使用React Query缓存项目类型数据

### 2. 对话框组件增强

#### 2.1 项目对话框 (`projects-dialogs.tsx`)
**当前问题**:
```typescript
// 当前代码中API调用被注释
console.log('Creating project:', data)
// API call would go here
```

**解决方案**:
```typescript
// 使用context中的API方法
await createProject(data)
```

**增强功能**:
- 集成真实的API调用
- 添加加载状态指示器
- 实现详细的错误处理
- 动态加载项目类型选项

#### 2.2 灵感对话框 (`inspiration-dialogs.tsx`)
**当前状态**: 已正确实现API集成
**优化点**:
- 改进错误消息显示
- 添加更好的加载状态反馈

### 3. 状态管理增强

#### 3.1 项目Context增强
- **加载状态管理**: 为创建、更新、删除操作添加独立的加载状态
- **错误状态管理**: 提供详细的错误信息和恢复机制
- **乐观更新**: 实现乐观UI更新以提升用户体验

#### 3.2 项目类型Context (新增)
- **功能**: 管理项目类型的获取和缓存
- **API集成**: 与 `/api/project-types` 端点集成
- **缓存策略**: 使用React Query进行数据缓存

### 4. 错误处理系统

#### 4.1 错误类型分类
```typescript
interface ApiError {
  type: 'network' | 'validation' | 'server' | 'timeout'
  message: string
  details?: Record<string, string[]> // 字段级验证错误
}
```

#### 4.2 错误处理策略
- **网络错误**: 显示重试选项
- **验证错误**: 映射到对应表单字段
- **服务器错误**: 显示通用错误消息
- **超时错误**: 提供重试机制

### 5. 加载状态管理

#### 5.1 加载状态类型
```typescript
interface LoadingStates {
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
  isLoadingProjectTypes: boolean
}
```

#### 5.2 UI反馈
- **按钮状态**: 提交时显示加载图标并禁用
- **表单状态**: 显示全局加载指示器
- **列表刷新**: 操作完成后自动刷新数据

## 数据模型

### 1. 项目类型模型
```typescript
interface ProjectType {
  code: string
  name: string
  description: string
  category: string
  is_active: boolean
  default_parameters: Record<string, any>
}
```

### 2. 错误响应模型
```typescript
interface ApiErrorResponse {
  code: number
  msg: string
  data: {
    field_errors?: Record<string, string[]>
    details?: string
  } | null
}
```

## 错误处理

### 1. 客户端验证
- **表单验证**: 使用Zod schema进行客户端验证
- **实时验证**: 字段失焦时进行验证
- **提交前验证**: 阻止无效数据提交

### 2. 服务端错误处理
- **HTTP状态码处理**: 
  - 400: 显示具体的验证错误
  - 401: 重定向到登录页面
  - 403: 显示权限不足提示
  - 404: 显示资源不存在提示
  - 500: 显示服务器错误提示
- **错误消息映射**: 将服务端错误映射到用户友好的消息

### 3. 网络错误处理
- **连接超时**: 显示重试选项
- **网络不可用**: 显示离线提示
- **请求中断**: 提供重新发送选项

## 测试策略

### 1. 单元测试
- **API函数测试**: 测试所有API调用函数
- **组件测试**: 测试对话框组件的各种状态
- **错误处理测试**: 测试各种错误场景

### 2. 集成测试
- **端到端流程**: 测试完整的创建/更新/删除流程
- **错误恢复**: 测试错误发生后的恢复机制
- **加载状态**: 测试加载状态的正确显示

### 3. 用户体验测试
- **响应时间**: 确保操作响应及时
- **错误反馈**: 验证错误消息的清晰度
- **加载反馈**: 确保用户了解操作进度

## 性能优化

### 1. 数据缓存
- **项目类型缓存**: 使用React Query缓存项目类型数据
- **列表数据缓存**: 缓存项目和灵感列表数据
- **智能刷新**: 只在必要时刷新数据

### 2. 请求优化
- **防抖处理**: 防止重复提交
- **请求取消**: 组件卸载时取消进行中的请求
- **批量操作**: 支持批量操作以减少API调用

### 3. UI优化
- **乐观更新**: 立即更新UI，失败时回滚
- **骨架屏**: 在数据加载时显示骨架屏
- **虚拟滚动**: 大列表使用虚拟滚动

## 安全考虑

### 1. 输入验证
- **客户端验证**: 防止恶意输入
- **服务端验证**: 双重验证确保数据安全
- **XSS防护**: 对用户输入进行转义

### 2. 错误信息安全
- **敏感信息过滤**: 不在错误消息中暴露敏感信息
- **错误日志**: 记录详细错误信息用于调试
- **用户友好消息**: 向用户显示安全的错误消息

## 实现计划

### 阶段1: API集成修复
1. 修复项目对话框中的API调用
2. 实现项目类型动态加载
3. 添加基本的错误处理

### 阶段2: 状态管理增强
1. 添加详细的加载状态
2. 实现错误状态管理
3. 优化用户体验

### 阶段3: 高级功能
1. 实现乐观更新
2. 添加重试机制
3. 性能优化

### 阶段4: 测试和优化
1. 编写全面的测试
2. 性能调优
3. 用户体验优化