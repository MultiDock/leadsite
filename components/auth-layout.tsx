import type { ReactNode } from "react"

interface AuthLayoutProps {
  children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen w-full">
      {/* Left side - Dark panel with logo */}
      <div className="hidden bg-[#212121] lg:flex lg:w-1/2 xl:w-2/5 relative p-8 m-2 rounded-xl">
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Replace with your actual logo */}
          <div className="text-white text-4xl font-bold">
            {/* <Image 
              src="/your-logo.png" 
              alt="Logo" 
              width={200} 
              height={80} 
              className="object-contain"
            /> */}

            {/* Placeholder text logo */}
            <div className="flex items-center">
              <span className="text-[#FF6B00]">EFE</span>
              <span className="text-white">COMPANY</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth forms */}
      <div className="flex flex-1 items-center justify-center p-4 bg-gray-50 lg:w-1/2 xl:w-3/5">{children}</div>
    </div>
  )
}

