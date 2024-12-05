'use client'
import React from 'react';
import { Link as ScrollLink } from 'react-scroll';

export default function Navbar() {
    type Link = { name: string, href: string };

    const links: Link[] = [
        { name: 'Home', href: 'home' },
        { name: 'About', href: 'about' },
        { name: 'Announcements', href: 'announcements' },
        { name: 'Team', href: 'team' },
        { name: 'Contact', href: 'contact' },
    ];

    return (
        <div className="hidden md:block fixed w-full top-0 z-50">
            <nav className="bg-gradient-to-r from-gray-900/90 via-gray-800/90 to-gray-900/90 backdrop-blur-sm p-6 shadow-lg">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center">
                        <img src="/sdclogobg.png" alt="Logo" className="h-12 w-12 mr-4" />
                        <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent font-bold text-xl">
                            KTU Software Development Club
                        </span>
                    </div>
                    <div className="flex items-center justify-center flex-row space-x-6">
                        {links.map(({ name, href }, index) => (
                            <ScrollLink
                                key={index}
                                to={href}
                                smooth={true}
                                duration={500}
                                className="relative text-gray-300 hover:text-white cursor-pointer transition-colors duration-300 font-medium group"
                                activeClass="text-blue-400"
                                spy={true}
                                offset={-100}
                            >
                                {name}
                                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out" />
                            </ScrollLink>
                        ))}
                    </div>
                </div>
            </nav>
        </div>
    );
}