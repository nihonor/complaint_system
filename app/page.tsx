import React from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
const Hom = () => {
  return (
    <div>
      <Link href="/api/auth/signin">Login</Link>
    </div>
  )
}

export default Hom
