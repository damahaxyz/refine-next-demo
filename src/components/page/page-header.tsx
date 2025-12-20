import { redirect } from "next/navigation";

type PageHeaderProps = React.HTMLAttributes<HTMLElement> & {
  title?: string;
  description?: string;
  primaryButtons?: React.ReactNode;
}

export function PageHeader({ title, description, primaryButtons }: PageHeaderProps) {
  return (
    <div className='flex flex-wrap items-end justify-between gap-2'>
      <div>
        <h2 className='text-2xl font-bold tracking-tight'>{title || "Title"}</h2>
        <p className='text-muted-foreground'>
          {description || ""}
        </p>
      </div>
      {primaryButtons}
    </div>
  )


}