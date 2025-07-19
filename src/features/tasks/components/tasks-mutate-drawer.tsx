import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { tasksApi, projectsApi } from '@/lib/api'
import { usePlatformAccounts } from '@/features/platform-accounts/context/platform-accounts-context'
import { useTasks } from '../context/tasks-context'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { SelectDropdown } from '@/components/select-dropdown'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Task } from '../data/schema'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Task
}

// Task type configurations based on task_input.md
const TASK_CONFIGS = {
  'DREAMINA_IMAGE_GENERATION': {
    label: '图片生成',
    fields: {
      prompt: { type: 'text', required: true, label: 'Prompt' },
      img: { type: 'text', required: false, label: 'Reference Image URL' },
      modelName: { 
        type: 'select', 
        required: false, 
        label: 'Model', 
        options: ['Image 3.0', 'Image 2.1', 'Image 2.0 Pro', 'Image 1.4'],
        default: 'Image 3.0'
      },
      ratio: { 
        type: 'select', 
        required: false, 
        label: 'Aspect Ratio', 
        options: ['21:9', '16:9', '3:2', '4:3', '1:1', '3:4', '2:3', '9:16'],
        default: '1:1'
      },
      resolution: { 
        type: 'select', 
        required: false, 
        label: 'Resolution', 
        options: ['1k', '2k'],
        default: '1k'
      }
    }
  },
  'DREAMINA_VIDEO_GENERATION': {
    label: '视频生成',
    fields: {
      prompt: { type: 'text', required: true, label: 'Prompt' },
      img: { type: 'text', required: false, label: 'Reference Image URL' },
      modelName: { 
        type: 'select', 
        required: false, 
        label: 'Model', 
        options: ['Video 3.0', 'Video S2.0 Pro'],
        default: 'Video 3.0'
      },
      ratio: { 
        type: 'select', 
        required: false, 
        label: 'Aspect Ratio', 
        options: ['21:9', '16:9', '4:3', '1:1', '3:4', '9:16'],
        default: null
      },
      time: { 
        type: 'select', 
        required: false, 
        label: 'Duration', 
        options: ['5s', '10s'],
        default: '5s'
      }
    }
  },
  'DREAMINA_LIP_SYNC': {
    label: '对口型',
    fields: {
      image_path: { type: 'text', required: true, label: 'Avatar Image URL' },
      audio_paths: { type: 'text', required: true, label: 'Audio File URLs (comma separated)' },
      modelName: { 
        type: 'select', 
        required: false, 
        label: 'Model', 
        options: ['Avatar Pro', 'Avatar Turbo'],
        default: 'Avatar Pro'
      }
    }
  }
} as const

const formSchema = z.object({
  project_id: z.coerce.number().optional(),
  task_type: z.string().min(1, 'Task type is required.'),
  platform_account_id: z.coerce.number().positive('Platform account is required.'),
  task_input: z.record(z.any()),
})
type TasksForm = z.infer<typeof formSchema>

