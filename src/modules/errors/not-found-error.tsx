import { Button } from '@/components/ui/button'
import { useGo } from '@refinedev/core'

export function NotFoundError() {

  const go = useGo();
  return (
    <div className='h-svh'>
      <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
        <h1 className='text-[7rem] leading-tight font-bold text-muted-foreground opacity-30'>404</h1>
        <span className='font-medium'>Page Not Fount</span>
        <p className='text-muted-foreground text-center'>
          您要访问的页面不存在，请检查URL地址
        </p>
        <div className='mt-6 flex gap-4'>
          <Button variant='outline' onClick={() => history.go(-1)}>
            返回
          </Button>
          <Button onClick={() => go({ to: '/' })}>首页</Button>
        </div>
      </div>
    </div>
  )
}
