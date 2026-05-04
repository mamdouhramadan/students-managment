import React from 'react'
import  './footer.css'

const Footer = () => {
    return (
        <footer className='footer py-2'>
            <div className='text-center'>
                <div className='text-white copyright'>{`Copyright © ${new Date().getFullYear()}  All rights reserved.`}</div>
            </div>
        </footer>
    )
}

export default Footer