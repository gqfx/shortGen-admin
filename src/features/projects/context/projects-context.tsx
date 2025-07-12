import { createContext, useContext, ReactNode, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Project, projectsApi, CreateProjectRequest, UpdateProjectRequest } from '@/lib/api'

interface ProjectsContextType {
  projects: Project[]
  isLoading: boolean
  selectedProject: Project | null
  isCreateDialogOpen: boolean
  isEditDialogOpen: boolean
  isDeleteDialogOpen: boolean
  setIsCreateDialogOpen: (open: boolean) => void
  setIsEditDialogOpen: (open: boolean) => void
  setIsDeleteDialogOpen: (open: boolean) => void
  setSelectedProject: (project: Project | null) => void
  refreshProjects: () => void
  createProject: (data: CreateProjectRequest) => Promise<void>
  updateProject: (id: number, data: UpdateProjectRequest) => Promise<void>
  deleteProject: (id: number) => Promise<void>
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined)

export const useProjects = () => {
  const context = useContext(ProjectsContext)
  if (!context) {
    throw new Error('useProjects must be used within a ProjectsProvider')
  }
  return context
}

interface ProjectsProviderProps {
  children: ReactNode
}

export default function ProjectsProvider({ children }: ProjectsProviderProps) {
  const queryClient = useQueryClient()
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Fetch projects
  const { data: apiResponse, isLoading, refetch } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      console.log('🔄 Fetching projects from API...')
      try {
        const response = await projectsApi.getAll(0, 100)
        console.log('✅ Projects API Response:', response.data)
        return response
      } catch (err) {
        console.error('❌ Projects API Error:', err)
        throw err
      }
    },
  })

  const projects = apiResponse?.data?.data || []
  console.log('📊 Processed projects:', projects)

  // Create project mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateProjectRequest) => projectsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project created successfully')
      setIsCreateDialogOpen(false)
    },
    onError: (error: any) => {
      toast.error('Failed to create project: ' + (error.response?.data?.msg || error.message))
    },
  })

  // Update project mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProjectRequest }) => 
      projectsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project updated successfully')
      setIsEditDialogOpen(false)
    },
    onError: (error: any) => {
      toast.error('Failed to update project: ' + (error.response?.data?.msg || error.message))
    },
  })

  // Delete project mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => projectsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project deleted successfully')
      setIsDeleteDialogOpen(false)
      setSelectedProject(null)
    },
    onError: (error: any) => {
      toast.error('Failed to delete project: ' + (error.response?.data?.msg || error.message))
    },
  })

  const refreshProjects = () => {
    refetch()
  }

  const createProject = async (data: CreateProjectRequest) => {
    await createMutation.mutateAsync(data)
  }

  const updateProject = async (id: number, data: UpdateProjectRequest) => {
    await updateMutation.mutateAsync({ id, data })
  }

  const deleteProject = async (id: number) => {
    await deleteMutation.mutateAsync(id)
  }

  return (
    <ProjectsContext.Provider
      value={{
        projects,
        isLoading,
        selectedProject,
        isCreateDialogOpen,
        isEditDialogOpen,
        isDeleteDialogOpen,
        setIsCreateDialogOpen,
        setIsEditDialogOpen,
        setIsDeleteDialogOpen,
        setSelectedProject,
        refreshProjects,
        createProject,
        updateProject,
        deleteProject,
      }}
    >
      {children}
    </ProjectsContext.Provider>
  )
}