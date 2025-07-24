import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useProjectTypes } from '../context/project-types-context'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { IconCheck, IconX, IconToggleLeft, IconToggleRight, IconArrowUp, IconArrowDown } from '@tabler/icons-react'

const createProjectTypeSchema = z.object({
  code: z.string().min(1, 'Project type code is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  inspiration_workflow_id: z.string().optional(),
  transform_workflow_id: z.string().optional(),
  execution_workflow_id: z.string().optional(),
  default_parameters: z.string().refine(val => { try { JSON.parse(val); return true } catch { return false } }, { message: 'Invalid JSON format' }).optional(),
  parameter_schema: z.string().refine(val => { try { JSON.parse(val); return true } catch { return false } }, { message: 'Invalid JSON format' }).optional(),
  category: z.string().optional(),
  sort_order: z.number().min(1, 'Sort order must be at least 1').optional(),
  is_active: z.boolean().optional(),
})

const updateProjectTypeSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional(),
  inspiration_workflow_id: z.string().optional().nullable(),
  transform_workflow_id: z.string().optional().nullable(),
  execution_workflow_id: z.string().optional().nullable(),
  default_parameters: z.string().refine(val => { try { JSON.parse(val); return true } catch { return false } }, { message: 'Invalid JSON format' }).optional(),
  parameter_schema: z.string().refine(val => { try { JSON.parse(val); return true } catch { return false } }, { message: 'Invalid JSON format' }).optional(),
  category: z.string().optional(),
  sort_order: z.number().min(1, 'Sort order must be at least 1').optional(),
  is_active: z.boolean().optional(),
})

type CreateProjectTypeValues = z.infer<typeof createProjectTypeSchema>
type UpdateProjectTypeValues = z.infer<typeof updateProjectTypeSchema>

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'video':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    case 'audio':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    case 'image':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    case 'education':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }
}

