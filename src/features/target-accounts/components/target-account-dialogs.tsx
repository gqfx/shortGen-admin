import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TargetAccount, CreateTargetAccountRequest, UpdateTargetAccountRequest } from '@/lib/api'
import { useTargetAccounts } from '../context/target-accounts-context'

const createTargetAccountSchema = z.object({
  channel_url: z.string().url('Please enter a valid channel URL'),
  category: z.string().optional(),
  monitor_frequency: z.enum(['hourly', 'daily', 'weekly'], {
    required_error: 'Please select a monitor frequency',
  }),
  video_limit: z.number().min(1, 'Video limit must be at least 1').max(1000, 'Video limit cannot exceed 1000'),
  crawl_videos: z.boolean().optional(),
  crawl_metrics: z.boolean().optional(),
})

const updateTargetAccountSchema = z.object({
  display_name: z.string().min(1, 'Display name is required').optional(),
  description: z.string().optional(),
  avatar_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  category: z.string().min(1, 'Category is required').optional(),
  monitor_frequency: z.enum(['hourly', 'daily', 'weekly']).optional(),
  is_active: z.boolean().optional(),
})

type CreateFormData = z.infer<typeof createTargetAccountSchema>
type UpdateFormData = z.infer<typeof updateTargetAccountSchema>

interface TargetAccountDialogsProps {
  createOpen: boolean
  setCreateOpen: (open: boolean) => void
  editOpen: boolean
  setEditOpen: (open: boolean) => void
  editingTargetAccount: TargetAccount | null
}

const categories = [
  'technology',
  'entertainment',
  'education',
  'gaming',
  'music',
  'sports',
  'news',
  'lifestyle',
  'business',
  'science',
  'other'
]

export function TargetAccountDialogs({
  createOpen,
  setCreateOpen,
  editOpen,
  setEditOpen,
  editingTargetAccount,
}: TargetAccountDialogsProps) {
  const { createTargetAccount, updateTargetAccount } = useTargetAccounts()

  // Create form
  const createForm = useForm<CreateFormData>({
    resolver: zodResolver(createTargetAccountSchema),
    defaultValues: {
      channel_url: '',
      category: 'none',
      monitor_frequency: 'daily',
      video_limit: 50,
      crawl_videos: true,
      crawl_metrics: true,
    },
  })

  // Update form
  const updateForm = useForm<UpdateFormData>({
    resolver: zodResolver(updateTargetAccountSchema),
    defaultValues: {
      display_name: '',
      description: '',
      avatar_url: '',
      category: '',
      monitor_frequency: 'daily',
      is_active: true,
    },
  })

  // Populate update form when editing account changes
  useEffect(() => {
    if (editingTargetAccount) {
      updateForm.reset({
        display_name: editingTargetAccount.display_name,
        description: editingTargetAccount.description || '',
        avatar_url: editingTargetAccount.avatar_url || '',
        category: editingTargetAccount.category,
        monitor_frequency: editingTargetAccount.monitor_frequency,
        is_active: editingTargetAccount.is_active,
      })
    }
  }, [editingTargetAccount, updateForm])

  const handleCreateSubmit = async (data: CreateFormData) => {
    const payload: CreateTargetAccountRequest = {
      channel_url: data.channel_url,
      category: data.category && data.category !== 'none' ? data.category : undefined,
      monitor_frequency: data.monitor_frequency,
      video_limit: data.video_limit,
      crawl_videos: data.crawl_videos,
      crawl_metrics: data.crawl_metrics,
    }

    const result = await createTargetAccount(payload)
    if (result) {
      setCreateOpen(false)
      createForm.reset()
    }
  }

  const handleUpdateSubmit = async (data: UpdateFormData) => {
    if (!editingTargetAccount) return

    const payload: UpdateTargetAccountRequest = {
      display_name: data.display_name,
      description: data.description,
      avatar_url: data.avatar_url || undefined,
      category: data.category,
      monitor_frequency: data.monitor_frequency,
      is_active: data.is_active,
    }

    const result = await updateTargetAccount(editingTargetAccount.id, payload)
    if (result) {
      setEditOpen(false)
      updateForm.reset()
    }
  }

  const handleCreateOpenChange = (open: boolean) => {
    setCreateOpen(open)
    if (!open) {
      createForm.reset()
    }
  }

  const handleEditOpenChange = (open: boolean) => {
    setEditOpen(open)
    if (!open) {
      updateForm.reset()
    }
  }

  return (
    <>
      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={handleCreateOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Target Account</DialogTitle>
            <DialogDescription>
              Add a channel for monitoring by providing the channel URL. The system will automatically detect the platform and extract channel information.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(handleCreateSubmit)} className="space-y-4">
              <FormField
                control={createForm.control}
                name="channel_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Channel URL</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://www.youtube.com/channel/UCxxxxxxxxxxxxxx" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">No category</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category.charAt(0).toUpperCase() + category.slice(1)}
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
                  name="monitor_frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monitor Frequency</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={createForm.control}
                name="video_limit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Video Limit</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        min={1}
                        max={1000}
                        placeholder="50" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <div className="text-sm text-muted-foreground">
                      Maximum number of videos to crawl (1-1000)
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="crawl_videos"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Crawl Videos</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Download video metadata and information
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

                <FormField
                  control={createForm.control}
                  name="crawl_metrics"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Crawl Metrics</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Collect engagement metrics and statistics
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
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => handleCreateOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Target Account</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={handleEditOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Target Account</DialogTitle>
            <DialogDescription>
              Update the target account configuration.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...updateForm}>
            <form onSubmit={updateForm.handleSubmit(handleUpdateSubmit)} className="space-y-4">
              <FormField
                control={updateForm.control}
                name="display_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Channel Display Name" {...field} />
                    </FormControl>
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
                        placeholder="Brief description of the account"
                        className="resize-none" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={updateForm.control}
                name="avatar_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avatar URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/avatar.jpg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
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
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={updateForm.control}
                  name="monitor_frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monitor Frequency</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={updateForm.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Monitoring</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Enable or disable monitoring for this account
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

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => handleEditOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit">Update Target Account</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}