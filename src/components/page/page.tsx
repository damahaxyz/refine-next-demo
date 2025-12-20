import { ProfileDropdown } from "../layout/profile-dropdown";
import { Header } from "../layout/header";
import { Main } from "../layout/main";
import { ThemeSelect } from "@/components/theme/theme-select";

type PageProps = React.HTMLAttributes<HTMLElement> & {
  children?: React.ReactNode,
  menus?: React.ReactNode,
  contentStyle?: React.CSSProperties,
}

export function Page({ children, menus, contentStyle }: PageProps) {
  return (
    <>

      <Header fixed>
        {menus}
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSelect />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6' style={contentStyle} fluid={true}>
        {children}
      </Main>

    </>
  )
}