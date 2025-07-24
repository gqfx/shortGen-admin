import React from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useWorkflowRegistry } from '../context/workflow-registry-context'
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
import { IconCheck, IconX, IconToggleLeft, IconToggleRight } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { workflowRegistryApi } from '@/lib/api'

const workflowSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  workflow_type: z.string().min(1, 'Workflow type is required'),
  n8n_webhook_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
})

const createWorkflowSchema = workflowSchema
const updateWorkflowSchema = workflowSchema.pick({
  name: true,
  description: true,
  n8n_webhook_url: true,
})

type CreateWorkflowValues = z.infer<typeof createWorkflowSchema>
type UpdateWorkflowValues = z.infer<typeof updateWorkflowSchema>

const useWorkflowTypes = () => {
  const { data: workflowTypes = [], isLoading } = useQuery({
    queryKey: ['workflow-types'],
    queryFn: () => workflowRegistryApi.getTypes(),
  })
  return { workflowTypes, isLoading }
}

const getWorkflowTypeColor = (type: string) => {
  switch (type) {
    case 'inspiration':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
    case 'transform':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    case 'execution':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }
}

export function WorkflowRegistryDialogs() {
  const {
    selectedWorkflow,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isDetailDialogOpen,
    setIsDetailDialogOpen,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    activateWorkflow,
    deactivateWorkflow,
    setSelectedWorkflow,
  } = useWorkflowRegistry()

  const { workflowTypes, isLoading: isLoadingTypes } = useWorkflowTypes()

  const createForm = useForm<CreateWorkflowValues>({
    resolver: zodResolver(createWorkflowSchema),
    defaultValues: {
      name: '',
      description: '',
      workflow_type: '',
      n8n_webhook_url: '',
    },
  })

  const updateForm = useForm<UpdateWorkflowValues>({
    resolver: zodResolver(updateWorkflowSchema),
    defaultValues: {
      name: '',
      description: '',
      n8n_webhook_url: '',
    },
  })

  const handleCreateSubmit = async (values: CreateWorkflowValues) => {
    await createWorkflow(values)
    createForm.reset()
  }

  const handleUpdateSubmit = async (values: UpdateWorkflowValues) => {
    if (!selectedWorkflow) return
    await updateWorkflow(selectedWorkflow.id, values)
    updateForm.reset()
  }

  const handleDeleteConfirm = async () => {
    if (!selectedWorkflow) return
    await deleteWorkflow(selectedWorkflow.id)
  }

  const handleToggleStatus = async () => {
    if (!selectedWorkflow) return
    
    if (selectedWorkflow.is_active) {
      await deactivateWorkflow(selectedWorkflow.id)
    } else {
      await activateWorkflow(selectedWorkflow.id)
    }
  }

  // Update form when selectedWorkflow changes
  React.useEffect(() => {
    if (selectedWorkflow && isEditDialogOpen) {
      updateForm.reset({
        name: selectedWorkflow.name,
        description: selectedWorkflow.description || '',
        n8n_webhook_url: selectedWorkflow.n8n_webhook_url || '',
      })
    }
  }, [selectedWorkflow, isEditDialogOpen, updateForm])


  return (
    <>
      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Workflow</DialogTitle>
            <DialogDescription>
              Add a new workflow to the registry. Fill in all the required information.
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(handleCreateSubmit)} className="space-y-4">
              <FormField
                control={createForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter workflow name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="workflow_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workflow Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select workflow type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingTypes ? (
                          <SelectItem value="loading" disabled>Loading types...</SelectItem>
                        ) : (
                          workflowTypes.map((type: string) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
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
                        placeholder="Enter workflow description"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="n8n_webhook_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>n8n Webhook URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://n8n.example.com/webhook/..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Workflow</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Workflow</DialogTitle>
            <DialogDescription>
              Update the workflow configuration and settings.
            </DialogDescription>
          </DialogHeader>
          <Form {...updateForm}>
            <form onSubmit={updateForm.handleSubmit(handleUpdateSubmit)} className="space-y-4">
              <FormField
                control={updateForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter workflow name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <Label>Workflow Type</Label>
                <Input value={selectedWorkflow?.workflow_type || ''} disabled className="bg-muted" />
                <div className="text-xs text-muted-foreground mt-1">Type cannot be changed after creation</div>
              </div>

              <FormField
                control={updateForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter workflow description"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={updateForm.control}
                name="n8n_webhook_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>n8n Webhook URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://n8n.example.com/webhook/..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Update Workflow</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedWorkflow?.name}
              <Badge className={getWorkflowTypeColor(selectedWorkflow?.workflow_type || '')}>
                {selectedWorkflow?.workflow_type}
              </Badge>
              {selectedWorkflow?.is_active ? (
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
              View workflow details and configuration
            </DialogDescription>
          </DialogHeader>
          
          {selectedWorkflow && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Workflow ID</Label>
                  <div className="text-sm text-muted-foreground font-mono">{selectedWorkflow.id}</div>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <div className="text-sm text-muted-foreground mt-1">{selectedWorkflow.description}</div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">n8n Webhook URL</Label>
                <div className="text-sm text-muted-foreground font-mono">{selectedWorkflow.n8n_webhook_url || 'Not set'}</div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <div className="text-muted-foreground">
                    {new Date(selectedWorkflow.created_at).toLocaleString()}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Last Updated</Label>
                  <div className="text-muted-foreground">
                    {new Date(selectedWorkflow.updated_at).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleToggleStatus}
              className={selectedWorkflow?.is_active ? 'text-orange-600' : 'text-green-600'}
            >
              {selectedWorkflow?.is_active ? (
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
        title={`Delete workflow: ${selectedWorkflow?.name}?`}
        desc={
          <>
            You are about to delete the workflow{' '}
            <strong>{selectedWorkflow?.id}</strong>. <br />
            This action cannot be undone.
          </>
        }
        confirmText="Delete Workflow"
      />
    </>
  )
}