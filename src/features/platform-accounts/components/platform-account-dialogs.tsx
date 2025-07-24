import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { usePlatformAccounts } from '../context/platform-accounts-context'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Form schemas
const credentialsSchema = z.object({
  email: z.string().email('Invalid email format').optional(),
  password: z.string().optional(),
  proxy: z.string().optional(),
  // Allow any other string keys
}).catchall(z.any())

const createAccountSchema = z.object({
  platform: z.string().min(1, 'Platform is required'),
  name: z.string().min(1, 'Name is required'),
  daily_limit: z.coerce.number().int().positive('Daily limit must be a positive number').optional(),
  credentials: credentialsSchema,
})

const updateAccountSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  daily_limit: z.coerce.number().int().positive('Daily limit must be a positive number').optional(),
  status: z.string().optional(),
  credentials: credentialsSchema.optional(),
})

type CreateAccountFormData = z.infer<typeof createAccountSchema>
type UpdateAccountFormData = z.infer<typeof updateAccountSchema>

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'suspended', label: 'Suspended' },
]

export function PlatformAccountDialogs() {
  const {
    selectedAccount,
    platforms,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isDetailDialogOpen,
    setIsDetailDialogOpen,
    createAccount,
    updateAccount,
    deleteAccount,
    resetUsage,
  } = usePlatformAccounts()

  const createForm = useForm<CreateAccountFormData>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      platform: '',
      name: '',
      daily_limit: 20,
      credentials: {
        email: '',
        password: '',
        proxy: '',
      },
    },
  })

  const editForm = useForm<UpdateAccountFormData>({
    resolver: zodResolver(updateAccountSchema),
  })

  // Reset and populate edit form when selectedAccount changes
  React.useEffect(() => {
    if (selectedAccount && isEditDialogOpen) {
      editForm.reset({
        name: selectedAccount.name,
        daily_limit: selectedAccount.daily_limit,
        status: selectedAccount.status,
        credentials: {
          email: selectedAccount.credentials?.email || '',
          password: selectedAccount.credentials?.password || '',
          proxy: selectedAccount.credentials?.proxy || '',
        },
      })
    }
  }, [selectedAccount, isEditDialogOpen, editForm])

  const handleCreateAccount = async (data: CreateAccountFormData) => {
    try {
      await createAccount(data)
      createForm.reset()
    } catch (error) {
      console.error('Failed to create account:', error)
    }
  }

  const handleUpdateAccount = async (data: UpdateAccountFormData) => {
    if (!selectedAccount) return
    
    try {
      await updateAccount(selectedAccount.id, data)
    } catch (error) {
      console.error('Failed to update account:', error)
    }
  }

  const handleDeleteAccount = async () => {
    if (!selectedAccount) return
    
    try {
      await deleteAccount(selectedAccount.id)
    } catch (error) {
      console.error('Failed to delete account:', error)
    }
  }

  return (
    <>
      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>Create Platform Account</DialogTitle>
            <DialogDescription>
              Add a new platform account for content generation.
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(handleCreateAccount)} className='space-y-4'>
              <FormField
                control={createForm.control}
                name='platform'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Platform</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select platform' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {platforms.map((platform) => (
                          <SelectItem key={platform} value={platform}>
                            {platform}
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
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Name</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter account name' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name='daily_limit'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Daily Limit (Optional)</FormLabel>
                    <FormControl>
                      <Input type='number' placeholder='20' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name='credentials.email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter email address' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name='credentials.password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type='password' placeholder='Enter password' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name='credentials.proxy'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proxy (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder='http://192.168.1.1:8080' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className='flex justify-end space-x-2'>
                <Button type='button' variant='outline' onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type='submit'>Create Account</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>Edit Platform Account</DialogTitle>
            <DialogDescription>
              Update the platform account information.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleUpdateAccount)} className='space-y-4'>
              <FormField
                control={editForm.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Name</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter account name' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name='status'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select status' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
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
                name='daily_limit'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Daily Limit</FormLabel>
                    <FormControl>
                      <Input type='number' placeholder='20' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name='credentials.email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter email address' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name='credentials.password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type='password' placeholder='Enter password' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name='credentials.proxy'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proxy (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder='http://192.168.1.1:8080' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className='flex justify-end space-x-2'>
                <Button type='button' variant='outline' onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type='submit'>Update Account</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className='sm:max-w-[500px]'>
          <DialogHeader>
            <DialogTitle>Platform Account Details</DialogTitle>
            <DialogDescription>
              View detailed information about this platform account.
            </DialogDescription>
          </DialogHeader>
          {selectedAccount && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center justify-between'>
                  {selectedAccount.name}
                  <Badge className={selectedAccount.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {selectedAccount.status}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <span className='font-medium'>Platform:</span>
                    <p className='capitalize'>{selectedAccount.platform}</p>
                  </div>
                  <div>
                    <span className='font-medium'>Daily Limit:</span>
                    <p>{selectedAccount.daily_limit || 'N/A'}</p>
                  </div>
                  <div>
                    <span className='font-medium'>Used Today:</span>
                    <p>{selectedAccount.used_today}</p>
                  </div>
                  <div>
                    <span className='font-medium'>Remaining:</span>
                    <p>{selectedAccount.remaining_quota ?? 'N/A'}</p>
                  </div>
                  <div>
                    <span className='font-medium'>Available:</span>
                    <p className={selectedAccount.is_available ? 'text-green-600' : 'text-red-600'}>
                      {selectedAccount.is_available ? 'Yes' : 'No'}
                    </p>
                  </div>
                  <div>
                    <span className='font-medium'>Created:</span>
                    <p>{new Date(selectedAccount.created_at).toLocaleString()}</p>
                  </div>
                   <div>
                    <span className='font-medium'>Last Used:</span>
                    <p>{selectedAccount.last_used_at ? new Date(selectedAccount.last_used_at).toLocaleString() : 'Never'}</p>
                  </div>
                </div>
                {selectedAccount.credentials && Object.keys(selectedAccount.credentials).length > 0 && (
                  <div className='mt-4'>
                    <h4 className='font-medium mb-2'>Credentials</h4>
                    <div className='space-y-2 bg-gray-50 p-3 rounded-md'>
                      {Object.entries(selectedAccount.credentials).map(([key, value]) => (
                        <div key={key}>
                          <span className='font-medium capitalize'>{key}:</span>
                          <p className='font-mono text-sm break-all'>
                            {key === 'password' ? '*'.repeat(String(value).length || 8) : String(value)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          <div className='flex justify-between'>
             <Button
              variant='destructive'
              onClick={() => selectedAccount && resetUsage(selectedAccount.id, { used_today: 0 })}
              disabled={!selectedAccount || selectedAccount.used_today === 0}
            >
              Reset Usage
            </Button>
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
            <AlertDialogTitle>Delete Platform Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this platform account? This action cannot be undone.
              {selectedAccount && (
                <div className='mt-2 p-2 bg-gray-50 rounded'>
                  <strong>{selectedAccount.name}</strong> ({selectedAccount.platform})
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount} className='bg-red-600 hover:bg-red-700'>
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}