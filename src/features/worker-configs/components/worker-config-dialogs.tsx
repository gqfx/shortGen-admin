import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useWorkerConfigs } from '../context/worker-configs-context'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'

// Form schemas
const createConfigSchema = z.object({
  config_name: z.string().min(1, 'Config name is required'),
  config_type: z.string().min(1, 'Config type is required'),
  worker_type: z.string().min(1, 'Worker type is required'),
  description: z.string().min(1, 'Description is required'),
  priority: z.number().min(1).max(10),
  is_active: z.boolean().default(true),
})

const updateConfigSchema = z.object({
  config_name: z.string().min(1, 'Config name is required'),
  config_type: z.string().min(1, 'Config type is required'),
  worker_type: z.string().min(1, 'Worker type is required'),
  description: z.string().min(1, 'Description is required'),
  priority: z.number().min(1).max(10),
  is_active: z.boolean(),
})

type CreateConfigFormData = z.infer<typeof createConfigSchema>
type UpdateConfigFormData = z.infer<typeof updateConfigSchema>

const configTypes = [
  { value: 'execution', label: 'Execution' },
  { value: 'validation', label: 'Validation' },
  { value: 'processing', label: 'Processing' },
]

const workerTypes = [
  { value: 'video_generator', label: 'Video Generator' },
  { value: 'image_generator', label: 'Image Generator' },
  { value: 'audio_generator', label: 'Audio Generator' },
  { value: 'text_generator', label: 'Text Generator' },
]

export function WorkerConfigDialogs() {
  const {
    selectedConfig,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isDetailDialogOpen,
    setIsDetailDialogOpen,
    createConfig,
    updateConfig,
    deleteConfig,
  } = useWorkerConfigs()

  const createForm = useForm<CreateConfigFormData>({
    resolver: zodResolver(createConfigSchema),
    defaultValues: {
      config_name: '',
      config_type: '',
      worker_type: '',
      description: '',
      priority: 5,
      is_active: true,
    },
  })

  const editForm = useForm<UpdateConfigFormData>({
    resolver: zodResolver(updateConfigSchema),
    defaultValues: {
      config_name: '',
      config_type: '',
      worker_type: '',
      description: '',
      priority: 5,
      is_active: true,
    },
  })

  // Reset and populate edit form when selectedConfig changes
  React.useEffect(() => {
    if (selectedConfig && isEditDialogOpen) {
      editForm.reset({
        config_name: selectedConfig.config_name || selectedConfig.name,
        config_type: selectedConfig.config_type,
        worker_type: selectedConfig.worker_type,
        description: selectedConfig.description,
        priority: selectedConfig.priority,
        is_active: selectedConfig.is_active,
      })
    }
  }, [selectedConfig, isEditDialogOpen, editForm])

  const handleCreateConfig = async (data: CreateConfigFormData) => {
    try {
      await createConfig({
        ...data,
        config_data: {},
      })
      createForm.reset()
    } catch (error) {
      console.error('Failed to create config:', error)
    }
  }

  const handleUpdateConfig = async (data: UpdateConfigFormData) => {
    if (!selectedConfig) return
    
    try {
      await updateConfig(selectedConfig.id, {
        ...data,
        config_data: selectedConfig.config_data || {},
      })
    } catch (error) {
      console.error('Failed to update config:', error)
    }
  }

  const handleDeleteConfig = async () => {
    if (!selectedConfig) return
    
    try {
      await deleteConfig(selectedConfig.id)
    } catch (error) {
      console.error('Failed to delete config:', error)
    }
  }

  return (
    <>
      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>Create Worker Configuration</DialogTitle>
            <DialogDescription>
              Add a new worker configuration for content generation tasks.
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(handleCreateConfig)} className='space-y-4'>
              <FormField
                control={createForm.control}
                name='config_name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Configuration Name</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter config name' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name='config_type'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Configuration Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select config type' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {configTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name='worker_type'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Worker Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select worker type' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {workerTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder='Enter config description' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name='priority'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority (1-10)</FormLabel>
                    <FormControl>
                      <Input 
                        type='number' 
                        min='1'
                        max='10'
                        placeholder='5'
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name='is_active'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm'>
                    <div className='space-y-0.5'>
                      <FormLabel>Active Configuration</FormLabel>
                      <div className='text-sm text-muted-foreground'>
                        Enable this configuration for worker tasks
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className='flex justify-end space-x-2'>
                <Button type='button' variant='outline' onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type='submit'>Create Configuration</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>Edit Worker Configuration</DialogTitle>
            <DialogDescription>
              Update the worker configuration information.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleUpdateConfig)} className='space-y-4'>
              <FormField
                control={editForm.control}
                name='config_name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Configuration Name</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter config name' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name='config_type'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Configuration Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select config type' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {configTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name='worker_type'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Worker Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select worker type' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {workerTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder='Enter config description' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name='priority'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority (1-10)</FormLabel>
                    <FormControl>
                      <Input 
                        type='number' 
                        min='1'
                        max='10'
                        placeholder='5'
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name='is_active'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm'>
                    <div className='space-y-0.5'>
                      <FormLabel>Active Configuration</FormLabel>
                      <div className='text-sm text-muted-foreground'>
                        Enable this configuration for worker tasks
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className='flex justify-end space-x-2'>
                <Button type='button' variant='outline' onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type='submit'>Update Configuration</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className='sm:max-w-[500px]'>
          <DialogHeader>
            <DialogTitle>Worker Configuration Details</DialogTitle>
            <DialogDescription>
              View detailed information about this worker configuration.
            </DialogDescription>
          </DialogHeader>
          {selectedConfig && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center justify-between'>
                  {selectedConfig.config_name || selectedConfig.name}
                  <Badge className={selectedConfig.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {selectedConfig.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <span className='font-medium'>Description:</span>
                  <p className='mt-1'>{selectedConfig.description}</p>
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <span className='font-medium'>Config Type:</span>
                    <p>{selectedConfig.config_type}</p>
                  </div>
                  <div>
                    <span className='font-medium'>Worker Type:</span>
                    <p>{selectedConfig.worker_type}</p>
                  </div>
                  <div>
                    <span className='font-medium'>Priority:</span>
                    <p>{selectedConfig.priority}/10</p>
                  </div>
                  <div>
                    <span className='font-medium'>Version:</span>
                    <p>{selectedConfig.version || 'N/A'}</p>
                  </div>
                  <div>
                    <span className='font-medium'>Created:</span>
                    <p>{new Date(selectedConfig.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className='font-medium'>Updated:</span>
                    <p>{new Date(selectedConfig.updated_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          <div className='flex justify-end'>
            <Button variant='outline' onClick={() => setIsDetailDialogOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Worker Configuration</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this worker configuration? This action cannot be undone.
              {selectedConfig && (
                <div className='mt-2 p-2 bg-gray-50 rounded'>
                  <strong>{selectedConfig.config_name || selectedConfig.name}</strong>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfig} className='bg-red-600 hover:bg-red-700'>
              Delete Configuration
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}