export function TasksMutateDrawer({ open, onOpenChange, currentRow }: Props) {
  const isUpdate = !!currentRow
  const { createTask } = useTasks()
  const { platformAccounts } = usePlatformAccounts()

  const { data: taskTypes = [] } = useQuery({
    queryKey: ['taskTypes'],
    queryFn: async () => {
      const res = await tasksApi.getTaskTypes()
      return res.data.data || []
    },
  })

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await projectsApi.getAll(0, 100)
      return res.data.data || []
    },
  })

  const form = useForm<TasksForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      project_id: undefined,
      task_type: '',
      platform_account_id: 0,
      task_input: {},
    },
  })

  const selectedTaskType = form.watch('task_type')
  const taskConfig = TASK_CONFIGS[selectedTaskType as keyof typeof TASK_CONFIGS]

  // Initialize task_input with default values when task type changes
  const handleTaskTypeChange = (taskType: string) => {
    form.setValue('task_type', taskType)
    const config = TASK_CONFIGS[taskType as keyof typeof TASK_CONFIGS]
    if (config) {
      const defaultTaskInput: Record<string, any> = {}
      Object.entries(config.fields).forEach(([fieldName, fieldConfig]) => {
        if (fieldConfig.default !== undefined && fieldConfig.default !== null) {
          defaultTaskInput[fieldName] = fieldConfig.default
        }
      })
      form.setValue('task_input', defaultTaskInput)
    } else {
      form.setValue('task_input', {})
    }
  }

  const onSubmit = (data: TasksForm) => {
    // Handle special case for audio_paths - convert comma-separated string to array
    if (data.task_input.audio_paths && typeof data.task_input.audio_paths === 'string') {
      data.task_input.audio_paths = data.task_input.audio_paths.split(',').map(path => path.trim()).filter(Boolean)
    }

    const parsedData = {
      ...data,
      status: 'waiting' as const, // Default status for new tasks
    }
    createTask(parsedData)
    onOpenChange(false)
    form.reset()
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        form.reset()
      }}
    >
      <SheetContent className='flex flex-col'>
        <SheetHeader className='text-left'>
          <SheetTitle>{isUpdate ? 'Update' : 'Create'} Task</SheetTitle>
          <SheetDescription>
            {isUpdate
              ? 'Update the task by providing necessary info.'
              : 'Add a new task by providing necessary info.'}
            Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            id='tasks-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-5 px-4'
          >
            <FormField
              control={form.control}
              name='project_id'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Project</FormLabel>
                  <SelectDropdown
                    defaultValue={field.value ? String(field.value) : 'none'}
                    onValueChange={(value) => field.onChange(value === 'none' ? undefined : Number(value))}
                    placeholder={projects.length > 0 ? 'Select a project (optional)' : 'No projects available'}
                    items={[
                      { label: 'No project', value: 'none' },
                      ...projects.map(project => ({ 
                        label: project.name, 
                        value: String(project.id) 
                      }))
                    ]}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='task_type'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Task Type</FormLabel>
                  <SelectDropdown
                    defaultValue={field.value}
                    onValueChange={handleTaskTypeChange}
                    placeholder='Select a task type'
                    items={taskTypes.map(type => ({ label: type, value: type }))}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='platform_account_id'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Platform Account</FormLabel>
                  <SelectDropdown
                    defaultValue={String(field.value)}
                    onValueChange={field.onChange}
                    placeholder='Select an account'
                    items={platformAccounts.map(acc => ({ label: acc.name, value: String(acc.id) }))}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Dynamic Task Input Fields */}
            {taskConfig ? (
              <div className='space-y-4'>
                <FormLabel className='text-base font-medium'>Task Parameters</FormLabel>
                {Object.entries(taskConfig.fields).map(([fieldName, fieldConfig]) => (
                  <FormField
                    key={fieldName}
                    control={form.control}
                    name={`task_input.${fieldName}` as any}
                    render={({ field }) => (
                      <FormItem className='space-y-1'>
                        <FormLabel>
                          {fieldConfig.label}
                          {fieldConfig.required && <span className='text-red-500 ml-1'>*</span>}
                        </FormLabel>
                        <FormControl>
                          {fieldConfig.type === 'select' ? (
                            <SelectDropdown
                              defaultValue={field.value || fieldConfig.default || ''}
                              onValueChange={field.onChange}
                              placeholder={`Select ${fieldConfig.label.toLowerCase()}`}
                              items={fieldConfig.options?.map(option => ({ 
                                label: option, 
                                value: option 
                              })) || []}
                            />
                          ) : fieldConfig.type === 'textarea' ? (
                            <Textarea
                              placeholder={`Enter ${fieldConfig.label.toLowerCase()}`}
                              {...field}
                            />
                          ) : (
                            <Input
                              placeholder={`Enter ${fieldConfig.label.toLowerCase()}`}
                              {...field}
                            />
                          )}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            ) : selectedTaskType && !taskConfig ? (
              // Fallback to JSON textarea for unknown task types
              <FormField
                control={form.control}
                name='task_input'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Input (JSON)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Enter task input as JSON'
                        className='h-48'
                        value={typeof field.value === 'object' ? JSON.stringify(field.value, null, 2) : field.value}
                        onChange={(e) => {
                          try {
                            const parsed = JSON.parse(e.target.value)
                            field.onChange(parsed)
                          } catch {
                            // Keep the string value if it's not valid JSON yet
                            field.onChange(e.target.value)
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}
          </form>
        </Form>
        <SheetFooter className='gap-2'>
          <SheetClose asChild>
            <Button variant='outline'>Close</Button>
          </SheetClose>
          <Button form='tasks-form' type='submit'>
            Save changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
