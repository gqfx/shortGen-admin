import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useInspirations } from '../context/inspirations-context'
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

// Form schemas
const createInspirationSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  project_type_code: z.string().min(1, 'Project type is required'),
  source: z.string().min(1, 'Source is required'),
  parameters: z.record(z.any()).optional().default({}),
})

const updateInspirationSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  project_type_code: z.string().min(1, 'Project type is required'),
  source: z.string().min(1, 'Source is required'),
  parameters: z.record(z.any()).optional().default({}),
})

type CreateInspirationFormData = z.infer<typeof createInspirationSchema>
type UpdateInspirationFormData = z.infer<typeof updateInspirationSchema>

const projectTypes = [
  { value: 'video_generation', label: 'Video Generation' },
  { value: 'image_generation', label: 'Image Generation' },
  { value: 'audio_generation', label: 'Audio Generation' },
  { value: 'text_generation', label: 'Text Generation' },
]

const sources = [
  { value: 'user_input', label: 'User Input' },
  { value: 'ai_generated', label: 'AI Generated' },
  { value: 'imported', label: 'Imported' },
]

export function InspirationDialogs() {
  const {
    selectedInspiration,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isDetailDialogOpen,
    setIsDetailDialogOpen,
    createInspiration,
    updateInspiration,
    deleteInspiration,
    approveInspiration,
    rejectInspiration,
  } = useInspirations()

  const createForm = useForm<CreateInspirationFormData>({
    resolver: zodResolver(createInspirationSchema),
    defaultValues: {
      title: '',
      description: '',
      project_type_code: '',
      source: '',
      parameters: {},
    },
  })

  const editForm = useForm<UpdateInspirationFormData>({
    resolver: zodResolver(updateInspirationSchema),
    defaultValues: {
      title: '',
      description: '',
      project_type_code: '',
      source: '',
      parameters: {},
    },
  })

  // Reset and populate edit form when selectedInspiration changes
  React.useEffect(() => {
    if (selectedInspiration && isEditDialogOpen) {
      editForm.reset({
        title: selectedInspiration.title,
        description: selectedInspiration.description,
        project_type_code: selectedInspiration.project_type_code,
        source: selectedInspiration.source,
        parameters: selectedInspiration.parameters || {},
      })
    }
  }, [selectedInspiration, isEditDialogOpen, editForm])

  const handleCreateInspiration = async (data: CreateInspirationFormData) => {
    try {
      await createInspiration(data)
      createForm.reset()
    } catch (error) {
      console.error('Failed to create inspiration:', error)
    }
  }

  const handleUpdateInspiration = async (data: UpdateInspirationFormData) => {
    if (!selectedInspiration) return
    
    try {
      await updateInspiration(selectedInspiration.id, data)
    } catch (error) {
      console.error('Failed to update inspiration:', error)
    }
  }

  const handleDeleteInspiration = async () => {
    if (!selectedInspiration) return
    
    try {
      await deleteInspiration(selectedInspiration.id)
    } catch (error) {
      console.error('Failed to delete inspiration:', error)
    }
  }

  const handleApprove = async () => {
    if (!selectedInspiration) return
    try {
      await approveInspiration(selectedInspiration.id, { score: 5 })
    } catch (error) {
      console.error('Failed to approve inspiration:', error)
    }
  }

  const handleReject = async () => {
    if (!selectedInspiration) return
    try {
      await rejectInspiration(selectedInspiration.id, { review_notes: 'Rejected' })
    } catch (error) {
      console.error('Failed to reject inspiration:', error)
    }
  }

  return (
    <>
      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>Create Inspiration</DialogTitle>
            <DialogDescription>
              Add a new creative inspiration for content generation.
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(handleCreateInspiration)} className='space-y-4'>
              <FormField
                control={createForm.control}
                name='title'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter inspiration title' {...field} />
                    </FormControl>
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
                      <Textarea placeholder='Enter inspiration description' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name='project_type_code'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select project type' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {projectTypes.map((type) => (
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
                name='source'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select source' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sources.map((source) => (
                          <SelectItem key={source.value} value={source.value}>
                            {source.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className='flex justify-end space-x-2'>
                <Button type='button' variant='outline' onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type='submit'>Create Inspiration</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>Edit Inspiration</DialogTitle>
            <DialogDescription>
              Update the inspiration information.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleUpdateInspiration)} className='space-y-4'>
              <FormField
                control={editForm.control}
                name='title'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter inspiration title' {...field} />
                    </FormControl>
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
                      <Textarea placeholder='Enter inspiration description' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name='project_type_code'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select project type' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {projectTypes.map((type) => (
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
                name='source'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select source' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sources.map((source) => (
                          <SelectItem key={source.value} value={source.value}>
                            {source.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className='flex justify-end space-x-2'>
                <Button type='button' variant='outline' onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type='submit'>Update Inspiration</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className='sm:max-w-[500px]'>
          <DialogHeader>
            <DialogTitle>Inspiration Details</DialogTitle>
            <DialogDescription>
              View detailed information about this inspiration.
            </DialogDescription>
          </DialogHeader>
          {selectedInspiration && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center justify-between'>
                  {selectedInspiration.title}
                  <Badge className={
                    selectedInspiration.status === 'approved' ? 'bg-green-100 text-green-800' :
                    selectedInspiration.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }>
                    {selectedInspiration.status}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <span className='font-medium'>Description:</span>
                  <p className='mt-1'>{selectedInspiration.description}</p>
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <span className='font-medium'>Project Type:</span>
                    <p>{selectedInspiration.project_type_code}</p>
                  </div>
                  <div>
                    <span className='font-medium'>Source:</span>
                    <p>{selectedInspiration.source}</p>
                  </div>
                  {selectedInspiration.score && (
                    <div>
                      <span className='font-medium'>Score:</span>
                      <p>{selectedInspiration.score}/5</p>
                    </div>
                  )}
                  <div>
                    <span className='font-medium'>Created:</span>
                    <p>{new Date(selectedInspiration.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                {selectedInspiration.review_notes && (
                  <div>
                    <span className='font-medium'>Review Notes:</span>
                    <p className='mt-1'>{selectedInspiration.review_notes}</p>
                  </div>
                )}
                {selectedInspiration.status === 'pending' && (
                  <div className='flex space-x-2 pt-4'>
                    <Button onClick={handleApprove} className='bg-green-600 hover:bg-green-700'>
                      Approve
                    </Button>
                    <Button onClick={handleReject} variant='destructive'>
                      Reject
                    </Button>
                  </div>
                )}
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
            <AlertDialogTitle>Delete Inspiration</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this inspiration? This action cannot be undone.
              {selectedInspiration && (
                <div className='mt-2 p-2 bg-gray-50 rounded'>
                  <strong>{selectedInspiration.title}</strong>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteInspiration} className='bg-red-600 hover:bg-red-700'>
              Delete Inspiration
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}