import { createContext, useContext, ReactNode, useState } from 'react'
import { Project } from '@/lib/api'

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
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const refreshProjects = () => {
    // This will be implemented with actual API call
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
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
      }}
    >
      {children}
    </ProjectsContext.Provider>
  )
}