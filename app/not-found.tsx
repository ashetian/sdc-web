import Link from 'next/link';

export default function NotFound() {
    return (
      <div className="fixed z-40">
        <div className='bg-gray-800 flex flex-col items-center justify-center h-screen w-screen'>
          <h1 className='text-4xl hover:cursor-default text-center handjet font-bold mb-10 md:text-6xl transition-all duration-500 ease-in-out'>
            404 - Not Found
          </h1>
          <h1 className='pathway_gothic_one text-2xl hover:cursor-default text-center font-bold md:text-4xl transition-all duration-500 ease-in-out'>
            İt looks like you are lost.
          </h1>
          <Link href="/" className="text-xl text-white  font-bold mt-28 underline underline-offset-4 decoration-2 decoration-slice-2 hover:cursor-pointer">
            I can fix that.
          </Link>
        </div>
      </div>
    )
  }