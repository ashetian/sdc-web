'use client'
import React from 'react';
import { Link as ScrollLink } from 'react-scroll';

export default function Navbar() {

    type Link = { name: string, href: string };

    const links: Link[] = [
        { name: 'Home', href: 'home' },
        { name: 'About', href: 'about' },
        { name: 'Team', href: 'team' },
        { name: 'Announcements', href: 'announcements' },
        { name: 'Contact', href: 'contact' },
    ];

    return (
        <div>
            <nav className="flex items-center justify-between bg-background p-6">
                <div className="flex items-center">
                    <img src="/sdclogobg.png" alt="Logo" className="h-12 w-12 mr-4" />
                    <span className="text-white font-bold text-xl">KTU Software Development Club</span>
                </div>
                <div className="flex items-center justify-center flex-row space-x-4">
                    {links.map(({ name, href }, index) => (
                        <ScrollLink
                            key={index}
                            to={href}
                            smooth={true}
                            duration={500}
                            className='text-white hover:text-purple-500 font-bold py-2 px-4 rounded-md ease-in-out duration-300 cursor-pointer'
                        >
                            {name}
                        </ScrollLink>
                    ))}
                </div>
            </nav>
        </div>
    )
}