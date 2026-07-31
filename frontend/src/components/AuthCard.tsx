import type {ReactNode,JSX} from 'react'

interface AuthCardProps{
    title:string,
    subtitle:string,
    footer:ReactNode,
    children:ReactNode
}

const AuthCard = ({title,subtitle,footer,children}:AuthCardProps):JSX.Element => {
    return(
        <div className="w-full max-w-sm bg-[#FAF6EC] rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-semibold text-[#1D2939] mb-1">{title}</h2>
        <p className="text-sm text-gray-500 mb-6">{subtitle}</p>
        {children}
        <div className="text-sm text-gray-500 text-center mt-6">{footer}</div>
        </div>
    )
}

export default AuthCard;