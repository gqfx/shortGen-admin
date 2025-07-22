import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { IconBulb, IconSend, IconRefresh, IconEdit, IconCheck, IconEye, IconWand } from '@tabler/icons-react'
import { useState } from 'react'
import InspirationsProvider, { useInspirations } from './context/inspirations-context'
import { InspirationDialogs } from './components/inspiration-dialogs'

const presetPrompts = [
  { title: '创意故事', prompt: '请生成一个有趣的创意故事，包含独特的角色和引人入胜的情节。' },
  { title: '营销文案', prompt: '创作一个吸引人的营销文案，突出产品的核心优势和价值。' },
  { title: '视频脚本', prompt: '编写一个简短的视频脚本，适合社交媒体平台，内容生动有趣。' },
  { title: '产品描述', prompt: '为一个创新产品撰写详细的产品描述，强调功能特点和用户体验。' },
  { title: '博客文章', prompt: '创作一篇引人深思的博客文章，探讨当前热门话题。' },
  { title: '社交媒体', prompt: '生成适合社交媒体的内容，包含话题标签和互动元素。' }
]

function InspirationsContent() {
  const { createInspiration } = useInspirations()
  const [prompt, setPrompt] = useState('')
  const [generatedContent, setGeneratedContent] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState('')

  const handlePresetPrompt = (presetPrompt: string) => {
    setPrompt(presetPrompt)
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    
    setIsGenerating(true)
    try {
      // 模拟AI生成内容
      await new Promise(resolve => setTimeout(resolve, 2000))
      const mockContent = `基于提示词"${prompt}"生成的内容：\n\n这是一个生动有趣的创意内容示例。内容包含了丰富的想象力和创造性元素，能够吸引读者的注意力并传达核心信息。\n\n关键要点：\n1. 独特的视角和见解\n2. 引人入胜的叙述方式\n3. 实用的价值和启发\n\n这个内容可以进一步编辑和完善，以满足具体的需求和目标。`
      setGeneratedContent(mockContent)
    } catch (error) {
      console.error('生成内容失败:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveInspiration = async () => {
    if (!generatedContent.trim() || !title.trim()) {
      alert('请输入标题和生成内容')
      return
    }

    try {
      await createInspiration({
        title: title,
        description: generatedContent,
        project_type_code: 'text_generation',
        source: 'ai_generated',
        parameters: { prompt }
      })
      
      // 重置表单
      setPrompt('')
      setGeneratedContent('')
      setTitle('')
      setIsEditing(false)
    } catch (error) {
      console.error('保存灵感失败:', error)
    }
  }

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-6 flex flex-wrap items-center justify-between space-y-2 gap-x-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight flex items-center gap-2'>
              <IconWand className='h-6 w-6 text-primary' />
              AI 灵感生成器
            </h2>
            <p className='text-muted-foreground'>
              输入提示词，AI 将为您生成创意内容。您可以编辑结果并保存为灵感。
            </p>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* 左侧：提示词输入区域 */}
          <Card className='h-fit'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconBulb className='h-5 w-5' />
                输入提示词
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              {/* 预置提示词按钮 */}
              <div>
                <p className='text-sm text-muted-foreground mb-3'>选择预置提示词或自定义：</p>
                <div className='grid grid-cols-2 gap-2'>
                  {presetPrompts.map((preset, index) => (
                    <Button
                      key={index}
                      variant='outline'
                      size='sm'
                      onClick={() => handlePresetPrompt(preset.prompt)}
                      className='text-left justify-start h-auto py-2 px-3'
                    >
                      {preset.title}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* 提示词输入框 */}
              <div>
                <Textarea
                  placeholder='输入您的提示词，描述您想要生成的内容类型...'
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                  className='resize-none'
                />
              </div>

              {/* 生成按钮 */}
              <Button 
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className='w-full'
              >
                {isGenerating ? (
                  <>
                    <IconRefresh className='mr-2 h-4 w-4 animate-spin' />
                    生成中...
                  </>
                ) : (
                  <>
                    <IconSend className='mr-2 h-4 w-4' />
                    生成内容
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* 右侧：生成内容显示区域 */}
          <Card className='h-fit'>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <CardTitle className='flex items-center gap-2'>
                  <IconEye className='h-5 w-5' />
                  生成结果
                </CardTitle>
                {generatedContent && (
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <IconEdit className='mr-2 h-4 w-4' />
                    {isEditing ? '预览' : '编辑'}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!generatedContent ? (
                <div className='flex items-center justify-center h-32 text-muted-foreground'>
                  请输入提示词并点击生成
                </div>
              ) : (
                <div className='space-y-4'>
                  {/* 标题输入 */}
                  <div>
                    <label className='text-sm font-medium mb-2 block'>标题</label>
                    <Input
                      placeholder='为生成的内容添加标题...'
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  
                  {/* 内容显示/编辑 */}
                  <div>
                    <label className='text-sm font-medium mb-2 block'>内容</label>
                    {isEditing ? (
                      <Textarea
                        value={generatedContent}
                        onChange={(e) => setGeneratedContent(e.target.value)}
                        rows={12}
                        className='resize-none'
                      />
                    ) : (
                      <div className='p-3 bg-muted rounded-md whitespace-pre-wrap text-sm max-h-64 overflow-y-auto'>
                        {generatedContent}
                      </div>
                    )}
                  </div>

                  {/* 操作按钮 */}
                  <div className='flex gap-2'>
                    <Button
                      onClick={handleSaveInspiration}
                      disabled={!title.trim()}
                    >
                      <IconCheck className='mr-2 h-4 w-4' />
                      保存灵感
                    </Button>
                    <Button
                      variant='outline'
                      onClick={() => {
                        setGeneratedContent('')
                        setTitle('')
                        setIsEditing(false)
                      }}
                    >
                      清空
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Main>

      <InspirationDialogs />
    </>
  )
}

export default function Inspirations() {
  return (
    <InspirationsProvider>
      <InspirationsContent />
    </InspirationsProvider>
  )
}