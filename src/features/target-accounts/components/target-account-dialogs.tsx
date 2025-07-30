import { useEffect } from 'react'
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
import { TargetAccount, TargetAccountUpdate, QuickAddAccountRequest } from '@/lib/api'
import { useTargetAccounts } from '../context/target-accounts-context'

const createTargetAccountSchema = z.object({
  channel_url: z.string().url('Please enter a valid channel URL'),
  is_scheduled: z.boolean().optional(),
  schedule_interval: z.coerce.number().positive().int().optional(),
  cron_string: z.string().optional(),
})

const updateTargetAccountSchema = z.object({
  display_name: z.string().min(1, 'Display name is required').optional(),
  description: z.string().optional(),
  avatar_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  category: z.string().min(1, 'Category is required').optional(),
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
      is_scheduled: false,
      schedule_interval: undefined,
      cron_string: '',
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
        category: editingTargetAccount.category || '',
        is_active: editingTargetAccount.is_active,
      })
    }
  }, [editingTargetAccount, updateForm])

  const handleCreateSubmit = async (data: CreateFormData) => {
    const payload: QuickAddAccountRequest = {
      channel_url: data.channel_url,
      is_scheduled: data.is_scheduled,
      schedule_interval: data.schedule_interval,
      cron_string: data.cron_string,
    }

    const result = await createTargetAccount(payload)
    if (result) {
      setCreateOpen(false)
      createForm.reset()
    }
  }

  const handleUpdateSubmit = async (data: UpdateFormData) => {
    if (!editingTargetAccount) return

    const payload: TargetAccountUpdate = {
      display_name: data.display_name,
      description: data.description,
      avatar_url: data.avatar_url || undefined,
      category: data.category,
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
            <DialogTitle>Quick Add Target Account</DialogTitle>
            <DialogDescription>
              Add a channel for monitoring by providing the channel URL. The system will automatically detect the platform, extract channel information, and trigger initial crawl tasks.
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


              <FormField
                control={createForm.control}
                name="is_scheduled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enable Scheduled Crawling</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Enable or disable scheduled crawling for this account.
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

              {createForm.watch('is_scheduled') && (
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="schedule_interval"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Schedule Interval (s)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 60" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="cron_string"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CRON String</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 0 0 * * *" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}


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