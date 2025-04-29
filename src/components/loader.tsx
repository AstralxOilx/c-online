import { LoaderCircle } from 'lucide-react'
import React from 'react'

function Loader() {
    return (
        <div className="flex flex-col h-screen items-center justify-center">
            <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
        </div>
    )
}

export default Loader