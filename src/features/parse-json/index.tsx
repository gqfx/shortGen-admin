import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ParsedJson {
  title: string;
  img_promt: string;
  video_prompt: string;
}

export default function ParseJsonPage() {
  const [jsonInput, setJsonInput] = useState('');
  const [parsedData, setParsedData] = useState<ParsedJson[] | null>(null);
  const [isParsed, setIsParsed] = useState(false);
  const [copiedStatus, setCopiedStatus] = useState<{ itemIndex: number; field: string } | null>(null);

  const handleParse = () => {
    if (!jsonInput.trim()) {
      toast.error('请输入 JSON 内容');
      return;
    }
    try {
      const data = JSON.parse(jsonInput);
      setParsedData(data);
      setIsParsed(true);
      toast.success('解析成功');
    } catch (_error) {
      toast.error('JSON 解析失败，请检查格式');
      setParsedData(null);
    }
  };

  const handleCopy = async (text: string, itemIndex: number, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStatus({ itemIndex, field });
      setTimeout(() => setCopiedStatus(null), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
      toast.error('复制失败，请重试');
    }
  };

  const handleReset = () => {
    setJsonInput('');
    setParsedData(null);
    setIsParsed(false);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">JSON 解析器</h1>
        {isParsed && (
          <Button onClick={handleReset} variant="outline">
            重新解析
          </Button>
        )}
      </div>
      {!isParsed && (
        <div className="grid gap-4">
          <Textarea
            placeholder="在这里粘贴你的 JSON..."
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            rows={10}
          />
          <Button onClick={handleParse}>解析 JSON</Button>
        </div>
      )}

      {parsedData && (
        <div className="mt-6 grid gap-4">
          {parsedData.map((item, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>第 {index + 1} 项</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold">Title</h3>
                  <div className="flex items-start gap-2 mt-1">
                    <Textarea value={item.title} readOnly className="flex-grow" rows={2} />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(item.title, index, 'title')}
                    >
                      {copiedStatus?.itemIndex === index && copiedStatus?.field === 'title'
                        ? '已复制!'
                        : '复制'}
                    </Button>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold">Image Prompt</h3>
                  <div className="flex items-start gap-2 mt-1">
                    <Textarea value={item.img_promt} readOnly className="flex-grow" rows={4} />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(item.img_promt, index, 'img_promt')}
                    >
                      {copiedStatus?.itemIndex === index && copiedStatus?.field === 'img_promt'
                        ? '已复制!'
                        : '复制'}
                    </Button>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold">Video Prompt</h3>
                  <div className="flex items-start gap-2 mt-1">
                    <Textarea value={item.video_prompt} readOnly className="flex-grow" rows={4} />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(item.video_prompt, index, 'video_prompt')}
                    >
                      {copiedStatus?.itemIndex === index && copiedStatus?.field === 'video_prompt'
                        ? '已复制!'
                        : '复制'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}