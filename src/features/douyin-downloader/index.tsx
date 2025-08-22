import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Download, Copy } from 'lucide-react';

export default function DouyinDownloaderPage() {
  const [textInput, setTextInput] = useState('');
  const [extractedUrl, setExtractedUrl] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const extractDouyinUrl = (text: string): string | null => {
    // 匹配抖音短链接格式，支持字母、数字、连字符、下划线
    const urlRegex = /https:\/\/v\.douyin\.com\/[A-Za-z0-9\-_]+\/?/g;
    const match = text.match(urlRegex);
    return match ? match[0] : null;
  };

  const handleExtract = async () => {
    if (!textInput.trim()) {
      toast.error('请输入抖音分享内容');
      return;
    }

    const url = extractDouyinUrl(textInput);
    if (!url) {
      toast.error('未找到有效的抖音链接');
      return;
    }

    setExtractedUrl(url);
    setIsLoading(true);

    try {
      const apiUrl = `https://dydl.didnhdj.workers.dev?url=${url}`;
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error('API 请求失败');
      }
      
      // 检查content-type
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('text/plain')) {
        // 如果返回的是纯文本，直接获取文本内容
        const videoUrl = await response.text();
        
        // 保存API响应用于调试
        setApiResponse({ url: videoUrl, contentType });
        
        console.log('API返回链接:', videoUrl);
        
        if (videoUrl && videoUrl.trim()) {
          setDownloadUrl(videoUrl.trim());
          toast.success('获取下载链接成功！');
        } else {
          toast.error('返回的下载链接为空');
        }
      } else {
        // 如果是JSON格式，按原来的方式处理
        const data = await response.json();
        
        // 保存API响应用于调试
        setApiResponse(data);
        
        console.log('API返回数据:', data);
        
        // 尝试多种可能的字段名
        const videoUrl = data.video_url || data.url || data.download_url || data.videoUrl || data.downloadUrl;
        
        if (videoUrl) {
          setDownloadUrl(videoUrl);
          toast.success('获取下载链接成功！');
        } else {
          console.log('未找到视频链接，完整返回数据:', JSON.stringify(data, null, 2));
          toast.error('未能获取到视频下载链接');
        }
      }
    } catch (error) {
      toast.error('获取下载链接失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!downloadUrl) {
      toast.error('没有可用的下载链接');
      return;
    }
    
    // 创建一个隐藏的 a 标签来模拟用户点击
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.target = '_blank';
    a.rel = 'noopener noreferrer'; // 安全性考虑
    a.style.display = 'none';
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast.success('已尝试打开视频链接');
  };

  const handleCopyLink = async () => {
    if (!downloadUrl) {
      toast.error('没有可用的下载链接');
      return;
    }
    
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(downloadUrl);
      } else {
        // 备用方案：选择文本
        const textArea = document.createElement('textarea');
        textArea.value = downloadUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      toast.success('链接已复制！请手动粘贴到新窗口打开');
    } catch (error) {
      toast.error('复制失败，请手动选择链接复制');
    }
  };

  const handleReset = () => {
    setTextInput('');
    setExtractedUrl('');
    setDownloadUrl('');
    setApiResponse(null);
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">抖音视频下载器</h1>
        {(extractedUrl || downloadUrl) && (
          <Button onClick={handleReset} variant="outline">
            重新开始
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>粘贴抖音分享内容</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Textarea
              placeholder="在这里粘贴抖音分享的文字内容，例如：&#10;6.43 复制打开抖音，看看【张家界蹦极忠哥的作品】太丢人啦，第一次蹦极我就被吓哭了 # 蹦极 # 张... https://v.douyin.com/4uy-OFV3pDg/ W@M.WM icA:/ 08/24"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              rows={6}
              className="min-h-32"
            />
          </div>
          
          <Button 
            onClick={handleExtract} 
            disabled={isLoading || !textInput.trim()}
            className="w-full"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            提取并获取下载链接
          </Button>
        </CardContent>
      </Card>

      {extractedUrl && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>提取的链接</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-3 bg-muted rounded-md">
              <code className="text-sm">{extractedUrl}</code>
            </div>
          </CardContent>
        </Card>
      )}

      {downloadUrl && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>视频下载链接</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-3">
                获取到的视频下载链接：
              </p>
              <div className="p-3 bg-muted rounded-md mb-4">
                <code className="text-sm break-all">{downloadUrl}</code>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleDownload}
                  variant="default"
                  className="flex-1"
                >
                  <Download className="mr-2 h-4 w-4" />
                  尝试打开视频
                </Button>
                <Button 
                  onClick={handleCopyLink}
                  variant="outline"
                  className="flex-1"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  复制链接
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                💡 提示：如果直接打开失败，请使用"复制链接"手动粘贴到新窗口打开
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}