export function ProjectTypesDialogs() {
  const {
    selectedProjectType,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isDetailDialogOpen,
    setIsDetailDialogOpen,
    createProjectType,
    updateProjectType,
    deleteProjectType,
    activateProjectType,
    deactivateProjectType,
    updateSortOrder,
    setSelectedProjectType,
    categories,
    isLoadingCategories,
  } = useProjectTypes()

  const [defaultParamsDisplayValue, setDefaultParamsDisplayValue] = useState('')
  const [paramSchemaDisplayValue, setParamSchemaDisplayValue] = useState('')

  const createForm = useForm<CreateProjectTypeValues>({
    resolver: zodResolver(createProjectTypeSchema),
    defaultValues: {
      code: '',
      name: '',
      description: '',
      inspiration_workflow_id: '',
      transform_workflow_id: '',
      execution_workflow_id: '',
      default_parameters: '{}',
      parameter_schema: '{}',
      category: '',
      sort_order: 10,
      is_active: true,
    },
  })

  const updateForm = useForm<UpdateProjectTypeValues>({
    resolver: zodResolver(updateProjectTypeSchema),
    defaultValues: {
      name: '',
      description: '',
      inspiration_workflow_id: '',
      transform_workflow_id: '',
      execution_workflow_id: '',
      default_parameters: '{}',
      parameter_schema: '{}',
      category: '',
      sort_order: 10,
      is_active: true,
    },
  })

  const handleCreateSubmit = async (values: CreateProjectTypeValues) => {
    try {
      await createProjectType({
        ...values,
        default_parameters: values.default_parameters ? JSON.parse(values.default_parameters) : undefined,
        parameter_schema: values.parameter_schema ? JSON.parse(values.parameter_schema) : undefined,
      })
      createForm.reset()
    } catch (error) {
      // Zod handles JSON validation, so this block might only catch other errors
      console.error('Failed to create project type:', error)
    }
  }

  const handleUpdateSubmit = async (values: UpdateProjectTypeValues) => {
    if (!selectedProjectType) return
    try {
      await updateProjectType(selectedProjectType.code, {
        ...values,
        default_parameters: values.default_parameters ? JSON.parse(values.default_parameters) : undefined,
        parameter_schema: values.parameter_schema ? JSON.parse(values.parameter_schema) : undefined,
        inspiration_workflow_id: values.inspiration_workflow_id || null,
        transform_workflow_id: values.transform_workflow_id || null,
        execution_workflow_id: values.execution_workflow_id || null,
      })
      updateForm.reset()
    } catch (error) {
      console.error('Failed to update project type:', error)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!selectedProjectType) return
    await deleteProjectType(selectedProjectType.code)
  }

  const handleToggleStatus = async () => {
    if (!selectedProjectType) return
    
    if (selectedProjectType.is_active) {
      await deactivateProjectType(selectedProjectType.code)
    } else {
      await activateProjectType(selectedProjectType.code)
    }
  }

  const handleSortOrderChange = async (direction: 'up' | 'down') => {
    if (!selectedProjectType) return
    const newSortOrder = direction === 'up' 
      ? selectedProjectType.sort_order - 1 
      : selectedProjectType.sort_order + 1
    if (newSortOrder >= 1) {
      await updateSortOrder(selectedProjectType.code, newSortOrder)
    }
  }

  // Update form when selectedProjectType changes
  useEffect(() => {
    if (selectedProjectType && isEditDialogOpen) {
      const defaultParamsStr = JSON.stringify(selectedProjectType.default_parameters, null, 2)
      const paramSchemaStr = JSON.stringify(selectedProjectType.parameter_schema, null, 2)
      updateForm.reset({
        name: selectedProjectType.name,
        description: selectedProjectType.description,
        inspiration_workflow_id: selectedProjectType.inspiration_workflow_id || '',
        transform_workflow_id: selectedProjectType.transform_workflow_id || '',
        execution_workflow_id: selectedProjectType.execution_workflow_id || '',
        default_parameters: defaultParamsStr,
        parameter_schema: paramSchemaStr,
        category: selectedProjectType.category,
        sort_order: selectedProjectType.sort_order,
        is_active: selectedProjectType.is_active,
      })
    }
  }, [selectedProjectType, isEditDialogOpen, updateForm])

  useEffect(() => {
    if (selectedProjectType && isDetailDialogOpen) {
      setDefaultParamsDisplayValue(JSON.stringify(selectedProjectType.default_parameters, null, 2))
      setParamSchemaDisplayValue(JSON.stringify(selectedProjectType.parameter_schema, null, 2))
    }
  }, [selectedProjectType, isDetailDialogOpen])

  return (
    <>
      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Project Type</DialogTitle>
            <DialogDescription>
              Add a new project type configuration. Fill in all the required information.
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(handleCreateSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Type Code</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., tech_video_short" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="sort_order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sort Order</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="10" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={createForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter project type name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingCategories ? (
                          <SelectItem value="loading" disabled>Loading categories...</SelectItem>
                        ) : (
                          categories.map(category => (
                            <SelectItem key={category} value={category}>
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter project type description"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={createForm.control}
                  name="inspiration_workflow_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Inspiration Workflow ID (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., tech_inspiration_v1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="transform_workflow_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transform Workflow ID (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., script_transform_v1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="execution_workflow_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Execution Workflow ID (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., dreamina_video_gen_v1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={createForm.control}
                name="default_parameters"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Parameters (JSON)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='{"duration": 30, "style": "modern"}'
                        className="min-h-[120px] font-mono text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="parameter_schema"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parameter Schema (JSON)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='{"type": "object", "properties": {"duration": {"type": "integer"}}}'
                        className="min-h-[120px] font-mono text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Active Status</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Enable this project type for use in the system
                      </div>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Project Type</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Project Type</DialogTitle>
            <DialogDescription>
              Update the project type configuration and settings.
            </DialogDescription>
          </DialogHeader>
          <Form {...updateForm}>
            <form onSubmit={updateForm.handleSubmit(handleUpdateSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Project Type Code</Label>
                  <Input value={selectedProjectType?.code || ''} disabled className="bg-muted" />
                  <div className="text-xs text-muted-foreground mt-1">Code cannot be changed</div>
                </div>
                <FormField
                  control={updateForm.control}
                  name="sort_order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sort Order</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="10" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={updateForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter project type name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={updateForm.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingCategories ? (
                          <SelectItem value="loading" disabled>Loading categories...</SelectItem>
                        ) : (
                          categories.map(category => (
                            <SelectItem key={category} value={category}>
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={updateForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter project type description"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={updateForm.control}
                  name="inspiration_workflow_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Inspiration Workflow ID (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., tech_inspiration_v1" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={updateForm.control}
                  name="transform_workflow_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transform Workflow ID (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., script_transform_v1" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={updateForm.control}
                  name="execution_workflow_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Execution Workflow ID (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., dreamina_video_gen_v1" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={updateForm.control}
                name="default_parameters"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Parameters (JSON)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='{"duration": 30, "style": "modern"}'
                        className="min-h-[120px] font-mono text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={updateForm.control}
                name="parameter_schema"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parameter Schema (JSON)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='{"type": "object", "properties": {"duration": {"type": "integer"}}}'
                        className="min-h-[120px] font-mono text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={updateForm.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Active Status</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Enable this project type for use in the system
                      </div>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Update Project Type</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedProjectType?.name}
              <Badge className={getCategoryColor(selectedProjectType?.category || '')}>
                {selectedProjectType?.category}
              </Badge>
              {selectedProjectType?.is_active ? (
                <Badge variant="outline" className="text-green-600">
                  <IconCheck className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              ) : (
                <Badge variant="outline" className="text-red-600">
                  <IconX className="w-3 h-3 mr-1" />
                  Inactive
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              View project type details and configuration
            </DialogDescription>
          </DialogHeader>
          
          {selectedProjectType && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Project Type Code</Label>
                  <div className="text-sm text-muted-foreground font-mono">{selectedProjectType.code}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Sort Order</Label>
                  <div className="text-sm text-muted-foreground">{selectedProjectType.sort_order}</div>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <div className="text-sm text-muted-foreground mt-1">{selectedProjectType.description}</div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label className="text-sm font-medium">Workflow IDs</Label>
                  <div className="space-y-2 mt-1">
                    <div className="flex justify-between">
                      <span className="text-sm">Inspiration:</span>
                      <span className="text-sm font-mono">{selectedProjectType.inspiration_workflow_id || 'Not set'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Transform:</span>
                      <span className="text-sm font-mono">{selectedProjectType.transform_workflow_id || 'Not set'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Execution:</span>
                      <span className="text-sm font-mono">{selectedProjectType.execution_workflow_id || 'Not set'}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Default Parameters</Label>
                <pre className="mt-1 p-3 bg-muted rounded-md text-xs overflow-auto max-h-[150px] font-mono">
                  {defaultParamsDisplayValue}
                </pre>
              </div>

              <div>
                <Label className="text-sm font-medium">Parameter Schema</Label>
                <pre className="mt-1 p-3 bg-muted rounded-md text-xs overflow-auto max-h-[150px] font-mono">
                  {paramSchemaDisplayValue}
                </pre>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <div className="text-muted-foreground">
                    {new Date(selectedProjectType.created_at).toLocaleString()}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Last Updated</Label>
                  <div className="text-muted-foreground">
                    {new Date(selectedProjectType.updated_at).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSortOrderChange('up')}
              disabled={!selectedProjectType || selectedProjectType.sort_order <= 1}
            >
              <IconArrowUp className="w-4 h-4 mr-2" />
              Move Up
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSortOrderChange('down')}
            >
              <IconArrowDown className="w-4 h-4 mr-2" />
              Move Down
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleToggleStatus}
              className={selectedProjectType?.is_active ? 'text-orange-600' : 'text-green-600'}
            >
              {selectedProjectType?.is_active ? (
                <>
                  <IconToggleLeft className="w-4 h-4 mr-2" />
                  Deactivate
                </>
              ) : (
                <>
                  <IconToggleRight className="w-4 h-4 mr-2" />
                  Activate
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDetailDialogOpen(false)
                setIsEditDialogOpen(true)
              }}
            >
              Edit
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDetailDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        destructive
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        handleConfirm={handleDeleteConfirm}
        title={`Delete project type: ${selectedProjectType?.name}?`}
        desc={
          <>
            You are about to delete the project type{' '}
            <strong>{selectedProjectType?.code}</strong>. <br />
            This action cannot be undone.
          </>
        }
        confirmText="Delete Project Type"
      />
    </>
  )
}