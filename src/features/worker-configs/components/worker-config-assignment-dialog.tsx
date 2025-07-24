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
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'

const assignConfigsSchema = z.object({
  task_id: z.string().min(1, 'Task ID is required'),
  config_ids: z.array(z.string()).min(1, 'At least one config must be selected'),
})

type AssignConfigsFormData = z.infer<typeof assignConfigsSchema>

export function WorkerConfigAssignmentDialog({
  isAssignDialogOpen,
  setIsAssignDialogOpen,
}: {
  isAssignDialogOpen: boolean
  setIsAssignDialogOpen: (open: boolean) => void
}) {
  const { workerConfigs, assignToTask } = useWorkerConfigs()

  const form = useForm<AssignConfigsFormData>({
    resolver: zodResolver(assignConfigsSchema),
    defaultValues: {
      task_id: '',
      config_ids: [],
    },
  })

  const handleAssignConfigs = async (data: AssignConfigsFormData) => {
    try {
      await assignToTask(data.task_id, { config_ids: data.config_ids })
      form.reset()
      setIsAssignDialogOpen(false)
    } catch (_error) {
      // Error is already handled by the context's toast messages
    }
  }

  return (
    <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Configurations to Task</DialogTitle>
          <DialogDescription>
            Select configurations to assign to a specific task.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleAssignConfigs)} className="space-y-4">
            <FormField
              control={form.control}
              name="task_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter task ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="config_ids"
              render={() => (
                <FormItem>
                  <FormLabel>Available Configurations</FormLabel>
                  <ScrollArea className="h-40 rounded-md border p-4">
                    {workerConfigs.map((config) => (
                      <FormField
                        key={config.id}
                        control={form.control}
                        name="config_ids"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={config.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(config.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, config.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== config.id
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {config.config_name}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </ScrollArea>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Assign Configurations</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}